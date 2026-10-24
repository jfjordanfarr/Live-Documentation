# tests/e2e/force-graph-directories.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-directories.spec.ts
- Generated At: 2026-10-16T21:14:12.320Z

## Authored
### Purpose
Checks the 3D Local Map's structure layout, its hubs, camera framing and independent release against the spatial view's native rendered objects.

### Notes
The first test switches from the connections layout to the structure layout by its button and reads the first picture with hubs: the files within a quarter of the scene's extent of where they stood and the root hub among them, not a cold start; then, settled, one containment link per node but the root, every one drawn, no reference drawn at rest, the reference facts unchanged, a hub's volume equal to the sum of its members' read from the rendered spheres, a hovered file's references drawn and put away, and Back returning to the connections layout. Every line shown, in the connections layout, on hover in the structure layout and among a pinned file's retained neighbours, must have a length and run from one end's sphere to the other's: the spec had checked only visibility and passed while every reference revealed in the structure layout sat undrawn at the origin (2026-10-16). The named action target verifies native sphere picking for directory hover and inspection without retention, followed by the visible Open action; the tray and representation controls then carry the same directory through 2D, where the layout buttons are hidden, and release it without removing graph objects. Framing assertions guard the off-origin fit defect found while inspecting [the October 14 implementation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs). Preset and wheel checks hold the explicitly framed directory even when another file remains selected. These checks read Three's actual meshes and use the public interface rather than an application test API. Rewritten for [the two layouts](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-4).

The volume comparison explicitly selects perspective node sizing through the public control. Independent zoom resistance, introduced October 24, scales each sphere by its own depth, so compensated world-space volumes do not sum across depths. The underlying symbol-volume contract is unchanged; the remaining directory journeys exercise the selected display defaults.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`types.SpatialLayout`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-spatiallayout) (type-only)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
