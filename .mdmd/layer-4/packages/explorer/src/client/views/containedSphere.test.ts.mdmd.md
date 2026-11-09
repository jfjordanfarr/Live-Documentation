# packages/explorer/src/client/views/containedSphere.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/containedSphere.test.ts
- Generated At: 2026-11-09T00:01:54.717Z

## Authored
### Purpose
Protects hollow clipped carriers and native compatibility selection with independent geometric cases.

### Notes
Current tests, introduced with the November 8 [contained-file rendering investigation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-08.1.record.md). Point-in-polygon checks distinguish a near-plane annulus from a far cap, and an offscreen carrier retains geometry needed while travelling.

Compatibility cases retain the original native geometry when either sample extension, the output encoding or NoToneMapping contract is unavailable. Supported contexts select the unit-sphere primitive. Shader bounds and coverage are tested in the actual browser renderer rather than a copied TypeScript formula: independent browser pictures compare the actual shader with native high-resolution spheres, translucent overlaps and clipping under the same MSAA settings.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`containedSphere.ContainedSphereMaterial`](./containedSphere.ts.mdmd.md#symbol-containedspherematerial)
- [`containedSphere.containedSpherePrimitive`](./containedSphere.ts.mdmd.md#symbol-containedsphereprimitive)
- [`containedSphere.projectSphereSurface`](./containedSphere.ts.mdmd.md#symbol-projectspheresurface)
- `three` - `LinearSRGBColorSpace`, `Matrix4`, `NoToneMapping`, `PerspectiveCamera`, `ReinhardToneMapping`, `SRGBColorSpace`, `SphereGeometry`, `WebGLRenderer`
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
