# `tests/e2e/browser-launch.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/browser-launch.ts`
- Generated At: 2026-11-19T21:10:19.887Z

## Authored
### Purpose
Decides how this repository launches a headless Chromium of its own: on the host's graphics card where the container was given one, and exactly as Playwright launches it everywhere else. The browser suite's configuration and the contact sheet both ask it.

### Notes
- Written on 2026-11-17 at the owner's ask that the video card be made available to the container "so that you can tremendously speed up our e2e tests" ([Turn 1 of the November 17 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-1)). Until then every WebGL picture a test waited on was drawn in software (SwiftShader); the record names that as the reason browser tests run one at a time (2026-10-19) and, by that morning, the reason five cases stood on their time limits and a full gate took two hours.
- Under WSL2 the road to the card is Direct3D 12 and not a maker's own Linux driver: the device `/dev/dxg` and Microsoft's libraries in `/usr/lib/wsl/lib`, used by Mesa's `d3d12` driver, which Chromium's WebGL layer (ANGLE) reaches when it is told to draw through the system's EGL. Measured in a sibling container on an RTX 3090 with Playwright 1.58.2 ([the measurements](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#work-notes-turn-2)): this repository's 3D picture of `generator.ts` comes to rest in 8.7 s at about 51 frames a second, against 78 s at 4.2 in software, 320 frames either way, since the engine ticks once a drawn frame.
- The flag and Mesa's two settings go together or not at all, which is why one function returns all three. With the flag and `GALLIUM_DRIVER` but no library path, the browser fell back to software without saying so; with the flag and the library path but no `GALLIUM_DRIVER`, Mesa chose its own software driver and the page could not create WebGL at all. `--use-gl=angle` and `--ignore-gpu-blocklist` changed nothing and were left out, and Playwright's headless shell was faster than the full browser in its new headless mode (8.7 s against 10.1).
- The card is looked for by its two files, never by the machine or the card's maker, so a container without it launches as before and needs no setting. `LIVE_DOCS_BROWSER_RENDERER=software` launches on the processor where a card is there, which is how GitHub Codespaces and CI draw. The environment and the file check are arguments so that the unit test can state each case on any machine.
- How a container gets the card is not this file's business: `.devcontainer/wsl2-graphics-card/devcontainer.json` passes it in and `.devcontainer/post-create.sh` installs Mesa's EGL beside it.
- **The card draws WebGL and nothing else** (the same day, [the late work notes](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#work-notes-late-on-november-17-the-other-stages-the-card-and-2d-and-a-pair-of-numbers-that-point-at-the-fixture)). As first written the launch put the whole page on the card, and the whole suite then failed three 2D cases that pass in software, three times of three when run alone (`local-map-hidden.spec.ts:51` and `:95`, `local-map-packing.spec.ts:107`). Measured on the picture those cases search: composited through Mesa's Direct3D path a large SVG picture drew its first frame in 7.1 s against 4.5 in software, a 450 ms move of it got two or three frames, and the browser found so few idle moments beside it that the 2D map's continuing search, which runs one start in each idle moment, waited 22.8 s of its 74 where software waits 4.8 of 61. `--disable-gpu-compositing` leaves the page to the processor and WebGL to the card: the search then takes 56 s, the six cases pass, and the 3D picture of `generator.ts` still comes to rest in 8.2 s at 49 frames a second (8.5 s and 51 with everything on the card). Rasterising on the processor while compositing on the card was tried and was the slowest of all. The earlier notes' "the flag" is therefore two flags; the three-together rule is unchanged.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RENDERER_VARIABLE` {#symbol-renderer_variable}
- Type: const
- Source: [source](../../../../tests/e2e/browser-launch.ts#L11)

##### `RENDERER_VARIABLE` — Summary
Set to `software` to launch as Playwright does by default, drawing on the processor, where a card is present.

#### `CARD_RENDERER` {#symbol-card_renderer}
- Type: const
- Source: [source](../../../../tests/e2e/browser-launch.ts#L14)

##### `CARD_RENDERER` — Summary
What a page's WebGL renderer string says when the card draws it: Mesa's name for OpenGL carried by Direct3D 12.

#### `browserLaunchOptions` {#symbol-browserlaunchoptions}
- Type: function
- Source: [source](../../../../tests/e2e/browser-launch.ts#L34)
- Returns: `LaunchOptions`
- Parameters: `environment`: `NodeJS.ProcessEnv`

##### `browserLaunchOptions` — Summary
How this repository launches a headless Chromium of its own, for the browser suite and the contact sheet: on the
host's graphics card where the container was given one, and exactly as Playwright launches it everywhere else.

Left alone, a headless Chromium draws WebGL in software (SwiftShader), which gives this repository's own 3D picture
about four frames a second and most of the machine's threads. Under WSL2 the card is reached through Direct3D 12:
Chromium's WebGL layer (ANGLE) is told to draw through the system's EGL, which is Mesa, and Mesa is told to use its
`d3d12` driver and where that driver's libraries are. The three settings go together or not at all: with the flag
and without the driver, Chromium either falls back to software without a word or cannot create WebGL at all
(measured 2026-11-17; the numbers are in this file's Live Doc).

The card draws WebGL and nothing else: `--disable-gpu-compositing` leaves the page itself, the 2D map's SVG among
it, to be put together on the processor as in a browser without a card. Through this path the card was the slower
of the two for a large 2D picture (its first frame in 7.1 s against 4.5), and the browser found so little idle time
beside it that the 2D map's continuing search, which runs in the page's idle moments, took 74 s where it takes 61
in software, which three browser cases could not wait out. With compositing on the processor the search takes
56 s and the 3D picture still draws at 49 frames a second, against 51 with everything on the card.

#### `asksForCard` {#symbol-asksforcard}
- Type: function
- Source: [source](../../../../tests/e2e/browser-launch.ts#L52)
- Parameters: `options`: `LaunchOptions`

##### `asksForCard` — Summary
True where `browserLaunchOptions` asked for the card, so that a caller can check that the card answered.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `LaunchOptions` (type-only)
- `node:fs` - `existsSync`
<!-- LIVE-DOC:END Dependencies -->
