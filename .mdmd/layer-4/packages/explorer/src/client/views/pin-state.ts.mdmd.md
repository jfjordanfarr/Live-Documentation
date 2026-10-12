# packages/explorer/src/client/views/pin-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/pin-state.ts
- Generated At: 2026-10-12T19:35:22.889Z

## Authored
### Purpose

Immutable pure-function state machine for the continuous pin model, managing the `PinSet` data structure shared by the Local Map’s 2D and 3D representations.

### Notes

- Created during [Dev Day 80 Step 6a](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) after a pivotal design decision: the original plan called for separate Explore/Compare/Path mode renderers, but the continuous pin model collapsed these into a single state machine where pin count determines rendering behavior (0 pins = Browse, 1 = Explore, 2 = Compare, N = multi-focal, path = Path).
- All mutations (`addPin`, `removePin`, `togglePin`) return a new `PinSet` object — the immutable API enables React-style re-render-on-change in the imperative controller without reference equality bugs.
- `getVisibleConnections` is the bridge between pin state and graph data: it filters the full edge list to only those edges touching a pinned (nodeId, symbol) pair, producing the `VisibleConnection[]` used to disclose retained neighborhoods.
- `serializePins`/`deserializePins` round-trip to a compact JSON array for URL state persistence via `compressed-url-state.ts`.
- `retainFile` is idempotent and uses a wildcard for complete interface selection. `toggleFileSymbol` can remove one effective row from that selection by materializing the remaining public symbols and Internals; the wildcard therefore cannot conceal an unpin action. These operations support the Local Map's click-to-retain and close-to-prune interaction while the lower-level mutations remain available to other consumers.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PinEntry` {#symbol-pinentry}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L21)

##### `PinEntry` — Summary
A single pinned symbol on a node.

#### `PinSet` {#symbol-pinset}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L34)

##### `PinSet` — Summary
Immutable pin set. All mutations return a new PinSet.

#### `VisibleConnection` {#symbol-visibleconnection}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L42)

##### `VisibleConnection` — Summary
A connection visible because of the current pin set.
Carries the original link plus which pin entry caused it to be visible.

#### `EMPTY_PIN_SET` {#symbol-empty_pin_set}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L51)
- Returns: [`PinSet`](#symbol-pinset)

##### `EMPTY_PIN_SET` — Summary
The empty pin set.

#### `addPin` {#symbol-addpin}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L64)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `addPin` — Summary
Add a pin. If the exact (nodeId, symbol) already exists, returns
the same PinSet unchanged.

#### `removePin` {#symbol-removepin}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L75)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `removePin` — Summary
Remove a pin by (nodeId, symbol). Returns unchanged PinSet if not found.

#### `togglePin` {#symbol-togglepin}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L85)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `togglePin` — Summary
Toggle a pin: add if absent, remove if present.

#### `removePinsForNode` {#symbol-removepinsfornode}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L96)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `removePinsForNode` — Summary
Remove all pins for a specific node.

#### `retainFile` {#symbol-retainfile}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L103)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `retainFile` — Summary
Retain every interface of a file; repeating the action never releases it.

#### `toggleFileSymbol` {#symbol-togglefilesymbol}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L112)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `toggleFileSymbol` — Summary
Toggle a row in the effective selection. Removing a row from a whole-file
selection materializes its remaining rows, so the wildcard cannot mask it.

#### `getPinnedNodeIds` {#symbol-getpinnednodeids}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L126)
- Returns: `ReadonlySet`
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `getPinnedNodeIds` — Summary
Get the set of distinct node IDs that have at least one pin.

#### `isSymbolPinned` {#symbol-issymbolpinned}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L133)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `isSymbolPinned` — Summary
Check whether a specific (nodeId, symbol) is pinned.

#### `getVisibleConnections` {#symbol-getvisibleconnections}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L159)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `getVisibleConnections` — Summary
Given the current pin set and the full graph edge list, compute
which connections should be drawn.

A connection is visible if at least one of its endpoints matches
a pinned (nodeId, symbol) pair:
- Link's sourceSymbol matches a pin on the source node, OR
- Link's targetSymbol matches a pin on the target node, OR
- A node-level wildcard pin ("*") makes all connections to/from that node visible

Returns the list of visible connections with causation metadata.

#### `serializePins` {#symbol-serializepins}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L252)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `serializePins` — Summary
Serialize pin set to a plain JSON-friendly array for lz-string compression.

#### `deserializePins` {#symbol-deserializepins}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L263)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `data`: `ReadonlyArray`

##### `deserializePins` — Summary
Deserialize pin set from URL state.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`symbolAnchors.normalizeSymbolIdentifier`](./symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
