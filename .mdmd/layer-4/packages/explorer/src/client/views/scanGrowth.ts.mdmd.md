# `packages/explorer/src/client/views/scanGrowth.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/scanGrowth.ts`
- Generated At: 2026-11-22T01:29:35.265Z

## Authored
### Purpose
The rhythm and the cut of the Scan Growth trial, as pure functions: how long a scan of so many files lists, makes its first pass and finishes its files, where it stands at a moment, the words of its sign, the two orders files arrive in, and the finished graph cut to the files arrived so far. [`scanGrowthPlay.ts`](scanGrowthPlay.ts.mdmd.md) plays it over the 3D map; nothing here scans anything.

### Notes
- Made on November 22, 2026, for the owner's wish of the day before ([Turn 6 of the November 21 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-6)): "I aspire to be able to let users do some exploring in 2D/3D local map _while the scan is happening_", with their own doubt beside it, that a batch-oriented scan "might be totally ugly and stupid-looking unless we buffer what we add to the rendered space piecemeal ourselves". Root's answer was to see it before building it, with no engine change; this module is what makes the look possible.
- The rhythm is one measurement, root's, of one scan of this repository on November 22 (`MEASURED_SCAN`): 1,292 files in 21 s, about 3 s listing, 5 s of a first pass that finishes no file, 12 s in which files finish one at a time in path order. Each part is scaled by the number of files, so a small sample's scan is over at once; the slower pace is four times that, for the owner's weak work machine. A real scan has fixed costs this does not model.
- The sign's words are the owner's ([Turn 12 of the same record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-12)): "Listing Files... ({fileCountSoFar})" and "Reading File Text... ({scannedCount}/{listedCount})", written with the product's one ellipsis character.
- A wire stands in a cut once both its files have arrived, which is what a scan knows: what a file uses when it is read, what uses it only at the end.
- What the trial looked like is in [the day's pictures](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/scan-growth/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MEASURED_SCAN` {#symbol-measured_scan}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L31)

##### `MEASURED_SCAN` — Summary
One scan of this repository as the root measured it on 2026-11-22: its files, and the milliseconds of its three parts.

#### `SLOWER_PACE` {#symbol-slower_pace}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L34)

##### `SLOWER_PACE` — Summary
How many times slower the slower pace is: the owner's work machine is a weak virtual machine.

#### `ScanSchedule (interface)` {#symbol-scanschedule-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L37)

##### `ScanSchedule (interface)` — Summary
A scan's three parts for a number of files, in milliseconds: the listing, the first pass that finishes no file, and the arrivals.

#### `scanSchedule (function)` {#symbol-scanschedule-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L45)
- Returns: [`ScanSchedule`](#symbol-scanschedule-interface)
- Parameters: `pace`: [`ScanPace`](../types.ts.mdmd.md#symbol-scanpace)

##### `scanSchedule (function)` — Summary
The measured scan's rhythm for this many files at a pace, each part in proportion to the files.

#### `ScanProgress (type)` {#symbol-scanprogress-type}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L51)

##### `ScanProgress (type)` — Summary
Where a scan stands: listing, with the files listed so far; reading, with the files finished of those listed; or done.

#### `scanProgress (function)` {#symbol-scanprogress-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L60)
- Returns: [`ScanProgress`](#symbol-scanprogress-type)
- Parameters: `schedule`: [`ScanSchedule`](#symbol-scanschedule-interface)

##### `scanProgress (function)` — Summary
Where a scan of this schedule stands so many milliseconds after it began. The listing counts up evenly to every file;
the first pass finishes none; then the files finish evenly, the last at the schedule's end, where the scan is done.

#### `arrivedAt` {#symbol-arrivedat}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L70)
- Parameters: `schedule`: [`ScanSchedule`](#symbol-scanschedule-interface); `progress`: [`ScanProgress`](#symbol-scanprogress-type)

##### `arrivedAt` — Summary
How many files have arrived at a point of the scan: none before the first pass ends, every one when it is done.

#### `progressWords` {#symbol-progresswords}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L75)
- Parameters: `progress`: [`ScanProgress`](#symbol-scanprogress-type)

##### `progressWords` — Summary
The sign's words, the owner's: the files listed so far, then the files read of those listed; none once the scan is done.

#### `pathOrder` {#symbol-pathorder}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L83)

##### `pathOrder` — Summary
The files in the order a scan finishes them: by path, compared by code unit, so that the order is the same on every machine.

#### `firstCommitOrder` {#symbol-firstcommitorder}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L91)
- Parameters: `births`: `ReadonlyMap`

##### `firstCommitOrder` — Summary
The files in the order they were first committed: by the step of the history at which each was born, followed back
through its renames; files of one step by path; a file the history does not hold, last, by path.

#### `birthSteps` {#symbol-birthsteps}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L101)
- Parameters: `sequence`: [`HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence)

##### `birthSteps` — Summary
The step at which each file standing at the history's last step was born, by its path there: zero for a file that
stood at the base, where a windowed or shallow history begins and so knows no earlier; a renamed file keeps the step
of the path it began under. One pass over the steps.

#### `arrivedGraph` {#symbol-arrivedgraph}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/scanGrowth.ts#L120)
- Returns: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload)
- Parameters: `graph`: [`ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload)

##### `arrivedGraph` — Summary
The graph as a scan has it once the first `count` files of `order` have arrived: those files, in the graph's own
order, and every link both of whose files have arrived. The counts are the cut graph's own.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.HistorySequence`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`sequence.changeAt`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.seek`](../../../../engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-seek)
- [`types.ScanPace`](../types.ts.mdmd.md#symbol-scanpace) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
