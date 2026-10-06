# packages/explorer/src/client/views/localView/branch-renderer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-renderer.ts
- Generated At: 2026-10-06T16:47:47.616Z

## Authored
### Purpose

Renders independently retained branches using the Local Map’s existing cards, symbol pins and interface colors.

### Notes

Places native cards, lanes and the Membrane Map's directory bands on the vertical axis from the exact placement of `branch-placement.ts`, in the order `branch-order.ts` chose, while preserving dependency ranks: every element is positioned absolutely inside the element it belongs to, the columns at their measured widths. Since 2026-10-06 a directory's element is the bounds of its membrane's segments, drawn as nothing; the outline `membrane-outline.ts` traces around the segments is an SVG path inside it, beneath the cards, carrying `data-directory` for the deck; the label stands at the leftmost segment's top, given that segment's width before its height is measured; and the element publishes its segments in `data-segments`, in the picture's pixels, so a test or a reader can check the shape without the drawing. Until 2026-10-05 the picture was a CSS grid whose rows were shared across columns, so no card could be lowered to meet its partner without moving every column; the owner asked for the durable, correct implementation and this is it ([Turn 13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-13)). It measures in two passes, widths first and heights at those widths, because a card's rows of test names wrap at its column's width and a box's label wraps to nothing in a box not yet given a width; the first draft read 250 px of label into every box's inset. Keeps the band elements nested with their outlines and labels, so the perspective transition finds its shells. The root is the picture itself, a band kept as an element so that the perspective transition has its outermost shell but drawn as nothing, with no box, no padding and no name, as in the Membrane (until 2026-10-05 it was a band labelled "/" with its own padding around everything). Each lane the order reserved is a `.local-pass-through` spacer that the placement sizes as a box whose items are the lane's slots, one per bundle, and that says in `data-slots` where each slot came to rest below its top, so the router can measure the lane and thread the skipped references through its slots (since 2026-10-06; until then the spacer was one rigid item sized to its bundles at pitch): in a directory's stack of files after the named file or above the first, in a directory of directories in a grid row of its own among the subdirectories' rows, and in a column a directory spans with no file of its own as that column's only occupant. Stands each card's symbol rows in the order the branch graph chose, moving the row elements in the card's grid, rows the order does not name after them and Internals last; two symbols may share a normalized name, as graph.ts's LinkTarget and linkTarget do, so a name claims one row per mention, which the first draft got wrong and the alphabetical picture showed. Keeps explicit pins and the selected file legible; other cards can collapse to the rows required by retained symbols. Revealing a card is separate from retaining its interfaces, and closing clears that reveal override. Counts expose symbols and connections outside the current disclosure, and a card touched by a cycle's feedback says how many references read back, since those are drawn only as stubs until hovered (2026-10-05).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderBranches` {#symbol-renderbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L90)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)

##### `renderBranches` — Summary
Render the independently retained branches with the Local Map's cards,
symbol pins and interface colours, placed on the vertical axis by the
exact placement of `branch-placement.ts`: the cards and lanes of every
column stand where the wires between pins are shortest, inside the
directory membranes the order chose, each membrane one segment per column
following its members and drawn as one outline, and each lane as tall as
the slots its wires spread. The elements keep the names the router, the
deck and the perspective transition read.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-order.Lane`](./branch-order.ts.mdmd.md#symbol-lane) (type-only)
- [`branch-placement.PlacementBand`](./branch-placement.ts.mdmd.md#symbol-placementband)
- [`branch-placement.PlacementWire`](./branch-placement.ts.mdmd.md#symbol-placementwire)
- [`branch-placement.StackEntry`](./branch-placement.ts.mdmd.md#symbol-stackentry)
- [`branch-placement.placeBranches`](./branch-placement.ts.mdmd.md#symbol-placebranches)
- [`branch-routing.LANE_PADDING`](./branch-routing.ts.mdmd.md#symbol-lane_padding)
- [`branch-routing.LANE_PITCH`](./branch-routing.ts.mdmd.md#symbol-lane_pitch)
- [`branches.buildBranches`](./branches.ts.mdmd.md#symbol-buildbranches)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`card-factory.createNodeCard`](./card-factory.ts.mdmd.md#symbol-createnodecard)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`membrane-outline.membranePath`](./membrane-outline.ts.mdmd.md#symbol-membranepath)
- [`pin-layout.DirectoryBand`](../membraneView/pin-layout.ts.mdmd.md#symbol-directoryband) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->
