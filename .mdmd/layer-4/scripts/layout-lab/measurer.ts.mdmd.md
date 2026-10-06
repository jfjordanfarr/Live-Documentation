# scripts/layout-lab/measurer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/measurer.ts
- Generated At: 2026-10-06T20:39:25.907Z

## Authored
### Purpose

The scene's measurer made from a capture: answers the layout's questions about every card's width and height, every pin and every label by the card model, so a layout runs with no page at all.

### Notes

Each card shows what the page would show it under the exploration being laid out, as `dressCards` dresses it: its rows in the order the layout chose, a name claiming one captured row per mention (two symbols may share a normalized name), the rows no pin needs collapsed unless the file is retained whole or selected, and the notes under it regenerated: the hidden-symbol count and the references read back from the exploration, the connections outside the view from the capture, since they are the graph's. Widths are the captured natural width under the cap, no narrower than the card's minimum; heights are rounded as `offsetHeight` rounds and pins as the renderer rounds, up by a thousandth. The metrics of every card are kept for the routes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MeasurerOptions` {#symbol-measureroptions}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/measurer.ts#L19)

##### `MeasurerOptions` — Summary
What the measurer needs to know of the page's state beyond the exploration: the pins, the subject and the collapse tuning.

#### `cardViews` {#symbol-cardviews}
- Type: function
- Source: [source](../../../../scripts/layout-lab/measurer.ts#L27)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `branches`: [`BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph); `options`: [`MeasurerOptions`](#symbol-measureroptions)

##### `cardViews` — Summary
Every card's view under an exploration, as `dressCards` would dress it.

#### `capturedMeasurer` {#symbol-capturedmeasurer}
- Type: function
- Source: [source](../../../../scripts/layout-lab/measurer.ts#L74)
- Returns: [`SceneMeasurer`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scenemeasurer)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `branches`: [`BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph); `options`: [`MeasurerOptions`](#symbol-measureroptions)

##### `capturedMeasurer` — Summary
A measurer over the capture for one exploration.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-scene.SceneMeasurer`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scenemeasurer) (type-only)
- [`branches.BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.edgeKey`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-edgekey)
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
