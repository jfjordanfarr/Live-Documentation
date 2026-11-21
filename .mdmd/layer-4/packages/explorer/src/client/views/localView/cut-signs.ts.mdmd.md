# `packages/explorer/src/client/views/localView/cut-signs.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/cut-signs.ts`
- Generated At: 2026-11-21T07:10:14.660Z

## Authored
### Purpose
The controls of Tuning → 2D Layout → Cut Counted, a trial: after a step from inside the 2D map, at each edge of the view past which what the step opened goes on, an arrow and the count of its cards there, which a press pans to. They stand over the map's frame as [`edge-signs.ts`](edge-signs.ts.mdmd.md)'s fades do; their arithmetic is [`camera-intent.ts`](camera-intent.ts.mdmd.md)'s `cutByEdge` and `cutPan`, and [`controller.ts`](controller.ts.mdmd.md) says what they watch (the last step's opening, measured again at each settle) and moves them with the camera.

### Notes
- Made on November 21, 2026, from the root's brief after blind testers answered from a view that cut what a step had opened. It was first asked for as a fourth value of Step and made a lever of its own the same day, since it complements any value: the folder no frame holds at reading scale is where it is needed.
- No sentence of ours on the map: an arrow and a number. The words ("31 cards of what you opened past the view's right edge: show them") are the control's accessible name and tooltip only. A control that goes while it holds the focus gives the focus back to the map.
- A press first panned along its edge's axis to all the cards cut there at once. On `live-docs/history`, whose cards lay up and to the right of the view, that landed on other cards with none of them whole, so a press now brings the nearest of them whole into view and the next press goes on.
- The first look at it seemed to show wrong counts, but that was a misread log: the counts printed were `history`'s, beside the estate's picture. Making what the controls watch visible on the map (`data-cut-of`, `data-cut-cards`) settled it, and the unit cases are held to the boxes the page drew. The pictures are [the step-framing evidence](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Screenshots/step-framing/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CutCard` {#symbol-cutcard}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cut-signs.ts#L18)

##### `CutCard` — Summary
One thing the last step opened, by its key (a file's id, a directory's path), in the picture's own units.

#### `CutSigns` {#symbol-cutsigns}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cut-signs.ts#L24)

##### `CutSigns` — Summary
The controls' element and the one way to move them.

#### `cutSignName` {#symbol-cutsignname}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cut-signs.ts#L36)
- Parameters: `edge`: [`ViewEdge`](./camera-intent.ts.mdmd.md#symbol-viewedge)

##### `cutSignName` — Summary
The words a control carries for a screen reader and a resting pointer: what it counts, and where it takes the view.

#### `createCutSigns` {#symbol-createcutsigns}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/cut-signs.ts#L42)
- Returns: [`CutSigns`](#symbol-cutsigns)
- Parameters: `edge`: [`ViewEdge`](./camera-intent.ts.mdmd.md#symbol-viewedge)

##### `createCutSigns` — Summary
Makes the controls inside the view, after its layers so that they paint above the map; a press calls `onPress`.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`camera-intent.VIEW_EDGES`](./camera-intent.ts.mdmd.md#symbol-view_edges)
- [`camera-intent.ViewEdge`](./camera-intent.ts.mdmd.md#symbol-viewedge)
- [`camera-intent.cutByEdge`](./camera-intent.ts.mdmd.md#symbol-cutbyedge)
- [`edge-signs.FramePlace`](./edge-signs.ts.mdmd.md#symbol-frameplace) (type-only)
- [`layout-measure.Bounds`](./layout-measure.ts.mdmd.md#symbol-bounds) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->
