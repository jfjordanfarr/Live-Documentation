# Live Documentation Explorer

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-livedocs-explorer

## Authored

### Purpose

Document the visualization command center that renders the Live Doc graph as interactive views—currently Circuit Board (treemap), Local Map (3-column symbol view), and Force Graph—built as a static bundle for browser-based exploration. The planned [Membrane Map](membrane-map.mdmd.md) will unify Circuit Board and Local Map into a single zoomable treemap with directory-as-membrane nesting, reducing the view count from three to two (Membrane Map + Force Graph).

### Notes

- Created 2025-11-21 when `visualize-explorer.ts` was refactored into a modular `packages/scripts` structure with client and shared modules.
- The shared layer (`explorer/shared/`) builds the graph payload from Layer-4 Live Docs and bundles HTML/CSS/JS assets into a static Explorer.
- The HTTP server (`explorer/server/`) was retired on 2026-03-09 in favour of static-only distribution. `graph.ts` and `buildAssets.ts` were relocated to `shared/`.
- The client (`explorer/client/`) currently renders four view modes:
  - **Circuit Board**: Treemap layout where folders are nested rectangles and files are clickable cells.
  - **Local Map**: 3-column view (inbound → center → outbound) showing symbol-level connections with Bézier splines.
  - **Force Graph**: Force-directed layout for spatial discovery (accessibility relaxed vs primary views).
  - **Membrane Map** _(in progress)_: Zoomable treemap unifying Circuit Board and Local Map. Directory-as-membrane nesting with continuous pin spectrum (no discrete modes). See [Membrane Map architecture](membrane-map.mdmd.md).
- The **[Membrane Map](membrane-map.mdmd.md)** is the in-progress successor to Circuit Board and Local Map. Implementation began Dev Day 80 (2026-03-23) with 826/826 tests green. Phase-out of the old views will occur when the Membrane Map achieves feature parity and stability.
- The Local Map was split into a modular `localView/` directory on 2025-12-04 to support column-aware anchor registration, gradient connections, and type-reference edge rendering.
- Symbol anchors (`symbolAnchors.ts`, created 2025-12-03) normalise identifiers so connection routing works across different payload formats.

### Strategy

- **Membrane Map transition**: Build the [Membrane Map](membrane-map.mdmd.md) as a new view alongside existing Circuit Board and Local Map, using those as reference implementations. Once feature parity and stability are confirmed, phase out Circuit Board and Local Map. See the [feature backlog](../layer-2/work-items/feature-backlog.mdmd.md) for Membrane Map work items.
- Complete LD-406 through LD-408 by consolidating shared data models, adding focus-mode filtering, and wiring accessibility/telemetry hooks.
- Ensure rendered edges, symbol anchors, and directional styling stay in parity with `live-docs inspect` CLI payloads—UI must never invent or omit graph facts.
- The Explorer is strictly read-only. Editing Live Docs or source files happens in the IDE; the Explorer provides "open in editor" links to bridge the gap.
- **Static Distribution (LD-810–LD-819)**: Enable zero-server distribution via JSON bundles, GitHub Pages embedding, and standalone HTML viewers. The `StaticExplorerData` schema wraps the graph payload with provenance metadata and a symbol index for client-side search. Distribution scenarios include GitHub Pages (alongside Layer-1 markdown), Hosted Showcase bundles (REQ-H1), Teams Card embedding, and offline analysis.

### Pathfinding Rendering

The Local Map supports **path mode** when `FROM` and `TO` inputs are populated. The current implementation renders a single shortest path as a linear chain of hop columns (`FROM → Via 1 → Via 2 → … → TO`). Pathfinding uses BFS with a single-parent map (`Map<string, string>`), so when multiple shortest paths exist, only one arbitrary path is returned.

Three planned enhancements address this limitation (see `AI-Agent-Workspace/Notes/multi-path-visualization-design.md` for full specification with ASCII diagrams):

