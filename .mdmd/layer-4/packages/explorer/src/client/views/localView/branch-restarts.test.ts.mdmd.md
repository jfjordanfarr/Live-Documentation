# packages/explorer/src/client/views/localView/branch-restarts.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branch-restarts.test.ts
- Generated At: 2026-10-06T23:02:44.639Z

## Authored
### Purpose

Holds the restarts' rules: which starts are tried and in what order, how the previous picture becomes a start, how churn is counted, how a start is priced, and that the cheapest start wins with ties to the earlier.

### Notes

The tests stand in for the layout with fixed numbers (a branch graph's columns and crossings, a scene's placement measure and height), so they say what the choice does and nothing about the layout itself: a forced seed is tried alone; a previous picture of other files is no start; the files a previous picture did not show follow in their ranked order; a swap of two cards against the previous picture counts one pair and a reversal of three counts three; a crossing priced at twenty pixels turns a choice the vertical length alone would make the other way; and with the churn priced, a start that swaps cards must earn it. Every start is laid out exactly once.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-restarts.candidateStarts`](./branch-restarts.ts.mdmd.md#symbol-candidatestarts)
- [`branch-restarts.churnOf`](./branch-restarts.ts.mdmd.md#symbol-churnof)
- [`branch-restarts.layoutStarts`](./branch-restarts.ts.mdmd.md#symbol-layoutstarts)
- [`branch-restarts.previousStart`](./branch-restarts.ts.mdmd.md#symbol-previousstart)
- [`branch-restarts.scoreOf`](./branch-restarts.ts.mdmd.md#symbol-scoreof)
- [`branch-restarts.startName`](./branch-restarts.ts.mdmd.md#symbol-startname)
- [`branch-restarts.startOrder`](./branch-restarts.ts.mdmd.md#symbol-startorder)
- [`branch-scene.Scene`](./branch-scene.ts.mdmd.md#symbol-scene) (type-only)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
