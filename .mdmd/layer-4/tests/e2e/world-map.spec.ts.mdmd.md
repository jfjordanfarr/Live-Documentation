# tests/e2e/world-map.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/world-map.spec.ts
- Generated At: 2026-09-28T23:04:10.869Z

## Authored
### Purpose
Keeps what the World Map draws of this repository's board and what a person can do on it, through the handle at `window.__worldMap` rather than pixels: the things, regions and wires drawn; a thing's facts on hover and pinned on click; how a wire is known; a click on a thing pinning it with its files linked to the Local Map; a name in the pinned panel pinning what it names and a click on the board letting go; the orbit's directions; a moved thing kept and written into the board text, surviving a reload; a turn and a look down changing nothing's size; a thing opened into the Membrane Map from its pinned panel, by the wheel and by a double-click, with the crumb leading back; and a thing dragged with the pointer.

### Notes
- Written on 2026-09-28 with the view ([Turn 46](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-46)) and grown with the owner's two looks ([Turn 47](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-47), [Turn 49](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-49)): the first found a click that never pinned, which the suite had not noticed because it pinned through the handle, so the pinning cases click with the mouse now. The suite clears the browser's storage and resets the layout before each case, since positions and the theme are kept there.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
<!-- LIVE-DOC:END Dependencies -->
