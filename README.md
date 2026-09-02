# PapSolver

PapSolver finds a combination of repeated prices that spends a prepaid balance
exactly. Among multiple exact solutions, it returns one with the fewest
purchases.

The project contains a Vue 3 browser application and a stateless Go service.
Prices and balances cross the API as integer cents, so monetary values are never
solved with floating-point arithmetic.

## Run with Docker Compose

Docker with the Compose plugin is the only prerequisite:

```sh
docker compose up --build
```

Then open:

- Frontend: <http://localhost:8080>
- Backend OpenAPI contract: <http://localhost:8000/openapi.yaml>
- Backend health check: <http://localhost:8000/health>

Override the published ports when necessary:

```sh
FRONTEND_PORT=3000 BACKEND_PORT=9000 docker compose up --build
```

The frontend calls `/api`. Its Nginx container proxies that path to the backend
over the private Compose network, so no browser-side API URL or CORS setup is
needed.

## Development

The backend requires Go 1.27 or newer:

```sh
cd solver
go run ./cmd/papsolver
```

The statically generated Nuxt frontend requires [Bun](https://bun.sh/):

```sh
cd papsolvue
bun install --frozen-lockfile
bun run dev
```

Nuxt serves the frontend at <http://localhost:3000> and proxies `/api` to the
backend at <http://localhost:8000>.

## Checks

```sh
cd solver
go test ./...
go test -race ./...
go vet ./...

cd ../papsolvue
bun run test
bun run build
```

## Architecture

- `papsolvue/`: Nuxt 4, Vue 3, TypeScript, and native `fetch`, managed with Bun.
  Nuxt prerenders every route into static HTML; the production image contains
  only that output and Nginx.
- `solver/`: dependency-free Go HTTP service with private monetary domain types,
  strict JSON decoding, bounded solver concurrency, and an exact integer-cent
  dynamic-programming algorithm. Valid problems without an exact solution
  return `409 Conflict`.
- `kubernetes/`: Kustomize resources for the same two containers.
- `scripts/import_apple_prices.py`: offline normalizer for an authenticated App
  Store Connect JSON or CSV price export.

The backend has no database or session state. See [the API README](solver/README.md)
and [the frontend README](papsolvue/README.md) for component-specific details.

## Pricing data

The bundled German catalogue contains 800 current-style App Store price points
instead of the retired numbered tier system. Its source, verification date,
retrieval date, and limitations are recorded in
[`papsolvue/app/data/de-prices.json`](papsolvue/app/data/de-prices.json).

Apple's canonical list is available only through authenticated App Store
Connect in the context of an app or in-app purchase. The checked-in snapshot is
therefore explicitly identified as a dated, third-party reproduction of an App
Store Connect export. Replace it with your own official export using the
instructions in [`papsolvue/app/data/README.md`](papsolvue/app/data/README.md).
