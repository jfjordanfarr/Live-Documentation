# Live Documentation Vision

## Metadata
- Layer: 1
- Capability IDs: CAP-001, CAP-002, CAP-003, CAP-004, CAP-005, CAP-006, CAP-007, CAP-008, ~~CAP-009~~ *(Descoped 2026-02-17)*, CAP-010

## Capabilities

### CAP-001 – Layer‑4 Backbone
Deliver a repository-embedded corpus of Live Documentation where every tracked asset owns an authored preamble and generated sections (`Public Symbols`, `Dependencies`, archetype metadata) stored in a mirror tree under `/.mdmd/layer-4/` (path configurable per workspace). Layer‑4 docs are the only durable artefacts the project promises to maintain; everything else must be derivable from this base ([AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md](../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md)).
Drive parity across the languages we benchmark today by teaching the generator to emit the same sections for repository-hosted Python, C#, Java, Ruby, Rust, and C fixtures before onboarding external codebases, keeping “Layer‑4 everywhere” a falsifiable promise.

### CAP-002 – Analysis Bridges
Automate symbol extraction, docstring reconciliation, dependency inference, and evidence harvesting so generated sections stay current and lintable. Normalise documentation across languages by projecting XML/TSDoc/Sphinx/Rustdoc tags into a canonical schema (`summary`, `remarks`, `parameters`, `typeParameters`, `returns`, `exceptions`, `examples`, `links`) rendered as deterministic `##### `Symbol` — Field` subsections. Preserve unmapped fragments with provenance so adapters can round-trip raw payloads while Live Docs stay structured. The analysis stack powers regeneration, emits provenance, and exposes confidence so downstream consumers can trust on-demand views ([specs/001-link-aware-diagnostics/spec.md](../../specs/001-link-aware-diagnostics/spec.md)).

### CAP-003 – On-Demand System Views
Expose ephemeral system-level materialized views—clustered components, workflows, coverage rollups—through CLI commands, diagnostics, and APIs. These views are regenerated when requested and never treated as long-lived documents, allowing us to mix rigorous statistics, local history, and scenario-specific filters without risking doc rot ([AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md](../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-29.md)). The flagship CLI experience traces dependency paths between arbitrary “from” and “to” artifacts (or walks to terminal roots when only one endpoint is provided) so impact analysis becomes a single command instead of a scavenger hunt across docs.

The same “from/to” pathfinding must also exist as a non-headless experience in the Explorer: a Local Map mode where maintainers can enter a `From` artifact and a `To` artifact and see the multi-hop path rendered (or clear “no connection” feedback) using the same underlying Live Doc graph facts as the CLI. The interaction model should remain minimal: pathfinding runs automatically (debounced) when both endpoints are valid, with no additional “Find Path” control beyond the inputs and the rendered result.

### CAP-004 – Governance & Memory
Keep stakeholder directives, MIT licensing posture, and competitive research (Windsurf Codemaps, GitLab Knowledge Graph) codified alongside the Live Doc tooling while enforcing guardrails (SlopCop, safe-commit, waiver taxonomies) that make the whole system auditable ([AI-Agent-Workspace/Notes/user-intent-census.md](../../AI-Agent-Workspace/Notes/user-intent-census.md)).

### CAP-005 – Layer Distribution Surfaces
Publish vision + roadmap knowledge to a static site (initially GitHub Pages), delegate requirement execution traceability to Spec-Kit and issue trackers, and keep System intelligence as CLI-driven materialized views. This capability ensures each MDMD layer lives where it provides the most value while the Layer‑4 corpus remains the canonical source of truth for generated analytics ([AI-Agent-Workspace/Notes/live-documentation-doc-refactor-plan.md](../../AI-Agent-Workspace/Notes/live-documentation-doc-refactor-plan.md)).

