# Research Findings

> **Note (2025-12-19)**: This document captures architectural research from the project's early days (October–November 2025). While some sections reference superseded approaches (e.g., "Link-Aware Diagnostics" before the "Live Documentation" pivot), the competitive analysis and fundamental decisions remain valid. Refresh this document if undertaking new competitive research or architectural pivots.

## Diagnostic Architecture
- **Decision**: Use a Node.js-based language server, coordinated by a thin VS Code extension, to own graph construction and drift diagnostics.
- **Rationale**: LSP keeps analysis off the UI thread, enables reuse in other editors/CI, and aligns with official tooling guidance. Prior research confirmed diagnostics can be published via `connection.sendDiagnostics` and the VS Code client can remain lightweight.
- **Alternatives Considered**: Pure extension (rejected due to UI thread pressure and limited reuse); external service (rejected for added deployment complexity at pilot scale).

## Symbol Ingestion Strategy
- **Decision**: Prefer VS Code’s built-in `execute*Provider` commands and existing language-server diagnostics before falling back to custom parsing.
- **Rationale**: Lets us inherit improvements from maintained language servers and reduces maintenance. Diagnostic events and symbol providers already expose structured data.
- **Alternatives Considered**: Always run Tree-sitter parsing (rejected: duplicated effort, more upkeep); rely solely on LLM extraction (rejected: lower precision, higher cost).

## Workspace Indexing & Change Detection
- **Observation**: VS Code core maintains a file-service index backed by OS-level watchers (fsEvents, inotify, ReadDirectoryChangesW) and delivers incremental events to extensions; language servers receive `didOpen`, `didChange`, `didClose`, and `didSave` notifications for synchronized documents.
- **Implication**: Our LSP can subscribe to the same incremental feed—no bespoke polling needed. For files outside open editors, we can request symbol/reference data via `workspace.findFiles`, `executeWorkspaceSymbolProvider`, or by consuming LSIF/SCIP indexes emitted by existing tooling.
- **Reference**: Language Server Extension Guide documents incremental sync handlers, confirming that servers only receive deltas after the initial open, limiting reparsing overhead.

## Link Establishment Strategy
- **Decision (updated)**: Treat link relationships as an indexable projection rather than user-authored metadata. Default to auto-inferred links derived from existing language/intelligence providers (definitions, references, diagnostics) and optional external knowledge graphs. Allow explicit overrides via lightweight manifests only when inference fails, keeping the projection rebuildable at any time.
- **Rationale**: Mirrors VS Code’s workspace indexing philosophy—indexes are cached artifacts that can be regenerated on demand, avoiding brittle front matter requirements. Aligns with user preference to “ride” official tooling and ensures graph recovery is as easy as deleting the cache.
- **Alternatives Considered**: Mandatory front matter or CLI registration (rejected: high friction, hard to keep in sync); heuristic-only approach without override capability (rejected: lacks control for edge cases or proprietary patterns).

## Baseline Inference & Fallbacks
- **Decision**: Implement a GraphRAG-style fallback that can construct the knowledge graph using heuristics and LLM analysis alone when native language-server signals are missing.
- **Rationale**: Ensures the system works in any workspace, with language-server data treated as an optimization that reduces token usage and improves precision. Aligns with open practices for building knowledge graphs directly from source text.
- **References**: Microsoft GraphRAG research highlights reproducible graph creation via LLM-driven pipelines; we adapt similar staging (chunking, edge extraction, ranking) for local inference.

## Graph Rebuild & Freshness
- **Decision**: Store graph snapshots as ephemeral cache files alongside the SQLite store. On start or cache miss, rebuild by replaying symbol/reference queries, language-server diagnostics, and external knowledge-graph feeds.
- **Rationale**: Mimics VS Code’s rebuildable indexes (tsserver project service, LSIF caches). Ensures deleting the cache forces a clean reindex without data loss. Supports offline scenarios and easy migration between machines.
- **Alternatives Considered**: Treat graph as authoritative user data (rejected: complicates sync, increases risk when schema evolves); full in-memory rebuild on every activation (rejected: slower warm-up for large workspaces).

