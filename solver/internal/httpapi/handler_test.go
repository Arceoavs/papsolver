package httpapi_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/arceoavs/papsolver/solver/internal/httpapi"
)

func request(t *testing.T, handler http.Handler, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	value := httptest.NewRequest(method, path, strings.NewReader(body))
	if body != "" {
		value.Header.Set("Content-Type", "application/json")
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, value)
	return response
}

func TestMetadataEndpoints(t *testing.T) {
	t.Parallel()

	handler := httpapi.New(1)
	tests := []struct {
		path        string
		contentType string
		body        string
	}{
		{path: "/", contentType: "application/json", body: `"title":"CentMatch"`},
		{path: "/health", contentType: "application/json", body: `"status":"ok"`},
		{path: "/openapi.yaml", contentType: "application/yaml", body: "openapi: 3.1.0"},
	}
	for _, test := range tests {
		response := request(t, handler, http.MethodGet, test.path, "")
		if response.Code != http.StatusOK || !strings.Contains(response.Header().Get("Content-Type"), test.contentType) || !strings.Contains(response.Body.String(), test.body) {
			t.Fatalf("GET %s = status %d, content-type %q, body %q", test.path, response.Code, response.Header().Get("Content-Type"), response.Body.String())
		}
	}
}

func TestServiceInfoUsesCurrentAPIVersion(t *testing.T) {
	t.Parallel()

	response := request(t, httpapi.New(1), http.MethodGet, "/", "")
	if !strings.Contains(response.Body.String(), `"version":"3.1.0"`) {
		t.Fatalf("service info body = %s, want API version 3.1.0", response.Body.String())
	}
}

func TestOpenAPIDocumentsBrandAndLabels(t *testing.T) {
	t.Parallel()

	response := request(t, httpapi.New(1), http.MethodGet, "/openapi.yaml", "")
	body := response.Body.String()
	for _, expected := range []string{"title: CentMatch API", "version: 3.1.0", "label:", "maxLength: 120", "legacyPricePoints:"} {
		if !strings.Contains(body, expected) {
			t.Errorf("OpenAPI document does not contain %q", expected)
		}
	}
}

