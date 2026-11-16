# tests/integration/programs/typescript/tidepool/src/rng.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/rng.ts
- Generated At: 2026-11-16T20:15:27.784Z

## Authored
### Purpose
The seeded random source: one small generator, so that a game started from the same seed plays the same way, and a helper for whole numbers in a range.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-11)). The most used file of the sample, imported by the creatures, the pool, the game and the tests, and the one file of `src` whose test sits beside it (`rng.test.ts`), which makes `src` nearly, not wholly, implementation.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Rng` {#symbol-rng}
- Type: type
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/rng.ts#L2)

##### `Rng` — Summary
A seeded random source, so that a pool started from the same seed plays the same way.

#### `createRng` {#symbol-createrng}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/rng.ts#L5)
- Returns: [`Rng`](#symbol-rng)

##### `createRng` — Summary
Mulberry32: small, fast and good enough for a game.

#### `between` {#symbol-between}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/rng.ts#L17)
- Parameters: `rng`: [`Rng`](#symbol-rng)

##### `between` — Summary
A whole number from `low` to `high`, both included.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/README.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md)
- [`tests/integration/programs/typescript/tidepool/docs/design.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/docs/design.md)
<!-- LIVE-DOC:END Cited By -->
