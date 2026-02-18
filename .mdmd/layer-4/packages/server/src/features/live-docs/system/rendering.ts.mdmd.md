# packages/server/src/features/live-docs/system/rendering.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/rendering.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-rendering-ts
- Generated At: 2026-02-18T21:27:52.831Z

## Authored
### Purpose
Markdown section renderers for System-layer Live Documentation. Produces Components lists, Topology Mermaid diagrams, Activation heatmaps, and Public Symbols tables from a `SystemDocPlan`.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (371 lines)
- `renderTopologySection()` builds Mermaid `graph TD` with virtual nodes for external dependencies
- `renderActivationSection()` summarises co-activation clusters with p-values and edge counts

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.831Z","inputHash":"610456f9d18c9011"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderComponentsSection` {#symbol-rendercomponentssection}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L25)
- Returns: [`LiveDocRenderSection`](./types.ts.mdmd.md#symbol-livedocrendersection)

##### `renderComponentsSection` — Summary
Renders the "Components" section for a System-layer Live Doc.

Lists each component path as a relative link to its Stage-0 doc, annotated
with strength, degree, test count, z-score, and symbol count metrics.

#### `renderTopologySection` {#symbol-rendertopologysection}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L80)
- Returns: [`LiveDocRenderSection`](./types.ts.mdmd.md#symbol-livedocrendersection)

##### `renderTopologySection` — Summary
Renders a Mermaid `graph TD` topology section for a System-layer Live Doc.

Creates labelled nodes for each Stage-0 doc and virtual node, draws directed
edges, and applies archetype-based colour classes (implementation, test, asset,
test-summary).  Node labels are disambiguated via {@link buildDocNodeLabels}.

#### `renderActivationSection` {#symbol-renderactivationsection}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L197)
- Returns: [`LiveDocRenderSection`](./types.ts.mdmd.md#symbol-livedocrendersection)

##### `renderActivationSection` — Summary
Renders the "Activation Signals" section for a System-layer Live Doc.

Includes cluster membership, coverage ratio, edge statistics, statistical
significance (p/q values, density), and ranked top components, cohesion
edges, test sources, and dependency sources.

##### `renderActivationSection` — Returns
The rendered section, or `undefined` if no activation data exists.

#### `renderPublicSymbolsSection` {#symbol-renderpublicsymbolssection}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/rendering.ts#L304)
- Returns: [`LiveDocRenderSection`](./types.ts.mdmd.md#symbol-livedocrendersection)

##### `renderPublicSymbolsSection` — Summary
Renders the "Public Surface" section for a System-layer Live Doc.

Lists components by descending public-symbol count, up to
{@link MAX_PUBLIC_SYMBOL_ENTRIES} entries with {@link MAX_PUBLIC_SYMBOLS_PER_ENTRY}
sample names per line.

##### `renderPublicSymbolsSection` — Returns
The rendered section, or `undefined` if no components expose symbols.
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
