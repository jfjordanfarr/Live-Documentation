# packages/engine/src/live-docs/board.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/board.test.ts
- Generated At: 2026-09-28T21:15:51.080Z

## Authored
### Purpose
Keeps the board grammar honest: one board with every section filled renders and parses back byte for byte, an empty board says so and leaves its optional sections out, seven malformed texts are refused with the message a person would need, and one faulty board draws every lint message in order.

### Notes
- The refusal cases build their text by where the fragment belongs (under a thing, in place of the Things section, in Connections, Legend or Layout), so a new refusal is one row in the table and, when it belongs somewhere new, one branch in the builder. Unit scope: the grammar and lint; the join is measured in `boardGraph.test.ts` and the real boards in `tests/integration/live-docs/board.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Board`](./board.ts.mdmd.md#symbol-board)
- [`board.DEFAULT_LEGEND`](./board.ts.mdmd.md#symbol-default_legend)
- [`board.legendFor`](./board.ts.mdmd.md#symbol-legendfor)
- [`board.lintBoard`](./board.ts.mdmd.md#symbol-lintboard)
- [`board.parseBoard`](./board.ts.mdmd.md#symbol-parseboard)
- [`board.renderBoard`](./board.ts.mdmd.md#symbol-renderboard)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
