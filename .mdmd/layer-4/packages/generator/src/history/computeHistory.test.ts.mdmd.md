# packages/generator/src/history/computeHistory.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/generator/src/history/computeHistory.test.ts
- Generated At: 2026-11-19T12:01:27.281Z

## Authored
### Purpose
Holds the history command's pure parts: the pool's size from a machine's memory, processors and the measured peak of one process; the size of bytes in words; and the check at the head, which finds nothing where a moment's rows are those of a committed graph and finds a symbol, a link or a word a replay lost.

### Notes
- Written 2026-11-19 for C15 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), from the owner's "How do we mitigate these costs and risks?" ([Turn 37 of November 18](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37)). The machines named are this one (20 processors, 62 GiB), an 8 GiB laptop and a hosted runner of four processors and 16 GiB.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`document.DEFAULT_AUTHORED_BLOCK`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-default_authored_block)
- [`document.LiveDoc`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-livedoc)
- [`graph.deriveLiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-derivelivedocgraph)
- [`codec.Interner`](../../../engine/src/live-docs/history/codec.ts.mdmd.md#symbol-interner)
- [`rows.rowsOfSummary`](../../../engine/src/live-docs/history/rows.ts.mdmd.md#symbol-rowsofsummary)
- [`shape.shapeOfSummary`](../../../engine/src/live-docs/history/shape.ts.mdmd.md#symbol-shapeofsummary)
- [`summary.summarizeGraph`](../../../engine/src/live-docs/history/summary.ts.mdmd.md#symbol-summarizegraph)
- [`computeHistory.UNMEASURED_PEAK_MEMORY`](./computeHistory.ts.mdmd.md#symbol-unmeasured_peak_memory)
- [`computeHistory.formatBytes`](./computeHistory.ts.mdmd.md#symbol-formatbytes)
- [`computeHistory.holdLock`](./computeHistory.ts.mdmd.md#symbol-holdlock)
- [`computeHistory.nextPoolRecord`](./computeHistory.ts.mdmd.md#symbol-nextpoolrecord)
- [`computeHistory.poolSize`](./computeHistory.ts.mdmd.md#symbol-poolsize)
- [`computeHistory.usableMachine`](./computeHistory.ts.mdmd.md#symbol-usablemachine)
- [`headCheck.ReplayedMoment`](./headCheck.ts.mdmd.md#symbol-replayedmoment)
- [`headCheck.headDifferences`](./headCheck.ts.mdmd.md#symbol-headdifferences)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
