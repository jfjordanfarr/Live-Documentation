# tests/integration/fixtures/manifests/workspace/go/app/main.go

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/manifests/workspace/go/app/main.go
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-10-16T16:21:49.917Z

## Authored
### Purpose
The manifests fixture's Go program: a `main` that prints `ledger.Sum(3, 4)`, the program mark the Go adapter writes.

### Notes
- Written 2026-10-16 for `tests/integration/live-docs/manifests.test.ts`. Its import of the replaced module stays external on its doc: the Go adapter does not follow a `replace`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/fixtures/manifests/workspace/go/app/main.go#L10)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `example.com/tally/ledger`
<!-- LIVE-DOC:END Dependencies -->
