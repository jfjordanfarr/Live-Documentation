# tests/e2e/force-graph-observation.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-observation.ts
- Generated At: 2026-10-24T20:00:15.999Z

## Authored
### Purpose
Observes the Three.js geometry, world placement and camera actually drawn by the spatial-view browser regressions.

### Notes
The helper listens to Three’s development-tool event inside the test page, then reads rendered node identity, material opacity, world and screen positions, the rendered sphere's radius, and link kinds, visibility and drawn ends: a link is a unit tube the library stands at its source and stretches toward its target, so its two ends in world space and its length say where it is drawn, and a line never positioned reads as length 1 at the origin (2026-10-16). This lets tests compare what reaches WebGL instead of accepting an application-maintained diagnostic as evidence of its own correctness. It introduces no product endpoint or browser-global application API. The original observation lived in the force-graph focus regression; directory-hub checks need the same measurements.

Introduced for the owner’s [October 14 pin-management request](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

Since 2026-10-18, for ticket C2 of [the change-over-time plan](../../../layer-3/change-over-time.mdmd.md#open-questions), the instrument also counts the frames drawn and notes on which frame the graph container said it was busy or settled (`engineActivity`), so that a spec can count the engine's ticks for a change from the outside, since the library ticks at most once per frame; and it can mark every line's object with a token and count the marks later (`markRenderedLinks`, `markedRenderedLinks`), which is how a spec shows that a membership change kept the lines' objects rather than rebuilding them. All of it reads the scene and the DOM; none of it reaches the Explorer's state.

Since the October 23 rendering pass, a native mesh can be a placement and picking proxy for an InstancedMesh slot. The instrument reads the actual instance matrix, shared geometry bounds and uploaded opacity attribute; reading only the proxy would no longer establish what was drawn. Tube ends are the unit geometry’s ends transformed by that instance matrix. The retention mark records the instance record’s identity through sorting and repacking. Browser checks therefore continue to observe rendering rather than trusting an application diagnostic; the identity spec separately samples compositor pixels to prove that an idle canvas stays painted.

For the [October 24 projected wires](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11), link width reads the uploaded base-width attribute and CSS viewport scale; endpoints come from the actual instance transform. This establishes count weighting and control updates, but does not alone establish the shader's apparent width at partial resistance. The wire regressions therefore also measure actual WebGL pixels at controlled depths and pixel densities. Sphere radii continue to come from uploaded geometry and transforms, so resistance checks observe the size drawn rather than a parallel application estimate.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `observeGraph` {#symbol-observegraph}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L35)
- Parameters: `page`: `Page`

##### `observeGraph` — Summary
Observe the meshes and camera actually sent to WebGL through Three's development-tool event, count the frames drawn, and
note on which frame the graph container said it was busy or settled, so that a spec can count the engine's ticks between
a change and its settle without reaching into the Explorer's state (2026-10-18).

#### `engineActivity` {#symbol-engineactivity}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L82)
- Parameters: `page`: `Page`

##### `engineActivity` — Summary
The frames drawn so far, and when the graph last became busy and last settled, by frame.

#### `markRenderedLinks` {#symbol-markrenderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L90)
- Parameters: `page`: `Page`

##### `markRenderedLinks` — Summary
Mark every rendered line's object with a token, so that a later count says how many objects a change kept; returns how many were marked.

#### `markedRenderedLinks` {#symbol-markedrenderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L107)
- Parameters: `page`: `Page`

##### `markedRenderedLinks` — Summary
How many rendered lines carry the token, beside how many there are.

#### `renderedNodes` {#symbol-renderednodes}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L123)
- Parameters: `page`: `Page`

##### `renderedNodes` — Summary
Read native node identity, world/screen coordinates, actual material opacity and the rendered sphere's radius.

#### `renderedLinks` {#symbol-renderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L168)
- Parameters: `page`: `Page`

##### `renderedLinks` — Summary
Read relationship kinds, visibility and where each line is drawn, without reaching into the Explorer's own state.
The library stands a unit-axis proxy at its source, turns it toward its target and stretches it by `scale.z`.
Width is the uploaded baseline; only full resistance makes it the apparent CSS-pixel diameter at every depth.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
- [`forceGraphBatches.SpatialBatchInstance`](../../packages/explorer/src/client/views/forceGraphBatches.ts.mdmd.md#symbol-spatialbatchinstance) (type-only)
- `three` - `Camera`, `Mesh`, `Scene`, `Vector3`, `WebGLRenderer` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
