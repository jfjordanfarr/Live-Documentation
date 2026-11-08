# scripts/layout-lab/card-model.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/card-model.ts
- Generated At: 2026-11-08T10:06:47.709Z

## Authored
### Purpose

The card model: a card's height and the place of each of its pins at any width, composed by arithmetic from a capture of the page.

### Notes

A card is border, padding, the title in its width less its right padding and its margin, the path, the symbols block whose margin swallows the meta line's, each row as tall as its dot or as its wrapper, the wrapper's frame and the tallest of its label's lines, its badges and its controls, the label narrowed by the frame, badges and controls beside it (the controls and frame since [2026-10-20](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#the-layout-lab-caught-the-label-buttons)), the rows a gap apart, the test chips wrapped as a flex row wraps, the directory line with the larger of its margin and the tests' bottom margin, and the notes. The Internals row's dot and placeholder carry a top margin, so that row is taller by it and its dot sits below the row's middle by it, which the first draft missed by exactly four pixels on every card. A pin is at the middle of its row, the hub at the middle of the card, and a wire finds its pin as the page's registry resolves it: the symbol's row by its name or its normalized name, else the direction's default, else the card's middle; a row the page collapses resolves to no pin at all, since the page finds the anchor but cannot measure it and so places and draws no wire. Texts are laid out by Pretext's `layout` from the capture's preparation with `TEXT_TOLERANCE`, one of Chromium's layout units: the browser keeps a text that overflows its box by a sixty-fourth of a pixel on one line and wraps one that overflows by five; a text the page never showed is set from the font's glyph widths. Held to the page by the capture's drift check on every deck scope.

