# tests/integration/programs/typescript/tidepool/src/creatures.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/creatures.ts
- Generated At: 2026-11-16T20:15:25.813Z

## Authored
### Purpose
The four species, crab, anemone, shrimp and starfish, and a creature's life minute by minute: where it spawns, how far it wanders with the tide, and how feeding settles its hunger.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-11)). Uses the random source and the tide and is used by the pool and the sprites; its authored words in the sample's own mirror link to `docs/creatures.md`, for Show Related Docs.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Species` {#symbol-species}
- Type: type
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/creatures.ts#L4)

#### `Creature` {#symbol-creature}
- Type: interface
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/creatures.ts#L6)

#### `spawnCreature` {#symbol-spawncreature}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/creatures.ts#L19)
- Returns: [`Creature`](#symbol-creature)
- Parameters: `rng`: [`Rng`](./rng.ts.mdmd.md#symbol-rng); `species`: [`Species`](#symbol-species)

##### `spawnCreature` — Summary
A new creature somewhere in a pool of the given size.

#### `moveCreature` {#symbol-movecreature}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/creatures.ts#L24)
- Returns: [`Creature`](#symbol-creature)
- Parameters: `creature`: [`Creature`](#symbol-creature); `tide`: [`TideState`](./tide.ts.mdmd.md#symbol-tidestate); `rng`: [`Rng`](./rng.ts.mdmd.md#symbol-rng)

##### `moveCreature` — Summary
One minute of a creature's life: it wanders more when the tide covers it, and grows hungrier.

#### `feed` {#symbol-feed}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/creatures.ts#L35)
- Returns: [`Creature`](#symbol-creature)
- Parameters: `creature`: [`Creature`](#symbol-creature)

##### `feed` — Summary
Feeding settles a creature's hunger.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Rng`](./rng.ts.mdmd.md#symbol-rng)
- [`rng.between`](./rng.ts.mdmd.md#symbol-between)
- [`tide.TideState`](./tide.ts.mdmd.md#symbol-tidestate) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/docs/creatures.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/docs/creatures.md)
- [`tests/integration/programs/typescript/tidepool/docs/tides.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/docs/tides.md)
<!-- LIVE-DOC:END Cited By -->
