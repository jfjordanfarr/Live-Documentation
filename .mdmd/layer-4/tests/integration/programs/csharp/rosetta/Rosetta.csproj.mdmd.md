# tests/integration/programs/csharp/rosetta/Rosetta.csproj

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/rosetta/Rosetta.csproj
- Generated At: 2026-10-02T20:20:05.391Z

## Authored
### Purpose
The project file of the C# Rosetta sample, a .NET 8 library standing on the `xunit` package: it exists so that `scip-dotnet` can index the sample and write its compiler expectations, and so that the sample's test file compiles.

### Notes
- Added on 2026-01-27 with the move to the compiler oracle (`95595aa3`). The project adapter reads it as a `library` with `xunit@2.6.1` as an external; the Rosetta parity suite reads the program from `rosetta-manifest.json`, not from here ([Sample Programs](../../../../../../layer-3/sample-programs.mdmd.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Rosetta` {#symbol-rosetta}
- Type: library
- Source: [source](../../../../../../../tests/integration/programs/csharp/rosetta/Rosetta.csproj#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `xunit@2.6.1`
<!-- LIVE-DOC:END Dependencies -->
