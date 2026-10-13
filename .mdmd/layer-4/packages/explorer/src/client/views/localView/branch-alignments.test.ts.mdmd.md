# packages/explorer/src/client/views/localView/branch-alignments.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branch-alignments.test.ts
- Generated At: 2026-10-13T16:52:34.589Z

## Authored
### Purpose

Keeps boundary-alignment proposals faithful to complete flat runs, including the nested generator and multi-column warehouse examples that motivated the rule.

### Notes

The fixtures distinguish joining both plateaus from aligning only the two segments at a step, require ancestor plateaus to remain intact, and exclude invisible roots and lanes from aesthetic proposals. Empty and already-flat scenes produce no proposals; tie ordering and input geometry remain stable.

Created for the owner’s October 13, 2026 request to tune aesthetic preferences within the existing competition: [the originating discussion](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-alignments.alignmentCandidates`](./branch-alignments.ts.mdmd.md#symbol-alignmentcandidates)
- [`branch-placement.BoundaryAlignment`](./branch-placement.ts.mdmd.md#symbol-boundaryalignment) (type-only)
- [`branch-scene.Scene`](./branch-scene.ts.mdmd.md#symbol-scene) (type-only)
- [`branch-scene.SceneBox`](./branch-scene.ts.mdmd.md#symbol-scenebox) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
