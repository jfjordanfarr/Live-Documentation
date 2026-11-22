# `packages/explorer/src/client/views/localView/cycle-order.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/localView/cycle-order.test.ts`
- Generated At: 2026-11-22T07:12:55.824Z

## Authored
### Purpose
Holds the cycle order's price and searches to their claims: the exact search against every order on generated cycles, today's returns kept where today's order is already the cheapest, and the large cycle's path ending where no single move lowers the price.

### Notes
Written with [cycle-order.ts](cycle-order.ts.mdmd.md) on 2026-11-16 ([Turn 5 of the November 15 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-5)). The generated cycles are seeded rings with random chords, so every run draws the same ones; the cases of the ranking itself, two files that use each other unequally, a ring of three, a tie and its tipping, and order independence, are in [branches.test.ts](branches.test.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`cycle-order.CycleWeights`](./cycle-order.ts.mdmd.md#symbol-cycleweights) (type-only)
- [`cycle-order.EXACT_LIMIT`](./cycle-order.ts.mdmd.md#symbol-exact_limit)
- [`cycle-order.comparePrices`](./cycle-order.ts.mdmd.md#symbol-compareprices)
- [`cycle-order.exactOrder`](./cycle-order.ts.mdmd.md#symbol-exactorder)
- [`cycle-order.fewestReturnsOrder`](./cycle-order.ts.mdmd.md#symbol-fewestreturnsorder)
- [`cycle-order.greedyOrder`](./cycle-order.ts.mdmd.md#symbol-greedyorder)
- [`cycle-order.improvedOrder`](./cycle-order.ts.mdmd.md#symbol-improvedorder)
- [`cycle-order.priceOf`](./cycle-order.ts.mdmd.md#symbol-priceof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
