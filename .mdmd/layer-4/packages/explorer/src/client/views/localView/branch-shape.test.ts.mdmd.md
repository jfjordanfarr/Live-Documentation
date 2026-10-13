# packages/explorer/src/client/views/localView/branch-shape.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branch-shape.test.ts
- Generated At: 2026-10-13T17:03:34.040Z

## Authored
### Purpose

Verifies the distinct shape signals used to price competing Local Map layouts.

### Notes

Cases separate total step distance from the number of turns, include nested drawn boundaries while excluding undrawn containers, and pair the k-th directly owned cards only across neighboring columns. Mixed files/subdirectories exercise ownership so the same rows are neither omitted nor counted again through ancestors.

Created for the owner’s October 13, 2026 request to tune aesthetic preferences within the existing competition: [the originating discussion](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-scene.SceneBox`](./branch-scene.ts.mdmd.md#symbol-scenebox)
- [`branch-scene.rowItemsOf`](./branch-scene.ts.mdmd.md#symbol-rowitemsof)
- [`branch-shape.shapeSignalsOf`](./branch-shape.ts.mdmd.md#symbol-shapesignalsof)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
