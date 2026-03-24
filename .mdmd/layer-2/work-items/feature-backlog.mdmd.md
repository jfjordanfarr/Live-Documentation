# Feature Backlog: Live Documentation

## Metadata

- Layer: 2
- External Tracker: Spec-Kit (historical)
- Provenance: Migrated from `specs/001-link-aware-diagnostics/tasks.md` on 2026-02-23

## Purpose

Track the granular work breakdown for Live Documentation development, organised by adoption phase. Task IDs follow `LD-<Stage><Sequence>` to trace progress against the [Feature Specification](../feature-specification.mdmd.md) FR-LD requirements and WI-LD work items.

## Notes

- Tasks tagged `[P]` can run concurrently when dependencies agree.
- Completed items retained for audit trail; descoped items collapsed to one-liners.
- This document was originally `specs/001-link-aware-diagnostics/tasks.md`.

## Path Conventions

- VS Code extension client: `packages/extension/`
- Language server: `packages/server/`
- Shared utilities & domain: `packages/shared/`
- Scripts & CLIs: `scripts/`
- Integration tests: `tests/integration/live-docs/`
- Staged Live Docs: `/.live-documentation/<baseLayer>/` (default `source/`)

---

## Stage 0 – Observe _(Complete)_

- [x] LD-000 Research Windsurf Codemaps + GitLab Knowledge Graph, capture in [Architectural Decisions](../../layer-3/architectural-decisions.mdmd.md)
- [x] LD-001 Audit analyzer outputs for required symbol/dependency metadata
- [x] LD-002 [P] Define Live Doc storage defaults and configuration schema
- [x] LD-003 Prototype staged Live Doc folder with placeholder files
- [x] LD-004 [P] Capture regeneration latency baseline
- [x] LD-005 Draft adoption playbook outline

## Phase 1 – Schema & Instruction Harmonisation _(Complete)_

- [x] LD-100 Update Layer-1/Layer-2 MDMD to reference Live Documentation pillars
- [x] LD-101 Refresh `.github/instructions/mdmd.layer4*.instructions.md`
- [x] LD-102 [P] Define Live Doc front matter schema in `packages/shared/src/live-docs/schema.ts`
- [x] LD-103 Extend falsifiability checklist with REQ-F1–REQ-F6
- [x] LD-104 [P] Update Layer-3 architecture docs
- [x] LD-105 Draft Live Doc waiver policy

## Phase 2 – Generator Foundations _(In Progress)_

- [x] LD-200 Scaffold `npm run live-docs:generate`
- [x] LD-201 Implement authored-block preservation and generated-block markers
- [x] LD-202 [P] Emit core generated sections (Public Symbols, Dependencies)
- [x] LD-203 [P] Record provenance metadata within generated blocks
- [x] LD-204 [P] Stage output into `/.live-documentation/<baseLayer>/`
- [x] LD-205 Add diff/dry-run mode
- [x] LD-206 Create integration suite skeleton `tests/integration/live-docs/generation.test.ts`
- [x] LD-207 Establish language analyzer adapters for non-TypeScript fixtures
- [ ] LD-208 [P] Add integration coverage running `live-docs:generate` against polyglot fixtures

## Phase 3 – Evidence & Coverage Bridges _(Complete)_

- [x] LD-300 Integrate coverage ingestion pipeline
- [x] LD-301 [P] Surface `Observed Evidence`, `Targets`, `Supporting Fixtures` sections
- [x] LD-302 Extend safe-commit to invoke Live Doc lint
- [x] LD-303 [P] Update SlopCop rules to include staged Live Doc tree
- [x] LD-304 Author regression tests for evidence
- [x] LD-305 Capture benchmark parity reports

## Phase 4 – Consumption Surfaces & CLI Parity

- [x] LD-402 Ship CLI `scripts/live-docs/inspect.ts`
- [ ] LD-404 Implement regeneration watcher (targeted updates on file save)
- [ ] LD-405 Document legacy-parity strategy and rollback toggles
- [ ] LD-406 Consolidate `npm run live-docs:visualize` into single explorer view _(prerequisite for Membrane Map; see Stage 12)_
- [ ] LD-407 Implement focus-mode filtering with Live Doc detail panels
- [ ] LD-408 Add accessibility + telemetry harnesses (axe-core, keyboard, Playwright)
- [x] LD-409 Implement Local Map `From`/`To` pathfinding

### Phase 4b – Multi-Path Pathfinding (Stream LV1-F)

> **Note (2026-03-22)**: Phase 4b rendering tasks (LD-412, LD-414, LD-416) may be reimplemented on the [Membrane Map](../../layer-3/membrane-map.mdmd.md) spatial substrate rather than the current Local Map column layout. Algorithm-level tasks (LD-410, LD-411, LD-413, LD-415) are substrate-independent and apply regardless.

