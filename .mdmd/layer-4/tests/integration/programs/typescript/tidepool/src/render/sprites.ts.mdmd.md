# tests/integration/programs/typescript/tidepool/src/render/sprites.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/typescript/tidepool/src/render/sprites.ts
- Generated At: 2026-11-16T20:15:27.504Z

## Authored
### Purpose
Where each species sits on the sprite sheet, and the sheet itself, found on the page by its id.

### Notes
- Part of the tidepool sample, written on 2026-11-16 for the colour pass ([the sample's README](../../../../../../../../../tests/integration/programs/typescript/tidepool/README.md), [the record](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1)), at the owner's request to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" ([2026-11-15](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-11)). Names `sheet.png` only through the page: the DOM heuristic links it to `index.html`, and the page's `src` attribute connects the sheet. Code that named the image directly would not be recorded.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Frame` {#symbol-frame}
- Type: interface
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/render/sprites.ts#L4)

##### `Frame` — Summary
Where a creature sits on the sprite sheet: sixteen-pixel cells, one row.

#### `frameFor` {#symbol-framefor}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/render/sprites.ts#L12)
- Returns: [`Frame`](#symbol-frame)
- Parameters: `species`: [`Species`](../creatures.ts.mdmd.md#symbol-species)

#### `spriteSheet` {#symbol-spritesheet}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/typescript/tidepool/src/render/sprites.ts#L17)
- Returns: `HTMLImageElement`

##### `spriteSheet` — Summary
The sprite sheet the page loads, `sheet.png` beside this file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.sprite-sheet`](../../index.html.mdmd.md#symbol-sprite-sheet)
- [`creatures.Species`](../creatures.ts.mdmd.md#symbol-species) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`tests/integration/programs/typescript/tidepool/docs/creatures.md`](../../../../../../../../../tests/integration/programs/typescript/tidepool/docs/creatures.md)
- [`tests/integration/programs/typescript/tidepool/docs/design.md`](../../../../../../../../../tests/integration/programs/typescript/tidepool/docs/design.md)
<!-- LIVE-DOC:END Cited By -->
