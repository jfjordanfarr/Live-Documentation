# packages/explorer/src/client/views/localView/directory-flow.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/directory-flow.test.ts
- Generated At: 2026-11-12T22:02:41.504Z

## Authored
### Purpose

Unit tests of the directory flow trial's pure functions: that every undrawn link between two cards is in exactly one pair line; that a wrap keeps every card and never stands a file left of a file it offers to; that the columns hold every item once, boxes at the head and line-less files at the end; that a directory with nothing in the ranks is laid out exactly as the grid lays it; and which cards a hover keeps lit.

### Notes

Written with the module on 2026-11-12. The case that holds `flowColumns` equal to `placeMembers` is what makes a directory of subdirectories gain nothing from the trial, a finding of [the trial's evidence](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/directory-flow-trial/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branches.placeMembers`](./branches.ts.mdmd.md#symbol-placemembers)
- [`directory-flow.FlowInput`](./directory-flow.ts.mdmd.md#symbol-flowinput)
- [`directory-flow.UndrawnLink`](./directory-flow.ts.mdmd.md#symbol-undrawnlink)
- [`directory-flow.flowColumns`](./directory-flow.ts.mdmd.md#symbol-flowcolumns)
- [`directory-flow.flowNeighbours`](./directory-flow.ts.mdmd.md#symbol-flowneighbours)
- [`directory-flow.isPairLine`](./directory-flow.ts.mdmd.md#symbol-ispairline)
- [`directory-flow.linksOf`](./directory-flow.ts.mdmd.md#symbol-linksof)
- [`directory-flow.pairLines`](./directory-flow.ts.mdmd.md#symbol-pairlines)
- [`directory-flow.squareRows`](./directory-flow.ts.mdmd.md#symbol-squarerows)
- [`directory-flow.wrapRanks`](./directory-flow.ts.mdmd.md#symbol-wrapranks)
- [`wire-gathering.NODE_HUB`](./wire-gathering.ts.mdmd.md#symbol-node_hub)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
