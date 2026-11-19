# packages/explorer/src/client/palette.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/palette.test.ts
- Generated At: 2026-11-19T04:29:43.941Z

## Authored
### Purpose
Holds the palette to its shape (opaque colours, one custom property per meaning), proves that today's palette yields the strings, shader constants and tints the Explorer drew before, and keeps every colour inside the palette: no hex, colour function, named colour or `0x` colour anywhere else in the client's source but the tests.

### Notes
Written with the palette in the [November 16 colour pass](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-1). The scan of the client's source was seen to fail on a planted hex in a script and a planted named colour in a stylesheet before it was trusted; its own cases show what it finds and what it leaves (a `white-space` property, a variable named `white`, a `grey` setting).

Since [Turns 4 and 5 of the November 16 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-4) it also holds a palette to what makes one valid (identities 15 apart in OKLab x100 and 8 under simulated protanopia and deuteranopia, marks at 3:1 on their grounds, words at 4.5:1 on a card), which `proposed` passes and Today does not, said as a fact rather than skipped; and it hears the palette change only when another comes into force.

Since 2026-11-19 ([Turn 14 of the November 18 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-14)) Today's excuse is exact: `shortfalls(TODAY)` must equal its nine identity distances, the owner's palette fork, and nothing else. Its words are therefore held at 4.5:1 on a card like the other palettes'. The case failed on the palette as it was, naming `muted` at 4.42, `subtle` at 3.50 and `panelSubtle` at 3.34. The same day "the disabled tone" was added: `text.disabled` may colour only a selector of a disabled control (`:disabled`, `[disabled]`, `[aria-disabled="true"]`), and no script may read it. It found the five uses the audit named (the section labels, the search's placeholder, hint, clear glyph and "Nothing found") before they moved to passing tones.

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
- [`palette.VIVID_KINDS`](./palette.ts.mdmd.md#symbol-vivid_kinds)
- [`palette.activePalette`](./palette.ts.mdmd.md#symbol-activepalette)
- [`palette.channels`](./palette.ts.mdmd.md#symbol-channels)
- [`palette.chooseMarbles`](./palette.ts.mdmd.md#symbol-choosemarbles)
- [`palette.choosePalette`](./palette.ts.mdmd.md#symbol-choosepalette)
- [`palette.customProperties`](./palette.ts.mdmd.md#symbol-customproperties)
- [`palette.isPaletteName`](./palette.ts.mdmd.md#symbol-ispalettename)
- [`palette.marblesDrawn`](./palette.ts.mdmd.md#symbol-marblesdrawn)
- [`palette.mix`](./palette.ts.mdmd.md#symbol-mix)
- [`palette.paletteStylesheet`](./palette.ts.mdmd.md#symbol-palettestylesheet)
- [`palette.rgba`](./palette.ts.mdmd.md#symbol-rgba)
- [`palette.unitChannels`](./palette.ts.mdmd.md#symbol-unitchannels)
- [`palette.whenPaletteChanges`](./palette.ts.mdmd.md#symbol-whenpalettechanges)
- [`forceGraphAppearance.MARBLE_COLOUR`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marble_colour)
- [`forceGraphAppearance.MARBLE_FRAGMENT_PARS`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marble_fragment_pars)
- [`forceGraphAppearance.MARBLE_SHINE`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marble_shine)
- [`forceGraphAppearance.MARBLE_VEINS`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marble_veins)
- [`forceGraphAppearance.MARBLE_VERTEX`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marble_vertex)
- [`forceGraphAppearance.MARBLE_VERTEX_PARS`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marble_vertex_pars)
- [`forceGraphAppearance.SpatialKind`](./views/forceGraphAppearance.ts.mdmd.md#symbol-spatialkind)
- [`forceGraphAppearance.fileShares`](./views/forceGraphAppearance.ts.mdmd.md#symbol-fileshares)
- [`forceGraphAppearance.marbleAmount`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marbleamount)
- [`forceGraphAppearance.marbleCounts`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marblecounts-function)
- [`forceGraphAppearance.marbleOf`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marbleof)
- [`forceGraphAppearance.marbleSeed`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marbleseed)
- [`forceGraphAppearance.marbleShares`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marbleshares-function)
- [`forceGraphAppearance.marbleTint`](./views/forceGraphAppearance.ts.mdmd.md#symbol-marbletint)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
