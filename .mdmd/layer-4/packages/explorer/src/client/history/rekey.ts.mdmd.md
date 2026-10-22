# packages/explorer/src/client/history/rekey.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/rekey.ts
- Generated At: 2026-10-22T16:47:54.100Z

## Authored
### Purpose
Re-keys the 3D picture's cached nodes and links through the renames of a move in the history, so that a renamed file and a renamed directory's hub keep their objects, their lines and their places under their new ids.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), the picture's half of its C6 (a hub's identity is its path across time). The view keeps its nodes by id and its links by kind and endpoints, and the 3D library's data join binds a sphere or a line to the data object it was made for, so keeping an object across a rename means moving its data object to the new key and writing the new id on it; the node objects are the same objects after, their ids rewritten, which is the one deliberate mutation here. A hub is carried by the innermost renamed directory that holds its path, as the engine follows a pinned directory; a merge into a directory that already stood is no rename by the engine's rule, so its hub dies and the standing one lives on, as [the probe of October 16](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/change-over-time/README.md) found it must. `composedRenames` chains the moves queued before a render, and `invertedRenames` reads one back. Kept by `rekey.test.ts`.
- A contested key goes to the renamed node or link (2026-10-18): the caches keep the objects of files that left the picture, and a rename onto the path of such a lingering object once dropped whichever was cached last, leaving the lines resolved to the dropped object pointing at a sphere never drawn or moved again, which the owner saw as "stray edges pointing nowhere" after playing through this repository's history ([Turn 8 of the October 17 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-8)). The unrenamed are keyed first and the renamed after, so the renamed always wins; kept by `rekey.test.ts` in both cache orders.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Renames` {#symbol-renames}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/rekey.ts#L24)

##### `Renames` — Summary
The renames between two moments of the picture: files by path, directories by path, each from the old to the new.

#### `NO_RENAMES` {#symbol-no_renames}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/history/rekey.ts#L30)
- Returns: [`Renames`](#symbol-renames)

##### `NO_RENAMES` — Summary
No rename.

#### `hasRenames` {#symbol-hasrenames}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/history/rekey.ts#L35)

##### `hasRenames` — Summary
Whether there is anything to re-key.

#### `invertedRenames` {#symbol-invertedrenames}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/rekey.ts#L38)
- Returns: [`Renames`](#symbol-renames)
- Parameters: `renames`: [`Renames`](#symbol-renames)

##### `invertedRenames` — Summary
The renames the other way, for a step back.

#### `composedRenames` {#symbol-composedrenames}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/rekey.ts#L44)
- Returns: [`Renames`](#symbol-renames)
- Parameters: `first`: [`Renames`](#symbol-renames); `second`: [`Renames`](#symbol-renames)

##### `composedRenames` — Summary
The renames of one move followed by another's: a path renamed twice goes to where the second took it.

#### `renamedDirectory` {#symbol-renameddirectory}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/rekey.ts#L56)
- Parameters: `renames`: `ReadonlyMap`

##### `renamedDirectory` — Summary
A directory's path after the renames: carried by the innermost renamed directory that holds it, or its own.

#### `renamedId` {#symbol-renamedid}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/rekey.ts#L65)
- Parameters: `renames`: [`Renames`](#symbol-renames)

##### `renamedId` — Summary
The id a node of the picture has after the renames: a file's new path, a hub's new directory, or its own id.

#### `RekeyedLink` {#symbol-rekeyedlink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/rekey.ts#L71)

##### `RekeyedLink` — Summary
What the re-key needs of a cached link: its ends, as ids or as the node objects D3 resolved them to.

#### `rekeyedCaches` {#symbol-rekeyedcaches}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/rekey.ts#L85)
- Parameters: `nodes`: `ReadonlyMap`; `links`: `ReadonlyMap`; `renames`: [`Renames`](#symbol-renames); `link`: `L`
- Constraints: [`RekeyedLink`](#symbol-rekeyedlink)

##### `rekeyedCaches` — Summary
The view's caches with every renamed node and link moved to its new key: the node objects kept and their ids
rewritten, a link's string ends rewritten (its object ends follow their node), and every key recomputed. The caches
keep the objects of files that have left the picture, so that a file which returns keeps its place; when a rename
carries a file onto the path of such a lingering object, the renamed one takes the key and the lingering one is
dropped, since the renamed sphere is the one in the picture (found 2026-10-18, as lines leading nowhere after a
play through this repository's history: the lingering object, dropped by chance of order, was still the end of
every line resolved to it, and never drawn or moved again).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphData.directoryNodeId`](../views/forceGraphData.ts.mdmd.md#symbol-directorynodeid)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
