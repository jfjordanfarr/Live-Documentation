# `tests/integration/programs/typescript/tidepool/src/score.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/typescript/tidepool/src/score.ts`
- Generated At: 2026-11-19T21:10:28.894Z

## Authored
### Purpose
Counts the points: ten for each creature, less its hunger, and the best of a run of scores.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-11)). An implementation file of `src` with a test in `tests/`; `docs/creatures.md` links to it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `scorePool` {#symbol-scorepool}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/score.ts#L4)
- Parameters: `pool`: [`Pool`](./pool.ts.mdmd.md#symbol-pool)

##### `scorePool` — Summary
Ten points for every creature at peace, less one for each step of hunger.

#### `bestScore` {#symbol-bestscore}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/score.ts#L9)

##### `bestScore` — Summary
The best of a run of scores, or zero before any game is played.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Pool`](./pool.ts.mdmd.md#symbol-pool) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/docs/creatures.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/docs/creatures.md)
<!-- LIVE-DOC:END Cited By -->
