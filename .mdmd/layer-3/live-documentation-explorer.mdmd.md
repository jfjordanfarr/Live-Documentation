# Live Documentation Explorer

_Current as of 2026-10-14._

## Metadata

- Layer: 3
- Archetype: component

## Authored

### Purpose

Describe the static Explorer that renders the canonical Live Doc graph and authored boards. The existing Local Map provides file and symbol detail; the native Force Graph provides a three-dimensional perspective on file connectivity. Their independent exploration pins and selected identity are shared. Navigation has three views: Knowledge Sources, World Map and Local Map. The Local Map owns directory browsing and both 2D and 3D representations.

### Notes

- Created 2025-11-21 when `visualize-explorer.ts` was refactored into a modular `packages/explorer` structure with client and shared modules.
- The shared layer (`explorer/shared/`) builds the static bundle: the derived graph index from `packages/engine` plus the related markdown, with the HTML/CSS/JS assets. `graph.ts` there is the projection from the graph index to the node-and-link payload the views render; the client runs it on load (since 2026-09-28).
- The HTTP server (`explorer/server/`) was retired on 2026-03-09 in favour of static-only distribution. `graph.ts` and `buildAssets.ts` were relocated to `shared/`. The client paths that still fetched from it went on 2026-09-28.
- The client (`explorer/client/`) renders these views:
  - **Knowledge Sources**: the graph’s inventory, related documentation and exports.
  - **Local Map**: the file-scale view improved in place since 2026-10-02: one file with what it uses on the left and what uses it on the right, any number of files retained by their pins with every reference among them, their directories as bands behind the cards, paths asked through the search bar and drawn only in the map's direction, and explicit 2D/3D controls for changing perspective. See "Independent exploration" below.
  - The Local Map’s **3D representation**: force-directed file connectivity, one counted line per file pair over the canonical references, camera focus on a requested file that keeps the viewing direction, the same pins and selection as the Local Map, and the explicit return to it with the subject held in place.
  - **World Map** _(since 2026-09-28; the landing view when the bundle carries a board)_: the outside of everything. A board's things drawn by their kind, regions around what they hold, doors, wires with their basis and their evidence, declared crossings, and what things stand on, read from the board text the bundle carries and the graph, by the engine's `board.ts` and `boardGraph.ts` in the browser. `views/worldMap/` holds the camera, the geometry and the model as pure modules with tests, and one module that draws. The design is in [Boards](boards.mdmd.md) and the decisions log under "The World Map in the Explorer". A thing opens, by the wheel past half the view, a double-click or the link in its pinned panel, into the Local Map focused on its folder, in the remembered representation (2026-10-12). A hover peeks and a click pins; in a pinned panel every name is a link, a thing's name pinning it and a file opening in the Local Map, so that every claim a panel makes can be traced (2026-09-29). What a thing stands on is another thing's code built in, a dotted line on the board to that thing, and what its manifests name, the strands beneath it. Labels keep off each other: a thing's name stays put, its second line goes when it would cover another label, and a region's label, a crossing's tag and a token's label step up or down until clear, after every camera move; Playwright's design audit checks it, and the estate sample under `samples/estate/` with it.
- The owner retired the Circuit Board and Membrane Map in [the October 12 walkthrough](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4). Their shared directory grouping survives inside the Local Map; the [Membrane Map design](membrane-map.mdmd.md) remains historical provenance.
- The Local Map was split into a modular `localView/` directory on 2025-12-04 to support column-aware anchor registration, gradient connections, and type-reference edge rendering.
- Symbol anchors (`symbolAnchors.ts`, created 2025-12-03) normalise identifiers so connection routing works across different payload formats.

### Strategy

