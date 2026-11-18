# tests/e2e/renderer-report.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/renderer-report.ts
- Generated At: 2026-11-17T19:28:20.044Z

## Authored
### Purpose
The browser suite's global setup: prints, at the head of every run, which renderer draws the run's WebGL, and stops the run where the graphics card was asked for and the browser is not drawing on it.

### Notes
- Written on 2026-11-17 with the launch options ([Turn 1 of the November 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-17.1.record.md#turn-1)). A browser that misses the card does not say so: it draws in software, a tenth as fast, and the cases that wait on this repository's own 3D picture then fail on their clocks as if the product had slowed ([the measurements](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-17.1.record.md#work-notes-turn-2)). The record holds several gates in which unchanged code ran slower and the cause was sought in the product or the machine; the line this prints is what a reader of a gate's log needs before reading any of its times.
- It launches one browser with the suite's own options and reads the unmasked renderer of a scratch WebGL context: `D3D12 (...)` with the card's name is Mesa's name for OpenGL carried by Direct3D 12, and `SwiftShader` is Chromium's software renderer.
- It throws where a warning might seem enough, because one of the two ways of missing the card leaves the page unable to create WebGL at all, and every 3D case would then fail for a reason none of them states. The message names the way round: `LIVE_DOCS_BROWSER_RENDERER=software`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `reportRenderer` {#symbol-reportrenderer}
- Type: function (default)
- Source: [source](../../../../tests/e2e/renderer-report.ts#L13)

##### `reportRenderer` — Summary
Says at the head of every run of the browser suite what draws its WebGL pictures, and stops the run where the
graphics card was asked for and did not answer.

A browser that misses the card does not say so: it draws in software, a tenth as fast, and the cases that wait on
this repository's own 3D picture then fail on their clocks as if the product had slowed. The line this prints is
what a reader of a gate's log needs before reading any of those times.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `chromium`
- [`browser-launch.CARD_RENDERER`](./browser-launch.ts.mdmd.md#symbol-card_renderer)
- [`browser-launch.RENDERER_VARIABLE`](./browser-launch.ts.mdmd.md#symbol-renderer_variable)
- [`browser-launch.asksForCard`](./browser-launch.ts.mdmd.md#symbol-asksforcard)
- [`browser-launch.browserLaunchOptions`](./browser-launch.ts.mdmd.md#symbol-browserlaunchoptions)
<!-- LIVE-DOC:END Dependencies -->
