# packages/explorer/src/client/views/localView/branches.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/localView/branches.test.ts
- Generated At: 2026-10-08T01:58:14.075Z

## Authored
### Purpose

Checks independent branch disclosure, induced cross-connections and dependency ranking against small graphs with known answers.

### Notes

Exercises a diamond with a cross-edge, disconnected pins, category filters, a two-file cycle with a self-reference and a three-file cycle with an outside consumer. A cycle must be broken at exactly one reference, every other reference must rank forward, and no edge may be lost. It checks preserved edges as well as retained files, so a prettier but incomplete graph fails. Three tests pin the span-minimal ranking's rules on a chain of five with extra files (2026-10-06): a file that uses only the root and serves nothing stands beside the root rather than at the far right; a pair weighs its references, and a file that costs the same in several columns takes the one with the fewest cards, the rightmost among equals; and every unconnected group ends at the last column, where a file nothing uses stands.
- The membrane depth (2026-10-07): the common directory of a set of directories, a directory cut to the levels below the root at each depth, and the exploration's directories at depth null, 1 and 0 on four files in three nested directories.
- Directories (2026-10-08): the directory index; members, boxes and counts around pinned files; a subdirectory opened in place; entry by directory with a null center; and `placeMembers`' grid rule with its anchors and appended columns.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branches.buildBranches`](./branches.ts.mdmd.md#symbol-buildbranches)
- [`branches.commonDirectory`](./branches.ts.mdmd.md#symbol-commondirectory)
- [`branches.directoryIndex`](./branches.ts.mdmd.md#symbol-directoryindex)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`branches.exploreBranches`](./branches.ts.mdmd.md#symbol-explorebranches)
- [`branches.isClosedDirectory`](./branches.ts.mdmd.md#symbol-iscloseddirectory)
- [`branches.membraneDirectory`](./branches.ts.mdmd.md#symbol-membranedirectory)
- [`branches.orderExploration`](./branches.ts.mdmd.md#symbol-orderexploration)
- [`branches.placeMembers`](./branches.ts.mdmd.md#symbol-placemembers)
- [`branches.rankBranches`](./branches.ts.mdmd.md#symbol-rankbranches)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`pin-state.EMPTY_PIN_SET`](../pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.addPin`](../pin-state.ts.mdmd.md#symbol-addpin)
- [`pin-state.removePin`](../pin-state.ts.mdmd.md#symbol-removepin)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