### CAP-006 – Generative Authoring & Docstring Bridges
Deliver a human-first documentation loop where Live Docs remain the canonical, reviewable AST for understanding code, and docstring bridges flow primarily **code → docs**. Analyzers harvest rich docstring payloads (including HTML blocks, custom tags, and examples) into canonical Live Doc sections, and diagnostics flag drift when inline documentation diverges from generated summaries or required fields are missing. Optional **docs → code** write-back (preview/apply) remains a deferred wishlist item: it may be explored behind strict feature flags and audit trails later, but it is not a near-term make-or-break dependency for Live Documentation’s core value ([AI-Agent-Workspace/ChatHistory/2025/11/2025-11-13.md](../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-13.md)).

### CAP-007 – Hosted Showcase & Trials
Deliver a stateless, Cloudflare-hosted showcase that clones public GitHub repositories, runs the existing Live Docs generator headlessly, and returns a downloadable bundle (markdown mirror, provenance metadata, replay instructions) so prospects can evaluate the system without installing the extension. The hosted surface is marketing-only: it never replaces the offline-first workflow, always links back to the local VS Code extension, and must highlight compatibility with VS Code forks like Windsurf and Cursor to reinforce multi-IDE reach. Instrument the flow with telemetry that proves workspaces are deleted immediately while preserving enough audit trails to troubleshoot demo failures ([AI-Agent-Workspace/ChatHistory/2025/11/2025-11-15.md](../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-15.md)).

### CAP-008 – Live Visualization Command Center
Deliver a unified `npm run live-docs:visualize` surface that merges the “circuit board” workspace view, the local symbol explorer, and the force-directed graph into a single command center grounded in Layer‑4 Live Docs. Maintainers should pan across file-level clusters, hover or click to expand a file into its public symbols, and optionally hide unrelated nodes to focus on inbound/outbound relationships. The detail panel must surface the relevant Live Doc metadata, provide “open in editor” affordances, and set the stage for future text editing so authors can scaffold code or docstrings bidirectionally. The visualization must stay in **data parity** with the headless Live Doc graph—no inferred edges or metadata beyond what Live Docs encode, and no omissions of symbol-level relationships once anchors are emitted—so CLI, diagnostics, and UI surfaces remain interchangeable views over the same facts. This primary view is expected to meet WCAG AA accessibility (keyboard navigation, high-contrast palettes, screen-reader announcements), while the force-directed explorer may prioritise spatial discovery over full accessibility. Requirements are captured across the 2025-11-20 Antigravity UX sessions ([AI-Agent-Workspace/ChatHistory/2025/11/Antigravity/11-20/83f976da-d7f4-4c75-a16d-561dfbea1a4b/Refining UI Interactions.md](../../AI-Agent-Workspace/ChatHistory/2025/11/Antigravity/11-20/83f976da-d7f4-4c75-a16d-561dfbea1a4b/Refining%20UI%20Interactions.md)).

The Local Map view is the natural home for non-headless inspection: it should be able to “sprawl” beyond the current one-hop neighbor columns when `From` and `To` are provided, rendering the hop-by-hop chain (including where paths join) as a readable impact narrative in the same window. The rendering updates automatically as `From`/`To` change so users can iteratively refine endpoints without leaving the view.
### ~~CAP-009 – LLM Enrichment (Extractive & Generative)~~ *(Descoped 2026-02-17)*

> **Rationale**: LLM integration removed from project scope; users bring their own AI assistants and consume Live Docs as structured context, eliminating trust, safety, and cost concerns from the tool itself.

~~Live Documentation distinguishes two complementary LLM tasks, both requiring explicit user invocation:~~

~~**Task A – Graph Edge Enrichment (Extractive)**: LLMs discover relationships that heuristic analyzers miss—semantic coupling, cross-file invariants, implicit contracts. These edges populate generated sections only after human promotion and must never run proactively in the background. The existing `LlmIngestionOrchestrator` and `LlmInvoker` infrastructure supports batch and interactive extraction, gated behind opt-in commands.~~

