# depot

A small stock-keeping module written the way Go modules are written, with the shapes a line scanner gets wrong. It is the program the Go adapter is measured on; `expected/compiler-edges.json` holds what `scip-go` resolves.

What it exercises, and where:

| Shape                                                             | Where                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| A package spread over files that use each other's declarations   | `stock/item.go` uses `format` from `stock/quantity.go`             |
| An internal test (same package) and an external one (`_test`)     | `stock/quantity_test.go`, `stock/item_test.go`                     |
| A module path with a domain                                       | `go.mod` (`example.com/depot`)                                     |
| An aliased import                                                 | `cmd/depot/main.go` (`memstore`)                                   |
| A directory whose package name differs from its name              | `store/memory` declares `package memstore`                         |
| A dot import                                                      | `report/report_test.go`                                            |
| A blank import of a package with an `init`                        | `cmd/depot/main.go` imports `internal/audit` for its side effect   |
| A struct embedding a type from another package                    | `store/memory/memory.go` embeds `store.Base`                       |
| A generic function constrained by another package's interface     | `report/report.go` (`Total[T stock.Number]`)                       |
| A local variable that shadows a sibling file's function           | `report/count.go` (`format` is a local, not `report/format.go`)    |
| Package and type names inside strings and comments                | `cmd/depot/main.go` (must not count)                               |

Build it: `go build ./...`. Test it: `go test ./...`. Run it: `go run ./cmd/depot`.