1. **All-Shortest-Paths Merged DAG** — Replace the single-parent BFS with a multi-parent variant (`Map<string, Set<string>>`) to reconstruct every shortest path. Where paths diverge, the hop column stacks multiple cards vertically. Connections fan out and converge across the DAG.

2. **Near-Miss (+1) Paths** — After finding shortest paths at depth _k_, continue BFS one additional level to collect paths of length _k_+1. These render with dashed borders, reduced opacity, and dashed connection lines. A toolbar toggle controls visibility (default off).

3. **Symbol-Divergent Paths Through Same File** — Port the CLI's symbol-aware BFS (`pathfind-symbol.ts`) to the Explorer client. When two shortest paths traverse the same file sequence via different symbols, multiple connection lines route through distinct symbol anchors on the same card. Each chain gets a unique color; hovering highlights the full chain end-to-end.

These enhancements are additive and depend on the multi-hop rendering architecture documented in `AI-Agent-Workspace/Notes/multi-hop-local-map-architecture.md` (dynamic column count, hop-aware anchors, HopChain data model). Each can ship independently in the order listed.

> **Note (2026-03-22)**: Multi-path pathfinding may be reimplemented on the [Membrane Map](membrane-map.mdmd.md) spatial substrate rather than the current column layout. The column-based rendering described above remains the reference design until the Membrane Map's Path mode is prototyped.

## System References

### Components

#### Build Utilities

- [packages/scripts/src/live-docs/explorer/shared/graph.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/graph.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/shared/buildAssets.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/buildAssets.ts.mdmd.md)

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
- [packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts.mdmd.md) — lz-string URL state compression for Membrane Map shareability

#### Views

- [packages/scripts/src/live-docs/explorer/client/views/circuitView/index.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/circuitView/index.ts.mdmd.md) — Circuit Board controller (progressive disclosure treemap)
- [packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/circuitView/state.ts.mdmd.md) — Immutable state for expand/collapse
- [packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts.mdmd.md) — Directory aggregate metrics
- [packages/scripts/src/live-docs/explorer/client/views/squarify.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/squarify.ts.mdmd.md) — Squarified treemap layout algorithm (shared by Circuit Board and Membrane Map) — Squarified treemap layout algorithm
- [packages/scripts/src/live-docs/explorer/client/views/circuitView/directoryTile.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/circuitView/directoryTile.ts.mdmd.md) — Directory tile DOM builder
- [packages/scripts/src/live-docs/explorer/client/views/circuitView/breadcrumb.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/circuitView/breadcrumb.ts.mdmd.md) — Breadcrumb navigation DOM builder
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
- [packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts.mdmd.md) — Connection geometry utilities (shared by Local Map and Membrane Map)
- [packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/layout-renderer.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/layout-renderer.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/pan-zoom.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts.mdmd.md)

#### Membrane Map (in progress — see [architecture doc](membrane-map.mdmd.md))

- [packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/layout.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/layout.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/edge-bundling.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/edge-bundling.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/browse-renderer.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/browse-renderer.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/aggregation.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/aggregation.ts.mdmd.md)
- [packages/scripts/src/live-docs/explorer/client/views/membraneView/index.ts](../layer-4/packages/scripts/src/live-docs/explorer/client/views/membraneView/index.ts.mdmd.md)

#### Static Distribution

- [packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/staticExplorerData.ts.mdmd.md) — Schema for JSON bundles with provenance and symbol index
- [packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts](../layer-4/packages/scripts/src/live-docs/explorer/shared/staticBuilder.ts.mdmd.md) — Builds static explorer bundles

## Evidence

- `npm run live-docs:visualize` builds a static Explorer bundle; manual smoke tests validate view switching and connection rendering.
- Unit tests for symbol anchor normalisation live in `symbolAnchors.test.ts`.
- December 2025 chat sessions (12/03–12/06) document the Local Map refinements: gradient connections, column-aware anchors, type-reference edges, and origin-over-barrel preference for inheritance links.
