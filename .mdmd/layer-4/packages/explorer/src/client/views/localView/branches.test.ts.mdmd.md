# packages/explorer/src/client/views/localView/branches.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branches.test.ts
- Generated At: 2026-10-05T16:55:01.350Z

## Authored
### Purpose

Checks independent branch disclosure, induced cross-connections and dependency ranking against small graphs with known answers.

### Notes

Exercises a diamond with a cross-edge, disconnected pins, category filters, a two-file cycle with a self-reference and a three-file cycle with an outside consumer. A cycle must be broken at exactly one reference, every other reference must rank forward, and no edge may be lost. It checks preserved edges as well as retained files, so a prettier but incomplete graph fails.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branches.buildBranches`](./branches.ts.mdmd.md#symbol-buildbranches)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`branches.rankBranches`](./branches.ts.mdmd.md#symbol-rankbranches)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`pin-state.EMPTY_PIN_SET`](../pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.addPin`](../pin-state.ts.mdmd.md#symbol-addpin)
- [`pin-state.removePin`](../pin-state.ts.mdmd.md#symbol-removepin)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
