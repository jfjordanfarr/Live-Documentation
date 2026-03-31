# Membrane Map — Execution Plan

> Status: Promoted from `AI-Agent-Workspace/tmp/membrane-map-execution-plan.md` on 2026-03-31 so the in-flight Membrane convergence work is committed with the repository.
> Remove this note once the remaining plan items are implemented and the durable outcomes are fully absorbed into [the Layer 3 Membrane architecture doc](../../.mdmd/layer-3/membrane-map.mdmd.md).

**Created**: 2026-03-23 (Dev Day 80)
**Architecture doc**: `.mdmd/layer-3/membrane-map.mdmd.md`
**Backlog**: Stage 12 (LD-1200–LD-1213)
**Origin**: Dev Day 79 design session

---

## Overview

Replace Circuit Board (9 files, ~2,200 lines) + Local Map (24 files, ~8,950 lines) with a unified **Membrane Map** (~20 files, ~3,000–4,000 lines) — a zoomable treemap where directories render as nested containment "membranes" and dependency connections pierce boundaries. The Force Graph remains unchanged as an orthogonal topological view.

**Development methodology**: 10-rung zipper (test-first interleaving organized by confidence, not feature). Pure-function rungs first (no DOM), then DOM rendering, then integration.

**Coexistence strategy**: Old Circuit Board + Local Map remain alive during development for cross-validation. Phase-out occurs separately after stability is proven.

---

## Commit Structure

This plan originally assumed **two major commits**. That is no longer the lived history.

### Current reality (Day 86)

- Steps 0–9 are substantively landed and were shipped incrementally across Dev Days 80–86 rather than as one future mega-commit.
- Step 10 is substantively complete: the Playwright harness exists, 12 E2E spec files / 25 tests are green, and the suite now covers browse mode, pin-active layout, containment, dimming, directory bands, refresh restore, expanded-card persistence, multi-focal pinning, path-as-pins breadcrumb restore, Membrane cold-start default behavior, and pin-active visual stability across reload.
- Step 11 has started as a convergence phase rather than a true phase-out: Circuit Board + Local Map still ship, Membrane still has type-level coupling to Circuit Board, but Membrane is now the default cold-start view.
- Step 12 namespace mode remains a separate deferred follow-on.

### Historical framing

The original split is still useful as provenance:

- Steps 0–11: core Membrane Map
- Step 12 / LD-1207: namespace mode

But "Commit 1" should now be read as a historical bundle of work that landed across multiple commits, not as a future single landing event.

---

## Step 0 — Preparatory Module Promotions

**Goal**: Move reusable modules from `localView/` and `circuitView/` up to the shared `views/` level so both old views and the new Membrane Map can import from a common location.

### Promotion Assessment (from codebase analysis)

| Module                           | Location       | Lines   | Coupling                                                       | Promotable?        |
| -------------------------------- | -------------- | ------- | -------------------------------------------------------------- | ------------------ |
| `squarify.ts` (+test)            | `circuitView/` | 178+143 | Only `LayoutRect` type from `layoutUtils`                      | **Yes — clean**    |
| `connection-geometry.ts` (+test) | `localView/`   | 384+505 | Zero imports                                                   | **Yes — cleanest** |
| `pan-zoom.ts` (+test)            | `localView/`   | 277+207 | `LocalViewRuntime`, `MapTransform` from local types            | **Deferred**       |
| `card-factory.ts`                | `localView/`   | 410     | `LocalViewController` passed to every function                 | **Deferred**       |
| `symbol-highlight.ts` (+test)    | `localView/`   | 276+387 | `LocalViewOptions`, `LocalSubgraph`, `LocalSubgraphLink`       | **Deferred**       |
| `runtime.ts`                     | `localView/`   | 246     | `MultiHopEntry`, `ColumnRole`, `LocalSubgraph`, `MapTransform` | **Deferred**       |

