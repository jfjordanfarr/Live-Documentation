# `tests/integration/live-docs/graph.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/graph.test.ts`
- Generated At: 2026-11-22T02:45:13.933Z

## Authored
### Purpose
Derives the graph of this repository from its committed docs and checks that every link a doc writes lands on a file in the graph and that every edge is mirrored inbound.

### Notes
- Runs over the committed corpus in place; nothing is written. What the generator writes to `.mdmd/index.json` is this graph, serialized.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`document.LINKS_SECTION`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-links_section)
- [`document.readDocumentationReference`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-readdocumentationreference)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`pathfind.getNeighbors`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-getneighbors)
- [`pathfind.reachability`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-reachability-function)
- [`pathfind.searchGraph`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-searchgraph)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
