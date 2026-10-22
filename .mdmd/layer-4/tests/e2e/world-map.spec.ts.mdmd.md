# tests/e2e/world-map.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/world-map.spec.ts
- Generated At: 2026-10-22T16:47:59.067Z

## Authored
### Purpose
Keeps what the World Map draws of this repository's board and what a person can do on it, through its observation handle and real pointer interactions: things, regions and wires; hover and pinned evidence; links into the Local Map; orbit direction and scale; moved positions preserved in board text and through reload; directory entry from the evidence panel, wheel or double-click; and dragging a thing with the pointer.

### Notes
- Written on 2026-09-28 with the view ([Turn 46](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)) and grown with the owner's two looks ([Turn 47](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-47), [Turn 49](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-49)): the first found a click that never pinned, which the suite had not noticed because it pinned through the handle, so the pinning cases click with the mouse now. The suite clears the browser's storage and resets the layout before each case, since positions and the theme are kept there.
- Since 2026-10-10 ([Turn 14 of the October 9 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-14)), over the board re-authored as the repository's delivery shape: the CLI shell left the board, so the wheel and drag cases take `scripts`; new cases keep the hollow drawing of imagined things, the declared door nothing uses with its stub and its panel, entering an imagined thing pinning it, and the count and list of what the join found wanting, the last over a copy of the bundle's data that the test hands the page with a connection to a door nothing serves, so that the bundle itself stays sound.
- Opening a file from board evidence must make that file the Local Map subject; the assertion reads the canonical shared snapshot after the transition. The board's own evidence-pinning semantics remain separate from Local Map file retention.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
- [`.mdmd/layer-3/world-map.mdmd.md`](../../../layer-3/world-map.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
