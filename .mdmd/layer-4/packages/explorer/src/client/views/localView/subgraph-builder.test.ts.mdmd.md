# packages/explorer/src/client/views/localView/subgraph-builder.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/subgraph-builder.test.ts
- Generated At: 2026-09-27T23:21:28.497Z

## Authored
### Purpose
Unit tests for subgraph construction functions. Validates inbound/outbound classification, edge metadata preservation, node filtering, self-loop edge generation, and path subgraph adjacency filtering.

### Notes
Created during Dev Day 50 (12/19). Uses mock graph data to verify `createLocalSubgraph()`, `buildSelfLoopEdges()`, and `buildPathSubgraph()` produce correct graph subsets.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`subgraph-builder.LinkEndpointResolver`](./subgraph-builder.ts.mdmd.md#symbol-linkendpointresolver)
- [`subgraph-builder.NodeFilter`](./subgraph-builder.ts.mdmd.md#symbol-nodefilter)
- [`subgraph-builder.NodeResolver`](./subgraph-builder.ts.mdmd.md#symbol-noderesolver)
- [`subgraph-builder.buildPathSubgraph`](./subgraph-builder.ts.mdmd.md#symbol-buildpathsubgraph)
- [`subgraph-builder.buildSelfLoopEdges`](./subgraph-builder.ts.mdmd.md#symbol-buildselfloopedges)
- [`subgraph-builder.createLocalSubgraph`](./subgraph-builder.ts.mdmd.md#symbol-createlocalsubgraph)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../../../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](../../../shared/types.ts.mdmd.md#symbol-explorertypereference) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
