# packages/explorer/src/client/views/localView/branch-renderer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-renderer.ts
- Generated At: 2026-10-05T16:55:01.282Z

## Authored
### Purpose

Renders independently retained branches using the Local Map’s existing cards, symbol pins and interface colors.

### Notes

Wraps native cards in the Membrane Map's cross-column directory bands, including a scan-root boundary, in the rows and the order `branch-order.ts` chose, while preserving dependency ranks. Between two cards, or above a column's first, it leaves a `.local-pass-through` spacer sized to the lane the order reserved there, which the router measures back to thread the skipped references through. Keeps explicit pins and the selected file legible; other cards can collapse to the rows required by retained symbols. Revealing a card is separate from retaining its interfaces, and closing clears that reveal override. Counts expose symbols and connections outside the current disclosure, and a card touched by a cycle's feedback says how many references read back, since those are drawn only as stubs until hovered (2026-10-05).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderBranches` {#symbol-renderbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L10)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)

##### `renderBranches` — Summary
Extend the native card grammar to the independently retained branches.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-order.Lane`](./branch-order.ts.mdmd.md#symbol-lane) (type-only)
- [`branch-routing.LANE_PADDING`](./branch-routing.ts.mdmd.md#symbol-lane_padding)
- [`branch-routing.LANE_PITCH`](./branch-routing.ts.mdmd.md#symbol-lane_pitch)
- [`branches.buildBranches`](./branches.ts.mdmd.md#symbol-buildbranches)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`column-factory.createHierarchicalColumn`](./column-factory.ts.mdmd.md#symbol-createhierarchicalcolumn)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`pin-layout.DirectoryBand`](../membraneView/pin-layout.ts.mdmd.md#symbol-directoryband) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->
