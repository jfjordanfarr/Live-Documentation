# Falsifiability Requirements for Live Documentation

## Metadata
- Layer: 2
- Requirement IDs: REQ-F1, REQ-F2, REQ-F3, REQ-F4, REQ-F5, REQ-F6, REQ-F7, REQ-F8, REQ-F9

## Requirements

### REQ-F1 Live Doc Structural Integrity
Guarantee CAP-001: every Live Doc contains the mandated `Metadata`, `Authored`, and `Generated` sections with proper markers so automation can regenerate content safely.

#### REQ-F1 Criteria
- Safe-commit fails when a Live Doc misses required sections, headings, or generated markers.
- HTML comment markers `<!-- LIVE-DOC:BEGIN ... -->` / `<!-- LIVE-DOC:END ... -->` are present and non-overlapping for each generated block.
- Authored subsections (`Description`, `Purpose`, `Notes`) remain editable while generated subsections remain untouched outside automation.

### REQ-F2 Generated Section Determinism
Guarantee CAP-002: regenerated `Public Symbols`, `Dependencies`, and archetype metadata (Evidence/Targets/Consumers) match analyzer output for the current workspace state.

#### REQ-F2 Criteria
- Regeneration CLI produces deterministic hashes for generated blocks; diffs are limited to analyzer changes.
- Benchmarks assert ≥0.9 precision/recall for exported symbols and ≥0.8 for dependencies across supported languages.
- Generated sections include provenance metadata (analyzer name, timestamp) so drift can be audited.

### REQ-F3 Evidence & Coverage Accountability
Guarantee CAP-002 and CAP-003: every implementation Live Doc references tests, benchmarks, or waivers, while test Live Docs declare their targets.

#### REQ-F3 Criteria
- `Observed Evidence` sections list all tests or benchmarks covering the implementation; empty sections require a `<!-- evidence-waived: ... -->` comment and a note in the authored block.
- Test Live Docs populate `Targets` and `Supporting Fixtures`; empty lists must use `_No targets recorded yet_` placeholders and trigger lint warnings.
- Integration tests confirm evidence mapping for unit, integration, and benchmark flows.

### REQ-F4 Live Doc Diagnostics and Exports
Guarantee CAP-003: diagnostics, tree views, CLI exports, and narratives source their data from the Live Doc graph while treating System analytics as on-demand materialized views.

#### REQ-F4 Criteria
- Diagnostics providers emit Live Doc links and metadata (generated timestamp, evidence count) in messages.
- CLI exports rebuild narratives exclusively from Live Docs without reaching into bespoke caches.
- System analytics commands stream results to stdout or temporary folders unless a caller explicitly opts into persistence.
- Regression tests compare CLI/diagnostic output before and after regeneration to ensure parity.
- Visualization command center smoke tests validate that every edge, symbol anchor, and directional cue rendered in the UI maps back to the underlying Live Doc graph payloads so the surface never diverges from headless facts.

### REQ-F5 Markdown & Asset Integrity Gate
Guarantee CAP-001 and CAP-004: SlopCop audits remain the first defense, ensuring Live Docs and supporting markdown stay link-accurate and asset-complete.

#### REQ-F5 Criteria
- SlopCop markdown, asset, and symbol audits block safe-commit when Live Docs reference missing files or anchors.
- Markdown lint enforces workspace-relative links and validates header slugs against the configured dialect (GitHub by default); absolute links require explicit waivers.
- Asset audit covers HTML/CSS references introduced by Live Doc consumption surfaces.
- Symbol lint escalates from heading validation to analyzer-backed export verification as language oracles mature.

### REQ-F6 Docstring Bridge Drift Detection
Guarantee CAP-002 and CAP-003: docstring bridges remain truthful by reconciling inline documentation with Live Doc generated summaries.

#### REQ-F6 Criteria
- Docstring bridge CLI compares inline docstrings against generated `Public Symbols` entries and raises drift diagnostics within a single regen cycle.
- Safe-commit fails when drift counts exceed zero, unless waivers are recorded in the authored block.
- Integration fixtures exercise positive/negative drift scenarios across TypeScript, Python, and C# examples.

### REQ-F7 System View Ephemerality
Guarantee CAP-003: System-level analytics (clusters, workflows, coverage rollups) remain ephemeral outputs derived from Layer‑4 Live Docs and never accumulate as stale tracked artefacts.

