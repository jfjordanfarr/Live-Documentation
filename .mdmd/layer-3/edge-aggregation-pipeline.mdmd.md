# Edge Aggregation Pipeline

## Metadata
- Layer: 3
- Component IDs: COMP-301, COMP-302, COMP-303
- Supersedes: COMP-005 (Knowledge Graph Ingestion), portions of COMP-006 (LLM Ingestion Pipeline)

## Overview

This document describes the **unified edge aggregation architecture** that consolidates all sources of file-to-file and symbol-to-symbol relationships into Live Documentation markdown. This design eliminates the SQLite-based `GraphStore` in favour of a streaming, file-based pipeline where **Live Docs ARE the database**.

### Design Principles

1. **Single Source of Truth**: Live Documentation markdown files are the canonical repository of workspace connectivity.
2. **Streaming Aggregation**: Intermediate edges are stored in NDJSON files, enabling memory-efficient processing of large workspaces.
3. **Multi-Source Fusion**: Polyglot adapters and LLM inference emit the same `PendingEdge` format.
4. **Statistical LLM Sampling**: Small local LLMs (e.g., qwen3-coder:30b) are sampled multiple times; edges are accepted based on voting consensus.
5. **Provenance Tracking**: Every edge retains its source(s), enabling transparency and conflict resolution.

---

## Link Sources

Live Documentation gathers potential relationships from three complementary sources:

| Source | Description | Availability |
|--------|-------------|--------------|
| **Polyglot Adapters** | Tree-sitter-based AST parsing for symbols & dependencies | Always (NPM + Extension) |
| **LLM Inference** | Multi-sampled inference with local LLMs (Ollama) or VS Code's configured LLM | Opt-in (NPM via Ollama, Extension via `vscode.lm`) |
| **VS Code Symbols** | IDE workspace symbol index | Extension only |

These sources are **complimentary**, not hierarchical — each contributes edges that the others may miss.

---

## Components

### COMP-301 Edge Collector
Coordinates the emission of `PendingEdge` records from all knowledge sources into the staging area.

### COMP-302 Edge Aggregator
Merges pending edges across sources, applies LLM voting consensus, resolves target symbols to file paths, and emits `ResolvedEdge` records.

