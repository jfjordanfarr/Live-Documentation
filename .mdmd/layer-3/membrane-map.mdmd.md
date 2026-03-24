# Membrane Map

## Metadata

- Layer: 3
- Archetype: component
- Live Doc ID: COMP-membrane-map

## Authored

### Purpose

Document the Membrane Map: the planned successor to the Circuit Board and Local Map Explorer views. The Membrane Map unifies directory-level browsing and symbol-level exploration into a single zoomable treemap where directories render as nested containing rectangles ("membranes"), files render as cards inside their directory membrane, and dependency connections pierce membrane boundaries to show cross-directory coupling.

### Design Origin

The Membrane Map concept emerged from Dev Day 79 (2026-03-22.1.md) when a misunderstanding about the Circuit Board's sibling-directory rendering led to a fundamental redesign insight: instead of navigating between separate macro (Circuit Board) and micro (Local Map) views, a single spatial substrate can support multiple levels of detail depending on the user's focus.

### Core Concepts

#### Membranes as Directories

Each directory in the workspace is a nested rectangle — a **membrane**. Membranes contain child membranes (subdirectories) and file cards. The spatial nesting is the primary organizational axis: files that live together appear together. Ancestor membranes compress into thin labeled borders as the user drills deeper, providing persistent spatial context without breadcrumb-only navigation.

#### Barrel Files as Membrane Boundaries

In languages with barrel/index files (TypeScript `index.ts`, Python `__init__.py`, Rust `mod.rs`), the barrel file IS the membrane's public API surface. Connections from outside the membrane terminate at the membrane boundary rather than routing to the barrel file as an interior node. When the membrane is expanded, barrel files render as thin "edge nodes" positioned along the membrane border, visually reinforcing their role as the public surface.

This isomorphism (barrel = membrane boundary) resolves the existing problem where the Local Map misleadingly presents barrel files as rich artifacts with many symbols, when they are actually routing tables for the directory's true contents.

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

The spatial layout never changes — files stay where directory hierarchy puts them. Only detail level and connection visibility change.

**Interaction targets:** Clicking a card BODY selects the node (updates detail panel). Clicking a symbol PIN toggles pin state only (does not affect detail panel). Two distinct click targets on the same DOM element.

#### Pin Population Strategies

Pins can be populated by multiple strategies — all produce the same data structure (`PinSet` entries with optional hop-index metadata) and feed the same multi-pin renderer:

| Strategy             | How it works                                                  | Result                                      |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| **Manual pinning**   | User clicks symbol pins while exploring                       | Unordered pin set                           |
| **Omnisearch**       | Fuzzy search finds a symbol, navigates to its card, auto-pins | Single pin (starting point for exploration) |
| **Pathfinder (BFS)** | `From/To` UI or CLI `inspect --from --to`                     | Ordered pin set with hop indices            |

The pathfinder is a **pin population strategy**, not a rendering mode. BFS produces an ordered set of `(nodeId, symbol)` pairs that get injected into the pin set with hop-index metadata. The standard multi-pin renderer draws them; hop badges and the breadcrumb bar are optional decorations on ordered pins. This means the pathfinder UI is desirable (for CLI parity with `live-docs:inspect --from --to`) but not architecturally load-bearing — if it causes implementation difficulty, it can be deferred without blocking other features.

### Namespace Mode (C# Enhancement)

