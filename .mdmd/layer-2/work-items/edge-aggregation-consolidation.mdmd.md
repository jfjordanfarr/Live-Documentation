# Edge Aggregation Consolidation

## Metadata
- Layer: 2
- Status: Planned
- Priority: High
- Estimated Effort: 4-6 dev sessions
- Architecture: [Edge Aggregation Pipeline](../../layer-3/edge-aggregation-pipeline.mdmd.md)

## Overview

This work item tracks the migration from SQLite-based `GraphStore` to the unified edge aggregation pipeline where **Live Docs ARE the database**. The architecture is fully specified in the linked Layer 3 document.

## Motivation

The current codebase maintains **two parallel configurations** for workspace analysis:

1. **`live-docs:generate`**: Uses polyglot language adapters to extract symbols and dependencies, writes to markdown Live Docs
2. **`graph:snapshot`**: Uses TypeScript-only `tsSymbolExtractor` to populate a SQLite database for runtime queries

This duplication creates maintenance burden, configuration divergence, and unnecessary complexity. With `buildLiveDocGraph()` already capable of reading Live Docs into an in-memory graph, the SQLite layer is redundant.

## Acceptance Criteria

- [ ] Extension runtime uses `buildLiveDocGraph()` for ripple impact analysis instead of `RippleAnalyzer`
- [ ] `changeProcessor.ts` no longer requires `GraphStore` initialization
- [ ] `graph:*` npm scripts are removed
- [ ] `data/graph-snapshots/` folder is removed
- [ ] `safe-to-commit.mjs` no longer calls `graph:snapshot`
- [ ] LSIF/SCIP feeds emit `PendingEdge` NDJSON instead of SQLite mutations
- [ ] LLM inference emits `PendingEdge` NDJSON instead of SQLite mutations
- [ ] All existing tests pass or are migrated to Live Doc-based assertions

## Phased Implementation Plan

### Phase 1: Live Doc Graph Query Parity
**Goal**: Ensure `buildLiveDocGraph()` supports all query patterns currently served by `RippleAnalyzer`.

- [ ] Add `inboundBFS(uri, maxDepth)` method to Live Doc graph
- [ ] Add `outboundBFS(uri, maxDepth)` method to Live Doc graph
- [ ] Add `getArtifactByUri(uri)` equivalent using node lookup
- [ ] Write unit tests comparing BFS results against known fixture graphs

### Phase 2: PendingEdge Infrastructure
**Goal**: Create the NDJSON staging infrastructure for edge aggregation.

- [ ] Define `PendingEdge` and `ResolvedEdge` types in `packages/shared/`
- [ ] Create `edgeCollector.ts` with `appendEdge()` function
- [ ] Create `edgeAggregator.ts` with streaming merge + voting logic
- [ ] Create `liveDocEdgeWriter.ts` to update `## Dependencies` sections
- [ ] Write integration tests for the full collect → aggregate → write pipeline

### Phase 3: Adapter Migration
**Goal**: Refactor polyglot adapters to emit `PendingEdge` via collector.

- [ ] Update `rubyAdapter`, `pythonAdapter`, `rustAdapter`, etc.
- [ ] Ensure existing benchmark precision/recall is maintained
- [ ] Remove any direct GraphStore writes from adapters

### Phase 4: Feed Parser Migration
**Goal**: Refactor LSIF/SCIP parsers to emit `PendingEdge`.

- [ ] Update `lsifParser.ts` to call `edgeCollector.appendEdge()`
- [ ] Update `scipParser.ts` to call `edgeCollector.appendEdge()`
- [ ] Update `knowledgeGraphBridge.ts` to coordinate feed → collector flow

### Phase 5: Runtime Refactoring
**Goal**: Replace `RippleAnalyzer` + `GraphStore` with Live Doc graph.

- [ ] Update `changeProcessor.ts` to use `buildLiveDocGraph()` for ripple
- [ ] Remove `GraphStore` initialization from `main.ts`
- [ ] Update diagnostic publishing to use Live Doc graph nodes
- [ ] Verify extension runtime works end-to-end

### Phase 6: Cleanup
**Goal**: Remove all deprecated infrastructure.

- [ ] Delete `graphStore.ts`, `graphStore.types.ts`, `graphStore.mappers.ts`, `graphStore.test.ts`
- [ ] Delete `rippleAnalyzer.ts`, `rippleAnalyzer.test.ts`
- [ ] Delete `scripts/graph-tools/` folder
- [ ] Delete `data/graph-snapshots/` folder
- [ ] Remove `graph:*` scripts from `package.json`
- [ ] Update `safe-to-commit.mjs` to remove `graph:snapshot` call
- [ ] Update or remove dependent tests (`llmIngestionDryRun.test.ts`, `rebuildStability.test.ts`)
- [ ] Update copilot-instructions.md to remove `graph:*` command references

## Files to Delete (Phase 6)

| File | Reason |
|------|--------|
| `packages/shared/src/db/graphStore.ts` | Replaced by Live Doc graph |
| `packages/shared/src/db/graphStore.types.ts` | Types no longer needed |
| `packages/shared/src/db/graphStore.mappers.ts` | SQLite mappers no longer needed |
| `packages/shared/src/db/graphStore.test.ts` | Tests for deleted code |
| `packages/server/src/features/knowledge/rippleAnalyzer.ts` | Replaced by `graph.inbound` |
| `packages/server/src/features/knowledge/rippleAnalyzer.test.ts` | Tests for deleted code |
| `scripts/graph-tools/snapshot-workspace.ts` | No longer needed |
| `scripts/graph-tools/inspect-symbol.ts` | Replaced by `live-docs:inspect` |
| `scripts/graph-tools/audit-doc-coverage.ts` | Replaced by `live-docs:lint` |
| `data/graph-snapshots/workspace.snapshot.json` | SQLite artifact |
| `data/graph-snapshots/symbol-fixture.json` | SQLite artifact |

## Files to Refactor

| File | Current | After |
|------|---------|-------|
| `packages/server/src/main.ts` | Creates `GraphStore` | Remove GraphStore init |
| `packages/server/src/runtime/changeProcessor.ts` | Uses `RippleAnalyzer` | Use `buildLiveDocGraph().inbound` |
| `packages/shared/src/knowledge/knowledgeGraphBridge.ts` | Feed → SQLite | Feed → PendingEdge NDJSON |
| `packages/server/src/features/knowledge/llmIngestionOrchestrator.ts` | Edges → SQLite | Edges → PendingEdge NDJSON |
| `packages/shared/src/index.ts` | Exports `GraphStore` | Remove export |
| `package.json` | Has `graph:*` scripts | Remove scripts |
| `scripts/safe-to-commit.mjs` | Calls `graph:snapshot` | Remove call |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Live Doc graph queries slower than SQLite | Benchmark; add caching if needed |
| BFS traversal differs from RippleAnalyzer | Compare outputs in test harness before switching |
| LLM voting adds latency | Voting is batch-mode; not on hot path |
| NDJSON disk usage | Clear staging after successful aggregation |

## Related Documents

- [Edge Aggregation Pipeline](../../layer-3/edge-aggregation-pipeline.mdmd.md) — Full architecture
- [Internal Tooling](../internal-tooling.mdmd.md) — Current `graph:*` command documentation
- [Live Documentation Pipeline](../../layer-3/live-documentation-pipeline.mdmd.md) — Generator context

## Notes

This work item was created after an attempted big-bang deletion revealed the scope of `changeProcessor.ts` integration. A phased approach ensures the codebase remains buildable and testable throughout the migration.
