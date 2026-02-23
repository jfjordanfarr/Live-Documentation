# Feature Specification: Live Documentation

## Metadata

- Layer: 2
- Requirement IDs: FR-LD1–FR-LD18, SC-LD1–SC-LD15
- Provenance: Migrated from `specs/001-link-aware-diagnostics/spec.md` on 2026-02-23

## Purpose

Define the formal functional requirements, success criteria, and acceptance scenarios for Live Documentation. This document complements the [Product Roadmap](product-roadmap.mdmd.md), which organises requirements into streams and stages. Here the same requirements appear as atomic, testable statements.

## Current Vision

Live Documentation mirrors each tracked asset into the configured base layer, giving it an authored preamble plus deterministic generated metadata. Diagnostics, CLI exports, and copilots consume the same markdown graph. System-level views are generated on demand. The system is deliberately LLM-free: users bring their own AI assistants and consume Live Docs as structured context.

---

## User Stories & Acceptance Scenarios

### US-1 Authors Curate Live Documentation Headers (P1 — Complete)

Maintainers open a Live Doc, edit the authored `Purpose` or `Notes`, and regenerate generated sections without losing manual context.

**Acceptance Scenarios**:

1. **Given** a Live Doc with authored notes, **When** regeneration runs, **Then** generated sections refresh while authored markdown is unchanged byte-for-byte.
2. **Given** a Live Doc stored outside the repository (custom path), **When** regeneration runs, **Then** the output path honours configuration and maintains mirror structure.
3. **Given** an attempt to remove the `Metadata` or `Authored` headings, **When** safe-commit executes, **Then** lint fails with actionable guidance.

### US-2 Generated Sections Stay in Sync (P1 — Complete)

Developers run regeneration; the generator updates `Public Symbols`, `Dependencies`, and archetype-specific sections deterministically.

**Acceptance Scenarios**:

1. **Given** a TypeScript module with new exports, **When** regeneration runs, **Then** the Live Doc lists the new symbol with structured docstring fields rendered under deterministic `##### Symbol — Field` subheadings.
2. **Given** an HTML template referencing an image, **When** regeneration runs, **Then** the asset Live Doc lists the template under `Consumers`.
3. **Given** a test covering multiple implementations, **When** regeneration runs, **Then** the test Live Doc lists all targets; removing a target triggers a diff and lint warning.
4. **Given** a C# member documented with XML tags, **When** regeneration runs, **Then** the Live Doc emits one anchored subsection per tag with normalized text and `_Not documented_` placeholders for missing tags.

### US-3 Teams Consume Live Doc Intelligence On Demand (P2 — Complete MVP)

Leads export impact reports, Copilot prompts, or diagnostics sourced from the Live Doc graph. System analytics remain ephemeral.

**Acceptance Scenarios**:

1. **Given** a Live Doc with a broken relative link, **When** `live-docs:lint` runs, **Then** a Problem entry appears in the Problems panel.
2. **Given** a CLI command `live-docs inspect --from A --to B`, **When** executed, **Then** it emits a deterministic hop-by-hop narrative showing the dependency path.
3. **Given** a CLI command `live-docs inspect --from A`, **When** executed, **Then** it walks toward the nearest terminal roots and reports the chain.
4. **Given** `live-docs system --cluster <id>`, **When** executed, **Then** it streams analytics to stdout and leaves `.live-documentation/system/` unchanged.

### US-4 Evidence Gaps Trigger Escalation (P3 — Planned)

When evidence sections are empty without waivers, lint and diagnostics escalate the gap.

**Acceptance Scenarios**:

1. **Given** an implementation Live Doc without tests, **When** regeneration runs, **Then** Evidence reads `_No automated evidence found_` and safe-commit fails unless a waiver exists.
2. **Given** a waiver comment, **When** lint runs, **Then** it passes while logging the waiver.
3. **Given** new tests added, **When** regeneration reruns, **Then** Evidence lists the tests and the warning clears.

### ~~US-5 Legacy Graph Workflows~~ _(Descoped 2026-02-18)_

Reactive diagnostics subsystem removed. CLI `live-docs:inspect` and Explorer Local Map now serve all change-impact analysis.

### US-6 Layer Distribution Surfaces (P2 — Planned)

Layer 1 publishes externally, Layer 2 reconciles with issue trackers, System analytics remain ephemeral.

**Acceptance Scenarios**:

1. **Given** the Layer 1 markdown corpus, **When** the static site workflow runs, **Then** it publishes updated pages with no broken links.
2. **Given** a Layer 2 requirement linked to Spec-Kit tasks, **When** safe-commit executes, **Then** mismatches appear in the snapshot with actionable diffs.
3. **Given** `npm run live-docs:system`, **When** targeting a messy fixture, **Then** the CLI flags debt and `.live-documentation/system/` remains empty.

### US-7 Writers Monitor Docstrings & Draft Changes (P3 — Planned)

Authors treat Live Docs as canonical AST for documentation. Drift diagnostics surface when inline docstrings diverge.

**Acceptance Scenarios**:

