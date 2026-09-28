# packages/explorer/src/client/views/membraneView/detail-levels.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/membraneView/detail-levels.test.ts
- Generated At: 2026-09-27T23:21:28.749Z

## Authored
### Purpose

Verifies detail level resolution across Browse, Explore, and Compare focal specifications, including 1-hop neighbor detection, viewport culling, and the edge-case behavior when no focal is specified.

### Notes

- 9 tests covering: no-focal browse mode (all Badge), single-focal explore mode (Full + Summary neighbors), dual-focal compare mode (union of neighbor sets), off-viewport culling to Hidden, partially-visible nodes retained, non-neighbor nodes as Badge, and directory vs. leaf classification.

## Generated
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
