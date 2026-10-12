# packages/explorer/src/client/views/localView/subgraph-builder.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/subgraph-builder.ts
- Generated At: 2026-10-12T18:02:22.016Z

## Authored
### Purpose
Builds self-reference edges and the adjacent-hop subgraph of an explicit path from Explorer graph data.

### Notes
Extracted from the controller during the December 19, 2025 modularization. Neighborhood disclosure now belongs to branches.ts. Path construction preserves reference direction and metadata; the common disclosure draws forward references and the pathfinder reports those that run against the path.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkEndpointResolver` {#symbol-linkendpointresolver}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/subgraph-builder.ts#L17)
- Parameters: `_unnamed_`: [`ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)

##### `LinkEndpointResolver` — Summary
Function to resolve a link endpoint to a node ID.

#### `NodeResolver` {#symbol-noderesolver}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/subgraph-builder.ts#L22)
- Returns: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `NodeResolver` — Summary
Function to resolve a node by ID.

#### `buildSelfLoopEdges` {#symbol-buildselfloopedges}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/subgraph-builder.ts#L30)
- Returns: [`LocalSubgraphLink`](./types.ts.mdmd.md#symbol-localsubgraphlink)[]
- Parameters: `center`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `buildSelfLoopEdges` — Summary
Build self-loop edges from intra-file type references.

When a symbol references another symbol in the same file, we create a self-loop edge,
which the connections module draws as the two laces of the French Corset.

#### `buildPathSubgraph` {#symbol-buildpathsubgraph}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/subgraph-builder.ts#L87)
- Returns: [`LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph)
- Parameters: `graphData`: [`ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `resolveLinkEndpoint`: [`LinkEndpointResolver`](#symbol-linkendpointresolver); `resolveNode`: [`NodeResolver`](#symbol-noderesolver)

##### `buildPathSubgraph` — Summary
Builds a subgraph for path mode visualization.

Unlike exploration mode which shows all neighbors of a center node,
path mode shows only the nodes in the path and edges between adjacent nodes.

For a path [A, B, C]:
- A is the "origin" (FROM)
- C is the "destination" (TO)
- B is intermediate
- Edges are filtered to only include A→B and B→C connections

A link's direction is relative to the earlier of its two files: "inbound"
when the later file depends on the earlier (the link runs with the path, and
the path drawer draws it), "outbound" when the earlier file depends on the
later (the link runs against the path and is counted, not drawn).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.LocalSubgraphLink`](./types.ts.mdmd.md#symbol-localsubgraphlink) (type-only)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
