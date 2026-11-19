# scripts/live-docs/history.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/history.ts
- Entry: command `live-docs:history` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-19T06:20:31.320Z

## Authored
### Purpose
`npm run live-docs:history`: the history command's CLI, its sampling options, the pool's size and the removal of other lenses' caches, and `--json`, which prints the sequence's head and one line per step with its paths written out.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md). The npm script passes no `--config`, so that a run over another repository (`--workspace`) reads that repository's own configuration or the shipped defaults, never this one's (scenario 15, a stranger's repository, cold); the other commands' scripts followed on 2026-11-12.
- Until 2026-11-19 the pool was two processes on a machine of 8 GiB or less, the plan's budget for the owner's machine, and otherwise one fewer than the processors, at most three, as the probe ran.
- `--every` counts commits and takes `--step commit`; `--no-authors` leaves the names out of a sequence that will travel (C8, closed 2026-10-17). Progress goes to stderr; the summary line, or the JSON lines, to stdout.
- A reader that closes the pipe early, as `head` does over `--json`, ends the listing quietly ([cli.ts](cli.ts.mdmd.md), 2026-10-18).
- Since 2026-11-12 `-h` prints the usage as `--help` does, and a refused argument ends through `runCommand` in [cli.ts](cli.ts.mdmd.md), one line with the command that lists the options.
- Since 2026-11-19 ([Turn 37 of November 18](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-37), "How do we mitigate these costs and risks?") the pool's default is the history command's (`poolSize`), from the machine's memory and processors and the peak a summarizing process last took, in place of two processes under 8 GiB and else at most three; `--remove-superseded` removes the caches of other lenses, which every run lists with their sizes; and the summary line says the wall clock, the pool, the largest process's peak and the cache's size.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:process` - `process`
- [`format.HistorySequence`](../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`format.Sampling`](../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-sampling) (type-only)
- [`sequence.changeAt`](../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.headOf`](../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-headof)
- [`computeHistory`](../../packages/generator/src/history/computeHistory.ts.mdmd.md#symbol-computehistory)
- [`computeHistory.formatBytes`](../../packages/generator/src/history/computeHistory.ts.mdmd.md#symbol-formatbytes)
- [`cli.UsageError`](./cli.ts.mdmd.md#symbol-usageerror)
- [`cli.endQuietlyWhenThePipeCloses`](./cli.ts.mdmd.md#symbol-endquietlywhenthepipecloses)
- [`cli.optionValue`](./cli.ts.mdmd.md#symbol-optionvalue)
- [`cli.runCommand`](./cli.ts.mdmd.md#symbol-runcommand)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
