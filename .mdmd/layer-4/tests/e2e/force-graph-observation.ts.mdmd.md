# tests/e2e/force-graph-observation.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-observation.ts
- Generated At: 2026-10-30T19:08:35.701Z

## Authored
### Purpose
Observes the GPU instance geometry, picking identities and camera actually drawn by the spatial-view browser regressions.

### Notes
Introduced for the owner's [October 14 pin-management request](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs), extracting shared observation from the focus regression. It listens to Three's development-tool event and reads the actual scene and DOM; it adds no product endpoint or browser-global application API.

For the [October 29 direct renderer](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-29.1.record.md#turn-10), identity comes from the instance picking index, while positions, sphere radii, alpha and wire widths come from uploaded attributes and geometry. Wire ends are the transformed unit-axis endpoints. It therefore observes rendered buffers independently of the application's layout estimates. The prior October 23 implementation read those buffers through native mesh proxies; those per-node/per-wire proxies are now gone.

Actual draws and aria-busy transitions are recorded separately. A draw is not assumed to be a complete physics tick: large evaluations span animation frames. Stable wire-to-buffer bindings and their mesh identities can be marked through a WeakMap and checked across membership changes and historical renames. The idle-picture spec separately checks compositor pixels so an unpainted canvas cannot pass as a correctly idle renderer.

The [projected-wire regressions](force-graph-wires.spec.ts.mdmd.md) isolate one actual uploaded wire, preserve its width/colour/alpha, place its endpoints at controlled camera-relative depths and read GPU pixels before restoring every changed buffer value and visibility. This checks resistance, clipping and caps at multiple pixel densities without predicting shader output from application state. Sphere sizing likewise comes from geometry and uploaded matrices. The renderedPieces observation records each membership as it is submitted, including a piece visible for only one frame, for [the reveal spec](force-graph-reveal.spec.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `observeGraph` {#symbol-observegraph}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L25)
- Parameters: `page`: `Page`

##### `observeGraph` — Summary
Observe the actual buffers submitted to Three; no predicted layout or shader formula is read.

#### `renderedPieces` {#symbol-renderedpieces}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L95)
- Parameters: `page`: `Page`

##### `renderedPieces` — Summary
Memberships actually submitted, including pieces painted for a single frame.

#### `engineActivity` {#symbol-engineactivity}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L100)
- Parameters: `page`: `Page`

##### `engineActivity` — Summary
Actual draws and the container's busy/settled transitions, not animation-callback counts.

#### `markRenderedLinks` {#symbol-markrenderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L108)
- Parameters: `page`: `Page`

##### `markRenderedLinks` — Summary
Mark stable wire-to-buffer bindings so updates can prove they retained surviving identities.

#### `markedRenderedLinks` {#symbol-markedrenderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L121)
- Parameters: `page`: `Page`

##### `markedRenderedLinks` — Summary
Surviving wires retain both their binding and GPU batch, including across historical renames.

#### `renderedNodes` {#symbol-renderednodes}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L138)
- Parameters: `page`: `Page`

##### `renderedNodes` — Summary
Read identity from the picking index and geometry/alpha/positions from the actual uploaded instances.

#### `renderedLinks` {#symbol-renderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L167)
- Parameters: `page`: `Page`

##### `renderedLinks` — Summary
Read each wire's uploaded axis, base width, alpha, flow and visibility beside its documented relationship identity.
The axis runs between the two spheres' drawn surfaces (2026-10-30), in the picture's units and on the screen. The
flow is the number the shader colours by: 1 when the source uses the target, -1 the other way, 0 both, 2 a wire of
its own colour.

#### `clearStroke` {#symbol-clearstroke}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L207)
- Parameters: `page`: `Page`

##### `clearStroke` — Summary
A point on a reference wire where a hover reaches the wire and nothing else: the middle of the longest stroke on
screen whose middle stands clear of every sphere, inside the canvas, and on the bare canvas rather than a name or a
control, since a sphere or a label under the pointer takes the hover instead.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
- [`forceGraphBatches.SpatialDrawEntry`](../../packages/explorer/src/client/views/forceGraphBatches.ts.mdmd.md#symbol-spatialdrawentry) (type-only)
- `three` - `Camera`, `InstancedMesh`, `Scene`, `Vector3`, `WebGLRenderer` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
