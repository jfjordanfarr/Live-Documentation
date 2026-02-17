---
description: "Task list for Live Documentation"
---

# Tasks: Live Documentation

**Inputs**: `/specs/001-link-aware-diagnostics/spec.md`, `/specs/001-link-aware-diagnostics/plan.md`, Layer‑1/Layer‑2 MDMD
**Prerequisites**: Safe-commit pipeline operational, analyzer benchmark harnesses green, `.github/instructions/mdmd.layer4*.instructions.md`

**Tests**: Phases declare the independent scenarios that satisfy Live Documentation user stories. Stage-specific regression suites live under `tests/integration/live-docs/` (to be created) and existing benchmark harnesses.

**Organization**: Tasks align with the adoption stages and phases defined in the implementation plan. IDs follow `LD-<Stage><Sequence>` to track progress against FR-LD requirements and WI-LD work items.

## Format: `[ID] [P?] [Phase/Story] Description`

- **[P]**: May proceed in parallel once prerequisites finish
- **Phase/Story**: Stage or user story from the spec (e.g., Stage0, FR-LD1)
- Include exact file paths or commands when modifying code or tooling

## Path Conventions

- VS Code extension client: `packages/extension/`
- Language server: `packages/server/`
- Shared utilities & domain: `packages/shared/`
- Scripts & CLIs: `scripts/`
- Integration tests: `tests/integration/live-docs/`
- Staged Live Docs: `/.live-documentation/<baseLayer>/` (default `source/`, configurable via `liveDocumentation.root`)

## Stage 0 – Observe (Research & Baseline Validation)

**Purpose**: Capture current graph capabilities, confirm analyzer coverage, and design staging defaults before generating Live Docs.

- [x] LD-000 Research Windsurf Codemaps + GitLab Knowledge Graph behaviour, capture expectations in `specs/001-link-aware-diagnostics/research.md`
- [x] LD-001 Audit analyzer outputs for required symbol/dependency metadata, note coverage gaps in `AI-Agent-Workspace/Notes/live-documentation-doc-refactor-plan.md`
- [x] LD-002 [P] Define Live Doc storage defaults (base layer defaults to `source/`) and configuration schema (`packages/shared/src/config/liveDocumentationConfig.ts`, backing interface + JSON schema)
- [x] LD-003 Prototype staged Live Doc folder under `/.live-documentation/<baseLayer>/` (default `source/`) with placeholder files illustrating authored vs generated sections
- [x] LD-004 [P] Capture regeneration latency baseline using existing safe-commit run; log benchmarks in `reports/benchmarks/live-docs/latency.md`
- [x] LD-005 Draft adoption playbook outline in `specs/001-link-aware-diagnostics/quickstart.md` describing Stage 0 review workflow

**Checkpoint**: Configuration shape, staging location, and baseline metrics agreed. No code writes to staged tree yet.

## Phase 1 – Schema & Instruction Harmonisation (FR-LD1, FR-LD11)

**Purpose**: Align instructions, roadmap, and falsifiability requirements so Live Docs have a canonical structure before tooling lands.

- [x] LD-100 Update Layer‑1/Layer‑2 MDMD to reference Live Documentation pillars and REQ-L acceptance criteria
- [x] LD-101 Refresh `.github/instructions/mdmd.layer4*.instructions.md` to mandate authored/generated split, relative links, and slug dialect enforcement
- [x] LD-102 [P] Define Live Doc front matter schema (`archetype`, `sourcePath`, `generatedAt`, provenance fields) in `packages/shared/src/live-docs/schema.ts`
- [x] LD-103 Extend falsifiability checklist (`specs/001-link-aware-diagnostics/checklists/falsifiability.md`) with REQ-F1–REQ-F6 language referencing lint + regeneration proofs
- [x] LD-104 [P] Update Layer‑3 architecture docs to reflect Live Doc graph consumption (`.mdmd/layer-3/**/`)
- [x] LD-105 Draft Live Doc waiver policy in `specs/001-link-aware-diagnostics/checklists/evidence-waivers.md`

