# Membrane Map

## Metadata

- Layer: 3
- Archetype: component

## Authored

### Purpose

Document the Membrane Map: the inside of a thing on the World Map since 2026-09-29, the default Explorer view from 2026-03-31 to 2026-09-28, and the intended successor of the Circuit Board and Local Map views. The Membrane Map unifies directory-level browsing and symbol-level exploration into a single zoomable treemap where directories render as nested containing rectangles ("membranes"), files render as cards inside their directory membrane, and dependency connections pierce membrane boundaries to show cross-directory coupling.

### Design Origin

The Membrane Map concept emerged from Dev Day 79 (2026-03-22.1.md) when a misunderstanding about the Circuit Board's sibling-directory rendering led to a fundamental redesign insight: instead of navigating between separate macro (Circuit Board) and micro (Local Map) views, a single spatial substrate can support multiple levels of detail depending on the user's focus.

### Current Status

- Since 2026-09-29 the Membrane Map is where a thing on the World Map opens: focused on the thing's folder, with the World Map as the crumb above the top folder, and a folder's first look fitted above the zoom controls. It was the cold-start default from 2026-03-31 to 2026-09-28; a bundle with a board now lands on the World Map. Circuit Board and Local Map still ship.
- Shareable Membrane sessions restore through the compressed `?s=` payload and currently round-trip view, selected node, pins, expanded directories, expanded cards, transform, and display filters.
- Broader Explorer UI and navigation fallback still persist through versioned localStorage when no explicit URL state is present.
- Playwright coverage is landed and currently spans 13 spec files / 29 tests, including browse mode, pin-active layout, restore behavior, multi-focal/path seeding, default-view behavior, and pin-active visual stability across reload.

### Core Concepts

#### Membranes as Directories

Each directory in the workspace is a nested rectangle — a **membrane**. Membranes contain child membranes (subdirectories) and file cards. The spatial nesting is the primary organizational axis: files that live together appear together. Ancestor membranes compress into thin labeled borders as the user drills deeper, providing persistent spatial context without breadcrumb-only navigation.

#### Barrel Files as Membrane Boundaries

In languages with barrel/index files (TypeScript `index.ts`, Python `__init__.py`, Rust `mod.rs`), the barrel file IS the membrane's public API surface. Connections from outside the membrane terminate at the membrane boundary rather than routing to the barrel file as an interior node. When the membrane is expanded, barrel files render as thin "edge nodes" positioned along the membrane border, visually reinforcing their role as the public surface.

This isomorphism (barrel = membrane boundary) resolves the existing problem where the Local Map misleadingly presents barrel files as rich artifacts with many symbols, when they are actually routing tables for the directory's true contents.

> **Status (2026-09-27)**: Designed, not rendered. `hierarchy.ts` implements `isBarrelFile()` and `applyBarrelSemantics()` with tests, but no renderer consumes them yet; barrel files still render as ordinary cards.

#### Pin-Level Fidelity

**Focal node**: The user-selected file renders at full detail — every public symbol appears as a named pin with inbound (left) and outbound (right) anchors. This preserves the current Local Map's symbol-level connection routing.

**Connected nodes**: Files that connect to the focal node render with reduced detail — name plus only the pins relevant to the active connections. Nodes in distant membranes may render at even lower detail (card name with connection-count badge on the membrane boundary).

**Hierarchical pins for nested types**: Languages like C# support nested public classes (`EventBus.Options`, `EventBus.EventArgs<T>`). Pins for nested types render hierarchically under their parent type on the node card, with connections routing to the specific nested pin.

#### French Corset (Self-Referential and Back-Connections)

When a symbol on a file depends on another symbol in the same file (e.g., `buildStaticExplorer` calling `buildLocalMapJson`), the connection wraps around the card from one outbound pin to another symbol’s inbound pin. This existing Local Map pattern is preserved unchanged in the Membrane Map.

**Back-connections** extend the French Corset concept to inter-card cycles. The Local Map encodes dependency direction spatially: green inbound pins on the LEFT of each card, blue outbound pins on the RIGHT. Connections flow left-to-right. In the column layout this works because spatial position IS dependency order. In the treemap, spatial position is determined by directory hierarchy — an orthogonal axis. When a connection’s outbound pin faces AWAY from the target’s inbound pin (the outbound is to the right, but the target is spatially to the left), a full Bézier path would need to wrap around cards, creating visual clutter.

**Resolution (two-layer PCB model):** Back-connections are classified by a simple test: if `outboundPin.x >= inboundPin.x`, it’s a back-connection. Instead of drawing the full path, each endpoint renders an independent **French Corset stub** — the outbound pin gets a short rightward curve that vanishes behind the card, and the inbound pin gets a short leftward curve emerging from behind. The path between them is not drawn. This preserves the L/R directional grammar (outbound always exits right, inbound always enters left) while adding zero visual clutter.

