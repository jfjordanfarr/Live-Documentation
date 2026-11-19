# `tests/integration/programs/typescript/tidepool/src/audio/mixer.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/typescript/tidepool/src/audio/mixer.ts`
- Generated At: 2026-11-19T21:10:28.710Z

## Authored
### Purpose
Sets the background sound from the tide: the surf louder as the water rises, the gulls louder as it falls.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-11)). One of the two implementation files of `src/audio`, a directory of code beside its sounds and a document.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `surfVolume` {#symbol-surfvolume}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/audio/mixer.ts#L4)
- Parameters: `tide`: [`TideState`](../tide.ts.mdmd.md#symbol-tidestate)

##### `surfVolume` — Summary
The surf grows louder as the water rises.

#### `gullVolume` {#symbol-gullvolume}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/audio/mixer.ts#L9)
- Parameters: `tide`: [`TideState`](../tide.ts.mdmd.md#symbol-tidestate)

##### `gullVolume` — Summary
The gulls call louder while the water falls and the rocks come out.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`tide.TideState`](../tide.ts.mdmd.md#symbol-tidestate) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/docs/tides.md`](../../../../../../../../../tests/integration/programs/typescript/tidepool/docs/tides.md)
- [`tests/integration/programs/typescript/tidepool/src/audio/SOUNDS.md`](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/audio/SOUNDS.md)
<!-- LIVE-DOC:END Cited By -->
