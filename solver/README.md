# CentMatch API

Stateless Go service that finds a repeated combination of integer-cent price
points that reaches a target exactly. Among exact solutions it returns one with
the fewest purchases; request order deterministically breaks ties.

Each price point has a stable `id` and may include a human-readable `label` for
custom catalogues. Labels are returned on assignments unchanged apart from
trimming surrounding whitespace. Existing `id` + `priceCents` requests remain
supported and their response shape is unchanged.

The service uses Go's standard library and has no third-party runtime
dependencies. Inputs are converted into validated domain types before they can
reach the solver.

## Local development

Go 1.27 or newer is required:

```sh
go run ./cmd/centmatch
```

The server listens on `http://localhost:8000`. Set `PORT` to change the port and
`SOLVER_MAX_CONCURRENT` to bound simultaneous CPU-intensive solver calls.

## Checks

```sh
go test ./...
go test -race ./...
go vet ./...
go test -run '^$' -bench . ./internal/solver
```

## API

The complete contract is in [`api/openapi.yaml`](api/openapi.yaml) and is served
at `GET /openapi.yaml`.

`POST /solve` accepts integer cents as the only monetary representation. A
custom list can attach an optional label to each price point:

```json
{
  "targetCents": 696,
  "tiers": [
    {"id": "coffee", "label": "Coffee", "priceCents": 99},
    {"id": "sandwich", "label": "Sandwich", "priceCents": 199}
  ]
}
```

A successful response contains only price points used by the solution:

```json
{
  "targetCents": 696,
  "purchaseCount": 4,
  "assignments": [
    {"tierId": "coffee", "label": "Coffee", "priceCents": 99, "quantity": 1},
    {"tierId": "sandwich", "label": "Sandwich", "priceCents": 199, "quantity": 3}
  ]
}
```

Valid input without an exact solution returns `409 Conflict`. Malformed or
out-of-range input returns `422 Unprocessable Content` using a structured error
body. Targets are limited to 100,000 cents and requests to 1,000 unique,
positive price points. Prices above the target are valid and ignored.
Nonblank labels may contain at most 120 Unicode code points after surrounding
whitespace is removed. Blank labels are treated as omitted. JSON `null`, control
characters, and non-string labels are rejected. Labels do not need to be unique;
tier IDs and prices do.

## Design

- `cmd/centmatch` is the composition root, process lifecycle, and container
  health-check command.
- `internal/domain` owns validated monetary and problem types.
- `internal/solver` contains the HTTP-independent dynamic-programming algorithm.
- `internal/httpapi` performs strict JSON decoding and maps domain results and
  errors to HTTP.
- `api` embeds the OpenAPI contract served by the application.

The solver first divides the target and usable prices by their greatest common
divisor. It then uses `O(target × tiers)` time and `O(target)` memory, checks for
request cancellation, and reconstructs the chosen price points from predecessor
indices.