1. **Given** a Live Doc edit changing summary and parameters, **When** verification runs, **Then** drift is reported with symbol/field-level pointers; no tracked files are mutated.
2. **Given** docstrings containing unsupported tags, **When** regeneration runs, **Then** unmapped fragments are preserved as `rawFragments` with provenance.

### US-8 Hosted Showcase Trials (P2 — Planned)

Prospective adopters visit a hosted site, enter a public GitHub repo reference, and receive a downloadable bundle.

**Acceptance Scenarios**:

1. **Given** a public GitHub repo reference, **When** the showcase runs, **Then** it clones, generates, bundles (Live Docs + README + prompt guide), and returns the zip.
2. **Given** a downloaded bundle, **When** the user follows the README, **Then** they can inspect Live Docs locally and replay prompts.
3. **Given** the hosted runner completes, **When** telemetry is inspected, **Then** temporary clones are deleted within TTL and no private repos were accepted.

### US-9 Visualize Live Docs in a Command Center (P1 — Complete MVP)

Explorer ships Circuit Board, Local Map, and Force Graph views. Local Map From/To pathfinding uses the same hop semantics as the CLI.

**Acceptance Scenarios**:

1. **Given** a node on the circuit-board view, **When** focus mode activates, **Then** unrelated nodes hide and the detail panel lists public symbols with "open in editor" affordances.
2. **Given** a node selected across views, **When** the user switches views, **Then** selection state and detail panel persist.
3. **Given** keyboard/screen reader navigation, **When** tabbing through the explorer, **Then** focus order is logical and WCAG AA contrast checks pass.
4. **Given** a `From` and `To` artifact in Local Map, **When** both endpoints are valid, **Then** pathfinding auto-runs (debounced) and renders the multi-hop chain.
5. **Given** two artifacts with no connection, **When** pathfinding runs, **Then** the UI reports "no connection" deterministically.

### ~~US-10 LLM Enrichment~~ _(Descoped 2026-02-17)_

LLM integration removed from project scope. Users bring their own AI assistants.

### US-11 Brownfield Documentation Integration (P2 — Partially Complete)

Existing markdown coexists peacefully; link-connected brownfield docs appear in the Force Graph as read-only nodes.

**Acceptance Scenarios**:

1. **Given** a brownfield workspace, **When** `live-docs:generate` runs, **Then** no brownfield files are modified.
2. **Given** a brownfield doc linking to a Live Doc, **When** Force Graph loads with "Show Related Documentation", **Then** the brownfield doc appears with distinct styling.

---

## Functional Requirements

- **FR-LD1**: Generator MUST create/refresh Live Docs under a configurable root, preserving authored sections and updating generated sections with deterministic output guarded by HTML markers.
- **FR-LD2**: Generator MUST emit `Public Symbols`, `Dependencies`, and archetype-specific sections using analyzer output and coverage data.
- **FR-LD3**: Regeneration MUST record provenance metadata (analyzer id, timestamp, benchmark hash) within generated blocks.
- **FR-LD4**: Safe-commit MUST lint Live Docs for structural completeness, analyzer parity, and evidence presence, failing when violations occur unless waivers are present.
- **FR-LD5**: Diagnostics, CLI, and Copilot surfaces MUST consume Live Docs as their single source of truth; `live-docs inspect` MUST support `--from/--to` path discovery plus single-endpoint root tracing.
- **FR-LD6**: Docstring bridges MUST reconcile inline documentation with Live Doc summaries, map multi-tag payloads into a canonical schema, render deterministic subheadings, retain provenance for unmapped fragments, and raise drift diagnostics.
- **FR-LD7**: Migration tooling MUST compare existing Layer-4 docs to generated Live Docs, producing diff reports and updating references once parity is confirmed.
- ~~**FR-LD8**: LLM augmentations.~~ _(Descoped 2026-02-17.)_
- **FR-LD9**: Telemetry MUST report regeneration latency, evidence coverage rates, and waiver counts.
- **FR-LD10**: Configuration MUST expose glob patterns, archetype overrides, and storage paths while remaining version-controlled.
- **FR-LD11**: Generated Live Docs MUST emit workspace-relative markdown links and enforce header slugs according to the configured dialect.
- **FR-LD12**: System analytics MUST default to ephemeral outputs and require explicit confirmation before writing tracked files.
- **FR-LD13**: Layer distribution tooling MUST publish Layer 1 via a static site, reconcile Layer 2 with issue trackers, and keep System analytics as CLI materialized views.
- **FR-LD14**: Docstring tooling MUST surface drift diagnostics and preserve provenance. Any future write-back MUST remain feature-flagged, confirmed, and auditable.
- **FR-LD15**: Hosted showcase pipeline MUST reuse the standard generator, emit provenance metadata, produce a downloadable bundle, and delete cloned data immediately.
- **FR-LD16**: Visualization command center MUST merge views into a single UI, maintain state across views, expose "open in editor", provide focus-mode, satisfy WCAG AA, and distinguish inbound vs outbound relationships.
- ~~**FR-LD17**: LLM enrichment.~~ _(Descoped 2026-02-17.)_
- **FR-LD18**: Brownfield integration MUST leave existing markdown unchanged, render link-connected brownfield docs in Force Graph with distinct styling, and provide a single visibility toggle.