- [ ] LD-410 Replace single-parent BFS with multi-parent BFS in CLI `pathfind.ts` and Explorer `pathfind.ts`
- [ ] LD-411 Implement all-shortest-paths DAG reconstruction from multi-parent map
- [ ] LD-412 [P] Render merged DAG in Local Map path mode (stacked cards in hop columns)
- [ ] LD-413 Extend BFS to collect near-miss (+1) paths; add toolbar toggle (default off)
- [ ] LD-414 [P] Add dimmed/dashed CSS styling for near-miss cards and connection lines
- [ ] LD-415 Port symbol-aware BFS (`pathfind-symbol.ts`) to Explorer client
- [ ] LD-416 [P] Render symbol-divergent paths as color-coded multi-line connections through shared cards
- [ ] LD-417 Add performance guardrails (path caps, chain caps) for multi-path rendering
- [ ] LD-418 Update `tracing-impact.mdmd.md` and Explorer guides with multi-path documentation

## Phase 5 – Docstring Drift & Optional Authoring _(Deferred / Wishlist)_

- [ ] LD-500 Emit docstring bridge config from generator
- [ ] LD-501 Implement server-side bridge ingestion tracking drift state
- [ ] LD-502 Publish drift diagnostics + CLI sync command
- [ ] LD-503 [P] Add integration test for docstring drift
- [ ] LD-504 Update falsifiability and waiver docs for drift escalation
- [ ] LD-505 Wire workspace feature flags safeguarding future write-back
- [ ] LD-506 Capture audit telemetry for markdown → docstring updates (if/when)
- [ ] LD-507 Build preview/apply UX (if/when)
- [ ] LD-508 Expand polyglot fixtures with multi-paragraph docstrings
- [ ] LD-509 Prototype generative scaffolding CLI

## Phase 6 – Migration & Promotion

- [ ] LD-600 Build migration CLI comparing staged tree to `.mdmd/layer-4/`
- [ ] LD-601 [P] Update Layer-4 MDMD files to import generated blocks
- [ ] LD-602 Document migration procedure + rollback
- [ ] LD-603 Wire migration gate into safe-commit
- [ ] LD-604 Capture case-study log

## Phase 7 – Metadata Enrichers & Future Layers

- [ ] LD-700 Add co-activation analytics enricher
- [ ] LD-701 Extend telemetry (regeneration latency, waiver counts, coverage)
- [ ] LD-703 Generate Layer-2/Layer-3 summaries from Live Docs
- [ ] LD-704 Add audit dashboard export CLI
- [ ] LD-705 Define deterministic derivation rules for System Layer archetypes
- [ ] LD-706 Stand up System Layer mirror with seeded docs
- [ ] LD-707 Extend generator to populate System Layer `Components` lists and Mermaid diagrams
- [ ] LD-708 Wire live-docs:lint/SlopCop rules for System Layer structure
- [ ] LD-709 Validate System Layer renders across all surfaces
- [ ] LD-710 Parse workflow orchestrators for stage ordering
- [ ] LD-711 Hook System Layer derivation into coverage manifests
- [x] LD-712 Refactor generator to extract shared core utilities into `packages/shared/src/live-docs`
- [ ] LD-713 Create layer-specific generator entrypoints
- [ ] LD-714 Filter build artefacts out of System Layer `Components`
- [ ] LD-715 Merge duplicate System Layer interaction/workflow docs
- [ ] LD-716 Enrich System Layer topology with orchestrator stage edges
- [ ] LD-717 Prune and aggregate testing archetype topology
- [x] LD-718 Ship `npm run live-docs:system` CLI
- [x] LD-719 Remove committed `.live-documentation/system/` mirror
- [ ] LD-720 Author integration tests for System analytics CLI

## Stage 8 – Layer Distribution & External Surfaces

- [ ] LD-800 Generate a GitHub Pages site from Layer-1 content
- [ ] LD-801 Define integration pattern for Layer-2 via Spec-Kit/issue trackers
- [ ] LD-802 Update onboarding docs explaining layered artifact distribution

### Static Explorer Distribution (LD-810–LD-819)

- [x] LD-810 Implement `StaticExplorerData` builder
- [x] LD-811 [P] Add `--static` flag to `npm run live-docs:visualize`
- [x] LD-812 [P] Create standalone HTML viewer
- [x] LD-813 Update viewer client to accept static JSON
- [x] LD-814 Add provenance display panel
- [ ] LD-815 [P] Implement client-side symbol search from static bundle
- [ ] LD-816 Add integration test for static explorer
- [ ] LD-817 Document static distribution workflow
- [ ] LD-818 Wire static bundle into Hosted Showcase pipeline
- [ ] LD-819 [P] Add optional treemap layout pre-computation for large workspaces

## Stage 9 – Hosted Showcase Trials

- [ ] LD-900 Capture hosted-showcase requirements in research and vision docs
- [ ] LD-901 [P] Containerise generator for Cloudflare Workers/Pages
- [ ] LD-902 Build the bundler + README/prompt guide generator

