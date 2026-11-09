# packages/engine/src/live-docs/graph.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/graph.test.ts
- Generated At: 2026-11-09T00:01:54.003Z

## Authored
### Purpose
Tests graph derivation and link resolution through canonical Markdown fixtures and a source-backed TypeScript binding corpus.

### Notes
- The TypeScript binding corpus (2026-11-08) starts from source files in a temporary workspace, builds the real index and analysis, composes Markdown, parses it and derives the graph. It proves external/unresolved collisions and bound generics create no false signature edges while direct, renamed, namespace, default and proven re-export references keep their real declaration edges. An imported and shadowed generic reference with the same name, role and parameter name both survive composition; origin-free/self resolution is retained. A valid nested-conditional fixture is also checked with TypeScript's own type checker, independently of the extractor, so inference confined to an inner conditional cannot hide a real import in the outer true branch.
- The corpus is rendered with `renderLiveDoc` and parsed back with `parseLiveDoc`, so the test reads what a consumer reads: dependency lines, a self reference, a cross-file parameter type, an external module, a link nothing answers to, and the adjacency both ways.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path` - `path`
- [`compose.composeDependencies`](./compose.ts.mdmd.md#symbol-composedependencies)
- [`compose.composeReExports`](./compose.ts.mdmd.md#symbol-composereexports)
- [`compose.composeSymbolBlocks`](./compose.ts.mdmd.md#symbol-composesymbolblocks)
- [`compose.computePublicSymbolHeadingInfo`](./compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`discovery.buildWorkspaceIndexes`](./discovery.ts.mdmd.md#symbol-buildworkspaceindexes)
- [`document.LiveDoc`](./document.ts.mdmd.md#symbol-livedoc)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](./document.ts.mdmd.md#symbol-renderlivedoc)
- [`graph.deriveLiveDocGraph`](./graph.ts.mdmd.md#symbol-derivelivedocgraph)
- [`graph.linkTarget`](./graph.ts.mdmd.md#symbol-linktarget-function)
- [`sourceAnalysis.analyzeSourceFile`](./sourceAnalysis.ts.mdmd.md#symbol-analyzesourcefile)
- `typescript` - `ts`
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