---

## Success Criteria

- **SC-LD1**: ≥95% of modified source files have Live Docs regenerated within a single `safe:commit` run; structural lint reports zero missing sections.
- **SC-LD2**: Analyzer precision/recall stays ≥0.9 for exported symbols and ≥0.8 for dependencies across supported languages.
- **SC-LD3**: 100% of implementation Live Docs list evidence or waivers; unresolved gaps trigger lint warnings within 24 hours.
- **SC-LD4**: Diagnostics and CLI exports respond within ≤2 s for repositories under 10k files.
- **SC-LD5**: External adopters regenerate Live Docs from scratch using documented commands, pass safe-commit, and report successful onboarding within one day.
- **SC-LD6**: Docstring drift diagnostics resolve within one regeneration cycle during integration tests.
- **SC-LD7**: Relative-link lint reports zero violations after regeneration.
- **SC-LD8**: System analytics leave no tracked artefacts by default and finish within ≤2 s for repos under 10k files.
- **SC-LD9**: Static site builds publish Layer 1 without broken links; Layer 2 stays in sync with issue trackers.
- **SC-LD10**: Structured docstring bridges populate canonical subsections for ≥95% of documented public symbols.
- **SC-LD11**: Docstring drift diagnostics cover ≥95% of documented public symbols; any future write-back remains opt-in.
- **SC-LD12**: Hosted showcase runs finish within ≤3 minutes for repos under 5k files, emit reproducible bundles, and delete clones within 60 seconds.
- **SC-LD13**: Visualization focus-mode interactions resolve within two steps; WCAG AA checks pass; detail panels render within ≤500 ms.
- ~~**SC-LD14**: LLM enrichment.~~ _(Descoped 2026-02-17.)_
- **SC-LD15**: Brownfield documentation remains unchanged after generation; link-connected docs appear in Force Graph with distinct styling.

---

## Edge Cases

- Newly created files without exports receive stub Live Docs; generated sections display `_No data available_`.
- Live Docs remain stable when files move or are renamed; migration scripts update references.
- Rapid edits triggering regeneration must coalesce; generated blocks only change when analyzer output differs.
- Tests spanning many implementations should not bloat Live Docs; backlinks flow through the graph.
- Analyzer failures mid-run must not overwrite existing generated sections; provenance markers flag stale data.
- Safe-commit must continue to run offline.
- System analytics should never leave tracked files by default.
- Static site publishing and Spec-Kit syncing remain optional per workspace.
- Docstring bridges must degrade gracefully for unsupported tags; provenance captures raw XML and displays `_Not documented_` placeholders.
- Hosted showcase runs accept only public repositories and enforce size/time limits.

## Live Doc Generation Lifecycle

1. **Staging**: Regeneration writes to the configured base layer, preserving authored sections.
2. **Validation**: Safe-commit runs structural lint, analyzer parity checks, and evidence audits.
3. **Authoring Loop**: Feature-flagged tooling compares authored edits with inline docstrings (deferred).
4. **Promotion**: Once parity is proven, configuration flips to treat Live Docs as canonical.
5. **Consumption**: Diagnostics, CLI, and Copilot exports read directly from Live Docs; System analytics regenerate on demand.

## Key Entities

- **Live Doc Artifact**: Markdown file containing Metadata, Authored, and Generated sections for a single source asset.
- **Analyzer Output**: Structured description of symbols, dependencies, and coverage; includes hash for determinism.
- **Evidence Item**: Test, benchmark, or manual review that exercises an implementation artifact.
- **Waiver Record**: Justification for temporarily accepting missing evidence; references owner and expiry.
- **Consumption Surface**: Diagnostics, CLI, Copilot prompt, or report derived from Live Docs.

## Assumptions

- Existing Layer-4 docs remain authoritative until Live Docs pass acceptance benchmarks.
- Regeneration runs locally without internet access.
- Analyzer plugins are authored in TypeScript; polyglot coverage is staged via CLI bridges.
- Teams tolerate short regeneration windows (≤30 s for 5k-file repos).
- External adopters expect MIT-licensed, CLI-first workflows compatible with VS Code forks.

## Upcoming Work Items

See [Feature Backlog](work-items/feature-backlog.mdmd.md) for the full task breakdown. Key work items:

- **WI-LD101** – Finish generator CLI (diff views, dry run) and adoption playbook.
- **WI-LD102** – Coverage ingestion pipeline for `Observed Evidence`.
- **WI-LD201** – Docstring bridge adapters (TypeScript, Python, C#).
- **WI-LD202** – Polyglot fixture workspaces and per-language benchmarks.
- **WI-LD304** – Visualization command center consolidation.
- **WI-LD401** – Sample workspace and MIT-licensed release notes.
- **WI-LD501** – System analytics CLI.
- **WI-LD601** – Layer distribution surfaces.
- **WI-LD701** – Hosted showcase pipeline.
- **WI-LD1101** – Brownfield documentation integration.
