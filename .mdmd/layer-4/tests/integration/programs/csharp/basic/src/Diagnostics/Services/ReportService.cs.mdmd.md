# tests/integration/programs/csharp/basic/src/Diagnostics/Services/ReportService.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/basic/src/Diagnostics/Services/ReportService.cs
- Generated At: 2026-09-27T23:21:34.595Z

## Authored
### Purpose
Creates formatted diagnostics reports for the C# basic benchmark, bridging repository data to formatter output.

### Notes
Both `Process` methods intentionally exist to exercise overload analysis; keep their signatures stable.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReportService (class)` {#symbol-reportservice-class}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/programs/csharp/basic/src/Diagnostics/Services/ReportService.cs#L6)

#### `ReportService (constructor)` {#symbol-reportservice-constructor}
- Type: constructor
- Source: [source](../../../../../../../../../../tests/integration/programs/csharp/basic/src/Diagnostics/Services/ReportService.cs#L11)
- Parameters: `repository`: [`Repository`](../Data/Repository.cs.mdmd.md#symbol-repository); `formatter`: [`Formatter`](../Models/Formatter.cs.mdmd.md#symbol-formatter)

#### `Process` {#symbol-process}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/programs/csharp/basic/src/Diagnostics/Services/ReportService.cs#L17)
- Returns: [`FormattedReport`](../Models/FormattedReport.cs.mdmd.md#symbol-formattedreport)
- Parameters: `record`: [`Record`](../Models/Record.cs.mdmd.md#symbol-record)

#### `ProcessLatest` {#symbol-processlatest}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/programs/csharp/basic/src/Diagnostics/Services/ReportService.cs#L23)
- Returns: [`FormattedReport`](../Models/FormattedReport.cs.mdmd.md#symbol-formattedreport)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Repository`](../Data/Repository.cs.mdmd.md#symbol-repository)
- [`FormattedReport`](../Models/FormattedReport.cs.mdmd.md#symbol-formattedreport)
- [`Formatter`](../Models/Formatter.cs.mdmd.md#symbol-formatter)
- [`Record`](../Models/Record.cs.mdmd.md#symbol-record)
<!-- LIVE-DOC:END Dependencies -->
