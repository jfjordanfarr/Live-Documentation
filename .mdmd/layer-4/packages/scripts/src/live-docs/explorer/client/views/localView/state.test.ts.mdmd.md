# packages/scripts/src/live-docs/explorer/client/views/localView/state.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/state.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-localview-state-test-ts
- Generated At: 2026-02-03T21:55:36.717Z

## Authored
### Purpose
Unit tests for the LocalMapState shape, StateStore subscriptions, and pin/hover/focus action functions.

### Notes
- Created 2025-12-18 (Dev Day 49) alongside state.ts extraction
- Tests pure-function behavior: `addPin`, `removePin`, `clearPins`, `setHoveredSymbol`, `setFocusedNode`, `toggleCollapseUnrelated`
- Validates `getRequiredColumnCount()`, `getPinnedNodeIds()`, `isSymbolPinned()` selectors
- No jsdom required — these tests run in pure Node environment

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.717Z","inputHash":"500da992666fbabf"}]} -->
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
- [`state.getHopIndexForSymbol`](./state.ts.mdmd.md#symbol-gethopindexforsymbol)
- [`state.getPinnedNodeIds`](./state.ts.mdmd.md#symbol-getpinnednodeids)
- [`state.getPinnedSymbolsForNode`](./state.ts.mdmd.md#symbol-getpinnedsymbolsfornode)
- [`state.getRequiredColumnCount`](./state.ts.mdmd.md#symbol-getrequiredcolumncount)
- [`state.isHoveredSymbolPinned`](./state.ts.mdmd.md#symbol-ishoveredsymbolpinned)
- [`state.isSymbolPinned`](./state.ts.mdmd.md#symbol-issymbolpinned)
- [`state.removePin`](./state.ts.mdmd.md#symbol-removepin)
- [`state.setFocusedNode`](./state.ts.mdmd.md#symbol-setfocusednode)
- [`state.setHoveredSymbol`](./state.ts.mdmd.md#symbol-sethoveredsymbol)
- [`state.setMaxHops`](./state.ts.mdmd.md#symbol-setmaxhops)
- [`state.toggleCollapseUnrelated`](./state.ts.mdmd.md#symbol-togglecollapseunrelated)
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
