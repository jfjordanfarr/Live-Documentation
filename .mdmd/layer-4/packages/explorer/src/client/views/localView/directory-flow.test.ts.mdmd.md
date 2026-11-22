# `packages/explorer/src/client/views/localView/directory-flow.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/localView/directory-flow.test.ts`
- Generated At: 2026-11-22T07:12:55.900Z

## Authored
### Purpose

Unit tests of the directory flow trial's pure functions: that every undrawn link between two cards is in exactly one pair line; that a wrap keeps every card and never stands a file left of a file it offers to, and which caps wrap differently; that the columns hold every item once in every shape, boxes at the head and line-less files at the end; that a directory with nothing in the ranks is laid out exactly as the grid lays it; that the walk over shapes keeps the narrowest at a tie and widens only while each step is strictly cheaper; that a shape wraps only the opened directories' own files; that the nominal model gives every card and box one size; and which cards a hover keeps lit.

### Notes

Written with the module on 2026-11-12; the shape and walk cases on 2026-11-13, when the price began choosing the shape, among them the root's `scripts` example of one file used by three under five boxes. The case that holds `flowColumns` equal to `placeMembers` is what makes a directory of subdirectories gain nothing from the trial, a finding of [the trial's evidence](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/directory-flow-trial/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branches.placeMembers`](./branches.ts.mdmd.md#symbol-placemembers)
- [`directory-flow.FlowInput`](./directory-flow.ts.mdmd.md#symbol-flowinput) (type-only)
- [`directory-flow.FlowShape`](./directory-flow.ts.mdmd.md#symbol-flowshape) (type-only)
- [`directory-flow.NARROW_SHAPE`](./directory-flow.ts.mdmd.md#symbol-narrow_shape)
- [`directory-flow.NOMINAL_BOX`](./directory-flow.ts.mdmd.md#symbol-nominal_box)
- [`directory-flow.NOMINAL_CARD`](./directory-flow.ts.mdmd.md#symbol-nominal_card)
- [`directory-flow.NOMINAL_LABEL`](./directory-flow.ts.mdmd.md#symbol-nominal_label)
- [`directory-flow.UndrawnLink`](./directory-flow.ts.mdmd.md#symbol-undrawnlink) (type-only)
- [`directory-flow.flowColumns`](./directory-flow.ts.mdmd.md#symbol-flowcolumns)
- [`directory-flow.flowNeighbours`](./directory-flow.ts.mdmd.md#symbol-flowneighbours)
- [`directory-flow.isPairLine`](./directory-flow.ts.mdmd.md#symbol-ispairline)
- [`directory-flow.linksOf`](./directory-flow.ts.mdmd.md#symbol-linksof)
- [`directory-flow.nominalMeasurer`](./directory-flow.ts.mdmd.md#symbol-nominalmeasurer)
- [`directory-flow.pairLines`](./directory-flow.ts.mdmd.md#symbol-pairlines)
- [`directory-flow.searchFlowShape`](./directory-flow.ts.mdmd.md#symbol-searchflowshape)
- [`directory-flow.wrapChoices`](./directory-flow.ts.mdmd.md#symbol-wrapchoices)
- [`directory-flow.wrapRanks`](./directory-flow.ts.mdmd.md#symbol-wrapranks)
- [`wire-gathering.NODE_HUB`](./wire-gathering.ts.mdmd.md#symbol-node_hub)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
