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
- **Implication**: Our LSP can subscribe to the same incremental feed—no bespoke polling needed. For files outside open editors, we can request symbol/reference data via `workspace.findFiles` and `executeWorkspaceSymbolProvider`.
- **Reference**: Language Server Extension Guide documents incremental sync handlers, confirming that servers only receive deltas after the initial open, limiting reparsing overhead.

## Link Establishment Strategy
- **Decision (updated)**: Treat link relationships as an indexable projection rather than user-authored metadata. Default to auto-inferred links derived from existing language/intelligence providers (definitions, references, diagnostics) and optional external knowledge graphs. Allow explicit overrides via lightweight manifests only when inference fails, keeping the projection rebuildable at any time.
- **Rationale**: Mirrors VS Code’s workspace indexing philosophy—indexes are cached artifacts that can be regenerated on demand, avoiding brittle front matter requirements. Aligns with user preference to “ride” official tooling and ensures graph recovery is as easy as deleting the cache.
- **Alternatives Considered**: Mandatory front matter or CLI registration (rejected: high friction, hard to keep in sync); heuristic-only approach without override capability (rejected: lacks control for edge cases or proprietary patterns).

## ~~Baseline Inference & Fallbacks~~ *(Descoped 2026-02-17)*

> **Descoped**: LLM-based fallback inference has been removed from the project scope. The system relies exclusively on deterministic polyglot analyzers (Tree-sitter AST parsing) for graph construction. Users bring their own AI assistants and consume Live Docs as structured context.

~~- **Decision**: Implement a GraphRAG-style fallback that can construct the knowledge graph using heuristics and LLM analysis alone when native language-server signals are missing.~~
~~- **Rationale**: Ensures the system works in any workspace, with language-server data treated as an optimization that reduces token usage and improves precision. Aligns with open practices for building knowledge graphs directly from source text.~~
~~- **References**: Microsoft GraphRAG research highlights reproducible graph creation via LLM-driven pipelines; we adapt similar staging (chunking, edge extraction, ranking) for local inference.~~

## Graph Rebuild & Freshness (Updated 2026-01-12)
- **Decision**: Live Docs themselves serve as the canonical graph representation. Dependency relationships are encoded as markdown links and can be queried via `live-docs:inspect --from/--to`. No separate SQLite cache or external feeds are needed.
- **Rationale**: "Live Docs ARE the database" — eliminates cache invalidation complexity.

## Link Sources (Updated 2026-02-17)
- **Decision**: Live Documentation gathers potential relationships from two complementary sources:
  1. **Polyglot Adapters** — Tree-sitter-based AST parsing for symbols & dependencies (always available)
  2. **VS Code Symbols** — IDE workspace symbol index (extension only)
- **Rationale**: Both sources are deterministic and require no external runtime. LLM inference was originally listed as a third source but has been descoped (2026-02-17): users bring their own AI assistants and consume Live Docs as structured context, eliminating trust/safety/cost concerns from the tool itself.
- **Alternatives Descoped**: LLM Inference via Ollama or `vscode.lm` — all infrastructure was dormant/speculative with zero production callers.

## AST Benchmark Strategy
- **Decision**: Maintain a curated benchmark suite with canonical ASTs (starting with small C programs and expanding to other languages where ground truth is accessible) to validate inferred knowledge graphs during development, while continuing to run multi-pass self-similarity benchmarks for repositories that lack authoritative AST exports.
- **Rationale**: AST-backed comparisons provide a higher-fidelity accuracy signal whenever compiler-grade metadata is available, yet the fallback ensures every workspace still benefits from automated validation. Keeping both paths preserves reproducibility goals without over-relying on a single data source.
- **Alternatives Considered**: Depend exclusively on self-similarity metrics (rejected: weaker guarantee when ground truth exists); require AST availability for every benchmark (rejected: excludes important languages and bloats setup).

## ~~LLM Augmentation & Ingestion~~ *(Descoped 2026-02-17)*

> **Descoped**: LLM integration has been removed from the project scope. The `vscode.lm` API integration was never invoked in production. Users bring their own AI assistants and consume Live Docs as structured context. This eliminates trust, safety, cost, and hallucination-propagation concerns.

~~- **Decision**: Integrate optional reasoning through the `vscode.lm` API, respecting user-selected providers and exposing a “local-only” mode.~~
~~- **Rationale**: API abstracts cloud vs. local (Ollama) models, grants access to future improvements, and keeps consent/usage visible to users. Allows deeper change impact analysis without hard dependency.~~
~~- **Alternatives Considered**: Require dedicated Ollama instance (rejected: limits adoption); custom HTTP integration bypassing VS Code (rejected: duplicates policy handling, raises compliance risk).~~

### ~~LLM Ingestion Pipeline~~ *(Descoped 2026-02-17)*

~~- **Decision**: Adopt a GraphRAG-style pipeline that chunkifies artifacts, prompts `vscode.lm` providers for relationship JSON, and feeds calibrated confidence scores into the knowledge graph while storing prompt/model provenance for reproducibility.~~
~~- **Rationale**: Provides a deterministic, replayable path to harvest cross-file relationships from arbitrary text, ensuring we can bootstrap graphs in thin-tooling environments and audit every AI-sourced edge. Confidence grading lets diagnostics remain conservative until corroboration exists.~~
~~- **Implementation Notes**: Prompt templates will live under `packages/server/src/prompts/llm-ingestion/`; outputs flow through `LLMIngestionOrchestrator` → `RelationshipExtractor` → `ConfidenceCalibrator` before reaching `KnowledgeGraphBridge`. Dry-run snapshots under `AI-Agent-Workspace/llm-ingestion-snapshots/` allow regression testing without graph mutation.~~
~~- **Risks**: Token cost variability, potential hallucinated relationships, provider-specific JSON adherence. Mitigations include deterministic chunking, schema-constrained decoding, provenance logging, and human-in-the-loop promotion for low-confidence edges.~~

## Testing Approach
- **Decision**: Use `vitest` for shared modules, `@vscode/test-electron` for extension-client integration, and targeted contract tests for custom LSP messages.
- **Rationale**: Matches existing VS Code ecosystem practices, provides fast unit feedback, and ensures protocol stability.
- **Alternatives Considered**: Jest (less aligned with ESM/TypeScript setup); integration-only manual validation (insufficient coverage).

## Implementation Traceability
- [`scripts/live-docs/generate.ts`](../../scripts/live-docs/generate.ts) implements the Live Doc generation pipeline captured in this research.
- Symbol ingestion relies on polyglot heuristic adapters under `packages/shared/src/live-docs/adapters/` and the VS Code Workspace Symbols bridge in extension mode.
- [`tests/integration/live-docs/generation.test.ts`](../../tests/integration/live-docs/generation.test.ts) and [`tests/integration/live-docs/evidence.test.ts`](../../tests/integration/live-docs/evidence.test.ts) validate key hypotheses around Live Doc generation and evidence mapping.
