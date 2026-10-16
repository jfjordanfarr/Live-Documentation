# tests/integration/fixtures/manifests/workspace/go/app/go.mod

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/manifests/workspace/go/app/go.mod
- Entry: tooling
- Generated At: 2026-10-16T16:21:49.876Z

## Authored
### Purpose
The manifests fixture's Go application module: it names the module `example.com/tally/app`, requires `example.com/tally/ledger` and replaces it with the folder `../ledger`, so that its doc links the ledger module's file.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`. `go run .` over a copy prints 7, and `go mod tidy` leaves the file as it is.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `example.com/tally/app` {#symbol-examplecomtallyapp}
- Type: package
- Source: [source](../../../../../../../../../tests/integration/fixtures/manifests/workspace/go/app/go.mod#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`go.example.com/tally/ledger`](../ledger/go.mod.mdmd.md#symbol-examplecomtallyledger)
<!-- LIVE-DOC:END Dependencies -->
