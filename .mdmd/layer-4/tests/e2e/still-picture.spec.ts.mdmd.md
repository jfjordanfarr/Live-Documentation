# tests/e2e/still-picture.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/still-picture.spec.ts
- Generated At: 2026-10-01T15:18:24.178Z

## Authored
### Purpose

Plays the still-picture deck over the shipped bundles, this repository's and the estate sample's: the Local Map, the Membrane Map and the Force Graph in the states the deck names, at 1600 by 1000, with the six measures of `still-picture.ts` and a scoreboard written to `reports/still-picture/` as a table, as JSON and as pictures of each state and journey.

### Notes

- The assertions are only the rules the workspace already holds: no label collisions, no cut-off text, no wire that changes shape under a pan, and the Local Map's wires in their gutters. Every other number is reported for the owner to read against the predictions in [the deck](../../../../AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md).
- Each test writes its own row, merged by bundle and view, because a failed test ends its worker and with it any rows held in memory.
- The journeys answer "which files use symbol S of file F" with the answer taken from the graph: in the Local Map by pinning the symbol's row on the subject's card, in the Membrane Map by opening the subject's card in its folder and pinning the symbol's label, each followed by the view's own return move. The Force Graph offers no way to locate a file, so its journey is recorded as not scriptable.
- Created on 2026-10-01; the scope sets and journeys are fixed in `RUNS` so that the numbers mean the same thing on every run.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- `node:fs` - `fs`
- `node:path` - `path`
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`still-picture.Journey`](./still-picture.ts.mdmd.md#symbol-journey)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.MEMBRANE_MAP`](./still-picture.ts.mdmd.md#symbol-membrane_map)
- [`still-picture.Scoreboard`](./still-picture.ts.mdmd.md#symbol-scoreboard)
- [`still-picture.ViewReading`](./still-picture.ts.mdmd.md#symbol-viewreading)
- [`still-picture.backEnabled`](./still-picture.ts.mdmd.md#symbol-backenabled)
- [`still-picture.boxOf`](./still-picture.ts.mdmd.md#symbol-boxof)
- [`still-picture.centerDistance`](./still-picture.ts.mdmd.md#symbol-centerdistance)
- [`still-picture.consumersOf`](./still-picture.ts.mdmd.md#symbol-consumersof)
- [`still-picture.displayNames`](./still-picture.ts.mdmd.md#symbol-displaynames)
- [`still-picture.factsInScope`](./still-picture.ts.mdmd.md#symbol-factsinscope)
- [`still-picture.forceGraphUrl`](./still-picture.ts.mdmd.md#symbol-forcegraphurl)
- [`still-picture.gesture`](./still-picture.ts.mdmd.md#symbol-gesture)
- [`still-picture.legibleNames`](./still-picture.ts.mdmd.md#symbol-legiblenames)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.localMapUrl`](./still-picture.ts.mdmd.md#symbol-localmapurl)
- [`still-picture.membraneBrowseUrl`](./still-picture.ts.mdmd.md#symbol-membranebrowseurl)
- [`still-picture.membranePinAllUrl`](./still-picture.ts.mdmd.md#symbol-membranepinallurl)
- [`still-picture.readPicture`](./still-picture.ts.mdmd.md#symbol-readpicture)
- [`still-picture.scoreLegibility`](./still-picture.ts.mdmd.md#symbol-scorelegibility)
- [`still-picture.scoreOcclusion`](./still-picture.ts.mdmd.md#symbol-scoreocclusion)
- [`still-picture.scoreRoutes`](./still-picture.ts.mdmd.md#symbol-scoreroutes)
- [`still-picture.scoreText`](./still-picture.ts.mdmd.md#symbol-scoretext)
- [`still-picture.scoreboardTable`](./still-picture.ts.mdmd.md#symbol-scoreboardtable)
<!-- LIVE-DOC:END Dependencies -->
