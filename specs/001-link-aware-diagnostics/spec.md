# Feature Specification: Live Documentation

**Feature Branch**: `001-live-documentation`

**Created**: 2025-10-16 (pivoted 2025-11-08)

**Status**: In Progress

**Input**: "Deliver an open-source, markdown-as-AST system where every workspace artifact has Live Documentation: an authored preamble plus generated sections describing programmatic surface, dependencies, and evidence, powering diagnostics and copilots without cloud dependencies."

**Current Vision**: Live Documentation mirrors each tracked asset into the configured base layer (this repo uses `.mdmd/layer-4/` with the `.mdmd.md` extension), giving it an authored preamble plus deterministic generated metadata. Diagnostics, CLI exports, and copilots consume the same markdown graph, while System-level views (clusters, workflows, coverage rollups) are generated on demand instead of being committed to the repository, keeping the experience reproducible and ephemeral by design. Layer 1 capabilities publish to a static site (initially GitHub Pages), Layer 2 requirements reconcile with Spec-Kit and issue trackers, and the System CLI streams materialized views so no architecture markdown lingers in the repo. A future Cloudflare-hosted showcase reuses the exact same generator so prospects can submit a public GitHub repository, receive a downloadable bundle (Live Docs, SQLite cache, README + prompt guide), and replay the experience locally without installing the extension or paying for LLM tokens.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Authors curate Live Documentation headers (Priority: P1)

**Status**: Complete — validated by `npm run live-docs:generate` with authored block preservation, `npm run live-docs:lint` enforcing structural markers, and 585 Live Docs passing validation as of 2025-12-19.

Maintainers open a Live Doc, edit the authored `Description`, `Purpose`, or `Notes`, and regenerate generated sections without losing manual context. The mirror tree lives under a configurable root (this repo uses `.mdmd/layer-4/`) but can be reconfigured.

**Why this priority**: The authored preamble communicates intent; losing it would make Live Docs untrustworthy even if generated metadata is correct. Authors need deterministic tooling to preserve their work.

**Independent Test**: Start from a staged Live Doc, modify the authored `Notes`, run the regeneration command, and confirm generated blocks update while authored content remains untouched.

**Acceptance Scenarios**:

1. **Given** a Live Doc with authored notes, **When** the maintainer runs `npm run live-docs:generate`, **Then** generated sections refresh while authored markdown is unchanged byte-for-byte.
2. **Given** a Live Doc stored outside the repository (custom path), **When** regeneration runs, **Then** the output path honours configuration and maintains mirror structure.
3. **Given** an attempt to remove the `Metadata` or `Authored` headings, **When** safe-commit executes, **Then** lint fails with actionable guidance.

---

### User Story 2 – Generated sections stay in sync (Priority: P1)

**Status**: Complete — benchmarks and regeneration CLIs operational. Generator emits `Public Symbols`, `Dependencies`, archetype-specific sections. Evidence feeds (coverage ingestion) still pending for automatic population.

Developers run regeneration or save a file; the Live Doc generator updates `Public Symbols`, `Dependencies`, and archetype-specific sections (`Observed Evidence`, `Targets`, `Consumers`) deterministically using analyzers and coverage feeds.

**Why this priority**: Live Docs only replace ad-hoc wiki pages if their generated content stays accurate and auditable.

**Independent Test**: Modify a code file’s exports, regenerate Live Docs, and verify the corresponding `Public Symbols` section reflects the change with correct provenance metadata.

**Acceptance Scenarios**:

