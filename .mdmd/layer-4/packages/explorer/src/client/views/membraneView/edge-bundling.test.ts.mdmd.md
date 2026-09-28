# packages/explorer/src/client/views/membraneView/edge-bundling.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/membraneView/edge-bundling.test.ts
- Generated At: 2026-09-27T23:21:28.794Z

## Authored
### Purpose

Verifies membrane-level edge aggregation: correct endpoint resolution through collapsed directories, directional bundle preservation, exclusion of internal and fully-visible edges, and count accumulation for multi-edge bundles.

### Notes

- 6 tests covering: basic two-node bundling, direction preservation (A→B vs B→A as separate bundles), internal edge exclusion, fully-visible edge pass-through, nested directory resolution to shallowest collapsed ancestor, and multi-edge count accumulation.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect) (type-only)
- [`edge-bundling.aggregateEdges`](./edge-bundling.ts.mdmd.md#symbol-aggregateedges)
- [`types.MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout) (type-only)
- [`types.MembraneNode`](./types.ts.mdmd.md#symbol-membranenode) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
