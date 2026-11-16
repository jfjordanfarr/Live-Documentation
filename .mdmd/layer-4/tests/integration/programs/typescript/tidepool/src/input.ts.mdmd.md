# tests/integration/programs/typescript/tidepool/src/input.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/input.ts
- Generated At: 2026-11-16T20:15:25.944Z

## Authored
### Purpose
Turns the player's keys into commands: the arrows move the hand, the space bar feeds, P pauses.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-11)). An implementation file of `src`, used by the game and `main.ts` and tested from `tests/`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Command` {#symbol-command}
- Type: type
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/input.ts#L2)

##### `Command` — Summary
What the player can ask of the game.

#### `readCommand` {#symbol-readcommand}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/input.ts#L17)
- Returns: [`Command`](#symbol-command)

##### `readCommand` — Summary
The command a key stands for, if any.

#### `bindInput` {#symbol-bindinput}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/tidepool/src/input.ts#L22)
- Parameters: `command`: [`Command`](#symbol-command)

##### `bindInput` — Summary
Calls back with a command for every key the player presses that means one.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