**Checkpoint**: Documentation stack consistently references Live Docs; schema + instructions unblock generator work.

## Phase 2 – Generator Foundations (FR-LD1, FR-LD2, FR-LD3)

**Purpose**: Build deterministic regeneration tooling that preserves authored content and stages generated sections with provenance metadata.

- [x] LD-200 Scaffold `npm run live-docs:generate` (entry under `scripts/live-docs/generate.ts`) reading config, walking tracked artifacts, and writing staged markdown
- [x] LD-201 Implement authored-block preservation and generated-block markers (`<!-- LIVE-DOC:BEGIN <section> -->`) with safety checks for missing markers
- [x] LD-202 [P] Emit core generated sections (Public Symbols, Dependencies) using existing analyzers; wire adapters in `packages/server/src/features/live-docs/generator.ts`
- [x] LD-203 [P] Record provenance metadata (analyzer id, hashes, benchmark versions) within generated blocks; add snapshot tests in `packages/shared/src/live-docs/generator.test.ts`
- [x] LD-204 [P] Stage output into `/.live-documentation/<baseLayer>/` (default `source/`); respect configurable root via workspace settings and CLI flag
- [x] LD-205 Add diff/dry-run mode so `npm run live-docs:generate -- --dry-run` surfaces changes without writing
- [x] LD-206 Create integration suite skeleton `tests/integration/live-docs/generation.test.ts` covering authored preservation and deterministic output
- [x] LD-207 Establish language analyzer adapters for non-TypeScript fixtures so the generator emits `Public Symbols` and `Dependencies` for Python, C#, Java, Ruby, Rust, and C files using repository-hosted benchmark oracles (scope limited to fixtures tracked in this repo). _(Completed via rubyAdapter + cAdapter docstring suites and regenerated fixtures on 2025-11-14.)_
- [ ] LD-208 [P] Add integration coverage that runs `live-docs:generate` against the polyglot fixture workspaces and snapshots markdown output under `tests/integration/live-docs/polyglot-fixtures.test.ts`, ensuring regenerated docs stay deterministic before we target external repositories.

**Checkpoint**: Generator CLI produces deterministic staged Live Docs with provenance markers and dry-run diffing.

## Phase 3 – Evidence & Coverage Bridges (FR-LD2, FR-LD4)

**Purpose**: Populate evidence sections, enforce lint gates, and keep benchmarks in sync with generated markdown.

- [x] LD-300 Integrate coverage ingestion pipeline (`packages/server/src/features/live-docs/evidenceBridge.ts`) sourcing Vitest, pytest, dotnet, etc.
- [x] LD-301 [P] Surface `Observed Evidence`, `Targets`, `Supporting Fixtures` sections using coverage data; update generator templates accordingly
- [x] LD-302 Extend safe-commit to invoke Live Doc lint (`scripts/live-docs/lint.ts`) checking structure, evidence presence, and relative links
- [x] LD-303 [P] Update SlopCop rules to include staged Live Doc tree (`slopcop.config.json` adjustments + CLI docs)
- [x] LD-304 Author regression tests `tests/integration/live-docs/evidence.test.ts` verifying empty evidence triggers `_No automated evidence found_` and lint warnings
- [x] LD-305 Capture benchmark parity reports comparing analyzer outputs vs generated markdown (`reports/benchmarks/live-docs/precision.json`)

**Checkpoint**: Evidence sections flow end-to-end, lint gates enforce structure, and benchmarks quantify parity.

## Phase 4 – Consumption Surfaces & CLI Parity (FR-LD5, SC-LD4)

**Purpose**: Ensure diagnostics, CLI tooling, and Copilot prompts read from staged Live Docs while retaining legacy fallback during migration.

