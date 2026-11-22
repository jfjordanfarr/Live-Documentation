# `packages/explorer/src/client/views/scanGrowthPlay.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/scanGrowthPlay.ts`
- Generated At: 2026-11-22T01:45:46.393Z

## Authored
### Purpose
Plays the Scan Growth trial over the 3D map: a clock, the sign at the map's top edge, and the handing of the view, cut after cut, the finished graph as a scan would have it so far ([`scanGrowth.ts`](scanGrowth.ts.mdmd.md) is the rhythm and the cut). The view takes each cut through its one update path ([`forceGraphView.ts`](forceGraphView.ts.mdmd.md), `setArrived`); when the clock runs out it is handed today's whole graph.

### Notes
- Made on November 22, 2026, with the rhythm module, for the owner's wish to explore the map while a scan runs ([Turn 6 of the November 21 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-6)). It is the only caller of the rhythm that touches the page.
- `FEED_SHARE` is the buffering the owner foresaw. The first build handed the view a cut at every frame, and the page fell behind by seconds as the picture grew; now taking the arrivals in may use at most a quarter of the page's time, the files that arrive during the rest entering together. The measurements are in [the day's pictures](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/scan-growth/README.md).
- A cut is not handed over while the view still packs the bodies of the last, since a picture asked for again before it stands would never stand.
- The sign is hidden from assistive technology, whose status region is told each phase once: the counts change many times a second.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FEED_SHARE` {#symbol-feed_share}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowthPlay.ts#L30)

##### `FEED_SHARE` — Summary
The most of the page's time that taking the scan's arrivals in may use, a quarter: the buffering the owner foresaw
("unless we buffer what we add to the rendered space piecemeal ourselves"). The first look, 2026-11-22, handed the
view a cut at every frame, and by eight hundred files of this repository each cut took longer than a frame, so that
a pointer's move waited seconds to be answered.

#### `ScanGrowthPlayOptions` {#symbol-scangrowthplayoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowthPlay.ts#L33)

##### `ScanGrowthPlayOptions` — Summary
What the play is made with.

#### `ScanGrowthPlay` {#symbol-scangrowthplay}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowthPlay.ts#L49)

##### `ScanGrowthPlay` — Summary
The play as the client drives it.

#### `createScanGrowthPlay` {#symbol-createscangrowthplay}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowthPlay.ts#L58)
- Returns: [`ScanGrowthPlay`](#symbol-scangrowthplay)
- Parameters: `options`: [`ScanGrowthPlayOptions`](#symbol-scangrowthplayoptions)

##### `createScanGrowthPlay` — Summary
Make the play over a 3D view; nothing is drawn or fed until `play`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`announce`](../announce.ts.mdmd.md#symbol-announce)
- [`types.ScanGrowth`](../types.ts.mdmd.md#symbol-scangrowth) (type-only)
- [`types.ScanPace`](../types.ts.mdmd.md#symbol-scanpace) (type-only)
- [`scanGrowth.ScanSchedule`](./scanGrowth.ts.mdmd.md#symbol-scanschedule-interface)
- [`scanGrowth.arrivedAt`](./scanGrowth.ts.mdmd.md#symbol-arrivedat)
- [`scanGrowth.arrivedGraph`](./scanGrowth.ts.mdmd.md#symbol-arrivedgraph)
- [`scanGrowth.firstCommitOrder`](./scanGrowth.ts.mdmd.md#symbol-firstcommitorder)
- [`scanGrowth.pathOrder`](./scanGrowth.ts.mdmd.md#symbol-pathorder)
- [`scanGrowth.progressWords`](./scanGrowth.ts.mdmd.md#symbol-progresswords)
- [`scanGrowth.scanProgress`](./scanGrowth.ts.mdmd.md#symbol-scanprogress-function)
- [`scanGrowth.scanSchedule`](./scanGrowth.ts.mdmd.md#symbol-scanschedule-function)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