- **Native Local Map and Force Graph**: the [October 2 review](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-02.1.record.md#turn-7) reopened the earlier replacement plan. Improve the existing views and preserve identity, independent branches and orientation during perspective changes. World Map scope semantics remain a separate design question.
- Ensure rendered edges, symbol anchors, and directional styling stay in parity with `live-docs inspect` CLI payloads—UI must never invent or omit graph facts.
- Source and generated Live Docs remain external to the static viewer. The World Map can retain moved placements in the browser and download updated board text.
- **Static distribution**: the bundle is `index.html`, `static/`, and `explorer-data.json`, which holds the graph index and the related markdown. Any static host serves it; this repository's is published to GitHub Pages.
- **Links share explorations; files carry authorship** (proposed 2026-10-03, not settled): the owner would bound what a link can share by what readable, uncompressed URL parameters can carry, so that a colleague can see what a link does before opening it, and would have any change authored into a persisted file, which any copy of the Explorer, hosted or not, can write out afresh. Recorded with the agent's reading in `AI-Agent-Workspace/Memory/direction.md`; compressed `?s=` explorations remain supported; version 2 carries the Local Map representation and reads the earlier view names.

### Independent exploration

The 2D/3D setting is independent of the active navigation view. Browser storage remembers it when leaving and returning; `view=local&mode=2d` or `mode=3d` shares it explicitly. Old `view=force` links open Local Map in 3D; `membrane` and `circuit` links open it in 2D. Compressed version 1 links migrate their selected file, pins and deepest opened directories. A path restores before first paint without overriding the chosen representation.

Direct file links, pinned branches and paths share the directory-aware layout from their first drawing. A file link discloses a neighborhood without storing implicit pins. A shared path is resolved before first paint, and clearing the destination restores the exploration and its camera. The [owner’s October 12 walkthrough](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3) exposed and retired the separate initial and path renderers. Scrolling zooms within the chosen perspective; the controls say 2D and 3D, with full names in their tooltips and no density suggestion.

Pinning a symbol or file retains its connections without removing other pins. The Local Map displays the union of those neighborhoods and every relationship between the retained files, and the subject's own neighborhood beside them while the subject holds no pin of its own, so that pinning elsewhere expands the picture without losing the thing being looked at. Clicks pin what they name and nothing else (the owner's challenge of 2026-10-14 and their rules of 2026-10-15): a click on a card pins the file whole; a click on a symbol of a file pinned whole narrows the pin to that symbol; further symbols add; a pinned symbol clicked again is released; and releasing the file's last symbol leaves the file pinned whole, so that a card leaves the picture only by its close or the tray. A pin never moves the subject. The subject moves by the card's recentre control, by a choice in the search bar, by the detail panel's Local Map action, or when it is closed; the double-click that once recentred is gone, since its two clicks reached the card first. One grammar serves every input: every meaning has a visible target, a tap, a click and Enter do the same, hover only previews, and the 2D map pans and pinches by pointer events, so a finger works. Cycles are broken at feedback references, drawn as laces with their route on hover; skipped ranks route through reserved lanes between cards. Counts identify connections outside the current disclosure, including those hidden by filters. Explicit pins and the selected file remain visible through filtering. The native perspective controls preserve the selected identity’s screen position; manual camera gestures end automatic tracking.

The lower-right pin tray lists explicit directory, file and symbol selections newest first, in an order preserved by shared links. Its focus action brings an item into view without adding a pin. Releasing a directory removes only its own opening; independently opened descendants and file/symbol pins survive. The separate **Clear pins inside** action releases the directory and contained selections together, while outside pins can still require some of its files. Clear all includes directory openings and removes pin-driven focus. With no retained selections or selected file, 2D shows the scan root's immediate files and closed child directories without manufacturing a root pin; 3D restores normal visibility. The owner approved these distinctions in [the October 14 implementation request](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

Membrane names retain their open action. A separate ancestry control unfolds ancestor choices at viewport text size, with a temporary enclosure around the currently drawn members on hover or keyboard focus. Choosing an ancestor opens its immediate contents. This provides access to the root while keeping single-child ancestor chains compressed in the main picture.

### Competing layout preferences

**Compact / Relaxed** is one packing preference for both representations, selected beside 2D/3D. Compact favors a smaller footprint; Relaxed spends space on clearance and regularity. Advanced controls under Tuning expose the values behind both profiles. Changed packing values read as Custom; coupling and symbol-size controls remain independent and survive preset switches. Settings persist locally, travel with shared links and can be exported as JSON. Older links without layout settings keep the viewer's preferences. The owner approved this grammar and its advanced controls in [the October 13 implementation request](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

The representation controls sit at the bottom center. Compact and Relaxed are named icon buttons with pressed states; the tuning button identifies a customized layout and opens the existing advanced controls. The pin tray occupies its own lower-right surface and coordinates with the Details drawer.

