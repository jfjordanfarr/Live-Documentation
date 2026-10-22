# packages/explorer/src/client/views/localView/branch-alignments.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-alignments.ts
- Generated At: 2026-10-22T16:47:55.371Z

## Authored
### Purpose

Proposes simpler directory outlines for the Local Map’s continuing layout competition by joining neighboring flat runs of a membrane’s top or bottom.

### Notes

Every proposal preserves all existing flat runs across drawn directories, including ancestors, so removing one step cannot merely move it into a formerly flat section. The placement solver re-solves cards, lanes and containing boxes under those equality groups; the shared complete score decides whether to adopt the result. Candidates are deterministic, with smaller steps offered first. This is a local neighborhood, not a globally optimal fixed-charge solver.

Created for the owner’s October 13, 2026 request to tune aesthetic preferences within the existing competition: [the originating discussion](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `alignmentCandidates` {#symbol-alignmentcandidates}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-alignments.ts#L26)
- Returns: [`BoundaryAlignment`](./branch-placement.ts.mdmd.md#symbol-boundaryalignment)[]
- Parameters: `scene`: [`Scene`](./branch-scene.ts.mdmd.md#symbol-scene)

##### `alignmentCandidates` — Summary
One candidate per existing step, shortest first for an early opportunity
to remove a small distraction. Ties keep scene/edge/column order. Every
candidate retains all drawn membranes' already-flat runs, including those
of ancestors, and joins both complete runs beside its selected step.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-placement.BoundaryAlignment`](./branch-placement.ts.mdmd.md#symbol-boundaryalignment) (type-only)
- [`branch-scene.Scene`](./branch-scene.ts.mdmd.md#symbol-scene) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
