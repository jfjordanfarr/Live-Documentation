# packages/explorer/package.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/package.json
- Generated At: 2026-10-02T16:05:07.679Z

## Authored
### Purpose
Defines the Explorer workspace package, its static builder exports and the dependencies used by its browser client and bundling tools.

### Notes
Three.js is a direct runtime dependency for camera projection; its matching type declarations support type-aware checks. The same Three.js runtime also supplies the force-graph renderer.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `@live-documentation/explorer` {#symbol-live-documentationexplorer}
- Type: package
- Source: [source](../../../../packages/explorer/package.json#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `3d-force-graph@^1.80.0`
- `@types/lz-string@^1.3.34`
- `@types/three@^0.186.0`
- `esbuild@^0.28.2`
- `glob@^13.0.6`
- `jszip@^3.10.1`
- `lz-string@^1.5.0`
- `minimatch@^10.2.4`
- [`package.@live-documentation/engine`](../engine/package.json.mdmd.md#symbol-live-documentationengine)
- `three@^0.186.1`
<!-- LIVE-DOC:END Dependencies -->
