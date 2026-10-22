# packages/explorer/src/client/history/cursor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/cursor.ts
- Generated At: 2026-10-22T16:47:54.001Z

## Authored
### Purpose
The step the 3D picture stands at and the move to another: forward by applying the deltas up to the thumb's step, back by a seek from the nearest keyframe, each move returning the renames of files and directories from the step left to the step reached, so that the view can re-key its objects before it draws.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions): "while the thumb moves, each frame applies the deltas up to the thumb's step", and "a seek is the nearest keyframe plus its deltas, so a jump across the whole history costs what a step costs". The file renames across a move are the engine's `followChanges`, the same composition `inspect --between` answers with; the directories renamed whole are derived over them by the engine's `directoryRenames`, the rule each step's are read by, so that a drag across a rename whole reads the same whether it crosses the step in one frame or two, and a merge into a directory that already stood is no rename either way. Measured over this repository's 73 steps at 1,099 spheres: a move a median 0.9 ms, a seek across the whole history 1.7 ms ([the pictures' record](../../../../../../../AI-Agent-Workspace/Screenshots/2026-10-18/history/README.md)). Kept by `cursor.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryCursor` {#symbol-historycursor}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/history/cursor.ts#L28)

##### `HistoryCursor` — Summary
A cursor over a sequence: where it stands and the shape there.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`directories.directoryRenames`](../../../../engine/src/live-docs/history/directories.ts.mdmd.md#symbol-directoryrenames)
- [`format.HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`queries.followChanges`](../../../../engine/src/live-docs/history/queries.ts.mdmd.md#symbol-followchanges)
- [`sequence.changeAt`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.seek`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`Shape`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shape)
- [`shape.ShapeChange`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shapechange)
- [`shape.applyChange`](../../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-applychange)
- [`rekey.Renames`](./rekey.ts.mdmd.md#symbol-renames) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
