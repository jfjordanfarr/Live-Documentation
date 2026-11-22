# `tests/e2e/closed-directory-looks.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/closed-directory-looks.spec.ts`
- Generated At: 2026-11-22T07:12:58.378Z

## Authored
### Purpose
Current. Protects a closed directory's looks in the browser, under this machine's font lines and Segoe UI's line metrics. Each look and each of the skin's shapes draws, and every box and card stands exactly where the plain box keeps them. Open works by pointer and by keyboard, More stands on the name's line, and a link carries a choice only when it is not the default (the skin with cells, the folder's tab, the kinds' colours). A directory inside is a skin around cells of the one size; a cell takes its file's kind's colour and says its file's name on hover, a veiled cell says nothing, and a press on a cell opens the box. A stack's cards never reach a neighbour. In the far looks the box's name is held, the skin holds its cells at the look's scale, and a folder is drawn plain.

### Notes
Written on 2026-11-13 after the looks were judged by eye ([Turn 7 of the November 13 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-7); [the pictures](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/Screenshots/closed-directory-looks/README.md)). Layout is compared as each box's and card's place inside the picture, in the map's own units. Rewritten on 2026-11-15 for the cells as the default and the three shapes ([Turn 1](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)), and on 2026-11-16 for the owner's choice of the kinds' colours ([Turn 8](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-8)), the tab as the reading look's alone, and a cell's own file's name as its hover text ([Turn 10](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-10)).

**The far looks read on two named families since 2026-11-17** ([the third run of the gate, November 16 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#the-third-run-of-the-gate)). The case of the held name and the cells' row read `scripts/layout-lab` and stated that under this machine's lines every name of `scripts` holds one line, so the row is drawn. On 2026-11-16 `scripts/contact-sheet` joined that family; its name takes two lines, and by the rule that the row is drawn in every sibling or in none, `scripts` draws no cells at the far looks under either lines. The picture is as the rule makes it; the case's sentence about `scripts` was no longer true. It now reads one box of each of two families and says which it expects: `scripts`, without the row, and the client's directories (`packages/explorer/src/client`), whose names each hold a line and which draw it, so that the size of the held cells is still read. A name broken at its seams onto two lines is read as the whole name. Measured the same day on seven families of this repository and the estate, three presses out: the row is drawn in two, the scan root's and the client's.

Since 2026-11-18, when marbles became the default ([Turn 13 of the November 17 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-13)), the case on a cell's kind's colour reads the cells with the marbles off: a marble's cell is its kind's glass tinted by its own veins, so only a plain cell is the kind's colour itself.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Browser`, `Page`, `expect`, `test`
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`types.CLOSED_DIRECTORY_LOOKS`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-closed_directory_looks)
- [`types.CLOSED_DIRECTORY_SHAPES`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-closed_directory_shapes)
- [`types.ClosedCellColour`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-closedcellcolour) (type-only)
- [`types.ClosedDirectoryLook`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-closeddirectorylook) (type-only)
- [`types.ClosedDirectoryShape`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-closeddirectoryshape) (type-only)
- [`types.MarbleChoice`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-marblechoice) (type-only)
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