**Decision (Day 80)**: Only `squarify.ts` and `connection-geometry.ts` are cleanly promotable today. The other 4 modules are coupled to Local Map-specific types and interfaces. Promoting them would either (a) drag Local Map types into shared space (architecturally messy) or (b) require interface extraction refactoring (premature before the Membrane Map's own type system is defined). The pragmatic path: promote the 2 clean modules now, write the Membrane Map's pure-function layer with its own types, then extract shared interfaces once both type systems exist and commonality is visible.

**Checklist**

- [x] **0.1** Move `circuitView/squarify.ts` → `views/squarify.ts`
- [x] **0.2** Move `circuitView/squarify.test.ts` → `views/squarify.test.ts`
- [x] **0.3** Update `circuitView/index.ts` import path for squarify
- [x] **0.4** Move `localView/connection-geometry.ts` → `views/connection-geometry.ts`
- [x] **0.5** Move `localView/connection-geometry.test.ts` → `views/connection-geometry.test.ts`
- [x] **0.6** Update any imports referencing old paths (if any)
- [x] **0.7** Run `npm run build` — verify zero compile errors
- [x] **0.8** Run tests — verify all pass (691/691)
- [ ] **0.9** ~~Commit~~ (deferred — folded into Commit 1)

---

## Step 1 — Recursive Membrane Layout (Rung 1: pure math)

**Goal**: Given a workspace file tree, produce nested rectangles where directories are membranes containing their children.

**Test First**

Assert that recursive squarify produces correct `MembraneNode[]` trees:

- Every file has absolute coordinates
- Parent membranes fully contain their children
- Sibling membranes don't overlap
- Coordinates are stable (adding a file to dir B doesn't move dir A)
- Total area proportional to configurable weight (file count, line count, connection count)

**Then Implement**

`membraneView/layout.ts` — `computeMembraneLayout()` calling the promoted `squarify()` recursively. Input: hierarchy tree + viewport rect. Output: `MembraneNode[]` tree with absolute coordinates.

**Checklist**

- [x] **1.1** Create `membraneView/types.ts` — `MembraneNode`, `MembraneLayout`, weight config types
- [x] **1.2** Create `membraneView/layout.test.ts` — containment, non-overlap, stability assertions
- [x] **1.3** Create `membraneView/layout.ts` — recursive squarify with configurable padding/margins
- [x] **1.4** All layout tests green (11/11 new tests, 702/702 total)
- [ ] **1.5** ~~Commit~~ (deferred — implementation-first, commit prep at the end)

---

## Step 2 — Barrel Detection (Rung 2: pure math)

**Goal**: Detect barrel files (index.ts, `__init__.py`, mod.rs, doc.go) and apply barrel-as-membrane semantics — barrel files are removed from interior node lists and their parent directory membrane absorbs their identity. The existing `buildHierarchy()` in `layoutUtils.ts` handles path-based hierarchy construction; no new hierarchy builder is needed.

**Scoping decision (Day 80)**: Namespace mode (`namespaceToHierarchy`) is deferred to Commit 2 / Step 12 / LD-1207. The namespace data (`extractCSharpNamespace()`) exists server-side but doesn't flow into `ExplorerNodePayload`. That's a data pipeline extension, not a layout concern.

**Test First**

- `isBarrelFile(name)` correctly identifies index.ts, `__init__.py`, mod.rs, doc.go
- `isBarrelFile(name)` rejects non-barrel files (utils.ts, main.go, index.css)
- `applyBarrelSemantics(tree)` removes barrel files from directory nodes lists
- Barrel is preserved when it's the only file in a directory (otherwise the membrane has no weight)
- Nested barrel files at multiple levels are handled correctly

**Then Implement**

`membraneView/hierarchy.ts` — `isBarrelFile()` + `applyBarrelSemantics()`.

**Checklist**

- [x] **2.1** Create `membraneView/hierarchy.test.ts` — barrel detection + barrel-as-membrane assertions
- [x] **2.2** Create `membraneView/hierarchy.ts` — barrel detection + tree transform
- [x] **2.3** All hierarchy tests green (9/9)
- [ ] **2.4** ~~Commit~~ (deferred — implementation-first, commit prep at the end)

---

## Step 3 — Detail Level Resolution (Rung 3: pure math)

**Goal**: Given a focal node (or pair), determine what detail level each node in the layout receives: full (expanded card with pins), summary (small card), or badge (directory aggregate count).

**Test First**

- Focal node gets `full` detail
- Direct neighbors get `summary` detail
- Distant nodes get `badge` detail
- Viewport culling: off-screen nodes get `hidden`
- Membrane depth thresholds: deeply nested membranes collapse to badges

**Then Implement**

`membraneView/detail-levels.ts` — `resolveDetailLevels()`.

**Checklist**

- [x] **3.1** Create `membraneView/detail-levels.test.ts`
- [x] **3.2** Create `membraneView/detail-levels.ts`
- [x] **3.3** All detail-level tests green (8/8)
- [ ] **3.4** ~~Commit~~ (deferred)

---

## Step 4 — Edge Bundling (Rung 4: pure math)

**Goal**: Aggregate N individual cross-membrane edges into bundled edges at the membrane boundary level when directories are collapsed.

**Test First**

- N edges between two collapsed dirs → 1 bundled edge with count
- Bidirectional bundles show separate inbound/outbound counts
- Expanding a directory dissolves bundles into individual connections
- Self-contained edges (both endpoints inside same membrane) are not bundled externally

**Then Implement**

`membraneView/edge-bundling.ts` — `aggregateEdges()`.

**Checklist**

- [x] **4.1** Create `membraneView/edge-bundling.test.ts`
- [x] **4.2** Create `membraneView/edge-bundling.ts`
- [x] **4.3** All edge-bundling tests green (6/6)
- [ ] **4.4** ~~Commit~~ (deferred)

---

## Step 5 — Browse Mode Rendering (Rung 5: DOM)

**Goal**: Render the membrane treemap in Browse mode — no focal node selected, all directories collapsed to aggregate tiles. First visual output.

**Test First**

- DOM snapshot: nested containers match layout coordinates
- Directory labels rendered on membranes
- File count badges visible
- Pan/zoom functional
- Click on membrane → expand (drill into directory)

**Then Implement**

`membraneView/browse-renderer.ts` — creates nested DOM elements from `MembraneNode[]` tree.

**Checklist**

- [x] **5.1** Create `membraneView/browse-renderer.ts` — DOM factory for browse mode
- [x] **5.2** Create `membraneView/aggregation.ts` — recursive aggregate metrics
- [x] **5.3** Create `membraneView/index.ts` — controller with pan/zoom, progressive disclosure
- [x] **5.4** Create `styles/membrane.css` — membrane containers, collapsed tiles, leaf files, badges
- [x] **5.5** Integration: template.html (nav item + container), dom.ts (zoom controls), index.ts (view registration), types.ts (ViewName += "membrane")
- [x] **5.6** Build clean, 725/725 tests pass
- [x] **5.6a** Hybrid mixed-content layout for focused directories that contain both files and subdirectories
- [x] **5.6b** Collapsed-by-default file cards with click-to-expand, symbol-count summaries, and browse-mode pin-all
- [x] **5.6c** Browse breadcrumb bar + directory-level `Explore ⇗` affordance grounded in source-relative hierarchy keys
- [x] **5.7** Visual verification landed incrementally: manual Playwright sessions on Dev Days 83–85 plus automated browse-mode E2E coverage in Step 10
- [ ] **5.8** ~~Commit~~ (deferred)

---

## Step 6 — Pin State + Focal Overlay (Rung 6: pure function + DOM)

**Design decision (Day 81):** The discrete Browse/Explore/Compare/Path modes are replaced by a **continuous pin-based interaction model**. There is no mode picker. The rendering state is determined by:

- `pinnedSymbols: Set<{nodeId, symbolName}>` — each pinned symbol's connections are drawn
- `activePath?: PathResult` — if a BFS result exists, its hops get numbered badges + pulse

The continuous spectrum: Browse (0 pins) → Selected (detail panel) → Partial Pins (symbol connections drawn) → All Pins (≡ Local Map). "Compare" emerges from pinning symbols on two nodes. "Path" emerges from an active BFS result.

**Multi-hop on membrane substrate (Day 81 decision):** Path mode renders on the membrane, NOT in a separate column layout. The common membrane (LCA) provides natural spatial grouping. Numbered hop badges (①②③④), a path breadcrumb bar, and animated path pulse restore the linear narrative that columns provided.

**Detail panel activation (Day 81 decision):** Clicking a card BODY selects the node (updates detail panel). Clicking a symbol PIN toggles pin state only (does not affect detail panel). Two distinct click targets on the same DOM element.

**Back-connection rendering (Day 81 decision — Q7):** When a connection runs "backward" on the treemap (outbound pin faces away from the target's inbound pin), the full connection path is NOT drawn. Instead, each endpoint renders a **French Corset stub** — the same visual technique used for self-loop connections. The outbound pin gets a short rightward curve that vanishes behind the card; the inbound pin gets a short leftward curve emerging from behind. This preserves L/R directional grammar perfectly and adds zero visual clutter. The hover-promotion feature (revealing the full traced path on hover/pin) is deferred to a future commit — the stubs alone are sufficient to communicate "this pin has a back-connection."

**Dimming semantics (Day 81 decision):** Dimming retains its single meaning: "irrelevant to current focus" (the existing dim-on-hover behavior). Back-connections are NOT dimmed — they are hidden by construction (stubs only). This prevents semantic collision between "irrelevant" and "routed backwards."

**URL state sharing (Day 81 decision; Days 81/85/86 implementation reality):** Use `lz-string.compressToEncodedURIComponent()` into a single versioned `?s=<compressed>` query param for shareable Membrane state. The landed Membrane snapshot now round-trips current view, selected node, pins (including hop metadata), expanded directories, expanded cards, transform, and display filters. Broader Explorer UI and navigation fallback still persist via versioned localStorage when no explicit URL state is present.

### Rung 6a — Pin State (pure function)

**Test first**:

- Pinning a symbol adds it; unpinning removes it
- `getVisibleConnections(pins, graph)` returns union of all pinned symbols' edges
- Pinning all symbols on one node ≡ the current Local Map neighborhood
- Path activation produces numbered hop annotations on the connection set
- Pin state serializes/deserializes for URL persistence

**Then implement**: `membraneView/pin-state.ts` — `PinSet`, `getVisibleConnections()`, path annotation helpers.

### Rung 6b — Focal Overlay Renderer (DOM)

**Test first**:

- Clicking a file tile opens the detail panel (existing behavior preserved)
- Pinning a symbol on the focal node causes its connections to render as SVG paths
- Connected nodes show only relevant pins (not full symbol lists)
- Membrane boundary crossings are visually marked (gap/glow at crossing point)
- Unpinning removes the connections

**Then implement**: `membraneView/focal-overlay.ts` — extends browse-renderer with symbol card expansion + SVG connection drawing.

**Checklist**

- [x] **6.1** Create `membraneView/pin-state.ts` — PinSet, getVisibleConnections, path annotation
- [x] **6.2** Create `membraneView/pin-state.test.ts` — continuous spectrum assertions (34 tests)
- [x] **6.3** Create `membraneView/focal-overlay.ts` — symbol card expansion + SVG connections
- [x] **6.4** Create `membraneView/routing.ts` — front-trace Bézier + back-connection French Corset stubs
- [x] **6.5** Create `membraneView/routing.test.ts` — front/back classification, stub geometry (18 tests)
- [x] **6.6** Wire pin interaction into controller (pinSet state, togglePin, focal overlay + drawConnections)
- [x] **6.6a** Layered dimming model with persistent `--pinned` / `--connected` endpoint highlighting
- [x] **6.6b** `__internals__` pseudo-symbol participates fully in pinning and connected-endpoint marking
- [x] **6.6c** Universal pin-all toggle available on both browse-mode and pin-active cards
- [x] **6.6d** Reference badges, "Open in Membrane Map", and selected-node auto-focus fixes landed during polish
- [x] **6.7** Visual verification landed incrementally: manual Playwright on Dev Days 84–85 plus automated pin-active E2E coverage in Step 10
- [ ] **6.8** ~~Commit~~ (deferred)

---

## Step 7 — Multi-Focal + Path as Pin Population (Rung 7: DOM)

**Goal**: Support N pinned symbols across multiple nodes. Pathfinder is a **pin population strategy**: BFS produces an ordered `(nodeId, symbol)` set that gets injected into the pin set with hop-index metadata. The standard multi-pin renderer draws them; hop badges and breadcrumb bar are optional decorations on ordered pins.

**Design decision (Day 81 — Q9):** The pathfinder is not a rendering mode. It populates pins. This means the pathfinder UI is desirable (CLI parity with `inspect --from --to`) but not architecturally load-bearing — if it causes difficulty, it can be deferred without blocking multi-focal rendering.

**Test first**

- Pinning symbols on two different nodes draws connections for both
- Common membrane (LCA) of focal nodes expands to contain both
- BFS result injected as ordered pins: renders ①②③④ numbered badges on each hop node
- Path breadcrumb bar renders at top with clickable hop labels
- Intra-membrane hops render as within-membrane connections (no boundary crossing)
- Cross-membrane hops visually pierce boundaries
- Clearing the path result removes hop metadata but can leave pins in place

**Checklist**

- [x] **7.1** Extend focal-overlay.ts for multi-focal rendering (N pinned symbols across M nodes) — `getRequiredExpansions` auto-expands ancestor dirs of pinned nodes
- [x] **7.2** Create path-to-pins adapter: BFS result → ordered PinSet entries with hop indices — already existed as `setPinsFromPath`
- [x] **7.3** Create hop-badge rendering (numbered ①②③④ on path nodes) as PinSet decoration — `attachHopBadges` + `hopLabel`
- [x] **7.4** Create path breadcrumb bar component — `renderPathBreadcrumb` + CSS
- [x] **7.5** Multi-focal + path-as-pins tests — 9 new tests (6 auto-expansion + 3 hopLabel), 45/45 pass
- [ ] **7.6** Visual verification (deferred to Step 10 E2E)
- [ ] **7.7** ~~Commit~~ (deferred)

---

## Step 8 — SVG Edge Bundling Rendering (Rung 8: DOM)

**Goal**: When N connections cross the same membrane boundary, collapse them into one thick bundled edge with a count badge. Expanding the endpoint membrane reveals individual connections.

**Current status (Day 86):** The SVG/bundle math and DOM renderer exist, but the browse-mode controller wiring remains intentionally commented out in `membraneView/index.ts` as "Disabled for MVP" because the thick inter-tile arcs were judged too noisy without a hover/progressive-disclosure design. Individual pin-active connections ship today; browse-mode bundled arcs do not.

**Test first**

- 12 edges between collapsed `shared/` and `server/` → 1 bundled edge, count=12
- Expanding `shared/` → 12 individual edges visible from their source files
- Self-membrane edges (both endpoints in same directory) are never bundled
- Bundle thickness scales with connection count

**Checklist**

- [x] **8.1** Create `membraneView/svg-connections.ts` — SVG path drawing from routing + bundling output (pure functions: bundleStrokeWidth, computeEdgeExitPoint, computeBundleCurvePath, computeBundleMidpoint; DOM: renderBundledEdges)
- [x] **8.2** Wire bundled edge hover to show individual connections — CSS hover style on `.membrane-bundle-edge`
- [x] **8.3** SVG connection + bundling tests — 16 tests (4 strokeWidth + 6 edgeExit + 3 curvePath + 3 midpoint), all pass
- [ ] **8.4** Re-enable controller wiring for browse-mode bundled edges once the progressive-disclosure design is settled
- [ ] **8.5** Visual verification after re-enable
- [ ] **8.6** ~~Commit~~ (deferred)

---

## Step 9 — Controller Refactor + Integration (Rung 9)

**Goal**: Refactor the existing `membraneView/index.ts` controller to incorporate pin state, focal overlay, and path highlighting. Wire URL state persistence for pinned symbols + active path. No mode picker needed — the continuous pin model IS the interaction.

**Checklist**

- [x] **9.1** Refactor `membraneView/index.ts` — integrate pin-state, focal-overlay, svg-connections, routing (done in Steps 6-8 progressively)
- [x] **9.2** Implement versioned lz-string URL state (`?s=` param) for selected node, pins, expanded directories, transform, filters, and later expanded-card persistence
- [x] **9.2a** Outer shell now reads compressed `?s=` first and still tolerates legacy param shapes for restore compatibility
- [x] **9.3** Wire keyboard shortcuts — Escape to clear pins (with input/textarea guard)
- [x] **9.3a** Source-relative hierarchy correction (`node.id` / repo topology, not `.mdmd` mirror paths) for browse breadcrumbs and directory Explore behavior
- [x] **9.3b** Refresh restore via compressed `?s=` parsing landed on Dev Day 85
- [x] **9.3c** Expanded-card persistence landed on Dev Day 86 (`expandedCards` round-trips through the compressed payload)
- [x] **9.4** Controller integration is now partially covered by Playwright E2E (card interactions, dimming, containment, directory restore, expanded-card restore)
- [ ] **9.5** ~~Commit~~ (deferred)

---

## Step 10 — E2E Regression Harness (Rung 10)

**Goal**: Playwright-backed regression coverage for the Membrane Map's browse-mode, pin-active layout, containment, dimming, and URL-state restoration.

### Current coverage (Day 86)

The suite now contains 12 spec files / 25 tests:

- Browse mode: mixed-content layout, collapsed/expanded card behavior, focus layout, font invariance
- Pin-active: containment, dimming, directory bands, pin-all active state
- State restore: directory refresh restore and expanded-card persistence
- Multi-focal / path-as-pins: second-card pinning in pin-active mode, path-seeded breadcrumb restore, shared ancestor membrane restore
- Cold-start behavior: Membrane first-load landing and explicit `?view=local` writing for Local Map
- Visual stability: symbol-pinned reload pixel identity and focal SVG path presence after settle

**Checklist**

- [x] **10.1** Create Playwright harness (`tests/e2e/playwright.config.ts`, `helpers.ts`, static-server workflow)
- [x] **10.2** Add browse-mode regression coverage
- [x] **10.3** Add pin-active regression coverage
- [x] **10.4** Add URL-state regression coverage
- [x] **10.5** Add explicit multi-focal / path-as-pins regression coverage
- [x] **10.6** Add `--e2e` / `--no-e2e` opt-in support to `safe:commit`
- [x] **10.7** Current validation baseline proven green: 872/872 unit · 28 integration · 25 E2E
- [ ] **10.8** ~~Commit~~ (deferred; landed incrementally instead)

---

## Step 11 — Old-View Phase-Out + Doc Convergence

**Goal**: Finish the work that the original plan assumed would happen after the core Membrane landing: remove legacy-view coupling, make Membrane the default cold-start surface, and align docs with the shipped reality.

**Reality check (Day 86):** The old "Commit 1 Prep" framing is obsolete. Membrane Map core landed incrementally across multiple commits and follow-up fixes. What remains here is cleanup and convergence, not a single future mega-commit.

**Checklist**

- [ ] **11.1** Extract or re-home `DirectoryAggregate` so Membrane no longer imports from `circuitView/aggregation.ts`
- [x] **11.2** Make Membrane Map the default cold-start view (`StaticExplorerViewerConfig.defaultView` + shell init logic)
- [ ] **11.3** Remove `circuitView/` once remaining coupling is gone
- [ ] **11.4** Remove `localView/` once the retirement/parity decision is explicit
- [ ] **11.5** Remove old-view CSS and registration code (`circuit.css`, `local.css`, nav wiring, `ViewName` cleanup) after the removals above
- [ ] **11.6** Update L1/L3 docs and Live Docs from "planned successor / in progress" to shipped reality
- [ ] **11.7** Regenerate Live Docs and prune orphaned docs after actual phase-out changes

---

## Open Questions / Decision Log

| #   | Question                                                                      | Status                                         | Decision                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Mode naming (Browse/Explore/Compare/Path)                                     | **Decided Day 81**                             | No modes. Continuous pin model: Browse (0 pins) → Selected (detail panel) → Partial Pins (symbol connections drawn) → All Pins (≡ Local Map). Compare/Path emerge from multi-focal pinning / active BFS result.                                                                                                                                                                                   |
| Q2  | Path mode: membrane spatial vs. column layout?                                | **Decided Day 81**                             | Membrane substrate. Common membrane (LCA) provides spatial grouping; numbered hop badges + breadcrumb bar + animated pulse restore linear narrative. Column layout is unnecessary.                                                                                                                                                                                                                |
| Q3  | Coupled module promotions (card-factory, runtime, pan-zoom, symbol-highlight) | **Decided Day 80**                             | Promote only clean modules (squarify, connection-geometry) now. Write Membrane Map with own types. Extract shared interfaces after both type systems exist.                                                                                                                                                                                                                                       |
| Q4  | `layoutUtils.ts` cleanup                                                      | **Open**                                       | Slim to hierarchy builder + shared types during Step 2.                                                                                                                                                                                                                                                                                                                                           |
| Q5  | Namespace mode scope                                                          | **Decided Day 80**                             | Deferred to Commit 2 / Step 12 / LD-1207. Namespace data exists server-side but doesn't flow into ExplorerNodePayload. Separate data pipeline, not layout.                                                                                                                                                                                                                                        |
| Q6  | Interaction model: discrete modes vs. continuous pin spectrum                 | **Decided Day 81**                             | Continuous pin spectrum. No mode picker. Browse→Selected→Partial Pins→All Pins. Compare/Path emerge naturally from multi-focal pinning / active BFS. Steps 6-8 restructured to reflect this.                                                                                                                                                                                                      |
| Q7  | Pin directionality with cycles in treemap layout                              | **Decided Day 81**                             | Option B (preserve L/R grammar) + Approach X (French Corset stubs). Back-connections render as paired stubs at each endpoint pin — outbound stub curves right, inbound stub curves left — with no visible path between. Hover-promotion of full traced path deferred to future commit. Dimming keeps single meaning ("irrelevant to focus"); back-connections hidden by construction, not dimmed. |
| Q8  | URL state sharing mechanism                                                   | **Decided Day 81; implemented through Day 86** | Use versioned lz-string `?s=` payloads for shareable Membrane state while retaining versioned localStorage for broader Explorer UI/navigation fallback. Startup precedence is explicit URL state (`?s=` or legacy `?view=` / `?node=`) > localStorage > viewerConfig > defaults.                                                                                                                  |
| Q9  | Pathfinder: separate mode or pin population strategy?                         | **Decided Day 81**                             | Pin population strategy. BFS results inject ordered pins into PinSet with hop-index metadata. Multi-pin renderer handles display. Pathfinder UI preserved for CLI parity (`inspect --from --to`) but not architecturally load-bearing. Omnisearch-to-symbol auto-pin is a complementary population strategy.                                                                                      |
| Q10 | Hierarchy should mirror source paths or Live Doc mirror paths?                | **Decided Day 85**                             | Membrane browse/explore hierarchy must mirror source-relative repo topology (`node.id` / code paths), not `.mdmd/layer-4/...` mirror paths. This fixed breadcrumb / `Explore ⇗` correctness and keeps the map aligned with what the user thinks the repo is.                                                                                                                                      |

---

## Step 12 — Namespace Mode (historical Commit 2 / LD-1207)

**Goal**: Add C# namespace-mode toggle — an alternative hierarchy function that groups files by namespace rather than directory path.

**Prerequisite**: Core Membrane Map work (Steps 0–11) must be stable enough that namespace mode is clearly a follow-on data-pipeline concern rather than a moving target.

**Data pipeline work required**:

- Extend `ExplorerNodePayload` with `namespace?: string` field
- Plumb namespace data from `extractCSharpNamespace()` (in `csharp.ts`) through the explorer graph builder (server → shared types → client)
- This is a cross-package change touching `packages/shared`, `packages/scripts`, and potentially `packages/server`

**Checklist**

- [ ] **12.1** Add `namespace?: string` to `ExplorerNodePayload` in `shared/types.ts`
- [ ] **12.2** Plumb namespace from C# adapter → explorer graph builder → JSON payload
- [ ] **12.3** Create `buildNamespaceHierarchy()` — groups files by dot-separated namespace into `DirectoryNode` tree
- [ ] **12.4** Create namespace hierarchy tests (path + namespace produce different trees for same files)
- [ ] **12.5** Wire namespace toggle into Membrane Map controller (hierarchy function swap)
- [ ] **12.6** All tests green
- [ ] **12.7** Live Docs generation + authored content
- [ ] **12.8** `npm run safe:commit` clean
- [ ] **12.9** Commit: `feat(explorer): C# namespace mode — alternative hierarchy for Membrane Map (LD-1207)`

---

## Progress Log

| Date       | Step                | Notes                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-23 | Plan created        | Day 80 — promotion assessment revealed 4/6 modules too coupled for immediate promotion                                                                                                                                                                                                                                                                                                                                  |
| 2026-03-23 | Step 0 (0.1–0.8)    | squarify + connection-geometry promoted, build clean, 691/691 tests pass                                                                                                                                                                                                                                                                                                                                                |
| 2026-03-23 | Step 1 (1.1–1.4)    | types.ts + layout.test.ts + layout.ts created, 11 new tests all green, 702/702 total                                                                                                                                                                                                                                                                                                                                    |
| 2026-03-23 | Q5 decided          | Namespace mode scoped to Commit 2 / Step 12 / LD-1207. Step 2 scoped to barrel-only.                                                                                                                                                                                                                                                                                                                                    |
| 2026-03-23 | Step 2 (2.1–2.3)    | hierarchy.test.ts + hierarchy.ts, 9 tests green (barrel detection + barrel-as-membrane)                                                                                                                                                                                                                                                                                                                                 |
| 2026-03-23 | Step 3 (3.1–3.3)    | detail-levels.test.ts + detail-levels.ts, 8 tests green                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-03-23 | Step 4 (4.1–4.3)    | edge-bundling.test.ts + edge-bundling.ts, 6 tests green. Pure-math rungs (1-4) complete.                                                                                                                                                                                                                                                                                                                                |
| 2026-03-23 | Step 5 (5.1–5.6)    | browse-renderer.ts, aggregation.ts, index.ts controller, membrane.css, integration wiring. Build clean, 725/725 tests.                                                                                                                                                                                                                                                                                                  |
| 2026-03-24 | Q1, Q2, Q6 decided  | Day 81 — Continuous pin model replaces discrete modes. Path mode on membrane substrate (not columns). Steps 6-8 restructured.                                                                                                                                                                                                                                                                                           |
| 2026-03-24 | Q7, Q8 decided      | Day 81 — Back-connections: Option B + Approach X (French Corset stubs, hover-promotion deferred). URL state: always lz-string, comprehensive. Detail panel: card body = select, pin = toggle. Dimming: single meaning preserved.                                                                                                                                                                                        |
| 2026-03-24 | Q9 decided          | Day 81 — Pathfinder is a pin population strategy, not a rendering mode. BFS → ordered PinSet entries. Step 7 updated. Omnisearch-to-symbol auto-pin is complementary. Pathfinder UI preserved for CLI parity but not load-bearing.                                                                                                                                                                                      |
| 2026-03-24 | Step 6 (6.1–6.6)    | Day 81 — pin-state.ts (34 tests), routing.ts (18 tests), focal-overlay.ts, CSS, controller wiring. Build clean, 777/777 tests. Visual verification (6.7) remains.                                                                                                                                                                                                                                                       |
| 2026-03-24 | Step 7 (7.1–7.5)    | Day 81 — Test audit (5 edge-case tests added), getRequiredExpansions auto-expansion, attachHopBadges, renderPathBreadcrumb, 9 new tests. 791/791 tests.                                                                                                                                                                                                                                                                 |
| 2026-03-24 | Step 8 (8.1–8.3)    | Day 81 — svg-connections.ts (16 tests: bundleStrokeWidth, computeEdgeExitPoint, computeBundleCurvePath, computeBundleMidpoint). Controller wired. CSS added. 807/807 tests.                                                                                                                                                                                                                                             |
| 2026-03-24 | Step 9 (9.1–9.3)    | Day 81 — lz-string installed, compressed-url-state.ts (19 tests). Versioned payload (v1), forward-compatible. Controller wired (read on init, write on render). Keyboard Escape. 826/826 tests.                                                                                                                                                                                                                         |
| 2026-03-27 | Step 5 refinement   | Day 83 — hybrid mixed-content browse layout, collapsed-by-default cards, browse-mode pin-all, test-backed styling, tuning-triggered connection redraw, and connected-endpoint indication. 870/870 tests.                                                                                                                                                                                                                |
| 2026-03-28 | Step 6/9 polish     | Day 84 — layered dimming model, universal pin-all toggle, `__internals__` participation, reference badges, "Open in Membrane Map", and selected-node auto-focus via correct path derivation. 870/870 tests.                                                                                                                                                                                                             |
| 2026-03-30 | Step 10 (partial)   | Day 85 — Playwright harness + 16 E2E tests, source-relative hierarchy correction for browse breadcrumbs / `Explore ⇗`, compressed `?s=` restore fix, and pin-active overflow repair. `safe:commit -- --benchmarks --e2e` green.                                                                                                                                                                                         |
| 2026-03-31 | Step 9.2 refinement | Day 86 — `expandedCards` URL persistence: added `c?: string[]` to `CompressedPayload`, `expandedCards: ReadonlySet<string>` to `UrlStateSnapshot`, restored from URL on controller init, included in `persistToUrl()`. 3 Playwright E2E tests (`membrane-card-expand-persistence.spec.ts`) written red-first then passed. 872/872 unit · 19 E2E. Step 9.2 now includes expandedCards.                                   |
| 2026-03-31 | Step 10.5 complete  | Day 86 — Added explicit multi-focal / path-as-pins Playwright coverage in `membrane-multifocal-path.spec.ts`: one interaction-driven test proves second-card pinning yields a real multi-focal pin-active state, and one URL-seeded test proves path breadcrumb + shared ancestor membrane restore from compressed `?s=` state. Helper widened so `pinAllOnCard` works in browse and pin-active cards. 21/21 E2E green. |
| 2026-03-31 | Step 11.2 complete  | Day 86 — Membrane is now the cold-start default. `parseInitialState()` falls back to `membrane`, `StaticExplorerViewerConfig.defaultView` now permits `"membrane"`, the static shell template boots with the Membrane nav/view active, and `membrane-default-view.spec.ts` guards both first-load landing and explicit `?view=local` writing for Local Map. 23/23 E2E green.                                            |
| 2026-03-31 | Step 10 extension   | Day 86 — Added `membrane-visual-stability.spec.ts` to catch temporal connector drift by comparing a symbol-pinned `liveDocumentationConfig.ts` render against its own reload at the pixel-buffer level and by asserting focal SVG path visibility after settling. 25/25 E2E green.                                                                                                                                      |
