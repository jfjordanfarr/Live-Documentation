# packages/explorer/src/client/views/forceGraphBatches.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphBatches.test.ts
- Generated At: 2026-10-29T18:09:48.079Z

## Authored
### Purpose
Verify that direct 3D buffers preserve sphere geometry, endpoints, colour/alpha, visibility, depth order and stable bindings while scene-object count stays independent of graph size.

### Notes
Created with the [October 23 rendering repair](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-23.1.record.md#turn-5), then adapted to the [October 29 direct-renderer trial](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-29.1.record.md#turn-10). Tests use Three's actual geometry and instance storage without a DOM or WebGL context. They compare uploaded sphere vertices with physical positions/radii, retain bindings through rename/membership/attention changes, grow and retire buffers, check transparent order and clipping, and pick actual tessellated spheres and projected wires. A 2,000-node graph still has exactly three geometry objects. Browser tests separately measure pixels and interaction.

A membership permutation checks that numeric endpoint indices are rebound while stable data bindings survive. Nearly equal depths that round to the same Float32 value remain ordered by full precision, and exact depth ties retain creation order.

The redraw tests retain coverage for revisions beyond Float32 integer precision, accumulated subpixel camera movement, same-size canvas clearing and context restoration. Wire-culling cases retain crossing and tangential strokes and reject long offscreen and diagonal corner misses. Tests of the retired native-object adapter's arbitrary parent transforms were removed with that adapter; current input is the graph's physical node coordinates and explicit endpoints.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphBatches.createSpatialBuffers`](./forceGraphBatches.ts.mdmd.md#symbol-createspatialbuffers)
- [`forceGraphBatches.drawSpatialGraphOnChange`](./forceGraphBatches.ts.mdmd.md#symbol-drawspatialgraphonchange)
- [`forceGraphBatches.screenWireIntersectsFrustum`](./forceGraphBatches.ts.mdmd.md#symbol-screenwireintersectsfrustum)
- `three` - `Color`, `Matrix4`, `PerspectiveCamera`, `Raycaster`, `Scene`, `SphereGeometry`, `Vector2`, `Vector3`, `WebGLRenderer`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