1. **Given** a TypeScript module with new exports, **When** regeneration runs, **Then** the Live Doc lists the new symbol with structured docstring fields (summary, remarks, parameters) rendered under deterministic `##### `Symbol` — Field` subheadings alongside the source anchor.
2. **Given** an HTML template referencing an image, **When** regeneration runs, **Then** the asset Live Doc lists the template under `Consumers`.
3. **Given** a test covering multiple implementations, **When** regeneration runs, **Then** the test Live Doc lists all targets; removing a target triggers a diff and lint warning.
4. **Given** a C# member documented with `<summary>`, `<remarks>`, `<param>`, `<returns>`, and `<exception>` tags, **When** regeneration runs, **Then** the Live Doc emits one anchored subsection per tag with normalized text, `_Not documented_` placeholders for missing tags, and a provenance note for any unmapped XML.

---

### User Story 3 – Teams consume Live Doc intelligence on demand (Priority: P2)

**Status**: Substantially complete — `npm run live-docs:inspect` ships with `--from`/`--to` pathfinding, `--direction` (outbound/inbound/both), and fan-out enumeration. Local Map From/To pathfinding committed 2025-12-18 (`a0cc5de2`). System analytics CLI (LD-718) and evidence feeds remain pending.

Leads export impact reports, Copilot prompts, or diagnostics sourced from the Live Doc graph, seeing the same metadata (generated timestamp, evidence count, dependency depth) regardless of surface. System-level analytics (clusters, workflows, coverage gaps) remain ephemeral views that can be regenerated whenever needed.

**Why this priority**: Consumption surfaces prove the system’s value; without them Live Docs become a static archive.

**Independent Test**: Generate Live Docs, run the diagnostics provider and CLI export, and confirm both render consistent data for a given file change while leaving the workspace clean.

**Acceptance Scenarios**:

1. **Given** a developer saving a file, **When** diagnostics appear, **Then** entries include links to the relevant Live Docs with evidence counts.
2. **Given** a CLI command `live-docs inspect --from packages/server/src/runtime/environment.ts --to packages/extension/src/commands/exportDiagnostics.ts`, **When** executed, **Then** it emits a deterministic hop-by-hop narrative (edge kind, source, justification) showing the dependency path between the two artifacts.
3. **Given** a CLI command `live-docs inspect --from packages/server/src/runtime/environment.ts`, **When** executed, **Then** it automatically walks toward the nearest terminal roots (tests, config, docs) and reports the chain so maintainers can see where the signal ultimately originates.
4. **Given** a CLI command `live-docs system --cluster <id>`, **When** executed, **Then** it streams the analytics to stdout (or a temp file when requested) and leaves `.live-documentation/system/` unchanged.

---

### User Story 4 – Evidence gaps trigger escalation (Priority: P3)

**Status**: Planned — depends on coverage ingestion.

Teams rely on Live Docs to surface missing test coverage. When evidence sections are empty without waivers, lint and diagnostics escalate the gap.

**Why this priority**: Evidence transforms Live Docs from documentation into an accountability tool.

**Independent Test**: Remove tests covering a module, regenerate Live Docs, and check that lint warnings and diagnostics point to the missing evidence.

**Acceptance Scenarios**:

1. **Given** an implementation Live Doc without tests, **When** regeneration runs, **Then** the Evidence section reads `_No automated evidence found_` and safe-commit fails unless a waiver exists.
2. **Given** a waiver comment, **When** lint runs, **Then** it passes while logging the waiver for dashboards.
3. **Given** new tests added, **When** regeneration reruns, **Then** the Evidence section lists the tests and the warning clears automatically.

---

### User Story 5 – Legacy graph workflows remain accessible (Priority: P3)

**Status**: Sunset planning — ensures current users retain value during migration.

Early adopters using change-impact diagnostics and symbol neighborhood tooling continue to receive signals until Live Docs fully replace old surfaces.

**Independent Test**: Run both the legacy diagnostics suite and Live Doc-backed suite in parallel, verifying consistency and measuring deltas.

**Acceptance Scenarios**:

1. **Given** a code edit, **When** both pipelines run, **Then** diagnostics produced from the graph and Live Docs agree on impacted artifacts.
2. **Given** a symbol neighbourhood query, **When** executed, **Then** results include backlinks to Live Docs for each node.
3. **Given** a regression in Live Doc generation, **When** safe-commit runs, **Then** the legacy pipeline remains available while regeneration issues are resolved.