For languages where namespaces do not align with directories (primarily C#), the Membrane Map supports an alternative hierarchy function that groups files by namespace rather than directory:

- **Directory mode** (default): `pathToHierarchy("src/Helpers/ServiceHelper.cs") → ["src", "Helpers"]`
- **Namespace mode**: `namespaceToHierarchy("App.Services") → ["App", "Services"]`

Everything downstream — pins, connections, edge bundling, zoom, rendering — is identical. The membrane containers simply represent different grouping units.

**Disagreement between directory and namespace membranes is itself an architectural signal**: a file whose physical location doesn't match its namespace indicates either a misplaced file or a namespace inconsistency. The two modes together with the Force Graph form a three-axis exploration capability:

| View                         | Axis                            | Insight                                           |
| ---------------------------- | ------------------------------- | ------------------------------------------------- |
| **Membrane Map (directory)** | Organizational — filesystem     | "Where do files physically live?"                 |
| **Membrane Map (namespace)** | Logical — type system grouping  | "How does the developer mentally organize types?" |
| **Force Graph**              | Topological — coupling strength | "What's the emergent shape?"                      |

Namespace mode uses data already extracted by the C# heuristic system (`extractCSharpNamespace()` in `packages/shared/src/inference/heuristics/csharp.ts`). No new extraction logic is required.

### Focus-Aware Layout (Font-Size Invariance)

Drilling into directories does NOT use CSS transform zoom. Transform-based zoom scales the entire DOM — including text — making deep directories illegibly large or small. Instead, the Membrane Map uses **focus-aware squarify weight boosting**: when a child directory is on the focus path, its squarify weight is boosted to ~19× its siblings' combined weight, giving it ~95% of the parent's area. Siblings compress to thin slivers. The treemap algorithm naturally reallocates space at every drill-down level.

**Font-size invariance** is the correctness signal: text renders at the same CSS font size at every drill-down depth. If fonts change size between clicks, the focus-aware layout is broken.

### Two-Phase Sizing Model

The layout operates in two distinct phases:

1. **Directory exploration** (no leaf files visible): Focused directory fills a constant proportion of the viewport via weight boosting. Sibling directories compress. Ancestor membranes stack as thin label borders. The user always sees the focused directory at roughly the same screen size regardless of depth.

2. **Leaf directory with files** (cards visible): The membrane switches from fixed treemap dimensions to `height: auto; min-height`, allowing the card grid to drive sizing. Parent membranes on the focus path also switch to `position: relative` + `height: auto` so they grow to accommodate the expanding leaf. When content exceeds the viewport, the user pans to explore.

This two-phase model ensures smooth exploration during directory browsing, then gracefully transitions to content-driven growth when the user reaches actual files.

### Edge Bundling

When many connections cross the same membrane boundary, individual lines become visual noise. The Membrane Map aggregates dense cross-membrane connections at the membrane level: a single thick edge with a count badge replaces N individual connections. Expanding either endpoint membrane reveals the individual connections.

> **Status (Dev Day 80)**: Edge bundling is implemented (`edge-bundling.ts`, `svg-connections.ts`) but **disabled** in the browse renderer due to visual noise at the default zoom level. Re-enable when hover-only or progressive-disclosure rendering is implemented for inter-membrane connectivity at collapsed directory levels.

### Phase-Out Plan

The Membrane Map is the planned successor to both Circuit Board and Local Map. The transition is additive:

1. **Prototype phase**: Build the Membrane Map as a new view alongside existing Circuit Board and Local Map, using those as reference implementations for correctness checks.
2. **Feature parity phase**: Ensure all existing Circuit Board and Local Map functionality is available in the Membrane Map.
3. **Stabilisation phase**: Run both old and new views in parallel until confidence is established.
4. **Retirement phase**: Remove Circuit Board and Local Map views; update documentation.

Timeline is not fixed — phase-out occurs when the Membrane Map achieves feature parity and stability.

### Adapter Requirements

The Membrane Map surfaces a gap in the C# adapter: **nested public types** are currently extracted as flat sibling symbols. To render hierarchical pins accurately, the adapter needs:

1. Track brace depth during symbol extraction
2. Maintain a stack of enclosing type names
3. Emit symbols with qualified names: `EventBus`, `EventBus.Options`, `EventBus.EventArgs`

This is an adapter-level enhancement documented in [Polyglot Adapters](polyglot-adapters.mdmd.md). It does not affect the Membrane Map's spatial model.

### Resolved Design Decisions

| #   | Question                                   | Decision                                                                                                                                                                                    |
| --- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Discrete modes or continuous spectrum?     | Continuous pin model. No mode picker. Browse→Selected→Partial Pins→All Pins. Compare/Path emerge from multi-focal pinning / active BFS.                                                     |
| Q2  | Path mode: membrane substrate or columns?  | Membrane substrate. Common membrane (LCA) + numbered hop badges + breadcrumb bar + animated pulse.                                                                                          |
| Q7  | Pin directionality with cycles?            | Preserve L/R grammar (Option B). Back-connections rendered as French Corset stubs (Approach X). Hover-promotion deferred.                                                                   |
| Q8  | URL state sharing?                         | Always `lz-string` into single `?s=` param. Comprehensive state covering all views, filters, tuning, pins, path. Backward-compatible redirect from legacy `?view=&node=` params.            |
| Q9  | Pathfinder: separate mode or pin strategy? | Pin population strategy. BFS results inject ordered pins into the pin set. Multi-pin renderer handles display. Pathfinder UI preserved for CLI parity but not architecturally load-bearing. |

### Open Questions

- **Card LTR rearrangement for dependency flow** — The primary remaining challenge for Commit 1. When pins are activated on leaf-directory file cards, the cards must rearrange themselves horizontally to respect the L→R dependency design language (green inbound = left, blue outbound = right). The user explicitly rejected forcing front-trace Bézier curves as a workaround — the cards themselves must move. This is the gate blocking visual parity with the Local Map. RTL language support (flipping dependency flow direction) should influence the rearrangement architecture. See WCAG AA compliance planning below.
- **WCAG AA accessibility** — Raised as a "strong strong bonus" rather than a hard requirement, but planning for compliance early enables wiser design choices before redesigning later. Vanilla HTML/CSS layout techniques are preferred over DOM-heavy absolute positioning for screen reader compatibility. RTL language support is a forward-planning consideration.
- **Hub nodes**: Files with very high connection counts create visual clutter even with edge bundling. May need dedicated "hub" rendering (minimised card with radial connection summary).
- **Performance**: Large workspaces (1000+ files) require lazy rendering — only expand membranes that are visible in the viewport. The current Circuit Board `innerHTML = ""` teardown/rebuild pattern must be replaced with persistent DOM elements that resize.
- **Hover-promotion routing**: When a back-connection stub is hovered/pinned, what routing algorithm reveals the full traced path? Membrane-gutter pathfinding (treating membrane borders as a rectilinear graph) is the leading approach but is deferred to a future commit.
- **Animated transitions** — Membrane growth/shift animations should eventually give "the impression of the universe moving around the user." Not yet attempted.

### Testing Philosophy

DOM testing via jsdom was explicitly rejected (Dev Day 80, Turn 7): jsdom tests verify trivial property assignments (`el.className = "membrane"`) while being structurally unable to test what actually breaks (CSS cascade, `getBoundingClientRect()` returning `{0,0,0,0}`, SVG paths depending on measured positions). They pass even when the UI is completely wrong.

The testing strategy is:

1. **Pure-math tests** (Vitest) — Layout, hierarchy, detail-levels, edge-bundling, pin-state, routing, SVG connection aggregation, URL state compression. 130+ tests covering algorithmic correctness without any DOM dependency.
2. **Visual playtesting** (Playwright MCP) — Manual screenshot-based exploration before creating automated E2E tests. Multiple rounds of user-driven visual feedback (Turns 24–32) caught focus-zoom, membrane sizing, and connection rendering issues that no unit test could surface.
3. **Playwright E2E tests** (planned) — Automated screenshot regression tests, to be created after visual design stabilises.

## System References

### Components

#### Pure-Math Modules (no DOM dependency)

- `packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts` — Core types: `MembraneNode`, `MembraneLink`, `PinSet`, `PinEntry`
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/layout.ts` — Recursive squarify engine with focus-aware weight boosting
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/hierarchy.ts` — `isBarrelFile()`, `applyBarrelSemantics()`, `getAncestorDirectories()`
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.ts` — `resolveDetailLevels()` (full/summary/badge/hidden)
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/edge-bundling.ts` — Cross-membrane edge aggregation
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts` — Pure-function pin state: add/remove/toggle/serialize/getVisibleConnections
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/routing.ts` — Front/back trace classification + geometry (French Corset stubs)
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts` — `aggregateEdges()`, `renderBundledEdges()`

#### DOM Modules

- `packages/scripts/src/live-docs/explorer/client/views/membraneView/browse-renderer.ts` — DOM factory for collapsed tiles and expanded membranes
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/focal-overlay.ts` — Symbol expansion panels, pin anchors, SVG connection overlay
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/aggregation.ts` — Recursive directory aggregate computation
- `packages/scripts/src/live-docs/explorer/client/views/membraneView/index.ts` — Controller: pan/zoom, focus path, pin dispatch, URL state sync

#### Shared (promoted from view-specific locations)

- `packages/scripts/src/live-docs/explorer/client/views/squarify.ts` — Squarified treemap layout (promoted from `circuitView/`)
- `packages/scripts/src/live-docs/explorer/client/views/connection-geometry.ts` — Bézier paths, gradient generation (promoted from `localView/`)

#### Persistence

- `packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.ts` — lz-string URL state: versioned `ExplorerUrlPayload`, `compressSnapshot()`/`decompressSnapshot()`

### Related Architecture

- [Live Documentation Explorer](live-documentation-explorer.mdmd.md) — Parent component; the Membrane Map is a view within the Explorer
- [Polyglot Adapters](polyglot-adapters.mdmd.md) — Nested type extraction enhancement needed for Membrane Map hierarchical pins

## Evidence

- Design origin: [2026-03-22.1.md chat log](../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-22.1.md) — full design conversation including barrel-as-membrane, namespace mode, and cross-language pressure testing
- Implementation origin: [2026-03-23.1.md chat log](../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) — 7,028-line implementation marathon: 12-step execution plan, 5 design forks resolved, 826/826 tests green, iterative visual playtesting
- UC-094 (Unified View Continuum), UC-095 (Continuous Pin Spectrum), and UC-087 (Circuit Board Reimagined) in `user-use-case-census.md`
