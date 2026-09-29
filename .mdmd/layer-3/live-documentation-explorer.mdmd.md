# Live Documentation Explorer

## Metadata

- Layer: 3
- Archetype: component

## Authored

### Purpose

Document the visualization command center that renders the Live Doc graph as interactive views—currently Circuit Board (treemap), Local Map (3-column symbol view), and Force Graph—built as a static bundle for browser-based exploration. The planned [Membrane Map](membrane-map.mdmd.md) will unify Circuit Board and Local Map into a single zoomable treemap with directory-as-membrane nesting, reducing the view count from three to two (Membrane Map + Force Graph).

### Notes

- Created 2025-11-21 when `visualize-explorer.ts` was refactored into a modular `packages/explorer` structure with client and shared modules.
- The shared layer (`explorer/shared/`) builds the static bundle: the derived graph index from `packages/engine` plus the related markdown, with the HTML/CSS/JS assets. `graph.ts` there is the projection from the graph index to the node-and-link payload the views render; the client runs it on load (since 2026-09-28).
- The HTTP server (`explorer/server/`) was retired on 2026-03-09 in favour of static-only distribution. `graph.ts` and `buildAssets.ts` were relocated to `shared/`. The client paths that still fetched from it went on 2026-09-28.
- The client (`explorer/client/`) currently renders four view modes:
  - **Circuit Board**: Treemap layout where folders are nested rectangles and files are clickable cells.
  - **Local Map**: 3-column view (inbound → center → outbound) showing symbol-level connections with Bézier splines.
  - **Force Graph**: Force-directed layout for spatial discovery (accessibility relaxed vs primary views).
  - **Membrane Map** _(default view from 2026-03-31 to 2026-09-28)_: Zoomable treemap unifying Circuit Board and Local Map. Directory-as-membrane nesting with continuous pin spectrum (no discrete modes). See [Membrane Map architecture](membrane-map.mdmd.md).
  - **World Map** _(since 2026-09-28; the landing view when the bundle carries a board)_: the outside of everything. A board's things drawn by their kind, regions around what they hold, doors, wires with their basis and their evidence, declared crossings, and what things stand on, read from the board text the bundle carries and the graph, by the engine's `board.ts` and `boardGraph.ts` in the browser. `views/worldMap/` holds the camera, the geometry and the model as pure modules with tests, and one module that draws. The design is in [Boards](boards.mdmd.md) and the decisions log under "The World Map in the Explorer". Since 2026-09-29 a thing opens, by the wheel, a double-click or the link in its pinned panel, and its lid unfolds into its folder map, drawn by `views/worldMap/inside/` inside the same view: files as cards with their public symbols, in columns so that providers sit left of their consumers; folders as boxes whose rows are their neighbours with counts, opening the same way one level deeper; the thing's doors as pins on the walls, what it calls on the left and what it serves on the right; and a card's name opening the file in the Local Map at file scale. The decisions log records it under "The Inside of a Thing". A hover peeks and a click pins; in a pinned panel every name is a link, a thing's name pinning it and a file opening in the Local Map, so that every claim a panel makes can be traced (2026-09-29). What a thing stands on is another thing's code built in, a dotted line on the board to that thing, and what its manifests name, the strands beneath it. Labels keep off each other: a thing's name stays put, its second line goes when it would cover another label, and a region's label, a crossing's tag and a token's label step up or down until clear, after every camera move; Playwright's design audit checks it, and the estate sample under `samples/estate/` with it.
- The **[Membrane Map](membrane-map.mdmd.md)** succeeds Circuit Board and Local Map and has been the default view since 2026-03-31. The older views remain while their remaining behaviour is folded into it.
- The Local Map was split into a modular `localView/` directory on 2025-12-04 to support column-aware anchor registration, gradient connections, and type-reference edge rendering.
- Symbol anchors (`symbolAnchors.ts`, created 2025-12-03) normalise identifiers so connection routing works across different payload formats.

### Strategy

