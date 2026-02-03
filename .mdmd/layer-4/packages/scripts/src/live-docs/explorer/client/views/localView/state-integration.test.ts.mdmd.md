# packages/scripts/src/live-docs/explorer/client/views/localView/state-integration.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/state-integration.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-localview-state-integration-test-ts
- Generated At: 2026-02-03T21:55:36.694Z

## Authored
### Purpose
Integration tests verifying multi-hop workflow scenarios: pin chaining, subscriber notification ordering, and state store consistency across complex sequences.

### Notes
- Created 2025-12-18 (Dev Day 49) in chat 2025-12-18.1.md Turn 08 after StateStore was wired into controller.ts
- 11 tests covering: multi-pin workflows, subscriber callbacks with prev-state diffing, focus transitions during pin operations
- Bridges unit-level state.test.ts and controller-level rendering tests

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.694Z","inputHash":"3da6fc4aeabcb1bd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`state.LocalMapState`](./state.ts.mdmd.md#symbol-localmapstate)
- [`state.SymbolPin`](./state.ts.mdmd.md#symbol-symbolpin)
- [`state.addPin`](./state.ts.mdmd.md#symbol-addpin)
- [`state.clearPins`](./state.ts.mdmd.md#symbol-clearpins)
- [`state.createInitialState`](./state.ts.mdmd.md#symbol-createinitialstate)
- [`state.createStateStore`](./state.ts.mdmd.md#symbol-createstatestore)
- [`state.getPinnedNodeIds`](./state.ts.mdmd.md#symbol-getpinnednodeids)
- [`state.getRequiredColumnCount`](./state.ts.mdmd.md#symbol-getrequiredcolumncount)
- [`state.isSymbolPinned`](./state.ts.mdmd.md#symbol-issymbolpinned)
- [`state.removePin`](./state.ts.mdmd.md#symbol-removepin)
- [`state.setFocusedNode`](./state.ts.mdmd.md#symbol-setfocusednode)
- [`state.setHoveredSymbol`](./state.ts.mdmd.md#symbol-sethoveredsymbol)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/client/views/localView: [state.ts](./state.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
