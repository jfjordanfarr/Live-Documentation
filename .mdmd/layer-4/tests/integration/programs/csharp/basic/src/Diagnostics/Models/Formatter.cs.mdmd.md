# tests/integration/programs/csharp/basic/src/Diagnostics/Models/Formatter.cs

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/csharp/basic/src/Diagnostics/Models/Formatter.cs
- Generated At: 2026-09-27T23:21:34.551Z

## Authored
### Purpose
Formats diagnostics records for the C# basic benchmark, demonstrating culture-aware string handling and record updates.

### Notes
Retain the `Render` method's copy semantics and comment—they ensure the analyzer observes immutable record patterns.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Formatter` {#symbol-formatter}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/programs/csharp/basic/src/Diagnostics/Models/Formatter.cs#L5)

#### `BuildHeadline` {#symbol-buildheadline}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/programs/csharp/basic/src/Diagnostics/Models/Formatter.cs#L7)
- Parameters: `record`: [`Record`](./Record.cs.mdmd.md#symbol-record)

#### `Render` {#symbol-render}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/programs/csharp/basic/src/Diagnostics/Models/Formatter.cs#L12)
- Returns: [`FormattedReport`](./FormattedReport.cs.mdmd.md#symbol-formattedreport)
- Parameters: `report`: [`FormattedReport`](./FormattedReport.cs.mdmd.md#symbol-formattedreport)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`FormattedReport`](./FormattedReport.cs.mdmd.md#symbol-formattedreport)
- [`Record`](./Record.cs.mdmd.md#symbol-record)
<!-- LIVE-DOC:END Dependencies -->
