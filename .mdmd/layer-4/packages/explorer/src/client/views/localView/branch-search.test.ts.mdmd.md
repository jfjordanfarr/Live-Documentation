# packages/explorer/src/client/views/localView/branch-search.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branch-search.test.ts
- Generated At: 2026-10-13T16:52:34.870Z

## Authored
### Purpose
Holds the search's judge (adoption strictly below the shown price, the patience, the cap, a last-seed adoption) and a card's rows measured once (the order the rows take, a pin's place from the rows above it, the fallbacks, the rounding).

### Notes
- Hand-made rows and prices, so that every number is checkable: a row named twice (LinkTarget and linkTarget share a name), a row with no outbound pin, an Internals row that answers for a symbol with no row.
- The judge's later tests (2026-10-07): a start priced equal to the shown picture but cheaper without churn is not adopted yet restarts the patience; a better start refused for its churn keeps the search going, and the next better one is adopted on its own account.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-restarts.StartCosts`](./branch-restarts.ts.mdmd.md#symbol-startcosts)
- [`branch-restarts.StartSignals`](./branch-restarts.ts.mdmd.md#symbol-startsignals)
- [`branch-restarts.scoreOf`](./branch-restarts.ts.mdmd.md#symbol-scoreof)
- [`branch-search.CardRows`](./branch-search.ts.mdmd.md#symbol-cardrows)
- [`branch-search.ResolvedPin`](./branch-search.ts.mdmd.md#symbol-resolvedpin)
- [`branch-search.beginSearch`](./branch-search.ts.mdmd.md#symbol-beginsearch)
- [`branch-search.endpointKey`](./branch-search.ts.mdmd.md#symbol-endpointkey)
- [`branch-search.judgeAlignment`](./branch-search.ts.mdmd.md#symbol-judgealignment)
- [`branch-search.judgeStart`](./branch-search.ts.mdmd.md#symbol-judgestart)
- [`branch-search.nextTrialKind`](./branch-search.ts.mdmd.md#symbol-nexttrialkind)
- [`branch-search.orderedRows`](./branch-search.ts.mdmd.md#symbol-orderedrows)
- [`branch-search.pinFor`](./branch-search.ts.mdmd.md#symbol-pinfor)
- [`branch-search.rowBounds`](./branch-search.ts.mdmd.md#symbol-rowbounds)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
