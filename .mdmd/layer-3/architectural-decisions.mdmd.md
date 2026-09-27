# Architectural Decisions

## Metadata

- Layer: 3
- Archetype: reference
- Provenance: Migrated from `specs/001-link-aware-diagnostics/research.md` on 2026-02-23

## Authored

### Purpose

Record the key architectural decisions made during Live Documentation development in an ADR-light (Decision / Rationale / Alternatives Considered) format so future contributors and context windows can understand **why** the system is shaped the way it is, not just what it does.

### Notes

- Decisions are listed chronologically by when they became relevant.
- Descoped decisions are retained as brief audit trail entries; the full context lives in the chat record under `AI-Agent-Workspace/ChatHistory/`.
- This document was originally `specs/001-link-aware-diagnostics/research.md`.

## Decisions

### Diagnostic Architecture _(Superseded 2026-02-18)_

- **Original decision**: A Node.js language server, coordinated by a thin VS Code extension, owning graph construction and lint diagnostics.
- **What happened**: The diagnostics subsystem was removed on 2026-02-18 (see the audit trail below). What remains is a 60-line server shell and the generator code that happens to live in `packages/server`; both are scheduled for removal or relocation, and the extension is being rescoped (see "Explorer Panel in the Editor").

### Symbol Ingestion Strategy _(Superseded; see "Link Sources")_

- **Original decision**: Prefer VS Code's built-in `execute*Provider` commands and language-server diagnostics before falling back to custom parsing.
- **What happened**: With the diagnostics subsystem gone, all relationships come from source analysis in the CLI; the editor is a host for the result, not a source of it.

### Workspace Indexing & Change Detection _(Superseded; see "Explorer Panel in the Editor")_

- **Original observation**: VS Code delivers incremental file events, so an LSP needs no bespoke polling.
- **What happened**: The constraint that survives is about cost, not plumbing: a file watcher may notify and debounce, but must never trigger a cold CLI regeneration on every save.

### Link Establishment Strategy

- **Decision (updated)**: Treat link relationships as an indexable projection rather than user-authored metadata. Default to auto-inferred links derived from language/intelligence providers (definitions, references, diagnostics) and optional external knowledge graphs. Allow explicit overrides via lightweight manifests only when inference fails.
- **Rationale**: Mirrors VS Code's workspace indexing philosophy — indexes are cached artifacts regenerable on demand, avoiding brittle front matter. Aligns with user preference to "ride" official tooling.
- **Alternatives Considered**: Mandatory front matter or CLI registration (rejected: high friction, hard to keep in sync); heuristic-only without override capability (rejected: lacks control for edge cases).

### Graph Rebuild & Freshness _(Updated 2026-01-12)_

- **Decision**: Live Docs themselves serve as the canonical graph representation. Dependency relationships are encoded as markdown links and queried via `live-docs:inspect --from/--to`. No separate SQLite cache or external feeds are needed.
- **Rationale**: "Live Docs ARE the database" — eliminates cache invalidation complexity.

### Link Sources _(Updated 2026-09-27)_

- **Decision**: Relationships come from deterministic source analysis only. TypeScript and JavaScript use the compiler API; the other languages use hand-written scanners today. Tree-sitter is not used by shipped code yet; it replaces the scanners next, C# first.
- **Rationale**: Deterministic, offline, no external runtime.
- **Descoped**: LLM inference via Ollama or `vscode.lm` (removed 2026-02-17: dormant, zero production callers; users bring their own assistants). VS Code's workspace symbol index as a second source (gone with the diagnostics subsystem).
- **Observation**: each language's code is split across `languages/{lang}.ts` and `live-docs/adapters/{lang}.ts` (a third directory, the benchmark-only heuristics, was removed on 2026-09-27). An abandoned January 2026 note proposed one folder per language; whether to do that is decided with the tree-sitter work, not here.

### Accuracy Measurement _(Updated 2026-09-27)_

- **Approach** (as stated in the vision): measure the shipped analyzers against oracles that share no mechanism with them: a compiler's own resolution (SCIP indexes), what actually breaks when a symbol is removed, and small hand-verified fixtures for dynamic patterns. Cross-language parity over the Rosetta fixtures guards against regressions in any one adapter. The details are undesigned.
- **Ground truth is never filtered**: whatever produces the expectations, its output is not trimmed to fit the analyzer. (In the January 2026 benchmark that meant the union of SCIP and tree-sitter output.) Adapter blocklists may remove only true framework or builtin names. A filter that can only raise false negatives is a bug. The roles stay separate: adapters are the product, oracles are the ground truth, and nothing grades itself.
- **Where this stands**: the AST accuracy benchmark was retired on 2026-09-27. It scored a benchmark-only inference path rather than the shipped adapters, its ground truth was the union of SCIP output and that same tree-sitter path, and its per-fixture thresholds had been lowered as far as 15% precision and 5% recall until it passed. `live-docs:report` compares the analyzer to a re-run of itself and is next to go. The replacement, a compiler-backed oracle over the shipped generator, is step 2 of the vision's order of work. The earlier self-similarity mode was removed in early 2026.
- **Candidate scenarios from the earlier product** (dictated by the owner on 2025-10-21 for the diagnostics tool and lost when the ripple suites were removed; kept as candidates, not commitments): a negative case where JavaScript reuses the variable name `data` in increasingly local scopes and nothing should be reported; `web.config` XSLT transforms from .NET Framework WebForms, to see how metaprogramming is handled; and a rename or move of a source file. Whether each still matters is decided when the benchmark is rebuilt.

