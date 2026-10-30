# packages/explorer/src/client/dom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/dom.ts
- Generated At: 2026-10-30T19:08:31.104Z

## Authored
### Purpose
Provides required element lookups and coordinates the Explorer's active view, navigation state and shared Local Map toolbar. Keeps inactive surfaces outside keyboard navigation and the accessibility tree as the selected view and 2D/3D perspective change.

### Notes
- Created 2025-11-21 during the explorer modularisation.
- `requireElement` throws if the element is missing, failing fast on template mismatches. Its generic return type records the caller's expected element type; it does not validate that subtype at runtime.
- `setActiveView` marks the active navigation item with `aria-current`, maps the Local Map's chosen perspective to its 2D or 3D container, and updates the view classes, `inert` and `aria-hidden` together. Hidden cards and projected 3D action buttons must not remain in the Tab sequence merely because their DOM is retained.
- The one pathfinding toolbar moves into the chosen Local Map surface. Body classes expose the active World Map, Local Map legend, 3D controls and 2D zoom controls to the styles; this function changes presentation rather than inspection, pins, subject or camera.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `requireElement` {#symbol-requireelement}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L5)
- Returns: `T`

##### `requireElement` — Summary
Looks up an element by `id` and throws if not found.

#### `setActiveView` {#symbol-setactiveview}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L14)
- Parameters: `view`: [`ViewName`](./types.ts.mdmd.md#symbol-viewname); `perspective`: [`LocalMapPerspective`](./types.ts.mdmd.md#symbol-localmapperspective)

##### `setActiveView` — Summary
Activates the given view tab and its container while deactivating siblings.

#### `setSeamedText` {#symbol-setseamedtext}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/dom.ts#L62)

##### `setSeamedText` — Summary
Write a name into an element with a soft break at each of its seams (`seamsOf`), so that a name wider than its box
wraps at a seam rather than at whatever letter the box ran out at; the element's text stays the name.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalMapPerspective`](./types.ts.mdmd.md#symbol-localmapperspective) (type-only)
- [`types.ViewName`](./types.ts.mdmd.md#symbol-viewname) (type-only)
- [`word-seams.seamsOf`](./views/localView/word-seams.ts.mdmd.md#symbol-seamsof)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
