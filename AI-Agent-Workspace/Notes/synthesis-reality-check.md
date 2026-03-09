# Synthesis Reality Check

**Date**: 2026-03-09
**Purpose**: Audit every claim in `product-identity-synthesis.md` against the actual codebase.

The synthesis significantly **understates** what's already built. The user's suspicion was correct.

---

## Verdict by Section

### Three Product Surfaces — ✅ Accurate

The three-surface table (Explorer, CLI, Extension) is correct. The ordering insight ("CLI produces data, Explorer renders it, extension surfaces it in context") matches the code.

### Theme 1: Impact Analysis — Mostly Built, Not "Net-New"

**Synthesis says**: Impact tracing (single-origin fan-out) is a "2/24 insight" and "net-new."

**Reality**:

- `inspect --from` CLI already does single-origin fan-out (BFS from a source, showing visited + frontier). Shipped.
- `inspect --from <A> --to <B>` does FROM/TO shortest-path. Shipped.
- Symbol-aware pathfinding exists: `pathfind-symbol.ts` tracks symbol transitions through hops. Shipped.
- Explorer `pathfind.ts` implements **client-side** BFS with bidirectional search (tries inbound then outbound). Shipped.
- The **pathfinding toolbar** exists in the template HTML: FROM/TO inputs with search autocomplete, symbol dropdowns, clear buttons. Shipped.
- Multi-hop N-column rendering exists: `render.ts` handles `activePath` (path mode with 1 column per node) and `pinnedPath` (multi-hop exploration with 2N+1 columns). Shipped.
- `PathResult` state type tracks `nodeIds`, `fromSymbol`, `toSymbol`, `isReversed`. Shipped.

**What's actually new**: The specific UX behavior of "From only → blast radius visualization; From + To → shortest path" as a **single unified mode** in the Explorer toolbar. The plumbing exists but the dual-mode trigger isn't wired.

**Gap**: ~20% — the mode-switching logic, not the underlying capability.

### Theme 2: Topology Visualization — Fully Built

**Synthesis says**: "Three views serve genuinely different cognitive tasks."

**Reality**: All three views exist and work:

- **Circuit Board** (`circuitView.ts`): DOM-based treemap. Shipped.
- **Force Graph** (`forceGraphView.ts`): 3D force-directed via ForceGraph3D with archetype coloring, related-doc overlay nodes, click-to-navigate. Shipped.
- **Local Map** (`localView/`): 15+ module files, hierarchical columns, multi-hop, symbol-level connections, Bézier curves, self-loop routing, directory grouping, test backing display. Shipped.

Not understated here — the synthesis is accurate that these exist.

### Theme 5: Simplicity & Adoption — Server Retirement Overstated

**Synthesis says**: "Retiring the Explorer server is the logical next step."

**Reality**: The static builder is **already more capable** than the synthesis implies:

- `buildStaticExplorer()` builds graph → provenance (commitHash, gitRef, generatedAt) → symbol index → docs dict → scans markdown for relative links → bundles referenced markdown → pre-computes local maps → generates `explorer-data.json` + `index.html`
- `StaticExplorerData` schema includes: version, schemaVersion, provenance, graph, docs, symbolIndex, bundledMarkdown, bundledMarkdownTree, relatedDocLinks, viewerConfig
- The client code has a 4-step data loading cascade: inline JSON → URL `?data=` param → `explorer-data.json` → server `/graph` fallback
- The static site already handles bundled doc navigation (clicking links to READMEs, specs, etc. that were scanned from markdown links)

The server provides exactly one capability the static build doesn't: **`/open` endpoint** (opens file in VS Code via `code` CLI). Everything else is already isomorphic. The synthesis frames this as a pending decision, but the static builder already won.

### Theme 6: Coverage & Health Diagnostics — Already Has Knowledge Sources

**Synthesis says**: "The lint pipeline's JSON output should be the data source for the Explorer's health view."

**Reality**: The Explorer's **Knowledge Sources** view (`sources-view.ts`, ~480 lines) already computes client-side:

- Node count, link count
- Archetype breakdown (implementation, test, asset, config, etc.)
- **High fan-out** nodes (potential barrel files) with threshold detection
- **High fan-in** nodes (heavily depended-upon)
- **Island/orphan detection** (nodes with zero inbound AND zero outbound)
- Islands grouped by directory with truncation
- Data source indicator (static bundle vs. server)
- Download capability
- Bundled docs tree navigation
- Clickable node navigation from warnings

**What's missing**: The lint CLI does NOT currently emit JSON (no `--json` flag). So the "lint → Explorer pipeline" (Proposal D) is genuinely incremental — the lint computation and the Explorer computation are currently **independent**. Unifying them via JSON serialization is real work.

### Theme 7: Distribution & Shareability — Further Along Than Stated

**Synthesis says**: "The static site IS the distribution."

**Reality**: It already is! The codebase has:

- **URL state persistence** (`url-state.ts`): `?view=` and `?node=` params, `replaceState` to avoid history pollution, configurable default view via `viewerConfig`. Shareable URLs work today.
- **`?data=` param**: load graph from arbitrary URL — enables embedding in Teams, Slack, etc.
- **Provenance**: `commitHash`, `gitRef`, `generatedAt` baked into every static build
- **Markdown download**: detail panel has download button for both graph nodes and bundled docs
- **Viewer config**: `defaultView`, `initialFocusNode` — static builds can be pre-configured to open on a specific view/node

---

## Audit of the Six "Genuinely New Architectural Proposals"

### A. Progressive-Disclosure Map View (replacing Circuit Board)

**Synthesis says**: "Net-new. Requires Layer 2 work item and Layer 3 architecture doc."

**Reality**: Genuinely net-new. The current Circuit Board is a flat DOM treemap with no directory drill-down or inter-directory edge aggregation. This proposal requires new code. **Accurate.**

### B. Universal Card Component

**Synthesis says**: "Net-new. The current Local Map card is the seed; it needs the authored content region and the toolbar."

**Reality**: The card is **much further along** than "seed":

- Identity header (name + path). ✅
- Symbol pills with inbound/outbound anchor dots. ✅
- Symbol hover → connection highlighting. ✅
- Symbol click → pinned highlighting (sticky). ✅
- Type reference indicators with resolved-link badges. ✅
- Internals pseudo-symbol row. ✅
- Test backing display (test count + names). ✅
- Directory label. ✅
- Double-click → recenter navigation. ✅

**What's actually missing**:

- Authored content region (Purpose/Notes rendered inline on the card). Not present — this lives in the detail panel sidebar.
- Compact toolbar on each card (Map View / Force Graph / Open in Editor / Download). Not present.
- Popover instantiation in Force Graph and Map View contexts. Not present.

**Gap**: ~30% — the card exists and is sophisticated, but doesn't yet serve as the "universal" renderer across all views.

### C. Impact Tracing as Visualization Mode

**Synthesis says**: "Net-new. Extends CAP-003."

**Reality**: **Partially built.** The pathfinding toolbar, the multi-hop column renderer, and the `PathResult`/`activePath` state management all exist. What's missing is the specific behavior: "when FROM is set but TO is empty, render blast-radius columns." The current code requires both endpoints for path mode. **Gap: ~40%** — architecture exists, specific mode trigger does not.

### D. Lint → Explorer Pipeline

**Synthesis says**: "Incremental. Lint already exists; JSON serialization and Explorer injection are new."

**Reality**: **Accurate.** The lint CLI has no `--json` flag. The Knowledge Sources view computes metrics independently. Connecting them via JSON is real incremental work.

### E. Server Retirement

**Synthesis says**: "Decision required."

**Reality**: The static builder already handles everything except `/open` (editor integration). The client code already has the 4-step cascade with server as last fallback. This is less a "decision" and more an acknowledgment that the static path is already the primary architecture. The server is already effectively a development convenience, not a production dependency. **Overstated as a decision — it's already happened architecturally.**

### F. Directory Aggregates as Derived Views

**Synthesis says**: "Design-compatible with existing architecture."