### Edge Storage _(Recorded 2026-09-27; in effect since 2026-01-12)_

- **Decision**: Each edge is stored once, on the source file's Live Doc, in its `Dependencies` section. Inbound relationships are derived by the graph loader and never written.
- **Rationale**: Tests and other high-fan-in files would otherwise bloat every doc they touch; one direction keeps the mirror deterministic and regeneration cheap.
- **Open**: the vision wants every edge to carry its evidence and its tier (observed from source, observed from configuration, declared). A January 2026 design that was never built sketched one shape for that (kind, provenance, source location, unresolved targets kept rather than dropped, disagreements surfaced rather than merged). It is recorded here as prior art, not as the plan; the grammar work decides what an edge carries.

### Generator Gaps Noted by Earlier Specs _(Recorded 2026-09-27; unprioritised)_

Requirements written in 2025 and never implemented, kept as observations rather than commitments:

- A failure part-way through a run should not overwrite existing generated sections; today `generator.ts` has no per-file recovery.
- Renaming or moving a source file should carry its authored `Purpose` and `Notes` to the new doc; today the generator refuses to prune a doc that has authored content, so the old doc survives as an orphan (`live-docs:orphans` lists them) and nothing carries its text forward.
- Writes could be atomic (temp file, then rename) so a crash cannot leave a half-written doc.

Settled in September 2026: derived views (the graph index, the Explorer bundle) are regenerated on demand and never committed; only the per-file mirror is.

### Related Documentation Bridge _(Recorded 2026-09-27; in effect since 2026-01-06)_

- **Decision**: Existing markdown (READMEs, ADRs, design notes) is never rewritten or moved. A document joins the graph only because a Live Doc links to it, renders as a related-document node, and can be kept out of the bundle by pattern (`bundleExclude`).
- **Rationale**: "Do we throw out all their work?" For brownfield adoption the answer is no: bridge, don't replace.

### Explorer Panel in the Editor _(Recorded 2026-09-27)_

- **Direction, not yet designed**: a VS Code extension is expected to return as a panel that hosts the same static Explorer and re-renders it as files change; the earlier extension shell was removed on 2026-09-27 rather than carried. What is settled is the portability rule: the editor is a host, not a second renderer, and nothing may work only there.
- **Known cost, to re-measure**: in February 2026 a `--changed` regeneration took about 12 seconds for zero files, almost all of it `tsx` start-up, which is why the earlier design had the watcher notify rather than regenerate. Whether that still holds once the CLI is compiled is untested; the panel's refresh strategy is undecided.

### Testing Approach _(Updated 2026-09-27)_

- **Decision**: Vitest for unit and integration tests, as two projects in one config; Playwright for the Explorer. The integration project runs the real generator and CLI over fixture workspaces and imports sources directly, so no build precedes it.
- **Rationale**: Fast feedback; visual behaviour verified in a real browser rather than jsdom.
- **Retired 2026-09-27**: the VS Code Electron harness (`@vscode/test-electron` plus mocha) that hosted the integration suites. None of them used the VS Code API, and the harness cost a compile step, an 8 GB download cache, and `xvfb` on every Linux run.

## Descoped Decisions (Audit Trail)

The following decisions were explored and explicitly removed from scope during the Dev Day 70–72 codebase cleanup (February 2026). They are retained here for architectural traceability.