## Graph Storage Layer
- **Decision**: Persist artifact and relationship data in an embedded SQLite database with node/edge tables and indexes for typical traversals.
- **Rationale**: SQLite is lightweight, cross-platform, and proven for property-graph workloads at our target scale. Works offline and simplifies distribution.
- **Alternatives Considered**: KùzuDB (kept in reserve if queries require richer pattern matching); in-memory store only (rejected: no history/audit, loses data on restart).

## Knowledge Graph Schema Contract
- **Decision**: Require external feeds to provide artifact identifiers, edge types, directionality, timestamps, and optional confidence scores in a normalized schema that maps directly onto our SQLite tables. Support two ingestion modes—on-demand KnowledgeSnapshot imports and streaming feeds—that share the same contract so payloads can be validated consistently before mutation.
- **Rationale**: Allows deterministic ingestion regardless of provider (GitLab GKG, LSIF/SCIP exports, custom GraphRAG output) and makes validation straightforward before data mutates the graph store. Shared contracts ensure snapshot payloads can be replayed for reproducibility while streaming feeds can resume after outages by checkpointing the last accepted event.
- **Alternatives Considered**: Accept provider-specific payloads with on-the-fly mapping (rejected: hard to validate, increases maintenance); mandate a proprietary format (rejected: reduces interoperability).

## Feed Resilience Strategy
- **Decision**: Treat remote knowledge-graph feeds as optional accelerants—when a source goes stale or unreachable, surface a warning diagnostic, temporarily fence the feed, and revert to local inference until healthy data arrives. Maintain checkpoints so streaming feeds can replay missed messages, while snapshots retain their last approved version.
- **Rationale**: Keeps diagnostics trustworthy without blocking the core experience on external availability. Mirrors VS Code’s approach of tolerating index rebuilds when caches disappear.
- **Alternatives Considered**: Hard-fail diagnostics when feeds drop (rejected: harms usability); silently ignore failure (rejected: hides data quality issues).

## GitLab Knowledge Graph (GKG) Integration
- **Evaluation**: GKG exposes REST endpoints (`/projects/:id/knowledge_graph/nodes`, `/edges`) and webhook-delivered deltas that include stable identifiers, timestamps, edge kinds, and confidence values. Snapshots can be fetched with `include=metadata` to enrich drift analysis, while webhook payloads carry `sequence_id` for replay guarantees.
- **Approach**: Use authenticated REST pulls for initial snapshot ingestion, mapping GitLab node types to our artifact layers (e.g., `doc_requirement` → `requirements`, `code_module` → `code`). Subscribe to the `knowledge_graph_events` webhook to receive streaming updates; store the last `sequence_id` so the server can request missed events via backfill endpoint on reconnect. Apply provider-specific metadata (project path, labels) under the artifact metadata bag for downstream overrides.
- **Risks**: Webhooks arrive in project-scoped batches, so multi-project workspaces require deduplication. REST snapshot pagination can be heavy for large repos; recommend chunked ingestion with progress telemetry. Authorization depends on PAT scopes (`read_api`, `read_repository`) and must respect enterprise policies.
- **Fallback Plan**: When GKG is unavailable, revert to LSIF/SCIP exports produced via GitLab CI pipelines; the ingestion bridge shares the same schema so swapping sources is configuration-only.

## AST Benchmark Strategy
- **Decision**: Maintain a curated benchmark suite with canonical ASTs (starting with small C programs and expanding to other languages where ground truth is accessible) to validate inferred knowledge graphs during development, while continuing to run multi-pass self-similarity benchmarks for repositories that lack authoritative AST exports.
- **Rationale**: AST-backed comparisons provide a higher-fidelity accuracy signal whenever compiler-grade metadata is available, yet the fallback ensures every workspace still benefits from automated validation. Keeping both paths preserves reproducibility goals without over-relying on a single data source.
- **Alternatives Considered**: Depend exclusively on self-similarity metrics (rejected: weaker guarantee when ground truth exists); require AST availability for every benchmark (rejected: excludes important languages and bloats setup).