~~**Task B – Document Synthesis (Generative)**: LLMs transform statistical artifacts (System-layer clustered component docs, pending authored sections) into human-readable prose. System-layer docs are currently structurally correct but terse (co-activation p-values, Mermaid topologies, component lists) without meaningful `Purpose` or `Notes`. Synthesis fills `_Pending authored purpose_` placeholders while preserving deterministic generated sections. This capability is explicitly opt-in, budget-capped, and auditable—users invoke `live-docs synthesize` (CLI) or `Live Documentation: Synthesize Authored Section` (command) rather than expecting background enrichment.~~

~~Both tasks honour the same trust boundary: LLM outputs are staged, diff-previewed, and recorded with provenance before promotion. Runaway spend, hallucination propagation, and silent mutation are prevented by requiring explicit confirmation for every LLM-touched artifact ([AI-Agent-Workspace/ChatHistory/2026/01/2026-01-06.1.md](../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-06.1.md)).~~

### CAP-010 – Brownfield Documentation Integration
Live Documentation coexists with pre-existing markdown documentation in brownfield workspaces through a **"bridge, don't replace"** strategy:

**Read-Only Respect**: Existing docs (READMEs, architecture diagrams, design notes, ADRs) remain untouched and untracked by the Live Doc generator. They are never overwritten, migrated, or merged into the Live Doc corpus.

**Link-Driven Discovery**: Brownfield docs that link to Live Documentation (or are linked from it) become read-only graph citizens. The Force Graph visualisation renders them as peers alongside Live Docs, using distinct styling (dashed borders, muted palette) to signal their non-generated status.

**Layer Mapping**: Existing docs map conceptually to Layers 1–3 (Vision, Requirements, Architecture) and never to the Base/Source layer (Layer 4). This preserves the Live Doc generator's claim to canonical implementation truth while respecting legacy context.

**UI Simplification**: A single "Show Related Documentation" checkbox in the Force Graph view controls visibility of all link-connected markdown—System-layer docs, brownfield docs, chat history references, and any other markdown meeting the link criteria. This avoids a proliferation of toggles while giving maintainers discoverable context.

**Indexing Scope**: The exploration index may optionally ingest brownfield markdown (title, headings, first paragraph) so semantic search returns legacy context without violating read-only guarantees. This is additive and never destructive ([AI-Agent-Workspace/ChatHistory/2026/01/2026-01-06.1.md](../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-06.1.md)).
## Desired Outcomes
- Layer‑4 Live Docs regenerate deterministically; authored content stays small, intentional, and easy to review.
- ~~LLM enrichment (graph edges and document synthesis) remains explicitly opt-in with budget caps, diff previews, and audit trails; no background LLM calls occur without user initiation.~~ *(Descoped 2026-02-17)*
- Brownfield documentation coexists peacefully: existing markdown stays read-only, appears in the Force Graph when link-connected, and never competes with generated Live Docs for canonical status.
- Implementation Live Docs list their public surface, structured docstring fields, dependencies, and observed evidence so ripple impact and test coverage are auditable in markdown alone.
- Test and asset archetypes expose their relationships through generated sections (`Targets`, `Supporting Fixtures`, `Consumers`), enabling cross-language AST traversal without bespoke parsers.
- Ephemeral System views spin up from the Layer‑4 corpus on demand (markdown, JSON, graph exports) and can safely incorporate statistical analytics or local history without committing churn to the repo.
- Layer‑1 capabilities replicate cleanly into a static site (GitHub Pages or equivalent) so stakeholders consume the same markdown we curate in-repo.
- Hosted showcase runs reuse the exact generator stack, emit reproducible bundles, and always point participants back to local regeneration so offline workflows remain the authoritative path.
- Layer‑2 requirement docs cross-link to Spec-Kit tasks or issue trackers while remaining the authoritative summaries for automation.
- Diagnostics, exports, and AI-assistant prompts rely on the same markdown-as-AST graph, shrinking the gap between human review workflows and autonomous copilots.
- The Live Docs visualization command center unifies global file exploration with local symbol drilldowns, supports focus-mode filtering, and provides an accessible path toward inline editing and docstring scaffolding.
- Markdown links stay relative (slug dialect configurable) so Live Docs double as wiki-friendly artefacts consumers can publish directly.
- Tooling, instructions, and licensing remain MIT-friendly so adopters can regenerate Layer‑4 docs locally and opt into System analytics when needed.
- Structured docstring subsections provide anchored headers per field so diagnostics, prompts, and writers can target summaries, parameters, remarks, or examples without scraping prose.
- Docstring bridges harvest inline documentation into Live Docs and surface drift diagnostics; any future write-back remains explicitly opt-in and feature-flagged.
- Multi-IDE distribution (VS Code, Windsurf, Cursor, and future forks) stays first-class by ensuring commands, docs, and hosted showcases all document their compatibility and offline fallback steps.