- **Membrane Map transition**: Fold what remains of Circuit Board and Local Map into the [Membrane Map](membrane-map.mdmd.md), then remove them.
- Complete LD-406 through LD-408 by consolidating shared data models, adding focus-mode filtering, and wiring accessibility/telemetry hooks.
- Ensure rendered edges, symbol anchors, and directional styling stay in parity with `live-docs inspect` CLI payloads—UI must never invent or omit graph facts.
- The Explorer is strictly read-only. Editing Live Docs or source files happens in the IDE; the Explorer provides "open in editor" links to bridge the gap.
- **Static distribution**: the bundle is `index.html`, `static/`, and `explorer-data.json`, which holds the graph index and the related markdown. Any static host serves it; this repository's is published to GitHub Pages.

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

- [packages/explorer/src/shared/graph.ts](../layer-4/packages/explorer/src/shared/graph.ts.mdmd.md)
- [packages/explorer/src/shared/buildAssets.ts](../layer-4/packages/explorer/src/shared/buildAssets.ts.mdmd.md)

#### Shared

- [packages/explorer/src/shared/types.ts](../layer-4/packages/explorer/src/shared/types.ts.mdmd.md)
- [packages/explorer/src/shared/bundledMarkdownScanner.ts](../layer-4/packages/explorer/src/shared/bundledMarkdownScanner.ts.mdmd.md)
- [packages/explorer/src/shared/staticBuilder.ts](../layer-4/packages/explorer/src/shared/staticBuilder.ts.mdmd.md)
- [packages/explorer/src/shared/staticExplorerData.ts](../layer-4/packages/explorer/src/shared/staticExplorerData.ts.mdmd.md) — What the bundle holds

#### Client Core

- [packages/explorer/src/client/index.ts](../layer-4/packages/explorer/src/client/index.ts.mdmd.md)
- [packages/explorer/src/client/types.ts](../layer-4/packages/explorer/src/client/types.ts.mdmd.md)
- [packages/explorer/src/client/dom.ts](../layer-4/packages/explorer/src/client/dom.ts.mdmd.md)
- [packages/explorer/src/client/errors.ts](../layer-4/packages/explorer/src/client/errors.ts.mdmd.md)
- [packages/explorer/src/client/detailPanel.ts](../layer-4/packages/explorer/src/client/detailPanel.ts.mdmd.md)
- [packages/explorer/src/client/markdown.ts](../layer-4/packages/explorer/src/client/markdown.ts.mdmd.md)
- [packages/explorer/src/client/pathfind.ts](../layer-4/packages/explorer/src/client/pathfind.ts.mdmd.md)
- [packages/explorer/src/client/graph-helpers.ts](../layer-4/packages/explorer/src/client/graph-helpers.ts.mdmd.md)

#### Bootstrap (entry point heuristics)

- [packages/explorer/src/client/bootstrap/index.ts](../layer-4/packages/explorer/src/client/bootstrap/index.ts.mdmd.md)
- [packages/explorer/src/client/bootstrap/entry-heuristics.ts](../layer-4/packages/explorer/src/client/bootstrap/entry-heuristics.ts.mdmd.md)

#### Panels (UI controls)

- [packages/explorer/src/client/panels/index.ts](../layer-4/packages/explorer/src/client/panels/index.ts.mdmd.md)
- [packages/explorer/src/client/panels/omnisearch.ts](../layer-4/packages/explorer/src/client/panels/omnisearch.ts.mdmd.md)
- [packages/explorer/src/client/panels/sources-view.ts](../layer-4/packages/explorer/src/client/panels/sources-view.ts.mdmd.md)
- [packages/explorer/src/client/panels/tuning.ts](../layer-4/packages/explorer/src/client/panels/tuning.ts.mdmd.md)

#### Persistence (state management)

