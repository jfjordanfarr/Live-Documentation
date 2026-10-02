# tests/integration/programs/csharp/basic/src/Diagnostics/Data/Repository.cs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/csharp/basic/src/Diagnostics/Data/Repository.cs
- Generated At: 2026-10-02T20:20:04.614Z

## Authored
### Purpose
Maintains an in-memory record feed for the C# basic benchmark so the analyzer sees collection initialization and data access.

### Notes
Keep the seeded records lightweight; altering them only makes sense when changing the service contract.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Repository` {#symbol-repository}
- Type: class
- Source: [source](../../../../../../../../../../tests/integration/programs/csharp/basic/src/Diagnostics/Data/Repository.cs#L8)

#### `GetLatest` {#symbol-getlatest}
- Type: method
- Source: [source](../../../../../../../../../../tests/integration/programs/csharp/basic/src/Diagnostics/Data/Repository.cs#L16)
- Returns: [`Record`](../Models/Record.cs.mdmd.md#symbol-record)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Record`](../Models/Record.cs.mdmd.md#symbol-record)
<!-- LIVE-DOC:END Dependencies -->