The stubs communicate “this pin participates in a back-connection” without revealing the full routing. A future enhancement (deferred to a later commit) will add hover-promotion: hovering on a stub temporarily reveals the full traced path.

**Dimming semantics:** Dimming retains its single meaning from the Local Map: “irrelevant to current focus.” Back-connections are not dimmed — they are hidden by construction (stubs only). This prevents semantic collision between “irrelevant” and “routed backwards.”

### Continuous Pin Model (No Discrete Modes)

The Membrane Map does NOT have discrete rendering modes. Instead, user interaction drives a **continuous spectrum** of detail:

| State                          | How the user gets here    | What renders                                                                       |
| ------------------------------ | ------------------------- | ---------------------------------------------------------------------------------- |
| **Browse** (0 pins)            | Initial view              | Tiles and aggregate metrics only. No connections.                                  |
| **Selected** (card body click) | Click a file card         | Detail panel opens. Card expands to show symbols. No connections yet.              |
| **Partial Pins**               | Pin a symbol              | That symbol’s connections render as SVG paths. Connected nodes show relevant pins. |
| **All Pins (≡ Local Map)**     | Pin all symbols on a node | Full neighborhood visible — equivalent to the current Local Map.                   |
| **Multi-focal**                | Pin symbols on 2+ nodes   | Connections for all pinned symbols. “Compare” emerges naturally.                   |
| **Path**                       | Active BFS result         | Numbered hop badges (①②③④) + breadcrumb bar + animated pulse.                      |

In browse mode files stay where the folder hierarchy puts them, and only detail level and connection visibility change. Once a symbol is pinned, the layout changes to columns of dependencies, pinned files and dependents inside the folder bands, as the owner asked on 2026-03-24: "once pinning of symbols begins, the irrelevant nodes should not even appear. Indeed, a layout rearrangement must begin."

**Interaction targets:** Clicking a card BODY selects the node (updates detail panel). Clicking a symbol PIN toggles pin state only (does not affect detail panel). Two distinct click targets on the same DOM element.

#### Pin Population Strategies

Pins can be populated by multiple strategies — all produce the same data structure (`PinSet` entries with optional hop-index metadata) and feed the same multi-pin renderer:

| Strategy             | How it works                                                  | Result                                      |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| **Manual pinning**   | User clicks symbol pins while exploring                       | Unordered pin set                           |
| **Omnisearch**       | Fuzzy search finds a symbol, navigates to its card, auto-pins | Single pin (starting point for exploration) |
| **Pathfinder (BFS)** | `From/To` UI or CLI `inspect --from --to`                     | Ordered pin set with hop indices            |

The pathfinder is a **pin population strategy**, not a rendering mode. BFS produces an ordered set of `(nodeId, symbol)` pairs that get injected into the pin set with hop-index metadata. The standard multi-pin renderer draws them; hop badges and the breadcrumb bar are optional decorations on ordered pins. This means the pathfinder UI is desirable (for CLI parity with `live-docs:inspect --from --to`) but not architecturally load-bearing — if it causes implementation difficulty, it can be deferred without blocking other features.

### Persistence Model

Membrane-specific share state and broader cross-session fallback are intentionally split:

- **Compressed URL state** (`compressed-url-state.ts`) is the shareable representation for Membrane sessions. It round-trips view, selected node, pins (including hop metadata), expanded directories, expanded cards, transform, and display filters via `?s=`.
- **Versioned localStorage** (`local-storage.ts`) persists Explorer UI and navigation fallback across sessions when no explicit URL state is present.
- **Startup precedence** is explicit URL state (`?s=` or legacy `?view=` / `?node=`) → localStorage → viewerConfig → defaults.

### Namespace Mode (C# Enhancement)

