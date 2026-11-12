# packages/explorer/src/client/views/localView/layout-measure.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/layout-measure.ts
- Generated At: 2026-11-12T17:14:37.867Z

## Authored
### Purpose

Pure functions for measuring layout extents and computing fit transforms. Calculates bounding boxes, determines the camera that frames the selected card or a drawn path.

### Notes
- `focusTransform` frames a requested row or file within the available canvas at reading size, backing out of excessive magnification when necessary but never shrinking text below that size. The controller supplies the row's full horizontal extent, including its controls, separately from the whole picture's bounds ([the November 3 search-framing repair](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-03.1.SUMMARIZED.md#turn-2)).

- Extracted from controller.ts during Dev Day 50 (12/19). Functions like `computeLayoutExtents()` and `computeFitTransform()` are pure math; DOM measurement is isolated to `withTransformReset()` callbacks.
- `computeFitTransform` frames the focus card with buffers around it, at a scale between 0.6 and 1.45. `computePathFitTransform` frames a drawn path at reading size only: centred when the whole path fits the frame, its first file at the left edge when it is wider, so what the frame cannot hold is to the right and never the start ([Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10)).
- The fit keeps a picture that fits the frame whole (2026-10-08, `keepVisible`): the camera centres on the focus but is shifted no further than the padding allows on either side when the content fits, where before the clamp was written for the case where it does not fit and a picture that would have fit was cut when its focus stood at its edge, as a directory entered with no file in focus showed. A closed directory's box counts among the tracked elements of the content's extents.
- `wholeTransform` (2026-11-12) is the camera of the 2D map's Fit: everything shown, centred inside the frame's padding, at the reading scale when it fits there and smaller when it does not. It never magnifies past the reading scale, and it always stands closer than the farthest zoom of `zoom-limits.ts`, which is at most four fifths of the whole map's fit ([the first-visit review](../../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md), finding 5).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Bounds` {#symbol-bounds}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L16)

##### `Bounds` — Summary
Represents bounding box dimensions.

#### `LayoutExtents` {#symbol-layoutextents}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L28)

##### `LayoutExtents` — Summary
Represents layout extent measurements.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L36)

##### `clamp` — Summary
Clamps a value to a range.

#### `measureElementsBounds` {#symbol-measureelementsbounds}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L43)
- Returns: [`Bounds`](#symbol-bounds)
- Parameters: `elements`: `Iterable`; `containerRect`: `DOMRect`

##### `measureElementsBounds` — Summary
Measures the combined bounds of multiple elements.

#### `measureElementBounds` {#symbol-measureelementbounds}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L87)
- Returns: [`Bounds`](#symbol-bounds)
- Parameters: `containerRect`: `DOMRect`

##### `measureElementBounds` — Summary
Measures the bounds of a single element.

#### `withTransformReset` {#symbol-withtransformreset}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L101)
- Returns: `T`
- Parameters: `containerRect`: `DOMRect`

##### `withTransformReset` — Summary
Executes a callback with transform temporarily reset to "none",
then restores the original transform.

#### `computeLayoutExtents` {#symbol-computelayoutextents}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L123)
- Returns: [`LayoutExtents`](#symbol-layoutextents)

##### `computeLayoutExtents` — Summary
Computes layout extents for the content and focus element.

#### `computeFitTransform` {#symbol-computefittransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L156)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `extents`: [`LayoutExtents`](#symbol-layoutextents); `viewportRect`: [`Frame`](#symbol-frame)

##### `computeFitTransform` — Summary
Computes the target transform to fit content within the viewport.

#### `Frame` {#symbol-frame}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L226)

##### `Frame` — Summary
The size of the frame a fit is computed for; a DOMRect is one.

#### `framePadding` {#symbol-framepadding}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L232)
- Parameters: `frame`: [`Frame`](#symbol-frame)

##### `framePadding` — Summary
The room a fit leaves between the picture and the frame's edges: two percent of the width, two and a half of the height, 8 to 72 px.

#### `settleTransform` {#symbol-settletransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L254)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `content`: [`Bounds`](#symbol-bounds); `current`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](#symbol-frame)

##### `settleTransform` — Summary
The camera after the subject has been held where another view left it (a return from 3D, 2026-10-30): the same
scale, moved the least that brings the picture into the frame, by the rule of {@link keepVisible} on each axis;
a picture already inside it does not move.

#### `wholeTransform` {#symbol-wholetransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L270)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `content`: [`Bounds`](#symbol-bounds); `frame`: [`Frame`](#symbol-frame)

##### `wholeTransform` — Summary
The camera of the 2D map's Fit (2026-11-12, the first-visit review's finding 5): everything the map shows, centred,
inside the frame's padding, at the reading scale when it fits there and smaller when it does not. Only a person's
press asks for it: an arrival keeps reading size and is never scaled down to fit (the owner, 2026-10-30). The scale
is always closer than the farthest zoom, which is at most four fifths of the whole map's fit.

#### `focusTransform` {#symbol-focustransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L279)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `target`: [`Bounds`](#symbol-bounds); `current`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](#symbol-frame)

##### `focusTransform` — Summary
Frame an explicitly requested row or file at reading size, including its actions, inside the usable canvas.

#### `cardReadingTransform` {#symbol-cardreadingtransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L294)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `card`: [`Bounds`](#symbol-bounds); `frame`: [`Frame`](#symbol-frame)

##### `cardReadingTransform` — Summary
A card's own reading reference: use available room, keep text at least its authored size, and enter overflow at the top.

#### `hiddenEdges` {#symbol-hiddenedges}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L306)
- Parameters: `content`: [`Bounds`](#symbol-bounds); `transform`: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform); `frame`: [`Frame`](#symbol-frame)

##### `hiddenEdges` — Summary
Which edges of the frame the picture continues past, by more than `tolerance` px, at the camera given.

#### `computePathFitTransform` {#symbol-computepathfittransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L336)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `content`: [`Bounds`](#symbol-bounds); `frame`: [`Frame`](#symbol-frame)

##### `computePathFitTransform` — Summary
The camera for a drawn path: reading size, level with the frame's middle,
centred when the whole path fits and otherwise with its first file at the
left edge. A path is read from its first file, so what the frame cannot hold
lies to the right, one pan away, and never the start.

#### `applyContainerDimensions` {#symbol-applycontainerdimensions}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L350)
- Parameters: `content`: [`Bounds`](#symbol-bounds)

##### `applyContainerDimensions` — Summary
Sets container/overlay dimensions based on content extents.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
