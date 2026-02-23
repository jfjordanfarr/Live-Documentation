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
- Descoped decisions are retained as brief audit trail entries; the full context lives in the chat history (Dev Days 70–72, February 2026).
- This document was originally `specs/001-link-aware-diagnostics/research.md`.

## Decisions

### Diagnostic Architecture

- **Decision**: Use a Node.js-based language server, coordinated by a thin VS Code extension, to own graph construction and lint diagnostics.
- **Rationale**: LSP keeps analysis off the UI thread, enables reuse in other editors/CI, and aligns with official tooling guidance. Diagnostics can be published via `connection.sendDiagnostics` while the VS Code client remains lightweight.
- **Alternatives Considered**: Pure extension (rejected: UI thread pressure, limited reuse); external service (rejected: added deployment complexity at pilot scale).

### Symbol Ingestion Strategy

- **Decision**: Prefer VS Code's built-in `execute*Provider` commands and existing language-server diagnostics before falling back to custom parsing.
- **Rationale**: Inherits improvements from maintained language servers and reduces maintenance. Diagnostic events and symbol providers already expose structured data.
- **Alternatives Considered**: Always run Tree-sitter parsing (rejected: duplicated effort, more upkeep); rely solely on LLM extraction (rejected: lower precision, higher cost).

### Workspace Indexing & Change Detection

- **Observation**: VS Code core maintains a file-service index backed by OS-level watchers and delivers incremental events to extensions; language servers receive `didOpen`, `didChange`, `didClose`, and `didSave` notifications.
- **Implication**: Our LSP subscribes to the same incremental feed — no bespoke polling needed. For files outside open editors, `workspace.findFiles` and `executeWorkspaceSymbolProvider` provide reach.

### Link Establishment Strategy

- **Decision (updated)**: Treat link relationships as an indexable projection rather than user-authored metadata. Default to auto-inferred links derived from language/intelligence providers (definitions, references, diagnostics) and optional external knowledge graphs. Allow explicit overrides via lightweight manifests only when inference fails.
- **Rationale**: Mirrors VS Code's workspace indexing philosophy — indexes are cached artifacts regenerable on demand, avoiding brittle front matter. Aligns with user preference to "ride" official tooling.
- **Alternatives Considered**: Mandatory front matter or CLI registration (rejected: high friction, hard to keep in sync); heuristic-only without override capability (rejected: lacks control for edge cases).

### Graph Rebuild & Freshness _(Updated 2026-01-12)_

- **Decision**: Live Docs themselves serve as the canonical graph representation. Dependency relationships are encoded as markdown links and queried via `live-docs:inspect --from/--to`. No separate SQLite cache or external feeds are needed.
- **Rationale**: "Live Docs ARE the database" — eliminates cache invalidation complexity. See [Edge Aggregation Consolidation](../layer-2/work-items/edge-aggregation-consolidation.mdmd.md) for the migration history.

### Link Sources _(Updated 2026-02-17)_

- **Decision**: Live Documentation gathers relationships from two complementary sources:
  1. **Polyglot Adapters** — Tree-sitter-based AST parsing for symbols & dependencies (always available)
  2. **VS Code Symbols** — IDE workspace symbol index (extension only)
- **Rationale**: Both sources are deterministic and require no external runtime.
- **Descoped Alternative**: LLM Inference via Ollama or `vscode.lm` — all infrastructure was dormant/speculative with zero production callers. Removed 2026-02-17.

### AST Benchmark Strategy

- **Decision**: Maintain a curated benchmark suite with canonical ASTs (starting with small C programs, expanding to other languages where ground truth is accessible) to validate inferred knowledge graphs, while continuing multi-pass self-similarity benchmarks for repositories that lack authoritative AST exports.
- **Rationale**: AST-backed comparisons provide higher-fidelity accuracy whenever compiler-grade metadata is available, yet the self-similarity fallback ensures every workspace still benefits from automated validation.
- **Alternatives Considered**: Depend exclusively on self-similarity metrics (rejected: weaker guarantee when ground truth exists); require AST availability for every benchmark (rejected: excludes important languages and bloats setup).

### Testing Approach

- **Decision**: Use `vitest` for shared modules, `@vscode/test-electron` for extension-client integration, and targeted contract tests for custom LSP messages.
- **Rationale**: Matches existing VS Code ecosystem practices, provides fast unit feedback, and ensures protocol stability.
- **Alternatives Considered**: Jest (less aligned with ESM/TypeScript setup); integration-only manual validation (insufficient coverage).

## Descoped Decisions (Audit Trail)

The following decisions were explored and explicitly removed from scope during the Dev Day 70–72 codebase cleanup (February 2026). They are retained here for architectural traceability.

- **Baseline Inference & Fallbacks** _(Descoped 2026-02-17)_: GraphRAG-style LLM fallback for graph construction when native language-server signals are missing. Removed because the system relies exclusively on deterministic polyglot analyzers.
- **LLM Augmentation & Ingestion** _(Descoped 2026-02-17)_: Optional `vscode.lm` API integration for deeper change impact analysis. Removed because all modules were dormant with zero production callers; users bring their own AI assistants.
- **LLM Ingestion Pipeline** _(Descoped 2026-02-17)_: GraphRAG-style pipeline with chunking, edge extraction, and confidence calibration. Removed alongside the LLM augmentation decision.

## System References

### Related Architecture Docs

- [Live Documentation Pipeline](live-documentation-pipeline.mdmd.md) — generator, lint, and edge aggregation architecture
- [Polyglot Adapters](polyglot-adapters.mdmd.md) — language-specific symbol/dependency extraction
- [Language Server Architecture](language-server-architecture.mdmd.md) — LSP server design
- [Shared Contracts](live-documentation-shared-contracts.mdmd.md) — domain model types

### Implementation Traceability

- [scripts/live-docs/generate.ts](../layer-4/scripts/live-docs/generate.ts.mdmd.md) implements the generation pipeline
- Symbol ingestion relies on polyglot adapters under `packages/shared/src/live-docs/adapters/` and the VS Code Workspace Symbols bridge in extension mode
- Integration suites under `tests/integration/live-docs/` validate key hypotheses
