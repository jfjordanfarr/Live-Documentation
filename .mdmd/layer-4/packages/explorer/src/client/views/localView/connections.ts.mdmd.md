# packages/explorer/src/client/views/localView/connections.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/connections.ts
- Generated At: 2026-10-01T21:05:42.188Z

## Authored
### Purpose

SVG wire drawing for the Local Map: Bézier splines between the symbol pins of the cards, one drawer for the exploration columns, one for a drawn path and one for the multi-hop columns, sharing one anchor measurer and one overlay builder.

### Notes

- Created 2025-12-04 during the localView modularisation; `drawConnections` dispatches by what is active and maps symbol keys to registered anchors.
- Every wire runs from a provider's blue pin to a consumer's green pin. The path drawer, `drawPathConnections`, takes the wires from the path subgraph: the later file of an adjacent pair uses the earlier one, so the provider is the earlier column's blue pin and the consumer the later column's green pin. A reference that runs against the path is not drawn; the toolbar counts it. Until [Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) the path wires took the dependent's blue pin as their start, so they reached backwards across the columns or flowed from the wrong pins.
- Self-loops on the selected card are drawn as the two tapered stubs of the "French Corset".
- Uses the `BezierTuning` parameters from `ExplorerState` for curve aesthetics.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MultiHopEntry` {#symbol-multihopentry}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/connections.ts#L11)

##### `MultiHopEntry` — Summary
Represents a hop in the multi-hop visualization chain.
Each hop has a center node and its associated subgraph.

#### `ConnectionsContext` {#symbol-connectionscontext}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/connections.ts#L24)

##### `ConnectionsContext` — Summary
Ambient context required by {@link drawConnections} to measure DOM
anchors, read explorer state, and emit SVG paths.

#### `drawConnections` {#symbol-drawconnections}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/connections.ts#L90)
- Parameters: `context`: [`ConnectionsContext`](#symbol-connectionscontext)

##### `drawConnections` — Summary
Main entry point for drawing SVG connection edges in the Local Map view.

Delegates to the path drawer when a path is active, to the multi-hop drawer
when {@link ConnectionsContext.multiHopData} is present, and otherwise to the
single-hop drawer. Each measures DOM anchor positions relative to the
container, computes Bézier curves, and appends `<path>` elements to the SVG
overlay.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.BezierTuning`](../../types.ts.mdmd.md#symbol-beziertuning) (type-only)
- [`types.ExplorerState`](../../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`runtime.LocalViewRuntime`](./runtime.ts.mdmd.md#symbol-localviewruntime) (type-only)
- [`state.PathResult`](./state.ts.mdmd.md#symbol-pathresult) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LayoutExtents`](./types.ts.mdmd.md#symbol-layoutextents) (type-only)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->
