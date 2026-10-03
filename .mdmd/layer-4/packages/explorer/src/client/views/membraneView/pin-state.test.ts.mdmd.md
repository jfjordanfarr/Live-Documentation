# packages/explorer/src/client/views/membraneView/pin-state.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/membraneView/pin-state.test.ts
- Generated At: 2026-10-03T18:02:22.900Z

## Authored
### Purpose

Comprehensive behavioral coverage of the immutable pin state machine, verifying mutation semantics, connection visibility filtering, path population with hop indices, serialization round-trips, and required expansion derivation.

### Notes

- 45 tests — the largest test file in the Membrane Map suite — reflecting the pin state module's role as the central state machine driving all rendering modes.
- Covers: `addPin`/`removePin`/`togglePin` idempotency and immutability, `clearPins` reset, `removePinsForNode` selective clearing, `getPinnedNodeIds` deduplication, `isSymbolPinned` query, `getVisibleConnections` edge filtering (including wildcard `*` matching for file-level connections), `setPinsFromPath` hop index assignment, `hasActivePath`/`getPathEntries` path queries, `serializePins`/`deserializePins` round-trip fidelity, and `getRequiredExpansions` parent directory extraction.
- Also tests `hopLabel` from `focal-overlay.ts` for circled-number rendering (①-⑴) and fallback to parenthesized numbers beyond index 19.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`focal-overlay.hopLabel`](./focal-overlay.ts.mdmd.md#symbol-hoplabel)
- [`pin-state.EMPTY_PIN_SET`](../pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.addPin`](../pin-state.ts.mdmd.md#symbol-addpin)
- [`pin-state.clearPins`](../pin-state.ts.mdmd.md#symbol-clearpins)
- [`pin-state.deserializePins`](../pin-state.ts.mdmd.md#symbol-deserializepins)
- [`pin-state.getPathEntries`](../pin-state.ts.mdmd.md#symbol-getpathentries)
- [`pin-state.getPinnedNodeIds`](../pin-state.ts.mdmd.md#symbol-getpinnednodeids)
- [`pin-state.getRequiredExpansions`](../pin-state.ts.mdmd.md#symbol-getrequiredexpansions)
- [`pin-state.getVisibleConnections`](../pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`pin-state.hasActivePath`](../pin-state.ts.mdmd.md#symbol-hasactivepath)
- [`pin-state.isSymbolPinned`](../pin-state.ts.mdmd.md#symbol-issymbolpinned)
- [`pin-state.removePin`](../pin-state.ts.mdmd.md#symbol-removepin)
- [`pin-state.removePinsForNode`](../pin-state.ts.mdmd.md#symbol-removepinsfornode)
- [`pin-state.retainFile`](../pin-state.ts.mdmd.md#symbol-retainfile)
- [`pin-state.serializePins`](../pin-state.ts.mdmd.md#symbol-serializepins)
- [`pin-state.setPinsFromPath`](../pin-state.ts.mdmd.md#symbol-setpinsfrompath)
- [`pin-state.toggleFileSymbol`](../pin-state.ts.mdmd.md#symbol-togglefilesymbol)
- [`pin-state.togglePin`](../pin-state.ts.mdmd.md#symbol-togglepin)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
