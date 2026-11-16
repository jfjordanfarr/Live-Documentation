# tests/integration/programs/typescript/tidepool/src/main.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/main.ts
- Generated At: 2026-11-16T20:15:26.160Z

## Authored
### Purpose
Starts the game on the page: finds the canvas, binds the keys, plays the cues, and redraws the pool and the score twice a second.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-11)). The page's script, named by `index.html`; it reaches the page's elements by id, which the DOM heuristic links back to the page.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.pool`](../index.html.mdmd.md#symbol-pool)
- [`index.score`](../index.html.mdmd.md#symbol-score)
- [`sounds.playCue`](./audio/sounds.ts.mdmd.md#symbol-playcue)
- [`sounds.setAmbience`](./audio/sounds.ts.mdmd.md#symbol-setambience)
- [`Game`](./game.ts.mdmd.md#symbol-game)
- [`input.bindInput`](./input.ts.mdmd.md#symbol-bindinput)
- [`canvas.drawPool`](./render/canvas.ts.mdmd.md#symbol-drawpool)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/docs/design.md`](../../../../../../../../tests/integration/programs/typescript/tidepool/docs/design.md)
<!-- LIVE-DOC:END Cited By -->