- [x] LD-402 Ship CLI `scripts/live-docs/inspect.ts` that resolves outbound or inbound dependency chains between `--from`/`--to` artefacts, surfaces terminal roots (fan-out) when only a starting point is supplied, and captures both success and not-found payloads via `tests/integration/live-docs/inspect-cli.test.ts`
- [ ] LD-406 Consolidate `npm run live-docs:visualize` into a single explorer view that shares data models across circuit-board, local, and force-directed modes while preserving Antigravity deep links.
- [ ] LD-407 Implement focus-mode filtering, persisted selection, and Live Doc detail panels (metadata, open-in-editor) so global and local exploration stay in sync, ensuring the rendered edges, symbol anchors, and directional styling stay in parity with the `live-docs inspect` payloads (UI must never invent or omit graph facts).
- [ ] LD-408 Add accessibility + telemetry harnesses (axe-core audit, keyboard navigation tests, selection event logging) and stage Playwright smoke tests that exercise Antigravity and VS Code entry points.
- [x] LD-409 Implement Local Map `From`/`To` pathfinding (non-headless `live-docs inspect`): auto-run (debounced) when both endpoints are valid, render the multi-hop chain (or deterministic “no connection”), and preserve parity with CLI hop semantics.
- [ ] LD-404 Implement regeneration watcher so safe-commit or file save triggers targeted updates without full repo sweep
- [ ] LD-405 Document legacy-parity strategy in `specs/001-link-aware-diagnostics/quickstart.md` and Layer‑3 docs, including rollback toggles

**Checkpoint**: All consumption surfaces operate on Live Docs with documented parity against legacy graph outputs.

## Phase 5 – Docstring Drift & Optional Authoring (Deferred / Wishlist) (FR-LD6, REQ-G1)

**Purpose**: Generate docstring bridge metadata and surface drift diagnostics. Any docs → code write-back (round-trip) remains explicitly deferred and must be treated as opt-in and auditable if/when implemented.

- [ ] LD-500 Emit docstring bridge config from generator (`scripts/live-docs/generate.ts` + `packages/shared/src/live-docs/docstringBridge.ts`)
- [ ] LD-501 Implement server-side bridge ingestion (`packages/server/src/features/live-docs/docstringService.ts`) tracking drift state
- [ ] LD-502 Publish drift diagnostics + CLI sync command (`packages/extension/src/commands/syncDocstrings.ts`, `scripts/live-docs/sync-docstrings.ts`)
- [ ] LD-503 [P] Add integration test `tests/integration/live-docs/docstring-drift.test.ts` covering positive/negative cases
- [ ] LD-504 Update falsifiability and waiver docs to include docstring drift escalation paths
- [ ] LD-505 Wire workspace feature flags safeguarding any future write-back (`liveDocumentation.enableAuthoring`, configuration plumbing across extension + server)
- [ ] LD-506 Capture audit telemetry for markdown → docstring updates (if/when implemented) (server telemetry sink + reports under `reports/benchmarks/live-docs/roundtrip.json`)
- [ ] LD-507 Build preview/apply UX (if/when implemented) (`packages/extension/src/commands/liveDocsAuthoring.ts`, `scripts/live-docs/sync-docstrings.ts --preview`) that records diff summaries before writes
- [ ] LD-508 Expand polyglot fixtures with multi-paragraph, HTML-rich docstrings (Java basic fixture, Python requests slice) and update `tests/integration/live-docs/polyglot-fixtures.test.ts`
- [ ] LD-509 Prototype generative scaffolding CLI (`scripts/live-docs/scaffold.ts`) emitting scratch drafts under `AI-Agent-Workspace/tmp/live-docs/scaffolds/` with Live Documentation provenance

**Checkpoint**: Docstring drift shows up in diagnostics/CLI, with waivers documented and tests capturing remediation flow.

## Phase 6 – Migration & Promotion (FR-LD7, FR-LD10)

**Purpose**: Promote staged Live Docs into canonical Layer‑4 docs, update configuration, and document rollback.

