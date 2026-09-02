# PapSolver API

Stateless Go service that finds a repeated combination of integer-cent price
points that reaches a target exactly. Among exact solutions it returns one with
the fewest purchases; request order deterministically breaks ties.

The service uses Go's standard library and has no third-party runtime
dependencies. Inputs are converted into validated domain types before they can
reach the solver.

## Local development

Go 1.27 or newer is required:

```sh
go run ./cmd/papsolver
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

`POST /solve` accepts integer cents as the only monetary representation:

```json
{
  "targetCents": 696,
  "tiers": [
    {"id": "deu-0009", "priceCents": 99},
    {"id": "deu-0021", "priceCents": 199}
  ]
}
```

A successful response contains only price points used by the solution:

```json
{
  "targetCents": 696,
  "purchaseCount": 4,
  "assignments": [
    {"tierId": "deu-0009", "priceCents": 99, "quantity": 1},
    {"tierId": "deu-0021", "priceCents": 199, "quantity": 3}
  ]
}
```

Valid input without an exact solution returns `409 Conflict`. Malformed or
out-of-range input returns `422 Unprocessable Content` using a structured error
body. Targets are limited to 100,000 cents and requests to 1,000 unique,
positive price points. Prices above the target are valid and ignored.

## Design

- `cmd/papsolver` is the composition root, process lifecycle, and container
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
