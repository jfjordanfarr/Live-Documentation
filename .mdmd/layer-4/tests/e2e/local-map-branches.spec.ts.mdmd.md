# `tests/e2e/local-map-branches.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/local-map-branches.spec.ts`
- Generated At: 2026-11-22T18:50:22.154Z

## Authored
### Purpose

Exercises native Local Map branching and the continuous identity handoff to the Force Graph in a real browser.

### Notes

Introduced with the [October 2 retained-branch implementation](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/Summarized/2026-10-02.1.SUMMARIZED.md#turn-11). Uses the TypeScript Rosetta sample to retain multiple symbols with their direct Pin controls, inspect a neighbor-to-neighbor relationship, reload, release pins and traverse history. Samples projected subject positions during perspective transitions and checks keyboard pinning with reduced motion. Whole-file retention checks both its own pressed control and the effective highlighting of its rows; a symbol covered by that file pin is not falsely reported as a separate pressed symbol pin. A type-reference badge must inspect its target without pinning or replacing the subject, including across a perspective change, following the [accepted inspection grammar](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-19/2026-10-19.1.record.md#turn-24) and [October 20 continuation](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-2).

On this repository's five-file deck scope it holds the many-file layout to its invariants with the still-picture instrument: no wire across a card it does not end at, no route reading backward, no lane in a directory that holds neither end of its wires, no wire above the picture's own extent, no orthogonal detour, and no automatic density suggestion beside the compact perspective controls. Two helpers read every lane's height and published slot lines and hold each lane to being a box around its slots, the first wire 9 px below its top, each next at least 7 px further, the bottom edge 10 px below the last; the five-file scope checks the boxes, and the estate's four-file service chain checks that some lane's slots spread to the wires through them. The membranes test reads each directory's outline and its `data-segments` and holds one connected shape per directory, segments overlapping by the neck, every card inside its own segment with the padding, siblings apart in every shared column, and some membrane stepping between columns.
- Waits for the picture to rest (`localMapSettled`) after the clicks it measures after, since a change of pins moves the branch picture from one arrangement to the next (2026-10-07).
- The hover test (2026-10-07): in a retained exploration with bundles, a hovered row leaves its own wires at full opacity and every other wire, the bundles' shared runs among them, at the dim value, and a run returns to its own opacity at rest.
- On 2026-10-08 the rows-order case stopped expecting that the layout order, chosen again after a reload under the alphabetical one, reproduces the first picture's rows: a re-render's order search starts from the picture on the page under the churn cost and a cold render from the ranking's order, so the two can settle on different orders of the same quality. It asserts now that the rows follow the wires more closely than the file's order when chosen again, and that a cold render under the kept choice reproduces the first picture. The earlier assertion had held by luck of the picture until a neighbouring card changed shape.
- The lanes test reads a retained picture of more than a hundred wires whole, 24 to 26 seconds on one worker, so since 2026-10-19 it declares a minute rather than the default half ([Turn 12 of the October 17 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-12)).

Since [Turn 11](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-11), when Card Text came to default to the fixed-slot composition, this spec pins the growing composition in its init script, since its journeys read that composition's recorded facts and in-place descriptions; the composition not chosen is to be deleted with its spec when the owner decides.

On [Turn 12](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-12--november-6) the pin became `keepGrowingComposition`, which merges the choice into the saved tuning rather than replacing it.

Since Flow became Opened Directory's default on 2026-11-13 the unpinned scan root a cleared tray returns to stands in Flow, so the case that clears the pins expects no wire between symbols and only the pair lines of files directly at the scan root.

Since the tone round of 2026-11-15 ([Turn 1 of that day's record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) the case of a hovered row expects the wires the row keeps at 0.7, a wire's opacity at rest, where it had expected 1: the hover had boosted them, against the owner's rule to fade the irrelevant rather than boost the relevant, and the root's correction of that day has a hover fade the others only.

Since 2026-11-22 the lanes case holds its arrival at reading size and waits for rest. Its top rule sets the wires' points beside the cards' top read a moment later, and the arrival that ships eases to another look in between: that day's gate saw a wire 944 px "over the top" where, within the one reading, the highest wire stood 115 px under the highest card ([what was measured](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/gate-six-cases/README.md)). The same record holds a finding not yet mended: since every wire has a band that takes the pointer, the reading's hit test meets the band first, and "nothing across a card" cannot fail.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`layout-measure.framePadding`](../../packages/explorer/src/client/views/localView/layout-measure.ts.mdmd.md#symbol-framepadding)
- [`still-picture.AT_READING_SIZE`](./still-picture.ts.mdmd.md#symbol-at_reading_size)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.displayNames`](./still-picture.ts.mdmd.md#symbol-displaynames)
- [`still-picture.gesture`](./still-picture.ts.mdmd.md#symbol-gesture)
- [`still-picture.keepGrowingComposition`](./still-picture.ts.mdmd.md#symbol-keepgrowingcomposition)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
- [`still-picture.readPicture`](./still-picture.ts.mdmd.md#symbol-readpicture)
- [`still-picture.scoreExpanded`](./still-picture.ts.mdmd.md#symbol-scoreexpanded)
- [`still-picture.scoreForeign`](./still-picture.ts.mdmd.md#symbol-scoreforeign)
- [`still-picture.scoreOcclusion`](./still-picture.ts.mdmd.md#symbol-scoreocclusion)
- [`still-picture.symbolCounts`](./still-picture.ts.mdmd.md#symbol-symbolcounts)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
