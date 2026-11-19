# packages/engine/src/live-docs/compose.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/compose.test.ts
- Generated At: 2026-11-19T19:54:56.873Z

## Authored
### Purpose
Proves composition: a symbol becomes a heading with its kind, source line and documentation; a type reference links to the doc that declares it, or within the doc when declared there; dependencies link each imported symbol to its anchor; and what is composed is what the grammar writes back.

### Notes
- Current binding regressions (2026-11-08) place namesakes in the workspace index: known external/unresolved and lexically bound names stay plain; original-symbol mappings and proven re-export providers retain declaration links; unavailable providers retain a real barrel anchor; default imports resolve by export identity.
- Replaced `renderPublicSymbolLines.test.ts` on 2026-09-27, which asserted on rendered lines; these assertions are on the model. Target-index cases distinguish real direct and re-export anchors from a missing symbol whose known file still receives the link. A barrel keeps its own plain heading while its provider link uses the provider's disambiguated type/value heading; no-index standalone composition retains the earlier best-effort fragment.
- Since 2026-11-19 the empty name reads back empty, written `#### ""` apart from a key spelled `""`, and a name ending in a parenthesised word is given its kind so that `symbolName` reads it whole. A barrel re-exporting `Foo` and `foo` through `export *` anchors them `symbol-foo` and `symbol-foo-1`, in its doc and in the workspace index alike; run on the code before, both were `symbol-foo`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`compose.composeDependencies`](./compose.ts.mdmd.md#symbol-composedependencies)
- [`compose.composeEntries`](./compose.ts.mdmd.md#symbol-composeentries)
- [`compose.composeReExports`](./compose.ts.mdmd.md#symbol-composereexports)
- [`compose.composeSymbolBlocks`](./compose.ts.mdmd.md#symbol-composesymbolblocks)
- [`compose.computePublicSymbolHeadingInfo`](./compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`coreTypes.TypeReference`](./coreTypes.ts.mdmd.md#symbol-typereference) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`discovery.buildWorkspaceIndexes`](./discovery.ts.mdmd.md#symbol-buildworkspaceindexes)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](./document.ts.mdmd.md#symbol-renderlivedoc)
- [`document.symbolName`](./document.ts.mdmd.md#symbol-symbolname)
- [`sourceAnalysis.analyzeSourceFile`](./sourceAnalysis.ts.mdmd.md#symbol-analyzesourcefile)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
