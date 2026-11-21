# `packages/explorer/src/client/views/webgl-support.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/webgl-support.test.ts`
- Generated At: 2026-11-21T02:36:02.743Z

## Authored
### Purpose
Holds [`webgl-support.ts`](webgl-support.ts.mdmd.md) without a browser: the WebGL question is asked with the renderer's own context attributes and lets its context go, a refusal by null or by a throw is a no, a request for 3D is shown as 2D only where 3D cannot be drawn, and a remembered 3D is left alone there.

### Notes
- Made on November 21, 2026, with the module. The canvas is a stand-in handed to `drawsWebgl`, not jsdom: what a real browser does when it refuses WebGL is held by [the browser regression](../../../../../tests/e2e/webgl-refused.spec.ts.mdmd.md), which launches Chromium without it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`webgl-support.CanvasSource`](./webgl-support.ts.mdmd.md#symbol-canvassource)
- [`webgl-support.drawsWebgl`](./webgl-support.ts.mdmd.md#symbol-drawswebgl)
- [`webgl-support.perspectiveRemembered`](./webgl-support.ts.mdmd.md#symbol-perspectiveremembered)
- [`webgl-support.perspectiveShown`](./webgl-support.ts.mdmd.md#symbol-perspectiveshown)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