- [ ] LD-600 Build migration CLI (`scripts/live-docs/migrate.ts`) comparing staged tree to `.mdmd/layer-4/`
- [ ] LD-601 [P] Update Layer‑4 MDMD files to import generated blocks or point to Live Doc mirror once parity validated
- [ ] LD-602 Document migration procedure + rollback in `specs/001-link-aware-diagnostics/quickstart.md` and Layer‑1 adoption notes
- [ ] LD-603 Wire migration gate into safe-commit (block when parity reports fail)
- [ ] LD-604 Capture case-study log in `AI-Agent-Workspace/Notes/live-documentation-migration-journal.md`

**Checkpoint**: Live Docs become canonical for opted-in repos; migration + rollback process reproducible.

## Phase 7 – Metadata Enrichers & Future Layers (FR-LD8, FR-LD9)

**Purpose**: Add optional enrichers, telemetry, and Layer‑2/Layer‑3 derivations.

- [ ] LD-700 Add co-activation analytics enricher sourced from deterministic Stage-0 signals (`packages/shared/src/live-docs/enrichers/coActivationEnricher.ts`, `referenceEnricher.ts`)
- [ ] LD-701 Extend telemetry to record regeneration latency, waiver counts, evidence coverage (updates in `packages/shared/src/telemetry/liveDocsTelemetry.ts`)
- [ ] LD-702 [P] ~~Implement low-confidence edge tagging for external feeds + LLM augmentations with promotion workflow~~ _(Descoped 2026-02-17: LLM integration removed. External feed tagging can proceed independently if needed.)_
- [ ] LD-703 Generate Layer‑2/Layer‑3 summaries from Live Docs (`scripts/live-docs/derive-roadmap.ts` producing `.mdmd/layer-2/` updates)
- [ ] LD-704 Add audit dashboard export CLI (`scripts/live-docs/report.ts`) summarising SC-LD metrics
- [ ] LD-705 Define deterministic derivation rules for System Layer archetypes using Layer‑4 graph data; document expected outputs in `AI-Agent-Workspace/Notes/live-documentation-doc-refactor-plan.md` (see System Layer Signal Catalog) with legacy `.mdmd/layer-3/**` docs serving only as validation references
- [ ] LD-706 Stand up System Layer mirror under `/.live-documentation/system/` with seeded docs preserving authored `Purpose`/`Notes`
- [ ] LD-707 Extend generator to populate System Layer `Components` lists and Mermaid `Topology` diagrams (with `click` links) from Layer‑4 dependency data
- [ ] LD-708 Wire live-docs:lint/SlopCop rules enforcing System Layer structure (required generated sections, no direct Layer‑4 links outside `Components`)
- [ ] LD-709 Validate System Layer renders across VS Code preview, CLI `live-docs inspect`, and markdown export, then schedule MDMD Layer‑3 retirement window
- [ ] LD-710 Parse workflow orchestrators (e.g., `scripts/live-docs/run-all.ts`) to extract stage ordering when dependencies are expressed via string literals rather than imports
- [ ] LD-711 Hook System Layer derivation into coverage manifests (`coverage/live-docs/targets.json`) once emitted so testing archetypes reflect bidirectional coverage data
- [x] LD-712 Refactor `packages/server/src/features/live-docs/generator.ts` to extract shared core utilities (target discovery, analysis, merge/write pipeline) into a reusable module under `packages/shared/src/live-docs`. _(Shared helpers now live in `packages/shared/src/live-docs/core.ts` and the server generator consumes them.)_
- [ ] LD-713 Create layer-specific generator entrypoints (`generator.layer4.ts`, `generator.system.ts`) that compose the shared core with layer rules while keeping existing CLI integrations functional
- [ ] LD-714 Filter build artefacts (e.g., compiled `.js` siblings) out of System Layer `Components` while preserving canonical TypeScript sources.
- [ ] LD-715 Merge duplicate System Layer interaction/workflow docs when they describe the same orchestrator; ensure topology reflects single-source ordering.
- [ ] LD-716 Enrich System Layer topology with orchestrator stage edges emitted from LD-710 so CLI interaction docs show meaningful flow instead of isolated nodes.
- [ ] LD-717 Prune and aggregate testing archetype topology to highlight Live Docs suites while avoiding unreadable graphs (e.g., collapse extension diagnostics tests).
- [x] LD-718 Ship `npm run live-docs:system` CLI that emits System analytics as on-demand materialized views (stdout or caller-provided temp directory) with markdown/JSON format options. _(Completed 2026-01-17: CLI ships with `--output`, `--clean`, `--dry-run`, and `--config` options. System views are now ephemeral-only by default.)_
- [x] LD-719 Remove the committed `.live-documentation/system/` mirror once the CLI is validated, updating lint/safe-commit rules to block future check-ins of materialized views. _(Completed 2026-01-17: System layer is now ephemeral-only; committed mirrors no longer exist.)_
- [ ] LD-720 Author integration tests and fixture workspaces that exercise the System analytics CLI against known technical debt so failures surface without persisting docs.

