# packages/explorer/src/client/views/localView/ladder-rooms.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/ladder-rooms.test.ts
- Generated At: 2026-11-15T23:13:51.389Z

## Authored
### Purpose

Vitest cases for the card ladder's room sums: a name's fill of its row about the row's top, a wrapped name read in either band, a dot's room to its card's border on its side, a shifted and scaled dot's layout top, and the count of shown rows above the first pinned one.

### Notes

Written with the module in the far bands' round (2026-11-06, [Turn 3](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-06.1.record.md#turn-3)). The numbers are the review's cards: a 66 px two-line slot row whose name begins 2.5 px down and is 12 px tall, and a 284 px card whose 14 px dots stand 14 px in from each border, which may therefore grow to twice their size. The cases also hold the edges: a row that cannot hold a larger name, sub-pixel noise in a name that just fits, a dot with no room, boxes that cannot be measured, rows hidden by the branch picture, and a card with no pin.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
- [`ladder-rooms.HEAD_SPACE`](./ladder-rooms.ts.mdmd.md#symbol-head_space)
- [`ladder-rooms.HIGHLIGHT_BELOW`](./ladder-rooms.ts.mdmd.md#symbol-highlight_below)
- [`ladder-rooms.NAME_LINE`](./ladder-rooms.ts.mdmd.md#symbol-name_line)
- [`ladder-rooms.ROW_MORE`](./ladder-rooms.ts.mdmd.md#symbol-row_more)
- [`ladder-rooms.dotRoom`](./ladder-rooms.ts.mdmd.md#symbol-dotroom)
- [`ladder-rooms.evenRows`](./ladder-rooms.ts.mdmd.md#symbol-evenrows)
- [`ladder-rooms.fitLines`](./ladder-rooms.ts.mdmd.md#symbol-fitlines)
- [`ladder-rooms.footHold`](./ladder-rooms.ts.mdmd.md#symbol-foothold)
- [`ladder-rooms.headHeight`](./ladder-rooms.ts.mdmd.md#symbol-headheight)
- [`ladder-rooms.layoutTopOf`](./ladder-rooms.ts.mdmd.md#symbol-layouttopof)
- [`ladder-rooms.linesOf`](./ladder-rooms.ts.mdmd.md#symbol-linesof)
- [`ladder-rooms.nameFill`](./ladder-rooms.ts.mdmd.md#symbol-namefill)
- [`ladder-rooms.nameLinesHeld`](./ladder-rooms.ts.mdmd.md#symbol-namelinesheld)
- [`ladder-rooms.nameWraps`](./ladder-rooms.ts.mdmd.md#symbol-namewraps)
- [`ladder-rooms.pinDepth`](./ladder-rooms.ts.mdmd.md#symbol-pindepth)
- [`ladder-rooms.rowsBeforeFirstPin`](./ladder-rooms.ts.mdmd.md#symbol-rowsbeforefirstpin)
- [`ladder-rooms.shortRowHeight`](./ladder-rooms.ts.mdmd.md#symbol-shortrowheight)
- [`ladder-steps.LOOK_SCALES`](./ladder-steps.ts.mdmd.md#symbol-look_scales)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