## LLM Augmentation & Ingestion
- **Decision**: Integrate optional reasoning through the `vscode.lm` API, respecting user-selected providers and exposing a “local-only” mode.
- **Rationale**: API abstracts cloud vs. local (Ollama) models, grants access to future improvements, and keeps consent/usage visible to users. Allows deeper change impact analysis without hard dependency.
- **Alternatives Considered**: Require dedicated Ollama instance (rejected: limits adoption); custom HTTP integration bypassing VS Code (rejected: duplicates policy handling, raises compliance risk).

### LLM Ingestion Pipeline
- **Decision**: Adopt a GraphRAG-style pipeline that chunkifies artifacts, prompts `vscode.lm` providers for relationship JSON, and feeds calibrated confidence scores into the knowledge graph while storing prompt/model provenance for reproducibility.
- **Rationale**: Provides a deterministic, replayable path to harvest cross-file relationships from arbitrary text, ensuring we can bootstrap graphs in thin-tooling environments and audit every AI-sourced edge. Confidence grading lets diagnostics remain conservative until corroboration exists.
- **Implementation Notes**: Prompt templates will live under `packages/server/src/prompts/llm-ingestion/`; outputs flow through `LLMIngestionOrchestrator` → `RelationshipExtractor` → `ConfidenceCalibrator` before reaching `KnowledgeGraphBridge`. Dry-run snapshots under `AI-Agent-Workspace/llm-ingestion-snapshots/` allow regression testing without graph mutation.
- **Risks**: Token cost variability, potential hallucinated relationships, provider-specific JSON adherence. Mitigations include deterministic chunking, schema-constrained decoding, provenance logging, and human-in-the-loop promotion for low-confidence edges.

## Testing Approach
- **Decision**: Use `vitest` for shared modules, `@vscode/test-electron` for extension-client integration, and targeted contract tests for custom LSP messages.
- **Rationale**: Matches existing VS Code ecosystem practices, provides fast unit feedback, and ensures protocol stability.
- **Alternatives Considered**: Jest (less aligned with ESM/TypeScript setup); integration-only manual validation (insufficient coverage).

## Implementation Traceability
- [`packages/server/src/runtime/changeProcessor.ts`](../../packages/server/src/runtime/changeProcessor.ts) implements the diagnostic architecture decisions captured above.
- [`packages/server/src/features/knowledge/workspaceIndexProvider.ts`](../../packages/server/src/features/knowledge/workspaceIndexProvider.ts), [`lsifParser.ts`](../../packages/server/src/features/knowledge/lsifParser.ts), and [`scipParser.ts`](../../packages/server/src/features/knowledge/scipParser.ts) operationalise the symbol ingestion and fallback strategies.
- [`packages/server/src/features/knowledge/knowledgeGraphIngestor.ts`](../../packages/server/src/features/knowledge/knowledgeGraphIngestor.ts) and [`feedCheckpointStore.ts`](../../packages/server/src/features/knowledge/feedCheckpointStore.ts) cover the feed resilience and schema contract research outcomes.
- [`packages/server/src/features/knowledge/llmIngestionOrchestrator.ts`](../../packages/server/src/features/knowledge/llmIngestionOrchestrator.ts) translates the LLM augmentation findings into executable pipeline stages.
- [`tests/integration/us5/transformRipple.test.ts`](../../tests/integration/us5/transformRipple.test.ts) and [`tests/integration/us3/markdownLinkDrift.test.ts`](../../tests/integration/us3/markdownLinkDrift.test.ts) validate key hypotheses around ripple analysis and documentation drift surfaced in this research.
