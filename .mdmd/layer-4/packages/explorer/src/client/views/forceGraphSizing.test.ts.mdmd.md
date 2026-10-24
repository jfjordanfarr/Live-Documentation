# packages/explorer/src/client/views/forceGraphSizing.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/forceGraphSizing.test.ts
- Generated At: 2026-10-24T19:41:34.964Z

## Authored
### Purpose
Verify projection-based size resistance and the visible geometry of round-capped, tapered wire picking, including clipping and end-on depth ordering.

### Notes
Introduced with the [October 24 resistance controls](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11). The cases distinguish perspective, intermediate and invariant sizing under camera and viewport changes, then probe actual hit boundaries and depths. They protect the geometry shared in meaning by the renderer and interaction proxies; browser pixel tests independently check the shader.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphSizing.clipSpatialWireDepth`](./forceGraphSizing.ts.mdmd.md#symbol-clipspatialwiredepth)
- [`forceGraphSizing.pickSpatialWire`](./forceGraphSizing.ts.mdmd.md#symbol-pickspatialwire)
- [`forceGraphSizing.pixelsPerWorldUnit`](./forceGraphSizing.ts.mdmd.md#symbol-pixelsperworldunit)
- [`forceGraphSizing.spatialSizeScale`](./forceGraphSizing.ts.mdmd.md#symbol-spatialsizescale)
- `three` - `Matrix4`, `OrthographicCamera`, `PerspectiveCamera`, `Raycaster`, `Vector2`, `Vector3`, `Vector4`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
