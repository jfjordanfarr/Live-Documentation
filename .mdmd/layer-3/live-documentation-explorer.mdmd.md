# Live Documentation Explorer

## Metadata

- Layer: 3
- Archetype: component

## Authored

### Purpose

Describe the static Explorer that renders the canonical Live Doc graph and authored boards. The existing Local Map provides file and symbol detail; the native Force Graph provides a three-dimensional perspective on file connectivity. Their independent exploration pins and selected identity are shared. Directory browsing, authored boards and knowledge sources have their own presentations; no view retirement has been selected in the current design pass.

### Notes

- Created 2025-11-21 when `visualize-explorer.ts` was refactored into a modular `packages/explorer` structure with client and shared modules.
- The shared layer (`explorer/shared/`) builds the static bundle: the derived graph index from `packages/engine` plus the related markdown, with the HTML/CSS/JS assets. `graph.ts` there is the projection from the graph index to the node-and-link payload the views render; the client runs it on load (since 2026-09-28).
- The HTTP server (`explorer/server/`) was retired on 2026-03-09 in favour of static-only distribution. `graph.ts` and `buildAssets.ts` were relocated to `shared/`. The client paths that still fetched from it went on 2026-09-28.
- The client (`explorer/client/`) renders these views:
  - **Circuit Board**: Treemap layout where folders are nested rectangles and files are clickable cells.
  - **Local Map**: the file-scale view improved in place since 2026-10-02: one file with what it uses on the left and what uses it on the right, any number of files retained by their pins with every reference among them, their directories as bands behind the cards, explicit FROM/TO paths drawn only in the map's direction, and a deliberate zoom into the Force Graph and back. See "Independent exploration" below.
  - **Force Graph**: force-directed file connectivity, one counted line per file pair over the canonical references, camera focus on a requested file that keeps the viewing direction, the same pins and selection as the Local Map, and the zoom back into it with the subject held in place.
  - **Membrane Map** _(default view from 2026-03-31 to 2026-09-28)_: Zoomable treemap unifying Circuit Board and Local Map. Directory-as-membrane nesting with continuous pin spectrum (no discrete modes). See [Membrane Map architecture](membrane-map.mdmd.md). Since 2026-09-29 it is the inside of a thing on the World Map: a thing opens into it focused on its folder, the World Map is the crumb above the top folder, and a folder's first look is fitted above the zoom controls. The owner's call the same day was to bring it to the Local Map's quality in place and rename it; on 2026-10-02 they reversed that: the Local Map is improved in place and this view is its teacher (see [where it goes](membrane-map.mdmd.md#where-it-goes-2026-10-02)).
  - **World Map** _(since 2026-09-28; the landing view when the bundle carries a board)_: the outside of everything. A board's things drawn by their kind, regions around what they hold, doors, wires with their basis and their evidence, declared crossings, and what things stand on, read from the board text the bundle carries and the graph, by the engine's `board.ts` and `boardGraph.ts` in the browser. `views/worldMap/` holds the camera, the geometry and the model as pure modules with tests, and one module that draws. The design is in [Boards](boards.mdmd.md) and the decisions log under "The World Map in the Explorer". A thing opens, by the wheel past half the view, a double-click or the link in its pinned panel, into the Membrane Map focused on its folder (2026-09-29; for one afternoon it opened into a folder map of its own, retired on the owner's second look, which the decisions log keeps under "The Inside of a Thing"). A hover peeks and a click pins; in a pinned panel every name is a link, a thing's name pinning it and a file opening in the Local Map, so that every claim a panel makes can be traced (2026-09-29). What a thing stands on is another thing's code built in, a dotted line on the board to that thing, and what its manifests name, the strands beneath it. Labels keep off each other: a thing's name stays put, its second line goes when it would cover another label, and a region's label, a crossing's tag and a token's label step up or down until clear, after every camera move; Playwright's design audit checks it, and the estate sample under `samples/estate/` with it.
- The **[Membrane Map](membrane-map.mdmd.md)** was the default view from 2026-03-31 to 2026-09-28 and is the inside of a thing on the World Map since 2026-09-29. The direction of measurement turned on 2026-10-02: the Local Map, which the owner kept on 2026-09-29 for its "hard-earned design intuition and style", is now the view grown in place, and the Membrane Map is what its pictures of many files are measured against. The Circuit Board and the Membrane Map remain until the owner retires them; no view's name is settled.
- The Local Map was split into a modular `localView/` directory on 2025-12-04 to support column-aware anchor registration, gradient connections, and type-reference edge rendering.
- Symbol anchors (`symbolAnchors.ts`, created 2025-12-03) normalise identifiers so connection routing works across different payload formats.

### Strategy

- **Native Local Map and Force Graph**: the [October 2 review](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-02.1.record.md#turn-7) reopened the earlier replacement plan. Improve the existing views and preserve identity, independent branches and orientation during perspective changes. World Map scope semantics remain a separate design question.
- Ensure rendered edges, symbol anchors, and directional styling stay in parity with `live-docs inspect` CLI payloads—UI must never invent or omit graph facts.
- Source and generated Live Docs remain external to the static viewer. The World Map can retain moved placements in the browser and download updated board text.
- **Static distribution**: the bundle is `index.html`, `static/`, and `explorer-data.json`, which holds the graph index and the related markdown. Any static host serves it; this repository's is published to GitHub Pages.
- **Links share explorations; files carry authorship** (proposed 2026-10-03, not settled): the owner would bound what a link can share by what readable, uncompressed URL parameters can carry, so that a colleague can see what a link does before opening it, and would have any change authored into a persisted file, which any copy of the Explorer, hosted or not, can write out afresh. Recorded with the agent's reading in `AI-Agent-Workspace/Memory/direction.md`; the compressed `?s=` state is unchanged.

### Independent exploration

Pinning a symbol or file retains its connections without removing other pins. The Local Map displays the union of those neighborhoods and every relationship between the retained files. Cyclic components share a column; skipped ranks and cycles route above the occupied columns. Counts identify connections outside the current disclosure, including those hidden by filters. Explicit pins and the selected file remain visible through filtering. The native perspective controls preserve the selected identity’s screen position; manual camera gestures end automatic tracking.

### Pathfinding Rendering

The Local Map supports **path mode** when `FROM` and `TO` inputs are populated. The current implementation renders a single shortest path as a linear chain of hop columns (`FROM → Via 1 → Via 2 → … → TO`). Pathfinding uses BFS with a single-parent map (`Map<string, string>`), so when multiple shortest paths exist, only one arbitrary path is returned. Since 2026-10-03 the default search depth is the graph's simple-path bound rather than an arbitrary ten hops, so the estate's thirteen-file route from an Oracle table to a Portal page is found; callers may still pass an explicit limit.

A path is drawn only in the direction the map reads. Inside a system what a file offers leaves on the right and what it uses enters on the left, so `FROM` must offer and `TO` must use: the path is found by walking `FROM`'s dependents, and every wire leaves the earlier file's blue pin and enters the later file's green pin. When the two files connect only the other way (`FROM` depends on `TO`), nothing is drawn: the status says no path runs that way and offers the reverse question as a link, which swaps the two ends and draws. This is the owner's rule of 2025-12-18, "like a google search with an obvious typo, we should show no results and offer the reverse (via hyperlink)... rather than draw the crazy connectors which span their entire nodes, reaching backwards"; the drawing had run against it since, and the still-picture instrument measured every wire backward on 2026-10-01. A reference between two files of the path that runs against it (an earlier file depending on a later one) is not drawn either; the status counts them so that the picture says what it leaves out. The file selected before the path stays selected through it, so Clear returns to that file's columns and its address; a path has no selection of its own unless none existed.

Three historical proposals address this limitation; they remain open rather than authorized work in the October 2 pass (see `AI-Agent-Workspace/Notes/multi-path-visualization-design.md` for full specification with ASCII diagrams):

1. **All-Shortest-Paths Merged DAG** — Replace the single-parent BFS with a multi-parent variant (`Map<string, Set<string>>`) to reconstruct every shortest path. Where paths diverge, the hop column stacks multiple cards vertically. Connections fan out and converge across the DAG.

2. **Near-Miss (+1) Paths** — After finding shortest paths at depth _k_, continue BFS one additional level to collect paths of length _k_+1. These render with dashed borders, reduced opacity, and dashed connection lines. A toolbar toggle controls visibility (default off).

3. **Symbol-Divergent Paths Through Same File** — Port the CLI's symbol-aware BFS (`pathfind-symbol.ts`) to the Explorer client. When two shortest paths traverse the same file sequence via different symbols, multiple connection lines route through distinct symbol anchors on the same card. Each chain gets a unique color; hovering highlights the full chain end-to-end.

These proposals were originally described against the multi-hop rendering architecture in `AI-Agent-Workspace/Notes/multi-hop-local-map-architecture.md` (dynamic column count, hop-aware anchors, HopChain data model). The truncating exploration renderer was retired on October 2, 2026; explicit pathfinding and hop-aware anchors remain. Any implementation must be reconsidered against the current independent-branch model.

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
- [packages/explorer/src/client/download.ts](../layer-4/packages/explorer/src/client/download.ts.mdmd.md) — The exports Knowledge Sources offers: the docs as one flattened markdown file or a ZIP

#### Bootstrap (entry point heuristics)

- [packages/explorer/src/client/bootstrap/index.ts](../layer-4/packages/explorer/src/client/bootstrap/index.ts.mdmd.md)
- [packages/explorer/src/client/bootstrap/entry-heuristics.ts](../layer-4/packages/explorer/src/client/bootstrap/entry-heuristics.ts.mdmd.md)

#### Panels (UI controls)

- [packages/explorer/src/client/panels/omnisearch.ts](../layer-4/packages/explorer/src/client/panels/omnisearch.ts.mdmd.md)
- [packages/explorer/src/client/panels/sources-view.ts](../layer-4/packages/explorer/src/client/panels/sources-view.ts.mdmd.md)
- [packages/explorer/src/client/panels/tuning.ts](../layer-4/packages/explorer/src/client/panels/tuning.ts.mdmd.md)

#### Persistence (state management)

- [packages/explorer/src/client/persistence/index.ts](../layer-4/packages/explorer/src/client/persistence/index.ts.mdmd.md)
- [packages/explorer/src/client/persistence/local-storage.ts](../layer-4/packages/explorer/src/client/persistence/local-storage.ts.mdmd.md)
- [packages/explorer/src/client/persistence/url-state.ts](../layer-4/packages/explorer/src/client/persistence/url-state.ts.mdmd.md)
- [packages/explorer/src/client/persistence/compressed-url-state.ts](../layer-4/packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md) — Portable compressed selection and pin state, also carrying Membrane directory disclosure
- [packages/explorer/src/client/persistence/place.ts](../layer-4/packages/explorer/src/client/persistence/place.ts.mdmd.md) — The place an address names (view, file, open folders, path ends), so two addresses can be compared
- [packages/explorer/src/client/persistence/history.ts](../layer-4/packages/explorer/src/client/persistence/history.ts.mdmd.md) — Back and Forward: a move between places is an entry, a change within a place rewrites the current one (2026-09-30)

#### Views

- [packages/explorer/src/client/views/circuitView/index.ts](../layer-4/packages/explorer/src/client/views/circuitView/index.ts.mdmd.md) — Circuit Board controller (progressive disclosure treemap)
- [packages/explorer/src/client/views/circuitView/state.ts](../layer-4/packages/explorer/src/client/views/circuitView/state.ts.mdmd.md) — Immutable state for expand/collapse
- [packages/explorer/src/client/views/circuitView/aggregation.ts](../layer-4/packages/explorer/src/client/views/circuitView/aggregation.ts.mdmd.md) — Directory aggregate metrics
- [packages/explorer/src/client/views/squarify.ts](../layer-4/packages/explorer/src/client/views/squarify.ts.mdmd.md) — Squarified treemap layout algorithm (shared by Circuit Board and Membrane Map) — Squarified treemap layout algorithm
- [packages/explorer/src/client/views/circuitView/directoryTile.ts](../layer-4/packages/explorer/src/client/views/circuitView/directoryTile.ts.mdmd.md) — Directory tile DOM builder
- [packages/explorer/src/client/views/circuitView/breadcrumb.ts](../layer-4/packages/explorer/src/client/views/circuitView/breadcrumb.ts.mdmd.md) — Breadcrumb navigation DOM builder
- [packages/explorer/src/client/views/layoutUtils.ts](../layer-4/packages/explorer/src/client/views/layoutUtils.ts.mdmd.md)
- [packages/explorer/src/client/views/symbolAnchors.ts](../layer-4/packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md)
- [packages/explorer/src/client/views/forceGraphView.ts](../layer-4/packages/explorer/src/client/views/forceGraphView.ts.mdmd.md) — The Force Graph: the 3D force-directed view with the related-document overlay, file focus and the handoff to the Local Map
- [packages/explorer/src/client/views/forceGraphCamera.ts](../layer-4/packages/explorer/src/client/views/forceGraphCamera.ts.mdmd.md) — Pure camera arithmetic: approach a file without changing the direction the person looks from (2026-10-02)
- [packages/explorer/src/client/views/fileConnections.ts](../layer-4/packages/explorer/src/client/views/fileConnections.ts.mdmd.md) — One counted line per file pair for the overview; the canonical symbol edges are untouched (2026-10-03)
- [packages/explorer/src/client/views/perspectiveTransition.ts](../layer-4/packages/explorer/src/client/views/perspectiveTransition.ts.mdmd.md) — The deliberate zoom between the Local Map and the Force Graph: cards fold to named points at their force positions and unfold back (2026-10-03)
- [packages/explorer/src/client/views/zoomBarrier.ts](../layer-4/packages/explorer/src/client/views/zoomBarrier.ts.mdmd.md) — The wheel boundary between the two perspectives that needs a second nudge to cross, independent of rendering (2026-10-03)

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
- [packages/explorer/src/client/views/localView/branches.ts](../layer-4/packages/explorer/src/client/views/localView/branches.ts.mdmd.md) — Discloses the retained files and ranks them provider-first, breaking each cycle at its feedback references (2026-10-05)
- [packages/explorer/src/client/views/localView/branch-order.ts](../layer-4/packages/explorer/src/client/views/localView/branch-order.ts.mdmd.md) — Orders the band rows and the files within them by a barycenter sweep, bundles the wires of one offering pin through the columns they pass together, and reserves each bundle a lane inside a directory that holds an end of every wire in it (2026-10-05)
- [packages/explorer/src/client/views/localView/branch-renderer.ts](../layer-4/packages/explorer/src/client/views/localView/branch-renderer.ts.mdmd.md) — Draws the retained branches with the native cards inside the Membrane Map's directory bands, leaving the lanes between cards and counting a card's back references (2026-10-02, 2026-10-05)
- [packages/explorer/src/client/views/localView/branch-routing.ts](../layer-4/packages/explorer/src/client/views/localView/branch-routing.ts.mdmd.md) — The native curve as a pure function, and the threaded route of a skipped reference through its lanes: curve, lane, curve, never backward and never through a card (2026-10-05)
- [packages/explorer/src/client/views/localView/layout-measure.ts](../layer-4/packages/explorer/src/client/views/localView/layout-measure.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/layout-renderer.ts](../layer-4/packages/explorer/src/client/views/localView/layout-renderer.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/pan-zoom.ts](../layer-4/packages/explorer/src/client/views/localView/pan-zoom.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/subgraph-builder.ts](../layer-4/packages/explorer/src/client/views/localView/subgraph-builder.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/symbol-highlight.ts](../layer-4/packages/explorer/src/client/views/localView/symbol-highlight.ts.mdmd.md)

#### Membrane Map (in progress — see [architecture doc](membrane-map.mdmd.md))

- [packages/explorer/src/client/views/membraneView/types.ts](../layer-4/packages/explorer/src/client/views/membraneView/types.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/layout.ts](../layer-4/packages/explorer/src/client/views/membraneView/layout.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/pin-layout.ts](../layer-4/packages/explorer/src/client/views/membraneView/pin-layout.ts.mdmd.md) — Pure dependency-flow layout for the pin-active state: relevant nodes, BFS columns and directory bands; the bands are shared with the Local Map
- [packages/explorer/src/client/views/membraneView/pin-active-renderer.ts](../layer-4/packages/explorer/src/client/views/membraneView/pin-active-renderer.ts.mdmd.md) — Draws the pin-active columns and bands in place of the treemap
- [packages/explorer/src/client/views/membraneView/animation.ts](../layer-4/packages/explorer/src/client/views/membraneView/animation.ts.mdmd.md) — FLIP animation between a teardown and a rebuild of the membrane DOM
- [packages/explorer/src/client/views/membraneView/hierarchy.ts](../layer-4/packages/explorer/src/client/views/membraneView/hierarchy.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/detail-levels.ts](../layer-4/packages/explorer/src/client/views/membraneView/detail-levels.ts.mdmd.md)
- [packages/explorer/src/client/views/pin-state.ts](../layer-4/packages/explorer/src/client/views/pin-state.ts.mdmd.md)
- [packages/explorer/src/client/views/membraneView/routing.ts](../layer-4/packages/explorer/src/client/views/membraneView/routing.ts.mdmd.md)
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

#### Static Distribution

- [packages/explorer/src/shared/staticExplorerData.ts](../layer-4/packages/explorer/src/shared/staticExplorerData.ts.mdmd.md) — What the bundle holds
- [packages/explorer/src/shared/staticBuilder.ts](../layer-4/packages/explorer/src/shared/staticBuilder.ts.mdmd.md) — Builds the bundle

## Evidence

- `npm run live-docs:visualize` builds a static Explorer bundle; manual smoke tests validate view switching and connection rendering.
- Unit tests for symbol anchor normalisation live in `symbolAnchors.test.ts`.
- The Local Map and the Force Graph since October 2026: retained branches and their references, [local-map-branches.spec.ts](../layer-4/tests/e2e/local-map-branches.spec.ts.mdmd.md); a path drawn only in the map's direction, the reverse offered and Clear returning the camera, [local-map-path.spec.ts](../layer-4/tests/e2e/local-map-path.spec.ts.mdmd.md); file focus from a URL, a click and a search, [force-graph-focus.spec.ts](../layer-4/tests/e2e/force-graph-focus.spec.ts.mdmd.md); the deliberate zoom and its boundary, [perspective-zoom.spec.ts](../layer-4/tests/e2e/perspective-zoom.spec.ts.mdmd.md); Back and Forward, [explorer-history.spec.ts](../layer-4/tests/e2e/explorer-history.spec.ts.mdmd.md); the directory bands, [membrane-directory-bands.spec.ts](../layer-4/tests/e2e/membrane-directory-bands.spec.ts.mdmd.md).
- The still-picture deck: [still-picture.spec.ts](../layer-4/tests/e2e/still-picture.spec.ts.mdmd.md) over [still-picture.ts](../layer-4/tests/e2e/still-picture.ts.mdmd.md) and [still-picture-geometry.ts](../layer-4/tests/e2e/still-picture-geometry.ts.mdmd.md) measures what each view's named states show legibly, against the predictions in `AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md`.
- The World Map's camera, geometry and model: [projection.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/projection.test.ts.mdmd.md), [layout.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/layout.test.ts.mdmd.md), [model.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/model.test.ts.mdmd.md); and what it draws and does, driven through its handle and the pointer: [world-map.spec.ts](../layer-4/tests/e2e/world-map.spec.ts.mdmd.md); the estate sample on it: [world-map-estate.spec.ts](../layer-4/tests/e2e/world-map-estate.spec.ts.mdmd.md); and that no words land on each other, on the board or on a thing opened into the Membrane Map: [world-map-design.spec.ts](../layer-4/tests/e2e/world-map-design.spec.ts.mdmd.md) over [design-audit.ts](../layer-4/tests/e2e/design-audit.ts.mdmd.md).
- December 2025 chat sessions (12/03–12/06) document the Local Map refinements: gradient connections, column-aware anchors, type-reference edges, and origin-over-barrel preference for inheritance links.
