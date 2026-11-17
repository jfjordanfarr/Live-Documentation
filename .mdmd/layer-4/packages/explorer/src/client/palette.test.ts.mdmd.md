# packages/explorer/src/client/palette.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/palette.test.ts
- Generated At: 2026-11-16T20:45:28.798Z

## Authored
### Purpose
Holds the palette to its shape (opaque colours, one custom property per meaning), proves that today's palette yields the strings, shader constants and tints the Explorer drew before, and keeps every colour inside the palette: no hex, colour function, named colour or `0x` colour anywhere else in the client's source but the tests.

### Notes
Written with the palette in the [November 16 colour pass](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1). The scan of the client's source was seen to fail on a planted hex in a script and a planted named colour in a stylesheet before it was trusted; its own cases show what it finds and what it leaves (a `white-space` property, a variable named `white`, a `grey` setting).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path`
- [`palette.DEFAULT_PALETTE`](./palette.ts.mdmd.md#symbol-default_palette)
- [`palette.PALETTES`](./palette.ts.mdmd.md#symbol-palettes)
- [`palette.TODAY`](./palette.ts.mdmd.md#symbol-today)
- [`palette.activePalette`](./palette.ts.mdmd.md#symbol-activepalette)
- [`palette.channels`](./palette.ts.mdmd.md#symbol-channels)
- [`palette.choosePalette`](./palette.ts.mdmd.md#symbol-choosepalette)
- [`palette.customProperties`](./palette.ts.mdmd.md#symbol-customproperties)
- [`palette.isPaletteName`](./palette.ts.mdmd.md#symbol-ispalettename)
- [`palette.mix`](./palette.ts.mdmd.md#symbol-mix)
- [`palette.paletteStylesheet`](./palette.ts.mdmd.md#symbol-palettestylesheet)
- [`palette.rgba`](./palette.ts.mdmd.md#symbol-rgba)
- [`palette.unitChannels`](./palette.ts.mdmd.md#symbol-unitchannels)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
