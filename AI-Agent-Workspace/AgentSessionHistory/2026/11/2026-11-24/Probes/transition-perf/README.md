# Perspective transition performance, style invalidation, and shell hover rim (2026-11-24)

**Historical measurement record, 2026-11-24.** Taken on branch `day/2026-11-24` from base commit `a6ee3eec8` (`before`) against the Milestone 7 changes (`after`), single Playwright Chromium worker through `scripts/browser-lane.mjs`, WebGL on ANGLE D3D12 (RTX 3090). Raw per-run numbers are in [measurements.json](measurements.json).

## What changed

1. **No animation replay on frozen transition copies** (`packages/explorer/src/client/views/perspectiveTransition.ts`): `visualCopySteps` skips `animation` and all `animation-*` properties and forces `animation-name: none` whenever the source or tag baseline carried an animation, so copies captured inside the 160 ms `.local-look-fading` window never replay `local-look-*` keyframes.
2. **Stop updating `#local-legend-kinds` while `#view-map` is inactive** (`packages/explorer/src/client/panels/spatial-legend.ts`): `watchLocalKinds()` returns early from `draw()` and skips scheduling when `#view-map` lacks `.active`, eliminating the `checkVisibility()` + `row.replaceChildren()` pass triggered when `releaseCover()` removes `.perspective-held` during the first frame of a switch to 3D.
3. **Remove `:has()` anchors on `<body>` and `#main`** (`local.css`, `shell.css`, `spatial-legend.ts`, `dom.ts`, `detailPanel.ts`, `index.ts`, `errors.ts`, `controller.ts`, `connections.ts`): replaced `body:has(#map-container[data-lod="overview"]):has(#map-connections[data-active="true"])` with `#local-legend[data-gathered="true"]` synced via `syncLocalGatheredLegend()`, and replaced all `#main:has(#detail-panel.visible:not(.reading-dialog))` rules with `#main[data-detail-drawer="open"]` synced via `syncDetailDrawerState()` (and directly in `errors.ts` so the fatal-error handler stays zero-import). Zero `body:has(...)` or `#main:has(...)` selectors remain in `packages/explorer/src/client/styles/`.
4. **Sparse declaration copying + `@import`-aware stylesheet scoping** (`packages/explorer/src/client/views/perspectiveTransition.ts`): `copyStyleCatalog()` walks document stylesheets (including `@import` rules) plus core layout/visual properties once per document/palette, builds tag+namespace neutral baselines (`MODE_CONSTANT`, `MODE_INHERIT`, `MODE_CURRENT_COLOR`, `MODE_ALWAYS`, plus zero-width border/outline guards and inline/SVG-attribute fallbacks), and emits only declarations that differ from the baseline or parent copy. Also caches `<svg>` `getScreenCTM()` in `capture-wires` and calls `forceGraphView.setActive(false)` immediately after `captureScene()` on switches from 3D to 2D.
5. **Fix the `contact-sheet` closed-directory `ResizeObserver` race** (`card-factory.ts`, `card-reading.ts`): exported `drawClosedSkin()` (size-guarded `placeTab` + `drawTabs` + `drawCells`) and invoked it synchronously inside `CardReading.measure()` so closed directory boxes already have their folder tab outline and `--tab-more-shift` before `captureLocalScene()` begins slicing.

## Performance on `packages/engine/src/live-docs/graph.ts` (5 runs each way, medians)

Picture size: `14,918` DOM elements in `#view-map`, `1,125` elements in `.perspective-transition` (`1,065` copied elements on 3D → 2D; `945` copied elements on 2D → 3D).

