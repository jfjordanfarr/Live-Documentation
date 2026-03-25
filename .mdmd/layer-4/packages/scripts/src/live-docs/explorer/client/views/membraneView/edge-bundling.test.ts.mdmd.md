# packages/scripts/src/live-docs/explorer/client/views/membraneView/edge-bundling.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/edge-bundling.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-membraneview-edge-bundling-test-ts
- Generated At: 2026-03-25T17:08:29.681Z

## Authored
### Purpose

Verifies membrane-level edge aggregation: correct endpoint resolution through collapsed directories, directional bundle preservation, exclusion of internal and fully-visible edges, and count accumulation for multi-edge bundles.

### Notes

- 6 tests covering: basic two-node bundling, direction preservation (A→B vs B→A as separate bundles), internal edge exclusion, fully-visible edge pass-through, nested directory resolution to shallowest collapsed ancestor, and multi-edge count accumulation.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-25T17:08:29.681Z","inputHash":"4848ac4c027f9bff"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views: [layoutUtils.ts](../layoutUtils.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/membraneView: [edge-bundling.ts](./edge-bundling.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
