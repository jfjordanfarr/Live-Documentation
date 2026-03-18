# packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-circuitview-aggregation-ts
- Generated At: 2026-03-18T16:03:22.881Z

## Authored

### Purpose

Computes per-directory aggregate metrics (file count, symbol count, cross-boundary dependency counts, archetypes) at any level of the file hierarchy. These aggregates drive the visual weight and labeling of collapsed directory tiles in the Circuit Board's progressive disclosure treemap.

### Notes

- Extracted from the monolithic `circuitView.ts` (741 lines) during the Circuit Board progressive disclosure refactoring on [Dev Day 78](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-17.1.md). The refactoring followed the same pure-function decomposition pattern established by the Local Map's 7 test files.
- `computeChildAggregates` is the core generalized API: given any `DirectoryNode` in the hierarchy, it returns one `DirectoryAggregate` per effective child directory with single-child chains collapsed (e.g. `packages/shared/src` when `packages/` and `shared/` each have only one child).
- `findDirectoryByPath` enables the controller to walk the hierarchy tree to locate a specific directory node during drill-down navigation and sibling strip computation.
- `computeAggregateWeight` and `computeFileWeight` determine the proportional area of directory tiles and file cards respectively in the squarified layout. The weight formula uses file count as the primary factor with a 0.25× dependency bonus.
- The deprecated `computeDirectoryAggregates` wraps `computeChildAggregates(root)` for backward compatibility with existing call sites.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-18T16:03:22.881Z","inputHash":"38b920b4c72ae6ca"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `DirectoryAggregate` {#symbol-directoryaggregate}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts#L8)

##### `DirectoryAggregate` — Summary

Aggregate metrics for a single directory, computed from its child files.
Used to drive the visual weight and labels of collapsed directory tiles.

#### `computeChildAggregates` {#symbol-computechildaggregates}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts#L37)
- Returns: [`DirectoryAggregate`](#symbol-directoryaggregate)[]
- Parameters: `parentDir`: [`DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode)

##### `computeChildAggregates` — Summary

Computes aggregate metrics for the children of a given directory node.

This is the core progressive-disclosure aggregation: given any directory
in the hierarchy, it returns one DirectoryAggregate per effective child
directory. Single-child chains are collapsed (e.g. if `packages/` only
contains `shared/`, the aggregate is named `packages/shared` and points
to the deeper node).

##### `computeChildAggregates` — Parameters

- `parentDir`: The directory whose children to aggregate

##### `computeChildAggregates` — Returns

Array of aggregates for each effective child directory

#### `findDirectoryByPath` {#symbol-finddirectorybypath}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts#L96)
- Returns: [`DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode)
- Parameters: `root`: [`DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode)

##### `findDirectoryByPath` — Summary

Walks a hierarchy tree to find the DirectoryNode at a given path.
Returns null if the path doesn't exist in the tree.

#### `computeDirectoryAggregates` {#symbol-computedirectoryaggregates}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts#L125)
- Parameters: `root`: [`DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode); `_allNodes`: `ReadonlyArray`

##### `computeDirectoryAggregates` — Summary

Computes aggregate metrics for each top-level directory in a hierarchy.

##### `computeDirectoryAggregates` — Additional Documentation

- @deprecated Use computeChildAggregates(root) instead for progressive disclosure.

#### `computeAggregateWeight` {#symbol-computeaggregateweight}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts#L162)
- Parameters: `aggregate`: [`DirectoryAggregate`](#symbol-directoryaggregate)

##### `computeAggregateWeight` — Summary

Computes the total weight for a directory aggregate.
Weight determines the visual area of the tile in the squarified layout.
Uses file count as the primary factor with a dependency bonus.

#### `computeFileWeight` {#symbol-computefileweight}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/circuitView/aggregation.ts#L167)
- Parameters: `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `computeFileWeight` — Summary

Weight for a single file node in the squarified layout.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`types.DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->

### Observed Evidence

#### Vitest Unit Tests

- [aggregation.test.ts](./aggregation.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
