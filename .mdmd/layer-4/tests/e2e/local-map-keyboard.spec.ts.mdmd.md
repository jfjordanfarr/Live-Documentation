# tests/e2e/local-map-keyboard.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-keyboard.spec.ts
- Generated At: 2026-11-06T08:20:16.626Z

## Authored
### Purpose
Protects visible native keyboard focus while traversing the 2D map, without changing the selected subject, pins, reading choices or camera scale.

### Notes
Introduced during the November 4 learning-journey review after real Tab input focused a neighbor more than two thousand pixels outside the frame. The test walks actual native controls and compares their rectangles with the unobstructed map. See [the authorization and findings](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8).

On November 6 ([Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-11), the shells merge) the Tab case reads its initial scale after `localMapStill`, after a gate read 1.374 inside the fit's easing and 1.45, the fit itself, at the end; the Tabs had changed nothing.

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
- [`still-picture.localMapStill`](./still-picture.ts.mdmd.md#symbol-localmapstill)
<!-- LIVE-DOC:END Dependencies -->
