# `tests/integration/programs/typescript/tidepool/tests/helpers.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/programs/typescript/tidepool/tests/helpers.ts`
- Generated At: 2026-11-19T21:10:28.947Z

## Authored
### Purpose
A small empty level and an empty pool from a fixed seed, shared by the tests.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-11)). A test by its folder, not its name: the generator calls every file under a sample's `tests/` a test, so this helper adds to the directory's mostly-tests mix.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TEST_LEVEL` {#symbol-test_level}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/tests/helpers.ts#L5)
- Returns: [`Level`](../src/pool.ts.mdmd.md#symbol-level)

##### `TEST_LEVEL` — Summary
A small empty level for tests, five cells square.

#### `emptyPool` {#symbol-emptypool}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/tests/helpers.ts#L8)
- Returns: [`Pool`](../src/pool.ts.mdmd.md#symbol-pool)

##### `emptyPool` — Summary
An empty pool on the test level, from a fixed seed.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pool.Level`](../src/pool.ts.mdmd.md#symbol-level)
- [`Pool`](../src/pool.ts.mdmd.md#symbol-pool)
- [`rng.createRng`](../src/rng.ts.mdmd.md#symbol-createrng)
<!-- LIVE-DOC:END Dependencies -->
