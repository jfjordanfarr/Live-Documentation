# packages/scripts/src/live-docs/explorer/client/dom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/dom.ts
- Generated At: 2026-09-27T23:21:26.883Z

## Authored
### Purpose
DOM utility functions for the Explorer client. Provides `requireElement` for type-safe element lookups and `setActiveView` for toggling the active CSS view class.

### Notes
- Created 2025-11-21 during the explorer modularisation.
- `requireElement` throws if the element is missing, failing fast on template mismatches.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `requireElement` {#symbol-requireelement}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/dom.ts#L4)
- Returns: `T`

##### `requireElement` — Summary
Looks up an element by `id` and throws if not found.

#### `setActiveView` {#symbol-setactiveview}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/dom.ts#L13)
- Parameters: `view`: [`ViewName`](./types.ts.mdmd.md#symbol-viewname)

##### `setActiveView` — Summary
Activates the given view tab and its container while deactivating siblings.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ViewName`](./types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->
