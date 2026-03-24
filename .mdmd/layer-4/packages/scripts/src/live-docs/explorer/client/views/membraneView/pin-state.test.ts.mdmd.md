# packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.test.ts

## Metadata

- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-state.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-membraneview-pin-state-test-ts
- Generated At: 2026-03-24T03:05:19.986Z

## Authored

### Purpose

Comprehensive behavioral coverage of the immutable pin state machine, verifying mutation semantics, connection visibility filtering, path population with hop indices, serialization round-trips, and required expansion derivation.

### Notes

- 45 tests — the largest test file in the Membrane Map suite — reflecting the pin state module's role as the central state machine driving all rendering modes.
- Covers: `addPin`/`removePin`/`togglePin` idempotency and immutability, `clearPins` reset, `removePinsForNode` selective clearing, `getPinnedNodeIds` deduplication, `isSymbolPinned` query, `getVisibleConnections` edge filtering (including wildcard `*` matching for file-level connections), `setPinsFromPath` hop index assignment, `hasActivePath`/`getPathEntries` path queries, `serializePins`/`deserializePins` round-trip fidelity, and `getRequiredExpansions` parent directory extraction.
- Also tests `hopLabel` from `focal-overlay.ts` for circled-number rendering (①-⑴) and fallback to parenthesized numbers beyond index 19.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:19.986Z","inputHash":"8cac725f9e25852a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

_No public symbols detected_

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`focal-overlay.hopLabel`](./focal-overlay.ts.mdmd.md#symbol-hoplabel)
- [`pin-state.EMPTY_PIN_SET`](./pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.addPin`](./pin-state.ts.mdmd.md#symbol-addpin)
- [`pin-state.clearPins`](./pin-state.ts.mdmd.md#symbol-clearpins)
- [`pin-state.deserializePins`](./pin-state.ts.mdmd.md#symbol-deserializepins)
- [`pin-state.getPathEntries`](./pin-state.ts.mdmd.md#symbol-getpathentries)
- [`pin-state.getPinnedNodeIds`](./pin-state.ts.mdmd.md#symbol-getpinnednodeids)
- [`pin-state.getRequiredExpansions`](./pin-state.ts.mdmd.md#symbol-getrequiredexpansions)
- [`pin-state.getVisibleConnections`](./pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`pin-state.hasActivePath`](./pin-state.ts.mdmd.md#symbol-hasactivepath)
- [`pin-state.isSymbolPinned`](./pin-state.ts.mdmd.md#symbol-issymbolpinned)
- [`pin-state.removePin`](./pin-state.ts.mdmd.md#symbol-removepin)
- [`pin-state.removePinsForNode`](./pin-state.ts.mdmd.md#symbol-removepinsfornode)
- [`pin-state.serializePins`](./pin-state.ts.mdmd.md#symbol-serializepins)
- [`pin-state.setPinsFromPath`](./pin-state.ts.mdmd.md#symbol-setpinsfrompath)
- [`pin-state.togglePin`](./pin-state.ts.mdmd.md#symbol-togglepin)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->

### Targets

#### Vitest Unit Tests

- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views: [connection-geometry.ts](../connection-geometry.ts.mdmd.md), [layoutUtils.ts](../layoutUtils.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/membraneView: [focal-overlay.ts](./focal-overlay.ts.mdmd.md), [pin-state.ts](./pin-state.ts.mdmd.md), [routing.ts](./routing.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->

### Supporting Fixtures

_No supporting fixtures documented yet_

<!-- LIVE-DOC:END Supporting Fixtures -->