---

### User Story 6 – Layer distribution surfaces (Priority: P2)

**Status**: Planned — aligns public site publishing, requirement delegation, and on-demand analytics.

Stakeholders expect Layer 1 vision pages to publish externally without manual cloning, Layer 2 requirements to reconcile with Spec-Kit or issue trackers, and System analytics to remain ephemeral CLI outputs that highlight debt without polluting the repo.

**Why this priority**: The documentation stack only scales if each layer lives where people expect to consume it; failing to publish Layer 1 or to reconcile Layer 2 with execution tools would fragment the workflow.

**Independent Test**: Run the static site build, Spec-Kit sync, and System CLI against a sample workspace; confirm the site renders cleanly, requirement checklists match external state, and the CLI surfaces architectural hotspots without leaving tracked files behind.

**Acceptance Scenarios**:

1. **Given** the Layer 1 markdown corpus, **When** the static site workflow runs, **Then** it publishes updated pages with no broken links or missing capabilities.
2. **Given** a Layer 2 requirement linked to Spec-Kit tasks, **When** safe-commit executes, **Then** mismatches between markdown checkboxes and Spec-Kit state appear in the generated snapshot with actionable diffs.
3. **Given** the `npm run live-docs:system` command, **When** it targets an intentionally messy fixture, **Then** the CLI output flags the architectural debt and the `.live-documentation/system/` directory remains empty unless a deliberate export flag is provided.

---

### User Story 7 – Writers monitor docstrings & draft changes (Priority: P3)

**Status**: Planned — drift diagnostics are in-scope; docs → code write-back remains a deferred wishlist item.

Authors treat Live Docs as the canonical AST for documentation and understanding. They can edit summaries, remarks, and parameter notes inside Layer‑4 markdown, and the system can surface drift diagnostics when inline docstrings diverge from the generated Live Doc schema (or remain missing). If docs → code write-back is explored later, it must remain feature-flagged and auditable.

**Why this priority**: The core value is “map + freshness engine” (code → docs + diagnostics). Write-back can be valuable, but it is not required to make Live Documentation useful.

**Independent Test**: Modify a Live Doc’s symbol summary, run regeneration/verification, and confirm the system reports drift (and remediation guidance) without mutating source files.

**Acceptance Scenarios**:

1. **Given** a Live Doc edit that changes summary and parameters, **When** verification runs, **Then** drift is reported with symbol/field-level pointers and remediation guidance, and no tracked files are mutated.
2. **Given** docstrings containing unsupported tags, **When** regeneration runs, **Then** unmapped fragments are preserved as `rawFragments` with provenance so no data is silently dropped.
3. **Given** a request for generative scaffolding in Rust, **When** scaffolding runs, **Then** a draft appears under `AI-Agent-Workspace/tmp/live-docs/scaffolds/` with references back to the originating Live Doc and no tracked files changed.
4. **Given** any future write-back feature flags are disabled, **When** a user attempts to apply docstring updates, **Then** the tool exits safely with guidance, ensuring legacy workflows remain untouched.

---

### User Story 8 – Hosted Showcase Trials (Priority: P2)

**Status**: Planned — depends on REQ-H1 and the hosted showcase pipeline.

Prospective adopters visit a Cloudflare-backed site, enter a public GitHub repository reference, and receive a downloadable bundle containing Live Docs, the SQLite knowledge graph, and a README + prompt guide. The hosted runner is stateless, deletes the cloned repo once the bundle is produced, and exposes provenance metadata so teams can reproduce the output locally or feed it to their preferred LLM workflows.

**Why this priority**: Visibility drives adoption. Demonstrating Live Documentation without installation friction or paid LLM calls positions the project against Code Wiki, Windsurf Codemaps, and GitLab Knowledge Graph while preserving the local-first philosophy.