## ~~Stage 10 – LLM Enrichment~~ _(Descoped 2026-02-17)_

All LLM modules were dormant with zero production callers. Users bring their own AI assistants.

## Stage 11 – Brownfield Documentation Integration

- [ ] LD-1100 Validate `live-docs:generate` leaves brownfield markdown unchanged
- [x] LD-1101 Extend graph builder to discover link-connected brownfield docs
- [x] LD-1102 [P] Render brownfield docs in Force Graph with distinct styling
- [x] LD-1103 Implement "Show Related Documentation" checkbox
- [ ] LD-1104 [P] Document layer mapping for brownfield docs
- [ ] LD-1105 Implement optional semantic indexing for brownfield markdown
- [ ] LD-1106 Add integration tests for brownfield discovery
- [ ] LD-1107 Document brownfield integration workflow

## Stage 12 – Membrane Map (View Unification)

The [Membrane Map](../../layer-3/membrane-map.mdmd.md) unifies Circuit Board and Local Map into a single zoomable treemap where directories render as nested membranes and dependency connections pierce membrane boundaries. Both current views remain functional until the Membrane Map achieves feature parity and stability. Implementation began Dev Day 80 (2026-03-23); the continuous pin spectrum replaces discrete Browse/Explore/Compare/Path modes.

- [x] LD-1200 Implement membrane layout engine (directory-as-membrane nesting, squarified treemap for interior, focus-aware weight boosting)
- [x] LD-1201 Implement Browse mode (directory aggregates, focus-path drill-down, two-phase sizing model)
- [ ] LD-1202 Implement continuous pin model (pin-state, focal overlay, routing, SVG connections — card LTR rearrangement outstanding)
- [ ] LD-1203 Implement barrel-as-membrane-boundary rendering for TS/JS, Python, Rust
- [x] LD-1204 Implement edge bundling for dense cross-membrane connections (implemented but disabled — re-enable with hover/progressive-disclosure)
- [x] ~~LD-1205 Implement Compare mode~~ (subsumed: Compare emerges naturally from multi-node pinning in the continuous pin spectrum)
- [x] ~~LD-1206 Implement Path mode on membrane substrate~~ (subsumed: Path is a pin population strategy, not a rendering mode — BFS produces ordered pins with hop-index metadata)
- [ ] LD-1207 Add C# namespace mode (alternative hierarchy function grouping by namespace) — deferred to Commit 2
- [ ] LD-1208 Enhance C# adapter with nested public type extraction (brace-depth tracking)
- [ ] LD-1209 Replace `innerHTML` teardown/rebuild with persistent DOM elements for membrane containers
- [x] LD-1210 Add zoom/pan with spatial context (focus-aware layout + pan-zoom controller; ancestor membranes as thin borders)
- [ ] LD-1211 Integration tests for Membrane Map (Playwright E2E — blocked on visual design stabilisation)
- [ ] LD-1212 [P] Phase out Circuit Board and Local Map views after stability period (blocked on card LTR rearrangement)
- [ ] LD-1213 Update all Layer-1 guides for two-view taxonomy (Membrane Map + Force Graph)
- [ ] LD-1214 Card LTR rearrangement for dependency flow (cards must rearrange horizontally when pins active to respect L→R design language)
- [ ] LD-1215 WCAG AA compliance planning (RTL support, screen reader compatibility, vanilla HTML/CSS layout)
- [x] LD-1216 lz-string URL state compression (`compressed-url-state.ts` — versioned payloads, comprehensive state coverage)

---

## Stage Dependencies

- **Stage 0 → Phase 1**: Research + config decisions before schema.
- **Phase 1 → Phase 2**: Generator blocks on schema + instructions.
- **Phase 2 → Phase 3**: Evidence pipeline relies on generator.
- **Phase 3 → Phase 4**: Consumption surfaces switch once evidence + lint gates active.
- **Phase 4 → Phase 5**: Docstring drift requires Live Docs as source of truth.
- **Phase 5 → Phase 6**: Migration waits for drift tools.
- **Phase 6 → Phase 7**: Enrichers build on canonical Live Docs.
- **Stage 8 → Stage 9**: Hosted showcase depends on Layer distribution pipeline.
- **Phase 7 → Stage 11**: Brownfield integration proceeds once canonical Live Docs and System analytics are in place.
- **Phase 4 + Stage 11 → Stage 12**: Membrane Map builds on existing Explorer infrastructure and may subsume Phase 4b rendering tasks.

## Summary Metrics

- **Completed Tasks**: Stages 0–1 (all), Phase 2 (7/8), Phase 3 (all), scattered across later phases
- **Active Phases**: Phase 2 (LD-208), Phase 4, Phase 5, Phase 6, Phase 7, Stages 8–9, 11
- **Descoped**: Stage 10 (LLM Enrichment)
