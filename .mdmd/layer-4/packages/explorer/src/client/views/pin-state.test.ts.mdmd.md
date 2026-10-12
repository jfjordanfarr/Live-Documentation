# packages/explorer/src/client/views/pin-state.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/pin-state.test.ts
- Generated At: 2026-10-12T19:21:20.371Z

## Authored
### Purpose

Checks immutable pin changes, wildcard file retention, symbol connection visibility and portable serialization for both Local Map representations.

### Notes

- Originated with the March 23 continuous pin model. Moved alongside the shared module during [view consolidation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-4); tests of the retired hop-label renderer and Membrane expansion helpers were removed with those consumers. Legacy hop indices still round-trip through serialization.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pin-state.EMPTY_PIN_SET`](./pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.addPin`](./pin-state.ts.mdmd.md#symbol-addpin)
- [`pin-state.deserializePins`](./pin-state.ts.mdmd.md#symbol-deserializepins)
- [`pin-state.getPinnedNodeIds`](./pin-state.ts.mdmd.md#symbol-getpinnednodeids)
- [`pin-state.getVisibleConnections`](./pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`pin-state.isSymbolPinned`](./pin-state.ts.mdmd.md#symbol-issymbolpinned)
- [`pin-state.removePin`](./pin-state.ts.mdmd.md#symbol-removepin)
- [`pin-state.removePinsForNode`](./pin-state.ts.mdmd.md#symbol-removepinsfornode)
- [`pin-state.retainFile`](./pin-state.ts.mdmd.md#symbol-retainfile)
- [`pin-state.serializePins`](./pin-state.ts.mdmd.md#symbol-serializepins)
- [`pin-state.toggleFileSymbol`](./pin-state.ts.mdmd.md#symbol-togglefilesymbol)
- [`pin-state.togglePin`](./pin-state.ts.mdmd.md#symbol-togglepin)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
