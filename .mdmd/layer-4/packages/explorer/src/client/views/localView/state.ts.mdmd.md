# packages/explorer/src/client/views/localView/state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/state.ts
- Generated At: 2026-10-02T21:07:39.739Z

## Authored
### Purpose

Observable state for Local Map hover and explicit FROM/TO pathfinding. Independent exploration pins belong to the shared pin-state module.

### Notes

The generic store notifies subscribers with the old and new snapshots. Setting an explicit path does not mutate exploration pins.

This pure-data boundary originated in the December 18, 2025 extraction from the renderer. The former hop-indexed, truncating pin actions were retired during the October 2, 2026 native branching pass.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HoveredSymbol` {#symbol-hoveredsymbol}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L2)

##### `HoveredSymbol` — Summary
Local rendering state; independent exploration pins live in the shared PinSet.

#### `PathResult` {#symbol-pathresult}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L5)

##### `PathResult` — Summary
A directed FROM/TO path, kept separate from the exploration branches.

#### `LocalMapState` {#symbol-localmapstate}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L15)

##### `LocalMapState` — Summary
The transient state owned by the Local Map renderer.

#### `createInitialState` {#symbol-createinitialstate}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L21)
- Returns: [`LocalMapState`](#symbol-localmapstate)

##### `createInitialState` — Summary
Begin outside pathfinding, with no transient hover.

#### `StateSubscriber` {#symbol-statesubscriber}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L28)
- Parameters: `state`: `T`; `prevState`: `T`

##### `StateSubscriber` — Summary
Subscriber callback type for state changes.

#### `StateStore` {#symbol-statestore}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L45)

##### `StateStore` — Summary
Observable state store with type-safe subscriptions.

##### `StateStore` — Examples
```typescript
const store = createStateStore(createInitialState());
const unsubscribe = store.subscribe((state, prev) => {
  if (state.activePath !== prev.activePath) {
    console.log("Path changed:", state.activePath);
  }
});
store.update(s => ({ ...s, activePath: { nodeIds: ["provider", "consumer"] } }));
unsubscribe();
```

#### `createStateStore` {#symbol-createstatestore}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L60)
- Returns: [`StateStore`](#symbol-statestore)
- Parameters: `initialState`: `T`

##### `createStateStore` — Summary
Creates a new observable state store.

##### `createStateStore` — Parameters
- `initialState`: The starting state

##### `createStateStore` — Returns
A StateStore instance

#### `setActivePath` {#symbol-setactivepath}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L89)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate); `path`: [`PathResult`](#symbol-pathresult)

##### `setActivePath` — Summary
Enter or leave explicit pathfinding without changing shared exploration pins.

#### `setHoveredSymbol` {#symbol-sethoveredsymbol}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/state.ts#L94)
- Returns: [`LocalMapState`](#symbol-localmapstate)
- Parameters: `state`: [`LocalMapState`](#symbol-localmapstate); `hovered`: [`HoveredSymbol`](#symbol-hoveredsymbol)

##### `setHoveredSymbol` — Summary
Set the transient hover without rewriting equal state.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