**Reality**: **Accurate.** The Knowledge Sources view already groups islands by directory, and the Circuit Board already renders a directory-based treemap. But no cross-directory edge aggregation, cohesion ratio, or drill-down exists. This is genuinely new computation. **Accurate.**

---

## Features the Synthesis Entirely Missed

These exist in the codebase but aren't mentioned in the synthesis:

1. **Omnisearch / Command Palette** (`omnisearch.ts`): Ctrl+P fuzzy search across all graph nodes by name, path, and symbols. Keyboard navigation. Already shipped.

2. **Tuning Panel** (`tuning.ts`): Column gap, hover dim symbols, hover dim connections — all adjustable live. CSS custom properties. Persisted to localStorage.

3. **LocalStorage Persistence** (`local-storage.ts`): Filter state, tuning state, and navigation (last view + last node) all persist across sessions. `readPersistedUi()`, `readPersistedNav()`.

4. **Related Documentation Overlay in Force Graph**: The Force Graph already renders `related-doc` nodes (purple) for markdown files linked from Live Docs that aren't themselves graph nodes. Clicking them shows bundled doc content. This is a significant brownfield/context feature.

5. **Bundled Markdown Tree Navigation**: The static builder scans markdown for relative links, bundles referenced files, and builds a tree structure. The Explorer can navigate between bundled docs (READMEs, specs, etc.) via clickable links, with breadcrumb-style path indicators.

6. **Self-Loop Connection Routing**: The Local Map renders intra-file symbol references (where a symbol in a file depends on another symbol in the same file) as curved connections that route around the card edge. This is sophisticated graph visualization work.

7. **Symbol Normalization Engine** (`symbolAnchors.ts`): Strips export syntax, generics, namespace prefixes, trailing punctuation, slugified suffixes to match symbols across different textual representations. This powers the symbol-level connection accuracy.

8. **Connection Geometry Module** (`connection-geometry.ts`): Pure math module for Bézier computation with configurable tuning, approximate length calculation, self-loop routing — fully unit-testable with no DOM dependency.

9. **Multi-hop Subgraph Builder**: The controller can build subgraphs for each hop in a pinned path, track hop-aware anchors, and draw connections across hop boundaries.

10. **Data Loader** with lazy server-side bundled doc fetching: In server mode, related docs and bundled markdown are fetched on demand (not upfront), keeping initial load fast.

---

## Summary Scorecard

| Synthesis Claim                   | Actual Status                      | Gap                |
| --------------------------------- | ---------------------------------- | ------------------ |
| Impact tracing is "net-new"       | Architecture 80% built             | 20% (mode trigger) |
| FROM/TO pathfinding shipped       | ✅ Fully shipped (CLI + Explorer)  | 0%                 |
| N-column multi-hop visualization  | ✅ Fully shipped                   | 0%                 |
| Static site export                | ✅ More complete than stated       | 0%                 |
| URL state/shareability            | ✅ Shipped (not mentioned)         | 0%                 |
| Omnisearch                        | ✅ Shipped (not mentioned)         | 0%                 |
| Knowledge Sources                 | ✅ Shipped with fan-out/in/islands | 0%                 |
| Force Graph related docs          | ✅ Shipped (not mentioned)         | 0%                 |
| Symbol pinning/hover              | ✅ Shipped                         | 0%                 |
| Tuning panel                      | ✅ Shipped (not mentioned)         | 0%                 |
| Progressive Map View (Proposal A) | Genuinely new                      | 100%               |
| Universal Card (Proposal B)       | Card is 70% there                  | 30%                |
| Impact Tracing mode (Proposal C)  | Architecture exists, mode doesn't  | 40%                |
| Lint → Explorer JSON (Proposal D) | Lint has no JSON output            | 80%                |
| Server Retirement (Proposal E)    | Already architecturally happened   | 10%                |
| Directory Aggregates (Proposal F) | Genuinely new computation          | 90%                |

**Bottom line**: Of the six "genuinely new architectural proposals," only two (A and F) are genuinely new. Three (B, C, E) are incremental extensions of existing shipped work. One (D) is an infrastructure connection between two existing systems. The synthesis significantly understated the Explorer's current sophistication.
