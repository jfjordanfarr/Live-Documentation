# tests/e2e/browser-launch.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/browser-launch.test.ts
- Generated At: 2026-11-17T19:28:13.712Z

## Authored
### Purpose
Holds `browserLaunchOptions` to its cases: nothing where the card's device or its libraries are missing, the flag and both of Mesa's settings together where both are there, an existing library path kept after the card's, variables without a value left out, and software on request.

### Notes
- Written with the module on 2026-11-17 ([Turn 1 of the November 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-17.1.record.md#turn-1)). The file check and the environment are passed in, so the test touches neither the machine's devices nor its environment and reads the same with a card and without one.
- The case that only the device or only the libraries are there matters more than it looks: a browser given the flag without a working driver either falls back to software silently or cannot create WebGL ([the measurements](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-17.1.record.md#work-notes-turn-2)), so asking for the card on half the evidence would break every 3D case on such a machine.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`browser-launch.RENDERER_VARIABLE`](./browser-launch.ts.mdmd.md#symbol-renderer_variable)
- [`browser-launch.asksForCard`](./browser-launch.ts.mdmd.md#symbol-asksforcard)
- [`browser-launch.browserLaunchOptions`](./browser-launch.ts.mdmd.md#symbol-browserlaunchoptions)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
