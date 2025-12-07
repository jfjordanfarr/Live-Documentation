# packages/shared/src/live-docs/sourceAnalysis.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/sourceAnalysis.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-sourceanalysis-ts
- Generated At: 2025-12-07T04:00:25.834Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T04:00:25.834Z","inputHash":"8e15498aa6a21576"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `analyzeSourceFile` {#symbol-analyzesourcefile}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/sourceAnalysis.ts#L61)

##### `analyzeSourceFile` — Summary
Produces symbol and dependency analysis for a single source artifact.

##### `analyzeSourceFile` — Remarks
Language-specific adapters run before falling back to the built-in
TypeScript/JavaScript parser. This lets polyglot fixtures supply rich metadata
without requiring the TypeScript compiler to understand those languages.

##### `analyzeSourceFile` — Parameters
- `absolutePath`: Absolute filesystem path to the source file under inspection.
- `workspaceRoot`: Workspace root used to normalise relative dependency paths.

##### `analyzeSourceFile` — Returns
Analyzer output describing exported symbols and detected dependencies.

##### `analyzeSourceFile` — Examples
```ts
const analysis = await analyzeSourceFile(srcPath, workspaceRoot);
if (analysis.symbols.length === 0) {
  console.warn("No exports detected");
}
```
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`index.analyzeWithLanguageAdapters`](./adapters/index.ts.mdmd.md#symbol-analyzewithlanguageadapters)
- [`coreConstants.SUPPORTED_SCRIPT_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-supported_script_extensions)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.SourceAnalysisResult`](./coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`dependencies.augmentWithReExportedSymbols`](./dependencies.ts.mdmd.md#symbol-augmentwithreexportedsymbols)
- [`dependencies.collectDependencies`](./dependencies.ts.mdmd.md#symbol-collectdependencies)
- [`dependencies.mergeDependencyEntries`](./dependencies.ts.mdmd.md#symbol-mergedependencyentries)
- [`dependencies.shouldInferDomDependencies`](./dependencies.ts.mdmd.md#symbol-shouldinferdomdependencies)
- [`dom.inferDomDependencies`](./heuristics/dom.ts.mdmd.md#symbol-inferdomdependencies)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](./adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./adapters/csharp.hangfire.test.ts.mdmd.md)
- [powershell.test.ts](./adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./adapters/python.docstring.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./adapters/ruby.docstring.test.ts.mdmd.md)
- [rust.docstring.test.ts](./adapters/rust.docstring.test.ts.mdmd.md)
- [core.docstring.test.ts](./core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