**Independent Test**: Submit `github.com/example/repo@main` via the showcase UI, download the resulting bundle, and confirm it contains Live Docs, the SQLite cache, provenance metadata, and the prompt guide. Re-run `npm run live-docs:generate` locally to ensure hashes match.

**Acceptance Scenarios**:

1. **Given** a public GitHub repo reference, **When** the showcase pipeline executes, **Then** it clones the repo into ephemeral storage, runs the standard generator, emits provenance metadata, and returns a zip containing Live Docs, SQLite cache, README, and prompt guide.
2. **Given** a downloaded bundle, **When** the user follows the README instructions, **Then** they can rehydrate the SQLite cache locally, inspect Live Docs in the workspace, and replay the same prompts in their LLM of choice.
3. **Given** the hosted runner completes, **When** telemetry is inspected, **Then** it shows that all temporary clones and caches were deleted within the configured TTL and that no private repositories were accepted.

### User Story 9 – Visualize Live Docs in a Command Center (Priority: P1)

**Status**: Substantially complete — Explorer ships with Circuit Board, Local Map, and Force Graph views. Local Map From/To pathfinding committed 2025-12-18 (`a0cc5de2`). Accessibility audits (LD-408) and unified explorer refactoring (LD-406) remain outstanding.

Maintainers run `npm run live-docs:visualize` (or launch the Antigravity panel) to explore the repository: the primary view presents a circuit-board layout of Live Docs, clicking or hovering a file expands its public symbols, and focus mode hides unrelated nodes so inbound/outbound relationships stand out. The detail panel reveals the Live Doc metadata, links back to the source, and previews authored sections that will eventually become editable. A complementary force-directed graph remains available for discovery but may relax accessibility compared to the primary surface.

The Local Map view also acts as a non-headless equivalent of `live-docs inspect`: maintainers can provide a `From` artifact and a `To` artifact and the view expands to show the multi-hop path between them (or a clear “no connection” result) using the same underlying hop semantics as the CLI. The interaction stays minimal: pathfinding auto-runs (debounced) when both endpoints are valid, with no extra “Find Path” action beyond the inputs and the result.

**Why this priority**: The command center turns Live Docs into an everyday cockpit—bridging global topology, local symbol context, and future authoring without bouncing between disparate prototypes. Without it, teams struggle to reason about change impact or prepare docstring scaffolds directly from the documentation graph.

**Independent Test**: Launch the explorer against the repository, select `packages/server/src/runtime/changeProcessor.ts`, confirm the board collapses to show only related neighbors, inspect the detail panel for Live Doc metadata, open the file in VS Code, and run an accessibility audit (axe-core) to ensure WCAG AA obligations pass.

**Acceptance Scenarios**:

1. **Given** a Live Doc node on the circuit-board view, **When** the maintainer activates focus mode, **Then** the explorer hides unrelated nodes, highlights inbound versus outbound edges with distinct treatments, and the detail panel lists public symbols with “open in editor” affordances sourced from the same Live Doc payloads the CLI exposes.
2. **Given** the maintainer switches between circuit-board and force-directed views, **When** a node is currently selected, **Then** its selection state, highlighted neighbors, and detail panel content persist across both views.
3. **Given** the maintainer navigates solely with a keyboard or screen reader, **When** they tab through the explorer, **Then** focus order is logical, every interactive element announces its role/name/state, and contrast checks satisfy WCAG AA (≥4.5:1).
4. **Given** the detail panel surfaces authored Live Doc context, **When** the maintainer attempts to edit, **Then** the UI clarifies the read-only state today and exposes the upcoming docstring-bridge workflow (preview/apply) once feature flags enable authoring.
5. **Given** a Live Doc includes symbol-level dependency anchors, **When** the maintainer inspects it in the local view, **Then** symbol rails render connectors with inbound/outbound colouring that mirrors `live-docs inspect`, and automated parity tests confirm the rendered edges match the headless payload exactly.
6. **Given** the maintainer provides a `From` artifact and a `To` artifact in the Local Map view, **When** both endpoints are valid, **Then** the explorer auto-runs pathfinding (debounced) and the UI expands beyond one hop to render the multi-hop chain (including where paths join) using the same hop semantics as `live-docs inspect --from/--to`.
7. **Given** the maintainer provides a `From` artifact and a `To` artifact that have no connection, **When** pathfinding runs, **Then** the UI reports a deterministic “no connection” outcome rather than showing unrelated neighbor columns.