For languages where namespaces do not align with directories (primarily C#), the Membrane Map supports an alternative hierarchy function that groups files by namespace rather than directory:

- **Directory mode** (default): `pathToHierarchy("src/Helpers/ServiceHelper.cs") → ["src", "Helpers"]`
- **Namespace mode**: `namespaceToHierarchy("App.Services") → ["App", "Services"]`

Everything downstream — pins, connections, zoom, rendering — is identical. The membrane containers simply represent different grouping units.

**Disagreement between directory and namespace membranes is itself an architectural signal**: a file whose physical location doesn't match its namespace indicates either a misplaced file or a namespace inconsistency. The two modes together with the Force Graph form a three-axis exploration capability:

| View                         | Axis                            | Insight                                           |
| ---------------------------- | ------------------------------- | ------------------------------------------------- |
| **Membrane Map (directory)** | Organizational — filesystem     | "Where do files physically live?"                 |
| **Membrane Map (namespace)** | Logical — type system grouping  | "How does the developer mentally organize types?" |
| **Force Graph**              | Topological — coupling strength | "What's the emergent shape?"                      |

Namespace mode needs each C# file's declared namespace. No shipped adapter records that today (the regex adapter records `using` directives only); it arrives with the tree-sitter C# adapter.

### Focus-Aware Layout (Font-Size Invariance)

Drilling into directories does NOT use CSS transform zoom. Transform-based zoom scales the entire DOM — including text — making deep directories illegibly large or small. Instead, the Membrane Map uses **focus-aware squarify weight boosting**: when a child directory is on the focus path, its squarify weight is boosted to ~19× its siblings' combined weight, giving it ~95% of the parent's area. Siblings compress to thin slivers. The treemap algorithm naturally reallocates space at every drill-down level.

**Font-size invariance** is the correctness signal: text renders at the same CSS font size at every drill-down depth. If fonts change size between clicks, the focus-aware layout is broken.

### Two-Phase Sizing Model

The layout operates in two distinct phases:

1. **Directory exploration** (no leaf files visible): Focused directory fills a constant proportion of the viewport via weight boosting. Sibling directories compress. Ancestor membranes stack as thin label borders. The user always sees the focused directory at roughly the same screen size regardless of depth.

2. **Leaf directory with files** (cards visible): The membrane switches from fixed treemap dimensions to `height: auto; min-height`, allowing the card grid to drive sizing. Parent membranes on the focus path also switch to `position: relative` + `height: auto` so they grow to accommodate the expanding leaf. When content exceeds the viewport, the user pans to explore.

This two-phase model ensures smooth exploration during directory browsing, then gracefully transitions to content-driven growth when the user reaches actual files.

### Arcs between folders: built twice, rejected

Drawing the wires that cross a folder's boundary as thick bundled arcs over the browse layout was built in March and switched off for visual noise. On 2026-03-30, after the owner asked "aren't we getting odd wide spanning of directories?... Should it only occur on hover? (won't that cause a re-render with elements moving into place?)", Copilot analysed it and rejected it, together with hover-only reveal and flow elements inside the treemap: the arcs fly to tiles off screen, and a hover state cannot be interacted with. What browse mode offers instead is the crumb bar and a folder tile's `Explore` button, which pins the files that cross its boundary; the owner: "It's slick!" On 2026-04-01 Copilot rebuilt hover arcs from a stale plan anyway, and the owner looked: "By eye, this doesn't appear to look right... I just see a bundle of connectors laying in an arc over each directory I hover over." The work was reverted, and the arc renderer (`edge-bundling.ts`, `svg-connections.ts`), kept switched off since, was deleted on 2026-09-29. Do not re-propose arcs over the browse layout. Copilot's own proposal after the failure, "boundary ports or edge badges on the hovered membrane instead of long free arcs", is close to what the probes of 2026-09-28 reached: one pin on a folder's wall per neighbouring folder, with a count. One idea from the deleted renderer carries over to such pins: an edge belongs to a folder by walking up from each of its ends to the shallowest collapsed folder above it, and an edge whose two ends land in the same folder is internal to it (`edge-bundling.ts`, in git history before 2026-09-29).

### Phase-Out Plan

The Membrane Map is the intended replacement for both Circuit Board and Local Map, and since 2026-09-29 the inside of a thing on the World Map. The transition remains additive:

1. **Prototype phase**: Build the Membrane Map as a new view alongside existing Circuit Board and Local Map, using those as reference implementations for correctness checks.
2. **Feature parity phase**: Ensure all existing Circuit Board and Local Map functionality is available in the Membrane Map.
3. **Stabilisation phase**: Run both old and new views in parallel until confidence is established.
4. **Retirement phase**: Remove Circuit Board and Local Map views; update documentation.

Timeline is not fixed — phase-out occurs when the Membrane Map achieves feature parity and stability. The owner's word on 2026-09-29: the Local Map stays until this view is at least matched in quality, and this view then takes its name.

### Adapter Requirements

The Membrane Map surfaces a gap in the C# adapter: **nested public types** are currently extracted as flat sibling symbols. To render hierarchical pins accurately, the adapter needs:

1. Track brace depth during symbol extraction
2. Maintain a stack of enclosing type names
3. Emit symbols with qualified names: `EventBus`, `EventBus.Options`, `EventBus.EventArgs`

This is an adapter-level enhancement documented in [Polyglot Adapters](polyglot-adapters.mdmd.md). It does not affect the Membrane Map's spatial model.

### Resolved Design Decisions

| #   | Question                                   | Decision                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Q1  | Discrete modes or continuous spectrum?     | Continuous pin model. No mode picker. Browse→Selected→Partial Pins→All Pins. Compare/Path emerge from multi-focal pinning / active BFS.                                                                                                                                              |
| Q2  | Path mode: membrane substrate or columns?  | Membrane substrate. Common membrane (LCA) + numbered hop badges + breadcrumb bar + animated pulse.                                                                                                                                                                                   |
| Q7  | Pin directionality with cycles?            | Preserve L/R grammar (Option B). Back-connections rendered as French Corset stubs (Approach X). Hover-promotion deferred.                                                                                                                                                            |
| Q8  | URL state sharing?                         | Use versioned `?s=` payloads for shareable Membrane state while retaining versioned localStorage for broader Explorer UI/navigation fallback. Startup precedence is explicit URL state → localStorage → viewerConfig → defaults. Legacy `?view=` / `?node=` params remain tolerated. |
| Q9  | Pathfinder: separate mode or pin strategy? | Pin population strategy. BFS results inject ordered pins into the pin set. Multi-pin renderer handles display. Pathfinder UI preserved for CLI parity but not architecturally load-bearing.                                                                                          |

### Where it goes (2026-09-29)

The owner, on seeing a thing open into a folder map of its own: "If we just open to the Membrane Map, the mess of wires should be gone, as Membrane Map wraps directories." And: "Will want Membrane Map as interior view of a system. It combines the benefits of 'Circuit Board' (folders) and 'Local Map' (symbol connectivity). We just want the membrane map to be as beautiful and functional as the Local Map before it's our default." Then, choosing between improving this view in place and growing the folder map into its concept: the first now, the second as a stretch goal once this view is the default two-dimensional local view, and "don't get rid of the Local Map yet. It still has a fair bit of hard-earned design intuition and style to teach us... the overall visual style and sizing and spacing and coloring shown in the preexisting 'Local Map' should inform a lot of improvements, visually and otherwise, to the 'Membrane Map' (to be renamed 'Local Map' once Local Map truly is at-least-matched-in-quality)." The force graph is the local scale's only three-dimensional view.

So the work on this view is now to bring it to the Local Map's quality in place, judged by eye against the gallery under `AI-Agent-Workspace/Screenshots/` and by the design audit. What the first look after the change showed, on this repository and the estate: the focused folder is one nearly empty tile per subfolder, with its own files in a strip at the foot; no wires until a symbol is pinned, which is the owner's wish, but nothing says what crosses a subfolder's boundary beyond the counts on its badge; dark theme only, while the World Map is light by default; and the March questions below stand.

### Where this design stopped (March 2026)

These are the questions the Membrane Map left open as built. They belong to this design, not to whatever comes next: the next visualization is not obliged to answer them and may make them moot. They are recorded so that nothing here is rediscovered the hard way.

Three items once listed here, pruning of stale URL and saved state, wiring of the detail levels, and animation, had landed before the stop (`42c8658b`, `c675a4eb`) and were taken off the list on 2026-09-29.

- **Pinning and layout** — The stated blocker was that pinning should rearrange cards into left-to-right dependency flow instead of switching to a separate renderer, and the owner rejected routing curves around the browse layout: "once pinning of symbols begins, the irrelevant nodes should not even appear. Indeed, a layout rearrangement must begin." That was the gate set at the time for retiring Circuit Board and Local Map.
- **What crosses a folder's boundary in browse mode** — Arcs were rejected (see above); the crumb bar and the `Explore` button are what landed, and the counts on a folder's badge are all browse mode shows.
- **Legacy-view decoupling** — The Membrane Map reads `DirectoryAggregate` through its own `aggregation.ts`, which still takes the type from `circuitView/aggregation.ts`; the type must move before the Circuit Board can be deleted.
- **WCAG AA accessibility** — Raised as a "strong strong bonus" rather than a hard requirement, but planning for compliance early enables wiser design choices before redesigning later. Vanilla HTML/CSS layout techniques are preferred over DOM-heavy absolute positioning for screen reader compatibility. RTL language support is a forward-planning consideration.
- **Hub nodes**: Files with very high connection counts create visual clutter even with fading. May need dedicated "hub" rendering (minimised card with radial connection summary).
- **Performance**: Large workspaces (1000+ files) require lazy rendering — only expand membranes that are visible in the viewport. The current Circuit Board `innerHTML = ""` teardown/rebuild pattern must be replaced with persistent DOM elements that resize.
- **Hover-promotion routing**: When a back-connection stub is hovered/pinned, what routing algorithm reveals the full traced path? Membrane-gutter pathfinding (treating membrane borders as a rectilinear graph) is the leading approach but is deferred to a future commit.

### Testing Philosophy

DOM testing via jsdom was explicitly rejected (Dev Day 80, Turn 7): jsdom tests verify trivial property assignments (`el.className = "membrane"`) while being structurally unable to test what actually breaks (CSS cascade, `getBoundingClientRect()` returning `{0,0,0,0}`, SVG paths depending on measured positions). They pass even when the UI is completely wrong.

The testing strategy is:

1. **Pure-math tests** (Vitest) — Layout, hierarchy, detail-levels, pin-state, routing, URL state compression. 130+ tests covering algorithmic correctness without any DOM dependency.
2. **Visual playtesting** (Playwright MCP) — Manual screenshot-based exploration before creating automated E2E tests. Multiple rounds of user-driven visual feedback (Turns 24–32) caught focus-zoom, membrane sizing, and connection rendering issues that no unit test could surface.
3. **Playwright E2E tests** — Landed and actively expanded. The current suite covers browse mode, pin-active layout, containment, dimming, directory bands, URL restore, expanded-card persistence, multi-focal/path-as-pins, default-view behavior, and pin-active visual stability across reload.

## System References

### Components

#### Pure-Math Modules (no DOM dependency)

- `packages/explorer/src/client/views/membraneView/types.ts` — Core types: `MembraneNode`, `MembraneLink`, `PinSet`, `PinEntry`
- `packages/explorer/src/client/views/membraneView/layout.ts` — Recursive squarify engine with focus-aware weight boosting
- `packages/explorer/src/client/views/membraneView/hierarchy.ts` — `isBarrelFile()`, `applyBarrelSemantics()`, `getAncestorDirectories()`
- `packages/explorer/src/client/views/membraneView/detail-levels.ts` — `resolveDetailLevels()` (full/summary/badge/hidden)
- `packages/explorer/src/client/views/pin-state.ts` — Shared pure-function pin state: add/remove/toggle/serialize/getVisibleConnections
- `packages/explorer/src/client/views/membraneView/routing.ts` — Front/back trace classification + geometry (French Corset stubs)

#### DOM Modules

- `packages/explorer/src/client/views/membraneView/browse-renderer.ts` — DOM factory for collapsed tiles and expanded membranes
- `packages/explorer/src/client/views/membraneView/focal-overlay.ts` — Symbol expansion panels, pin anchors, SVG connection overlay
- `packages/explorer/src/client/views/membraneView/aggregation.ts` — Recursive directory aggregate computation
- `packages/explorer/src/client/views/membraneView/index.ts` — Controller: pan/zoom, focus path, pin dispatch, URL state sync

#### Shared (promoted from view-specific locations)

- `packages/explorer/src/client/views/squarify.ts` — Squarified treemap layout (promoted from `circuitView/`)
- `packages/explorer/src/client/views/connection-geometry.ts` — Bézier paths, gradient generation (promoted from `localView/`)

#### Persistence

- `packages/explorer/src/client/persistence/compressed-url-state.ts` — Shareable Membrane URL state: versioned compressed payloads for pins, expansions, transform, and display filters
- `packages/explorer/src/client/persistence/url-state.ts` — Legacy URL parsing + cold-start/default-view semantics for Explorer boot
- `packages/explorer/src/client/persistence/local-storage.ts` — Versioned UI and navigation fallback persisted across browser sessions

### Related Architecture

- [Live Documentation Explorer](live-documentation-explorer.mdmd.md) — Parent component; the Membrane Map is a view within the Explorer
- [Polyglot Adapters](polyglot-adapters.mdmd.md) — Nested type extraction enhancement needed for Membrane Map hierarchical pins

## Evidence

- Design origin: [2026-03-22.1.md chat log](../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-22.1.md) — full design conversation including barrel-as-membrane, namespace mode, and cross-language pressure testing
- Implementation origin: [2026-03-23.1.md chat log](../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) — 7,028-line implementation marathon: 12-step execution plan, 5 design forks resolved, 826/826 tests green, iterative visual playtesting
- Convergence follow-up: [2026-03-31.1.md chat log](../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-31.1.md) — expanded-card URL persistence, multi-focal/path E2E, Membrane default-view promotion, visual stability coverage, and stale-state/persistence analysis
- UC-094 (Unified View Continuum), UC-095 (Continuous Pin Spectrum), and UC-087 (Circuit Board Reimagined) in `user-use-case-census.md`
