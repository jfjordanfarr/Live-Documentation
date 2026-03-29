# packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-pin-state-ts
- Generated At: 2026-03-29T21:52:10.076Z

## Authored

### Purpose

Immutable pure-function state machine for the continuous pin model, managing the `PinSet` data structure that drives the Membrane Map's progressive disclosure spectrum from Browse through Explore, Compare, and Path modes without discrete mode switches.

### Notes

- Created during [Dev Day 80 Step 6a](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) after a pivotal design decision: the original plan called for separate Explore/Compare/Path mode renderers, but the continuous pin model collapsed these into a single state machine where pin count determines rendering behavior (0 pins = Browse, 1 = Explore, 2 = Compare, N = multi-focal, path = Path).
- All mutations (`addPin`, `removePin`, `togglePin`, `clearPins`, `setPinsFromPath`) return a new `PinSet` object — the immutable API enables React-style re-render-on-change in the imperative controller without reference equality bugs.
- `getVisibleConnections` is the bridge between pin state and graph data: it filters the full edge list to only those edges touching a pinned (nodeId, symbol) pair, producing the `VisibleConnection[]` that the focal overlay draws.
- `setPinsFromPath` populates `hopIndex` on each entry, enabling the focal overlay's numbered hop badges (①②③) and the path breadcrumb bar.
- `serializePins`/`deserializePins` round-trip to a compact JSON array for URL state persistence via `compressed-url-state.ts`.
- `getRequiredExpansions` extracts parent directory paths from pinned node IDs so the controller can auto-expand collapsed ancestors to make pinned nodes visible.
- `areAllSymbolsPinned` (added [Dev Day 84](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-28.1.md)) checks whether all symbols for a given node (including `__internals__`) are pinned, enabling pin-all/unpin-all toggle buttons in both renderers.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-29T21:52:10.076Z","inputHash":"6d54b6168f4fe95f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `PinEntry` {#symbol-pinentry}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L22)

##### `PinEntry` — Summary

A single pinned symbol on a node.

#### `PinSet` {#symbol-pinset}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L35)

##### `PinSet` — Summary

Immutable pin set. All mutations return a new PinSet.

#### `VisibleConnection` {#symbol-visibleconnection}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L43)

##### `VisibleConnection` — Summary

A connection visible because of the current pin set.
Carries the original link plus which pin entry caused it to be visible.

#### `EMPTY_PIN_SET` {#symbol-empty_pin_set}

- Type: const
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L52)
- Returns: [`PinSet`](#symbol-pinset)

##### `EMPTY_PIN_SET` — Summary

The empty pin set.

#### `addPin` {#symbol-addpin}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L65)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `addPin` — Summary

Add a pin. If the exact (nodeId, symbol) already exists, returns
the same PinSet unchanged.

#### `removePin` {#symbol-removepin}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L76)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `removePin` — Summary

Remove a pin by (nodeId, symbol). Returns unchanged PinSet if not found.

#### `togglePin` {#symbol-togglepin}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L86)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `togglePin` — Summary

Toggle a pin: add if absent, remove if present.

#### `removePinsForNode` {#symbol-removepinsfornode}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L97)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `removePinsForNode` — Summary

Remove all pins for a specific node.

#### `clearPins` {#symbol-clearpins}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L106)
- Returns: [`PinSet`](#symbol-pinset)

##### `clearPins` — Summary

Clear all pins.

#### `setPinsFromPath` {#symbol-setpinsfrompath}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L114)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `hops`: `ReadonlyArray`

##### `setPinsFromPath` — Summary

Replace the entire pin set with BFS path results.
Each entry gets a hopIndex corresponding to its position in the path.

#### `getPinnedNodeIds` {#symbol-getpinnednodeids}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L131)
- Returns: `ReadonlySet`
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `getPinnedNodeIds` — Summary

Get the set of distinct node IDs that have at least one pin.

#### `isSymbolPinned` {#symbol-issymbolpinned}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L138)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `isSymbolPinned` — Summary

Check whether a specific (nodeId, symbol) is pinned.

#### `areAllSymbolsPinned` {#symbol-areallsymbolspinned}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L146)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `areAllSymbolsPinned` — Summary

Check whether ALL symbols of a node (including **internals**) are pinned.

#### `hasActivePath` {#symbol-hasactivepath}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L154)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `hasActivePath` — Summary

Whether the pin set contains any entries with hop indices (i.e., a path is active).

#### `getPathEntries` {#symbol-getpathentries}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L162)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `getPathEntries` — Summary

Get entries sorted by hop index (for path breadcrumb rendering).
Returns only entries that have a hopIndex.

#### `getVisibleConnections` {#symbol-getvisibleconnections}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L189)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `getVisibleConnections` — Summary

Given the current pin set and the full graph edge list, compute
which connections should be drawn.

A connection is visible if at least one of its endpoints matches
a pinned (nodeId, symbol) pair:

- Link's sourceSymbol matches a pin on the source node, OR
- Link's targetSymbol matches a pin on the target node, OR
- A node-level wildcard pin ("\*") makes all connections to/from that node visible

Returns the list of visible connections with causation metadata.

#### `serializePins` {#symbol-serializepins}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L282)
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `serializePins` — Summary

Serialize pin set to a plain JSON-friendly array for lz-string compression.

#### `deserializePins` {#symbol-deserializepins}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L293)
- Returns: [`PinSet`](#symbol-pinset)
- Parameters: `data`: `ReadonlyArray`

##### `deserializePins` — Summary

Deserialize pin set from URL state.

#### `getRequiredExpansions` {#symbol-getrequiredexpansions}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.ts#L316)
- Returns: `ReadonlySet`
- Parameters: `set`: [`PinSet`](#symbol-pinset)

##### `getRequiredExpansions` — Summary

Compute the set of directory IDs that must be expanded so all
pinned nodes are visible in the membrane layout.

For each pinned node ID (a file path like `"packages/shared/src/types.ts"`),
we derive the ancestor directories (`"packages"`, `"packages/shared"`,
`"packages/shared/src"`) and add them to the result set.

##### `getRequiredExpansions` — Parameters

- `set`: Current pin state

##### `getRequiredExpansions` — Returns

Set of directory IDs that should be expanded

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->

### Observed Evidence

#### Vitest Unit Tests

- [compressed-url-state.test.ts](../../persistence/compressed-url-state.test.ts.mdmd.md)
- [pin-layout.test.ts](./pin-layout.test.ts.mdmd.md)
- [pin-state.test.ts](./pin-state.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
