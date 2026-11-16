# tests/integration/programs/typescript/tidepool/src/tide.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/tide.ts
- Generated At: 2026-11-16T20:15:27.990Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TideState` {#symbol-tidestate}
- Type: interface
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/tide.ts#L2)

##### `TideState` — Summary
The water over the pool at one minute of the game: 0 is dry rock, 1 is high water.

#### `TIDE_PERIOD` {#symbol-tide_period}
- Type: const
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/tide.ts#L8)

##### `TIDE_PERIOD` — Summary
Minutes from one high water to the next.

#### `tideAt` {#symbol-tideat}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/tide.ts#L11)
- Returns: [`TideState`](#symbol-tidestate)

##### `tideAt` — Summary
The tide at a minute of play, a smooth rise and fall.

#### `isLowWater` {#symbol-islowwater}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/tide.ts#L18)
- Parameters: `tide`: [`TideState`](#symbol-tidestate)

##### `isLowWater` — Summary
True when the water is low enough for the player to reach the pool's floor.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/docs/tides.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/docs/tides.md)
<!-- LIVE-DOC:END Cited By -->
