# PapSolver API

FastAPI backend for finding a set of repeated price tiers that adds up to a
prepaid balance exactly. If several exact combinations exist, the solver returns
one using the fewest purchases. Request tier order is the deterministic tie-breaker.

The solver uses integer cents throughout and dynamic programming. Targets are
limited to 100,000 cents and requests to 1,000 unique, positive price tiers so API
work and memory stay bounded. Individual tier prices may be as high as 1,000,000
cents; tiers above the target are safely ignored by the solver and returned with a
zero assignment.

## Local development

Python 3.14 and [uv](https://docs.astral.sh/uv/) are required.

```sh
uv sync --locked
uv run uvicorn app.main:app --reload
```

The API is available at <http://localhost:8000>, with interactive documentation
at <http://localhost:8000/docs>.

## Test and lint

```sh
uv run pytest
uv run ruff check .
uv run ruff format --check .
```

## API

`POST /solve` preserves the original request shape:

```json
{
  "target": 685,
  "tiers": [
    {"desc": "tier0", "price": {"int": 99, "full": 0.99}},
    {"desc": "tier1", "price": {"int": 199, "full": 1.99}}
  ]
}
```

A successful response includes all submitted tiers, including zero assignments:

```json
{
  "max_object_value": 685,
  "assignment": [
    {"tier": "tier0", "value": 1},
    {"tier": "tier1", "value": 3}
  ]
}
```

Valid input without an exact solution returns HTTP `409 Conflict`. Malformed or
out-of-range input returns HTTP `422 Unprocessable Content`. `GET /health` is the
container health endpoint.
