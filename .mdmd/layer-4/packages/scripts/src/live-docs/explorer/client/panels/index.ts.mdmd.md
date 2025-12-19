# packages/scripts/src/live-docs/explorer/client/panels/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/panels/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-panels-index-ts
- Generated At: 2025-12-19T21:19:50.725Z

## Authored
### Purpose
Barrel file that re-exports all panel initialization functions. Provides a single import point for tuning, omnisearch, and sources-view panel setup during Explorer bootstrap.

### Notes
Created during Dev Day 50 (12/19) as part of Phase 2 tech-debt reduction. Groups panel-related exports for cleaner imports in the main index.ts.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:19:50.725Z","inputHash":"7cdd2216c9763483"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `initOmnisearch` {#symbol-initomnisearch}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L8)

#### `OmnisearchConfig` {#symbol-omnisearchconfig}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L9)

#### `OmnisearchSelectCallback` {#symbol-omnisearchselectcallback}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L10)

#### `initTuningPanel` {#symbol-inittuningpanel}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L14)

#### `TuningPanelConfig` {#symbol-tuningpanelconfig}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L15)

#### `TuningChangeCallback` {#symbol-tuningchangecallback}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L16)

#### `RenderCallback` {#symbol-rendercallback}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L17)

#### `renderSourcesView` {#symbol-rendersourcesview}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L21)

#### `SourcesViewConfig` {#symbol-sourcesviewconfig}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L22)

#### `StaticDocsMap` {#symbol-staticdocsmap}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L23)

#### `NavigateToNodeCallback` {#symbol-navigatetonodecallback}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/index.ts#L24)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`omnisearch.OmnisearchConfig`](./omnisearch.ts.mdmd.md#symbol-omnisearchconfig) (re-export)
- [`omnisearch.OmnisearchSelectCallback`](./omnisearch.ts.mdmd.md#symbol-omnisearchselectcallback) (re-export)
- [`omnisearch.initOmnisearch`](./omnisearch.ts.mdmd.md#symbol-initomnisearch) (re-export)
- [`sources-view.NavigateToNodeCallback`](./sources-view.ts.mdmd.md#symbol-navigatetonodecallback) (re-export)
- [`sources-view.SourcesViewConfig`](./sources-view.ts.mdmd.md#symbol-sourcesviewconfig) (re-export)
- [`sources-view.StaticDocsMap`](./sources-view.ts.mdmd.md#symbol-staticdocsmap) (re-export)
- [`sources-view.renderSourcesView`](./sources-view.ts.mdmd.md#symbol-rendersourcesview) (re-export)
- [`tuning.RenderCallback`](./tuning.ts.mdmd.md#symbol-rendercallback) (re-export)
- [`tuning.TuningChangeCallback`](./tuning.ts.mdmd.md#symbol-tuningchangecallback) (re-export)
- [`tuning.TuningPanelConfig`](./tuning.ts.mdmd.md#symbol-tuningpanelconfig) (re-export)
- [`tuning.initTuningPanel`](./tuning.ts.mdmd.md#symbol-inittuningpanel) (re-export)
<!-- LIVE-DOC:END Dependencies -->
