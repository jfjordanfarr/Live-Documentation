# packages/scripts/src/live-docs/explorer/client/views/circuitView/breadcrumb.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView/breadcrumb.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-circuitview-breadcrumb-ts
- Generated At: 2026-03-23T20:05:53.896Z

## Authored
### Purpose

DOM builder for the breadcrumb navigation bar in the Circuit Board view. Renders the path from root to the currently deepest expanded directory, enabling one-click navigation back to any ancestor level.

### Notes

- Extracted during the Circuit Board progressive disclosure refactoring on [Dev Day 78](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-17.1.md). Has zero external dependencies — receives crumbs and a navigation callback, returns a `<nav>` element.
- The last breadcrumb item is marked with `aria-current="location"` and the `--active` CSS modifier class; ancestor items are interactive buttons that trigger `onNavigate(path)` to collapse the hierarchy back to that level.
- Separators ("›") are `aria-hidden` to keep screen reader output clean.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-23T20:05:53.896Z","inputHash":"bab73e8b5aa204b8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createBreadcrumb` {#symbol-createbreadcrumb}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/breadcrumb.ts#L8)
- Parameters: `crumbs`: `ReadonlyArray`

##### `createBreadcrumb` — Summary
Creates a breadcrumb navigation bar for the Circuit Board view.

The breadcrumb shows the path from root to the currently deepest
expanded directory, allowing one-click navigation back to any
ancestor level (collapsing everything below that point).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
