FROM golang:1.27.1-alpine3.24 AS build

WORKDIR /src

COPY go.mod ./
COPY api ./api
COPY cmd ./cmd
COPY internal ./internal

RUN CGO_ENABLED=0 GOOS=linux go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /out/papsolver \
    ./cmd/papsolver

FROM scratch

COPY --from=build /out/papsolver /papsolver

USER 65532:65532
EXPOSE 8000

ENTRYPOINT ["/papsolver"]
