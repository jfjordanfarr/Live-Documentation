# packages/server/src/features/live-docs/system/rendering.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/rendering.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-rendering-ts
- Generated At: 2025-12-07T16:27:06.844Z

## Authored
### Purpose
Markdown section renderers for System-layer Live Documentation. Produces Components lists, Topology Mermaid diagrams, Activation heatmaps, and Public Symbols tables from a `SystemDocPlan`.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (371 lines)
- `renderTopologySection()` builds Mermaid `graph TD` with virtual nodes for external dependencies
- `renderActivationSection()` summarises co-activation clusters with p-values and edge counts

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T16:27:06.844Z","inputHash":"bde0bd9e85279e98"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderComponentsSection` {#symbol-rendercomponentssection}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L19)
- Returns: [`LiveDocRenderSection`](./types.ts.mdmd.md#symbol-livedocrendersection)

#### `renderTopologySection` {#symbol-rendertopologysection}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L67)
- Returns: [`LiveDocRenderSection`](./types.ts.mdmd.md#symbol-livedocrendersection)

#### `renderActivationSection` {#symbol-renderactivationsection}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L175)
- Returns: [`LiveDocRenderSection`](./types.ts.mdmd.md#symbol-livedocrendersection)

#### `renderPublicSymbolsSection` {#symbol-renderpublicsymbolssection}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L273)
- Returns: [`LiveDocRenderSection`](./types.ts.mdmd.md#symbol-livedocrendersection)

#### `buildDocNodeLabels` {#symbol-builddocnodelabels}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L370)

#### `stripVirtualNodePrefix` {#symbol-stripvirtualnodeprefix}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L370)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/live-docs/core` - `formatRelativePathFromDoc`
- `@live-documentation/shared/live-docs/types` - `Stage0Doc`, `Stage0Symbol` (type-only)
- `node:path` - `path`
- [`constants.MAX_PUBLIC_SYMBOLS_PER_ENTRY`](./constants.ts.mdmd.md#symbol-max_public_symbols_per_entry)
- [`constants.MAX_PUBLIC_SYMBOL_ENTRIES`](./constants.ts.mdmd.md#symbol-max_public_symbol_entries)
- [`constants.VIRTUAL_NODE_PREFIX`](./constants.ts.mdmd.md#symbol-virtual_node_prefix)
- [`formatting.formatMean`](./formatting.ts.mdmd.md#symbol-formatmean)
- [`formatting.formatNumber`](./formatting.ts.mdmd.md#symbol-formatnumber)
- [`formatting.formatPValue`](./formatting.ts.mdmd.md#symbol-formatpvalue)
- [`formatting.formatPercent`](./formatting.ts.mdmd.md#symbol-formatpercent)
- [`types.LiveDocRenderSection`](./types.ts.mdmd.md#symbol-livedocrendersection) (type-only)
- [`types.SystemDocPlan`](./types.ts.mdmd.md#symbol-systemdocplan) (type-only)
- [`types.SystemVirtualNode`](./types.ts.mdmd.md#symbol-systemvirtualnode) (type-only)
- [`utils.layer3Slug`](./utils.ts.mdmd.md#symbol-layer3slug)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
