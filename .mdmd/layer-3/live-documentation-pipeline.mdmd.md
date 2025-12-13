# Live Documentation Pipeline

## Metadata
- Layer: 3
- Component IDs: COMP-201, COMP-202

## Components

### COMP-201 Live Doc Generator Service
Supports FR-LD1, FR-LD2, and FR-LD3 by orchestrating analyzers, template preservation, and provenance capture to emit deterministic markdown mirrors under `/.live-documentation/<baseLayer>/`.

### COMP-202 Live Doc Graph Projector
Supports FR-LD5, FR-LD7, and SC-LD4 by ingesting generated markdown links into the workspace knowledge graph, powering diagnostics, CLI exports, and Copilot prompts.

<a id="comp203-live-doc-authoring-bridge"></a>
### COMP-203 Live Doc Authoring Bridge
Supports FR-LD6 and REQ-G1 by keeping docstring extraction and drift diagnostics reliable (code → docs), managing feature flags, and preserving provenance for unmapped docstring fragments. Any docs → code write-back or scaffolding remains a deferred wishlist item.

## Responsibilities

### Template Preservation & Authored Guardrails (COMP-201)
- Load Layer-4 Live Documentation files, parse HTML markers, and protect authored headers (`Description`, `Purpose`, `Notes`) from generator overwrites.
- Enforce generated section ordering (`Public Symbols`, `Dependencies`, `Observed Evidence`/archetype sections) and emit deterministic delimiters for diff tooling.
- Validate relative-link requirements and slug dialect configuration before writing outputs.

### Analyzer & Enricher Coordination (COMP-201)
- Invoke language-specific analyzers (TypeScript, Python, Rust, C#, etc.) to resolve exported symbols and first-order dependencies per artifact.
- Normalise docstring payloads across analyzer outputs into a canonical schema (`summary`, `remarks`, `parameters`, `returns`, `exceptions`, `examples`) before writing markdown so Live Docs surface consistent headings regardless of source language.
- Merge coverage bridges and docstring adapters to populate `Observed Evidence`, `Targets`, and drift metadata when available.
- Render docstring fields as deterministic `##### `Symbol` — Field` subsections, emit `_Not documented_` placeholders for empty entries, and persist raw fragments plus provenance for tags we do not yet model so adopters retain lossless payloads.
- Collect provenance (`generator tool`, `version`, `benchmark hash`, `input hash`) and persist it inside Live Doc metadata for audit trails.

### Graph Projection & Indexing (COMP-202)
- Parse generated markdown links to synthesise graph edges tying implementation ↔ tests ↔ assets, respecting archetype semantics.
- Surface backlink queries (`which Live Docs depend on X?`) to diagnostics and CLI consumers while avoiding authored-section mutations.
- Cache projections so downstream diagnostics remain responsive without rereading every markdown file on each request.

### Consumption Surface Integration (COMP-202)
- Provide typed accessors for diagnostics publishers, CLI commands, and Copilot helpers to resolve Live Doc metadata, evidence summaries, and regeneration timestamps.
- Expose diff helpers so `npm run live-docs:generate -- --dry-run` and UI preview panes can highlight pending updates before writes.

### Drift & Optional Authoring Controls (COMP-203)
- Compute structured drift signals between inline docstrings and the canonical Live Doc schema, surfacing actionable diagnostics without mutating source files.
- Sanitize and normalise docstring content (HTML paragraphs, code blocks, custom tags) so extraction and normalization remain stable across supported languages.
- Preserve unmapped tags/fragments with provenance so no docstring content is silently dropped.
- If/when docs → code write-back is pursued, require strict feature flags, audit logging, rollback hooks, and explicit human confirmation.

## Interfaces

### Inbound Interfaces
- Analyzer outputs exposed by `packages/server/src/features` modules (symbol harvesters, dependency resolvers, coverage adapters).
- Workspace configuration obtained via `packages/shared/src/config/liveDocumentationConfig.ts`.
- CLI/extension commands requesting regeneration (`live-docs:generate`, `Live Docs: Regenerate File`).
- Drift reporting commands and diagnostics requests emitted by the extension/CLI.
- Future (wishlist) authoring commands for preview/apply and scaffolding, gated behind explicit opt-in.

### Outbound Interfaces
- Markdown writes to `/.live-documentation/<baseLayer>/` guarded by atomic file swaps and provenance updates.
- Graph projection APIs consumed by diagnostics publishers, CLI inspectors, and Copilot prompt builders (`packages/shared/src/live-docs/*`).
- Telemetry hooks emitting regeneration latency and evidence coverage metrics to benchmark pipelines.
- Drift reports and telemetry describing docstring/schema mismatches.
- Future (wishlist) docstring update pipeline writing back into source files via language-specific adapters, gated behind feature flags and explicit confirmation.
- Scratch artifact emitters targeting `AI-Agent-Workspace/tmp/**` (or caller-provided directories) when generating scaffolds or multi-language prototypes.

## Linked Implementations

### IMP-301 liveDocsGenerateCli
Scaffolds the generation CLI entry point. See `.mdmd/layer-4/scripts/live-docs/generate.ts.mdmd.mdmd.md` for the Stage-0 mirror and `npm run live-docs:generate -- --help` for usage.

### IMP-302 liveDocGenerator
Coordinates analyzers, template parsing, and provenance capture. Implementation detail resides in `.mdmd/layer-4/packages/server/src/features/live-docs/generator.ts.mdmd.mdmd.md`.

### IMP-303 liveDocGraphProjector
Projects markdown links into the workspace graph for diagnostics and CLI use. The generated view is `.mdmd/layer-4/packages/server/src/features/live-docs/graphProjector.ts.mdmd.mdmd.md`.

### IMP-304 liveDocDiffService
Produces diff previews for dry-run and UI workflows. The diff helper currently ships inside the generator CLI; standalone materialisation will be regenerated once the service is reinstated.

### IMP-305 liveDocMetadataStore
Persists provenance metadata and archetype assignments. Metadata persistence now lives within `.mdmd/layer-4/packages/shared/src/live-docs/schema.ts.mdmd.mdmd.md`; a dedicated store will resurface when promotion tooling requires it.

### IMP-306 docstringRoundTripService *(wishlist)*
If docs → code write-back is pursued, calculates diffs between Live Docs and inline docstrings, applies updates under feature flag control, and records telemetry for REQ-G1.

### IMP-307 liveDocsAuthoringCommands *(wishlist)*
If docs → code write-back is pursued, VS Code + CLI commands surface preview/apply flows and scaffolding hooks to interact with COMP-203.

## Evidence
- Planned integration suites (`tests/integration/live-docs/generation.test.ts`, `evidence.test.ts`, `inspect-cli.test.ts`) cover regeneration determinism, evidence emission, and CLI parity.
- Benchmark reports under `reports/benchmarks/live-docs/` record regeneration latency and analyzer precision/recall for generated sections.
- Safe-to-commit pipeline will fail when Live Doc lint, SlopCop link audits, or provenance checks detect regressions.
- Polyglot fixtures (`tests/integration/benchmarks/fixtures/java/basic`) validate docstring extraction/sanitisation, and drift-oriented suites can be added to exercise high-risk docstring shapes without enabling write-back.

## Operational Notes
- Live Doc IDs hash normalised relative paths + archetype to stay stable across machines; avoid incorporating timestamps into identifiers.
- Asset archetypes remain optional—prefer validating links from implementation/test Live Docs before emitting standalone asset docs.
- Future work (Phase 7) will derive Layer‑2/Layer‑3 documentation directly from generated markdown once churn/reference enrichers stabilise.