#### REQ-F7 Criteria
- System view generators accept explicit output targets; the default mode writes to stdout or temporary directories managed by the CLI.
- Lint and safe-commit fail when `.live-documentation/system/` contains files the generator did not mark as persisted artifacts.
- Integration fixtures simulate “messy” workspaces and assert that System analytics highlight architectural debt without requiring repo commits.

### REQ-F8 Layer Distribution Hygiene
Guarantee CAP-005: Layer 1 capabilities, Layer 2 requirements, and System materialized views stay aligned with their target surfaces (static site, Spec-Kit/issue trackers, CLI outputs) without manual drift.

#### REQ-F8 Criteria
- Static site builds sourced from `.mdmd/layer-1` succeed with zero broken links; failures block safe-commit.
- Layer 2 requirements document Spec-Kit/task IDs in `### Integration`, and automated snapshots flag mismatches between markdown checkboxes and external state.
- System analytics CLI leaves `.live-documentation/system/` empty unless a persistence flag is passed, and lint catches stray materialized files lacking the `live-docs:materialized` marker.

### REQ-F9 Bidirectional Authoring Safeguards
Guarantee CAP-006: any future feature-flagged authoring loops (docs → code write-back or scaffolding) remain explicitly opt-in and cannot silently mutate tracked source files.

#### REQ-F9 Criteria
- Preview/apply workflows render human-readable diffs before any docstring mutation and require explicit confirmation from the caller (CLI or VS Code command).
- Each applied update records provenance (initiator, timestamp, affected symbols, feature flag state) and persists telemetry to `reports/benchmarks/live-docs/roundtrip.json`.
- Generative scaffolding commands emit drafts into scratch directories (`AI-Agent-Workspace/tmp/**`) that reference their source Live Documentation files and never create or modify tracked files during execution.
- Feature flags default to read-only; switching to apply mode is gated behind workspace configuration and safe-commit verifies the flag state before allowing automated runs.

## Acceptance Criteria and Verification

### REQ-F1 Verification
- Live Doc structure unit tests (`liveDocumentationStructure.test.ts`) validate section ordering, marker placement, and authored block protection.
- Safe-commit logs demonstrate lint failures when markers are missing or edited manually.

### REQ-F2 Verification
- Language-specific benchmark suites (AST accuracy, fallback heuristics) report precision/recall thresholds after regeneration.
- `npm run live-docs:generate -- --verify` compares generated sections against analyzer output hashes.

### REQ-F3 Verification
- Integration suites (`tests/integration/live-docs/evidenceMapping.test.ts`) validate Observed Evidence and Target sections across sample workspaces.
- Coverage reports consumed by the generator (`coverage/extension/`) feed snapshot tests ensuring evidence attribution stays correct.

- Diagnostics integration suites (US1–US5) assert that messages include Live Doc links and metadata.
- CLI snapshot tests (`scripts/live-docs/inspect.test.ts`) confirm narrative output matches Live Doc content.
- System analytics smoke tests assert that temporary outputs are removed after command completion unless persistence is requested.

### REQ-F5 Verification
- Safe-commit transcripts show markdown/asset/symbol lint failures blocking merges when Live Docs drift.
- Asset fixtures under `tests/integration/fixtures/slopcop-assets` cover binary and static resource references consumed by Live Docs.