### COMP-303 Live Doc Edge Writer
Updates the `## Dependencies` section of Live Documentation files with aggregated edges, preserving authored content and adding provenance markers.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         LINK SOURCES                                  │
├──────────────────────┬──────────────────────┬────────────────────────┤
│ Polyglot Adapters    │ LLM Inference        │ VS Code Symbols        │
│ (Ruby, Rust, Python, │ (Ollama or vscode.lm)│ (Extension only)       │
│  C#, Java, C, TS...) │ × N samples          │                        │
└──────────┬───────────┴──────────┬───────────┴────────────┬───────────┘
           │                      │                        │
           ▼                      ▼                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        COMP-301: EDGE COLLECTOR                       │
│                                                                       │
│  Writes PendingEdge records to NDJSON files:                         │
│  .live-documentation/pending-edges/                                   │
│    ├── adapters.ndjson                                                │
│    ├── llm-batch-{hash}-001.ndjson                                    │
│    ├── llm-batch-{hash}-002.ndjson                                    │
│    └── vscode-symbols.ndjson                                          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       COMP-302: EDGE AGGREGATOR                       │
│                                                                       │
│  1. Stream-read all NDJSON files                                     │
│  2. Group by (sourceUri, targetUri, kind)                            │
│  3. LLM voting: count agreement across samples                       │
│  4. Provenance merge: track all sources that contributed             │
│  5. Resolve targetSymbol → targetUri via workspace symbol index      │
│  6. Output: Map<sourceUri, ResolvedEdge[]>                           │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   COMP-303: LIVE DOC EDGE WRITER                      │
│                                                                       │
│  For each sourceUri with resolved edges:                             │
│    1. Read existing Live Doc (preserve authored sections)            │
│    2. Merge edges into ## Dependencies section                       │
│    3. Add provenance markers as HTML comments                        │
│    4. Write updated Live Doc atomically                              │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       LIVE DOCUMENTATION                              │
│                                                                       │
│  .live-documentation/source/src/app.ts.md                            │
│                                                                       │
│  ## Dependencies                                                      │
│  <!-- edge-provenance: adapter:typescript, llm:qwen3@4/5 -->         │
│  - ⟦UserService⟧(./services/userService.ts.md)                       │
│  - ⟦DatabaseConfig⟧(./config/database.ts.md)                         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Contracts

### PendingEdge

The canonical intermediate format emitted by all knowledge sources:

```typescript
interface PendingEdge {
  /** Workspace-relative source file path */
  sourceUri: string;
  /** Source symbol name, if known */
  sourceSymbol?: string;
  /** Resolved target file path (null if unresolved) */
  targetUri?: string;
  /** Target symbol name (used for resolution if targetUri is null) */
  targetSymbol?: string;
  /** Relationship type */
  kind: 'depends_on' | 'references' | 'implements' | 'calls' | 'uses';
  /** Confidence score 0.0–1.0 */
  confidence: number;
  /** Source identifier: 'adapter:ruby', 'vscode-symbols', 'llm:qwen3-coder', etc. */
  provenance: string;
  /** Human-readable explanation (especially for LLM-inferred edges) */
  reason?: string;
  /** Source location within the file, if available */
  location?: { line: number; column: number };
}
```

### ResolvedEdge

The aggregated output after merging and symbol resolution:

```typescript
interface ResolvedEdge {
  /** Workspace-relative source file path */
  sourceUri: string;
  /** Workspace-relative target file path (always resolved) */
  targetUri: string;
  /** Target symbol anchor, if applicable */
  targetAnchor?: string;
  /** Relationship type */
  kind: EdgeKind;
  /** Maximum confidence across all contributing sources */
  confidence: number;
  /** All provenances that contributed this edge */
  provenances: string[];
  /** LLM voting result, if applicable (e.g., "4/5") */
  llmVotes?: string;
}
```

---

## Responsibilities

### Edge Collection (COMP-301)

- **Polyglot Adapter Emission**: Each language adapter (`rubyAdapter`, `pythonAdapter`, `rustAdapter`, etc.) emits `PendingEdge` records during source analysis.
- **LLM Inference**: The Ollama bridge (or VS Code `vscode.lm` API) prompts the local model with source file context and workspace file listings, then parses structured JSON responses into `PendingEdge` records.
- **VS Code Symbols**: The extension's `symbolBridge.ts` queries VS Code's workspace symbol index and emits `PendingEdge` records for resolved references.
- **Immediate Persistence**: Each source writes its edges to disk immediately as NDJSON, avoiding memory accumulation.

### Edge Aggregation (COMP-302)

- **Stream Merging**: Read all NDJSON files line-by-line without loading the full set into memory.
- **Grouping**: Group edges by `(sourceUri, targetUri, kind)` tuple.
- **LLM Voting**: For edges from LLM samples, count how many samples agree. Accept edges meeting a configurable threshold (e.g., ≥3/5 samples).
- **Provenance Merge**: Combine all source attributions into the `provenances` array.
- **Symbol Resolution**: For edges with `targetSymbol` but no `targetUri`, query the workspace symbol index to resolve the target file.
- **Conflict Detection**: Flag cases where different sources disagree on edge existence or kind.

### Live Doc Writing (COMP-303)

- **Template Preservation**: Load existing Live Doc, identify authored sections (`Description`, `Purpose`, `Notes`), and preserve them.
- **Dependencies Merge**: Update the `## Dependencies` section with resolved edges, maintaining link syntax and archetype conventions.
- **Provenance Markers**: Embed HTML comments with provenance metadata for auditability:
  ```markdown
  <!-- edge-provenance: adapter:typescript@1.0, llm:qwen3@4/5 -->
  ```
- **Atomic Writes**: Write via temp file + rename to prevent partial updates.

---

## LLM Multi-Sample Inference

### Rationale

Small local LLMs are cost-effective for polyglot "common sense" edge detection but may produce inconsistent outputs. Sampling multiple times and voting on results provides statistical confidence without requiring expensive large models.

### Process

1. **Prompt Construction**: Build a prompt containing:
   - Source file path and content (or Live Doc summary)
   - List of workspace files with their exported symbols
   - Task: identify likely dependencies or references

2. **Multi-Sample Execution**:
   ```typescript
   for (let sample = 0; sample < sampleCount; sample++) {
     const response = await ollama.chat({
       model: "qwen3-coder:30b",
       messages: [buildEdgeInferencePrompt(sourceFile, workspaceFiles)]
     });
     const edges = parseEdgeResponse(response);
     await appendNdjson(`llm-batch-${sourceHash}-${sample}.ndjson`, edges);
   }
   ```

3. **Voting Aggregation**:
   ```typescript
   // For each unique (source, target, kind) tuple:
   const votes = samples.filter(s => s.has(edge)).length;
   const confidence = votes / sampleCount; // e.g., 4/5 = 0.80
   const accepted = votes >= Math.ceil(sampleCount * votingThreshold);
   ```

### Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `llm.sampleCount` | 5 | Number of inference samples per source file |
| `llm.votingThreshold` | 0.6 | Minimum vote fraction to accept an edge |
| `llm.model` | `qwen3-coder:30b` | Ollama model identifier |
| `llm.maxConcurrent` | 1 | Parallel inference jobs |

---

## Interfaces

### Inbound Interfaces

- **Analyzer Outputs**: Language adapters emit `PendingEdge` during `analyzeSourceFile()`.
- **LLM Responses**: Ollama/vscode.lm inference structured JSON → `PendingEdge`.
- **VS Code Symbols**: Extension bridge emits `PendingEdge` from workspace symbol queries.
- **CLI Commands**: `live-docs:generate --with-edges` triggers full pipeline.

### Outbound Interfaces

- **Live Documentation**: Updated `## Dependencies` sections with provenance.
- **buildLiveDocGraph()**: Reads Live Docs to construct in-memory graph for queries.
- **live-docs:inspect**: Path traversal via `graph.inbound` / `graph.nodes`.
- **live-docs:visualize**: Explorer views consume the Live Doc graph.

---

## Linked Implementations

### IMP-601 edgeCollector *(planned)*
Coordinates `PendingEdge` emission from all sources. Will reside at `packages/shared/src/live-docs/edges/collector.ts`.

### IMP-602 edgeAggregator *(planned)*
Merges NDJSON files, applies voting, resolves symbols. Will reside at `packages/shared/src/live-docs/edges/aggregator.ts`.

### IMP-603 liveDocEdgeWriter *(planned)*
Updates Live Doc markdown with resolved edges. Will integrate with `generator.ts`.

### IMP-502 liveDocGraph *(existing)*
Constructs in-memory graph from Live Doc markdown; LLM-inferred edges are captured via the edge collection format. See [liveDocGraph.ts Live Doc](../layer-4/packages/scripts/src/live-docs/graph/liveDocGraph.ts.mdmd.md).

### IMP-701 buildLiveDocGraph *(existing)*
Parses Live Doc markdown to construct in-memory graph. See [liveDocGraph.ts](../layer-4/packages/scripts/src/live-docs/graph/liveDocGraph.ts.mdmd.md).

---

## Evidence

- **Polyglot Adapter Tests**: `ruby.typeref.test.ts`, `python.typeref.test.ts`, etc. validate symbol and dependency extraction.
- **LLM Integration**: `llmIngestionDryRun.test.ts` exercises prompt construction and response parsing.
- **Live Doc Graph Tests**: `inspect-cli.test.ts`, `liveDocGraph.test.ts` validate graph construction from markdown.
- **Benchmark Reports**: `reports/benchmarks/live-docs/` captures precision/recall for generated Dependencies sections.

---

## Operational Notes

- **Staging Directory**: Pending edges accumulate in `.live-documentation/pending-edges/`. This directory can be cleared after successful aggregation or retained for debugging.
- **Incremental Updates**: Future work will support incremental edge collection for changed files only, avoiding full workspace re-analysis.
- **LLM Opt-In**: LLM inference remains optional; workspaces without Ollama configured fall back to adapter-only edges.
- **Provenance Transparency**: HTML comments in Live Docs enable `live-docs:inspect --provenance` to show edge sources.

---

## Related Documents

- [Live Documentation Pipeline](live-documentation-pipeline.mdmd.md) — Generator coordination
- [Polyglot Oracles and Sampling](polyglot-oracles-and-sampling.mdmd.md) — LLM sampling strategies
