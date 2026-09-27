# packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/layout-math.test.ts
- Generated At: 2026-09-27T23:21:28.162Z

## Authored
### Purpose
Unit tests for layout-math.ts covering column counting, grid template generation, hop indexing, and multi-hop layout computation.

### Notes
- Created 2025-12-18 (Dev Day 49) alongside layout-math.ts extraction
- Tests edge cases: zero pins, single pin, max hops exceeded, overlapping nodes in same column
- Validates `getColumnRole()` returns correct semantic role (upstream/downstream/center)
- Ensures `pinsToHopData()` preserves symbol metadata through conversion
- Part of the 153-test pure-function module validation suite

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-math.HopData`](./layout-math.ts.mdmd.md#symbol-hopdata)
- [`layout-math.LayoutConfig`](./layout-math.ts.mdmd.md#symbol-layoutconfig)
- [`layout-math.LayoutNode`](./layout-math.ts.mdmd.md#symbol-layoutnode)
- [`layout-math.LocalMapLayout`](./layout-math.ts.mdmd.md#symbol-localmaplayout)
- [`layout-math.computeColumnCount`](./layout-math.ts.mdmd.md#symbol-computecolumncount)
- [`layout-math.computeGridTemplate`](./layout-math.ts.mdmd.md#symbol-computegridtemplate)
- [`layout-math.computeMultiHopLayout`](./layout-math.ts.mdmd.md#symbol-computemultihoplayout)
- [`layout-math.computeSingleHopLayout`](./layout-math.ts.mdmd.md#symbol-computesinglehoplayout)
- [`layout-math.computeVerticalAlignments`](./layout-math.ts.mdmd.md#symbol-computeverticalalignments)
- [`layout-math.generateColumnLabel`](./layout-math.ts.mdmd.md#symbol-generatecolumnlabel)
- [`layout-math.getColumnRole`](./layout-math.ts.mdmd.md#symbol-getcolumnrole)
- [`layout-math.getHopIndex`](./layout-math.ts.mdmd.md#symbol-gethopindex)
- [`layout-math.getIntermediateColumns`](./layout-math.ts.mdmd.md#symbol-getintermediatecolumns)
- [`layout-math.isMultiHopConnection`](./layout-math.ts.mdmd.md#symbol-ismultihopconnection)
- [`layout-math.pinsToHopData`](./layout-math.ts.mdmd.md#symbol-pinstohopdata)
- [`layout-math.sortByAlignment`](./layout-math.ts.mdmd.md#symbol-sortbyalignment)
- [`state.SymbolPin`](./state.ts.mdmd.md#symbol-symbolpin)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
