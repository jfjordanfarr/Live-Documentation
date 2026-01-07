# Live Documentation Roadmap

## Metadata
- Layer: 2
- Requirement IDs: REQ-L1, REQ-L2, REQ-L3, REQ-V1, REQ-G1, REQ-E1, REQ-D1, REQ-H1, REQ-LLM1, REQ-B1

## Requirements

### REQ-L1 Live Documentation Baseline
Supports CAP-001 by delivering authored+generated Live Documentation artefacts in a configurable mirror tree with deterministic regeneration and human-friendly editing flows.

#### Stream LD1-A – Authored Framework *(in progress)*
- Update Layer‑4 instructions and archetype overlays (Implementation, Test, Asset) so every Live Doc shares the same authored template (`Description`, `Purpose`, `Notes`).
- Provide extension commands and snippets that protect the authored block while exposing convenient editing entry points.
- Document consent flows for storing generated Live Docs inside or outside the repository (`.live-documentation/` by default, configurable for adopters).

#### Stream LD1-B – Mirror Tree & Migration *(planned)*
- Stage generator output under `/.live-documentation/<baseLayer>/` (default `source/`), validate parity with existing Layer‑4 MDMD, then orchestrate an opt-in migration that flips the default storage path once confidence is proven.
- Maintain one-to-one Live Doc ↔ source relationships; ensure configuration surfaces align with monorepos and asset directories.
- Publish migration guide and automation scripts (e.g., `npm run live-docs:migrate`) for external adopters.

#### Stream LD1-C – Safety & Governance *(planned)*
- Embed lint rules and safe-commit hooks that detect missing generated sections or unauthorized edits inside generated blocks.
- Capture waivers for intentionally empty sections (`Observed Evidence`, `Targets`, `Consumers`) via HTML comments so automation can track debt.
- Record MIT licensing notices in Live Docs and packaging materials to reinforce open-source distribution.

### REQ-L2 Generated Intelligence
Supports CAP-002 by keeping generated sections current through analyzers, docstring bridges, coverage inference, and polyglot oracles.