- [packages/explorer/src/client/persistence/index.ts](../layer-4/packages/explorer/src/client/persistence/index.ts.mdmd.md)
- [packages/explorer/src/client/persistence/local-storage.ts](../layer-4/packages/explorer/src/client/persistence/local-storage.ts.mdmd.md)
- [packages/explorer/src/client/persistence/url-state.ts](../layer-4/packages/explorer/src/client/persistence/url-state.ts.mdmd.md)
- [packages/explorer/src/client/persistence/compressed-url-state.ts](../layer-4/packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md) — lz-string URL state compression for Membrane Map shareability

#### Views

- [packages/explorer/src/client/views/circuitView/index.ts](../layer-4/packages/explorer/src/client/views/circuitView/index.ts.mdmd.md) — Circuit Board controller (progressive disclosure treemap)
- [packages/explorer/src/client/views/circuitView/state.ts](../layer-4/packages/explorer/src/client/views/circuitView/state.ts.mdmd.md) — Immutable state for expand/collapse
- [packages/explorer/src/client/views/circuitView/aggregation.ts](../layer-4/packages/explorer/src/client/views/circuitView/aggregation.ts.mdmd.md) — Directory aggregate metrics
- [packages/explorer/src/client/views/squarify.ts](../layer-4/packages/explorer/src/client/views/squarify.ts.mdmd.md) — Squarified treemap layout algorithm (shared by Circuit Board and Membrane Map) — Squarified treemap layout algorithm
- [packages/explorer/src/client/views/circuitView/directoryTile.ts](../layer-4/packages/explorer/src/client/views/circuitView/directoryTile.ts.mdmd.md) — Directory tile DOM builder
- [packages/explorer/src/client/views/circuitView/breadcrumb.ts](../layer-4/packages/explorer/src/client/views/circuitView/breadcrumb.ts.mdmd.md) — Breadcrumb navigation DOM builder
- [packages/explorer/src/client/views/layoutUtils.ts](../layer-4/packages/explorer/src/client/views/layoutUtils.ts.mdmd.md)
- [packages/explorer/src/client/views/symbolAnchors.ts](../layer-4/packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md)

#### Local Map (modularised 2025-12-04)

- [packages/explorer/src/client/views/localView/index.ts](../layer-4/packages/explorer/src/client/views/localView/index.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/controller.ts](../layer-4/packages/explorer/src/client/views/localView/controller.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/render.ts](../layer-4/packages/explorer/src/client/views/localView/render.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/connections.ts](../layer-4/packages/explorer/src/client/views/localView/connections.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/runtime.ts](../layer-4/packages/explorer/src/client/views/localView/runtime.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/state.ts](../layer-4/packages/explorer/src/client/views/localView/state.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/types.ts](../layer-4/packages/explorer/src/client/views/localView/types.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/card-factory.ts](../layer-4/packages/explorer/src/client/views/localView/card-factory.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/column-factory.ts](../layer-4/packages/explorer/src/client/views/localView/column-factory.ts.mdmd.md)
- [packages/explorer/src/client/views/connection-geometry.ts](../layer-4/packages/explorer/src/client/views/connection-geometry.ts.mdmd.md) — Connection geometry utilities (shared by Local Map and Membrane Map)
- [packages/explorer/src/client/views/localView/layout-math.ts](../layer-4/packages/explorer/src/client/views/localView/layout-math.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/layout-measure.ts](../layer-4/packages/explorer/src/client/views/localView/layout-measure.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/layout-renderer.ts](../layer-4/packages/explorer/src/client/views/localView/layout-renderer.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/pan-zoom.ts](../layer-4/packages/explorer/src/client/views/localView/pan-zoom.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/subgraph-builder.ts](../layer-4/packages/explorer/src/client/views/localView/subgraph-builder.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/symbol-highlight.ts](../layer-4/packages/explorer/src/client/views/localView/symbol-highlight.ts.mdmd.md)

#### Membrane Map (in progress — see [architecture doc](membrane-map.mdmd.md))