---

### Edge Cases

- Newly created files without exports still receive stub Live Docs; generated sections display `_No data available_` until analyzers detect symbols.
- Live Docs remain stable when files move or are renamed; migration scripts update metadata and code path references automatically.
- Rapid edits triggering regeneration multiple times must coalesce; generated blocks should only change when analyzer output differs.
- Tests spanning many implementations should not bloat Implementation Live Docs; backlinks flow through the graph instead of duplicating content.
- External feeds (GitLab Knowledge Graph, LSIF) failing mid-run must not overwrite existing generated sections; provenance markers flag stale data.
- LLM augmentations must remain opt-in and clearly labeled to prevent unverifiable edges sneaking into generated content.
- Safe-commit must continue to run offline; Live Doc regeneration cannot require cloud calls for deterministic builds.
- System analytics should never leave behind tracked files by default; generators must clean up temporary exports even when commands error.
- Static site publishing and Spec-Kit syncing remain optional per workspace but default on for project-owned repos so stakeholders have a consistent entry point.
- Docstring bridges must degrade gracefully when encountering unsupported tags (`<typeparam>`, `<include>`, custom extensions); provenance should capture raw XML and the Live Doc should display `_Not documented_` placeholders instead of silently dropping content.
- Round-trip tooling must fail safe when source files change between preview and apply, prompting users to regenerate diffs instead of overwriting concurrent edits.
- Generative scaffolding outputs remain in scratch locations even when commands crash; cleanup routines run on next invocation to avoid accumulating stale drafts.
- Hosted showcase runs accept only public repositories, enforce repo size/time limits, and delete all cloned artefacts immediately after bundling to keep the service stateless.

### Live Doc Generation Lifecycle

1. **Staging**: Regeneration writes output to the configured base layer (this repo uses `.mdmd/layer-4/` with `.mdmd.md`), preserving authored sections and updating generated blocks.
2. **Validation**: Safe-commit runs structural lint, analyzer parity checks, and evidence completeness audits before allowing merges.
3. **Authoring Loop**: Feature-flagged tooling compares authored Live Doc edits with inline docstrings, records preview/apply telemetry, and (optionally) emits generative scaffolds into scratch directories without touching tracked files until humans promote them.
4. **Promotion**: Once parity with existing MDMD Layer‑4 docs is proven, configuration flips to treat Live Docs as canonical; legacy docs become generated outputs as well.
5. **Consumption**: Diagnostics, CLI, and Copilot exports read directly from Live Docs, while System analytics regenerate materialized views on demand (streamed to stdout or temp files) so no stale architecture docs linger in the repo.

### Cache Retention & Privacy

