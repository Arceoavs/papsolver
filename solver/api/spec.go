// Package api contains the public HTTP API description.
package api

import _ "embed"

// OpenAPISpec is the service's OpenAPI contract.
//
//go:embed openapi.yaml
var OpenAPISpec []byte
