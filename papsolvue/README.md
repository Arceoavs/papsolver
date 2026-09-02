# PapSolver frontend

Nuxt 4 and TypeScript frontend for PapSolver. Nuxt prerenders every application
route as static HTML, while the iTunes page hydrates in the browser for solver
interactions. Bun manages packages and runs all JavaScript tooling.

## Local development

Install [Bun](https://bun.sh/), then run:

```sh
bun install --frozen-lockfile
bun run dev
```

Nuxt serves the app at `http://localhost:3000` and proxies `/api/*` to
`http://localhost:8000` by default. To use another backend:

```sh
NUXT_API_PROXY_TARGET=http://localhost:9000 bun run dev
```

## Checks and static generation

```sh
bun run test
bun run build
```

`build` first runs Nuxt's TypeScript checker and then `nuxt generate`. The
deployable static site is written to `.output/public`; no Nitro, Node, or Bun
server is required in production.

The project intentionally pins TypeScript 6.0.3: the current `vue-tsc` release
still uses the JavaScript compiler entry point removed from the TypeScript 7
package. All other direct dependencies are at their current releases.

## Structure

- `app/pages`: file-based routes, all prerendered during generation
- `app/components`: navigation and other shared Vue components
- `app/services`: typed browser API client using native `fetch`
- `app/data`: the versioned German App Store price-point snapshot
- `nuxt.config.ts`: document metadata, static generation, and development proxy

## Container

The multi-stage Docker image uses Bun only in its build stage. The runtime is an
Nginx image containing `.output/public`; it has no JavaScript runtime. Nginx
serves known prerendered routes, returns the generated Nuxt `404.html` for
unknown routes, and proxies `/api/*` to the Go backend.

```sh
docker build -t papsolver-frontend .
docker run --rm -p 8080:80 \
  -e API_UPSTREAM=http://host.docker.internal:8000 \
  papsolver-frontend
```

When using the repository's Compose configuration, the upstream is configured
automatically.
