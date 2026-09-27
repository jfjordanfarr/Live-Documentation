# tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/App.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/App.cs
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-csharp-basic-src-diagnostics-app-cs
- Generated At: 2026-09-27T18:34:27.928Z

## Authored
### Purpose
Coordinates the C# basic diagnostics benchmark by instantiating repository, formatter, and service layers to exercise dependency wiring.

### Notes
Keep the control flow direct; the goal is to surface namespace interactions rather than additional logic.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:27.928Z","inputHash":"2d6b16ad683b51e8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `App` {#symbol-app}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/App.cs#L7)

#### `Run` {#symbol-run}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/benchmarks/fixtures/csharp/basic/src/Diagnostics/App.cs#L9)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Repository`](./Data/Repository.cs.mdmd.md#symbol-repository)
- [`FormattedReport`](./Models/FormattedReport.cs.mdmd.md#symbol-formattedreport)
- [`Formatter`](./Models/Formatter.cs.mdmd.md#symbol-formatter)
- [`Record`](./Models/Record.cs.mdmd.md#symbol-record)
- [`ReportService`](./Services/ReportService.cs.mdmd.md#symbol-reportservice-class)
<!-- LIVE-DOC:END Dependencies -->
