# Implementation Plan: Live Documentation

**Branch**: `001-live-documentation` | **Date**: 2025-10-16 (pivoted 2025-11-08) | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-link-aware-diagnostics/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a reproducible Live Documentation system where every tracked workspace asset has a paired markdown file containing an authored preamble and generated sections (`Public Symbols`, `Dependencies`, archetype metadata). The VS Code extension watches file saves, runs analyzers to refresh generated sections into a mirror tree under `/.live-documentation/<baseLayer>/` (default `source/`, user configurable), and enforces structure via lint gates embedded in `npm run safe:commit`. Generated blocks are owned by tooling while humans curate small authored notes, keeping the corpus reviewable and diff-friendly. Deterministic benchmarks, coverage feeds, and docstring bridges back the generated data so diagnostics, CLI exports, visualization dashboards, and LLM consumers rely on the same markdown-as-AST graph. The plan stages the migration from existing Layer‑4 MDMD docs to generated Live Documentation, maintains polyglot analyzer fidelity, consolidates the Live Docs visualization command center into an accessible, focus-aware experience, and treats any docs → code authoring loops (docstring write-back, scaffolds) as an opt-in wishlist item rather than a dependency for near-term value.

## Adoption Strategy
- **Stage 0 – Observe**: Generate Live Documentation into `/.live-documentation/<baseLayer>/` (default `source/`) without replacing MDMD; provide read-only viewers and diff tooling so contributors assess fidelity.
- **Stage 1 – Guard**: Enable lint warnings for structural drift, missing evidence, or stale generated sections; enforce workspace-relative link hygiene and configurable slug dialects for wiki publishing.
- **Stage 2 – Bridge**: Activate docstring and coverage bridges, wire diagnostics/CLI exports to Live Documentation, and require explicit acknowledgements or waivers when evidence is absent.
- **Stage 3 – Sustain**: Treat generated Live Documentation as canonical, flip configuration so Layer‑4 MDMD mirrors the staged tree, and block merges unless regeneration and lint gates pass.
- **Stage 4 – Author (wishlist)**: If/when explored, introduce opt-in authoring commands that preview markdown → docstring diffs, capture audit trails, and emit scratch scaffolds without touching tracked files until humans promote them.

## Technical Context

