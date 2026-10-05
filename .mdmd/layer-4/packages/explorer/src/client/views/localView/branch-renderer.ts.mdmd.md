# packages/explorer/src/client/views/localView/branch-renderer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-renderer.ts
- Generated At: 2026-10-05T22:17:14.885Z

## Authored
### Purpose

Renders independently retained branches using the Local Map’s existing cards, symbol pins and interface colors.

### Notes

Places native cards, lanes and the Membrane Map's directory bands on the vertical axis from the exact placement of `branch-placement.ts`, in the order `branch-order.ts` chose, while preserving dependency ranks: every element is positioned absolutely inside the box it belongs to, the columns at their measured widths. Until 2026-10-05 the picture was a CSS grid whose rows were shared across columns, so no card could be lowered to meet its partner without moving every column; the owner asked for the durable, correct implementation and this is it ([Turn 13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-13)). It measures in two passes, widths first and heights at those widths, because a card's rows of test names wrap at its column's width and a box's label wraps to nothing in a box not yet given a width; the first draft read 250 px of label into every box's inset. Keeps the band elements nested with their labels, so the perspective transition finds its shells. The root is the picture itself, a band kept as an element so that the perspective transition has its outermost shell but drawn as nothing, with no box, no padding and no name, as in the Membrane (until 2026-10-05 it was a band labelled "/" with its own padding around everything). Each lane the order reserved is a `.local-pass-through` spacer sized to its bundles, which the router measures back to thread the skipped references through: in a directory's stack of files after the named file or above the first, in a directory of directories in a grid row of its own among the subdirectories' rows, and in a column a directory spans with no file of its own as that column's only occupant. Stands each card's symbol rows in the order the branch graph chose, moving the row elements in the card's grid, rows the order does not name after them and Internals last; two symbols may share a normalized name, as graph.ts's LinkTarget and linkTarget do, so a name claims one row per mention, which the first draft got wrong and the alphabetical picture showed. Keeps explicit pins and the selected file legible; other cards can collapse to the rows required by retained symbols. Revealing a card is separate from retaining its interfaces, and closing clears that reveal override. Counts expose symbols and connections outside the current disclosure, and a card touched by a cycle's feedback says how many references read back, since those are drawn only as stubs until hovered (2026-10-05).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderBranches` {#symbol-renderbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L62)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)

##### `renderBranches` — Summary
Render the independently retained branches with the Local Map's cards,
symbol pins and interface colours, placed on the vertical axis by the
exact placement of `branch-placement.ts`: the cards and lanes of every
column stand where the wires between pins are shortest, inside the
directory boxes the order chose. The elements keep the names the router,
the deck and the perspective transition read.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-order.Lane`](./branch-order.ts.mdmd.md#symbol-lane) (type-only)
- [`branch-placement.PlacementBand`](./branch-placement.ts.mdmd.md#symbol-placementband)
- [`branch-placement.PlacementWire`](./branch-placement.ts.mdmd.md#symbol-placementwire)
- [`branch-placement.placeBranches`](./branch-placement.ts.mdmd.md#symbol-placebranches)
- [`branch-routing.LANE_PADDING`](./branch-routing.ts.mdmd.md#symbol-lane_padding)
- [`branch-routing.LANE_PITCH`](./branch-routing.ts.mdmd.md#symbol-lane_pitch)
- [`branches.buildBranches`](./branches.ts.mdmd.md#symbol-buildbranches)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`card-factory.createNodeCard`](./card-factory.ts.mdmd.md#symbol-createnodecard)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`pin-layout.DirectoryBand`](../membraneView/pin-layout.ts.mdmd.md#symbol-directoryband) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->
