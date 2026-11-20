# `scripts/layout-lab/measurer.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/layout-lab/measurer.ts`
- Generated At: 2026-11-19T21:10:18.692Z

## Authored
### Purpose

Answers the scene's card width, height, pin and membrane-label questions from a page capture, so the same layout can run headlessly.

### Notes

Each card first reconstructs the browser's construction order from its graph symbols and the requested symbol-order setting. That sequence supplies both endpoint registration and the normalized display queues; the layout then claims one row per name occurrence and leaves Internals last. This order matters when exact duplicates or differently cased symbols share a normalized name: a capture's prior arrangement must not decide the next one.

Rows no pin needs are collapsed unless the file is retained whole or selected. Hidden-symbol counts and backward-reference notes are regenerated from the exploration; outside-view connection notes come from the capture because they are properties of the same graph. Widths use captured natural width under the cap and never below the card's minimum. Heights are rounded as `offsetHeight` rounds, pins as the renderer rounds with its thousandth-pixel offset, and card metrics are retained for routing.

The captured measurer was introduced with the [October 6 lab](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/Summarized/2026-10-06.1.SUMMARIZED.md#turn-10). Its construction-order and endpoint-identity rules were made explicit during the [October 13 shared competition](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-13/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

The notes are worded with the page's own `countOf` since 2026-10-31, a count and its unit joined by a no-break space as the page has written them since 2026-10-30: the measurer recognizes a captured reveal by that wording, and when it looked for a plain space it counted the page's reveal a second time, 20 px on every card that folds symbols ([the work notes of October 31](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-2)).

November 4 recomputes a reading card’s width from the captured available frame and a proposed card-width cap. The actual card may be narrower than its column slot; heights and routes use that rendered width. Conditional overflow actions are recalculated when text is reflowed, rather than frozen from the original screenshot. See the [integration record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-04/2026-11-04.1.record.md#turn-2).

The [November 4 learning-journey pass](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-04/2026-11-04.1.record.md#turn-8) composes the relationship controls above prose when the capture identifies that placement, retaining older bottom-count captures. Narrow phone predictions include wrapped controls and actual name break opportunities. Cycle notes use the current return-connection wording once, so a captured note is not counted again after regenerating it from the graph.

Since 2026-11-15 ([November 15, Turn 1](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) a directory's label height is the strip's constant, `HANDLE_STRIP` of the page's `directory-handle.ts`, whatever its width or text.

A card's note on returning connections counts what the page counts since 2026-11-16: the returns drawn at the card, both rows shown, by the page's own `returningConnections`. The round that lit the 3D button for a cycle's returns ([Turn 1 of the November 15 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1), `cb6cec56`) changed `dressCards` so and left this measurer counting every return in the ranking; on the scope "repository, chain" the model then stood two cards 21 px taller than the page, a note the page no longer drew, and the lab's agreement with the page was red until this was mended ([the work notes after Turn 7](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-7)). Every card's rows are therefore shown or hidden before any card counts its returns, as on the page; a reference's end with no row of its own stands on the card's hub, which no disclosure hides.

A reference end with no row of its own, no symbol or one the card does not list, stands where the page's `getAnchor` falls back: the offering end on the card's outbound hub, which no disclosure hides, and the using end on the Internals row's dot, which the disclosure hides with the row. Until 2026-11-16 the measurer took both for the hub, so it counted a return at a card whose Internals the page hides and drew a returning-connections line the page did not: `core.ts` stood 20 px taller in the lab than on the page in two pictures of the first fewest-returns round ([Turn 5 of the November 15 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-5)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MeasurerOptions` {#symbol-measureroptions}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/measurer.ts#L24)

##### `MeasurerOptions` — Summary
What the measurer needs to know of the page's state beyond the exploration: the pins, the subject and the collapse tuning.

#### `cardViews` {#symbol-cardviews}
- Type: function
- Source: [source](../../../../scripts/layout-lab/measurer.ts#L33)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `branches`: [`BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph); `options`: [`MeasurerOptions`](#symbol-measureroptions)

##### `cardViews` — Summary
Every card's view under an exploration, as `dressCards` would dress it.

#### `capturedMeasurer` {#symbol-capturedmeasurer}
- Type: function
- Source: [source](../../../../scripts/layout-lab/measurer.ts#L107)
- Returns: [`SceneMeasurer`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scenemeasurer)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `branches`: [`BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph); `options`: [`MeasurerOptions`](#symbol-measureroptions)

##### `capturedMeasurer` — Summary
A measurer over the capture for one exploration.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.SymbolOrder`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-symbolorder) (type-only)
- [`branch-scene.SceneMeasurer`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scenemeasurer) (type-only)
- [`branches.BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.compareSymbolNames`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-comparesymbolnames)
- [`branches.edgeKey`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-edgekey)
- [`directory-handle.HANDLE_STRIP`](../../packages/explorer/src/client/views/localView/directory-handle.ts.mdmd.md#symbol-handle_strip)
- [`returning-connections.connectionCount`](../../packages/explorer/src/client/views/localView/returning-connections.ts.mdmd.md#symbol-connectioncount)
- [`returning-connections.returningConnections`](../../packages/explorer/src/client/views/localView/returning-connections.ts.mdmd.md#symbol-returningconnections-function)
- [`types.LocalEdge`](../../packages/explorer/src/client/views/localView/types.ts.mdmd.md#symbol-localedge) (type-only)
- [`word-seams.countOf`](../../packages/explorer/src/client/views/localView/word-seams.ts.mdmd.md#symbol-countof)
- [`pin-state.PinSet`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../../packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`capture.CardCapture`](./capture.ts.mdmd.md#symbol-cardcapture) (type-only)
- [`capture.RowCapture`](./capture.ts.mdmd.md#symbol-rowcapture) (type-only)
- [`card-model.CardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-interface)
- [`card-model.CardView`](./card-model.ts.mdmd.md#symbol-cardview)
- [`card-model.cardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-function)
- [`card-model.pinOffset`](./card-model.ts.mdmd.md#symbol-pinoffset)
- [`card-model.synthesizedHeight`](./card-model.ts.mdmd.md#symbol-synthesizedheight)
- [`card-model.textHeight`](./card-model.ts.mdmd.md#symbol-textheight)
<!-- LIVE-DOC:END Dependencies -->
