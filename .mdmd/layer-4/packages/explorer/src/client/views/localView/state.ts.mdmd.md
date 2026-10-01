# packages/explorer/src/client/views/localView/state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/state.ts
- Generated At: 2026-10-01T21:05:42.441Z

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
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolPin` {#symbol-symbolpin}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L17)

##### `SymbolPin` — Summary
Represents a pinned symbol in the visualization.
Pins define the path being traced through the dependency graph.

#### `HoveredSymbol` {#symbol-hoveredsymbol}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L29)

##### `HoveredSymbol` — Summary
Represents a hovered symbol (temporary highlight, not pinned).

#### `PathResult` {#symbol-pathresult}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L39)

##### `PathResult` — Summary
A path the Local Map draws, one column per file.
Each file depends on the one before it, so the picture reads left to right
from what offers to what uses; a path the other way is never set here.

#### `LocalMapState` {#symbol-localmapstate}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L51)

##### `LocalMapState` — Summary
The complete state shape for Local Map visualization.

#### `createInitialState` {#symbol-createinitialstate}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L72)
- Returns: [`LocalMapState`](#symbol-localmapstate)

##### `createInitialState` — Summary
Creates a fresh initial state with sensible defaults.

#### `StateSubscriber` {#symbol-statesubscriber}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L86)
- Parameters: `state`: `T`; `prevState`: `T`

##### `StateSubscriber` — Summary
Subscriber callback type for state changes.

#### `StateStore` {#symbol-statestore}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L103)

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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L118)
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
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L153)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate); `pin`: [`SymbolPin`](#symbol-symbolpin)

##### `addPin` — Summary
Adds a pin to the path. If the pin already exists at that hopIndex, replaces it.
Pins at higher hopIndexes are removed (truncates the path).

#### `removePin` {#symbol-removepin}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L165)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `removePin` — Summary
Removes all pins from the given hopIndex onward.

#### `clearPins` {#symbol-clearpins}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L175)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `clearPins` — Summary
Clears the entire pinned path.

#### `setActivePath` {#symbol-setactivepath}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L186)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate); `path`: [`PathResult`](#symbol-pathresult)

##### `setActivePath` — Summary
Sets the active path result for path mode rendering.
Clears any existing pinned path since path mode takes precedence.

#### `setHoveredSymbol` {#symbol-sethoveredsymbol}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L197)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate); `hovered`: [`HoveredSymbol`](#symbol-hoveredsymbol)

##### `setHoveredSymbol` — Summary
Sets the hovered symbol (or clears it with null).

#### `setFocusedNode` {#symbol-setfocusednode}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L217)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `setFocusedNode` — Summary
Sets the focused node ID (center of view).

#### `setMaxHops` {#symbol-setmaxhops}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L230)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `setMaxHops` — Summary
Updates the maximum hop count.

#### `toggleCollapseUnrelated` {#symbol-togglecollapseunrelated}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L244)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `toggleCollapseUnrelated` — Summary
Toggles the collapse-unrelated mode.

#### `getPinnedNodeIds` {#symbol-getpinnednodeids}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L258)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `getPinnedNodeIds` — Summary
Returns the IDs of all nodes in the pinned path.

#### `getPinnedSymbolsForNode` {#symbol-getpinnedsymbolsfornode}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L265)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `getPinnedSymbolsForNode` — Summary
Returns the symbols pinned on a specific node.

#### `isSymbolPinned` {#symbol-issymbolpinned}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L274)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `isSymbolPinned` — Summary
Checks if a specific symbol is pinned.

#### `getHopIndexForSymbol` {#symbol-gethopindexforsymbol}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L281)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `getHopIndexForSymbol` — Summary
Returns the hop index for a pinned symbol, or -1 if not pinned.

#### `isHoveredSymbolPinned` {#symbol-ishoveredsymbolpinned}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L293)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `isHoveredSymbolPinned` — Summary
Returns true if the hovered symbol is part of the pinned path.

#### `getRequiredColumnCount` {#symbol-getrequiredcolumncount}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L302)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate)

##### `getRequiredColumnCount` — Summary
Returns the number of columns needed based on pinned path length.
Formula: 3 base columns + 2 columns per additional hop
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
