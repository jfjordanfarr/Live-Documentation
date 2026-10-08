# packages/explorer/src/client/views/localView/layout-measure.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/layout-measure.ts
- Generated At: 2026-10-08T01:58:14.331Z

## Authored
### Purpose

Pure functions for measuring layout extents and computing fit transforms. Calculates bounding boxes, determines the camera that frames the selected card or a drawn path, and manages column vertical alignment.

### Notes

- Extracted from controller.ts during Dev Day 50 (12/19). Functions like `computeLayoutExtents()` and `computeFitTransform()` are pure math; DOM measurement is isolated to `withTransformReset()` callbacks.
- `computeFitTransform` frames the focus card with buffers around it, at a scale between 0.6 and 1.45. `computePathFitTransform` frames a drawn path at reading size only: centred when the whole path fits the frame, its first file at the left edge when it is wider, so what the frame cannot hold is to the right and never the start ([Turn 10 of 2026-10-01](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10)).
- The fit keeps a picture that fits the frame whole (2026-10-08, `keepVisible`): the camera centres on the focus but is shifted no further than the padding allows on either side when the content fits, where before the clamp was written for the case where it does not fit and a picture that would have fit was cut when its focus stood at its edge, as a directory entered with no file in focus showed. A closed directory's box counts among the tracked elements of the content's extents.

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

#### `CenterAlignmentGuides` {#symbol-centeralignmentguides}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L36)

##### `CenterAlignmentGuides` — Summary
Represents anchor Y-position guides for column alignment.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L46)

##### `clamp` — Summary
Clamps a value to a range.

#### `measureElementsBounds` {#symbol-measureelementsbounds}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L53)
- Returns: [`Bounds`](#symbol-bounds)
- Parameters: `elements`: `Iterable`; `containerRect`: `DOMRect`

##### `measureElementsBounds` — Summary
Measures the combined bounds of multiple elements.

#### `measureElementBounds` {#symbol-measureelementbounds}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L97)
- Returns: [`Bounds`](#symbol-bounds)
- Parameters: `containerRect`: `DOMRect`

##### `measureElementBounds` — Summary
Measures the bounds of a single element.

#### `withTransformReset` {#symbol-withtransformreset}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L111)
- Returns: `T`
- Parameters: `containerRect`: `DOMRect`

##### `withTransformReset` — Summary
Executes a callback with transform temporarily reset to "none",
then restores the original transform.

#### `computeLayoutExtents` {#symbol-computelayoutextents}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L133)
- Returns: [`LayoutExtents`](#symbol-layoutextents)

##### `computeLayoutExtents` — Summary
Computes layout extents for the content and focus element.

#### `computeFitTransform` {#symbol-computefittransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L186)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `extents`: [`LayoutExtents`](#symbol-layoutextents); `viewportRect`: `DOMRect`

##### `computeFitTransform` — Summary
Computes the target transform to fit content within the viewport.

#### `computePathFitTransform` {#symbol-computepathfittransform}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L268)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `content`: [`Bounds`](#symbol-bounds); `frame`: `DOMRect`

##### `computePathFitTransform` — Summary
The camera for a drawn path: reading size, level with the frame's middle,
centred when the whole path fits and otherwise with its first file at the
left edge. A path is read from its first file, so what the frame cannot hold
lies to the right, one pan away, and never the start.

#### `buildAnchorGuideKey` {#symbol-buildanchorguidekey}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L282)

##### `buildAnchorGuideKey` — Summary
Builds an anchor guide key for column alignment lookups.

#### `collectCenterAlignmentGuides` {#symbol-collectcenteralignmentguides}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L294)
- Returns: [`CenterAlignmentGuides`](#symbol-centeralignmentguides)
- Parameters: `containerRect`: `DOMRect`

##### `collectCenterAlignmentGuides` — Summary
Collects center alignment guides from a column element.

#### `lookupCenterAnchorPosition` {#symbol-lookupcenteranchorposition}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L346)
- Parameters: `guides`: [`CenterAlignmentGuides`](#symbol-centeralignmentguides)

##### `lookupCenterAnchorPosition` — Summary
Looks up a center anchor position from guides, with fallback.

#### `applyColumnVerticalCentering` {#symbol-applycolumnverticalcentering}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L378)

##### `applyColumnVerticalCentering` — Summary
Applies vertical centering to columns within a layout root.

#### `applyContainerDimensions` {#symbol-applycontainerdimensions}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/layout-measure.ts#L426)
- Parameters: `content`: [`Bounds`](#symbol-bounds)

##### `applyContainerDimensions` — Summary
Sets container/overlay dimensions based on content extents.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->
