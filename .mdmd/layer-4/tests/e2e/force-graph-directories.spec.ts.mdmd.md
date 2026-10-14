# tests/e2e/force-graph-directories.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-directories.spec.ts
- Generated At: 2026-10-14T03:20:30.985Z

## Authored
### Purpose
Checks optional directory hubs, recursive membership, camera framing and independent release against the spatial view's native rendered objects.

### Notes
The tests distinguish containment from documented code references, verify that hubs actually affect placement, and prove that line visibility changes neither positions nor the simulation's settled state. Native sphere picking exercises directory hover and retention; the tray and representation controls then carry the same directory through 2D and release it without removing graph objects. Framing assertions guard the off-origin fit defect found while inspecting [the October 14 implementation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs). Preset and wheel checks hold the directory being inspected even when another file remains selected. These checks read Three's actual meshes and use the public interface rather than an application test API.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
