# `packages/explorer/src/client/views/localView/reading-direction.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/reading-direction.ts`
- Generated At: 2026-11-24T11:19:16.998Z

## Authored
### Purpose
Says which way a 2D Local Map picture reads, what offers first from the left or what uses first, and holds the one mapping between the layout's own across (start to end) and the page's left and right, so that a mirrored picture is the same layout reflected and no layout module knows of it.

### Notes
- Written 2026-11-22, when the owner asked for a mirroring button in the 2D Local Map ("I could imagine swapping all the time") and for the mechanism a right-to-left layout would later ride. The layout modules and their tests are untouched: the stylesheet reflects the content root and the wires' layer about the root's own edge (`data-reads` on `#map-viewport`, the rules at the end of `styles/local.css`) and turns each card and each directory's line back to face the viewer.
- Only a measurement taken from the page and written back into the reflected layers crosses the reflection, and it crosses it here: the wires' anchors and the wires' overlay in `connections.ts`. The camera's measurements are the page's own and need no mapping, because the layer that carries the camera's transform is not reflected.
- The choice is `tuning.appearance.reads`, beside the frame and kept as the frame is (the root's ruling, 2026-11-22: "it is a control of the view"): in the browser's own storage and in no link, neither counted by Tuning's badge nor taken by its Reset (`panels/tuning-changes.ts`). It was first kept among the 2D map's levers, where the badge counted it and Reset turned the picture round.
- Not built: right-to-left text. A locale would drive `writeReads`; names with mixed directions, the cards' own inner order and the page outside the map would still need their own work.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `READS_ATTRIBUTE` {#symbol-reads_attribute}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L16)

##### `READS_ATTRIBUTE` — Summary
The attribute on the map's layer that says which way its picture reads; the stylesheet draws the reflection from it.

#### `effectiveReads` {#symbol-effectivereads}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L22)
- Returns: [`MapReads`](../../types.ts.mdmd.md#symbol-mapreads)

##### `effectiveReads` — Summary
The reading direction the 2D picture currently shows: a drawn path's own reading direction while a
path is active (`pathReads`), otherwise the viewer's persisted preference.

#### `isMirrored` {#symbol-ismirrored}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L27)
- Parameters: `reads`: [`MapReads`](../../types.ts.mdmd.md#symbol-mapreads)

##### `isMirrored` — Summary
Whether the picture is the layout reflected: what uses stands first from the left.

#### `writeReads` {#symbol-writereads}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L32)
- Parameters: `reads`: [`MapReads`](../../types.ts.mdmd.md#symbol-mapreads)

##### `writeReads` — Summary
Says on the map's layer which way its picture reads: the attribute while mirrored, none for the picture as laid out.

#### `PageSide` {#symbol-pageside}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L38)

##### `PageSide` — Summary
A side of the page, as an arrow key or a pointer names it.

#### `LayoutEnd` {#symbol-layoutend}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L41)

##### `LayoutEnd` — Summary
An end of the layout's across: its start, where what offers stands, or its end, where what uses stands.

#### `layoutEndAt` {#symbol-layoutendat}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L49)
- Returns: [`LayoutEnd`](#symbol-layoutend)
- Parameters: `side`: [`PageSide`](#symbol-pageside)

##### `layoutEndAt` — Summary
The end of the layout's across that lies toward a side of the page: as laid out the layout starts at the left, and
mirrored at the right. An arrow key names a side of the page; what it reaches is found in the layout's terms through
this (the keyboard's walk along wires, wire-answers.ts, 2026-11-22: before it, Right in a mirrored picture took the
wires on a card's left).

#### `PageSpan` {#symbol-pagespan}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L54)

##### `PageSpan` — Summary
A span across the page, in the page's pixels.

#### `LayoutSpan` {#symbol-layoutspan}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L57)

##### `LayoutSpan` — Summary
A span across the layout, in the layout's own units from its origin: start before end, whichever way it is drawn.

#### `spanInLayout` {#symbol-spaninlayout}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L65)
- Returns: [`LayoutSpan`](#symbol-layoutspan)
- Parameters: `box`: [`PageSpan`](#symbol-pagespan)

##### `spanInLayout` — Summary
A measured box's span in the layout's own units. `origin` is where the layout's across begins on the page, `axis`
the upright line a mirrored picture is reflected about, and `scale` the camera's. Unmirrored, across runs rightwards
from the origin; mirrored, the page shows the reflection of the layout about the axis, so a point's place in the
layout is the reflection of where it was measured.

#### `shownSpan` {#symbol-shownspan}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/reading-direction.ts#L72)
- Parameters: `span`: [`LayoutSpan`](#symbol-layoutspan)

##### `shownSpan` — Summary
A layout span as the page shows it, in layout units from the same origin: the inverse of {@link spanInLayout} at scale 1.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.MapReads`](../../types.ts.mdmd.md#symbol-mapreads) (type-only)
<!-- LIVE-DOC:END Dependencies -->