| Metric | 3D → 2D Before | 3D → 2D After | Change | 2D → 3D Before | 2D → 3D After | Change |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| `press → motion start` | 4,106.5 ms | **2,264.6 ms** | **−44.9%** (−1,842 ms) | 1,415.5 ms | **434.7 ms** | **−69.3%** (3.3× faster) |
| `returned` (click handler) | 2,195.6 ms | **1,858.8 ms** | **−15.3%** (−337 ms) | 234.1 ms | **181.1 ms** | **−22.6%** (−53 ms) |
| `live-docs:switch-render` | 1,920.5 ms | **1,573.2 ms** | **−18.1%** (−347 ms) | 36.5 ms | 37.5 ms | +2.7% |
| `live-docs:capture-cards` | 3.2 ms | 14.6 ms | +11.4 ms (one-time catalog init) | 2.3 ms | 2.3 ms | 0.0% |
| `live-docs:capture-wires` | 41.7 ms | 40.0 ms | −4.1% | 33.4 ms | 35.5 ms | +6.3% |
| `live-docs:capture-directories` | 2.2 ms | 2.1 ms | −4.5% | 1.4 ms | 1.4 ms | 0.0% |
| `live-docs:capture-copies` | 1,791.7 ms | **501.8 ms** | **−72.0%** (3.6× faster) | 1,372.1 ms | **390.2 ms** | **−71.6%** (3.5× faster) |
| `live-docs:switch-animation-setup` | 10.1 ms | 9.7 ms | −4.0% | 10.4 ms | 10.1 ms | −2.9% |
| **`firstFrame`** (append → 1st rAF) | 162.6 ms | **23.2 ms** | **−85.7%** (7.0× faster) | 170.6 ms | **42.2 ms** | **−75.3%** (4.0× faster) |
| **`secondFrame`** (1st → 2nd rAF) | 14.4 ms | 15.4 ms | steady | **172.1 ms** | **41.1 ms** | **−76.1%** (4.2× faster) |
| `framesDrawn` | 58 | **68** | +10 frames | 55 | **65** | +10 frames |
| `longestGapAfterFrame2` | 36.8 ms | 36.0 ms | −2.2% | 37.2 ms | 36.7 ms | −1.3% |
| Mean inline declarations / copy | 391.9 | **21.8** | **−94.4%** (18.0× fewer) | 393.8 | **22.2** | **−94.4%** (17.7× fewer) |

### Remaining breakdown of the 3D → 2D press-to-motion delay (`2,264.6 ms` median)

- **`live-docs:switch-render`: `1,573.2 ms` (69.5%)** — first-time construction, text/room measurement, and layout of the 14,918-element 2D `graph.ts` DOM (already down `347 ms` from `1,920.5 ms` after removing the `body`/`#main` `:has()` selectors).
- **`live-docs:capture-copies`: `501.8 ms` (22.2%)** — down from `1,791.7 ms` (3.6× faster).
- **Synchronous capture geometry (`capture-cards` `14.6 ms` + `capture-wires` `40.0 ms` + `capture-directories` `2.1 ms`): `56.7 ms` (2.5%)**.
- **`live-docs:switch-animation-setup`: `9.7 ms` (0.4%)**; remaining `~123 ms` (5.4%) is microtask/rAF/layout scheduling between `switch-press` and `capture-copies`.

Nearly 70% of the remaining 3D → 2D wait is now strictly first-time 2D scene rendering (`localView.render`), rather than the transition copy pipeline.

## Frozen-layer pixel-for-pixel verification (all 6 pairs)

Captured with `requestAnimationFrame` frozen on the transition layer (matching 2026-11-23 `Probes/first-frame/pixels.spec.ts.txt`):

| Picture & direction | Copied elements | Decl/copy (before → after) | `HEAD` before vs after differing pixels | Live dense vs sparse same-frame differing pixels | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| `repo` (`graph.ts`) to 3D | 945 | 393.8 → **22.2** | **0 / 682,730** (0 B diff) | — | Bit-for-bit identical PNG (`236,326 B` each). |
| `repo` (`graph.ts`) to 2D | 1,065 | 391.9 → **21.8** | **0 / 612,419** (0 B diff) | — | Bit-for-bit identical PNG (`154,984 B` each). |
| `scripts` (`?dir=scripts`) to 3D | 626 | 418.6 → **12.6** | **0 / 682,730** (0 B diff) | — | Bit-for-bit identical PNG (`83,097 B` each); `contact-sheet` More at `118 px`. |
| `scripts` (`?dir=scripts`) to 2D | 626 | 418.6 → **12.6** | 696 / 612,419 in `[25, 85, 256, 166]` | **0 / 612,419** | All 696 pixels vs `HEAD` are inside `contact-sheet` where `HEAD` lost its tab outline and left More at `202 px`; `after` restores the tab outline and More at `118 px`. Zero differing pixels anywhere else, and 0/612,419 vs a live dense copy on the same frame. |
| `estate` (`PaymentService.cs`) to 3D | 131 | 424.5 → **24.6** | 8,985 / 682,730 (cross-run arrival scale) | **0 / 682,730** | Cross-run `stillFor` caught slightly different 2D arrival scale (~0.5%); live card width equals ghost width (`368.300048828125 px` exact), and live dense-vs-sparse on the same frame is **0 / 682,730**. |
| `estate` (`PaymentService.cs`) to 2D | 131 | 424.5 → **24.6** | 963 / 612,419 (`largest Δ=6`) in `[536, 585, 613, 600]` | — | **0 copy differing pixels**; all 963 pixels sit in the bottom 16 rows over the pulsing out-of-layer `3D` button's backward-cue shadow (same artifact documented in 2026-11-23 `Probes/first-frame`). |

