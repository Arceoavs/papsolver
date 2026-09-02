# PapSolver frontend

Vue 3 and TypeScript single-page frontend for PapSolver. Vite handles development
and production builds; Bun manages packages and runs all JavaScript tooling.

## Local development

Install [Bun](https://bun.sh/), then run:

```sh
bun install --frozen-lockfile
bun run dev
```

Vite serves the app at `http://localhost:5173` and proxies `/api/*` to
`http://localhost:8000` by default. To use another backend:

```sh
VITE_API_PROXY_TARGET=http://localhost:9000 bun run dev
```

## Checks

```sh
bun run test
bun run build
```

`build` runs the Vue TypeScript checker before creating the production bundle.

The project intentionally pins TypeScript 6.0.3: the current `vue-tsc` release
still uses the JavaScript compiler entry point removed from the TypeScript 7
package. All other direct dependencies are at their current releases.

## Container

The multi-stage Docker image uses Bun to build the static application and Nginx
to serve it. Nginx provides the Vue Router history fallback and proxies `/api/*`
to the backend, stripping the `/api` prefix. Configure the upstream at runtime:

```sh
docker build -t papsolver-frontend .
docker run --rm -p 8080:80 \
  -e API_UPSTREAM=http://host.docker.internal:8000 \
  papsolver-frontend
```

When using the repository's Compose configuration, the upstream is configured
automatically.
