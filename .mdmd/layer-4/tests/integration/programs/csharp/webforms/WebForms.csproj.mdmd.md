# tests/integration/programs/csharp/webforms/WebForms.csproj

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/webforms/WebForms.csproj
- Generated At: 2026-10-02T20:20:05.609Z

## Authored
### Purpose
The project file of the WebForms sample, the owner's own scenario of 2025-11-06: a .NET Framework 4.8 project standing on `System.Web` and `System.Configuration`, so that `scip-dotnet` can index it on Linux and write its compiler expectations.

### Notes
- Added on 2026-01-27 with the move to the compiler oracle (`95595aa3`), when .NET Framework 4.8 targeting was first made to build here; the estate's five projects follow its form. The project adapter reads it as a `library` with two assembly references as externals. The chain it exercises, `Web.config` to `Globals.cs` to the page and its script, is told in [Sample Programs](../../../../../../layer-3/sample-programs.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WebForms` {#symbol-webforms}
- Type: library
- Source: [source](../../../../../../../tests/integration/programs/csharp/webforms/WebForms.csproj#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `System.Configuration`
- `System.Web`
<!-- LIVE-DOC:END Dependencies -->
