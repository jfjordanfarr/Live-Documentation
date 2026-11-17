# packages/explorer/src/client/palette.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/palette.test.ts
- Generated At: 2026-11-17T01:03:02.471Z

## Authored
### Purpose
Holds the palette to its shape (opaque colours, one custom property per meaning), proves that today's palette yields the strings, shader constants and tints the Explorer drew before, and keeps every colour inside the palette: no hex, colour function, named colour or `0x` colour anywhere else in the client's source but the tests.

### Notes
Written with the palette in the [November 16 colour pass](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1). The scan of the client's source was seen to fail on a planted hex in a script and a planted named colour in a stylesheet before it was trusted; its own cases show what it finds and what it leaves (a `white-space` property, a variable named `white`, a `grey` setting).

Since [Turns 4 and 5 of the November 16 record](../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-4) it also holds a palette to what makes one valid (identities 15 apart in OKLab x100 and 8 under simulated protanopia and deuteranopia, marks at 3:1 on their grounds, words at 4.5:1 on a card), which `proposed` passes and Today does not, said as a fact rather than skipped; and it hears the palette change only when another comes into force.

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
- [`palette.PROPOSED`](./palette.ts.mdmd.md#symbol-proposed)
- [`Palette`](./palette.ts.mdmd.md#symbol-palette)
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
- [`palette.whenPaletteChanges`](./palette.ts.mdmd.md#symbol-whenpalettechanges)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
