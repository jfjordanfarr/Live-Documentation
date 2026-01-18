# Live Documentation Explorer

## Metadata
- Layer: 3
- Archetype: component
- Live Doc ID: COMP-livedocs-explorer

## Authored
### Purpose
Document the visualization command center that renders the Live Doc graph as interactive views—Circuit Board (treemap), Local Map (3-column symbol view), and Force Graph—served via HTTP for browser-based exploration.

### Notes
- Created 2025-11-21 when `visualize-explorer.ts` was refactored into a modular `packages/scripts` structure with server, client, and shared modules.
- The server (`explorer/server/`) builds the graph payload from Layer-4 Live Docs and serves static HTML/CSS/JS assets.
- The client (`explorer/client/`) renders three view modes:
  - **Circuit Board**: Treemap layout where folders are nested rectangles and files are clickable cells.
  - **Local Map**: 3-column view (inbound → center → outbound) showing symbol-level connections with Bézier splines.
  - **Force Graph**: Force-directed layout for spatial discovery (accessibility relaxed vs primary views).
- The Local Map was split into a modular `localView/` directory on 2025-12-04 to support column-aware anchor registration, gradient connections, and type-reference edge rendering.
- Symbol anchors (`symbolAnchors.ts`, created 2025-12-03) normalise identifiers so connection routing works across different payload formats.

### Strategy
- Complete LD-406 through LD-408 by consolidating shared data models, adding focus-mode filtering, and wiring accessibility/telemetry hooks.
- Ensure rendered edges, symbol anchors, and directional styling stay in parity with `live-docs inspect` CLI payloads—UI must never invent or omit graph facts.
- Prepare the detail panel for future inline editing as a wishlist item; core value remains read-only exploration + deterministic regeneration + drift visibility.
- **Static Distribution (LD-810–LD-819)**: Enable zero-server distribution via JSON bundles, GitHub Pages embedding, and standalone HTML viewers. The `StaticExplorerData` schema wraps the graph payload with provenance metadata and a symbol index for client-side search. Distribution scenarios include GitHub Pages (alongside Layer-1 markdown), Hosted Showcase bundles (REQ-H1), Teams Card embedding, and offline analysis.

## System References
### Components
#### Server
- [packages/scripts/src/live-docs/explorer/server/index.ts](../layer-4/packages/scripts/src/live-docs/explorer/server/index.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/server/graph.ts](../layer-4/packages/scripts/src/live-docs/explorer/server/graph.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/server/buildAssets.ts](../layer-4/packages/scripts/src/live-docs/explorer/server/buildAssets.ts.mdmd.md)

#### Shared
- [packages/scripts/src/live-docs/explorer/shared/index.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/index.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/shared/types.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/types.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/localMapBuilder.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/shared/localMapData.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/localMapData.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts.mdmd.md) — Schema for JSON bundles with provenance and symbol index

#### Client Core
- [packages/scripts/src/live-docs/explorer/client/index.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/index.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/types.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/types.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/parsers.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/parsers.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/dom.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/dom.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/errors.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/errors.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/detailPanel.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/detailPanel.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/markdown.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/markdown.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/pathfind.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/pathfind.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/graph-helpers.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/graph-helpers.ts.mdmd.md)

#### Bootstrap (entry point heuristics)
- [packages/scripts/src/live-docs/explorer/client/bootstrap/index.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/bootstrap/index.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/bootstrap/entry-heuristics.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/bootstrap/entry-heuristics.ts.mdmd.md)

#### Panels (UI controls)
- [packages/scripts/src/live-docs/explorer/client/panels/index.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/panels/index.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/panels/omnisearch.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/panels/omnisearch.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/panels/sources-view.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/panels/tuning.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/panels/tuning.ts.mdmd.md)

#### Persistence (state management)
- [packages/scripts/src/live-docs/explorer/client/persistence/index.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/persistence/index.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/persistence/url-state.ts.mdmd.md)

#### Views
- [packages/scripts/src/live-docs/explorer/client/views/circuitView.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/circuitView.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/layoutUtils.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/symbolAnchors.ts.mdmd.md)

#### Local Map (modularised 2025-12-04)
- [packages/scripts/src/live-docs/explorer/client/views/localView/index.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/index.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/controller.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/controller.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/render.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/render.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/connections.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/state.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/state.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/types.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/types.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/card-factory.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/card-factory.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/column-factory.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/column-factory.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/connection-geometry.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/connection-geometry.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/layout-renderer.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/layout-renderer.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts.mdmd.md)

#### Static Distribution
- [packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts.mdmd.md) — Schema for JSON bundles with provenance and symbol index
- [packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts.mdmd.md) — Builds static explorer bundles

## Evidence
- `npm run live-docs:visualize` launches the HTTP server and opens the browser; manual smoke tests validate view switching and connection rendering.
- Unit tests for symbol anchor normalisation live in `symbolAnchors.test.ts`.
- December 2025 chat sessions (12/03–12/06) document the Local Map refinements: gradient connections, column-aware anchors, type-reference edges, and origin-over-barrel preference for inheritance links.
