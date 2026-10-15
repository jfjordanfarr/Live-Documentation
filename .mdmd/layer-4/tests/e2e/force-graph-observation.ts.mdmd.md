# tests/e2e/force-graph-observation.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-observation.ts
- Generated At: 2026-10-15T02:54:32.671Z

## Authored
### Purpose
Observes the native Three.js meshes and camera used by the spatial-view browser regressions.

### Notes
The helper listens to Three’s development-tool event inside the test page, then reads rendered node identity, material opacity, world and screen positions, the rendered sphere's radius, and link kinds/visibility. This lets tests compare what reaches WebGL instead of accepting an application-maintained diagnostic as evidence of its own correctness. It introduces no product endpoint or browser-global application API. The original observation lived in the force-graph focus regression; directory-hub checks need the same measurements.

Introduced for the owner’s [October 14 pin-management request](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `observeGraph` {#symbol-observegraph}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L24)
- Parameters: `page`: `Page`

##### `observeGraph` — Summary
Observe the meshes and camera actually sent to WebGL through Three's development-tool event.

#### `renderedNodes` {#symbol-renderednodes}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L41)
- Parameters: `page`: `Page`

##### `renderedNodes` — Summary
Read native node identity, world/screen coordinates, actual material opacity and the rendered sphere's radius.

#### `renderedLinks` {#symbol-renderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L82)
- Parameters: `page`: `Page`

##### `renderedLinks` — Summary
Read relationship kinds and visibility without reaching into the Explorer's own state.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
- `three` - `Camera`, `Mesh`, `Scene`, `WebGLRenderer` (type-only)
<!-- LIVE-DOC:END Dependencies -->
