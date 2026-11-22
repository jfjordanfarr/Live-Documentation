# `tests/integration/live-docs/csharp-oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/csharp-oracle.test.ts`
- Generated At: 2026-11-22T07:12:59.751Z

## Authored
### Purpose
Holds the C# adapter to the C# compiler's binding on every C# sample that keeps `expected/csharp-compiler.json`, by the comparison of [`csharp-compare.ts`](../../../../layer-4/scripts/oracle/csharp-compare.ts.mdmd.md), with no `dotnet` present: every disagreement is listed in words and must equal the register of measured misses, so that a miss mended, or a new one, fails until the register says so.

### Notes
- Written on 2026-11-21 in the shape of `powershell-oracle.test.ts`, with the `names` sample, whose two misses are the reviewer's findings on base types and alias arity.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs`
- `node:os` - `os`
- `node:path` - `path`
- [`csharp-compare.CSharpReport`](../../../scripts/oracle/csharp-compare.ts.mdmd.md#symbol-csharpreport) (type-only)
- [`csharp-compare.CompilerRecord`](../../../scripts/oracle/csharp-compare.ts.mdmd.md#symbol-compilerrecord) (type-only)
- [`csharp-compare.DocumentationReference`](../../../scripts/oracle/csharp-compare.ts.mdmd.md#symbol-documentationreference) (type-only)
- [`csharp-compare.compareCSharp`](../../../scripts/oracle/csharp-compare.ts.mdmd.md#symbol-comparecsharp)
- [`csharp-compare.compiledSources`](../../../scripts/oracle/csharp-compare.ts.mdmd.md#symbol-compiledsources)
- [`powershell-compare.folderFiles`](../../../scripts/oracle/powershell-compare.ts.mdmd.md#symbol-folderfiles)
- [`sources.sourceDigests`](../../../scripts/oracle/sources.ts.mdmd.md#symbol-sourcedigests)
- [`sources.sourcesDiffer`](../../../scripts/oracle/sources.ts.mdmd.md#symbol-sourcesdiffer)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
