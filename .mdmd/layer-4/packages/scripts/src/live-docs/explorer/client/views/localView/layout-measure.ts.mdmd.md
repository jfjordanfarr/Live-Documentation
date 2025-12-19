# packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-layout-measure-ts
- Generated At: 2025-12-19T21:19:50.798Z

## Authored
### Purpose
Pure functions for measuring layout extents and computing fit transforms. Calculates bounding boxes, determines optimal zoom/pan to fit content in viewport, and manages column vertical alignment.

### Notes
Extracted from controller.ts during Dev Day 50 (12/19). Functions like `computeLayoutExtents()` and `computeFitTransform()` are pure math; DOM measurement is isolated to `withTransformReset()` callbacks.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:19:50.798Z","inputHash":"73799fccb22df16c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Bounds` {#symbol-bounds}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L16)

##### `Bounds` — Summary
Represents bounding box dimensions.

#### `LayoutExtents` {#symbol-layoutextents}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L28)

##### `LayoutExtents` — Summary
Represents layout extent measurements.

#### `CenterAlignmentGuides` {#symbol-centeralignmentguides}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L36)

##### `CenterAlignmentGuides` — Summary
Represents anchor Y-position guides for column alignment.

#### `clamp` {#symbol-clamp}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L46)

##### `clamp` — Summary
Clamps a value to a range.

#### `measureElementsBounds` {#symbol-measureelementsbounds}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L53)
- Returns: [`Bounds`](./types.ts.mdmd.md#symbol-bounds)
- Parameters: `elements`: `Iterable`; `containerRect`: `DOMRect`

##### `measureElementsBounds` — Summary
Measures the combined bounds of multiple elements.

#### `measureElementBounds` {#symbol-measureelementbounds}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L97)
- Returns: [`Bounds`](./types.ts.mdmd.md#symbol-bounds)
- Parameters: `containerRect`: `DOMRect`

##### `measureElementBounds` — Summary
Measures the bounds of a single element.

#### `withTransformReset` {#symbol-withtransformreset}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L111)
- Returns: `T`
- Parameters: `containerRect`: `DOMRect`

##### `withTransformReset` — Summary
Executes a callback with transform temporarily reset to "none",
then restores the original transform.

#### `computeLayoutExtents` {#symbol-computelayoutextents}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L133)
- Returns: [`LayoutExtents`](./types.ts.mdmd.md#symbol-layoutextents)

##### `computeLayoutExtents` — Summary
Computes layout extents for the content and focus element.

#### `computeFitTransform` {#symbol-computefittransform}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L186)
- Returns: [`MapTransform`](./types.ts.mdmd.md#symbol-maptransform)
- Parameters: `extents`: [`LayoutExtents`](./types.ts.mdmd.md#symbol-layoutextents); `viewportRect`: `DOMRect`

##### `computeFitTransform` — Summary
Computes the target transform to fit content within the viewport.

#### `buildAnchorGuideKey` {#symbol-buildanchorguidekey}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L264)

##### `buildAnchorGuideKey` — Summary
Builds an anchor guide key for column alignment lookups.

#### `collectCenterAlignmentGuides` {#symbol-collectcenteralignmentguides}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L276)
- Returns: [`CenterAlignmentGuides`](./types.ts.mdmd.md#symbol-centeralignmentguides)
- Parameters: `containerRect`: `DOMRect`

##### `collectCenterAlignmentGuides` — Summary
Collects center alignment guides from a column element.

#### `lookupCenterAnchorPosition` {#symbol-lookupcenteranchorposition}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L328)
- Parameters: `guides`: [`CenterAlignmentGuides`](./types.ts.mdmd.md#symbol-centeralignmentguides)

##### `lookupCenterAnchorPosition` — Summary
Looks up a center anchor position from guides, with fallback.

#### `applyColumnVerticalCentering` {#symbol-applycolumnverticalcentering}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L360)

##### `applyColumnVerticalCentering` — Summary
Applies vertical centering to columns within a layout root.

#### `applyContainerDimensions` {#symbol-applycontainerdimensions}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/layout-measure.ts#L408)
- Parameters: `content`: [`Bounds`](./types.ts.mdmd.md#symbol-bounds)

##### `applyContainerDimensions` — Summary
Sets container/overlay dimensions based on content extents.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->
