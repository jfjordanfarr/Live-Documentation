# packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-subgraph-builder-ts
- Generated At: 2025-12-19T21:55:44.552Z

## Authored
### Purpose
Pure functions for building local subgraphs from the full Explorer graph. Creates the subset of nodes and edges centered on a focus node, with proper inbound/outbound direction classification.

### Notes
Extracted from controller.ts during Dev Day 50 (12/19). The `createLocalSubgraph()` function builds exploration-mode subgraphs; `buildPathSubgraph()` handles path-mode with adjacent-only edge filtering.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:55:44.552Z","inputHash":"dac6631af4cd14a9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NodeFilter` {#symbol-nodefilter}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts#L17)
- Parameters: `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `NodeFilter` — Summary
Filter function to determine if a node should be included in the subgraph.

#### `LinkEndpointResolver` {#symbol-linkendpointresolver}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts#L22)
- Parameters: `_unnamed_`: [`ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)

##### `LinkEndpointResolver` — Summary
Function to resolve a link endpoint to a node ID.

#### `NodeResolver` {#symbol-noderesolver}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts#L27)
- Returns: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `NodeResolver` — Summary
Function to resolve a node by ID.

#### `createLocalSubgraph` {#symbol-createlocalsubgraph}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts#L38)
- Returns: [`LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph)
- Parameters: `center`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `graphData`: [`ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `resolveLinkEndpoint`: [`LinkEndpointResolver`](../../bootstrap/entry-heuristics.ts.mdmd.md#symbol-linkendpointresolver); `resolveNode`: [`NodeResolver`](#symbol-noderesolver); `shouldIncludeNode`: [`NodeFilter`](#symbol-nodefilter)

##### `createLocalSubgraph` — Summary
Creates a local subgraph centered on a node.

This is a pure function that builds a subgraph containing:
- The center node
- All direct neighbors (nodes connected by a single edge)
- All edges between the center and neighbors
- Self-loop edges from intra-file type references

#### `buildSelfLoopEdges` {#symbol-buildselfloopedges}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts#L111)
- Returns: [`LocalSubgraphLink`](./types.ts.mdmd.md#symbol-localsubgraphlink)[]
- Parameters: `center`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `buildSelfLoopEdges` — Summary
Build self-loop edges from intra-file type references.

When a symbol references another symbol in the same file, we create a self-loop edge.
These enable the "French Corset" wraparound bezier visualization.

#### `buildPathSubgraph` {#symbol-buildpathsubgraph}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/subgraph-builder.ts#L163)
- Returns: [`LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph)
- Parameters: `graphData`: [`ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `resolveLinkEndpoint`: [`LinkEndpointResolver`](../../bootstrap/entry-heuristics.ts.mdmd.md#symbol-linkendpointresolver); `resolveNode`: [`NodeResolver`](#symbol-noderesolver)

##### `buildPathSubgraph` — Summary
Builds a subgraph for path mode visualization.

Unlike exploration mode which shows all neighbors of a center node,
path mode shows only the nodes in the path and edges between adjacent nodes.

For a path [A, B, C]:
- A is the "origin" (FROM)
- C is the "destination" (TO)
- B is intermediate
- Edges are filtered to only include A→B and B→C connections
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.LocalSubgraphLink`](./types.ts.mdmd.md#symbol-localsubgraphlink) (type-only)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
