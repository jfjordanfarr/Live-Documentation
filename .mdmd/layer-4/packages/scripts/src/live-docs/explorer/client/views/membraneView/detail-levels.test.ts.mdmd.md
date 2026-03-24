# packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.test.ts

## Metadata

- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-membraneview-detail-levels-test-ts
- Generated At: 2026-03-24T03:05:19.677Z

## Authored

### Purpose

Verifies detail level resolution across Browse, Explore, and Compare focal specifications, including 1-hop neighbor detection, viewport culling, and the edge-case behavior when no focal is specified.

### Notes

- 9 tests covering: no-focal browse mode (all Badge), single-focal explore mode (Full + Summary neighbors), dual-focal compare mode (union of neighbor sets), off-viewport culling to Hidden, partially-visible nodes retained, non-neighbor nodes as Badge, and directory vs. leaf classification.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:19.677Z","inputHash":"6c5572990ae71d9d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

_No public symbols detected_

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect) (type-only)
- [`detail-levels.DetailLevel`](./detail-levels.ts.mdmd.md#symbol-detaillevel)
- [`detail-levels.resolveDetailLevels`](./detail-levels.ts.mdmd.md#symbol-resolvedetaillevels)
- [`types.MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout) (type-only)
- [`types.MembraneNode`](./types.ts.mdmd.md#symbol-membranenode) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->

### Targets

#### Vitest Unit Tests

- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views: [layoutUtils.ts](../layoutUtils.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/membraneView: [detail-levels.ts](./detail-levels.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->

### Supporting Fixtures

_No supporting fixtures documented yet_

<!-- LIVE-DOC:END Supporting Fixtures -->
