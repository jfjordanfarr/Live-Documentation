# packages/explorer/src/client/views/localView/branch-renderer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-renderer.ts
- Generated At: 2026-10-06T23:02:44.616Z

## Authored
### Purpose

Renders independently retained branches using the Local Map’s existing cards, symbol pins and interface colors.

### Notes

Since 2026-10-06 (the layout lab's first milestone) this module is the page's shell around the pure scene of `branch-scene.ts`: it builds the cards once and dresses their hidden rows and notes once, then for each start of the order step (`branch-restarts.ts`: the ranking's order, the previous picture's, and the seeded shuffles the tuning's `orderStarts` asks for) stands each card's rows in that start's order, acts as the scene's measurer (widths at max-content under the card cap; heights, pin offsets and label heights at the widths the columns give, the pins read from the rows as that start stood them), and places exactly; the cheapest picture by the tuning's costs is kept, its sections and lanes are built after the choice, and the laid-out scene is applied to the elements. The root says which start it drew (`data-order-start`), how many were tried (`data-order-starts`), the chosen start's price (`data-order-score`) and how long the layout took (`data-layout-ms`), for the lab's verify pass and the specs; by the page's clock five starts take about a quarter of a second on this repository's five-file scope and half a second on its chain ([Turn 12](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-12)); the layout lab feeds the same scene a measurer made from a capture of the page, so both draw one picture. The layout's dials come from the Local Map's tuning: the ranking's pull and tie rule, the order's sweeps and seed, the symbol order, the column gap, the item gap, the band gap, the membrane's neck and padding, and the card width cap. A pin centred on a half pixel rounds up by a thousandth before rounding, so the placement's input is the same wherever the card stood when measured; the earlier code measured after placing across and rounded on a knife-edge the page's transform could tip either way. What follows describes the picture the shell draws. Places native cards, lanes and the Membrane Map's directory bands on the vertical axis from the exact placement of `branch-placement.ts`, in the order `branch-order.ts` chose, while preserving dependency ranks: every element is positioned absolutely inside the element it belongs to, the columns at their measured widths. Since 2026-10-06 a directory's element is the bounds of its membrane's segments, drawn as nothing; the outline `membrane-outline.ts` traces around the segments is an SVG path inside it, beneath the cards, carrying `data-directory` for the deck; the label stands at the leftmost segment's top, given that segment's width before its height is measured; and the element publishes its segments in `data-segments`, in the picture's pixels, so a test or a reader can check the shape without the drawing. Until 2026-10-05 the picture was a CSS grid whose rows were shared across columns, so no card could be lowered to meet its partner without moving every column; the owner asked for the durable, correct implementation and this is it ([Turn 13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-13)). It measures in two passes, widths first and heights at those widths, because a card's rows of test names wrap at its column's width and a box's label wraps to nothing in a box not yet given a width; the first draft read 250 px of label into every box's inset. Keeps the band elements nested with their outlines and labels, so the perspective transition finds its shells. The root is the picture itself, a band kept as an element so that the perspective transition has its outermost shell but drawn as nothing, with no box, no padding and no name, as in the Membrane (until 2026-10-05 it was a band labelled "/" with its own padding around everything). Each lane the order reserved is a `.local-pass-through` spacer that the placement sizes as a box whose items are the lane's slots, one per bundle, and that says in `data-slots` where each slot came to rest below its top, so the router can measure the lane and thread the skipped references through its slots (since 2026-10-06; until then the spacer was one rigid item sized to its bundles at pitch): in a directory's stack of files after the named file or above the first, in a directory of directories in a grid row of its own among the subdirectories' rows, and in a column a directory spans with no file of its own as that column's only occupant. Stands each card's symbol rows in the order the branch graph chose, moving the row elements in the card's grid, rows the order does not name after them and Internals last; two symbols may share a normalized name, as graph.ts's LinkTarget and linkTarget do, so a name claims one row per mention, which the first draft got wrong and the alphabetical picture showed. Keeps explicit pins and the selected file legible; other cards can collapse to the rows required by retained symbols. Revealing a card is separate from retaining its interfaces, and closing clears that reveal override. Counts expose symbols and connections outside the current disclosure, and a card touched by a cycle's feedback says how many references read back, since those are drawn only as stubs until hovered (2026-10-05).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderBranches` {#symbol-renderbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L27)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)

##### `renderBranches` — Summary
Render the independently retained branches with the Local Map's cards,
symbol pins and interface colours, placed by the scene of
`branch-scene.ts`: the cards and lanes of every column stand where the
wires between pins are shortest, inside the directory membranes the order
chose, each membrane one segment per column following its members and
drawn as one outline, and each lane as tall as the slots its wires spread.
The exploration is ranked once and ordered from several starts (the
ranking's order, the previous picture's, and seeded shuffles, as
`branch-restarts.ts` names them); each start is measured on the page's
own cards and placed exactly, and the cheapest picture is drawn. This
module builds the cards once, measures them for every start, then builds
the chosen scene's sections and lanes and applies the layout; the elements
keep the names the router, the deck and the perspective transition read.
The layout's dials come from the Local Map's tuning.

#### `BAND_BORDER` {#symbol-band_border}
- Type: unknown
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L194)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-restarts.candidateStarts`](./branch-restarts.ts.mdmd.md#symbol-candidatestarts)
- [`branch-restarts.layoutStarts`](./branch-restarts.ts.mdmd.md#symbol-layoutstarts)
- [`branch-restarts.startName`](./branch-restarts.ts.mdmd.md#symbol-startname)
- [`branch-restarts.startOrder`](./branch-restarts.ts.mdmd.md#symbol-startorder)
- [`branch-scene.BAND_BORDER`](./branch-scene.ts.mdmd.md#symbol-band_border)
- [`branch-scene.SceneBox`](./branch-scene.ts.mdmd.md#symbol-scenebox)
- [`branch-scene.SceneMeasurer`](./branch-scene.ts.mdmd.md#symbol-scenemeasurer)
- [`branch-scene.ScenePlan`](./branch-scene.ts.mdmd.md#symbol-sceneplan)
- [`branch-scene.SceneTuning`](./branch-scene.ts.mdmd.md#symbol-scenetuning)
- [`branch-scene.hostOf`](./branch-scene.ts.mdmd.md#symbol-hostof)
- [`branch-scene.layoutScene`](./branch-scene.ts.mdmd.md#symbol-layoutscene)
- [`branch-scene.planBranches`](./branch-scene.ts.mdmd.md#symbol-planbranches)
- [`branches.Exploration`](./branches.ts.mdmd.md#symbol-exploration)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`branches.exploreBranches`](./branches.ts.mdmd.md#symbol-explorebranches)
- [`branches.orderExploration`](./branches.ts.mdmd.md#symbol-orderexploration)
- [`card-factory.createNodeCard`](./card-factory.ts.mdmd.md#symbol-createnodecard)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`membrane-outline.membranePath`](./membrane-outline.ts.mdmd.md#symbol-membranepath)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->
