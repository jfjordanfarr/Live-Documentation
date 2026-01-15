# packages/shared/src/live-docs/sourceAnalysis.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/sourceAnalysis.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-sourceanalysis-ts
- Generated At: 2026-01-15T17:00:39.316Z

## Authored
### Purpose
Main entry point for analyzing source files to extract symbols and dependencies for Live Documentation generation. Orchestrates language adapters, TypeScript parsing, and heuristic DOM dependency inference.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `analyzeSourceFile()` is the single public API; delegates to polyglot adapters first, then falls back to TS parser
- Infers DOM dependencies for `.html`/`.aspx` files via heuristics
- Augments symbol list with re-exported symbols from star exports
- Returns `EMPTY_ANALYSIS_RESULT` for unsupported file extensions

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T17:00:39.316Z","inputHash":"88e3733b59159040"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `analyzeSourceFile` {#symbol-analyzesourcefile}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/sourceAnalysis.ts#L62)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./core.ts.mdmd.md#symbol-workspacefileindex)

##### `analyzeSourceFile` — Summary
Produces symbol and dependency analysis for a single source artifact.

##### `analyzeSourceFile` — Remarks
Language-specific adapters run before falling back to the built-in
TypeScript/JavaScript parser. This lets polyglot fixtures supply rich metadata
without requiring the TypeScript compiler to understand those languages.

##### `analyzeSourceFile` — Parameters
- `absolutePath`: Absolute filesystem path to the source file under inspection.
- `fileIndex`: Optional set of workspace file paths for cross-file reference resolution.
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
- `node:fs/promises`
- `node:path` - `path`
- [`index.WorkspaceFileIndex`](./adapters/index.ts.mdmd.md#symbol-workspacefileindex)
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