The 2D layout prices wire distance, crossings, picture height, ordering churn, membrane evenness, row alignment and boundary-step count together. Membrane Evenness prices the distance a boundary rises or falls; **Membrane Simplicity** prices each nonzero step, so several small changes can lose to fewer larger ones. Compact uses narrower column/card/directory gaps and a stronger height cost. Relaxed uses stronger shape preferences, with simplicity 200, evenness 2 and row levelness 2; Compact uses 100/1/0.25 respectively. Both value alignment, while Relaxed permits a greater wire-length tradeoff for composition, as the owner clarified in [the review](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-8--relaxed-should-spend-wire-length-on-composition). These are preferences in a local competition, not guarantees that every individual signal improves in every scene.

In 3D, one line represents a file pair, with its documented reference count on hover. Imports and signature references count once each; multiple documented references sharing visible endpoints carry multiplicity, while the canonical graph retains all evidence. More coupling shortens the preferred surface gap logarithmically, bounded by size-aware collision clearance. Sphere volume grows from public-symbol count plus one baseline unit. Both presets retain the same coupling and size meaning: position suggests coupling, size suggests exposed interface, and the preset controls packing. These counts describe documented structure, not runtime call frequency or complexity. Related-document overlays use the same projection in the browser and command.

**Connections or Structure** is the 3D Local Map's layout, a choice inside 3D shown beside its button and remembered like the perspective (2026-10-14). In the connections layout the documented references pull and are drawn: the emergent network of what the code does. In the structure layout every file and related document hangs from its directory's hub and every hub from its parent's, up to the scan root, by one containment link each: the emergent tree of what the file system declares; a hub holding nothing but one child collapses into it, as the 2D bands collapse such chains. Hubs are amber, and a hub's volume is the sum of its members' volumes, so that size means exposed surface at every scale. Only the links of the chosen layout are given to the spring force; the other kind stays in the data, pulls nothing and counts for nothing. Containment is drawn as the structure it is; a reference is drawn in the structure layout only on demand, for the hovered file, within and out of the hovered hub's subtree, among the retained files, and along a path. Switching layouts keeps every file where it stands and starts each new hub at the centroid of its members, so the simulation folds the network into the tree before the eye, and unfolds it on the way back. Directory hover reveals its members; clicking retains the directory and frames the hub with its members. The owner chose this separation after seeing hubs inside the connectivity layout ([Turns 3 and 4 of the October 14 record](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-3)). There are no 3D enclosing volumes.

Hover in 3D temporarily reveals the inspected file's incident connections, including a file outside the retained scope. Leaving restores the current pins, directories or path. Wheel zoom preserves the inspected point's projection and never reverses a gesture to enforce a distance limit reached through another input method. In 2D, matching wires retain their SVG elements through re-layout; entering wires fade with their endpoint cards, and frame redraws do not reset the layer's opacity. A perspective transition captures that current wire presence too.

After the initial ordering starts, the continuing search alternates ordering trials with proposed joins of neighboring flat boundary runs. Each join re-solves cards, wire slots and containing membranes under the same padding, separation and overlap constraints. A proposal wins only if its complete score improves; the browser measures it again before adoption. Search pauses during animated moves, and changing a weight starts a new search while preserving the displayed subject. This is deterministic local search, not a global optimum claim for step count. A zero simplicity weight disables alignment proposals; disabling continuing search or forcing one ordering seed disables all continuing trials.

The layout lab's `refine` command runs the same competition from captured card measurements and exports initial/final geometry and every trial. The measurement cache preserves the renderer's resolved endpoint identity, including duplicate symbols and file/asset hubs, so pricing cannot improve by omitting a visible connection. The [browser regression](../layer-4/tests/e2e/local-map-simplicity.spec.ts.mdmd.md) compares final browser and headless geometry exactly on the estate and warehouse.

Every lab command accepts `--preset compact|relaxed`. `spatial <bundle/scope>` runs the shared 3D forces and writes counts, radii, coordinates, pair distances and overlap measures; the full filtered graph supplies the forces while the named scope supplies attention. It supports test, asset and related-documentation filters and `--layout connections|structure`; its report says of every link whether it pulls in that layout, and containment carries no documented-reference count. `refine`, `verify` and `spatial` accept the page's exported settings through `--config @file`. Tuning takes over an unfinished automatic camera fit before re-layout; instant/reduced-motion placements also keep the subject and redraw wires onto the final pins. The [preset regressions](../layer-4/tests/e2e/local-map-presets.spec.ts.mdmd.md) exercise these interactions in real browsers.

