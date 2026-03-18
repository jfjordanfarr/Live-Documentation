# packages/scripts/src/live-docs/explorer/client/views/circuitView/directoryTile.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView/directoryTile.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-circuitview-directorytile-ts
- Generated At: 2026-03-17T19:13:36.544Z

## Authored

### Purpose

DOM builder for collapsed directory tiles in the Circuit Board's aggregated view. Renders a clickable tile element showing the directory name, file count, symbol count, cross-boundary dependency metrics, and archetype tags.

### Notes

- Extracted during the Circuit Board progressive disclosure refactoring on [Dev Day 78](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-17.1.md). Separated from the controller to isolate DOM construction from layout logic.
- Tiles are accessible: they include `role="button"`, `aria-label` with directory metrics, `tabIndex=0`, and keyboard event handlers (Enter/Space).
- Includes its own `escapeHtml` utility to prevent XSS when rendering directory names and archetype strings.
- Metric badges are created via a private `createBadge` helper with variant-specific CSS classes (`--files`, `--symbols`, `--outbound`, `--inbound`), conditionally rendered only when the metric is non-zero.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-17T19:13:36.544Z","inputHash":"f46deec2ac582302"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `createDirectoryTile` {#symbol-createdirectorytile}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/directoryTile.ts#L17)
- Parameters: `aggregate`: [`DirectoryAggregate`](./aggregation.ts.mdmd.md#symbol-directoryaggregate)

##### `createDirectoryTile` — Summary

Creates a DOM element representing a collapsed directory tile
in the aggregated Circuit Board view.

The tile shows the directory name, file count, symbol count,
and cross-boundary dependency counts as compact metric badges.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`aggregation.DirectoryAggregate`](./aggregation.ts.mdmd.md#symbol-directoryaggregate) (type-only)
<!-- LIVE-DOC:END Dependencies -->
