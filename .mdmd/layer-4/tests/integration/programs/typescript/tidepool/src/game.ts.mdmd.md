# `tests/integration/programs/typescript/tidepool/src/game.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/typescript/tidepool/src/game.ts`
- Generated At: 2026-11-22T07:13:00.650Z

## Authored
### Purpose
One game: the pool, the player's hand above it and the clock; it carries out commands, refusing to feed except at low water, and keeps the score.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-11)). The middle of the sample's imports; its authored words in the sample's own mirror link to two documents, for Show Related Docs, and two documents link to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Game` {#symbol-game}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/game.ts#L8)

##### `Game` — Summary
One game: a pool, the player's hand above it, and the clock.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`input.Command`](./input.ts.mdmd.md#symbol-command) (type-only)
- [`Pool`](./pool.ts.mdmd.md#symbol-pool) (type-only)
- [`pool.loadPool`](./pool.ts.mdmd.md#symbol-loadpool)
- [`rng.createRng`](./rng.ts.mdmd.md#symbol-createrng)
- [`score.scorePool`](./score.ts.mdmd.md#symbol-scorepool)
- [`tide.isLowWater`](./tide.ts.mdmd.md#symbol-islowwater)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/docs/design.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/docs/design.md)
- [`tests/integration/programs/typescript/tidepool/docs/tides.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/docs/tides.md)
<!-- LIVE-DOC:END Cited By -->
