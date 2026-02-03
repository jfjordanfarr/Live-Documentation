# packages/scripts/src/live-docs/explorer/client/dom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/dom.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-dom-ts
- Generated At: 2026-02-03T21:55:35.648Z

## Authored
### Purpose
DOM utility functions for the Explorer client. Provides `requireElement` for type-safe element lookups and `setActiveView` for toggling the active CSS view class.

### Notes
- Created 2025-11-21 during the explorer modularisation.
- `requireElement` throws if the element is missing, failing fast on template mismatches.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:35.648Z","inputHash":"9c955544215f184b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `requireElement` {#symbol-requireelement}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/dom.ts#L3)
- Returns: `T`

#### `setActiveView` {#symbol-setactiveview}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/client/dom.ts#L11)
- Parameters: `view`: [`ViewName`](./types.ts.mdmd.md#symbol-viewname)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ViewName`](./types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->
