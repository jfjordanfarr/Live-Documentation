# packages/explorer/src/shared/graph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/graph.ts
- Generated At: 2026-09-28T01:11:44.541Z

## Authored
### Purpose
Projects the graph index into the `ExplorerGraphPayload` the Explorer views render: nodes with dependency references and type references, links, and statistics. One pure function, which the client runs on the bundle it loads.

### Notes
- Created 2025-11-22 as `server/graph.ts`, moved to `shared/` on 2026-03-09, and rewritten on 2026-09-28 to read the graph index instead of building a graph of its own.
- It keeps the shape the views were written against, quirks included: a type reference to a symbol of the same file, or to a doc the graph lacks, is reported unresolved; a bare type name keeps its `[]` suffix; type references become `type-reference` links after every dependency link. Those go when the views read the graph directly (vision step 3).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `explorerGraphOf` {#symbol-explorergraphof}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/shared/graph.ts#L43)
- Returns: [`ExplorerGraphPayload`](./types.ts.mdmd.md#symbol-explorergraphpayload)
- Parameters: `graph`: [`LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `explorerGraphOf` — Summary
Projects the graph into the Explorer's node-and-link payload.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.symbolName`](../../../engine/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.GraphEdge`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphedge) (type-only)
- [`graph.GraphFile`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`types.ExplorerDependencyReference`](./types.ts.mdmd.md#symbol-explorerdependencyreference) (type-only)
- [`types.ExplorerGraphPayload`](./types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](./types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](./types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](./types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](./types.ts.mdmd.md#symbol-explorertypereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->
