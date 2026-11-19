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
- Written on 2026-09-28 with the view ([Turn 46](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)) and grown with the owner's two looks ([Turn 47](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-47), [Turn 49](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-49)): the first found a click that never pinned, which the suite had not noticed because it pinned through the handle, so the pinning cases click with the mouse now. The suite clears the browser's storage and resets the layout before each case, since positions and the theme are kept there.
- Since 2026-10-10 ([Turn 14 of the October 9 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-09/2026-10-09.1.record.md#turn-14)), over the board re-authored as the repository's delivery shape: the CLI shell left the board, so the wheel and drag cases take `scripts`; new cases keep the hollow drawing of imagined things, the declared door nothing uses with its stub and its panel, entering an imagined thing pinning it, and the count and list of what the join found wanting, the last over a copy of the bundle's data that the test hands the page with a connection to a door nothing serves, so that the bundle itself stays sound.
- Opening a file from board evidence must make that file the Local Map subject; the assertion reads the canonical shared snapshot after the transition. The board's own evidence-pinning semantics remain separate from Local Map file retention.
- Since 2026-11-12, after [an outsider's first visit](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md), cases hold the repairs it asked for. A piece's pinned panel says what the piece is and who it talks to, then the way inside, with its files folded behind their count; its close control stays in sight however far it scrolls; and it stands beside its piece, inside the view, folded and unfolded. The board's tools are icons, named, with their keys in their tooltips and their pressed state. Each piece is a keyboard stop in the board's order: Enter pins it and takes the keyboard into its panel, Escape brings it back, and a turn keeps the keyboard on it. The walkthrough ends where it began, and a wordless sign stands in the main area while the bundle loads. Each failed on the build of `99395eef`; the case that follows a file link now unfolds the files first. The run against the old build is in [the round's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/world-map-repairs/README.md).
- Since 2026-11-13, on the owner's report that looking straight down after a turn left the board askew and that turning the camera by right-drag had become very slow ([the session record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-2)), six cases hold the camera. After a free turn by drag, "look straight down" squares the board to the screen, judged on the edges of the board as the page draws them (`expectSquared`), and looking up returns to the turn. From a quarter turn, looking down and up goes where it always went. Dragged to straight above at another angle, the tool shows unpressed and squares the board where it stands, then looks up on an eighth turn. Six pointer moves between two frames are drawn once, and the frame has drawn the last move before the pointer lets go. On each board the moves of a turn, a pan and a wheel zoom lay the page out at most twice each, once when every label is read where it rests and once when the frame is drawn, counted by the browser's own layout count rather than timed; each count begins once every transition that ends has ended, since one ending, the view's entrance or a piece's fading, lays the page out once on its own clock. On the build of `eb680907` all but the quarter turn, a guard that held there too, failed: the edges at 37.8 degrees, the tool pressed above the askew board, six drawings for six moves, and 45 and 33 layouts a turn's move on the two boards.
- Since 2026-11-18, from the design system's check of the World Map ([Turn 14 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-14)), six cases hold its keyboard and its announcements. The letters act only while the keyboard is on the board, never with Ctrl, Meta or Alt held, and a press on an empty part of the board gives it the keyboard while a press on a tool keeps it there. A reset keeps what it discarded, and the same tool and key put it back until a piece is next moved by drag. Under reduced motion a turn, looking down and the walkthrough's turn have arrived one frame after they were asked for, with the tests' instant handle left off. The help button says whether the help is open and which panel it opens. The walkthrough says each step in the view's own status region. The toolbar is one Tab stop, with the arrows, Home and End inside it. Each failed on the build of `533dcbb0`; the run is in [the round's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/world-map-keyboard/README.md).

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