- [packages/explorer/src/client/views/membraneView/types.ts](../layer-4/packages/explorer/src/client/views/membraneView/types.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/layout.ts](../layer-4/packages/explorer/src/client/views/membraneView/layout.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/hierarchy.ts](../layer-4/packages/explorer/src/client/views/membraneView/hierarchy.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/detail-levels.ts](../layer-4/packages/explorer/src/client/views/membraneView/detail-levels.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/edge-bundling.ts](../layer-4/packages/explorer/src/client/views/membraneView/edge-bundling.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/pin-state.ts](../layer-4/packages/explorer/src/client/views/membraneView/pin-state.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/routing.ts](../layer-4/packages/explorer/src/client/views/membraneView/routing.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/svg-connections.ts](../layer-4/packages/explorer/src/client/views/membraneView/svg-connections.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/browse-renderer.ts](../layer-4/packages/explorer/src/client/views/membraneView/browse-renderer.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/focal-overlay.ts](../layer-4/packages/explorer/src/client/views/membraneView/focal-overlay.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/aggregation.ts](../layer-4/packages/explorer/src/client/views/membraneView/aggregation.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/index.ts](../layer-4/packages/explorer/src/client/views/membraneView/index.ts.mdmd.md)

#### World Map

- [packages/explorer/src/client/views/worldMap/index.ts](../layer-4/packages/explorer/src/client/views/worldMap/index.ts.mdmd.md)
- [packages/explorer/src/client/views/worldMap/controller.ts](../layer-4/packages/explorer/src/client/views/worldMap/controller.ts.mdmd.md)
- [packages/explorer/src/client/views/worldMap/model.ts](../layer-4/packages/explorer/src/client/views/worldMap/model.ts.mdmd.md)
- [packages/explorer/src/client/views/worldMap/layout.ts](../layer-4/packages/explorer/src/client/views/worldMap/layout.ts.mdmd.md)
- [packages/explorer/src/client/views/worldMap/projection.ts](../layer-4/packages/explorer/src/client/views/worldMap/projection.ts.mdmd.md)
- [packages/explorer/src/client/views/worldMap/inside/model.ts](../layer-4/packages/explorer/src/client/views/worldMap/inside/model.ts.mdmd.md)
- [packages/explorer/src/client/views/worldMap/inside/layout.ts](../layer-4/packages/explorer/src/client/views/worldMap/inside/layout.ts.mdmd.md)
- [packages/explorer/src/client/views/worldMap/inside/panel.ts](../layer-4/packages/explorer/src/client/views/worldMap/inside/panel.ts.mdmd.md)

#### Static Distribution

- [packages/explorer/src/shared/staticExplorerData.ts](../layer-4/packages/explorer/src/shared/staticExplorerData.ts.mdmd.md) — What the bundle holds
- [packages/explorer/src/shared/staticBuilder.ts](../layer-4/packages/explorer/src/shared/staticBuilder.ts.mdmd.md) — Builds the bundle

## Evidence

- `npm run live-docs:visualize` builds a static Explorer bundle; manual smoke tests validate view switching and connection rendering.
- Unit tests for symbol anchor normalisation live in `symbolAnchors.test.ts`.
- The World Map's camera, geometry and model: [projection.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/projection.test.ts.mdmd.md), [layout.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/layout.test.ts.mdmd.md), [model.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/model.test.ts.mdmd.md); the inside's model and layout: [inside/model.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/inside/model.test.ts.mdmd.md), [inside/layout.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/inside/layout.test.ts.mdmd.md); and what it draws and does, driven through its handle and the pointer: [world-map.spec.ts](../layer-4/tests/e2e/world-map.spec.ts.mdmd.md); the estate sample on it: [world-map-estate.spec.ts](../layer-4/tests/e2e/world-map-estate.spec.ts.mdmd.md); and that no words land on each other, outside or inside: [world-map-design.spec.ts](../layer-4/tests/e2e/world-map-design.spec.ts.mdmd.md) over [design-audit.ts](../layer-4/tests/e2e/design-audit.ts.mdmd.md).
- December 2025 chat sessions (12/03–12/06) document the Local Map refinements: gradient connections, column-aware anchors, type-reference edges, and origin-over-barrel preference for inheritance links.
