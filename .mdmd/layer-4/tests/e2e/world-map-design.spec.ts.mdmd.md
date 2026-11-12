# tests/e2e/world-map-design.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/world-map-design.spec.ts
- Generated At: 2026-11-12T21:56:42.852Z

## Authored
### Purpose
Keeps the World Map's words off each other over this repository's board, in each state the view can be in: at rest, with the built-on layer showing, after a turn and a zoom (labels keep their size and the world does not), and a thing opened into the Local Map, where nothing collides and nothing is cut off. It also holds every label off every piece's outline, its own or another's, on this repository's board and the estate's, as each first opens, from straight above, turned a quarter and at the walkthrough's angle.

### Notes
- Written on 2026-09-29 when the owner asked whether Playwright could catch "text overflows or other immediate design fails" ([Turn 48](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-48)); `tests/e2e/design-audit.ts` is the instrument, and each state is its own case so that a failure names the state and the words. The controller's label settling is what these cases keep honest.
- Since 2026-11-12 the block "World Map labels clear the pieces" audits labels against the pieces' faces as well as against each other: an outsider's first visit found every piece's second line drawn through its own outline, and in the view from above the names too ([finding 6](../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md)). An edge through a word reads as struck out whichever piece it belongs to, so another piece's outline counts as well (the root's word for the round). All eight cases failed on the build of `99395eef` before the repair; that output, the pictures and an orbit sweep's counts are in [the round's evidence](../../../../AI-Agent-Workspace/Screenshots/2026-11-12/world-map-repairs/README.md).
- Since 2026-10-10 ([Turn 14 of the October 9 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-14)), one case pins each thing of this repository's board in turn and audits the board's words with its door labels showing, the state in which the T2 probe's densest board collided.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.outlines`](./design-audit.ts.mdmd.md#symbol-outlines)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.textOverShapes`](./design-audit.ts.mdmd.md#symbol-textovershapes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
