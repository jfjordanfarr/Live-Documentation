# packages/engine/src/live-docs/sourceAnalysis.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/sourceAnalysis.ts
- Generated At: 2026-09-28T16:48:39.181Z

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
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `analyzeSourceFile` {#symbol-analyzesourcefile}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/sourceAnalysis.ts#L65)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./adapters/index.ts.mdmd.md#symbol-workspacefileindex); `symbolIndex`: [`WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex)

##### `analyzeSourceFile` — Summary
Produces symbol and dependency analysis for a single source artifact.

##### `analyzeSourceFile` — Remarks
Language-specific adapters run before falling back to the built-in
TypeScript/JavaScript parser. This lets polyglot fixtures supply rich metadata
without requiring the TypeScript compiler to understand those languages.

##### `analyzeSourceFile` — Parameters
- `absolutePath`: Absolute filesystem path to the source file under inspection.
- `fileIndex`: Optional set of workspace file paths for cross-file reference resolution.
- `symbolIndex`: The workspace symbol index, when built, so that a call can find the file that serves it.
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
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`dependencies.augmentWithReExportedSymbols`](./dependencies.ts.mdmd.md#symbol-augmentwithreexportedsymbols)
- [`dependencies.collectDependencies`](./dependencies.ts.mdmd.md#symbol-collectdependencies)
- [`dependencies.mergeDependencyEntries`](./dependencies.ts.mdmd.md#symbol-mergedependencyentries)
- [`dependencies.shouldInferDomDependencies`](./dependencies.ts.mdmd.md#symbol-shouldinferdomdependencies)
- [`dom.inferDomDependencies`](./heuristics/dom.ts.mdmd.md#symbol-inferdomdependencies)
- [`routes.inferRouteDependencies`](./heuristics/routes.ts.mdmd.md#symbol-inferroutedependencies)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
