# scripts/live-docs/history.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/history.ts
- Entry: command `live-docs:history` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-22T16:47:57.550Z

## Authored
### Purpose
`npm run live-docs:history`: the history command's CLI, its sampling options, the pool's default size by the machine's memory, and `--json`, which prints the sequence's head and one line per step with its paths written out.

### Notes
- Written 2026-10-17 for C1 of [the plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md). The npm script passes no `--config`, unlike the other commands', so that a run over another repository (`--workspace`) reads that repository's own configuration or the shipped defaults, never this one's (scenario 15, a stranger's repository, cold).
- The pool is two processes on a machine of 8 GiB or less, the plan's budget for the owner's machine, and otherwise one fewer than the processors, at most three, as the probe ran.
- `--every` counts commits and takes `--step commit`; `--no-authors` leaves the names out of a sequence that will travel (C8, closed 2026-10-17). Progress goes to stderr; the summary line, or the JSON lines, to stdout.
- A reader that closes the pipe early, as `head` does over `--json`, ends the listing quietly ([cli.ts](cli.ts.mdmd.md), 2026-10-18).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:os` - `os`
- `node:process` - `process`
- [`format.HistorySequence`](../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-historysequence) (type-only)
- [`format.Sampling`](../../packages/engine/src/live-docs/history/format.ts.mdmd.md#symbol-sampling) (type-only)
- [`sequence.changeAt`](../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-changeat)
- [`sequence.headOf`](../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-headof)
- [`computeHistory`](../../packages/generator/src/history/computeHistory.ts.mdmd.md#symbol-computehistory)
- [`cli.endQuietlyWhenThePipeCloses`](./cli.ts.mdmd.md#symbol-endquietlywhenthepipecloses)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
