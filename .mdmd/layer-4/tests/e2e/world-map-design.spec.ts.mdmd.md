# tests/e2e/world-map-design.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/world-map-design.spec.ts
- Generated At: 2026-10-12T19:21:21.713Z

## Authored
### Purpose
Keeps the World Map's words off each other over this repository's board, in each state the view can be in: at rest, with the built-on layer showing, after a turn and a zoom (labels keep their size and the world does not), and a thing opened into the Local Map, where nothing collides and nothing is cut off.

### Notes
- Written on 2026-09-29 when the owner asked whether Playwright could catch "text overflows or other immediate design fails" ([Turn 48](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-48)); `tests/e2e/design-audit.ts` is the instrument, and each state is its own case so that a failure names the state and the words. The controller's label settling is what these cases keep honest.
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
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
<!-- LIVE-DOC:END Dependencies -->
