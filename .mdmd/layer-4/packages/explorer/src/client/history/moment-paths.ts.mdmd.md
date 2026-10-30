# packages/explorer/src/client/history/moment-paths.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/moment-paths.ts
- Generated At: 2026-10-30T15:33:55.887Z

## Authored
### Purpose
The ground a path is asked over: today's files and wires, or, while the 3D Local Map shows a moment of the history, that moment's. It gives the pathfinder the files by their names on the ground, the links in the shape `findPath`, `reachOf` and `referencesAgainstPath` read, and today's things named there; it gives an end of a path its files on the ground, and says a reach found at a moment back in today's names for the destination field, which searches today's files.

### Notes
- Written 2026-10-30 for the [remediation item](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#remediation-work) "History leaves the map intelligible", under the plan the owner accepted in [Turn 3 of the October 30 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3): until then the reach, the path and the references against a path were asked over today's docs even while the picture showed a past commit, so the report could name a path the picture did not hold. A moment's ground is the moment the history control built for the view (`snapshot.ts` through `moment.ts`), read and not derived again; its names are the moment's, so a path can run through a file deleted since, and a file of today not yet created there has no files. A reach is said in today's names by `fileToday`, dropping a file gone since, which nothing of today can name. Kept by `moment-paths.test.ts`, with the pathfinder itself, over a moment before a rename and a deletion.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PathGround` {#symbol-pathground}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/moment-paths.ts#L26)

##### `PathGround` — Summary
The files and wires a path is asked over, and the names of today's things on them.

#### `todayGround` {#symbol-todayground}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/moment-paths.ts#L40)
- Returns: [`PathGround`](#symbol-pathground)
- Parameters: `links`: [`ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)[]

##### `todayGround` — Summary
Today's ground: the bundle's files and links, every name its own.

#### `momentGround` {#symbol-momentground}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/moment-paths.ts#L51)
- Returns: [`PathGround`](#symbol-pathground)

##### `momentGround` — Summary
A moment's ground: its own graph, and today's things followed to it, and back, through every rename between.

#### `endFiles` {#symbol-endfiles}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/moment-paths.ts#L62)
- Parameters: `item`: [`RetainedItem`](../views/retained-state.ts.mdmd.md#symbol-retaineditem); `ground`: [`PathGround`](#symbol-pathground)

##### `endFiles` — Summary
The files an end of a path stands for on the ground: its one file where it stands, or every file under its directory.

#### `reachToday` {#symbol-reachtoday}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/moment-paths.ts#L76)
- Returns: [`Reach`](../panels/sources-facts.ts.mdmd.md#symbol-reach)
- Parameters: `reach`: [`Reach`](../panels/sources-facts.ts.mdmd.md#symbol-reach); `ground`: [`PathGround`](#symbol-pathground)

##### `reachToday` — Summary
A reach found on the ground, said in today's names: a file gone since is dropped, since nothing of today can name
it. Two names never meet in one today's file, since a file's names are one line of renames; the nearer count is kept
all the same.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`moment.HistoryMoment`](./moment.ts.mdmd.md#symbol-historymoment) (type-only)
- [`pathfind.Reach`](../pathfind.ts.mdmd.md#symbol-reach) (type-only)
- [`directory-state.under`](../views/localView/directory-state.ts.mdmd.md#symbol-under)
- [`retained-state.RetainedItem`](../views/retained-state.ts.mdmd.md#symbol-retaineditem) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
