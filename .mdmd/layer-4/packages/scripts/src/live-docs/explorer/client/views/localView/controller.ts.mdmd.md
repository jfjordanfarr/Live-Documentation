# packages/scripts/src/live-docs/explorer/client/views/localView/controller.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/controller.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-controller-ts
- Generated At: 2025-12-06T13:36:26.715Z

## Authored
### Purpose
Controller class for the Local Map. Orchestrates runtime state, rendering, and Bézier connection drawing in response to selection changes.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 during localView modularisation.
- Implements `LocalViewApi.update()` to re-render the 3-column subgraph.
- Manages scroll sync, column expansion, and SVG layer updates.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T13:36:26.715Z","inputHash":"e680878e62fadadc"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalViewController` {#symbol-localviewcontroller}
- Type: class
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/controller.ts#L30)
- Implements: [`LocalViewApi`](./index.ts.mdmd.md#symbol-localviewapi)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../../dom.ts.mdmd.md#symbol-requireelement)
- [`connections.drawConnections`](./connections.ts.mdmd.md#symbol-drawconnections)
- [`render.renderLocalView`](./render.ts.mdmd.md#symbol-renderlocalview)
- [`runtime.clearAnchorRegistry`](./runtime.ts.mdmd.md#symbol-clearanchorregistry)
- [`runtime.createRuntime`](./runtime.ts.mdmd.md#symbol-createruntime)
- [`runtime.getAnchor`](./runtime.ts.mdmd.md#symbol-getanchor)
- [`runtime.registerAnchor`](./runtime.ts.mdmd.md#symbol-registeranchor)
- [`types.Bounds`](./types.ts.mdmd.md#symbol-bounds) (type-only)
- [`types.CenterAlignmentGuides`](./types.ts.mdmd.md#symbol-centeralignmentguides) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LayoutExtents`](./types.ts.mdmd.md#symbol-layoutextents) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.LocalViewApi`](./types.ts.mdmd.md#symbol-localviewapi) (type-only)
- [`types.LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
- [`symbolAnchors.buildNormalizedAnchorKey`](../symbolAnchors.ts.mdmd.md#symbol-buildnormalizedanchorkey)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`symbolAnchors.tryBuildNormalizedKeyFromAnchorKey`](../symbolAnchors.ts.mdmd.md#symbol-trybuildnormalizedkeyfromanchorkey)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
