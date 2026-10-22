# packages/explorer/src/client/views/pin-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/pin-state.ts
- Generated At: 2026-10-22T16:47:56.356Z

## Authored
### Purpose

Pure transitions and queries for retained file and symbol neighborhoods shared by the Local Map's 2D and 3D representations. Keeps pin identity, selection rules, visible-connection attribution and compact serialization independent of renderers and input gestures.

### Notes

- Created during [Dev Day 80 Step 6a](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md). That March design combined separate Explore/Compare/Path renderers through pin-count modes; today pins retain independent neighborhoods and an explicitly requested path has its own scope.
- Mutations never modify the input `PinSet`. An actual change returns a new set; an idempotent addition or absent removal can return the original object.
- `getVisibleConnections` is the bridge between pin state and graph data: it filters the full edge list to only those edges touching a pinned (nodeId, symbol) pair, producing the `VisibleConnection[]` used to disclose retained neighborhoods.
- `serializePins`/`deserializePins` round-trip to a compact JSON array for URL state persistence via `compressed-url-state.ts`.
- `retainFile` is idempotent and uses a wildcard for complete interface selection. `pressSymbol` (2026-10-15, [Turns 8 to 10](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-8); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15)) implements the explicit symbol Pin action: a file pinned whole narrows to the symbol pressed, an unpinned symbol is added, a pinned one released, and releasing the file's last symbol leaves the file pinned whole, the owner's "node-level pin fallback rather than instant loss of the node". It replaced `toggleFileSymbol`, which had read a whole pin as every symbol already pinned and so, pressed on one, released that one and materialized the rest; the night's click-only journey ([the probe record](../../../../../../../AI-Agent-Workspace/Probes/2026-10-14/pin-clicks/README.md)) found that pinning every other symbol of a file was the only thing a click on a whole-pinned card could do.
- `INTERNAL_SYMBOL` names the existing file-level endpoint for connections not attributed to a public symbol. It is distinct from the whole-file wildcard and does not claim that private symbols were documented. Inspection preserves that identity so its Pin action retains the intended endpoint.
- The [October 20 inspect-first grammar](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-24) changes which visible control invokes a pin transition; merely reading evidence invokes none. Subject, camera, reader and directory state remain outside this module.

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

#### `INTERNAL_SYMBOL` {#symbol-internal_symbol}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L54)

##### `INTERNAL_SYMBOL` — Summary
The file-level endpoint for connections not attributed to a public symbol.

#### `addPin` {#symbol-addpin}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L67)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `addPin` — Summary
Add a pin. If the exact (nodeId, symbol) already exists, returns
the same PinSet unchanged.

#### `removePin` {#symbol-removepin}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L78)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `removePin` — Summary
Remove a pin by (nodeId, symbol). Returns unchanged PinSet if not found.

#### `togglePin` {#symbol-togglepin}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L88)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `togglePin` — Summary
Toggle a pin: add if absent, remove if present.

#### `removePinsForNode` {#symbol-removepinsfornode}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L99)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `removePinsForNode` — Summary
Remove all pins for a specific node.

#### `retainFile` {#symbol-retainfile}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L106)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `retainFile` — Summary
Retain every interface of a file; repeating the action never releases it.

#### `pressSymbol` {#symbol-presssymbol}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L117)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `pressSymbol` — Summary
The pin set after a symbol of a file is pressed. A file pinned whole narrows to that symbol; a symbol not pinned is
added beside the file's other pinned symbols; a pinned symbol is released; and releasing the file's last symbol
leaves the file pinned whole rather than dropping it, so that a card leaves the picture only by its close or the
tray (the owner's rule of 2026-10-15).

#### `getPinnedNodeIds` {#symbol-getpinnednodeids}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L129)
- Returns: `ReadonlySet`
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `getPinnedNodeIds` — Summary
Get the set of distinct node IDs that have at least one pin.

#### `isSymbolPinned` {#symbol-issymbolpinned}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L136)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `isSymbolPinned` — Summary
Check whether a specific (nodeId, symbol) is pinned.

#### `getVisibleConnections` {#symbol-getvisibleconnections}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L162)
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
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L255)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `serializePins` — Summary
Serialize pin set to a plain JSON-friendly array for lz-string compression.

#### `deserializePins` {#symbol-deserializepins}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/pin-state.ts#L266)
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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