**Checkpoint**: Live Docs feed richer telemetry and derived docs without sacrificing determinism.

## Stage 8 – Layer Distribution & External Surfaces

**Purpose**: Place each MDMD layer with the platform best suited for it and wire the GitHub Pages projection into our CI/CD gates before the hosted showcase spins up.

- [ ] LD-800 Scaffolding task: generate a GitHub Pages (or equivalent) site sourced from Layer‑1 vision content, including build script, publish workflow, and `npm run safe:commit` verification hooks so CI/CD catches drift before Stage 9.
- [ ] LD-801 Define integration pattern for Layer‑2 commitments via Spec-Kit and external issue trackers, adding cross-links from Live Docs to canonical work items.
- [ ] LD-802 Update onboarding/quickstart docs to explain the layered artifact distribution and reference the System analytics CLI as the source of materialized views.

### Static Explorer Distribution (LD-810–LD-819)

**Purpose**: Enable zero-server distribution of the Live Documentation Explorer via JSON bundles, GitHub Pages embedding, and standalone HTML viewers.

- [x] LD-810 Implement `StaticExplorerData` builder in `packages/scripts/src/live-docs/explorer/server/staticBuilder.ts` that wraps `ExplorerGraphPayload` with provenance metadata and symbol index (schema defined in `explorer/shared/staticExplorerData.ts`).
- [x] LD-811 [P] Add `--static` flag to `npm run live-docs:visualize` that emits `explorer-data.json` + `index.html` to a configurable output directory instead of starting the HTTP server.
- [x] LD-812 [P] Create standalone HTML viewer (`explorer/static/index.html`) that loads from inline `<script id="explorer-data">`, relative `explorer-data.json`, or configurable remote URL, detecting mode automatically.
- [x] LD-813 Update viewer client (`explorer/client/index.ts`) to accept graph data from static JSON in addition to server fetch, preserving all existing functionality (Circuit Board, Local Map, Force Graph).
- [x] LD-814 Add provenance display panel in viewer footer showing `generatedAt`, `commitHash`, and `generatorVersion` from static bundle.
- [ ] LD-815 [P] Implement client-side symbol search using `symbolIndex` from static bundle, enabling fuzzy search without server roundtrips.
- [ ] LD-816 Add integration test `tests/integration/live-docs/static-explorer.test.ts` validating JSON schema compliance, viewer loading modes, and symbol search accuracy.
- [ ] LD-817 Document static distribution workflow in `specs/001-link-aware-diagnostics/quickstart.md` covering GitHub Pages embedding, Teams Card integration, and offline usage.
- [ ] LD-818 Wire static bundle generation into the Hosted Showcase pipeline (LD-902) so downloaded bundles include explorable visualization.
- [ ] LD-819 [P] Add optional treemap layout pre-computation for large workspaces (>1000 nodes) to avoid client-side d3 performance issues.