## Downstream Requirements

### REQ-101 – Live Documentation Baseline
[Product roadmap – Layer 2 baseline](../layer-2/product-roadmap.mdmd.md) aligns authored templates, mirror directories, and consent workflows to CAP-001.

### REQ-201 – Generated Intelligence
[Product roadmap – analysis & evidence](../layer-2/product-roadmap.mdmd.md) and [spec Functional Requirements](../../specs/001-link-aware-diagnostics/spec.md#functional-requirements) cover symbol/docstring extraction, heuristics, and asset stubs for CAP-002.

### REQ-301 – Consumption & Enforcement
[Product roadmap – system intelligence surfaces](../layer-2/product-roadmap.mdmd.md) and [spec tasks](../../specs/001-link-aware-diagnostics/tasks.md) drive diagnostics, CLI, and lint integrations supporting CAP-003.

### REQ-401 – Ecosystem Enablement
[Product roadmap – governance & ecosystem](../layer-2/product-roadmap.mdmd.md) keeps competitive research, MIT licensing, and future feed integrations in view for CAP-004.

### REQ-501 – Layer Distribution Surfaces
[Product roadmap – layer distribution surfaces](../layer-2/product-roadmap.mdmd.md) captures the GitHub Pages scaffold, Spec-Kit integration, and on-demand System CLI expectations backing CAP-005.

### REQ-V1 – Live Visualization Command Center
[Product roadmap – visualization command center](../layer-2/product-roadmap.mdmd.md#reqv1-live-visualization-command-center) details the merged circuit-board/local explorer requirements, accessibility milestones, and CLI alignment needed to satisfy CAP-008.

### REQ-H1 – Hosted Showcase Pipeline
[Product roadmap – hosted showcase pipeline](../layer-2/product-roadmap.mdmd.md#reqh1-hosted-showcase-pipeline) details the Cloudflare marketing surface, CI/CD guardrails, telemetry, and deletion guarantees required to satisfy CAP-007 without compromising the offline-first promise.

## Success Signals
- ≥95% of modified source files have Live Docs regenerated within the same verify run, and all generated sections hash-match local analyser output (SC-LD-001).
- No Live Doc ships without observed evidence or an approved waiver, cutting undocumented implementations by 80% during pilot audits (SC-LD-002).
- On-demand System exports flag architectural hotspots (coverage gaps, cluster outliers) in ≤2 s for repositories under 10k files without writing permanent files (SC-LD-003).
- External adopters can enable the Live Documentation extension, regenerate Layer‑4 docs, and run System analytics locally thanks to MIT licensing and deterministic pipelines (SC-LD-004).
- Structured docstring bridges surface multi-tag payloads (summary, remarks, parameters, returns, exceptions) in ≥95% of regenerated Live Docs for supported languages, with unmapped tags logged for follow-up (SC-LD-005).
- Docstring drift diagnostics ship in read-only mode, remain deterministic across fixtures, and any future write-back stays feature-flagged and explicitly opt-in (SC-LD-006).
- The visualization command center meets WCAG AA contrast and keyboard-navigation checks, resolves focus-mode filtering within two interactions, and launches local-symbol detail panels in ≤500 ms for repos under 5k files (SC-LD-007).
- The Explorer Local Map can render multi-hop dependency paths between a user-specified `From` and `To` using the same hop semantics as `live-docs inspect`, and reports “no connection” deterministically when paths do not exist (SC-LD-008).

## Evidence
- Integration suites validate Live Docs generation, polyglot analysis, and inspect CLI path-finding ([tests/integration](/tests/integration)).
- Live Docs CLI provides generation, linting, and inspection commands (`live-docs:generate`, `live-docs:lint`, `live-docs:inspect`).
- SlopCop markdown lint runs inside the safe-to-commit gate, blocking hallucinated links before commit ([scripts/slopcop/check-markdown-links.ts](/scripts/slopcop/check-markdown-links.ts)).
- Layer 3 and 4 MDMD catalogues—now Live Docs themselves—document runtime and analysis flows that feed CAP-001 through CAP-003.

## Target Personas
- **Implementers**: engineers expect Live Docs to show programmatic surface, dependents, and tests before accepting Copilot suggestions or merging a PR.
- **Test Authors**: quality engineers rely on test Live Docs to declare coverage scope and fixture responsibilities without spelunking large suites.
- **Writers and Architects**: documentation owners edit a concise authored block while trusting generated sections to reflect the latest code reality.
- **Leads and Reviewers**: reviewers pull Live Docs and CLI summaries to gauge blast radius and evidence before approving changes.

## Guiding Principles
1. **Markdown as AST** – treat Layer‑4 markdown links, headings, and sections as the canonical graph; analyzers refresh markdown, not bespoke caches.
2. **Workspace Local First** – run entirely on developer machines, keeping data private and reproducible; remote feeds remain optional accelerators and hosted showcases are explicitly positioned as marketing trials that always link back to local workflows (VS Code, Windsurf, Cursor, and other forks).
3. **Generated Blocks are Sacred** – tooling owns generated sections; humans curate authored notes and waivers with discipline.
4. **Evidence or Escalation** – every implementation must link to proof, or record a waiver explaining the gap.
5. **Shareable by Default** – Live Docs, CLI exports, hosted showcase bundles, and MIT licensing keep artefacts portable across GitHub, Azure DevOps, and other wiki surfaces.
6. **System Views are Materialized** – architecture/topology views are regenerated when needed and never treated as permanent docs, freeing analytics to evolve without churn.
7. **Continuous Falsifiability** – benchmarks, integration suites, and SlopCop rules back every guarantee with repeatable tests.
8. **Authoring Loops Stay Human-First** – any write-back to code or docstrings (if/when explored) requires explicit human confirmation and audit trails so Live Docs never silently rewrite source files.
9. **Accessibility Guides Trust** – visualization surfaces prioritise keyboard access, focus management, and contrast so Live Docs remain inclusive even as discovery-focused views (force graph) experiment with richer spatial affordances.

## Scope and Non Goals
- **In scope**: Live Documentation VS Code extension, language server pipelines, markdown graph builder, docstring bridges, diagnostics and CLI exports, MIT license preparation.
- **Out of scope (current spec)**: IDE-agnostic clients, automated remediation, CI enforcement beyond safe-commit, hosted SaaS offerings, non-configurable storage locations.

## Evolution Path
- **Live Doc Baseline (present)**: converge MDMD Layer‑4 docs onto authored/generated structure and stage generator output in `/.live-documentation/`.
- **Docstring & Evidence Bridges (near term)**: wire analyzers and coverage tools so generated sections stay accurate across languages and test suites. Canonicalise docstring tags into the shared schema, emit deterministic per-field subheadings, validate against curated polyglot fixtures, and surface drift diagnostics when inline documentation diverges from Live Doc narratives.
- **Optional Authoring (wishlist)**: explore docstring round-trip preview/apply and scaffolding behind strict feature flags and audit trails, without making docs → code a dependency for the core “map + freshness engine”.
- **Consumption Surfaces (near term)**: deliver CLI, diagnostics, and AI-assistant-consumable exports backed by the Live Doc graph.
- **Layer Distribution (mid term)**: stand up the public site pipeline, formalise Spec-Kit/issue tracker delegation for Layer 2, and ship the on-demand System CLI so no architecture docs linger in the repo.
- **Metadata Enrichers (mid term)**: add churn metrics, reference counts, and change history as optional generated sections; experiment with higher-layer docs (releases, work items, architecture) generated from Layer‑4 facts.
- ~~**LLM Synthesis (mid term)**: offer opt-in commands that transform statistical System-layer artifacts into human-readable prose, filling `_Pending authored purpose_` placeholders while preserving deterministic generated sections.~~ *(Descoped 2026-02-17)*
- **Brownfield Bridge (mid term)**: extend the Force Graph to render link-connected external markdown as read-only graph citizens, with optional semantic indexing for discovery.
- **Ecosystem Expansion (long term)**: share MIT-licensed tooling, integrate alternative knowledge feeds, and explore IDE-agnostic adapters.

## Adoption Path
- **Stage 0 – Observe**: bootstrap Live Docs from existing MDMD content, allow read-only exploration, and collect feedback.
- **Stage 1 – Guard**: enable lint warnings for missing evidence or stale generated sections; provide regeneration commands in safe-commit.
- **Stage 2 – Bridge**: enforce docstring and coverage sync, introduce CLI and AI-assistant-consumable exports, and activate diagnostics sourced from Live Docs.
- **Stage 3 – Sustain**: require green Live Doc gates before merge; external adopters configure storage and regen workflows mirroring ours.
- **Stage 4 – Distribute**: publish Layer 1 to the public site, keep Layer 2 synced with Spec-Kit/issue trackers, and rely on CLI materialized views for System intelligence.

## Open Questions
- What UX affordances best expose ripple metadata without overwhelming users? (Tracked in T042 roadmap.)
- How should we prioritise future feed integrations such as LSIF, SCIP, or GitLab knowledge graphs under the offline-first stance?
- What rollout messaging best guides adopters through the public-site pipeline and Layer 2 integration handoff?
- When Copilot suggests a change, how do we feed Live Doc awareness back into the suggestion pipeline without impacting latency?
- What is the minimal metadata set required for binary assets so generated sections stay useful without bloating the repo?

## Implementation Touchpoints
- [Live Documentation Generator](../layer-3/live-documentation-pipeline.mdmd.md) orchestrates polyglot analyzers, docstring bridges, and markdown emitters to refresh generated sections.
- [Diagnostics Tree View](../../.mdmd/layer-4/packages/extension/src/views/diagnosticsTree.ts.mdmd.md) and [Export Diagnostics Command](../../.mdmd/layer-4/packages/extension/src/commands/exportDiagnostics.ts.mdmd.md) consume Live Docs for impact analysis.
- [SlopCop Markdown Audit](../../.mdmd/layer-4/scripts/slopcop/check-markdown-links.ts.mdmd.md) and Live Doc lint rules enforce authored/generated boundaries and evidence guarantees.

## Code Anchors
- [`packages/server/src/main.ts`](../../packages/server/src/main.ts) bootstraps the stateless language server runtime.
- [`scripts/live-docs/generate.ts`](../../scripts/live-docs/generate.ts) coordinates polyglot analyzers that populate generated sections.
- [`scripts/live-docs/lint.ts`](../../scripts/live-docs/lint.ts) validates Live Doc structure and link integrity to uphold the "definitive answer" promise.