Live Docs live alongside the repository (versionable or ignored per configuration). Analyzer caches remain disposable; whenever they regenerate, markup updates deterministically. External adopters can regenerate from scratch without shipping proprietary data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-LD1**: Generator MUST create/refresh Live Docs under a configurable root (this repo uses `.mdmd/layer-4/` with `.mdmd.md`), preserving authored sections and updating generated sections with deterministic output guarded by HTML markers (`<!-- LIVE-DOC:BEGIN ... -->` / `<!-- LIVE-DOC:END ... -->`).
- **FR-LD2**: Generator MUST emit `Public Symbols`, `Dependencies`, and archetype-specific sections (Implementation: `Observed Evidence`; Test: `Targets`, `Supporting Fixtures`; Asset: `Consumers`) using analyzer output and coverage data.
- **FR-LD3**: Regeneration MUST record provenance metadata (analyzer id, timestamp, benchmark hash) within generated blocks for auditability.
- **FR-LD4**: Safe-commit pipeline MUST lint Live Docs for structural completeness, analyzer parity, and evidence presence, failing merges when violations occur unless explicit waivers are present.
- **FR-LD5**: Diagnostics, CLI, and Copilot surfaces MUST consume Live Docs as their single source of truth, embedding links back to the originating documents, and the `live-docs inspect` CLI MUST support `--from/--to` path discovery plus single-endpoint root tracing with deterministic hop output.
- **FR-LD6**: Docstring bridges MUST reconcile inline documentation with Live Doc summaries, map multi-tag payloads into a canonical schema (`summary`, `remarks`, `parameters`, `typeParameters`, `returns`, `exceptions`, `examples`, `links`), render deterministic `##### `Symbol` — Field` subheadings with `_Not documented_` placeholders when data is missing, retain provenance for unmapped fragments, and raise drift diagnostics when mismatches persist beyond one regeneration cycle.
- **FR-LD7**: Migration tooling MUST compare existing Layer‑4 MDMD docs to generated Live Docs, producing diff reports and updating references (Layer‑3/Layer‑1) once parity is confirmed.
- **FR-LD8**: External feeds (LSIF, SCIP, GitLab Knowledge Graph) and optional LLM augmentations MUST tag generated sections with confidence tiers; low-confidence edges require manual promotion before appearing in diagnostics.
- **FR-LD9**: Telemetry MUST report regeneration latency, evidence coverage rates, and waiver counts to evaluate adoption.
- **FR-LD10**: Live Doc configuration MUST expose glob patterns, archetype overrides, and storage paths while remaining version-controlled and documented for adopters.
- **FR-LD11**: Generated Live Docs MUST emit workspace-relative markdown links and enforce header slugs according to the configured dialect (GitHub default); violations require explicit waivers surfaced in lint.
- **FR-LD12**: System analytics MUST default to ephemeral outputs (stdout or temporary directories) and require explicit user confirmation before writing tracked files; commands MUST tag persisted exports so lint can detect strays.
- **FR-LD13**: Layer distribution tooling MUST publish Layer 1 capabilities via a scripted static site, reconcile Layer 2 requirement status with Spec-Kit/issue trackers, and keep System analytics as CLI materialized views that leave no tracked artefacts unless explicitly promoted.
- **FR-LD14**: Docstring tooling MUST surface drift diagnostics and preserve provenance for unmapped tags. Any future write-back (preview/apply) MUST remain feature-flagged, explicitly confirmed, and auditable, and scaffolds MUST emit into scratch locations without modifying tracked files until humans promote them.
- **FR-LD15**: The hosted showcase pipeline MUST reuse the standard generator to process public GitHub repositories headlessly, emit provenance metadata, produce a downloadable bundle (Live Docs, SQLite cache, README, prompt guide), and delete cloned data immediately after the bundle is created.
- **FR-LD16**: The visualization command center MUST merge circuit-board and local symbol exploration into a single UI backed by Live Docs, maintain state across force-directed and 2D views, expose “open in editor” affordances, provide focus-mode filtering, and satisfy WCAG AA keyboard/contrast/screen-reader expectations while preparing the detail panel for future inline editing. The UI MUST operate purely on the Live Doc graph payload—displaying every dependency, symbol anchor, and evidence field available headlessly without inventing additional heuristics—and distinguish inbound versus outbound relationships with directional treatments that stay aligned with CLI diagnostics.

