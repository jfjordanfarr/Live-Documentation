# `packages/explorer/src/client/dom.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/dom.ts`
- Generated At: 2026-11-23T00:11:13.488Z

## Authored
### Purpose
Provides required element lookups and coordinates the Explorer's active view, navigation state and shared Local Map toolbar. Keeps inactive surfaces outside keyboard navigation and the accessibility tree as the selected view and 2D/3D perspective change.

### Notes
- Created 2025-11-21 during the explorer modularisation.
- `requireElement` throws if the element is missing, failing fast on template mismatches. Its generic return type records the caller's expected element type; it does not validate that subtype at runtime.
- `setActiveView` marks the active navigation item with `aria-current`, maps the Local Map's chosen perspective to its 2D or 3D container, and updates the view classes. Hidden cards and projected 3D action buttons must not remain in the Tab sequence merely because their DOM is retained.
- Since 2026-11-22 a view is put away in two steps, by `settleViews`, the one place a view is made inert: `aria-hidden` at once, `inert` only once the stylesheet has taken the view out of drawing (its fade over, no change of perspective holding it). Making a drawn view inert had the browser work out the style of every element in it again, about 180 ms of each press of 3D on a map of 14,810 elements; the measures and the ruling are in that day's `Screenshots/arrival-default` record, fourteenth and fifteenth milestones. While a view is drawn and not shown, focus offered to it is given back, and focus that stood in it goes to the sidebar's control of the view shown. The way back mirrors the way out: `setActiveView` makes the view not inert before it gives it the class that draws it (sixteenth milestone of the same record).
- The one pathfinding toolbar moves into the chosen Local Map surface. Body classes expose the active World Map, Local Map legend, 3D controls and 2D zoom controls to the styles; this function changes presentation rather than inspection, pins, subject or camera.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `requireElement` {#symbol-requireelement}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L6)
- Returns: `T`

##### `requireElement` — Summary
Looks up an element by `id` and throws if not found.

#### `applyPalette` {#symbol-applypalette}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L19)

##### `applyPalette` — Summary
Draws the page in a palette, by name (the default for a name no palette has): its colours become the custom properties
every stylesheet reads, set on the page's root over the build's, and then the palette the maps' scripts read, whose
views draw again in it at once where they drew a colour themselves (`whenPaletteChanges`), with nothing moving.

#### `applyMarbles` {#symbol-applymarbles}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L29)
- Parameters: `choice`: [`MarbleChoice`](./types.ts.mdmd.md#symbol-marblechoice)

##### `applyMarbles` — Summary
Draws files as marbles or not (the marble trial, 2026-11-17): the page's root says which, for the stylesheets that
tint the 2D map's cells, and the maps' scripts draw again as for a palette chosen, with nothing moving.

#### `settleViews` {#symbol-settleviews}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L53)

##### `settleViews` — Summary
Give each view the state its place calls for; the one way a view is put away, for every view, for the sidebar's
switch and for a change of perspective. A view no longer shown is hidden from assistive technology at once and takes
no pointer (shell.css), and is made inert only once the stylesheet has taken it out of drawing: when its fade is over
and no change of perspective holds it as the still picture (`perspective-held`). The order is the point. Making a
drawn view inert has the browser work out the style of every element in it again, 180 ms of each press of 3D on a
map of 14,810 elements, paid at the next read of a box; a view not drawn costs 3 ms (measured 2026-11-22). Until it
is inert, focus offered to it is given back ({@link keepFocusInTheViewShown}).

##### `settleViews` — Parameters
- `modal`: whether a modal reader covers the page; left out, it stands as it was last given.

#### `giveFocus` {#symbol-givefocus}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L73)

##### `giveFocus` — Summary
Give focus to the first of these that takes it; a disabled control does not, nor one in a view not shown.

#### `setActiveView` {#symbol-setactiveview}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L99)
- Parameters: `view`: [`ViewName`](./types.ts.mdmd.md#symbol-viewname); `perspective`: [`LocalMapPerspective`](./types.ts.mdmd.md#symbol-localmapperspective)

##### `setActiveView` — Summary
Activates the given view tab and its container while deactivating siblings. Focus that stood in a view now leaving
goes to the sidebar's control of the view shown: a view on its way out is not inert and would keep it.

#### `setSeamedText` {#symbol-setseamedtext}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L150)

##### `setSeamedText` — Summary
Write a name into an element with a soft break at each of its seams (`seamsOf`), so that a name wider than its box
wraps at a seam rather than at whatever letter the box ran out at; the element's text stays the name.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`palette.chooseMarbles`](./palette.ts.mdmd.md#symbol-choosemarbles)
- [`palette.choosePalette`](./palette.ts.mdmd.md#symbol-choosepalette)
- [`palette.customProperties`](./palette.ts.mdmd.md#symbol-customproperties)
- [`palette.paletteNamed`](./palette.ts.mdmd.md#symbol-palettenamed)
- [`types.LocalMapPerspective`](./types.ts.mdmd.md#symbol-localmapperspective) (type-only)
- [`types.MarbleChoice`](./types.ts.mdmd.md#symbol-marblechoice) (type-only)
- [`types.ViewName`](./types.ts.mdmd.md#symbol-viewname) (type-only)
- [`word-seams.seamsOf`](./views/localView/word-seams.ts.mdmd.md#symbol-seamsof)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
