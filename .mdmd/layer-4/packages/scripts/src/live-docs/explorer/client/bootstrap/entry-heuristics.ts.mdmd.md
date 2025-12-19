# packages/scripts/src/live-docs/explorer/client/bootstrap/entry-heuristics.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/bootstrap/entry-heuristics.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-bootstrap-entry-heuristics-ts
- Generated At: 2025-12-19T21:19:50.700Z

## Authored
### Purpose
Infers the best default entry node when launching the Explorer without a specific artifact selected. Scores nodes based on centrality, archetype, and naming patterns to surface the most "interesting" starting point.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19) as part of Phase 2 tech-debt reduction. The `inferDefaultEntryNodeId()` function is called during bootstrap when no node ID is in the URL.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:19:50.700Z","inputHash":"59180c1e310952eb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkEndpointResolver` {#symbol-linkendpointresolver}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/bootstrap/entry-heuristics.ts#L19)
- Parameters: `_unnamed_`: [`ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)

##### `LinkEndpointResolver` — Summary
Resolver for link endpoints to node IDs

#### `scoreNode` {#symbol-scorenode}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/bootstrap/entry-heuristics.ts#L48)

##### `scoreNode` — Summary
Score a node for entry-point likelihood.
Higher scores indicate more likely entry points.

##### `scoreNode` — Parameters
- `degreeById`: Pre-computed degree counts for graph centrality
- `node`: The node to score

##### `scoreNode` — Returns
A score, with negative values indicating exclusion

#### `buildDegreeMap` {#symbol-builddegreemap}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/bootstrap/entry-heuristics.ts#L113)

##### `buildDegreeMap` — Summary
Build a degree map for all nodes in the graph.
Counts both inbound and outbound links for each node.

#### `inferDefaultEntryNodeId` {#symbol-inferdefaultentrynodeid}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/bootstrap/entry-heuristics.ts#L138)

##### `inferDefaultEntryNodeId` — Summary
Infer the best default entry node when none is specified.
Returns null if no suitable node can be found.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
