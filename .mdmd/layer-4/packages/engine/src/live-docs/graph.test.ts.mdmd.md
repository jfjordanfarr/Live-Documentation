# packages/engine/src/live-docs/graph.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/graph.test.ts
- Generated At: 2026-09-28T00:41:40.487Z

## Authored
### Purpose
Unit tests for the graph derivation and link resolution over a three-file corpus.

### Notes
- The corpus is rendered with `renderLiveDoc` and parsed back with `parseLiveDoc`, so the test reads what a consumer reads: dependency lines, a self reference, a cross-file parameter type, an external module, a link nothing answers to, and the adjacency both ways.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.LiveDoc`](./document.ts.mdmd.md#symbol-livedoc)
- [`document.parseLiveDoc`](./document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](./document.ts.mdmd.md#symbol-renderlivedoc)
- [`graph.deriveLiveDocGraph`](./graph.ts.mdmd.md#symbol-derivelivedocgraph)
- [`graph.linkTarget`](./graph.ts.mdmd.md#symbol-linktarget-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
