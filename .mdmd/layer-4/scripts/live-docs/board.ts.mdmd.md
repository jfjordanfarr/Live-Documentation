# scripts/live-docs/board.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/board.ts
- Generated At: 2026-10-08T19:04:57.655Z

## Authored
### Purpose
The command `npm run live-docs:board -- <board.md>`: reads a board, refuses a fault in its text or its names, joins it to the workspace's graph read from the docs, and prints what the World Map would draw: each thing with its folder, files, doors and what it stands on; each wire with its door, technology, basis and count; and what the join found wanting. A fault in the board exits 1; a `From` with no docs or a door nothing serves is printed and exits 0, because a board may name what is not beside it.

### Notes
- Written on 2026-09-28 with the grammar ([Turn 45](../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-45)) as the headless peer of the World Map, under the rule that whatever a person can learn by clicking they can learn by a command. It reads the graph through `readLiveDocGraph`, so it knows what the docs know and nothing more.
- The report is the join the Explorer draws, `deriveBoardGraph`, printed; a difference between the two is a bug in one of them. The design is [Boards](../../../layer-3/boards.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:path` - `path`
- `node:process` - `process`
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`board.lintBoard`](../../packages/engine/src/live-docs/board.ts.mdmd.md#symbol-lintboard)
- [`board.parseBoard`](../../packages/engine/src/live-docs/board.ts.mdmd.md#symbol-parseboard)
- [`BoardGraph`](../../packages/engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-boardgraph)
- [`boardGraph.deriveBoardGraph`](../../packages/engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-deriveboardgraph)
- [`document.LiveDocSyntaxError`](../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-livedocsyntaxerror)
- [`graphFiles.readLiveDocGraph`](../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
<!-- LIVE-DOC:END Dependencies -->
