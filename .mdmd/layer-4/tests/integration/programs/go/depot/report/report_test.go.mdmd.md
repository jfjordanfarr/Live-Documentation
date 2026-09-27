# tests/integration/programs/go/depot/report/report_test.go

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/go/depot/report/report_test.go
- Live Doc ID: LD-test-tests-integration-programs-go-depot-report-report-test-go
- Generated At: 2026-09-27T20:30:56.037Z

## Authored
### Purpose
Tests of the depot sample program's reports, using a dot import of `stock`.

### Notes
- `Item`, `Quantity`, `Each` and `Kilogram` are used unqualified through the dot import and resolve to the `stock` files that declare them.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:30:56.037Z","inputHash":"da4fd9c4a6c6a766"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TestWriteListsEveryItemInOrder` {#symbol-testwritelistseveryiteminorder}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/go/depot/report/report_test.go#L11)
- Parameters: `t`: `T`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Count`](./count.go.mdmd.md#symbol-count)
- [`report.Total`](./report.go.mdmd.md#symbol-total)
- [`report.Write`](./report.go.mdmd.md#symbol-write)
- [`Item`](../stock/item.go.mdmd.md#symbol-item)
- [`quantity.Each`](../stock/quantity.go.mdmd.md#symbol-each)
- [`quantity.Kilogram`](../stock/quantity.go.mdmd.md#symbol-kilogram)
- [`Quantity`](../stock/quantity.go.mdmd.md#symbol-quantity)
- [`memory.New`](../store/memory/memory.go.mdmd.md#symbol-new)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