### The search bar

One search serves the whole Explorer (2026-10-14): a field at the top of every view, reached by Ctrl+P, in place of the earlier dialog and the FROM/TO toolbar. A few typed words find directories by their name, files by name, path and symbols, and the symbols themselves; the results are grouped the way the declared structure reads, directory, then file, then the file's matched symbols, five at a time with a fold that lists the rest. Choosing a row pins what it names: a directory is opened, a file retained with all its symbols, a symbol retained alone, in the Local Map, which opens if another view was showing. The chosen thing is the newest pin, and the field shows the newest pin as the person goes on pinning by clicking, so the field reads as "where a path would start". Once anything is pinned a map marker and a second field appear for the end of a path.

The second field offers only what a path from the newest pin can reach (the owner's ask the same evening, 2026-10-14): one breadth-first walk from the pin's files, forward along dependents, which the map draws, and in reverse along dependencies, which the reverse question offers. Each offered file says how far, "4 files" when the path would draw and "4 files, the other way" when only the reverse question would come; a directory offered by its name says what its nearest file says, one the map can draw to before one the other way; symbols sit under their file. The files the words match but no path connects are folded under a count, "3 more files match, but no path connects them", and open into faded rows marked "no path" that can still be asked, so that a typed name is never silently absent. When nothing connects to the pin, the field's placeholder says so. The walk is the engine's, the one under the CLI's searches, and `inspect --reachable` lists the same files with their hops.

### Pathfinding Rendering

The Local Map supports **path mode** once a destination is chosen in the search bar's second field: the path is asked at once, from the newest pin to what was chosen, a file, one symbol of a file, or a directory, in which case the search leaves from, or arrives at, any file inside it. The current implementation renders a single shortest path through the same optimized scene as a file neighborhood or retained exploration. Its files remain ordered from provider to consumer, inside their directory membranes, with compact rows for the path’s references. Pathfinding uses BFS with a single-parent map (`Map<string, string>`), so when multiple shortest paths exist, only one arbitrary path is returned. Since 2026-10-03 the default search depth is the graph's simple-path bound rather than an arbitrary ten hops, so the estate's thirteen-file route from an Oracle table to a Portal page is found; callers may still pass an explicit limit. A path's address is the pins and the destination in the compressed snapshot.

A path is drawn only in the direction the map reads. Inside a system what a file offers leaves on the right and what it uses enters on the left, so the start must offer and the end must use: the path is found by walking the start's dependents, and every wire leaves the earlier file's blue pin and enters the later file's green pin. When the two files connect only the other way (the start depends on the end), nothing is drawn: the status says no path runs that way and offers the reverse question as a link, which pins the destination, newest, and draws the way back. This is the owner's rule of 2025-12-18, "like a google search with an obvious typo, we should show no results and offer the reverse (via hyperlink)... rather than draw the crazy connectors which span their entire nodes, reaching backwards"; the drawing had run against it since, and the still-picture instrument measured every wire backward on 2026-10-01. A reference between two files of the path that runs against it (an earlier file depending on a later one) is not drawn either; the status counts them so that the picture says what it leaves out. Choosing a new subject in the bar while a destination stands asks the path again from it; a click on the drawn picture, such as pinning a symbol of a hop, leaves the path into exploration and forgets the destination, and clearing the destination does the same, the pins kept.

Three historical proposals address this limitation; they remain open rather than authorized work in the October 2 pass (see `AI-Agent-Workspace/Notes/multi-path-visualization-design.md` for full specification with ASCII diagrams):

1. **All-Shortest-Paths Merged DAG** — Replace the single-parent BFS with a multi-parent variant (`Map<string, Set<string>>`) to reconstruct every shortest path. Where paths diverge, the hop column stacks multiple cards vertically. Connections fan out and converge across the DAG.

2. **Near-Miss (+1) Paths** — After finding shortest paths at depth _k_, continue BFS one additional level to collect paths of length _k_+1. These render with dashed borders, reduced opacity, and dashed connection lines. A toolbar toggle controls visibility (default off).

3. **Symbol-Divergent Paths Through Same File** — Port the CLI's symbol-aware BFS (`pathfind-symbol.ts`) to the Explorer client. When two shortest paths traverse the same file sequence via different symbols, multiple connection lines route through distinct symbol anchors on the same card. Each chain gets a unique color; hovering highlights the full chain end-to-end.

These proposals were originally described against the multi-hop rendering architecture in `AI-Agent-Workspace/Notes/multi-hop-local-map-architecture.md` (dynamic column count, hop-aware anchors, HopChain data model). The truncating exploration renderer was retired on October 2, 2026; explicit pathfinding remains, using one card and one anchor identity per file. Any implementation must be reconsidered against the current independent-branch model.

> **Note (2026-03-22)**: Multi-path pathfinding may be reimplemented on the [Membrane Map](membrane-map.mdmd.md) spatial substrate rather than the current column layout. The later October 12 correction uses the Local Map’s common directory-aware scene; it does not implement this separate historical proposal.

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
- [packages/explorer/src/client/layout-presets.ts](../layer-4/packages/explorer/src/client/layout-presets.ts.mdmd.md) — Shared packing profiles and portable advanced settings
- [packages/explorer/src/client/dom.ts](../layer-4/packages/explorer/src/client/dom.ts.mdmd.md)
- [packages/explorer/src/client/errors.ts](../layer-4/packages/explorer/src/client/errors.ts.mdmd.md)
- [packages/explorer/src/client/detailPanel.ts](../layer-4/packages/explorer/src/client/detailPanel.ts.mdmd.md)
- [packages/explorer/src/client/markdown.ts](../layer-4/packages/explorer/src/client/markdown.ts.mdmd.md)
- [packages/explorer/src/client/pathfind.ts](../layer-4/packages/explorer/src/client/pathfind.ts.mdmd.md)
- [packages/explorer/src/client/graph-helpers.ts](../layer-4/packages/explorer/src/client/graph-helpers.ts.mdmd.md)
- [packages/explorer/src/client/download.ts](../layer-4/packages/explorer/src/client/download.ts.mdmd.md) — The exports Knowledge Sources offers: the docs as one flattened markdown file or a ZIP, and the panel's facts as JSON

#### Bootstrap (entry point heuristics)

- [packages/explorer/src/client/bootstrap/index.ts](../layer-4/packages/explorer/src/client/bootstrap/index.ts.mdmd.md)
- [packages/explorer/src/client/bootstrap/entry-heuristics.ts](../layer-4/packages/explorer/src/client/bootstrap/entry-heuristics.ts.mdmd.md)

#### Search (one search for the whole Explorer, and the path's end)

- [packages/explorer/src/client/search/graph-search.ts](../layer-4/packages/explorer/src/client/search/graph-search.ts.mdmd.md) — The pure search: directories, files and symbols, grouped
- [packages/explorer/src/client/search/search-field.ts](../layer-4/packages/explorer/src/client/search/search-field.ts.mdmd.md) — One field with its results, made twice
- [packages/explorer/src/client/search/search-bar.ts](../layer-4/packages/explorer/src/client/search/search-bar.ts.mdmd.md) — The bar, the destination and the path's report

#### Panels (UI controls)

- [packages/explorer/src/client/panels/sources-facts.ts](../layer-4/packages/explorer/src/client/panels/sources-facts.ts.mdmd.md) — What the Knowledge Sources panel says, computed from the graph index alone (pure, Vitest-tested)
- [packages/explorer/src/client/panels/sources-view.ts](../layer-4/packages/explorer/src/client/panels/sources-view.ts.mdmd.md) — The panel's rendering of those facts, the related documentation tree and the export
- [packages/explorer/src/client/panels/tuning.ts](../layer-4/packages/explorer/src/client/panels/tuning.ts.mdmd.md)

#### Persistence (state management)

- [packages/explorer/src/client/persistence/index.ts](../layer-4/packages/explorer/src/client/persistence/index.ts.mdmd.md)
- [packages/explorer/src/client/persistence/local-storage.ts](../layer-4/packages/explorer/src/client/persistence/local-storage.ts.mdmd.md)
- [packages/explorer/src/client/persistence/url-state.ts](../layer-4/packages/explorer/src/client/persistence/url-state.ts.mdmd.md)
- [packages/explorer/src/client/persistence/compressed-url-state.ts](../layer-4/packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md) — Portable compressed selection and pin state, including opened directories and the representation
- [packages/explorer/src/client/persistence/place.ts](../layer-4/packages/explorer/src/client/persistence/place.ts.mdmd.md) — The place an address names (view, file, open folders, path ends), so two addresses can be compared
- [packages/explorer/src/client/persistence/history.ts](../layer-4/packages/explorer/src/client/persistence/history.ts.mdmd.md) — Back and Forward: a move between places is an entry, a change within a place rewrites the current one (2026-09-30)

#### Views

- [packages/explorer/src/client/views/symbolAnchors.ts](../layer-4/packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md)
- [packages/explorer/src/client/views/forceGraphView.ts](../layer-4/packages/explorer/src/client/views/forceGraphView.ts.mdmd.md) — The Force Graph: the 3D force-directed view with the related-document overlay, file focus and the handoff to the Local Map
- [packages/explorer/src/client/views/forceGraphCamera.ts](../layer-4/packages/explorer/src/client/views/forceGraphCamera.ts.mdmd.md) — Pure camera arithmetic: approach a file without changing the direction the person looks from (2026-10-02)
- [packages/explorer/src/client/views/forceGraphData.ts](../layer-4/packages/explorer/src/client/views/forceGraphData.ts.mdmd.md) — Shared counted graph and related-document overlay
- [packages/explorer/src/client/views/forceGraphLayout.ts](../layer-4/packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md) — Symbol sizing, coupling distances, clearance and shared spatial simulation
- [packages/explorer/src/client/views/fileConnections.ts](../layer-4/packages/explorer/src/client/views/fileConnections.ts.mdmd.md) — One counted line per file pair for the overview; the canonical symbol edges are untouched (2026-10-03)
- [packages/explorer/src/client/views/perspectiveTransition.ts](../layer-4/packages/explorer/src/client/views/perspectiveTransition.ts.mdmd.md) — The explicit transition between the Local Map and the Force Graph: cards fold to named points at their force positions and unfold back (2026-10-03)
- [packages/explorer/src/client/views/wheel.ts](../layer-4/packages/explorer/src/client/views/wheel.ts.mdmd.md) — Wheel-device units normalized to pixels; scrolling never switches perspective

#### Local Map (modularised 2025-12-04)

- [packages/explorer/src/client/views/localView/index.ts](../layer-4/packages/explorer/src/client/views/localView/index.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/controller.ts](../layer-4/packages/explorer/src/client/views/localView/controller.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/render.ts](../layer-4/packages/explorer/src/client/views/localView/render.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/connections.ts](../layer-4/packages/explorer/src/client/views/localView/connections.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/runtime.ts](../layer-4/packages/explorer/src/client/views/localView/runtime.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/state.ts](../layer-4/packages/explorer/src/client/views/localView/state.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/types.ts](../layer-4/packages/explorer/src/client/views/localView/types.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/card-factory.ts](../layer-4/packages/explorer/src/client/views/localView/card-factory.ts.mdmd.md)
- [packages/explorer/src/client/views/connection-geometry.ts](../layer-4/packages/explorer/src/client/views/connection-geometry.ts.mdmd.md) — Connection geometry utilities for the 2D Local Map
- [packages/explorer/src/client/views/localView/branches.ts](../layer-4/packages/explorer/src/client/views/localView/branches.ts.mdmd.md) — Discloses the retained files and ranks them provider-first, breaking each cycle at its feedback references (2026-10-05)
- [packages/explorer/src/client/views/localView/branch-order.ts](../layer-4/packages/explorer/src/client/views/localView/branch-order.ts.mdmd.md) — Orders the band rows, the files within them and each card's rows by a barycenter sweep, bundles the wires of one offering pin through the columns they pass together, and reserves each bundle a lane inside a directory that holds an end of every wire in it (2026-10-05)
- [packages/explorer/src/client/views/localView/branch-renderer.ts](../layer-4/packages/explorer/src/client/views/localView/branch-renderer.ts.mdmd.md) — Draws the retained branches with the native cards inside directory bands, leaving the lanes between cards and counting a card's back references (2026-10-02, 2026-10-05)
- [packages/explorer/src/client/views/localView/branch-routing.ts](../layer-4/packages/explorer/src/client/views/localView/branch-routing.ts.mdmd.md) — The native curve as a pure function, and the threaded route of a skipped reference through its lanes: curve, lane, curve, never backward and never through a card (2026-10-05)
- [packages/explorer/src/client/views/localView/branch-placement.ts](../layer-4/packages/explorer/src/client/views/localView/branch-placement.ts.mdmd.md) — Places the cards and lanes of every column on the vertical axis so that the wires between pins are as short as the column order, the directory boxes and the band rows allow: the coordinate step of layered drawing, exact (2026-10-05)
- [packages/explorer/src/client/views/localView/branch-alignments.ts](../layer-4/packages/explorer/src/client/views/localView/branch-alignments.ts.mdmd.md) — Proposes joins of complete flat boundary runs for the continuing competition
- [packages/explorer/src/client/views/localView/branch-shape.ts](../layer-4/packages/explorer/src/client/views/localView/branch-shape.ts.mdmd.md) — Shared measures of boundary distance, step count and directly owned card-row alignment
- [packages/explorer/src/client/views/localView/network-simplex.ts](../layer-4/packages/explorer/src/client/views/localView/network-simplex.ts.mdmd.md) — The network simplex solver of Gansner, Koutsofios, North and Vo for difference constraints with a weighted-difference objective, which the placement runs on its auxiliary graph (2026-10-05)
- [packages/explorer/src/client/views/localView/layout-measure.ts](../layer-4/packages/explorer/src/client/views/localView/layout-measure.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/pan-zoom.ts](../layer-4/packages/explorer/src/client/views/localView/pan-zoom.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/subgraph-builder.ts](../layer-4/packages/explorer/src/client/views/localView/subgraph-builder.ts.mdmd.md)
- [packages/explorer/src/client/views/localView/symbol-highlight.ts](../layer-4/packages/explorer/src/client/views/localView/symbol-highlight.ts.mdmd.md)

#### Shared exploration state

- [packages/explorer/src/client/views/pin-state.ts](../layer-4/packages/explorer/src/client/views/pin-state.ts.mdmd.md)

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
- The Local Map and the Force Graph since October 2026: retained branches and their references, [local-map-branches.spec.ts](../layer-4/tests/e2e/local-map-branches.spec.ts.mdmd.md); a path drawn only in the map's direction, the reverse offered and Clear returning the camera, [local-map-path.spec.ts](../layer-4/tests/e2e/local-map-path.spec.ts.mdmd.md); file focus from a URL, a click and a search, [force-graph-focus.spec.ts](../layer-4/tests/e2e/force-graph-focus.spec.ts.mdmd.md); explicit perspective changes and wheel zoom staying in the active view, [perspective-zoom.spec.ts](../layer-4/tests/e2e/perspective-zoom.spec.ts.mdmd.md); Back and Forward, [explorer-history.spec.ts](../layer-4/tests/e2e/explorer-history.spec.ts.mdmd.md); directory opening and containment, [local-map-directories.spec.ts](../layer-4/tests/e2e/local-map-directories.spec.ts.mdmd.md); the three-view navigation and shared representation, [explorer-navigation.spec.ts](../layer-4/tests/e2e/explorer-navigation.spec.ts.mdmd.md).
- The still-picture deck: [still-picture.spec.ts](../layer-4/tests/e2e/still-picture.spec.ts.mdmd.md) over [still-picture.ts](../layer-4/tests/e2e/still-picture.ts.mdmd.md) and [still-picture-geometry.ts](../layer-4/tests/e2e/still-picture-geometry.ts.mdmd.md) measures what each view's named states show legibly, against the predictions in `AI-Agent-Workspace/Probes/2026-10-01/still-picture-deck.md`.
- The World Map's camera, geometry and model: [projection.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/projection.test.ts.mdmd.md), [layout.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/layout.test.ts.mdmd.md), [model.test.ts](../layer-4/packages/explorer/src/client/views/worldMap/model.test.ts.mdmd.md); and what it draws and does, driven through its handle and the pointer: [world-map.spec.ts](../layer-4/tests/e2e/world-map.spec.ts.mdmd.md); the estate sample on it: [world-map-estate.spec.ts](../layer-4/tests/e2e/world-map-estate.spec.ts.mdmd.md); and that no words land on each other, on the board or on a thing opened into the Local Map: [world-map-design.spec.ts](../layer-4/tests/e2e/world-map-design.spec.ts.mdmd.md) over [design-audit.ts](../layer-4/tests/e2e/design-audit.ts.mdmd.md).
- December 2025 chat sessions (12/03–12/06) document the Local Map refinements: gradient connections, column-aware anchors, type-reference edges, and origin-over-barrel preference for inheritance links.