**Language/Version**: TypeScript 5.x targeting Node.js 22 for extension + LSP, SQL schema for SQLite 3  
**Primary Dependencies**: VS Code Extension API, `vscode-languageclient`/`vscode-languageserver`, `better-sqlite3`, existing language analyzers/heuristics, coverage ingestion utilities, optional LLM access via `vscode.lm` (guard-railed)  
**Storage**: Embedded SQLite property graph for analyzer outputs & coverage signals; generated markdown stored under configurable `liveDocumentation.root`  
**Testing**: `vitest` for analyzers/tooling, `@vscode/test-electron` integration suites, benchmark harnesses under `reports/benchmarks`, Live Doc regeneration snapshot tests  
**Target Platform**: VS Code desktop (Windows/macOS/Linux) with optional headless language server for CI regeneration  
**Project Type**: Multi-package workspace (`packages/extension`, `packages/server`, `packages/shared`) plus supporting scripts under `scripts/`  
**Performance Goals**: Regenerate affected Live Docs within a single `safe:commit` run (<30s for 5k-file repo); CLI/diagnostics respond ≤2s using cached markdown graph  
**Constraints**: Operate offline by default, keep generated blocks deterministic, use workspace-relative links, maintain polyglot analyzer precision (≥0.9 symbols, ≥0.8 dependencies), expose CLI parity for every UI affordance  
**Scale/Scope**: Pilot repos up to 1M LOC with polyglot stacks (TS, Python, Rust, Java, Ruby, C, C#) and binary assets referenced via markdown links

## Constitution Check

Constitution v1.0.0 principles remain satisfied. Live Documentation strengthens Documentation-Implementation Unity and Tooling Reuse while operating under Responsible Intelligence (optional LLM enrichment stays opt-in). No waivers required.

## Project Structure

### Documentation (this feature)

```
specs/001-link-aware-diagnostics/
├── plan.md          # This file
├── spec.md          # Updated feature spec
├── quickstart.md    # Adoption guide (to be rewritten for Live Docs)
├── tasks.md         # Detailed work breakdown (updated per FR-LD stories)
├── research.md      # Competitive analysis (Windsurf Codemaps, GitLab Knowledge Graph)
└── checklists/      # Requirements & inference checklists aligned to Live Docs
```

### Source Code (repository root)

```
packages/
├── extension/            # VS Code client: commands, diagnostics, tree views
├── server/               # Language server: analyzers, regeneration orchestrator
└── shared/               # Schema models, benchmarks, tooling utilities

scripts/
├── live-docs/            # CLI entrypoints (generate, diff, migrate)
└── graph-tools/          # Snapshot/audit helpers reused by Live Docs

tests/
├── integration/live-docs # Regeneration, evidence mapping, docstring drift
└── benchmarks/           # Polyglot AST + fallback heuristics coverage
```

**Structure Decision**: Preserve the multi-package setup but introduce dedicated Live Docs tooling under `scripts/live-docs` and integration suites mirroring staged outputs. The staged `/live-documentation/` directory remains untracked until migration gates pass.

## Complexity Tracking

TBD — populate if future scope deviates from Constitution constraints.

## Phases & Key Deliverables

### Phase 0 – Research & Competitive Analysis
- Document Windsurf Codemaps, GitLab Knowledge Graph, and Google Code Wiki capabilities; extract UX expectations (shareable maps, hosted showcases, CLI/agent surfaces) into requirements.
- Audit existing analyzers/benchmarks to confirm they emit symbol + dependency data required for generated sections; note coverage gaps.
- Decide Live Doc storage defaults, configuration shape (`liveDocumentation.root`, slug dialect), and migration toggles.

### Phase 1 – Schema & Instruction Harmonisation
- Finalize Layer‑4 instructions (base + archetype overlays) and align Layer‑1/Layer‑2 docs with LDG pillars.
- Design Live Doc metadata schema (authored sections, generated markers, provenance, Live Doc ID, waiver annotations).
- Update falsifiability requirements (REQ-F1–REQ-F6) to cover structural lint, deterministic regeneration, relative-link enforcement, and docstring drift.

### Phase 2 – Generator Foundations
- Implement `npm run live-docs:generate` command that reads configuration, preserves authored blocks, and emits generated sections with HTML markers.
- Introduce deterministic hashing + provenance metadata inside each generated block.
- Stage output into `/.live-documentation/<baseLayer>/` (default `source/`) with diff tooling comparing current MDMD files.
- Update SlopCop rules and safe-commit pipeline to lint staged Live Docs for structure and relative-link hygiene.

### Phase 3 – Evidence & Coverage Bridges
- Wire coverage ingestion (unit, integration, benchmark) to populate `Observed Evidence`, `Targets`, and `Supporting Fixtures` sections.
- Validate `Observed Evidence` blocks when emitted and ensure waiver markers surface only when automated evidence is absent. *(live-docs:lint now skips files with no evidence data but still enforces waiver markup when the section appears.)*
- Extend benchmarks to confirm polyglot analyzers maintain ≥0.9/≥0.8 precision/recall after bridge integration. *(live-docs:report enforces thresholds and runs inside the safe-to-commit pipeline.)*

### Phase 4 – Consumption Surfaces & CLI Parity
- Pivot diagnostics, tree views, and quick pick commands to read from staged Live Docs.
- Ship CLI counterparts (`live-docs inspect`, `live-docs evidence`, etc.) where `live-docs inspect` traces the dependency path between `--from` and `--to` artifacts (or locates terminal roots when only one endpoint is provided) and emits hop-by-hop markdown/JSON for LLM automation.
- Provide diff and dry-run modes to review regeneration impacts before applying.
- Consolidate the visualization command center so `npm run live-docs:visualize` (and Antigravity) present a merged circuit-board/local explorer with focus-mode filtering, synchronized force graph, and WCAG AA accessibility groundwork.

### Phase 5 – Docstring Drift & Optional Authoring (Wishlist)
- Emit docstring bridge configuration from Live Documentation, implement server-side reconciliation, and surface drift diagnostics with actionable remediation hints.
- Keep docs → code write-back (preview/apply) explicitly deferred; if implemented later, require feature flags, explicit confirmation, and provenance (`actor`, `timestamp`, `target symbols`).
- Introduce workspace feature flags and telemetry sinks so teams can trial any future write-back without destabilising regeneration, capturing success/failure metrics for every attempt.
- Harden polyglot fixtures (C#, Java, TypeScript, Python) with HTML-rich, multi-paragraph docstrings to validate sanitisation, canonical tagging, and lossless round trips.
- Prototype generative scaffolding commands that materialise scratch pseudocode or language-specific skeletons tied back to the originating Live Documentation file.

### Phase 6 – Migration & Promotion
- Produce migration CLI (`live-docs migrate`) that copies staged Live Docs into the MDMD Layer‑4 tree once parity metrics pass.
- Update Layer‑3 architecture docs and knowledge feeds to consume the new markdown graph.
- Flip default configuration for repositories that opt in; document rollback strategy.

### Phase 7 – Metadata Enrichers & Future Layers
- Add optional generated analytics (deterministic co-activation scores, reference counts) guarded by reproducible inputs.
- Prototype Layer‑3/Layer‑2 Live Documentation derived from aggregated Layer‑4 data (release-level docs, work-item mapping) while preserving authored/generated pattern.
- Explore visual exports (mermaid diagrams, shareable codemaps) grounded in the markdown graph.


### Phase 8 – Layer Distribution & CI/CD Surfaces
- Stand up the GitHub Pages (Astro) projection for Layer‑1/2/3 docs, sourcing markdown directly from `.mdmd/layer-*` and the roadmap so the public handbook stays DRY.
- Wire the site builder into the existing CI/CD path: `npm run site:build -- --check` runs during `npm run safe:commit`, and a dedicated GitHub Pages workflow publishes snapshots with git SHA provenance.
- Document how requirement trackers (Spec‑Kit today, GitHub Issues tomorrow) continue to feed the roadmap so the projection remains tracker-agnostic.
- Update onboarding/quickstart material with the distribution model so contributors know Layer‑1/2 live on the site, Layer‑3 analytics stay derived, and Layer‑4 is powered by Live Docs.

### Phase 9 – Hosted Showcase Trials
- Containerise the Live Docs generator and dependencies so it can run inside Cloudflare Workers/Pages (or equivalent serverless runners) with deterministic resource ceilings.
- Build a pipeline that accepts GitHub repo references, clones to ephemeral storage, executes `npm run live-docs:generate`, embeds provenance metadata, and zips the resulting Live Docs + SQLite cache + README + prompt guide.
- Ship consent + privacy messaging, rate limiting, and telemetry that prove repositories are public-only and that all temporary artefacts are deleted immediately after bundles are created.

## Implementation Traceability
- [`packages/server/src/runtime/changeProcessor.ts`](../../packages/server/src/runtime/changeProcessor.ts) orchestrates analyzer execution feeding Live Doc regeneration.
- [`packages/shared/src/tooling/documentationLinks.ts`](../../packages/shared/src/tooling/documentationLinks.ts) and upcoming `liveDocumentationGenerator` module emit staged markdown.
- [`packages/extension/src/commands/exportDiagnostics.ts`](../../packages/extension/src/commands/exportDiagnostics.ts) and planned `live-docs` CLI provide human/LLM consumption surfaces.
- [`scripts/live-docs/visualize-explorer.ts`](../../scripts/live-docs/visualize-explorer.ts) and its future extension host the command center that unifies circuit-board, local, and force-directed exploration with accessibility hooks.
- Integration suites under `tests/integration/live-docs` validate regeneration, evidence mapping, and docstring drift; benchmark harnesses in `reports/benchmarks` ensure analyzer accuracy remains above target.



