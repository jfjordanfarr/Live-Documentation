# tests/integration/programs/typescript/tidepool/index.html

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/index.html
- Generated At: 2026-11-16T20:15:25.252Z

## Authored
### Purpose
The game's page: the canvas the pool is painted on, the score, the help list, the hidden sprite sheet, the four audio elements and the script that starts the game.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-11)). One of the two ways an asset becomes connected in this sample: the generator records an HTML attribute (`src`, `href`) as a use, so the logo, the crab, the sprite sheet, the favicon and all four sounds are reached from here; the stylesheet connects the rest. `sounds.ts` and `sprites.ts` find their elements by id, which the DOM heuristic links back to this page. One of three implementation files at the sample's root.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ambient-gulls` {#symbol-ambient-gulls}
- Type: variable

#### `ambient-surf` {#symbol-ambient-surf}
- Type: variable

#### `cue-chime` {#symbol-cue-chime}
- Type: variable

#### `cue-splash` {#symbol-cue-splash}
- Type: variable

#### `pool` {#symbol-pool}
- Type: variable

#### `score` {#symbol-score}
- Type: variable

#### `sprite-sheet` {#symbol-sprite-sheet}
- Type: variable
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`crab`](./assets/images/crab.gif.mdmd.md)
- [`favicon`](./assets/images/favicon.ico.mdmd.md)
- [`logo`](./assets/images/logo.png.mdmd.md)
- [`gulls`](./assets/sounds/gulls.wav.mdmd.md)
- [`surf`](./assets/sounds/surf.wav.mdmd.md)
- [`chime`](./src/audio/chime.wav.mdmd.md)
- [`splash`](./src/audio/splash.wav.mdmd.md)
- [`main`](./src/main.ts.mdmd.md)
- [`sheet`](./src/render/sheet.png.mdmd.md)
- [`main`](./styles/main.css.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/README.md`](../../../../../../../tests/integration/programs/typescript/tidepool/README.md)
- [`tests/integration/programs/typescript/tidepool/docs/design.md`](../../../../../../../tests/integration/programs/typescript/tidepool/docs/design.md)
<!-- LIVE-DOC:END Cited By -->
