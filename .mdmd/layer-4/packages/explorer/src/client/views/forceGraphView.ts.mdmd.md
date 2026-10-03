# packages/explorer/src/client/views/forceGraphView.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphView.ts
- Generated At: 2026-10-03T02:21:29.071Z

## Authored
### Purpose
Renders the force-directed 3D graph view for the Live Docs Explorer, including the Related Documentation overlay: purple nodes for the markdown files that Live Docs link to, from the bundle's `relatedDocLinks`.

### Notes
- Created 2026-02-20 during the Explorer monolith refactor (1763 to 941 lines) that extracted this view alongside `download.ts`.
- Exposes rendering, activation and subject-anchor operations through its factory. The caller pauses the hidden view; resize observation keeps the canvas aligned with its actual container.
- Selection preserves simulation node objects, approaches the selected file from the existing viewing direction and follows it while the layout settles. A drag or wheel gesture gives camera control back to the person. Repeated rendering with unchanged membership does not restart the simulation.
- The focus label follows the projected file and opens its documentation. Live camera tracking runs in the simulation tick before paint. Clicks intersect the actual node objects retained through the library’s public position callback, avoiding its throttled hover cache; selected source files use the Explorer’s normal selection and history path.
- Shared pins fade unrelated nodes and connections. Perspective changes keep the subject’s screen anchor while preserving the current viewing direction.
- Depends on the external `3d-force-graph` library.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ForceGraphLink` {#symbol-forcegraphlink}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L33)

##### `ForceGraphLink` — Summary
A link in the Force Graph between two nodes.

#### `ForceGraphNode` {#symbol-forcegraphnode}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L40)
- Returns: [`ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `ForceGraphNode` — Summary
A node in the Force Graph, extending the payload with optional archetype.

#### `ForceGraphData` {#symbol-forcegraphdata}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L49)

##### `ForceGraphData` — Summary
Complete data structure for the Force Graph view.

#### `ForceGraphViewOptions` {#symbol-forcegraphviewoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L60)

##### `ForceGraphViewOptions` — Summary
Options passed to the Force Graph view factory.

#### `ForceGraphViewApi` {#symbol-forcegraphviewapi}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L74)

##### `ForceGraphViewApi` — Summary
Public API surface of the Force Graph view.

#### `createForceGraphView` {#symbol-createforcegraphview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphView.ts#L84)
- Returns: [`ForceGraphViewApi`](#symbol-forcegraphviewapi)
- Parameters: `options`: [`ForceGraphViewOptions`](#symbol-forcegraphviewoptions)

##### `createForceGraphView` — Summary
Creates the Force Graph (3D) view for the Live Docs Explorer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `3d-force-graph` - `ForceGraph3D`, `ForceGraph3DInstance`
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`fileConnections`](./fileConnections.ts.mdmd.md#symbol-fileconnections)
- [`forceGraphCamera.CameraPoint`](./forceGraphCamera.ts.mdmd.md#symbol-camerapoint)
- [`forceGraphCamera.focusedCameraPosition`](./forceGraphCamera.ts.mdmd.md#symbol-focusedcameraposition)
- [`forceGraphCamera.screenAnchorTranslation`](./forceGraphCamera.ts.mdmd.md#symbol-screenanchortranslation)
- [`perspectiveTransition.ForceScene`](./perspectiveTransition.ts.mdmd.md#symbol-forcescene) (type-only)
- [`pin-state.EMPTY_PIN_SET`](./pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.getVisibleConnections`](./pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`ZoomBarrier`](./zoomBarrier.ts.mdmd.md#symbol-zoombarrier)
- [`zoomBarrier.wheelPixels`](./zoomBarrier.ts.mdmd.md#symbol-wheelpixels)
- [`staticExplorerData.RelatedDocLink`](../../shared/staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `three` - `Box3`, `Object3D`, `Raycaster`, `Vector2`, `Vector3`
<!-- LIVE-DOC:END Dependencies -->
