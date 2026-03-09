# Product Identity Synthesis

**Synthesized from**: 93 use cases (UC-001 through UC-093) across 102 chat files, grounded against the full 2026-02-24 architectural discussion.

**Date**: 2026-03-01

---

## What Live Documentation Is

Live Documentation is a **codebase cartography tool**. It reverses polyglot source code into a common markdown convention — one markdown file per tracked artifact — creating a versionable, browsable, machine-readable **map** of how every file, symbol, and dependency relates to every other.

The map is the product. Authored annotations are first-class enrichment, not the reason the map exists.

### The Elevator Pitch (Two Sentences)

> Live Documentation turns any codebase into a navigable dependency map expressed in plain Markdown. Run it, browse the graph, trace the impact of any change across any language — then share the result as a static site, a CLI report, or a set of versioned docs.

### The Mission (Unchanged Since Day 1)

> "For any given change in any given file, this extension provides the definitive answer to the question: **What other files will be impacted by this change?**" — UC-006

---

## Three Product Surfaces, One Graph

The census reveals three distinct audiences and delivery mechanisms, all consuming the same underlying dependency graph:

| Surface                    | Primary Audience                             | Delivery                                                             | Census Evidence                        |
| -------------------------- | -------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| **Explorer** (static site) | Stakeholders, architects, security reviewers | `live-docs:visualize` → `dist/explorer/` → any browser, GitHub Pages | UC-052, UC-060, UC-086, UC-087, UC-090 |
| **CLI** (npm package)      | AI agents, CI pipelines, developer terminals | `live-docs:generate`, `lint`, `inspect`                              | UC-019, UC-041, UC-046, UC-056, UC-084 |
| **VS Code Extension**      | Active developers in-editor                  | Language server, diagnostics, hover cards                            | UC-001, UC-004, UC-015, UC-039, UC-082 |

The 2/24 chat crystallized an important ordering: **the CLI produces the data, the Explorer renders it, the extension surfaces it in context.** No runtime server is architecturally required.

---

## Census Clusters: What the User Actually Wants

Reading all 93 use cases chronologically, they cluster into **seven enduring themes** that have persisted across 5 months of development:

### 1. "What changes when I change this?" (Impact Analysis)

**Core UCs**: 001, 006, 012, 041, 047, 062, 064, 090

This is the founding motivation and appears in every month of development. It drives the inspect CLI pathfinder (UC-041), the FROM/TO Local Map (UC-062), N-column hop visualization (UC-064), and the PCI-DSS data tracing use case (UC-090). Impact analysis is the **primary value proposition** — everything else exists to make this question answerable.

**2/24 insight**: Impact tracing (single-origin fan-out) is the natural complement to FROM/TO pathfinding. When only `From` is set, show the blast radius. When both are set, show the shortest path. Same controls, two modes.

### 2. "Show me the shape of the whole system" (Topology Visualization)

**Core UCs**: 045, 048, 049, 050, 053, 059, 086, 087

The Force Graph (UC-086) is the most valued view by far — it reveals emergent, non-hierarchical structure that no directory tree or treemap can show. The Circuit Board (UC-087) needs reimagining as a progressive-disclosure Map View. The Local Map and its card component are already excellent and should become the universal detail renderer.

**2/24 insight**: Three views serve genuinely different cognitive tasks. The Force Graph shows **emergent topology** (what shape does the system have?). The Map View shows **hierarchical organization** (where is everything?). The Local Map shows **focused analysis** (what flows through this specific node?). The card component unifies all three as the atomic unit of understanding.

### 3. "Make it work for any language" (Polyglot Analysis)

**Core UCs**: 003, 013, 017, 023, 025, 042, 068, 069, 070, 076, 077, 078, 079

From "LLM extraction, not parsers" (UC-017) to "tree-sitter WASM as universal baseline" (UC-077), the approach evolved dramatically. The final architecture is: tree-sitter for baseline extraction, SCIP/LSIF for compiler-backed ground truth, language heuristics for gaps, all fused through the edge aggregation pipeline. The Rosetta fixtures (UC-068) prove cross-language parity empirically.

