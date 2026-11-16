# tests/integration/programs/typescript/tidepool/src/pool.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/pool.ts
- Generated At: 2026-11-16T20:15:26.391Z

## Authored
### Purpose
The pool and everything living in it: the level it was stocked from, the creatures, the tide, feeding at a cell and stepping a minute.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-11)). The sample's chosen file to pin: it has uses on one side (the levels, the creatures, the tide, the random source) and offerings on the other (the game, the score, the canvas, the test helper), and two test files import it, so its card carries the 'has tests' mark.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Level` {#symbol-level}
- Type: interface
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/pool.ts#L8)

##### `Level` — Summary
A level as its JSON file describes it.

#### `LEVELS` {#symbol-levels}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/pool.ts#L15)

#### `Pool` {#symbol-pool}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/pool.ts#L18)

##### `Pool` — Summary
The pool and everything living in it.

#### `loadPool` {#symbol-loadpool}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/pool.ts#L47)
- Returns: [`Pool`](#symbol-pool)
- Parameters: `rng`: [`Rng`](./rng.ts.mdmd.md#symbol-rng)

##### `loadPool` — Summary
A pool stocked as its level asks.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`harbour`](../levels/harbour.json.mdmd.md)
- [`rockpool`](../levels/rockpool.json.mdmd.md)
- [`creatures.Creature`](./creatures.ts.mdmd.md#symbol-creature)
- [`creatures.Species`](./creatures.ts.mdmd.md#symbol-species)
- [`creatures.feed`](./creatures.ts.mdmd.md#symbol-feed)
- [`creatures.moveCreature`](./creatures.ts.mdmd.md#symbol-movecreature)
- [`creatures.spawnCreature`](./creatures.ts.mdmd.md#symbol-spawncreature)
- [`Rng`](./rng.ts.mdmd.md#symbol-rng) (type-only)
- [`tide.TideState`](./tide.ts.mdmd.md#symbol-tidestate)
- [`tide.tideAt`](./tide.ts.mdmd.md#symbol-tideat)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/docs/design.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/docs/design.md)
<!-- LIVE-DOC:END Cited By -->
