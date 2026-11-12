# tests/e2e/world-map.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/world-map.spec.ts
- Generated At: 2026-11-12T22:44:25.670Z

## Authored
### Purpose
Keeps what the World Map draws of this repository's board and what a person can do on it, through its observation handle and real pointer interactions: things, regions and wires; hover and pinned evidence; links into the Local Map; orbit direction and scale; moved positions preserved in board text and through reload; directory entry from the evidence panel, wheel or double-click; and dragging a thing with the pointer.

### Notes
- Written on 2026-09-28 with the view ([Turn 46](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)) and grown with the owner's two looks ([Turn 47](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-47), [Turn 49](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-49)): the first found a click that never pinned, which the suite had not noticed because it pinned through the handle, so the pinning cases click with the mouse now. The suite clears the browser's storage and resets the layout before each case, since positions and the theme are kept there.
- Since 2026-10-10 ([Turn 14 of the October 9 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-14)), over the board re-authored as the repository's delivery shape: the CLI shell left the board, so the wheel and drag cases take `scripts`; new cases keep the hollow drawing of imagined things, the declared door nothing uses with its stub and its panel, entering an imagined thing pinning it, and the count and list of what the join found wanting, the last over a copy of the bundle's data that the test hands the page with a connection to a door nothing serves, so that the bundle itself stays sound.
- Opening a file from board evidence must make that file the Local Map subject; the assertion reads the canonical shared snapshot after the transition. The board's own evidence-pinning semantics remain separate from Local Map file retention.
- Since 2026-11-12, after [an outsider's first visit](../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md), cases hold the repairs it asked for. A piece's pinned panel says what the piece is and who it talks to, then the way inside, with its files folded behind their count; its close control stays in sight however far it scrolls; and it stands beside its piece, inside the view, folded and unfolded. The board's tools are icons, named, with their keys in their tooltips and their pressed state. Each piece is a keyboard stop in the board's order: Enter pins it and takes the keyboard into its panel, Escape brings it back, and a turn keeps the keyboard on it. The walkthrough ends where it began, and a wordless sign stands in the main area while the bundle loads. Each failed on the build of `99395eef`; the case that follows a file link now unfolds the files first. The run against the old build is in [the round's evidence](../../../../AI-Agent-Workspace/Screenshots/2026-11-12/world-map-repairs/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`design-audit.TextBox`](./design-audit.ts.mdmd.md#symbol-textbox)
- [`design-audit.outlines`](./design-audit.ts.mdmd.md#symbol-outlines)
- [`design-audit.textOverShapes`](./design-audit.ts.mdmd.md#symbol-textovershapes)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
- [`.mdmd/layer-3/world-map.mdmd.md`](../../../layer-3/world-map.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