#### Stream LD2-A – Symbol & Docstring Extraction *(in motion)*
- Refactor language analyzers (TypeScript, Python, Rust, Java, Ruby, C, C#) to emit export signatures, docstrings, and source anchors for the `Public Symbols` section.
- Build docstring bridges that keep Live Docs synchronized with inline documentation (TSDoc, XML comments, Sphinx, Rustdoc) while honouring consent signals.
- Canonicalise docstring payloads into a shared schema (`summary`, `remarks`, `parameters`, `returns`, `exceptions`, `examples`) so generated markdown renders consistent headings regardless of source language.
- Render each populated field as a deterministic `##### `Symbol` — Field` subsection, retain unmapped fragments with provenance, and provide `_Not documented_` placeholders when analyzers report gaps.
- Expand polyglot fixtures with docstring-heavy samples per language to validate schema coverage, inline references, and drift diagnostics before promoting adapters.
- Maintain precision/recall benchmarks per language to keep regeneration trustworthy.

#### Stream LD2-B – Dependency Resolution *(in progress)*
- Upgrade import/call/asset heuristics to list first-order collaborators for every implementation Live Doc.
- Extend asset analyzers to detect HTML/CSS/image relationships, emitting lightweight Live Docs for non-plaintext assets.
- Store provenance metadata indicating heuristic family, benchmark score, and last regeneration timestamp.

#### Stream LD2-C – Evidence & Coverage *(planned)*
- Aggregate unit, integration, and benchmark coverage to populate `Observed Evidence` for implementations and `Targets` / `Supporting Fixtures` for tests.
- Integrate coverage CLI output and heuristics to reduce manual curation while keeping waivers auditable.
- Ensure regenerated evidence respects one-to-one Live Doc mapping and flags orphaned tests or implementations.

#### Stream LD2-D – Polyglot Oracles *(in progress)*
- Maintain deterministic AST benchmarks and regeneration CLIs (TypeScript, Python, C#, Rust, Java, Ruby, C) that feed analyzer confidence scores.
- Capture drift deltas in `reports/benchmarks/**` and expose them inside Live Docs as optional generated metadata.
- Layer an LLM sampling harness atop deterministic oracles with strict gating so predictions remain reviewable and reversible.

#### Stream LD2-E – Polyglot Live Doc Emitters *(planned)*
- Adapt the Live Doc generator to call language-specific analyzers for repository-hosted fixture workspaces (TypeScript, Python, C#, Java, Ruby, Rust, C) so `Public Symbols` and `Dependencies` regenerate without manual intervention.
- Snapshot generated markdown for each fixture under `tests/integration/live-docs/polyglot-fixtures.test.ts`, asserting deterministic output before targeting external repositories.
- Promote polyglot regeneration metrics into `reports/benchmarks/live-docs/precision.json`, tracking per-language pass rates and highlighting regression thresholds in safe-commit.

### REQ-L3 Consumption & Enforcement
Supports CAP-003 by making Live Documentation the backbone of diagnostics, CLI tooling, and lint enforcement.

#### Stream LD3-A – Diagnostics & Views *(in progress)*
- Pivot diagnostics providers to source their findings from the Live Doc graph, including hover tooltips, Problems entries, and acknowledgement workflows.
- Refresh tree views and quick pick commands so they display Live Doc metadata (generated timestamps, evidence counts, dependency fan-out).
- Provide diff previews comparing authored versus generated changes before accepting regeneration.

#### Stream LD3-B – CLI & Export Surfaces *(planned)*
- Ship CLI commands (e.g., `npm run live-docs:inspect`) that compute the dependency path between a `--from` and `--to` artifact or symbol, fall back to the nearest terminal roots when only one endpoint is supplied, and return shareable markdown or JSON.
- Generate ASCII/markdown narratives that spell out each hop in the chain (artifact, edge kind, justification) so humans and copilots can replay impact reasoning without spelunking raw markdown.
- Support shareable codemap snapshots similar to Windsurf Codemaps but grounded entirely in markdown.

#### Stream LD3-C – Enforcement & Linting *(planned)*
- Integrate Live Doc validation with safe-commit, CI, and SlopCop so missing generated sections, stale timestamps, or absent evidence block merges.
- Emit JSON reports for dashboards and future IDE integrations (JetBrains, Vim) without duplicating business logic.
- Support staged adoption (Observe → Sustain) with profile configurations that control enforcement scope.

### REQ-V1 Live Visualization Command Center
Supports CAP-008 by unifying the circuit-board workspace map, symbol-level local explorer, and force-directed discovery view into a single `npm run live-docs:visualize` experience that remains grounded in Layer‑4 Live Docs and ready for future bidirectional authoring. The explorer must maintain parity with the Live Doc graph: every dependency, symbol anchor, and evidence field available headlessly must surface in the UI without lossy aggregation or speculative heuristics, and visual affordances should colour or otherwise distinguish inbound versus outbound relationships to match CLI diagnostics.

#### Stream LV1-A – Unified Explorer *(in progress)*
- Refactor `visualize-explorer.ts` so the circuit-board and local views share a data model sourced from Live Docs, letting users pan globally, expand a file into its symbols, and toggle focus-mode filters that hide unrelated nodes.
- Ensure hover/click events update the detail panel, highlight inbound/outbound edges, and keep the force-directed graph in sync when switching modes.
- Provide explicit affordances (toolbar button, keyboard shortcut) to open the selected Live Doc or source file in the editor, matching the Antigravity prototype walkthroughs.

#### Stream LV1-B – Accessibility & Interaction *(planned)*
- Audit the merged view for WCAG AA compliance: keyboard navigation, focus outlines, ARIA labelling, contrast palette, and motion reduction options for the force view.
- Implement scalable zoom/pan controls that respect keyboard-only workflows and screen-reader announcements when context changes.
- Capture automated accessibility regression checks (e.g., axe-core) inside a headless test harness so future visual tweaks retain compliance.

#### Stream LV1-C – Authoring Bridge Prep *(planned)*
- Introduce a text-editing stub within the detail panel that loads authored Live Doc sections read-only today, paving the way for docstring scaffolding once bidirectional authoring (REQ-G1) is feature-flagged.
- Surface provenance (Live Doc path, generated timestamp) and upcoming editing controls so UX copy remains clear about read-only versus editable states.
- Coordinate with docstring bridge work to reuse diff/preview components when the editing toggle goes live.

#### Stream LV1-D – Telemetry & QA *(planned)*
- Instrument the visualization command center (selection counts, focus-mode usage, accessibility overrides) so UX regressions and adoption signals appear in telemetry dashboards.
- Add smoke tests that launch the explorer in CI (headless browser or Playwright) to validate data binding, focus management, and “open in editor” deep links.
- Document manual QA scripts for Antigravity/Windsurf to ensure non-VS Code forks keep parity.

#### Stream LV1-E – Non-Headless Inspect (Local Map From/To) *(planned)*
- Add `From` and `To` inputs to the Local Map view so maintainers can run `live-docs inspect`-equivalent pathfinding without leaving the explorer.
- When both endpoints are provided, run pathfinding automatically (debounced) and expand the Local Map beyond one hop to render the multi-hop chain (including join points) using the same hop semantics the CLI emits.
- When no path exists, provide deterministic “no connection” feedback rather than silently showing unrelated neighbors.

### REQ-G1 Docstring Drift & Optional Authoring (Wishlist)
Supports CAP-006 by keeping docstring extraction and drift visibility reliable (code → docs), while explicitly deferring docs → code write-back and scaffolding to an opt-in wishlist item.

#### Stream LDG-A – Docstring Drift Diagnostics *(planned)*
- Extend docstring bridges to compute structured drift signals (missing/changed docstring fields, unmapped tags) between inline docstrings and generated Live Doc schema.
- Provide deterministic, human-readable drift reports (CLI + diagnostics) that point to the affected symbol/field and recommended remediation paths.
- Harden polyglot fixtures (C#, Java, TypeScript, Python) with multi-paragraph, HTML-rich docstrings to validate sanitisation, canonical tagging, and drift detection coverage.

#### Stream LDG-B – Feature Controls & Telemetry *(wishlist)*
- If docs → code write-back is explored later, protect it behind workspace-level feature flags so the default experience stays read-only.
- Capture metrics for drift counts, unmapped tag fallbacks, and (if applicable) preview/apply attempts.
- Wire safety rails into safe-commit so any automated rewrites require explicit opt-in and fall back cleanly when analyzers report uncertainty.

#### Stream LDG-C – Generative Scaffolding *(stretch goal)*
- Generate language-specific skeletons or pseudocode from Live Doc authored intent, emitting draft source files into a scratch workspace for review.
- Allow multi-language exploration (e.g., TypeScript + Rust prototypes) seeded from the same Live Doc while tagging outputs as experimental until promoted.
- Partner with Copilot agents to replay ensured scaffolds, keeping execution deterministic and auditable.

### REQ-E1 Ecosystem Enablement
Supports CAP-004 by packaging the Live Documentation system for open adoption and long-term sustainability.

#### Stream LD4-A – Packaging & Licensing *(in progress)*
- Publish MIT license, contributor guide, and extension marketplace messaging emphasising Live Documentation capabilities.
- Bundle sample workspaces and docs showing before/after Live Doc migrations.
- Provide tooling to scaffold archetype templates for new projects.

#### Stream LD4-B – External Integrations *(planned)*
- Research GitLab Knowledge Graph, LSIF, and SCIP ingestion paths that complement markdown-as-AST without compromising offline guarantees.
- Offer MCP/OpenAPI surfaces so other IDE agents can consume the Live Doc graph.
- Track competitive differentiators (Windsurf Codemaps) within roadmap updates and marketing materials.

### REQ-D1 Layer Distribution Surfaces
Supports CAP-005 by anchoring each MDMD layer to the surface where it excels: Layer 1 publishes via a static site, Layer 2 maps to Spec-Kit and issue trackers, and System analytics remain CLI materialized views grounded in Layer‑4 data.

#### Stream LD8-A – Public Site Pipeline *(planned)*
- Scaffold a GitHub Pages (or equivalent) site sourced from `.mdmd/layer-1` content, including build scripts, preview commands, and publish automation.
- Document how Layer 1 capabilities map to site navigation and ensure the pipeline honours relative links.
- Add lint/CI gates that fail when the site build detects broken links or missing capabilities.

#### Stream LD8-B – Requirement Handoff *(planned)*
- Integrate Spec-Kit exports (and future issue trackers) into Layer‑2 docs via generated snapshots so automation can reconcile external IDs with MDMD requirements.
- Provide guidance for synchronising completion state between Spec-Kit checklists and Layer‑2 markdown, highlighting deltas during safe-commit.
- Ensure roadmap docs link to a single source of truth for each requirement (MDMD summary) while referencing the execution system in `### Integration`.

#### Stream LD8-C – Materialized View CLI *(planned)*
- Ship `npm run live-docs:system` that streams System analytics (markdown/JSON) to stdout or a caller-provided temp directory without committing artefacts.
- Remove the committed `.live-documentation/system/` mirror once the CLI is validated; update lint/safe-commit rules to block stray System files.
- Author integration tests and fixture workspaces that prove messy repos surface debt via the CLI output alone.

### REQ-H1 Hosted Showcase Pipeline
Supports CAP-007 by delivering a stateless Cloudflare (or equivalent) runner that clones public GitHub repositories, executes the existing Live Docs generator, and returns a downloadable bundle while preserving the offline-first guarantee.

#### Stream H1-A – Stateless Runner *(planned)*
- Containerise the Live Docs generator and its dependencies so `npm run live-docs:generate` and lint steps execute identically inside Cloudflare Pages/Workers or another serverless sandbox with deterministic resource ceilings.
- Provide infrastructure-as-code plus GitHub workflow documentation so the hosted surface tracks the same branches/tags as the repository and reuses existing CI artifacts when available.
- Enforce strict deletion of workspaces immediately after bundles are produced; expose telemetry proving the cleanup succeeded.

#### Stream H1-B – Bundle Assembly & Guidance *(planned)*
- Produce downloadable archives containing the generated Live Docs mirror, provenance manifest (commit hash, analyzer versions, benchmark IDs), and a README that explains how to rerun everything locally in VS Code, Windsurf, Cursor, and other forks.
- Include prompt guides and CLI recipes tailored for LLM workflows so hosted trials showcase downstream consumption without promising cloud-only execution.
- Track bundle generation metrics and publish anonymised counts (e.g., number of repos analyzed) for marketing without storing customer code.

#### Stream H1-C – Consent, Privacy & Telemetry *(planned)*
- Require explicit acknowledgement that only public repositories are supported, log repo/ref metadata for abuse mitigation, and document how rate limits apply.
- Emit telemetry covering request lifecycle (received, clone complete, generation success/failure, bundle download) with correlation IDs so support can trace incidents without retaining code.
- Signpost privacy, offline-first positioning, and a “Replay Locally” CTA in every hosted response so prospects immediately understand that the Cloudflare run mirrors the installable workflow.
### REQ-LLM1 LLM Enrichment (Extractive & Generative)
Supports CAP-009 by delivering explicit, user-invoked LLM capabilities that discover missed relationships (extractive) and synthesize human-readable prose from statistical artifacts (generative), with budget controls, diff previews, and audit trails that prevent runaway spend and hallucination propagation.

#### Stream LLM1-A – Graph Edge Extraction *(planned)*
- Extend `LlmIngestionOrchestrator` to batch-extract semantic relationships (coupling, invariants, implicit contracts) that heuristic analyzers miss.
- Stage extracted edges with provenance metadata (model, prompt version, confidence) and require human promotion before they appear in generated sections or diagnostics.
- Wire CLI (`live-docs enrich`) and extension command (`Live Documentation: Enrich Graph`) that invoke extraction with configurable scope (file, folder, workspace).
- Invalidate stale edges when underlying source files change, prompting re-extraction rather than silently serving outdated relationships.

#### Stream LLM1-B – Document Synthesis *(planned)*
- Implement synthesis pipeline that transforms terse System-layer artifacts (co-activation p-values, Mermaid topologies, component lists) into human-readable `Purpose` and `Notes` prose.
- Fill `_Pending authored purpose_` placeholders while preserving deterministic generated sections; output diffs for review before write.
- Wire CLI (`live-docs synthesize`) and extension command (`Live Documentation: Synthesize Authored Section`) with scope controls.
- Ensure synthesis never modifies deterministic generated sections or overwrites existing authored content without explicit confirmation.

#### Stream LLM1-C – Budget & Governance *(planned)*
- Implement per-workspace budget caps (token limits, spend thresholds) configurable via `.live-docs.config.json` or workspace settings.
- Abort LLM calls gracefully when budgets are exceeded, emitting actionable guidance rather than silent failures.
- Capture telemetry for invocation counts, token usage, promotion/rejection rates without logging prompt/response content.
- Document trust boundaries: LLM outputs are staged, diff-previewed, and recorded with provenance before promotion.

### REQ-B1 Brownfield Documentation Integration
Supports CAP-010 by enabling Live Documentation to coexist with pre-existing markdown documentation in brownfield workspaces through a "bridge, don't replace" strategy that respects legacy context without overwriting or tracking it.

#### Stream B1-A – Read-Only Respect *(planned)*
- Ensure the Live Doc generator never overwrites, migrates, or tracks existing markdown (READMEs, ADRs, design notes) outside the Live Documentation mirror tree.
- Document clear boundaries: brownfield docs are read-only graph citizens, never candidates for generated section injection.
- Validate via integration tests that running `live-docs:generate` leaves brownfield markdown byte-for-byte unchanged.

#### Stream B1-B – Link-Driven Discovery *(planned)*
- Extend the graph builder to discover brownfield docs that link to Live Documentation (or are linked from it) and include them as read-only nodes.
- Render brownfield docs in the Force Graph with distinct styling (dashed borders, muted palette) signalling their non-generated status.
- Implement a single "Show Related Documentation" checkbox in the Force Graph that controls visibility of all link-connected markdown (System-layer docs, brownfield docs, chat history references).

#### Stream B1-C – Layer Mapping & Indexing *(planned)*
- Document that brownfield docs conceptually map to Layers 1–3 (Vision, Requirements, Architecture) and never to the Base/Source layer (Layer 4).
- Optionally ingest brownfield markdown (title, headings, first paragraph) into the exploration index so semantic search surfaces legacy context without mutating files.
- Ensure indexing is additive and never destructive; brownfield content appears in search results with clear provenance distinguishing it from generated Live Docs.
## Acceptance Criteria

### REQ-L1 Acceptance Criteria
- Every Live Doc contains `Metadata`, `Authored`, and `Generated` sections with required subsections; safe-commit fails if structure is missing.
- Docstring bridges emit drift diagnostics, map multi-tag payloads into the shared schema, render deterministic subheadings per field, and update generated sections during regeneration with `_Not documented_` placeholders when data is missing.
- Migration dry-runs compare existing Layer‑4 MDMD docs to generated Live Docs with <5% diff noise before enabling swap.
- Relative-link lint passes with the configured slug dialect (GitHub default) so staged docs can be published directly to wiki surfaces.
- Generated sections refresh within a single `safe:commit` run for modified files; stale Live Docs raise warnings within 24 hours if regeneration is skipped.

### REQ-L2 Acceptance Criteria

### REQ-G1 Acceptance Criteria
- Docstring drift detection reports missing or divergent fields within one regeneration cycle for supported fixtures, without requiring write-back to be enabled.
- Any preview/apply tooling (if/when implemented) is feature-flagged, default-off, and emits telemetry for every attempted write-back.
- Generative scaffolding workflows emit artifacts into `AI-Agent-Workspace/tmp/**` (or caller-provided scratch paths) and never mutate tracked files without a follow-up approval step recorded in safe-commit logs.
- Unmapped docstring tags appear in Live Docs under `rawFragments` with actionable telemetry so adapters can be extended without silently dropping content.

### REQ-L3 Acceptance Criteria
- Diagnostics, CLI, and narrative commands reference Live Docs as the single source of truth (no bespoke graph queries), and `live-docs:inspect` emits deterministic hop sequences for `--from/--to` queries while surfacing terminal roots when only one endpoint is provided.
- Safe-commit and CI pipelines block merges when Live Doc regeneration or lint checks fail.
- CLI exports and diagnostics respond within target latency (≤2 s for repos under 10k files).
- Every UI interaction (diagnostics, diff previews, tree views) exposes an equivalent CLI or LLM-accessible command so automation matches human capabilities.

### REQ-V1 Acceptance Criteria
- The combined circuit-board/local explorer loads a Live Doc file, expands its symbols, and highlights inbound/outbound edges while dimming unrelated nodes within two interactions.
- Hover/click updates the detail panel and “open in editor” link without desynchronising the force-directed graph; switching views preserves the active selection.
- Keyboard navigation, focus outlines, and screen-reader labels meet WCAG AA success criteria (2.1 Keyboard, 1.4.3 Contrast, 4.1.2 Name/Role/Value) across supported browsers/host IDEs.
- The detail panel presents authored Live Doc sections read-only today, with clear messaging about pending text editing, and loads within ≤500 ms for repos under 5k files.
- Telemetry captures view changes, focus-mode toggles, and accessibility overrides so UX audits can trace adoption and regressions.
- Visual overlays expose inbound versus outbound relationships with distinct treatments (for example, colour or stroke style) and honour symbol-level anchors once emitted by the generator so the UI mirrors the CLI’s directional insights without regression tests flagging gaps.
- The Local Map provides `From`/`To` pathfinding that auto-runs (debounced) and renders the same multi-hop chain as `live-docs inspect --from/--to` (or deterministic “no connection”) using only Live Doc graph facts.

### REQ-E1 Acceptance Criteria
- MIT license, README, and marketing materials describe Live Documentation capabilities and configuration knobs.
- Sample workspaces regenerate Live Docs using out-of-the-box tooling with zero manual steps.
- External API surfaces (CLI, MCP/OpenAPI) expose Live Doc graph queries with authentication disabled by default for local use.

### REQ-D1 Acceptance Criteria
- Static site build succeeds using Layer 1 markdown with zero broken links; publish workflow documents the GitHub Pages (or equivalent) flow.
- Layer 2 docs reference Spec-Kit/issue tracker IDs in `### Integration`, and generated snapshots highlight mismatches during safe-commit.
- `npm run live-docs:system` (or successor command) defaults to ephemeral output, cleans up temporary files, and lint fails when `.live-documentation/system/` contains untagged artefacts.
- Integration fixtures capture “bad” workspaces and prove the CLI output surfaces architectural debt without persisting docs.

### REQ-H1 Acceptance Criteria
- Hosted showcase runners use the exact same generator build as local developers (verified via provenance hashes) and fail closed when analyzer versions drift.
- Bundles include a README that highlights offline-first steps plus compatibility guidance for VS Code, Windsurf, Cursor, and other forks; telemetry confirms the link back to local workflows is shown on every run.
- Workspace archives are deleted automatically after bundle creation, with audit logs recording completion timestamps and correlation IDs.
- Marketing copy and telemetry dashboards explicitly label the hosted surface as a demo-only experience and block private repositories by design.

### REQ-LLM1 Acceptance Criteria
- LLM enrichment (graph edge extraction and document synthesis) requires explicit user invocation via CLI (`live-docs enrich`, `live-docs synthesize`) or extension commands; no background LLM calls occur.
- Extracted edges are staged with provenance metadata and require human promotion before appearing in generated sections or diagnostics.
- Document synthesis fills `_Pending authored purpose_` placeholders while preserving deterministic generated sections; outputs are diff-previewed before write.
- Budget caps (token limits, spend thresholds) are configurable per workspace and enforced before LLM calls execute; exceeded budgets abort gracefully with guidance.
- Telemetry captures LLM invocation counts, token usage, promotion rates, and rejection reasons without logging prompt/response content.

### REQ-B1 Acceptance Criteria
- Brownfield markdown (READMEs, ADRs, existing design docs) is never overwritten, migrated, or tracked by the Live Doc generator.
- Link-connected brownfield docs appear in the Force Graph with distinct styling (dashed borders, muted palette) signalling their read-only, non-generated status.
- A single "Show Related Documentation" checkbox controls visibility of all link-connected markdown (System-layer docs, brownfield docs, chat history) in the Force Graph.
- Optional semantic indexing ingests brownfield markdown (title, headings, first paragraph) so search surfaces legacy context without mutating files.
- Layer mapping documentation clarifies that brownfield docs conceptually map to Layers 1–3 and never to the Base/Source layer (Layer 4).




## Linked Components

### COMP-001 Diagnostics Pipeline
Supports REQ-301. [Diagnostics Pipeline Architecture](../layer-3/diagnostics-pipeline.mdmd.md)

### COMP-002 Extension Surfaces
Supports REQ-301. [Extension Surfaces Architecture](../layer-3/extension-surfaces.mdmd.md)

### COMP-003 Language Server Runtime
Supports REQ-101 and REQ-201. [Language Server Architecture](../layer-3/language-server-architecture.mdmd.md)

### COMP-004 SlopCop Tooling
Supports REQ-101 and REQ-301. [SlopCop Architecture](../layer-3/slopcop.mdmd.md)

### COMP-005 Knowledge Graph Ingestion
Supports REQ-201 and REQ-401. [Knowledge Graph Ingestion Architecture](../layer-3/knowledge-graph-ingestion.mdmd.md)

### COMP-006 LLM Ingestion Pipeline
Supports REQ-201 and REQ-301. [LLM Ingestion Pipeline](../layer-3/llm-ingestion-pipeline.mdmd.md)

### COMP-007 Diagnostics Benchmarking
Supports REQ-201. [Benchmark Telemetry Pipeline](../layer-3/benchmark-telemetry-pipeline.mdmd.md)

### COMP-008 Integration Test Architecture
Supports REQ-030. [Integration Testing Architecture](../layer-3/testing-integration-architecture.mdmd.md)

### COMP-010 Relationship Rule Engine
Supports REQ-040. [Relationship Rule Engine Architecture](../layer-3/relationship-rule-engine.mdmd.md#comp010-relationship-rule-engine)

### COMP-011 Relationship Coverage Auditor
Supports REQ-040. [Relationship Rule Engine Architecture](../layer-3/relationship-rule-engine.mdmd.md#comp011-relationship-coverage-auditor)

### COMP-012 Symbol Correctness Profile Evaluator
Supports REQ-040. [Relationship Rule Engine Architecture](../layer-3/relationship-rule-engine.mdmd.md#comp012-symbol-correctness-profile-evaluator)

### COMP-013 Polyglot Fixture Oracles
Supports REQ-030. [Polyglot Oracles & Sampling Architecture](../layer-3/polyglot-oracles-and-sampling.mdmd.md#comp-013-polyglot-fixture-oracles)

### COMP-014 LLM Sampling Harness
Supports REQ-020 and REQ-030. [Polyglot Oracles & Sampling Architecture](../layer-3/polyglot-oracles-and-sampling.mdmd.md#comp-014-llm-sampling-harness)

### COMP-020 Layer Distribution Pipeline
Supports REQ-D1. [Live Documentation Pipeline](../layer-3/live-documentation-pipeline.mdmd.md)

### COMP-021 Generative Authoring Bridge
Supports REQ-G1. [Live Documentation Pipeline](../layer-3/live-documentation-pipeline.mdmd.md#comp203-live-doc-authoring-bridge)

### COMP-030 Visualization Explorer
Supports REQ-V1. The Explorer is implemented with three views: Circuit Board (treemap), Local Map (3-column symbol graph), and Force Graph. Static distribution via `npm run live-docs:visualize:static` and interactive Local Map `From`/`To` pathfinding are shipped as of commit `a0cc5de2` (2025-12-18). Accessibility audits and Playwright smoke tests remain outstanding (LD-406–LD-408).

## Linked Implementations

### IMP-101 docDiagnosticProvider
Supports REQ-301. [Extension Diagnostic Provider](../../.mdmd/layer-4/packages/extension/src/diagnostics/docDiagnosticProvider.ts.mdmd.md)

### IMP-102 publishDocDiagnostics
Supports REQ-301. [Server Diagnostics Publisher](../../.mdmd/layer-4/packages/server/src/features/diagnostics/publishDocDiagnostics.ts.mdmd.md)

### IMP-103 changeProcessor
Supports REQ-101 and REQ-201. [Change Processor Runtime](../../.mdmd/layer-4/packages/server/src/runtime/changeProcessor.ts.mdmd.md)

### IMP-201 slopcopMarkdownLinks CLI
Supports REQ-101. [SlopCop Markdown Audit](../../.mdmd/layer-4/scripts/slopcop/check-markdown-links.ts.mdmd.md)

### IMP-202 slopcopAssetPaths CLI
Supports REQ-101. [SlopCop Asset Audit](../../.mdmd/layer-4/scripts/slopcop/check-asset-paths.ts.mdmd.md)

### IMP-203 documentationBridge Schema
Supports REQ-201. [Workspace Graph Snapshot](../../.mdmd/layer-4/scripts/graph-tools/snapshot-workspace.ts.mdmd.md)

### IMP-301 safe-to-commit Orchestrator
Supports REQ-101 and REQ-301. [Safe to Commit Pipeline](../../scripts/safe-to-commit.mjs)

### IMP-302 graphCoverageAudit CLI
Supports REQ-030. [Graph Coverage Audit](../../.mdmd/layer-4/scripts/graph-tools/audit-doc-coverage.ts.mdmd.md)

### IMP-303 inspectSymbolNeighbors CLI
Supports REQ-030. [Inspect Symbol Neighbors CLI](../../.mdmd/layer-4/scripts/graph-tools/inspect-symbol.ts.mdmd.md)

### IMP-401 Relationship Rule Engine
Supports REQ-040. [Relationship Rule Engine](../../.mdmd/layer-4/packages/shared/src/rules/relationshipRuleEngine.ts.mdmd.md)

### IMP-402 Relationship Rule Audit
Supports REQ-040. [Relationship Rule Audit](../../.mdmd/layer-4/packages/shared/src/rules/relationshipRuleAudit.ts.mdmd.md)

### IMP-403 Relationship Rule Resolvers
Supports REQ-040. [Relationship Rule Resolvers](../../.mdmd/layer-4/packages/shared/src/rules/relationshipResolvers.ts.mdmd.md)

### IMP-404 Relationship Rule Types
Supports REQ-040. [Relationship Rule Types](../../.mdmd/layer-4/packages/shared/src/rules/relationshipRuleTypes.ts.mdmd.md)

### IMP-480 Symbol Correctness Profiles
Supports REQ-040. [Symbol Correctness Profiles](../../.mdmd/layer-4/packages/shared/src/rules/symbolCorrectnessProfiles.ts.mdmd.md)

### IMP-481 Symbol Correctness Validator
Supports REQ-040. [Symbol Correctness Validator](../../.mdmd/layer-4/packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts.mdmd.md)

### IMP-510 Python Fixture Oracle
Supports REQ-030. [Python Fixture Oracle](../../.mdmd/layer-4/packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md)

### IMP-521 C Fixture Oracle
Supports REQ-030. [C Fixture Oracle](../../.mdmd/layer-4/packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md)

### IMP-522 Rust Fixture Oracle
Supports REQ-030. [Rust Fixture Oracle](../../.mdmd/layer-4/packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md)

### IMP-523 Java Fixture Oracle
Supports REQ-030. [Java Fixture Oracle](../../.mdmd/layer-4/packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md)

### IMP-524 Ruby Fixture Oracle
Supports REQ-030. [Ruby Fixture Oracle](../../.mdmd/layer-4/packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md)

### IMP-541 C# Fixture Oracle
Supports REQ-050. [CSharp Fixture Oracle](../../.mdmd/layer-4/packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md)

### IMP-530 LLM Sampling Harness
Supports REQ-201 and REQ-301. [LLM Sampling Harness](../../.mdmd/layer-4/packages/shared/src/inference/llmSampling.ts.mdmd.md)

### IMP-610 liveDocsSystemCli *(planned)*
Supports REQ-D1. (CLI will be documented alongside the System analytics implementation.)

### IMP-650 liveDocsVisualizeExplorer
Supports REQ-V1. [Visualize Explorer CLI](../../.mdmd/layer-4/scripts/live-docs/visualize-explorer.ts.mdmd.md). Interactive server (`npm run live-docs:visualize`) and static distribution (`npm run live-docs:visualize:static`) are shipped. Local Map `From`/`To` pathfinding completed 2025-12-18 (commit `a0cc5de2`).

### IMP-950 hostedShowcaseWorker *(planned)*
Supports REQ-H1. (Implementation will live under `scripts/live-docs/showcaseWorker.ts` with infrastructure configuration documented alongside the hosted pipeline.)

### IMP-901 docstringRoundTripService *(wishlist)*
Supports REQ-G1. (If docs → code write-back is pursued, a dedicated server-side service will be introduced with strict feature-flag and audit requirements.)

### IMP-902 liveDocsAuthoringCommands *(wishlist)*
Supports REQ-G1. (If docs → code write-back is pursued, VS Code commands will surface preview/apply flows and scaffolding under strict opt-in controls.)

## Evidence

### REQ-101 Evidence
- Live Documentation generator spike stored under `AI-Agent-Workspace/tmp/live-docs` demonstrates authored block preservation and generated diff stability.
- Safe-to-commit logs from 2025-11-08 record lint guards catching missing markers until instructions were updated.
- Updated Layer-4 instruction files (`.github/instructions/mdmd.layer4*.instructions.md`) align archetype templates with new structure.

### REQ-201 Evidence
- AST benchmarks (`reports/benchmarks/ast/*.json`) track precision/recall deltas for each language-specific oracle.
- Integration fixtures covering docstring bridges (`tests/integration/fixtures/slopcop-symbols`) regenerate without manual edits.
- Fallback heuristic tests (`fallbackInference.languages.test.ts`) validate dependency extraction across languages.

### REQ-301 Evidence
- Diagnostics integration suites US1–US5 now reference Live Docs in assertions.
- CLI prototypes under `scripts/live-docs` emit markdown narratives derived from staged Live Docs.
- SlopCop symbol audit verifies generated markers and evidence placeholders.

### REQ-401 Evidence
- MIT license draft and README updates tracked in `AI-Agent-Workspace/Notes/live-documentation-doc-refactor-plan.md`.
- Competitive research notes (Windsurf Codemaps, GitLab Knowledge Graph) captured in 2025-11-08 chat and surfaced in Layer‑1 vision.
- Sample workspace scaffolding spike recorded under `AI-Agent-Workspace/tmp/live-docs/sample-workspace`.

### REQ-D1 Evidence
- Layer distribution strategy logged in `AI-Agent-Workspace/Notes/live-documentation-doc-refactor-plan.md`, including tasks for site scaffolding, requirement handoff, and CLI materialized views.
- Stage 8 backlog items (`LD-800`–`LD-802`) in `specs/001-link-aware-diagnostics/tasks.md` track execution of the public site, requirement integration, and onboarding updates.
- System analytics CLI fixtures (to be added) will validate that architectural debt surfaces without persisting docs.

### REQ-V1 Evidence
- Antigravity walkthrough captures (2025-11-20) demonstrate the circuit-board/local explorer prototype, highlight UX gaps, and serve as the baseline for accessibility polish.
- `npm run live-docs:visualize` command invocations within Antigravity confirm the current server boots, detail panels open files in VS Code, and force-graph sync remains functional pending refactor.
- Upcoming Playwright smoke tests (planned under LV1-D) will record GIF/screenshot artefacts proving keyboard navigation, focus trapping, and screen-reader announcements operate as expected.

### REQ-G1 Evidence
- Java fixture with HTML-rich docstrings (`tests/integration/benchmarks/fixtures/java/basic`) demonstrates sanitisation improvements and structured Live Doc output captured during 2025-11-13 development.
- Chat history 2025-11-13 records stakeholder vision for bidirectional authoring, feature gating, and generative scaffolds to guide upcoming implementation.
- Planned integration suite `tests/integration/live-docs/docstring-roundtrip.test.ts` will validate CLI and extension commands once the authoring bridge ships.

## Verification Strategy
- Pre-commit guard: [`npm run safe:commit`](/scripts/safe-to-commit.mjs) chaining lint, tests, graph snapshot or audit, and the SlopCop suite (markdown, asset, symbol audits).
- Integration coverage: US1 to US5 suites emulate writer, developer, rename, and template ripple flows.
- Knowledge feed diffs: snapshot JSON fixtures under [`tests/integration/fixtures/simple-workspace/data/knowledge-feeds`](/tests/integration/fixtures/simple-workspace/data/knowledge-feeds).
- Live Doc verification: integrate regeneration assertions into `npm run safe:commit -- --benchmarks` once generator stabilises.
- System analytics verification: targeted fixtures confirm `npm run live-docs:system` cleans up temporary exports, flags architectural debt, and leaves the repo unmodified.
- Site pipeline verification: static site builds (GitHub Pages preview) run in CI, failing on broken links or missing Layer 1 capabilities.
- Docstring bridge verification: polyglot fixture suites exercise recommended tags per language, snapshot rendered subsections, and fail when unmapped fragments or missing placeholders slip through without provenance.
- Round-trip verification: feature-flagged integration suites replay Live Doc edits into inline docstrings, capture telemetry for success/failure outcomes, and assert no tracked files change without human confirmation.

## Traceability Links
- Vision alignment: [Layer 1 Vision](../layer-1/link-aware-diagnostics-vision.mdmd.md)
- Stakeholder prompts: [User Intent Census](/AI-Agent-Workspace/Notes/user-intent-census.md)
- Architecture docs: see linked components above.
- Implementation summaries: see linked implementations above.

## Active Questions
- Which external feed (LSIF, SCIP, GitLab knowledge graph) should open the T05x MVP pipeline?
- What coverage threshold do we need before promoting SlopCop asset and symbol lint beyond markdown?
- Do we gate Copilot metadata exposure until acknowledgement UX is complete?
- What diff heuristics keep authored block edits readable when generated sections change significantly?
- How do we package Live Docs inside the extension without inflating download size for adopters who regenerate on demand?
- Which narrative/diagram presets best serve both humans and copilots while remaining deterministically regenerable?
- What rollout messaging best guides adopters through the public site pipeline and Spec-Kit integration handoff while keeping System analytics ephemeral?
- Which UX affordances keep bidirectional docstring sync human-controlled while still enabling future generative scaffolding workflows?
- How do we articulate the handoff between the GitHub Pages handbook (Stage 8) and the hosted showcase (Stage 9) so prospects understand that all roads lead back to offline-first regeneration?

## Stage Sequencing Notes
- **Stage 8 – Layer Distribution & CI/CD Surfaces**: GitHub Pages (Astro) projection for Layer‑1/2 content lands alongside CI/CD guardrails so `npm run safe:commit` can catch site drift before publishing; System analytics remain CLI-only but linted to prevent committed artefacts.
- **Stage 9 – Hosted Showcase Trials**: Only after the site + CI/CD gates are stable do we green-light the Cloudflare demo path, reusing the same generator container, publishing provenance-rich bundles, and positioning the hosted runner strictly as a marketing experience that links back to local VS Code/Windsurf/Cursor flows.