- **Baseline Inference & Fallbacks** _(Descoped 2026-02-17)_: GraphRAG-style LLM fallback for graph construction when native language-server signals are missing. Removed because the system relies exclusively on deterministic polyglot analyzers.
- **LLM Augmentation & Ingestion** _(Descoped 2026-02-17)_: Optional `vscode.lm` API integration for deeper change impact analysis. Removed because all modules were dormant with zero production callers; users bring their own AI assistants.
- **LLM Ingestion Pipeline** _(Descoped 2026-02-17)_: GraphRAG-style pipeline with chunking, edge extraction, and confidence calibration. Removed alongside the LLM augmentation decision.
- **SQLite GraphStore** _(Removed 2026-01-12)_: replaced by the mirror itself; "Live Docs ARE the database."
- **Language Server and Diagnostics** _(Removed 2026-02-18; the remaining LSP shell and the extension package removed 2026-09-27)_: the original ripple and diagnostics subsystem. Type-safe languages already have their own lint and IntelliSense; in-editor polyglot change detection was not mission-critical, and the tool's value moved to generating and showing the map. What survived until September was a 60-line server that answered no requests and a 78-line extension that registered one command.
- **Spec-Kit** _(Retired 2026-02-23)_: the bootstrapping scaffolding. Its specs, plans and task lists were migrated into `.mdmd` and have since been retired in turn.
- **Explorer HTTP Server** _(Removed 2026-03-10)_: the static bundle does everything the server did except open files in the editor.
- **AST Accuracy Benchmark, Benchmark Reports and Telemetry** _(Retired 2026-09-27)_: the mocha benchmark suite, the per-mode markdown reports under `reports/`, the manual benchmark workflow, the report builder and the inference-accuracy tracker. See "Accuracy Measurement" above for why. One observation from the November 2025 TypeScript oracle is worth carrying into the new one: it classified each edge as a runtime or a type-only binding, a distinction SCIP output does not make on its own.
- **Benchmark-only Inference Path and Fixture Oracles** _(Retired 2026-09-27)_: `packages/shared/src/inference` (regex heuristics plus a tree-sitter import extractor) was what the benchmark scored, but the shipped generator never called it. The C and Ruby "oracles" were in-repo regex scanners, so those two languages never had independent ground truth; SCIP covered TypeScript, Python, Rust, Java, C# and Go. The rebuilt oracle needs its own answer for C and Ruby. Three lessons carried forward: linking every C# partial-class peer flooded a Roslyn slice with false positives in November 2025, and only generated peers (`*.designer.cs`, `*.g.cs`) were linked after that; the shipped C# adapter has no partial-peer handling at all, and WebForms code-behind depends on controls declared in the designer file, so the tree-sitter adapter must cover it. A C oracle that scanned only `.c` files silently dropped every header-to-header include; headers are nodes. And the WebForms overrides file removed a real SCIP edge (`Default.aspx.cs → Default.aspx.designer.cs`) "to fit the heuristic", which is exactly the filter the Correctness rules forbid; it is recorded here as the cautionary case.
- **System Layer and Co-activation Clustering** _(Retired 2026-09-27)_: on-demand Layer-3 markdown that grouped files by statistically significant co-activation. The vision's "a system is a folder" supersedes finding systems by clustering, and the owner found the output noisy. The method, as dated history: a degree-corrected configuration model as the background, edges weighted per symbol, a Poisson tail test with Benjamini-Hochberg correction, validated against the fixtures cluster as a positive control. Two findings outlive it. Barrel re-export hubs inflate node degree until the graph's architectural signal disappears, which is why the package-level barrel was deleted on 2026-01-17 while module-level barrels stayed. Git co-change was rejected as a signal on 2025-11-10 because users' local trees differ and the output would not be deterministic. The owner's principle stands regardless of method: "It shouldn't be possible for our software to spit out useless or misleading statistical analysis. Do it the right way by default."
- **Headless Harness, Precision Report, Technical-debt Detector, Network Audit** _(Retired 2026-09-27)_: the headless harness replayed per-language fixtures through the generator and is covered by the Vitest integration project. `live-docs:report` compared the analyzer with a re-run of itself. `tech-debt` flagged files by size and age. `audit:network` and `safeFetch` guarded a network path the product no longer has; `SECURITY.md` now describes verification by inspection and by running the suites with no network stack.
- **Vendored Benchmark Fixtures** _(Retired 2026-09-27)_: seven pinned clones (ky, libuv, Newtonsoft.Json, mux, OkHttp, Requests, log) kept only their expectation JSON in the repository and were cloned on every gate run. The in-repo fixture corpus stays; see [Fixture Corpus](benchmark-fixtures.mdmd.md). Two dynamic patterns from the vendored code are candidates for hand-verified fixtures later: Requests' module aliasing (`requests.packages`, `requests.compat`) and rust-lang/log's macro-generated `$crate::__private_api` edges; neither is visible to a static scanner.
- **Copilot-era Steering and Planning Documents** _(Retired 2026-09-27)_: vendor-specific instruction files, daily-summary prompts, the capability-ID vision, the requirement, roadmap and backlog documents, and the falsifiability requirements were replaced by `AGENTS.md`, the rewritten vision, and the entries above. The chat archive was excluded from the Explorer bundle the same day.

## System References

### Related Architecture Docs

- [Live Documentation Pipeline](live-documentation-pipeline.mdmd.md) — generator, lint, and edge aggregation architecture
- [Polyglot Adapters](polyglot-adapters.mdmd.md) — language-specific symbol/dependency extraction

### Implementation Traceability

- [scripts/live-docs/generate.ts](../layer-4/scripts/live-docs/generate.ts.mdmd.md) implements the generation pipeline
- Symbol ingestion relies on the TypeScript compiler API and the polyglot adapters under `packages/shared/src/live-docs/adapters/`
- Integration suites under `tests/integration/live-docs/` validate key hypotheses
