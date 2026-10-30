# tests/e2e/local-map-framing.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-framing.spec.ts
- Generated At: 2026-10-30T15:20:53.744Z

## Authored
### Purpose
The browser checks of how the 2D Local Map frames itself on arrival, written after the picture was right by eye on 2026-10-30 ([the captures](../../../../AI-Agent-Workspace/Screenshots/2026-10-30/README.md#the-2d-arrival-framing)): a directory opened with no subject is framed whole and centred with its membrane inside the frame; the root overview, taller than the frame, starts at the top with the sign of more below, and the sign follows a pan; a picture wider than the frame by more than two paddings starts at the left with the sign at the right; and a fit beside the open reader keeps the subject out from under it. They keep the repairs of the October 23 review's findings 2, 9 and 13.

### Notes
- The frame is read from the edge signs' element, which the controller sizes to the map layer less what the reader covers; the picture from the branch root, which the renderer sizes to the picture. Both are plain bounding boxes, so the checks hold under any camera.
- The rule for a picture framed whole is restated in the spec (`expectFramedWhole`) rather than imported, so that a change to the rule fails here first; `framePadding` is imported since the padding is a shared quantity, not a rule under test.
- The return from 3D, the hold and the settle, is checked in `local-map-branches.spec.ts`, where the 3D setup already stands.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`layout-measure.framePadding`](../../packages/explorer/src/client/views/localView/layout-measure.ts.mdmd.md#symbol-framepadding)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.dragBy`](./still-picture.ts.mdmd.md#symbol-dragby)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
