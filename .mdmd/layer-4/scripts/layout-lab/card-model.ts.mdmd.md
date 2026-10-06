# scripts/layout-lab/card-model.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/card-model.ts
- Generated At: 2026-10-06T20:39:25.829Z

## Authored
### Purpose

The card model: a card's height and the place of each of its pins at any width, composed by arithmetic from a capture of the page.

### Notes

A card is border, padding, the title in its width less its right padding and its margin, the path, the symbols block whose margin swallows the meta line's, each row as tall as its dot, its label's lines or its badges, the rows a gap apart, the test chips wrapped as a flex row wraps, the directory line with the larger of its margin and the tests' bottom margin, and the notes. The Internals row's dot and placeholder carry a top margin, so that row is taller by it and its dot sits below the row's middle by it, which the first draft missed by exactly four pixels on every card. A pin is at the middle of its row, the hub at the middle of the card, and a wire finds its pin as the page's registry resolves it: the symbol's row by its name or its normalized name, else the direction's default, else the card's middle; a row the page collapses resolves to no pin at all, since the page finds the anchor but cannot measure it and so places and draws no wire. Texts are laid out by Pretext's `layout` from the capture's preparation with `TEXT_TOLERANCE`, one of Chromium's layout units: the browser keeps a text that overflows its box by a sixty-fourth of a pixel on one line and wraps one that overflows by five; a text the page never showed is set from the font's glyph widths. Held to the page by the capture's drift check on every deck scope.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CardView` {#symbol-cardview}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L17)

##### `CardView` — Summary
What a card shows under a configuration: its rows in order, and the lines under it.

#### `CardMetrics (interface)` {#symbol-cardmetrics-interface}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L29)

##### `CardMetrics (interface)` — Summary
The card's height, and every anchor's distance from its top, before rounding; `rowKeys` names the anchors that
are a row's dots, and `hiddenKeys` the anchors of collapsed rows, which the page has but cannot measure.

#### `TEXT_TOLERANCE` {#symbol-text_tolerance}
- Type: const
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L42)

##### `TEXT_TOLERANCE` — Summary
How far a text may overflow its box and still stay on one line, in CSS pixels: one of Chromium's layout units.
The estate's "Portal/Controllers/PaymentsController.cs" is 201.015625 px wide in a 201 px box and stands on one
line; the repository's "…/branch-renderer.ts" is 319.078 px wide in a 319 px box and wraps. Pretext's arithmetic
breaks at the box's edge, so the lab lends it the unit.

#### `textHeight` {#symbol-textheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L45)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `text`: [`PreparedText`](./capture.ts.mdmd.md#symbol-preparedtext)

##### `textHeight` — Summary
The height of a prepared text set in a width, by Pretext's arithmetic, with the browser's tolerance.

#### `synthesizedHeight` {#symbol-synthesizedheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L51)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `synthesizedHeight` — Summary
The height of a text the page never showed, set in a font from its glyphs' widths: as many lines as its words need.

#### `chipsHeight` {#symbol-chipsheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L66)

##### `chipsHeight` — Summary
How many lines a row of chips wraps to, and the height they take: each line as tall as its tallest chip, the lines a gap apart.

#### `cardMetrics (function)` {#symbol-cardmetrics-function}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L85)
- Returns: [`CardMetrics`](#symbol-cardmetrics-interface)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `card`: [`CardCapture`](./capture.ts.mdmd.md#symbol-cardcapture); `view`: [`CardView`](#symbol-cardview)

##### `cardMetrics (function)` — Summary
The card at a width: border, padding, the title with its right padding and
margin, the path, the symbols block (its margin swallowing the meta line's),
each row as tall as its dot, its label's lines or its badges, the rows a gap
apart, the test chips wrapped, the directory line, and the notes. A pin is
at the middle of its row, the Internals row's a margin lower; the hub at
the middle of the card.

#### `resolvePin` {#symbol-resolvepin}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L141)
- Parameters: `metrics`: [`CardMetrics`](#symbol-cardmetrics-interface)

##### `resolvePin` — Summary
The anchor a wire finds for a symbol, as the page's registry resolves it:
the symbol's own row, by its name or its normalized name; else the card's
default for that direction (the hub, or the Internals row's dot); else the
card's middle. A row the page collapses resolves to no offset at all.

#### `pinOffset` {#symbol-pinoffset}
- Type: const
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L159)

##### `pinOffset` — Summary
A pin's offset, or null where the page would place no wire.

#### `labelHeight` {#symbol-labelheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L162)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `labelHeight` — Summary
The height of a drawn directory's label at a width: its lines and the padding under them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@chenglou/pretext` - `layout`
- [`symbolAnchors.normalizeSymbolIdentifier`](../../packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`capture.CardCapture`](./capture.ts.mdmd.md#symbol-cardcapture) (type-only)
- [`capture.ChipCapture`](./capture.ts.mdmd.md#symbol-chipcapture) (type-only)
- [`capture.PreparedText`](./capture.ts.mdmd.md#symbol-preparedtext) (type-only)
- [`capture.RowCapture`](./capture.ts.mdmd.md#symbol-rowcapture) (type-only)
<!-- LIVE-DOC:END Dependencies -->
