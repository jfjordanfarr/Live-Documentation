# tests/integration/programs/typescript/tidepool/src/creatures.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/creatures.ts
- Generated At: 2026-11-16T20:15:25.813Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

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