### Key Entities *(include if feature involves data)*
- **Live Doc Artifact**: Markdown file containing Metadata, Authored, and Generated sections for a single source asset; stores archetype, timestamps, and provenance summary.
- **Analyzer Output**: Structured description of symbols, dependencies, and coverage emitted by tooling; includes hash for determinism checks.
- **Evidence Item**: Test case, benchmark, or manual review that exercises or validates an implementation artifact; includes status, location, and waiver metadata.
- **Waiver Record**: Justification for temporarily accepting missing evidence; references owning team, expiry date, and follow-up task id.
- **Consumption Surface**: Diagnostics, CLI, Copilot prompt, or report derived from Live Docs; records render latency and Live Doc version used.
- **Authoring Session**: Feature-flagged interaction capturing Live Doc edits, preview diffs, selected language adapters, resulting docstring mutations, scaffold outputs, and audit telemetry for compliance.

## Assumptions

- Existing MDMD Layer‑4 docs remain authoritative until Live Docs pass acceptance benchmarks; migrations occur file-by-file with human review.
- Regeneration runs locally without requiring internet access; optional LLM enrichments stay opt-in.
- Analyzer plugins can be authored in TypeScript and executed within the server; polyglot coverage is staged via CLI bridges until native analyzers land.
- Teams tolerate short regeneration windows (≤30 s for 5k-file repo) during safe-commit; tooling will parallelise to stay within bounds.
- Documentation writers will adopt the authored header schema once editors expose helpers or snippets.
- External adopters expect MIT-licensed tooling and CLI-first workflows; Live Docs must regenerate without VS Code to broaden reach, and the extension must stay compatible with VS Code forks (Windsurf, Cursor, others) that implement the same API surface.
- Hosted showcases target only public repositories, run the same generator used locally, and guarantee that temporary clones are purged immediately after bundles are produced.
- System analytics remain ephemeral unless a user explicitly persists them; tooling should assume a clean workspace between runs.
- Static site publishing and Spec-Kit syncing remain optional per workspace but default on for project-owned repos so stakeholders have a consistent entry point.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-LD1**: ≥95% of modified source files have Live Docs regenerated within a single `safe:commit` run; structural lint reports zero missing sections.
- **SC-LD2**: Analyzer precision/recall stays ≥0.9 for exported symbols and ≥0.8 for dependencies across supported languages, as reported by benchmarks.
- **SC-LD3**: 100% of implementation Live Docs list evidence or waivers; unresolved gaps trigger lint warnings within 24 hours.
- **SC-LD4**: Diagnostics and CLI exports referencing Live Docs respond within ≤2 s for repositories under 10k files.
- **SC-LD5**: External adopters regenerate Live Docs from scratch using documented commands, pass safe-commit, and report successful onboarding within one day.
- **SC-LD6**: Docstring drift diagnostics resolve within one regeneration cycle during integration tests, with zero lingering violations after safe-commit.
- **SC-LD7**: Relative-link lint reports zero violations after regeneration, and exported Live Docs render without broken anchors when served from a static wiki path.
- **SC-LD8**: System analytics commands leave no tracked artefacts by default and finish within ≤2 s for repositories under 10k files when streaming to stdout.
- **SC-LD9**: Static site builds publish Layer 1 capabilities without broken links, Layer 2 requirements stay in sync with Spec-Kit/issue trackers, and the System CLI surfaces architectural debt while keeping the tracked tree clean between runs.
- **SC-LD10**: Structured docstring bridges populate canonical subsections for ≥95% of documented public symbols in supported languages; unmapped tags surface in telemetry within one regeneration cycle.
- **SC-LD11**: Docstring drift diagnostics cover ≥95% of documented public symbols in supported fixtures and resolve within one regeneration cycle when docstrings are updated manually; any future write-back remains opt-in and auditable.
- **SC-LD12**: Hosted showcase runs finish within ≤3 minutes for repos under 5k files, emit bundles whose hashes match local regeneration, and delete temporary clones/caches within 60 seconds of completion.
- **SC-LD13**: Visualization command center focus-mode interactions resolve within two steps, keyboard/screen-reader audits pass WCAG AA checks (2.1, 1.4.3, 4.1.2), and detail panels render within ≤500 ms for repos under 5k files while logging telemetry for view toggles and accessibility overrides.


