// Package httpapi adapts the solver domain to HTTP and JSON.
package httpapi

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"mime"
	"net/http"
	"unicode/utf8"

	"github.com/arceoavs/papsolver/solver/api"
	"github.com/arceoavs/papsolver/solver/internal/domain"
	"github.com/arceoavs/papsolver/solver/internal/solver"
)

const (
	Version        = "3.1.0"
	maxRequestBody = 1 << 20
)

type tierRequest struct {
	ID         string         `json:"id"`
	Label      optionalString `json:"label"`
	PriceCents int64          `json:"priceCents"`
}

// optionalString distinguishes an omitted value from an explicit JSON null.
// Labels are optional, but when supplied their JSON type must be a string.
type optionalString struct {
	value string
	set   bool
}

func (value *optionalString) UnmarshalJSON(data []byte) error {
	if bytes.Equal(data, []byte("null")) {
		return errors.New("label must be a string when provided")
	}
	if !utf8.Valid(data) {
		return errors.New("label must contain valid UTF-8")
	}
	if err := json.Unmarshal(data, &value.value); err != nil {
		return err
	}
	value.set = true
	return nil
}

type solveRequest struct {
	TargetCents int64         `json:"targetCents"`
	Tiers       []tierRequest `json:"tiers"`
}

type assignmentResponse struct {
	TierID     string  `json:"tierId"`
	Label      *string `json:"label,omitempty"`
	PriceCents int64   `json:"priceCents"`
	Quantity   int     `json:"quantity"`
}

type solveResponse struct {
	TargetCents   int64                `json:"targetCents"`
	PurchaseCount int                  `json:"purchaseCount"`
	Assignments   []assignmentResponse `json:"assignments"`
}

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type errorResponse struct {
	Error errorDetail `json:"error"`
}

type handler struct {
	slots chan struct{}
}

// New constructs the complete API handler. Concurrent solver work is bounded
// because each request is CPU and allocation intensive at the maximum limits.
func New(maxConcurrent int) http.Handler {
	if maxConcurrent < 1 {
		panic("maxConcurrent must be positive")
	}
	h := &handler{slots: make(chan struct{}, maxConcurrent)}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /{$}", h.serviceInfo)
	mux.HandleFunc("GET /health", h.health)
	mux.HandleFunc("GET /openapi.yaml", h.openAPI)
	mux.HandleFunc("POST /solve", h.solve)
	return securityHeaders(mux)
}

func (h *handler) serviceInfo(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"title":       "CentMatch",
		"version":     Version,
		"description": "Match a balance exactly using the fewest purchases.",
	})
}

func (h *handler) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *handler) openAPI(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(api.OpenAPISpec)
}

func (h *handler) solve(w http.ResponseWriter, r *http.Request) {
	if !isJSON(r.Header.Get("Content-Type")) {
		writeError(w, http.StatusUnsupportedMediaType, "unsupported_media_type", "Content-Type must be application/json")
		return
	}

	request, err := decodeSolveRequest(w, r)
	if err != nil {
		var tooLarge *http.MaxBytesError
		if errors.As(err, &tooLarge) {
			writeError(w, http.StatusRequestEntityTooLarge, "request_too_large", "request body must not exceed 1 MiB")
			return
		}
		writeError(w, http.StatusUnprocessableEntity, "invalid_request", err.Error())
		return
	}

	specs := make([]domain.TierSpec, len(request.Tiers))
	for index, tier := range request.Tiers {
		var label *string
		if tier.Label.set {
			label = &tier.Label.value
		}
		specs[index] = domain.TierSpec{ID: tier.ID, Label: label, PriceCents: tier.PriceCents}
	}
	problem, err := domain.NewProblem(request.TargetCents, specs)
	if err != nil {
		writeError(w, http.StatusUnprocessableEntity, "invalid_problem", err.Error())
		return
	}

	select {
	case h.slots <- struct{}{}:
		defer func() { <-h.slots }()
	case <-r.Context().Done():
		return
	}

	result, err := solver.Solve(r.Context(), problem)
	if errors.Is(err, solver.ErrNoExactSolution) {
		writeError(w, http.StatusConflict, "no_exact_solution", "No combination of the supplied tiers adds up to the target exactly.")
		return
	}
	if err != nil {
		if r.Context().Err() != nil {
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "The solver could not complete the request.")
		return
	}

	assignments := make([]assignmentResponse, len(result.Assignments))
	for index, assignment := range result.Assignments {
		assignments[index] = assignmentResponse{
			TierID:     assignment.TierID,
			Label:      assignment.Label,
			PriceCents: assignment.PriceCents,
			Quantity:   assignment.Quantity,
		}
	}
	writeJSON(w, http.StatusOK, solveResponse{
		TargetCents:   result.TargetCents,
		PurchaseCount: result.PurchaseCount,
		Assignments:   assignments,
	})
}

func decodeSolveRequest(w http.ResponseWriter, r *http.Request) (solveRequest, error) {
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBody)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	var request *solveRequest
	if err := decoder.Decode(&request); err != nil {
		return solveRequest{}, err
	}
	if request == nil {
		return solveRequest{}, errors.New("request body must be a JSON object")
	}
	var extra any
	if err := decoder.Decode(&extra); !errors.Is(err, io.EOF) {
		if err == nil {
			return solveRequest{}, errors.New("request body must contain exactly one JSON value")
		}
		return solveRequest{}, err
	}
	return *request, nil
}

func isJSON(contentType string) bool {
	mediaType, _, err := mime.ParseMediaType(contentType)
	return err == nil && mediaType == "application/json"
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, errorResponse{Error: errorDetail{Code: code, Message: message}})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		next.ServeHTTP(w, r)
	})
}