**2/24 insight**: The three new external use cases (UC-090 PCI-DSS C#, UC-091 Brain Simulator III C++/C#, UC-092 Unity C#/ShaderLab/HLSL) all push toward **running on codebases the user didn't write**. This is the "report generator" framing (UC-084) — the polyglot analysis must be robust enough to produce useful output on first run against an unfamiliar repo, without any authored annotations.

### 4. "Prove it works" (Falsifiability & Benchmarking)

**Core UCs**: 012, 024, 029, 030, 073, 074, 078, 083

The user demands publication-grade rigor (UC-030) and falsifiable claims (UC-012). Every capability must be demonstrably correct — benchmarks with precision/recall, compiler-backed oracles for ground truth, statistical tests for co-activation significance. Hallucinations and false statements are the gravest concern (UC-083).

**2/24 insight**: The data parity principle (CAP-008) — "Explorer shows exactly what Live Docs encode, nothing more" — is the visualization manifestation of this falsifiability obsession. Directory aggregates must be derived views (client-side arithmetic over graph data), not inferred or invented data.

### 5. "I shouldn't have to think about infrastructure" (Simplicity & Adoption)

**Core UCs**: 004, 026, 027, 031, 043, 057, 058, 066, 080, 082

Repeatedly: do the least work, leverage solved problems (UC-004), eliminate unnecessary complexity (UC-031, UC-066), operate entirely offline (UC-057), be npm-publishable (UC-058), work in a devcontainer (UC-080). The elimination of SQLite/GraphStore (UC-066) — "Live Docs ARE the database" — exemplifies the philosophy.

**2/24 insight**: Retiring the Explorer server is the logical next step in this simplification arc. The server provides no capability the static build lacks, and it introduces an environment assumption (VS Code + `code` CLI on PATH) that fails in containers, CI, and hosted deployments.

### 6. "Let me see what's missing" (Coverage & Health Diagnostics)

**Core UCs**: 018, 019, 020, 021, 033, 036, 059, 081

Broken link detection (UC-018), island/orphan detection (UC-033), symbol coverage (UC-021), tech debt detection (UC-036), pre-commit validation gates (UC-019). These are the "lint" capabilities — they tell you where the map has gaps, disconnections, or untested territory.

**2/24 insight**: The lint pipeline's JSON output should be the data source for the Explorer's health view (currently "Knowledge Sources," proposed rename to "Project Health" or "Documentation Health"). Single source of truth: lint computes diagnostics, everything else reads the report.

### 7. "Share this with people who don't have my setup" (Distribution & Shareability)

**Core UCs**: 037, 046, 052, 060, 072, 084, 088, 090

Static site export (UC-052), shareable URLs (UC-060), ZIP download (UC-072), GitHub Pages hosting (UC-052), prompt file distribution (UC-088), and the PCI-DSS "send a URL to the security team" scenario (UC-090). Distribution is how the map becomes useful beyond the developer who built it.

**2/24 insight**: The static site IS the distribution. Every visualization, every report, every health diagnostic should be consumable from `dist/explorer/index.html` opened in any browser on any machine. The CLI is how you build it; the static site is how you share it.

---

## What the 2/24 Chat Uniquely Contributed

Beyond confirming the census themes, the 2/24 discussion produced six **genuinely new architectural proposals** not previously documented:

### A. Progressive-Disclosure Map View (replacing Circuit Board)

Directories as the primary interactive unit in the treemap. Drill down by clicking. File cards appear only at leaf level. Aggregated inter-directory edges show cross-boundary connectivity. Potentially library-driven (d3-treemap) rather than hand-rolled.

**Status**: Net-new. Requires Layer 2 work item and Layer 3 architecture doc.

### B. Universal Card Component

One card renderer used everywhere: expanded center card in Local Map, compact cards for dependencies/dependents, popover cards in Force Graph and Map View. Each card has: identity header, optional authored markdown region, symbol pills with hover docstrings, evidence indicator, compact toolbar (Map View / Force Graph / Open in Editor / Download).

**Status**: Net-new. The current Local Map card is the seed; it needs the authored content region and the toolbar.

### C. Impact Tracing as Visualization Mode

Single-origin blast-radius visualization showing hop columns radiating outward. Triggered when `From` is set but `To` is empty. Complements FROM/TO pathfinding rather than replacing it.

**Status**: Net-new. Extends CAP-003. Requires acceptance scenario.

### D. Lint → Explorer Pipeline

`live-docs:lint` emits JSON to a cache directory. The static builder reads the JSON and embeds it. The Explorer's health view consumes it. One computation, multiple consumers.

**Status**: Incremental. Lint already exists; JSON serialization and Explorer injection are new.

### E. Server Retirement

The Explorer server provides no capability the static build lacks. "Open in VS Code" should use `vscode://file/...` URIs. Graph refresh should be a static rebuild. The CLI's outputs are the static site's inputs.

**Status**: Decision required. The server works; the question is whether maintaining it is worth the complexity when all use cases are served by the static build.

### F. Directory Aggregates as Derived Views

Computed client-side from the existing graph (aggregating cross-boundary edges, cohesion ratios, symbol counts per directory). No new markdown files, no new archetypes, no 1:1 invariant violation. Satisfies data parity because the underlying facts are all in the graph.

**Status**: Design-compatible with existing architecture. No documentation contradictions.

---

## What the External Use Cases Reveal

UC-090, UC-091, and UC-092 collectively push the product toward a specific persona the census hadn't surfaced before: **the user running Live Documentation on a codebase they didn't write**.

| Use Case             | Language(s)               | Key Demand                                                   | Gap                                                                         |
| -------------------- | ------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| UC-090 PCI-DSS       | C#, JavaScript            | Field-level data tracing; share URL with security team       | No data-field granularity below "public symbol"; no "data flow" edge type   |
| UC-091 Brain Sim III | C++, C#                   | Understand unfamiliar repo from scratch; no authored content | Zero-authored-content UX must still be useful; C++ not yet supported        |
| UC-092 Unity         | C#, ShaderLab, HLSL, YAML | Cross-version divergence; Unity-specific asset serialization | MonoBehaviour/ScriptableObject patterns unknown; ShaderLab/HLSL unsupported |

### Common demand: **Run it cold, get useful output, share the result**

This is the "report generator" identity (UC-084). If the product requires authored Purpose/Notes to be useful, these three use cases fail — nobody writes annotations for a codebase they're trying to understand, and security auditors won't write them for a codebase they're reviewing. The generated graph, symbols, dependencies, and health diagnostics must carry the experience alone.

### What this means for the Explorer:

The card component must degrade gracefully when there's no authored content — just don't render that region. The Map View must show meaningful structure from directory hierarchy and aggregate statistics alone. The Force Graph must reveal topology without any human curation. The health view must tell you "what's untested, what's isolated, what's coupling-heavy" without anyone having written a Purpose sentence.

### What this means for the CLI:

`npm run live-docs:generate` followed by `npm run live-docs:visualize` should produce a complete, shareable, useful static site **on first run** against a fresh codebase clone. No manual annotation step required. The user can always come back and add Purpose/Notes later — but the default experience must be self-sufficient.

---

## Decision Boundaries Identified

The synthesis exposes five decisions that should be made before significant implementation work:

### 1. Server: Keep, Retire, or Deprecate?

The 2/24 analysis showed no architectural justification. The census shows distribution (UC-052, UC-060, UC-090) consistently points toward static. But the server works today and hot-reload is convenient during Explorer UI development.

**Recommendation**: Deprecate. Keep as internal developer convenience. Make `live-docs:visualize` the static builder. Don't invest further in server-only features.

### 2. Impact Tracing: Additive or Replacement?

The census and documentation both require FROM/TO pathfinding (UC-062, CAP-003, SC-LD-008). Today's discussion proposed impact tracing (single-origin fan-out) which is genuinely more useful for the "what breaks if I change this?" question.

**Recommendation**: Additive. `From` only → impact tracing. `From` + `To` → pathfinding. Same UI controls, mode determined by input state.

### 3. Circuit Board: Reimagine or Retire?

The user explicitly described the current Circuit Board as "borderline useless" (UC-087). The progressive-disclosure Map View was proposed as replacement. The Force Graph was vigorously defended (UC-086).

**Recommendation**: Reimagine. The Map View proposal addresses every pain point (DOM explosion, insufficient abstraction, no inter-directory edges) while preserving the spatial/hierarchical cognitive function that the Force Graph doesn't cover.

### 4. Detail Panel: Card-Based or Sidebar?

The current 360px sidebar is pinned, never resizes, and shows a tweet's worth of content for 45% of files (those with zero public symbols). The card-based approach puts detail where the eye already is.

**Recommendation**: Card-based. The center card in Local Map IS the detail. Map View and Force Graph use popover cards. The sidebar disappears.

### 5. Directory Documentation: Markdown or JSON?

The 1:1 invariant (REQ-L1) and the data parity principle (CAP-008) both argue against directory markdown files. The "report generator" framing (UC-084) argues that generated-only aggregates (no authored section) should be JSON, not markdown. But the user also floated the idea of emitting directory docs to a configurable alternate location (e.g., `architecture/`).

**Recommendation**: JSON sidecar for aggregates (computed, cached, gitignored). If authored directory-level Purpose/Notes are desired, they belong in `README.md` files in the directories themselves — not in the Live Doc mirror tree. The system layer (Layer 3) already serves the "aggregate architectural documentation" role.

---

## The Refined Product Identity

Reading all 93 use cases together, with the 2/24 discussion as the lens, a clear product identity emerges:

**Live Documentation is a polyglot codebase cartography tool** that reverses any workspace's source files into a navigable dependency graph expressed in Markdown.

Its three outputs are:

1. **A set of versioned markdown files** (one per tracked artifact) that encode the complete public API surface, dependency edges, and test evidence for every file — augmentable with human-authored annotations.
2. **A static Explorer site** that visualizes the graph as an interactive map (hierarchical drill-down), a force-directed topology (emergent structure), and a focused local view (symbol-level impact analysis).
3. **A CLI suite** that builds, validates, and queries the graph for headless consumption by AI agents, CI pipelines, and developer scripts.

The product's unique position: it occupies the space between a documentation generator (like TypeDoc or Doxygen) and a code intelligence platform (like Sourcegraph or CodeScene). It's lighter than either — no database, no server, no cloud — and its output is plain Markdown + static HTML, auditable and versionable by design.

The throughline (UC-093): **We can and should reverse polyglot code into a common Markdown convention so that we can reason about a workspace in numerous ways with ease.**

---

## What Comes Next

Informed by the census and the 2/24 discussion, the highest-value next steps in rough priority order:

1. **Universal card component** — lifts the entire Explorer UX; prerequisite for Map View and detail panel retirement.
2. **Impact tracing mode** in Local Map — the most-requested missing visualization; directly serves the founding mission.
3. **Lint → JSON → Explorer pipeline** — single source of truth for health diagnostics; enables the "run cold, get useful output" scenario.
4. **Map View** (progressive-disclosure treemap) — replaces the Circuit Board with something useful; enables directory-level aggregate visualization.
5. **Server deprecation** — simplifies architecture; `live-docs:visualize` becomes the static builder.
6. **First-run experience** — `generate` + `visualize` on a fresh repo clone produces a complete, shareable static site with zero authored content. The "report generator" promise.

These six items constitute the product's next phase: **from developer tool to stakeholder deliverable**.