## Clarifications

### Session 2025-11-08

- Q: How are authored sections protected during regeneration? → A: HTML markers wrap each generated block; the generator rewrites only the content between markers and fails if markers are missing.
- Q: Where does evidence data originate? → A: Coverage ingestion pipeline scrapes test metadata (`vitest`, `pytest`, `dotnet test`) and manual audit manifests; missing data defaults to `_No automated evidence found_` with required waiver.
- Q: How do legacy diagnostics coexist with Live Docs? → A: Safe-commit runs both pipelines until Live Docs achieve parity; feature flags determine the active surface per workspace.

## Upcoming Work Items

- **WI-LD101** – Finish Live Doc generator CLI (diff views, dry run mode) and document adoption playbook.
- **WI-LD102** – Implement coverage ingestion pipeline to populate `Observed Evidence` and ensure lint parity.
- **WI-LD201** – Deliver docstring bridge adapters for TypeScript, Python, and C#, plus integration tests that validate canonical schema mapping and drift diagnostics across multi-tag docstrings.
- **WI-LD202** – Extend Live Doc generation to repository-hosted polyglot fixtures (Python, C#, Java, Ruby, Rust, C), snapshotting regeneration output and wiring per-language benchmarks into safe-commit before piloting external repositories.
- **WI-LD301** – Pivot diagnostics/CLI/export commands to consume Live Docs exclusively and retire legacy graph consumers.
- **WI-LD304** – Consolidate the visualization command center by refactoring `npm run live-docs:visualize` into shared data/interaction layers, integrating focus-mode filtering, and wiring accessibility/telemetry hooks ahead of docstring authoring.
- **WI-LD401** – Package sample workspace and MIT-licensed release notes for public adoption.
- **WI-LD501** – Build System analytics CLI (clusters, workflows, coverage) that defaults to streaming output and includes cleanup guarantees.
- **WI-LD601** – Stand up the layer distribution surfaces (static site pipeline, Spec-Kit/issue tracker reconciliation, and the guardrailed `live-docs:system` CLI).
- **WI-LD701** – Launch the hosted showcase pipeline (Cloudflare or equivalent) that clones public repositories into ephemeral storage, runs the standard generator, zips Live Docs + SQLite + README + prompt guide, emits provenance metadata, and proves all artefacts are deleted after the bundle is signed.


## Implementation Traceability
- [`packages/server/src/main.ts`](../../packages/server/src/main.ts) and [`packages/server/src/runtime/changeProcessor.ts`](../../packages/server/src/runtime/changeProcessor.ts) orchestrate analyzer pipelines that feed Live Doc generation.
- [`packages/server/src/features/diagnostics/publishCodeDiagnostics.ts`](../../packages/server/src/features/diagnostics/publishCodeDiagnostics.ts) and [`publishDocDiagnostics.ts`](../../packages/server/src/features/diagnostics/publishDocDiagnostics.ts) will emit Live Doc-backed diagnostics.
- [`packages/extension/src/commands/exportDiagnostics.ts`](../../packages/extension/src/commands/exportDiagnostics.ts) and forthcoming Live Doc CLI utilities render consumption narratives.
- [`scripts/live-docs/visualize-explorer.ts`](../../scripts/live-docs/visualize-explorer.ts) hosts the unified visualization command center that merges circuit-board, local, and force-directed views while the extension variant incubates inside Antigravity.
- [`packages/shared/src/testing/fixtureOracles`](../../packages/shared/src/testing/fixtureOracles) house polyglot analyzers underpinning generated sections.
- Integration suites under `tests/integration/live-docs` (to be expanded) validate regeneration, evidence mapping, and docstring drift.


