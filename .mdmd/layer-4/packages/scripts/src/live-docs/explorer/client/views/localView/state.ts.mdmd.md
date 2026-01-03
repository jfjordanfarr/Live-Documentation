# packages/scripts/src/live-docs/explorer/client/views/localView/state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/state.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-state-ts
- Generated At: 2026-01-03T20:41:39.258Z

## Authored
### Purpose
Observable state container for the Local Map visualization, providing pure-data state shape, reactive subscriptions, and action functions for pin/hover/focus mutations.

### Notes
- Created 2025-12-18 (Dev Day 49) in chat 2025-12-18.1.md Turn 06 as first of three pure-function module extractions from the monolithic controller/render code
- Design principle: no DOM, no side effects — can be unit tested without jsdom
- `StateStore<T>` pattern enables reactive UI updates via `.subscribe()` and `.update()`
- `SymbolPin` with `hopIndex` tracks position in multi-hop path; `PathResult` bridges BFS output to rendering
- 153 unit tests across state.ts, layout-math.ts, connection-geometry.ts validate the extraction

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-03T20:41:39.258Z","inputHash":"6eddd378ea87fc08"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolPin` {#symbol-symbolpin}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L17)

##### `SymbolPin` — Summary
Represents a pinned symbol in the visualization.
Pins define the path being traced through the dependency graph.

#### `HoveredSymbol` {#symbol-hoveredsymbol}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L29)

##### `HoveredSymbol` — Summary
Represents a hovered symbol (temporary highlight, not pinned).

#### `PathResult` {#symbol-pathresult}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L38)

##### `PathResult` — Summary
Represents a computed path between two nodes.
Used for FROM-TO pathfinding mode.

#### `LocalMapState` {#symbol-localmapstate}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L52)

##### `LocalMapState` — Summary
The complete state shape for Local Map visualization.

#### `createInitialState` {#symbol-createinitialstate}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L73)
- Returns: [`LocalMapState`](#symbol-localmapstate)

##### `createInitialState` — Summary
Creates a fresh initial state with sensible defaults.

#### `StateSubscriber` {#symbol-statesubscriber}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L87)
- Parameters: `state`: `T`; `prevState`: `T`

##### `StateSubscriber` — Summary
Subscriber callback type for state changes.

#### `StateStore` {#symbol-statestore}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L104)

##### `StateStore` — Summary
Observable state store with type-safe subscriptions.

##### `StateStore` — Examples
```typescript
const store = createStateStore(createInitialState());
const unsubscribe = store.subscribe((state, prev) => {
  if (state.pinnedPath !== prev.pinnedPath) {
    console.log("Pinned path changed:", state.pinnedPath);
  }
});
store.update(s => ({ ...s, focusedNodeId: "some-node" }));
unsubscribe();
```

#### `createStateStore` {#symbol-createstatestore}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L119)
- Returns: [`StateStore`](#symbol-statestore)
- Parameters: `initialState`: `T`

##### `createStateStore` — Summary
Creates a new observable state store.

##### `createStateStore` — Parameters
- `initialState`: The starting state

##### `createStateStore` — Returns
A StateStore instance

#### `addPin` {#symbol-addpin}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L154)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate); `pin`: [`SymbolPin`](#symbol-symbolpin)

##### `addPin` — Summary
Adds a pin to the path. If the pin already exists at that hopIndex, replaces it.
Pins at higher hopIndexes are removed (truncates the path).

#### `removePin` {#symbol-removepin}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L166)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `removePin` — Summary
Removes all pins from the given hopIndex onward.

#### `clearPins` {#symbol-clearpins}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L176)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `clearPins` — Summary
Clears the entire pinned path.

#### `setActivePath` {#symbol-setactivepath}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L187)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate); `path`: [`PathResult`](./connection-geometry.ts.mdmd.md#symbol-pathresult)

##### `setActivePath` — Summary
Sets the active path result for path mode rendering.
Clears any existing pinned path since path mode takes precedence.

#### `clearActivePath` {#symbol-clearactivepath}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L198)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `clearActivePath` — Summary
Clears the active path, returning to exploration mode.

#### `setHoveredSymbol` {#symbol-sethoveredsymbol}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L208)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate); `hovered`: [`HoveredSymbol`](#symbol-hoveredsymbol)

##### `setHoveredSymbol` — Summary
Sets the hovered symbol (or clears it with null).

#### `setFocusedNode` {#symbol-setfocusednode}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L228)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `setFocusedNode` — Summary
Sets the focused node ID (center of view).

#### `setMaxHops` {#symbol-setmaxhops}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L241)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `setMaxHops` — Summary
Updates the maximum hop count.

#### `toggleCollapseUnrelated` {#symbol-togglecollapseunrelated}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L255)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `toggleCollapseUnrelated` — Summary
Toggles the collapse-unrelated mode.

#### `getPinnedNodeIds` {#symbol-getpinnednodeids}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L269)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `getPinnedNodeIds` — Summary
Returns the IDs of all nodes in the pinned path.

#### `getPinnedSymbolsForNode` {#symbol-getpinnedsymbolsfornode}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L276)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `getPinnedSymbolsForNode` — Summary
Returns the symbols pinned on a specific node.

#### `isSymbolPinned` {#symbol-issymbolpinned}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L285)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `isSymbolPinned` — Summary
Checks if a specific symbol is pinned.

#### `getHopIndexForSymbol` {#symbol-gethopindexforsymbol}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L292)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `getHopIndexForSymbol` — Summary
Returns the hop index for a pinned symbol, or -1 if not pinned.

#### `isHoveredSymbolPinned` {#symbol-ishoveredsymbolpinned}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L304)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `isHoveredSymbolPinned` — Summary
Returns true if the hovered symbol is part of the pinned path.

#### `getRequiredColumnCount` {#symbol-getrequiredcolumncount}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/state.ts#L313)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `getRequiredColumnCount` — Summary
Returns the number of columns needed based on pinned path length.
Formula: 3 base columns + 2 columns per additional hop
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [layout-math.test.ts](./layout-math.test.ts.mdmd.md)
- [layout-measure.test.ts](./layout-measure.test.ts.mdmd.md)
- [pan-zoom.test.ts](./pan-zoom.test.ts.mdmd.md)
- [state-integration.test.ts](./state-integration.test.ts.mdmd.md)
- [state.test.ts](./state.test.ts.mdmd.md)
- [subgraph-builder.test.ts](./subgraph-builder.test.ts.mdmd.md)
- [symbol-highlight.test.ts](./symbol-highlight.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