Endpoint identity follows card construction, not the proposed vertical row order. Row centres are measured by captured-row identity; `registerPins` then registers those identities in construction order with separate exact and `normalized:` namespaces, as the browser does. Later duplicate registrations win even when their row is hidden, in which case the endpoint is absent rather than falling back to an earlier visible duplicate. File and asset hubs retain their card-centre fallback. These distinctions support the [October 13 shared competition](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply); the independent card model itself came from the [October 6 lab](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-06.1.SUMMARIZED.md#turn-10).

Directory labels compose their prepared text caption with the captured ancestry-control column: reserve the control width before wrapping and take the taller of the text or control before adding label padding. Optional measurements keep older captures valid. The page and model use the same separation of text and controls, introduced during [the October 14 pin-management work](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

November 4 extends the composition to the portrait card: per-card constants, Purpose and per-symbol reading blocks, conditional full-description actions, hidden duplicate directory text and the relationship footer. Reading hubs sit beside the header; compact hubs retain the midpoint rule above. The model accounts for collapsed adjacent margins and quantized grid alignment, then independently predicts a narrower card from the same prepared text. See the [integration record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

The [November 4 learning-journey pass](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8) composes the relationship controls above prose when the capture identifies that placement, retaining older bottom-count captures. Narrow phone predictions include wrapped controls and actual name break opportunities. Cycle notes use the current return-connection wording once, so a captured note is not counted again after regenerating it from the graph.

Since [Turn 12](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) `cardMetrics` gives a slot card its fixed allotments: the Purpose's slot height in place of its laid-out prose, each public row its explicit height with the dot at the middle of the first track (the name's line, at the top of the row) rather than of the allotment, the row's slot ignored since the allotment holds it; the Internals row and every row of the other compositions take their content as before.

Since 2026-11-08 a card's title is sized by `titleTextHeight`, by the header's layout of the header round: the node's controls follow the file's name in the header, and the name's button ends with a room for them (`.local-file-name-room` in `local.css`), whose box `titleRoomBox` mirrors from the stylesheet's rule: as wide as the controls side by side with their 2 px gaps, counted one to five by the header's own children, times the hold (`--actions-hold`, 1.2 on a slot card), and 4 px of air; as tall as one control (`--action-size`) times the hold. `titleHeight` sets that room, the last inline box, on the name's last line where the line leaves it its width, that line then as tall as the taller of the two, and otherwise on a line of its own after the name. Pretext's own layout of the name had held the title to its lines alone, so that the gate over the merged round found the model short of the page by the room ("PaymentsController.cs" 15 against 24, a reading card's "document.ts" 28.59 against 60.59), and the lab, the headless command and the drift check disagreeing with the page. A capture from before the round has no room, and its titles are their lines, as before.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CardView` {#symbol-cardview}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L18)

##### `CardView` — Summary
What a card shows under a configuration: its rows in order, and the lines under it.

#### `CardMetrics (interface)` {#symbol-cardmetrics-interface}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L30)

##### `CardMetrics (interface)` — Summary
The card's height, and every anchor's distance from its top, before rounding; `rowKeys` names the anchors that
are a row's dots, and `hiddenKeys` the anchors of collapsed rows, which the page has but cannot measure.

#### `TEXT_TOLERANCE` {#symbol-text_tolerance}
- Type: const
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L45)

##### `TEXT_TOLERANCE` — Summary
How far a text may overflow its box and still stay on one line, in CSS pixels: one of Chromium's layout units.
The estate's "Portal/Controllers/PaymentsController.cs" is 201.015625 px wide in a 201 px box and stands on one
line; the repository's "…/branch-renderer.ts" is 319.078 px wide in a 319 px box and wraps. Pretext's arithmetic
breaks at the box's edge, so the lab lends it the unit.

#### `textHeight` {#symbol-textheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L48)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `text`: [`PreparedText`](./capture.ts.mdmd.md#symbol-preparedtext)

##### `textHeight` — Summary
The height of a prepared text set in a width, by Pretext's arithmetic, with the browser's tolerance.

#### `TitleRoom` {#symbol-titleroom}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L58)

##### `TitleRoom` — Summary
The room a card's header keeps for the node's controls after the file's name (the header round of 2026-11-08), as the
page measures it at capture: how many controls the header holds, a control's size, and how large they are held at the
reading band's last step. Absent in a capture of a page from before it.

#### `titleRoomBox` {#symbol-titleroombox}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L71)
- Parameters: `room`: [`TitleRoom`](#symbol-titleroom)

##### `titleRoomBox` — Summary
The room's box, by local.css's rule for `.local-file-name-room`: as wide as the controls side by side with their 2 px
gaps, held, and 4 px of air; as tall as one control held. The stylesheet counts the controls by the header's own
children, one to five.

#### `titleHeight` {#symbol-titleheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L81)
- Parameters: `room`: [`TitleRoom`](#symbol-titleroom)

##### `titleHeight` — Summary
A title's height from its text's lines, by the header's layout: the room is the name's button's last inline box,
bottom-aligned, so it shares the name's last line where the line leaves it its width, making that line as tall as the
taller of the two, and otherwise wraps to a line of its own after the name. Without a room, the lines alone.

#### `titleTextHeight` {#symbol-titletextheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L91)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `text`: [`PreparedText`](./capture.ts.mdmd.md#symbol-preparedtext); `room`: [`TitleRoom`](#symbol-titleroom)

##### `titleTextHeight` — Summary
A card's title's height at a width: its text laid out by Pretext, with the room for the controls after it.

#### `synthesizedHeight` {#symbol-synthesizedheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L100)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `synthesizedHeight` — Summary
The height of a text the page never showed, set in a font from its glyphs' widths: as many lines as its words need.

#### `chipsHeight` {#symbol-chipsheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L115)

##### `chipsHeight` — Summary
How many lines a row of chips wraps to, and the height they take: each line as tall as its tallest chip, the lines a gap apart.

#### `cardMetrics (function)` {#symbol-cardmetrics-function}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L135)
- Returns: [`CardMetrics`](#symbol-cardmetrics-interface)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `card`: [`CardCapture`](./capture.ts.mdmd.md#symbol-cardcapture); `view`: [`CardView`](#symbol-cardview)

##### `cardMetrics (function)` — Summary
The card at a width: border, padding, the title with its right padding and
margin, the path, the symbols block (its margin swallowing the meta line's),
each row as tall as its dot, its label's lines, its badges or its controls
(the label narrowed by the badges and controls beside it), the rows a gap
apart, the test chips wrapped, the directory line, and the notes. A pin is
at the middle of its row, the Internals row's a margin lower; the hub at
the middle of the card.

#### `registerPins` {#symbol-registerpins}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L195)
- Returns: [`CardMetrics`](#symbol-cardmetrics-interface)
- Parameters: `centres`: `ReadonlyMap`

##### `registerPins` — Summary
Registers row endpoints in construction order, retaining exact and normalized names separately as the browser does.

#### `resolvePin` {#symbol-resolvepin}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L225)
- Parameters: `metrics`: [`CardMetrics`](#symbol-cardmetrics-interface)

##### `resolvePin` — Summary
The anchor a wire finds for a symbol, as the page's registry resolves it:
the symbol's own row, by its name or its normalized name; else the card's
default for that direction (the hub, or the Internals row's dot); else the
card's middle. A row the page collapses resolves to no offset at all.

#### `pinOffset` {#symbol-pinoffset}
- Type: const
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L243)

##### `pinOffset` — Summary
A pin's offset, or null where the page would place no wire.

#### `labelHeight` {#symbol-labelheight}
- Type: function
- Source: [source](../../../../scripts/layout-lab/card-model.ts#L246)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `labelHeight` — Summary
The height of a drawn directory's label at a width: its lines and the padding under them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@chenglou/pretext` - `layout`, `walkLineRanges`
- [`symbolAnchors.buildNormalizedAnchorKey`](../../packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md#symbol-buildnormalizedanchorkey)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`capture.CardCapture`](./capture.ts.mdmd.md#symbol-cardcapture) (type-only)
- [`capture.ChipCapture`](./capture.ts.mdmd.md#symbol-chipcapture) (type-only)
- [`capture.PreparedText`](./capture.ts.mdmd.md#symbol-preparedtext) (type-only)
- [`capture.RowCapture`](./capture.ts.mdmd.md#symbol-rowcapture) (type-only)
- [`reading-model.readingHeight`](./reading-model.ts.mdmd.md#symbol-readingheight)
<!-- LIVE-DOC:END Dependencies -->
