# tests/integration/programs/csharp/basic/CSharpBasic.csproj

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/basic/CSharpBasic.csproj
- Generated At: 2026-10-02T20:20:04.565Z

## Authored
### Purpose
The project file of the `basic` C# sample, a .NET 8 library with no references: it exists so that `scip-dotnet` can index the sample and write its compiler expectations.

### Notes
- Added on 2026-01-27 when the C# samples moved from heuristic oracles to the compiler's (`95595aa3`); the indexer needs a project to build. Since 2026-09-28 the project adapter reads it as a `library` symbol with no dependencies, and the oracle names it as the sample's indexer target. What the sample itself exercises is in [Sample Programs](../../../../../../layer-3/sample-programs.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CSharpBasic` {#symbol-csharpbasic}
- Type: library
- Source: [source](../../../../../../../tests/integration/programs/csharp/basic/CSharpBasic.csproj#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
