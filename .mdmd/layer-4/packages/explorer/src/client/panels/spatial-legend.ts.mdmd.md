# packages/explorer/src/client/panels/spatial-legend.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/spatial-legend.ts
- Generated At: 2026-10-24T19:41:34.084Z

## Authored
### Purpose
Describes the encodings in the spatial Local Map: the file kinds present, symbol-based body size, counted-reference width and any document citations or containment wires. It reads the filtered graph for the moment shown, so the key follows filters and history without implementing another visibility policy.

### Notes
Created during the [October 24 Connections review](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-12) to repair the legend mismatch accepted in the [October 23 remediation](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#remediation-work). File colours come from the same table as the renderer. Plain text supplies the names; the decorative swatches are hidden from assistive technology. The existing 2D offer/use key remains separate, and neither Local Map key describes another view.

The body-size key is omitted when symbol scaling is disabled. Code-reference width describes the number of documented references represented by a file-pair wire, not its direction or physical length. Rows change only when their meanings change, so repeated graph renders do not continually replace the sidebar.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderSpatialLegend` {#symbol-renderspatiallegend}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/spatial-legend.ts#L8)
- Parameters: `graph`: [`SpatialGraphData`](../views/forceGraphData.ts.mdmd.md#symbol-spatialgraphdata)

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
