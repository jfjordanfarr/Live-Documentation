# packages/scripts/src/live-docs/inspect/pathfind-symbol.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/pathfind-symbol.ts
- Generated At: 2026-09-28T01:00:43.333Z

## Authored
### Purpose
Extends pathfinding to symbol-level granularity. When users specify symbol anchors in their FROM/TO queries, this module traces edges through specific exported symbols rather than treating files as atomic nodes.

### Notes
- Extracted from inspect.ts on 2025-12-19. Since 2026-09-28 a hop follows the graph's edges by symbol anchor at both ends (`from` and `toSymbol`), so a multi-hop symbol path stays on symbols across files.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `searchSymbolPath` {#symbol-searchsymbolpath}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind-symbol.ts#L31)
- Returns: [`SymbolPathSearchResult`](./types.ts.mdmd.md#symbol-symbolpathsearchresult)
- Parameters: `graph`: [`LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph); `from`: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference); `to`: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference); `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction)

##### `searchSymbolPath` — Summary
Symbol-aware path search using BFS.

When both from and to have symbols, finds a path where:
- The first hop originates from the fromSymbol (the edge's `from`)
- The last hop arrives at the toSymbol (the edge's `toSymbol`)

The algorithm tracks symbol transitions through the graph's edges.

##### `searchSymbolPath` — Parameters
- `direction`: "outbound" or "inbound"
- `from`: Source symbol reference
- `graph`: The Live Doc graph
- `maxDepth`: Maximum traversal depth
- `to`: Target symbol reference

##### `searchSymbolPath` — Returns
Search result with path and found status

#### `getSymbolNeighbors` {#symbol-getsymbolneighbors}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/pathfind-symbol.ts#L103)
- Returns: [`SymbolHop`](./types.ts.mdmd.md#symbol-symbolhop)[]
- Parameters: `graph`: [`LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph); `current`: [`SymbolHop`](./types.ts.mdmd.md#symbol-symbolhop); `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction)

##### `getSymbolNeighbors` — Summary
Gets symbol-aware neighbors for a given hop.

For outbound direction:
- If current hop has a symbol, only follow edges whose `from` matches it
- Returns the target code path and the target symbol

For inbound direction:
- If current hop has a symbol, only follow edges whose `toSymbol` matches it
- Returns the source code path and the source symbol

##### `getSymbolNeighbors` — Parameters
- `current`: Current hop position
- `direction`: Traversal direction
- `graph`: The Live Doc graph

##### `getSymbolNeighbors` — Returns
Array of neighboring symbol hops
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`symbol-reference.symbolMatchesAnchor`](./symbol-reference.ts.mdmd.md#symbol-symbolmatchesanchor)
- [`types.Direction`](./types.ts.mdmd.md#symbol-direction) (type-only)
- [`types.SymbolHop`](./types.ts.mdmd.md#symbol-symbolhop) (type-only)
- [`types.SymbolPathSearchResult`](./types.ts.mdmd.md#symbol-symbolpathsearchresult) (type-only)
- [`types.SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference) (type-only)
<!-- LIVE-DOC:END Dependencies -->