func TestSolve(t *testing.T) {
	t.Parallel()

	response := request(t, httpapi.New(1), http.MethodPost, "/solve", `{
		"targetCents": 12,
		"tiers": [{"id": "three", "priceCents": 3}, {"id": "four", "priceCents": 4}]
	}`)
	if response.Code != http.StatusOK {
		t.Fatalf("POST /solve status = %d, body = %s", response.Code, response.Body.String())
	}
	var got struct {
		TargetCents   int `json:"targetCents"`
		PurchaseCount int `json:"purchaseCount"`
		Assignments   []struct {
			TierID   string `json:"tierId"`
			Quantity int    `json:"quantity"`
		} `json:"assignments"`
	}
	if err := json.NewDecoder(response.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	if got.TargetCents != 12 || got.PurchaseCount != 3 || len(got.Assignments) != 1 || got.Assignments[0].TierID != "four" || got.Assignments[0].Quantity != 3 {
		t.Fatalf("response = %#v", got)
	}
	if strings.Contains(response.Body.String(), `"label"`) {
		t.Fatalf("legacy response unexpectedly contains label: %s", response.Body.String())
	}
}

func TestSolvePreservesTrimmedLabel(t *testing.T) {
	t.Parallel()

	response := request(t, httpapi.New(1), http.MethodPost, "/solve", `{
		"targetCents": 8,
		"tiers": [
			{"id": "coffee", "label": "  Coffee refill  ", "priceCents": 4},
			{"id": "unused", "label": "Unused", "priceCents": 3}
		]
	}`)
	if response.Code != http.StatusOK {
		t.Fatalf("POST /solve status = %d, body = %s", response.Code, response.Body.String())
	}
	var got struct {
		Assignments []struct {
			TierID string  `json:"tierId"`
			Label  *string `json:"label"`
		} `json:"assignments"`
	}
	if err := json.NewDecoder(response.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	if len(got.Assignments) != 1 || got.Assignments[0].TierID != "coffee" || got.Assignments[0].Label == nil || *got.Assignments[0].Label != "Coffee refill" {
		t.Fatalf("assignments = %#v, want trimmed Coffee refill label", got.Assignments)
	}
}

func TestSolveRejectsNoSolution(t *testing.T) {
	t.Parallel()

	response := request(t, httpapi.New(1), http.MethodPost, "/solve", `{
		"targetCents": 7,
		"tiers": [{"id": "four", "priceCents": 4}, {"id": "six", "priceCents": 6}]
	}`)
	if response.Code != http.StatusConflict || !strings.Contains(response.Body.String(), `"code":"no_exact_solution"`) {
		t.Fatalf("POST /solve = status %d, body %s", response.Code, response.Body.String())
	}
}

func TestSolveRejectsMalformedRequests(t *testing.T) {
	t.Parallel()

	handler := httpapi.New(1)
	tests := []struct {
		name        string
		body        string
		contentType string
		status      int
	}{
		{name: "wrong content type", body: `{}`, contentType: "text/plain", status: http.StatusUnsupportedMediaType},
		{name: "null", body: `null`, contentType: "application/json", status: http.StatusUnprocessableEntity},
		{name: "decimal target", body: `{"targetCents": 8.5, "tiers": [{"id": "four", "priceCents": 4}]}`, contentType: "application/json", status: http.StatusUnprocessableEntity},
		{name: "unknown field", body: `{"targetCents": 8, "tiers": [{"id": "four", "priceCents": 4}], "other": true}`, contentType: "application/json", status: http.StatusUnprocessableEntity},
		{name: "unknown tier field", body: `{"targetCents": 8, "tiers": [{"id": "four", "priceCents": 4, "description": "Four"}]}`, contentType: "application/json", status: http.StatusUnprocessableEntity},
		{name: "null label", body: `{"targetCents": 8, "tiers": [{"id": "four", "label": null, "priceCents": 4}]}`, contentType: "application/json", status: http.StatusUnprocessableEntity},
		{name: "numeric label", body: `{"targetCents": 8, "tiers": [{"id": "four", "label": 4, "priceCents": 4}]}`, contentType: "application/json", status: http.StatusUnprocessableEntity},
		{name: "control in label", body: `{"targetCents": 8, "tiers": [{"id": "four", "label": "line one\nline two", "priceCents": 4}]}`, contentType: "application/json", status: http.StatusUnprocessableEntity},
		{name: "long label", body: `{"targetCents": 8, "tiers": [{"id": "four", "label": "` + strings.Repeat("界", 121) + `", "priceCents": 4}]}`, contentType: "application/json", status: http.StatusUnprocessableEntity},
		{name: "duplicate prices", body: `{"targetCents": 8, "tiers": [{"id": "one", "priceCents": 4}, {"id": "two", "priceCents": 4}]}`, contentType: "application/json", status: http.StatusUnprocessableEntity},
		{name: "multiple values", body: `{} {}`, contentType: "application/json", status: http.StatusUnprocessableEntity},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			value := httptest.NewRequest(http.MethodPost, "/solve", strings.NewReader(test.body))
			value.Header.Set("Content-Type", test.contentType)
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, value)
			if response.Code != test.status {
				t.Fatalf("status = %d, want %d; body = %s", response.Code, test.status, response.Body.String())
			}
		})
	}
}

func TestSolveOmitsBlankLabel(t *testing.T) {
	t.Parallel()

	response := request(t, httpapi.New(1), http.MethodPost, "/solve", `{
		"targetCents": 8,
		"tiers": [{"id": "four", "label": "   ", "priceCents": 4}]
	}`)
	if response.Code != http.StatusOK {
		t.Fatalf("POST /solve status = %d, body = %s", response.Code, response.Body.String())
	}
	if strings.Contains(response.Body.String(), `"label"`) {
		t.Fatalf("response unexpectedly contains blank label: %s", response.Body.String())
	}
}

func TestSolveRejectsInvalidUTF8Label(t *testing.T) {
	t.Parallel()

	body := append(
		[]byte(`{"targetCents":8,"tiers":[{"id":"four","label":"`),
		0xff,
	)
	body = append(body, []byte(`","priceCents":4}]}`)...)
	value := httptest.NewRequest(http.MethodPost, "/solve", bytes.NewReader(body))
	value.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	httpapi.New(1).ServeHTTP(response, value)
	if response.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d, want 422; body = %s", response.Code, response.Body.String())
	}
}

func TestSolveRejectsLargeBody(t *testing.T) {
	t.Parallel()

	body := bytes.Repeat([]byte(" "), (1<<20)+1)
	value := httptest.NewRequest(http.MethodPost, "/solve", bytes.NewReader(body))
	value.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	httpapi.New(1).ServeHTTP(response, value)
	if response.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("status = %d, want 413; body = %s", response.Code, response.Body.String())
	}
}

func TestSolveRejectsWrongMethod(t *testing.T) {
	t.Parallel()

	response := request(t, httpapi.New(1), http.MethodGet, "/solve", "")
	if response.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want 405", response.Code)
	}
}
