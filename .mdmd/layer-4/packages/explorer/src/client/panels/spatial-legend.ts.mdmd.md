# packages/explorer/src/client/panels/spatial-legend.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/spatial-legend.ts
- Generated At: 2026-11-01T20:01:36.134Z

## Authored
### Purpose
Describes the encodings in the spatial Local Map: the file kinds present, symbol-based body size, counted-reference width and any document citations or containment wires. It reads the filtered graph for the moment shown, so the key follows filters and history without implementing another visibility policy.

### Notes
Created during the [October 24 Connections review](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-12) to repair the legend mismatch accepted in the [October 23 remediation](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#remediation-work). File colours come from the same table as the renderer. Plain text supplies the names; the decorative swatches are hidden from assistive technology. The existing 2D offer/use key remains separate, and neither Local Map key describes another view.

The body-size key is omitted when symbol scaling is disabled. Code-reference width describes the number of documented references represented by a file-pair wire, not its direction or physical length. Since 2026-10-30 the rows are a pure list the view and the unit test share, and they say only what is drawn: the references' width only while reference wires are drawn (on demand in the structure layout), a Path row while a path is, a Dimmed row while the picture ends in a frontier, the last hop of connections shown dimmed, a click on which shows more (2026-10-31, discovery), a Faded row while a path or a hover fades the rest (pins faded the rest until that day, when the picture came to hold only what they reach), a folder's size rule when hubs are shown. A direction row, a blue-to-green stroke, stood above the width row for one day and went with the wires' colour on 2026-10-31 ([Turn 1 of the October 31 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-1)). Rows change only when their meanings change, so repeated graph renders do not continually replace the sidebar.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SpatialLegendDrawn` {#symbol-spatiallegenddrawn}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L6)

##### `SpatialLegendDrawn` — Summary
What the 3D picture draws beyond its data: the key says only what is on screen (2026-10-30).

#### `SpatialLegendRow` {#symbol-spatiallegendrow}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L18)

##### `SpatialLegendRow` — Summary
One row of the key: its words and the sample the stylesheet draws from its shape and colour.

#### `spatialLegendRows` {#symbol-spatiallegendrows}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L25)
- Returns: [`SpatialLegendRow`](#symbol-spatiallegendrow)[]
- Parameters: `graph`: [`SpatialGraphData`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphdata); `drawn`: [`SpatialLegendDrawn`](#symbol-spatiallegenddrawn)

##### `spatialLegendRows` — Summary
The rows of the key for a filtered graph at the moment shown, in reading order; pure, so that a test can read them.

#### `renderSpatialLegend` {#symbol-renderspatiallegend}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L48)
- Parameters: `graph`: [`SpatialGraphData`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphdata); `drawn`: [`SpatialLegendDrawn`](#symbol-spatiallegenddrawn)

##### `renderSpatialLegend` — Summary
Describe the spatial map's filtered, current-moment encodings without changing its geometry or attention.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`forceGraphAppearance.SPATIAL_NODE_STYLES`](../views/forceGraphAppearance.ts.mdmd.md#symbol-spatial_node_styles)
- [`forceGraphAppearance.spatialNodeStyle`](../views/forceGraphAppearance.ts.mdmd.md#symbol-spatialnodestyle)
- [`forceGraphData.SpatialGraphData`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphdata) (type-only)
<!-- LIVE-DOC:END Dependencies -->