## Root cause of the 1-of-7 `contact-sheet` More shift (2026-11-23 `Probes/first-frame`)

Reproduced directly on untouched `HEAD` (`a6ee3eec8`) during the baseline `scripts to2D` capture (`origMoreLeft = 118 px`, `frozenMoreLeft = 202 px`, exact delta `-84.00 px = --tab-more-shift`):

- In `card-factory.ts`, `drawClosedLook()` deferred `placeTab(box)`, `drawTabs(box)`, and `drawCells(...)` strictly to an asynchronous `ResizeObserver` callback.
- On a 3D → 2D switch, `captureLocalScene()` begins slicing in the microtask immediately after `renderCurrentView()` — **before** the browser's first rendering opportunity delivers `ResizeObserver`.
- Because `contact-sheet` is the first `.local-directory-closed` box in DOM order, `visualCopySteps` copied its `<svg class="local-closed-outline">` and `.local-directory-actions` (`···`) button in Slice 1 before `ResizeObserver` ran, freezing `More` at its unshifted CSS `right: 9px` (`202 px`, `84 px` right of the name) and omitting the folder tab path — while later slices (after `ResizeObserver` delivered) copied its blue cell dot and the remaining five closed boxes (`doc-tools`, `layout-lab`, `live-docs`, `oracle`, `slopcop`) with their tabs and shifts intact.
- **Fix:** `drawClosedSkin(box)` in `card-factory.ts` now runs synchronously from `CardReading.measure()` (guarded by drawn `offsetWidth × offsetHeight` so the subsequent initial `ResizeObserver` tick is a no-op). Both `scripts to3D` and `scripts to2D` now freeze `contact-sheet`'s tab outline and `More` consistently at `118 px`.

## 3D directory shell hover rim inspection (`graph.ts`)

Captured under `Group Wrappers: Cloud with Rim` (`cloud-rim`, the look that enables `uRim = 1` in `forceGraphBatches.ts:502, 890`) on `packages/engine/src/live-docs/graph.ts` at rest, with the pointer resting on `shell:packages/engine` (`engine · 178`, `64` free file spheres overlapping its screen disc):

- Full view: [shell-hover-rim.png](shell-hover-rim.png)
- Close-up crop around `shell:packages/engine`: [shell-hover-rim-crop.png](shell-hover-rim-crop.png)

**Visual notes (judged by eye):**
- Foreground spheres sitting physically in front of `shell:packages/engine` cleanly occlude the white hover rim (for example the blue spheres overlapping the upper-right rim near 1 o'clock and lower-left rim near 7 o'clock), because spheres write depth at `renderOrder = 10` before the depth-tested, non-depth-writing wrapper mesh at `renderOrder = 12`.
- Free spheres standing physically behind the shell remain visible through the cloud mist and are softly veiled where they cross behind the bright silhouette edge, communicating depth order cleanly while the polygonal rim still reads clearly as belonging to the hovered `engine · 178` shell.
- Under the default `Skin` look (`groupWrappers: "skin"`), `uRim` is `0` so no hover rim is drawn; hovering a shell highlights its connected spheres/wires and surfaces its Open folder action button.
