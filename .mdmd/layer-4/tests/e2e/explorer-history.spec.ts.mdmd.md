# tests/e2e/explorer-history.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/explorer-history.spec.ts
- Generated At: 2026-09-30T01:36:13.779Z

## Authored
### Purpose
Keeps Back and Forward in the browser: the views visited walk back and forward by the page's two buttons and the browser's, with the buttons disabled at either end; an opened folder of the Membrane Map is a step back and the pins made in it are not, so the place comes back with its pins and one more step leaves the folder; and a thing opened from the World Map is a step back to the board, with Forward opening it again.

### Notes
- Written on 2026-09-30 with Back and Forward ([Turn 16](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-16)), as the owner asked: "we can split out the pinning history from the navigation history". The unit side is `persistence/history.test.ts` and `persistence/place.test.ts`; this spec is where the browser's own history is driven, which no unit test can.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`helpers.FIXTURE_FILE`](./helpers.ts.mdmd.md#symbol-fixture_file)
- [`helpers.FIXTURE_SUBDIR`](./helpers.ts.mdmd.md#symbol-fixture_subdir)
- [`helpers.expandDirectory`](./helpers.ts.mdmd.md#symbol-expanddirectory)
- [`helpers.goToMembraneMap`](./helpers.ts.mdmd.md#symbol-gotomembranemap)
- [`helpers.pinAllOnCard`](./helpers.ts.mdmd.md#symbol-pinalloncard)
<!-- LIVE-DOC:END Dependencies -->
