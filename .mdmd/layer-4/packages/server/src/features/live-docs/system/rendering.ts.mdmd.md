# packages/server/src/features/live-docs/system/rendering.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/rendering.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-rendering-ts
- Generated At: 2026-02-03T21:55:38.128Z

## Authored
### Purpose
Markdown section renderers for System-layer Live Documentation. Produces Components lists, Topology Mermaid diagrams, Activation heatmaps, and Public Symbols tables from a `SystemDocPlan`.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (371 lines)
- `renderTopologySection()` builds Mermaid `graph TD` with virtual nodes for external dependencies
- `renderActivationSection()` summarises co-activation clusters with p-values and edge counts

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:38.128Z","inputHash":"11383242a6d912b5"}]} -->
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
- [`core.formatRelativePathFromDoc`](../../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-formatrelativepathfromdoc)
- [`types.Stage0Doc`](../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0doc) (type-only)
- [`types.Stage0Symbol`](../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0symbol) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