**Checkpoint**: Documentation layers are mapped to their long-term homes, the GitHub Pages build runs inside CI/CD, and Live Docs tooling references them accordingly.

## Stage 9 – Hosted Showcase Trials (CAP-007, REQ-H1)

**Purpose**: Give prospects a zero-install path by cloning public GitHub repos inside a stateless Cloudflare (or equivalent) runner, generating Live Docs headlessly, and returning a downloadable bundle with guidance for replaying the analysis locally.

- [ ] LD-900 Capture Code Wiki competitive deltas plus hosted-showcase requirements in `specs/001-link-aware-diagnostics/research.md`, `plan.md`, and `.mdmd/layer-1/link-aware-diagnostics-vision.mdmd.md`, ensuring governance docs record consent/privacy expectations.
- [ ] LD-901 [P] Containerise the Live Docs generator + dependencies for Cloudflare Workers/Pages (or equivalent), wire a request handler (`scripts/live-docs/showcaseWorker.ts`) that accepts `org/repo@ref`, clones to ephemeral storage, runs `npm run live-docs:generate`, and deletes the workspace immediately after bundling.
- [ ] LD-902 Build the bundler + README/prompt guide generator (`scripts/live-docs/packageBundle.ts`), embed provenance metadata (commit hash, analyzer versions, benchmark IDs), and add telemetry showing when bundles are downloaded and when artefacts are purged.

**Checkpoint**: Hosted showcase produces reproducible bundles, emits provenance + deletion telemetry, and stays stateless so prospects can evaluate Live Docs without installing the extension.

## Stage Dependencies & Parallelism

- **Stage0 → Phase1**: Complete research + configuration decisions before finalising schema.
- **Phase1 → Phase2**: Generator work blocks on schema + instructions.
- **Phase2 → Phase3**: Evidence pipeline relies on generator scaffolding.
- **Phase3 → Phase4**: Consumption surfaces switch once evidence + lint gates active.
- **Phase4 → Phase5**: Docstring drift requires Live Docs as source of truth.
- **Phase5 → Phase6**: Migration waits for drift tools to avoid regressions.
- **Phase6 → Phase7**: Enrichers build on canonical Live Docs.
- **Stage8 → Stage9**: Hosted showcase depends on the Layer distribution pipeline so the stateless runner can reuse proven generator assets and publishing guides.
- ~~**Phase7 → Stage10**: LLM enrichment depends on canonical Live Docs and System analytics infrastructure.~~ _(Descoped 2026-02-17: LLM integration removed.)_
- **Phase7 → Stage11**: Brownfield integration can proceed independently once canonical Live Docs and System analytics are in place.

Tasks tagged `[P]` can run concurrently when dependencies agree (e.g., LD-202/203, LD-302/303). Evidence and consumption phases split across teams by surface (CLI vs diagnostics) once generator stabilises.

## Stage 10 – ~~LLM Enrichment (Extractive & Generative)~~ _(Descoped 2026-02-17)_

> **Descoped**: LLM integration has been removed from the project scope. All LLM modules were dormant/speculative with zero production callers. Users bring their own AI assistants and consume Live Docs as structured context. This eliminates trust, safety, cost, and hallucination-propagation concerns from the tool itself.

~~**Purpose**: Deliver explicit, user-invoked LLM capabilities that discover missed relationships (extractive) and synthesize human-readable prose from statistical artifacts (generative), with budget controls, diff previews, and audit trails.~~

- [x] ~~LD-1000~~ Descoped
- [x] ~~LD-1001~~ Descoped
- [x] ~~LD-1002~~ Descoped
- [x] ~~LD-1003~~ Descoped
- [x] ~~LD-1004~~ Descoped
- [x] ~~LD-1005~~ Descoped
- [x] ~~LD-1006~~ Descoped
- [x] ~~LD-1007~~ Descoped
- [x] ~~LD-1008~~ Descoped
- [x] ~~LD-1009~~ Descoped

