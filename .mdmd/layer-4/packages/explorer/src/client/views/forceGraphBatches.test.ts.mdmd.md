# packages/explorer/src/client/views/forceGraphBatches.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphBatches.test.ts
- Generated At: 2026-10-23T21:48:47.994Z

## Authored
### Purpose
Verify that batching preserves the native graph geometry, world placement, alpha, visibility and interaction proxies, and releases departed geometry while keeping surviving instance records.

### Notes
Created with the October 23 rendering repair. These tests exercise Three’s actual geometry and batch storage without a DOM or a fake WebGL renderer; browser tests and root playtests separately judge the drawn result and interaction. Cases include nested and nonuniform transforms, normals, transparent depth ordering, different depth rules, changed attention and geometry, buffer growth and repacking, and complete cleanup. Tube-culling cases keep crossing and tangential surfaces while rejecting long offscreen tubes and corner misses.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphBatches.SpatialBatchInstance`](./forceGraphBatches.ts.mdmd.md#symbol-spatialbatchinstance)
- [`forceGraphBatches.batchSpatialGraph`](./forceGraphBatches.ts.mdmd.md#symbol-batchspatialgraph)
- [`forceGraphBatches.tubeIntersectsFrustum`](./forceGraphBatches.ts.mdmd.md#symbol-tubeintersectsfrustum)
- `three` - `Frustum`, `Group`, `Matrix3`, `Matrix4`, `Mesh`, `MeshLambertMaterial`, `PerspectiveCamera`, `Plane`, `Scene`, `SphereGeometry`, `Vector3`, `WebGLRenderer`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
