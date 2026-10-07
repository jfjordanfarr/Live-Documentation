# packages/explorer/src/client/views/localView/branch-renderer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-renderer.ts
- Generated At: 2026-10-07T15:18:06.793Z

## Authored
### Purpose

Renders independently retained branches using the Local Map’s existing cards, symbol pins and interface colors.

### Notes

Since 2026-10-06 (the layout lab's first milestone) this module is the page's shell around the pure scene of `branch-scene.ts`: it builds the cards once and dresses their hidden rows and notes once, then for each start of the order step (`branch-restarts.ts`: the ranking's order, the previous picture's, and the seeded shuffles the tuning's `orderStarts` asks for) stands each card's rows in that start's order, acts as the scene's measurer (widths at max-content under the card cap; heights, pin offsets and label heights at the widths the columns give, the pins read from the rows as that start stood them), and places exactly; the cheapest picture by the tuning's costs is kept, its sections and lanes are built after the choice, and the laid-out scene is applied to the elements. The root says which start it drew (`data-order-start`), how many were tried (`data-order-starts`), the chosen start's price (`data-order-score`) and how long the layout took (`data-layout-ms`), for the lab's verify pass and the specs; by the page's clock five starts take about a quarter of a second on this repository's five-file scope and half a second on its chain ([Turn 12](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-12)); the layout lab feeds the same scene a measurer made from a capture of the page, so both draw one picture. The layout's dials come from the Local Map's tuning: the ranking's pull and tie rule, the order's sweeps and seed, the symbol order, the column gap, the item gap, the band gap, the membrane's neck and padding, and the card width cap. A pin centred on a half pixel rounds up by a thousandth before rounding, so the placement's input is the same wherever the card stood when measured; the earlier code measured after placing across and rounded on a knife-edge the page's transform could tip either way. What follows describes the picture the shell draws. Places native cards, lanes and the Membrane Map's directory bands on the vertical axis from the exact placement of `branch-placement.ts`, in the order `branch-order.ts` chose, while preserving dependency ranks: every element is positioned absolutely inside the element it belongs to, the columns at their measured widths. Since 2026-10-06 a directory's element is the bounds of its membrane's segments, drawn as nothing; the outline `membrane-outline.ts` traces around the segments is an SVG path inside it, beneath the cards, carrying `data-directory` for the deck; the label stands at the leftmost segment's top, given that segment's width before its height is measured; and the element publishes its segments in `data-segments`, in the picture's pixels, so a test or a reader can check the shape without the drawing. Until 2026-10-05 the picture was a CSS grid whose rows were shared across columns, so no card could be lowered to meet its partner without moving every column; the owner asked for the durable, correct implementation and this is it ([Turn 13](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-05.1.record.md#turn-13)). It measures in two passes, widths first and heights at those widths, because a card's rows of test names wrap at its column's width and a box's label wraps to nothing in a box not yet given a width; the first draft read 250 px of label into every box's inset. Keeps the band elements nested with their outlines and labels, so the perspective transition finds its shells. The root is the picture itself, a band kept as an element so that the perspective transition has its outermost shell but drawn as nothing, with no box, no padding and no name, as in the Membrane (until 2026-10-05 it was a band labelled "/" with its own padding around everything). Each lane the order reserved is a `.local-pass-through` spacer that the placement sizes as a box whose items are the lane's slots, one per bundle, and that says in `data-slots` where each slot came to rest below its top, so the router can measure the lane and thread the skipped references through its slots (since 2026-10-06; until then the spacer was one rigid item sized to its bundles at pitch): in a directory's stack of files after the named file or above the first, in a directory of directories in a grid row of its own among the subdirectories' rows, and in a column a directory spans with no file of its own as that column's only occupant. Stands each card's symbol rows in the order the branch graph chose, moving the row elements in the card's grid, rows the order does not name after them and Internals last; two symbols may share a normalized name, as graph.ts's LinkTarget and linkTarget do, so a name claims one row per mention, which the first draft got wrong and the alphabetical picture showed. Keeps explicit pins and the selected file legible; other cards can collapse to the rows required by retained symbols. Revealing a card is separate from retaining its interfaces, and closing clears that reveal override. Counts expose symbols and connections outside the current disclosure, and a card touched by a cycle's feedback says how many references read back, since those are drawn only as stubs until hovered (2026-10-05).
- Since 2026-10-07 the renderer keeps a stage across renders (`BranchStage`: the wrappers by file, the sections and spacers by the pose's box key, the outlines, the labels, the pose shown and the move running) and moves the picture from the previous pose to the new over the tuning's `moveMs` instead of redrawing it: `applyPose` sets every element from a pose; `startMove` runs the frames, eased, slides the rows of a card from their old places (`rowOffsets`, `rowMotions`), fades entering and leaving elements, holds the card last interacted with still by measuring it on screen each frame, and redraws the wires every frame with the overlay saying `moving` so that the stylesheet drops their glow; `endMove` finishes a move at its destination or leaves an interrupted one where it stands, and a render that interrupts starts from that frame. The held card is measured on screen rather than followed in the pose because the picture root shifts in its container as the picture's size changes; the first try followed the pose alone and the picture crept upward over several moves. The root says `data-moving` while a move runs, for the specs and the tools, and no text announces it (the owner's choices, [Turn 16](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-16)).
- The continuing search (2026-10-07, [Turn 17](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-17)): the first paint's measurer writes the page's answers that no start changes into `PageAnswers` (each card's natural width and height at its column's width, each drawn directory's label height), and `rowsOf` measures each card's rows once at the chosen order; after the first paint the stage's `Search` runs one seeded start per idle moment (`scheduleSearch`, `requestIdleCallback` or a timer), each ordered, planned and placed from the answers through `answersMeasurer` and judged by `branch-search.ts` against the shown picture's own price with its churn against the shown tops; an adopted picture has its rows stood on the cards, is measured on the page through `pageMeasurer`, placed, priced exactly and shown through `showScene`, the same way a render's picture is, moving; the search waits for a move to end and begins afresh on every render; `writeSearch` puts its state on the root (`data-search-status`, `-tried`, `-next`, `-adopted`, `-shown`, `-priced`) and no text announces it. A forced seed searches nothing. `showScene` is the part of a render after the picture is chosen, factored out so that the search's adoption and a render share it.
- Later on 2026-10-07 the root also says the best price the search has found, churn aside (`data-search-best`), and an adopted picture's price as the page measures it becomes the best found as well as the shown price, unless an earlier start priced lower.
- The exploration takes the tuning's `membraneDepth` (2026-10-07), the lab's lever for the membrane rule; at its default of null nothing changes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BranchStage` {#symbol-branchstage}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L22)

##### `BranchStage` — Summary
The branch picture's elements, kept across renders by what each one is: a
card's wrapper by its file, a membrane's section and a lane's spacer by
the pose's box key, a label by its directory. A render builds the cards
afresh for the state it draws, but inside the wrapper that stood for the
file before, so that the picture moves from where it was to where it now
belongs instead of being redrawn (the owner's ask, 2026-10-07). The stage
also carries the continuing search that runs after each picture.

#### `createStage` {#symbol-createstage}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L74)
- Returns: [`BranchStage`](#symbol-branchstage)

##### `createStage` — Summary
A stage for a root that holds nothing yet.

#### `dropStage` {#symbol-dropstage}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L79)
- Parameters: `stage`: [`BranchStage`](#symbol-branchstage)

##### `dropStage` — Summary
Ends whatever move the stage runs, where it stands, and its search; the stage's elements are the caller's to remove.

#### `renderBranches` {#symbol-renderbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L107)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `stage`: [`BranchStage`](#symbol-branchstage)

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
When the stage already shows a picture, the new one is not applied at once:
every element the two share slides from its old place to its new over the
tuning's move length, the rows of a card with them, what is new fades in
and what is gone fades out, the wires are redrawn every frame, and the card
the person last interacted with is held still on screen by the camera.
After the picture is drawn, the continuing search goes on trying seeded
starts in the page's idle moments and moves the picture to a better one.
The layout's dials come from the Local Map's tuning.

#### `BAND_BORDER` {#symbol-band_border}
- Type: unknown
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L204)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-motion.Pose`](./branch-motion.ts.mdmd.md#symbol-pose)
- [`branch-motion.boxKeyOf`](./branch-motion.ts.mdmd.md#symbol-boxkeyof)
- [`branch-motion.easeInOutCubic`](./branch-motion.ts.mdmd.md#symbol-easeinoutcubic)
- [`branch-motion.scenePose`](./branch-motion.ts.mdmd.md#symbol-scenepose)
- [`branch-motion.tweenPose`](./branch-motion.ts.mdmd.md#symbol-tweenpose)
- [`branch-restarts.StartCosts`](./branch-restarts.ts.mdmd.md#symbol-startcosts)
- [`branch-restarts.candidateStarts`](./branch-restarts.ts.mdmd.md#symbol-candidatestarts)
- [`branch-restarts.churnOf`](./branch-restarts.ts.mdmd.md#symbol-churnof)
- [`branch-restarts.layoutStarts`](./branch-restarts.ts.mdmd.md#symbol-layoutstarts)
- [`branch-restarts.scoreOf`](./branch-restarts.ts.mdmd.md#symbol-scoreof)
- [`branch-restarts.startName`](./branch-restarts.ts.mdmd.md#symbol-startname)
- [`branch-restarts.startOrder`](./branch-restarts.ts.mdmd.md#symbol-startorder)
- [`branch-scene.BAND_BORDER`](./branch-scene.ts.mdmd.md#symbol-band_border)
- [`branch-scene.Scene`](./branch-scene.ts.mdmd.md#symbol-scene)
- [`branch-scene.SceneBox`](./branch-scene.ts.mdmd.md#symbol-scenebox)
- [`branch-scene.SceneMeasurer`](./branch-scene.ts.mdmd.md#symbol-scenemeasurer)
- [`branch-scene.ScenePlan`](./branch-scene.ts.mdmd.md#symbol-sceneplan)
- [`branch-scene.SceneTuning`](./branch-scene.ts.mdmd.md#symbol-scenetuning)
- [`branch-scene.hostOf`](./branch-scene.ts.mdmd.md#symbol-hostof)
- [`branch-scene.layoutScene`](./branch-scene.ts.mdmd.md#symbol-layoutscene)
- [`branch-scene.planBranches`](./branch-scene.ts.mdmd.md#symbol-planbranches)
- [`branch-search.CardRows`](./branch-search.ts.mdmd.md#symbol-cardrows)
- [`branch-search.RowMeasure`](./branch-search.ts.mdmd.md#symbol-rowmeasure)
- [`branch-search.SearchState`](./branch-search.ts.mdmd.md#symbol-searchstate)
- [`branch-search.beginSearch`](./branch-search.ts.mdmd.md#symbol-beginsearch)
- [`branch-search.judgeStart`](./branch-search.ts.mdmd.md#symbol-judgestart)
- [`branch-search.pinFor`](./branch-search.ts.mdmd.md#symbol-pinfor)
- [`branches.BranchGraph`](./branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.Exploration`](./branches.ts.mdmd.md#symbol-exploration)
- [`branches.edgeKey`](./branches.ts.mdmd.md#symbol-edgekey)
- [`branches.exploreBranches`](./branches.ts.mdmd.md#symbol-explorebranches)
- [`branches.orderExploration`](./branches.ts.mdmd.md#symbol-orderexploration)
- [`card-factory.createNodeCard`](./card-factory.ts.mdmd.md#symbol-createnodecard)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`membrane-outline.membranePath`](./membrane-outline.ts.mdmd.md#symbol-membranepath)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->