### REQ-F6 Verification
- Docstring drift integration suites (`tests/integration/live-docs/docstringBridge.test.ts`) fail when Live Docs and inline comments diverge.
- Unit tests for bridge adapters (TypeScript, Python, C#) assert mismatch detection thresholds and waiver handling.
- Safe-commit run with `npm run live-docs:verify-docstrings` reports zero unchecked drifts before completion.

### REQ-F9 Verification
- Round-trip integration suite (`tests/integration/live-docs/docstring-roundtrip.test.ts`) replays markdown edits through preview/apply commands and asserts docstrings update only after confirmation.
- Telemetry snapshots (`reports/benchmarks/live-docs/roundtrip.json`) record provenance for simulated apply flows; falsifiability checks fail when entries are missing or malformed.
- Scaffolding smoke tests ensure `scripts/live-docs/scaffold.ts` outputs drafts exclusively to `AI-Agent-Workspace/tmp/**` and leaves the tracked tree untouched.

### REQ-F7 Verification
- CLI regression tests assert that running `npm run live-docs:system -- --output stdout` leaves the workspace clean and pipes analytics to the console.
- Safe-commit detects unexpected files under `.live-documentation/system/` and blocks merges until they are removed or explicitly whitelisted.
- Integration fixtures compare successive analytics runs to ensure outputs change only when underlying Layer‑4 docs change.

### REQ-F8 Verification
- Static site preview builds sourced from `.mdmd/layer-1` (local `npm run live-docs:site -- --check-links` and the GitHub Pages CI job) fail on broken links or missing required sections, preventing safe-commit completion until the issues are fixed.
- Spec-Kit sync tests compare `.mdmd/layer-2` `### Integration` checkboxes against `specs/` and task tracker snapshots, flagging mismatches inside the falsifiability suite.
- System analytics lint (`npm run live-docs:system -- --check-materialized`) ensures `.live-documentation/system/` stays empty unless a persistence flag is passed, and safe-commit treats stray artefacts without the `live-docs:materialized` marker as failures.

## Linked Components

### COMP-004 SlopCop Tooling
Supports REQ-F1, REQ-F3, and REQ-F5. [SlopCop Architecture](../layer-3/slopcop.mdmd.md)

### COMP-005 Edge Aggregation Pipeline
Supports REQ-F2 and REQ-F6. [Edge Aggregation Pipeline Architecture](../layer-3/edge-aggregation-pipeline.mdmd.md)

### COMP-009 Falsifiability Suites
Supports all falsifiability requirements. [Ripple Falsifiability Suite](../layer-3/falsifiability/ripple-falsifiability-suite.mdmd.md)

## Linked Implementations

### IMP-201 slopcopMarkdownLinks CLI
Supports REQ-F1 and REQ-F5. [SlopCop Markdown Audit](../../.mdmd/layer-4/scripts/slopcop/check-markdown-links.ts.mdmd.md)

### IMP-202 slopcopAssetPaths CLI
Supports REQ-F5. [SlopCop Asset Audit](../../.mdmd/layer-4/scripts/slopcop/check-asset-paths.ts.mdmd.md)

### IMP-204 slopcopSymbols CLI
Supports REQ-F5. [SlopCop Symbol References](../../.mdmd/layer-4/scripts/slopcop/check-symbols.ts.mdmd.md)

### IMP-103 liveDocsLint
Supports REQ-F2, REQ-F3, and REQ-F4. [Live Docs Lint CLI](../../.mdmd/layer-4/scripts/live-docs/lint.ts.mdmd.md)

### IMP-310 liveDocumentationGenerator
Supports REQ-F1 and REQ-F2. [Live Docs Generate CLI](../../.mdmd/layer-4/scripts/live-docs/generate.ts.mdmd.md)

### IMP-410 docstringBridgeAdapters
Supports REQ-F6. [Polyglot Adapters](../../.mdmd/layer-4/packages/shared/src/live-docs/adapters/)

## Evidence
- Safe-to-commit logs (2025-11-08) capture Live Doc structural lint failures resolved after instruction updates.
- Benchmark reports and regeneration diffs stored in `reports/benchmarks` demonstrate analyzer determinism.
- Docstring bridge spikes recorded in `AI-Agent-Workspace/Notes/live-documentation-doc-refactor-plan.md` note outstanding verification work.

## Open Dependencies
- Add integration coverage for rename/move flows impacting Live Docs and ensure waivers propagate downstream.
- Expand knowledge feed bootstrap fixtures with docstring bridge data and evidence mapping.
- Finalise waiver taxonomy (evidence, docstring, asset) before enforcing higher lint severities.

## Implementation Alignment
- [FeedCheckpointStore](../../.mdmd/layer-4/packages/server/src/features/knowledge/feedCheckpointStore.ts.mdmd.md) and [FeedDiagnosticsGateway](../../.mdmd/layer-4/packages/server/src/features/knowledge/feedDiagnosticsGateway.ts.mdmd.md) keep analyzer results and docstring bridge state consistent for REQ-F2 and REQ-F6.
- [Dependency Quick Pick](../../.mdmd/layer-4/packages/extension/src/diagnostics/dependencyQuickPick.ts.mdmd.md) consumes Live Doc metadata to satisfy REQ-F4.
- [Fallback Inference](../../.mdmd/layer-4/packages/shared/src/inference/fallbackInference.ts.mdmd.md) and [Link Inference Orchestrator](../../.mdmd/layer-4/packages/shared/src/inference/linkInference.ts.mdmd.md) supply the analyzer inputs verified by these falsifiability tests.
- SlopCop tooling docs (`slopcopMarkdownLinks.mdmd.md`, `slopcopAssetPaths.mdmd.md`, `slopcopSymbolReferences.mdmd.md`) capture the lint gates enforced by REQ-F1, REQ-F5, and REQ-F6.
