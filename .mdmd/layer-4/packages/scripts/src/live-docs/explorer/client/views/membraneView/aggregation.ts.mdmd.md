# packages/scripts/src/live-docs/explorer/client/views/membraneView/aggregation.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/aggregation.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-aggregation-ts
- Generated At: 2026-03-25T17:08:29.561Z

## Authored
### Purpose

Recursive directory aggregate computation for the Membrane Map, extending the Circuit Board's per-level aggregation to produce file count, symbol count, cross-boundary dependency counts, and archetype sets for every directory in the hierarchy tree.

### Notes

- Created during [Dev Day 80 Step 5](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as part of the Browse Mode Rendering rung, alongside the browse renderer and controller.
- Reuses the Circuit Board's `DirectoryAggregate` type from `circuitView/aggregation.ts` to maintain a consistent shape across views — the difference is that this module computes aggregates for ALL directories (recursive), not just direct children of a selected parent.
- `collectAllFiles` recursively gathers every `ExplorerNodePayload` leaf under a directory subtree; `computeAllAggregates` walks the tree, computing cross-boundary dependencies by comparing each file's dependency/dependent lists against the set of files within its own directory, counting only edges that cross the membrane boundary.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-25T17:08:29.561Z","inputHash":"f66f511e1fa55b49"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `computeAllAggregates` {#symbol-computeallaggregates}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/aggregation.ts#L30)
- Parameters: `root`: [`DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode)

##### `computeAllAggregates` — Summary
Compute aggregate metrics for every directory in the tree.

Returns a Map keyed by directory path. Each value contains file count,
symbol count, cross-boundary dependency counts, and archetype set —
the same shape as the Circuit Board's DirectoryAggregate.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`aggregation.DirectoryAggregate`](../circuitView/aggregation.ts.mdmd.md#symbol-directoryaggregate) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
