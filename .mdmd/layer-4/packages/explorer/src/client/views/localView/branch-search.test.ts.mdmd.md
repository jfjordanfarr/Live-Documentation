# packages/explorer/src/client/views/localView/branch-search.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branch-search.test.ts
- Generated At: 2026-10-07T13:20:47.609Z

## Authored
### Purpose
Holds the search's judge (adoption strictly below the shown price, the patience, the cap, a last-seed adoption) and a card's rows measured once (the order the rows take, a pin's place from the rows above it, the fallbacks, the rounding).

### Notes
- Hand-made rows and prices, so that every number is checkable: a row named twice (LinkTarget and linkTarget share a name), a row with no outbound pin, an Internals row that answers for a symbol with no row.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-search.CardRows`](./branch-search.ts.mdmd.md#symbol-cardrows)
- [`branch-search.beginSearch`](./branch-search.ts.mdmd.md#symbol-beginsearch)
- [`branch-search.judgeStart`](./branch-search.ts.mdmd.md#symbol-judgestart)
- [`branch-search.orderedRows`](./branch-search.ts.mdmd.md#symbol-orderedrows)
- [`branch-search.pinFor`](./branch-search.ts.mdmd.md#symbol-pinfor)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
