# tests/integration/programs/typescript/tidepool/src/audio/sounds.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/audio/sounds.ts
- Generated At: 2026-11-16T20:15:25.707Z

## Authored
### Purpose
Plays the game's two cues and sets the looping surf and gulls, through the audio elements of the page.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-11)). Finds the audio elements by id, which the DOM heuristic links to `index.html`; the page's `src` attributes connect the sounds. Its authored words in the sample's own mirror link to `SOUNDS.md`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Cue` {#symbol-cue}
- Type: type
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/audio/sounds.ts#L4)

#### `playCue` {#symbol-playcue}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/audio/sounds.ts#L7)
- Parameters: `cue`: [`Cue`](#symbol-cue)

##### `playCue` — Summary
Plays a short cue from the audio elements the page carries.

#### `setAmbience` {#symbol-setambience}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/audio/sounds.ts#L16)
- Parameters: `tide`: [`TideState`](../tide.ts.mdmd.md#symbol-tidestate)

##### `setAmbience` — Summary
Sets the looping surf and gulls to suit the tide.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.ambient-gulls`](../../index.html.mdmd.md#symbol-ambient-gulls)
- [`index.ambient-surf`](../../index.html.mdmd.md#symbol-ambient-surf)
- [`index.cue-chime`](../../index.html.mdmd.md#symbol-cue-chime)
- [`index.cue-splash`](../../index.html.mdmd.md#symbol-cue-splash)
- [`mixer.gullVolume`](./mixer.ts.mdmd.md#symbol-gullvolume)
- [`mixer.surfVolume`](./mixer.ts.mdmd.md#symbol-surfvolume)
- [`tide.TideState`](../tide.ts.mdmd.md#symbol-tidestate) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/src/audio/SOUNDS.md`](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/audio/SOUNDS.md)
<!-- LIVE-DOC:END Cited By -->
