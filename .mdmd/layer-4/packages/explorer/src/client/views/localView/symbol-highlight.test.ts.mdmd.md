# packages/explorer/src/client/views/localView/symbol-highlight.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/symbol-highlight.test.ts
- Generated At: 2026-09-27T23:21:28.558Z

## Authored
### Purpose
Unit tests for symbol highlight computation. Covers edge-symbol matching, `__internals__` handling, collapse mode detection, and node-wide exporter identification (barrel files, assets).

### Notes
Created during Dev Day 50 (12/19). Tests `computeSymbolHighlight()` with various subgraph configurations to ensure correct related symbol/edge/node set computation without DOM involvement.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`symbol-highlight.computeSymbolHighlight`](./symbol-highlight.ts.mdmd.md#symbol-computesymbolhighlight)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
