# scripts/layout-lab/measurer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/measurer.ts
- Generated At: 2026-10-31T16:40:18.327Z

## Authored
### Purpose

Answers the scene's card width, height, pin and membrane-label questions from a page capture, so the same layout can run headlessly.

### Notes

Each card first reconstructs the browser's construction order from its graph symbols and the requested symbol-order setting. That sequence supplies both endpoint registration and the normalized display queues; the layout then claims one row per name occurrence and leaves Internals last. This order matters when exact duplicates or differently cased symbols share a normalized name: a capture's prior arrangement must not decide the next one.

Rows no pin needs are collapsed unless the file is retained whole or selected. Hidden-symbol counts and backward-reference notes are regenerated from the exploration; outside-view connection notes come from the capture because they are properties of the same graph. Widths use captured natural width under the cap and never below the card's minimum. Heights are rounded as `offsetHeight` rounds, pins as the renderer rounds with its thousandth-pixel offset, and card metrics are retained for routing.

The captured measurer was introduced with the [October 6 lab](../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-06.1.SUMMARIZED.md#turn-10). Its construction-order and endpoint-identity rules were made explicit during the [October 13 shared competition](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

The notes are worded with the page's own `countOf` since 2026-10-31, a count and its unit joined by a no-break space as the page has written them since 2026-10-30: the measurer recognizes a captured reveal by that wording, and when it looked for a plain space it counted the page's reveal a second time, 20 px on every card that folds symbols ([the work notes of October 31](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-2)).

November 4 recomputes a reading card’s width from the captured available frame and a proposed card-width cap. The actual card may be narrower than its column slot; heights and routes use that rendered width. Conditional overflow actions are recalculated when text is reflowed, rather than frozen from the original screenshot. See the [integration record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MeasurerOptions` {#symbol-measureroptions}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/measurer.ts#L21)

##### `MeasurerOptions` — Summary
What the measurer needs to know of the page's state beyond the exploration: the pins, the subject and the collapse tuning.

#### `cardViews` {#symbol-cardviews}
- Type: function
- Source: [source](../../../../scripts/layout-lab/measurer.ts#L30)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `branches`: [`BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph); `options`: [`MeasurerOptions`](#symbol-measureroptions)

##### `cardViews` — Summary
Every card's view under an exploration, as `dressCards` would dress it.

#### `capturedMeasurer` {#symbol-capturedmeasurer}
- Type: function
- Source: [source](../../../../scripts/layout-lab/measurer.ts#L91)
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
- [`word-seams.countOf`](../../packages/explorer/src/client/views/localView/word-seams.ts.mdmd.md#symbol-countof)
- [`pin-state.PinSet`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../../packages/explorer/src/client/views/symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`capture.CardCapture`](./capture.ts.mdmd.md#symbol-cardcapture) (type-only)
- [`capture.RowCapture`](./capture.ts.mdmd.md#symbol-rowcapture) (type-only)
- [`card-model.CardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-interface)
- [`card-model.CardView`](./card-model.ts.mdmd.md#symbol-cardview)
- [`card-model.cardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-function)
- [`card-model.labelHeight`](./card-model.ts.mdmd.md#symbol-labelheight)
- [`card-model.pinOffset`](./card-model.ts.mdmd.md#symbol-pinoffset)
- [`card-model.synthesizedHeight`](./card-model.ts.mdmd.md#symbol-synthesizedheight)
- [`card-model.textHeight`](./card-model.ts.mdmd.md#symbol-textheight)
<!-- LIVE-DOC:END Dependencies -->
