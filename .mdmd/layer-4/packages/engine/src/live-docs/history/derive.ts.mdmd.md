# packages/engine/src/live-docs/history/derive.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/derive.ts
- Generated At: 2026-10-18T00:39:18.743Z

## Authored
### Purpose
A step's change, derived from the shapes of two sampled commits and what the version control says between them: births, deaths, renames, sizes, kinds, entry marks, wires, the directories renamed whole and the files touched in content alone. Applying it to the earlier shape gives the later exactly.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md). Renames are git's word ("Trust what git says", the owner, [Turn 3 of October 16](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)), believed only where both ends are files of the shapes and each path is in one rename: a file renamed out of the documented set is a death, one renamed into it a birth, and a rename below git's similarity threshold already reaches here as a delete and an add.
- A renamed file's edges move with it before the edges are compared, so an edge that only followed its file is not reported as removed and added.
- `touched` is C3's minor tick, the owner's "update-only changes are minor ticks" ([Turn 3 of October 17](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)): a file git saw change in content whose birth, rename, size, kind, entry mark and every wire stayed as they were.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `deriveChange` {#symbol-derivechange}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/derive.ts#L29)
- Returns: [`ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- Parameters: `before`: [`Shape`](./shape.ts.mdmd.md#symbol-shape); `after`: [`Shape`](./shape.ts.mdmd.md#symbol-shape); `version`: [`VersionChanges`](./versionControl.ts.mdmd.md#symbol-versionchanges)

##### `deriveChange` — Summary
The change from one shape to the next, every list sorted. Applying it to
`before` gives `after` exactly.

##### `deriveChange` — Parameters
- `after`: The shape at the later change.
- `before`: The shape at the earlier change.
- `version`: What the version control says happened between them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`directories.directoryRenames`](./directories.ts.mdmd.md#symbol-directoryrenames)
- [`Shape`](./shape.ts.mdmd.md#symbol-shape)
- [`shape.ShapeChange`](./shape.ts.mdmd.md#symbol-shapechange)
- [`shape.edgeEnds`](./shape.ts.mdmd.md#symbol-edgeends)
- [`shape.emptyChange`](./shape.ts.mdmd.md#symbol-emptychange)
- [`shape.renameShape`](./shape.ts.mdmd.md#symbol-renameshape)
- [`versionControl.VersionChanges`](./versionControl.ts.mdmd.md#symbol-versionchanges) (type-only)
<!-- LIVE-DOC:END Dependencies -->