~~**Checkpoint**: LLM enrichment commands ship with budget controls, diff previews, and audit trails; no background LLM calls occur without explicit user invocation.~~

## Stage 11 – Brownfield Documentation Integration

**Purpose**: Enable Live Documentation to coexist with pre-existing markdown documentation in brownfield workspaces through a "bridge, don't replace" strategy that respects legacy context without overwriting or tracking it.

- [ ] LD-1100 Validate that `live-docs:generate` leaves brownfield markdown byte-for-byte unchanged via integration test `tests/integration/live-docs/brownfield-respect.test.ts`
- [x] LD-1101 Extend graph builder to discover link-connected brownfield docs and include them as read-only nodes with distinct metadata (isGenerated: false, isBrownfield: true) _(Completed 2026-01-08: bundledMarkdownScanner discovers link-connected docs via single-hop markdown link extraction; 452 links found, 60 files bundled.)_
- [x] LD-1102 [P] Render brownfield docs in Force Graph with distinct styling (dashed borders, muted palette) signalling their non-generated status _(Completed 2026-01-08: purple color #9966cc, smaller size 5, thinner edges width 1.)_
- [x] LD-1103 Implement single "Show Related Documentation" checkbox in Force Graph controlling visibility of all link-connected markdown (System-layer docs, brownfield docs, chat history) _(Completed 2026-01-08: checkbox with localStorage persistence, Force Graph-only visibility via `.force-graph-only` CSS class.)_
- [ ] LD-1104 [P] Document layer mapping: brownfield docs conceptually map to Layers 1–3 and never to Layer 4
- [ ] LD-1105 Implement optional semantic indexing for brownfield markdown (title, headings, first paragraph) so search surfaces legacy context without mutating files
- [ ] LD-1106 Add integration tests `tests/integration/live-docs/brownfield-discovery.test.ts` covering link-driven discovery, Force Graph rendering, and search indexing
- [ ] LD-1107 Document brownfield integration workflow in `specs/001-link-aware-diagnostics/quickstart.md` and update Layer‑1/Layer‑2 docs

**Checkpoint**: Brownfield documentation coexists peacefully with Live Docs; existing markdown is never overwritten and appears in the Force Graph when link-connected.

## Implementation Traceability

- Generator + bridges live under `packages/server/src/features/live-docs/` and `packages/shared/src/live-docs/`
- CLI tooling resides in `scripts/live-docs/`
- Integration suites materialise under `tests/integration/live-docs/`
- Documentation updates land across `specs/001-link-aware-diagnostics/**` and `.mdmd/layer-*/`

## Summary Metrics

**Summary Metrics**

- **Total Tasks**: 102 (18 closed, 84 open)
- **By Phase**: Stage0 (0 open), Phase1 (0 open), Phase2 (7 open), Phase3 (0 open), Phase4 (9 open), Phase5 (10 open), Phase6 (5 open), Phase7 (18 open), Stage8 (13 open), Stage9 (3 open), Stage10 (10 open), Stage11 (5 open)
- **Independent Tests**: `generation.test.ts`, `evidence.test.ts`, `inspect-cli.test.ts`, `docstring-drift.test.ts`, `static-explorer.test.ts`, ~~`llm-enrichment.test.ts`~~ _(descoped)_, `brownfield-respect.test.ts`, `brownfield-discovery.test.ts`
- **Primary Workstreams**: Generator foundations (WI-LD101), Evidence bridges (WI-LD102), Docstring drift (WI-LD201), Consumption parity (WI-LD301), System Layer migration (WI-LD401), Static Explorer distribution (WI-LD801), ~~LLM Enrichment (WI-LD1001)~~ _(descoped)_, Brownfield Integration (WI-LD1101)
