# Containment and off-screen skipping for the 2D Local Map's cards: measured, and left out

The experiment the owner asked for on [November 6, Turns 13 to 16](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-13--november-6): "Such invariants should present possibilities for speedup, at least conceptually, no?", and on culling, "We'd need approximations of what's out there just so we don't totally shift the layout as things pop into render view." Since a card's box depends on its structure alone, never on zoom or on what is drawn (the decision "A Card's Box Never Depends on Zoom"), the browser's rendering can never move the layout, which is what makes CSS containment and `content-visibility: auto` safe to try. Built and measured by a builder on the bundle at 51eec0c3 (the breakpoint pass), in a private headless Chromium at 1440 × 960 with software raster and the layout's background search off. Implementation evidence and numbers for the owner, not a verdict.

**The result: neither mechanism pays on these pictures, so neither is in the product.** Skipping was built in full, proved correct by a spec and measured; the trial stands beside this page as [culling-trial.patch](culling-trial.patch) (it applies to 51eec0c3), for the owner to take or leave. Containment (`contain: layout style`) measured nothing, and it would change how a card is drawn.

## What was tried

1. **Containment.** `contain: layout style` on `.node-card`, injected into the bundle's page for the measurement. Layout is not where the time goes (a few milliseconds per move, the tables below), and Chromium makes an element a relayout boundary only with size containment as well, so layout containment alone saves it nothing. It also makes every card a stacking context: the anchor dots (z-index 30) would sink under the wires (z-index 20, "above cards but below pins"), and the test-backed halo (`::before`, z-index −1, 8 px outside the card) would paint over the card's own background instead of behind it. Measured once against an adjacent run of the bundle without it: on `still-picture.ts` the journey's main-thread task time 9.33 s without, 9.67 s with; on the chain retained 21.27 s without, 20.21 s with; both inside the noise below.
2. **Skipping, as the brief described it** (`content-visibility: auto; contain-intrinsic-size: auto 1px 1px` on every card), first injected the same way: the fit then framed the picture at scale 1.45 instead of 1, because the layout's measurement read 1 px cards. And `content-visibility: auto` always applies paint and layout containment, even to a card on screen: it clips what a card draws past its edge (the dots grown outward at the far steps, the hubs 6 px out, the test halo) and brings the stacking change above. So the trial gates it.
3. **Skipping, gated** (the patch). A pure module, `card-culling.ts`, says which cards lie off the frame from the boxes the layout placed and the camera: the frame on screen widened by a quarter of its larger side, mapped back through the camera, widened again by 64 px of the picture for what a card draws past its edge. Only those cards get the class `local-card-offscreen`, which alone carries `content-visibility: auto`, so a card on screen is drawn exactly as without culling. The renderer culls after every picture and every frame of a move; the controller on every camera change, after the frame's edge has been read so that it costs no extra layout. Before the page is measured (a render, a resize's remeasure, the search's trial of a start) every card is drawn again, since a skipped card has no natural width. Each card keeps the height the layout measured, less its padding and border, as `contain-intrinsic-height: auto <h>px`, so a skipped card's box is its laid-out box; `auto` lets the browser keep the height it last drew, which is the same.

## The proof that skipping moves nothing

`tests/e2e/card-culling.spec.ts` in the patch, six tests, passing on the trial's bundle:

- On this repository's chain scope and on the estate's, every file retained: at the fit, four Zoom In presses closer and six Zoom Out presses farther, no card on screen is ever marked, every card's box (its offset width and height and its place in the picture's pixels) is the same with the marks on and with every mark taken off, and the boxes are the same at all three cameras. Cards were skipped (65 of 98 on the repository's chain close up).
- A remeasure while cards are skipped (the window narrowed to 1,180 px and widened back, close up) gives every card the width and height it had at the first picture.
- Tab from the subject's name into the first card the browser had skipped brings that card on screen, unmarked and drawn, with the focused command inside the unobstructed frame as `local-map-keyboard.spec.ts` reads it.
- `window.find`, the page's find as a script can drive it, finds a name inside a skipped card. It misses many names with or without skipping (127 of the first 400 names on the chain scope found either way, those whose word seams fall at a hyphen or an underscore missed), so the test uses a name with no seam in it; the browser's own Ctrl+F cannot be driven headless.

Each test was shown able to fail: with the remeasure's "draw every card" removed, the repository's remeasure test failed, cards measured at other sizes; with the held heights removed, the repository's box test and both remeasure tests failed. The estate's box test passed under the second mutation, since its marked cards had all been drawn once and the browser remembered their heights.

## The pictures, skipping on and off

The same page and camera, first as culled, then with every mark taken off; compared pixel by pixel in a canvas.

| Moment | Cards | Marked | Skipped by the browser | Pixels differing, on against off | Picture on | Picture off |
| --- | --- | --- | --- | --- | --- | --- |
| `still-picture.ts`, reading band, the fit (scale 1) | 44 | 33 | 27 | 0 | [on](still-picture-reading-skipping-on.png) | [off](still-picture-reading-skipping-off.png) |
| `still-picture.ts`, far band, five Zoom Out presses (scale 0.40) | 44 | 27 | 23 | 0 | [on](still-picture-far-skipping-on.png) | [off](still-picture-far-skipping-off.png) |
| the chain retained, the fit (scale 1.45) | 98 | 91 | 63 | 4 | [on](chain-fit-skipping-on.png) | [off](chain-fit-skipping-off.png) |
| the chain retained, four Zoom In presses (scale 3) | 98 | 94 | 65 | 4 | [on](chain-close-skipping-on.png) | [off](chain-close-skipping-off.png) |

The four pixels are in the sidebar beside Show Tests, outside the map, in both chain moments. Against the bundle before the pass at the same camera, the `still-picture.ts` pictures and the chain close up are identical; the chain at its fit differs by 24,501 pixels across its bundle of several hundred glowing wires, and two loads of the bundle before the pass differ from each other there by 46,523, so that is the raster of the wires' glow, not the culling. More cards are marked than skipped: Chromium draws a marked card anyway while it lies within its own margin of the viewport, contained, and so off the frame and unseen.

## The numbers

The instrument is the root's two (`zoom-perf.cjs`, a Zoom Out press, and its wheel copy), grown into one journey per page and kept with its trace companion under [the frame-cost probe](../../../Probes/2026-11-06/frame-cost/README.md): three Zoom Out presses, Reset Zoom, three animated wheel zooms out of five notches each, a drag pan and a trackpad pan (twenty horizontal wheel events, which pan at once with no compositor layer) at the far band, three wheel zooms back in, Reset Zoom, a drag pan and a trackpad pan at the reading band. After each move, 1.2 s of Chromium's metrics and requestAnimationFrame intervals, then the band, step and scale where the camera came to rest and how many cards the browser skipped there. Three tuning variants as before: the ladder (the default), constant properties (resistances 0, Name Growth 1) and the growing composition. Four pages: `tests/e2e/still-picture.ts`, the estate's `PaymentService.cs` and `packages/explorer/src/client/views/localView/controller.ts` from this repository's bundle, and this repository's chain scope (`index.ts`, `compressed-url-state.ts`, `pin-state.ts`, `symbolAnchors.ts`) with every file retained, 98 cards. Before is the bundle at 51eec0c3, after the trial's; each cell is the mean of two runs, the four runs interleaved before, after, after, before on one otherwise idle machine. Durations in seconds; "Task" is the main thread's.

### The journey's totals, every page and variant

| Subject | Variant | Frames, before → after | Style s, before → after | Task s, before → after | Task s, one run before against another |
| --- | --- | --- | --- | --- | --- |
| `still-picture.ts` | ladder | 588 → 567 | 1.11 → 1.10 | 9.86 → 10.99 | 10.09 against 9.62 |
| `still-picture.ts` | constantVars | 730 → 674 | 0.57 → 0.49 | 6.44 → 8.13 | 6.90 against 5.97 |
| `still-picture.ts` | grow | 948 → 949 | 0.41 → 0.37 | 2.89 → 2.59 | 2.94 against 2.84 |
| `PaymentService.cs` | ladder | 900 → 915 | 0.21 → 0.21 | 2.51 → 2.25 | 2.59 against 2.42 |
| `PaymentService.cs` | constantVars | 928 → 930 | 0.13 → 0.14 | 1.72 → 1.73 | 1.85 against 1.58 |
| `PaymentService.cs` | grow | 951 → 952 | 0.15 → 0.15 | 1.13 → 1.24 | 1.10 against 1.15 |
| `controller.ts` | ladder | 608 → 646 | 0.72 → 0.89 | 9.08 → 7.93 | 9.08 against 9.08 |
| `controller.ts` | constantVars | 766 → 748 | 0.39 → 0.42 | 5.24 → 5.61 | 5.24 against 5.24 |
| `controller.ts` | grow | 961 → 960 | 0.21 → 0.26 | 1.97 → 2.50 | 1.98 against 1.97 |
| the chain retained | ladder | 514 → 523 | 1.59 → 1.55 | 20.79 → 20.92 | 21.27 against 20.31 |
| the chain retained | constantVars | 532 → 545 | 0.91 → 0.73 | 20.21 → 19.00 | 20.83 against 19.59 |
| the chain retained | grow | 875 → 863 | 0.69 → 0.77 | 5.33 → 5.44 | 5.33 against 5.34 |

The last column is the noise: the two runs of the bundle before the pass, each against the other. A difference between before and after smaller than it says nothing.

### Where a move's main-thread time goes

A Chromium trace of the renderer's main thread over the 1.2 s after one wheel zoom of five notches, summed by event, the mean of three runs on each bundle, in milliseconds: out from the fit on `still-picture.ts` and on the chain retained, and in again after two zooms out on the chain. Nested events are counted under their own names as well ("Main frame" holds the rest).

| Page and move | Bundle | Main frames | Style | Layout | Paint | Layerize | Commit | Forced style and layout | Script |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `still-picture.ts`, wheel out from the fit | before | 1037 | 107 | 6 | 74 | 158 | 360 | 23 | 95 |
| `still-picture.ts`, wheel out from the fit | skipping | 1171 | 97 | 10 | 64 | 86 | 354 | 57 | 118 |
| the chain retained, wheel out from the fit | before | 2567 | 110 | 1 | 223 | 142 | 1678 | 16 | 100 |
| the chain retained, wheel out from the fit | skipping | 2418 | 134 | 10 | 181 | 90 | 1631 | 101 | 198 |
| the chain retained, wheel in after two out | before | 2769 | 68 | 18 | 239 | 183 | 1721 | 17 | 109 |
| the chain retained, wheel in after two out | skipping | 2604 | 61 | 17 | 166 | 94 | 1892 | 52 | 141 |

### Each move, the ladder variant

The band, step and scale are where the camera came to rest, the same before and after; "Skipped after" is how many cards the browser skipped there, after.

#### `tests/e2e/still-picture.ts`, ladder

| Move | Band, step, scale | Cards | Skipped after | Frames | Mean frame ms | Max frame ms | Frames over 20 ms | Style s | Layout s | Task s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| at rest, first framed | reading, 0, 1 | 44 | 27 | | | | | | | |
| Zoom Out button | reading, 1, 0.833 | 44 | 27 | 66 → 66 | 18.1 → 18.4 | 83 → 83 | 3 → 3 | 0.039 → 0.048 | 0.002 → 0.002 | 0.234 → 0.250 |
| Zoom Out button | middle, 2, 0.694 | 44 | 26 | 71 → 72 | 16.9 → 16.8 | 58 → 58 | 2 → 1 | 0.043 → 0.045 | 0.007 → 0.007 | 0.149 → 0.145 |
| Zoom Out button | middle, 3, 0.579 | 44 | 25 | 67 → 66 | 17.9 → 18.1 | 83 → 92 | 2 → 2 | 0.045 → 0.054 | 0.005 → 0.005 | 0.221 → 0.247 |
| wheel out, 5 notches | reading, 1, 0.741 | 44 | 26 | 32 → 32 | 37.8 → 37.9 | 208 → 217 | 11 → 10 | 0.078 → 0.083 | 0.005 → 0.009 | 0.789 → 0.766 |
| wheel out, 5 notches | middle, 3, 0.549 | 44 | 25 | 18 → 16 | 72.7 → 78.2 | 175 → 200 | 10 → 9 | 0.193 → 0.181 | 0.026 → 0.028 | 1.625 → 2.002 |
| wheel out, 5 notches | far, 5, 0.407 | 44 | 23 | 26 → 29 | 47.6 → 42.8 | 225 → 200 | 8 → 8 | 0.114 → 0.142 | 0.013 → 0.016 | 1.252 → 1.079 |
| drag pan | far, 5, 0.407 | 44 | 20 | 42 → 28 | 30.6 → 44.5 | 175 → 225 | 10 → 10 | 0.146 → 0.114 | 0.008 → 0.008 | 0.890 → 1.014 |
| trackpad pan, 20 events | far, 5, 0.407 | 44 | 20 | 67 → 72 | 18.1 → 17.1 | 67 → 50 | 4 → 2 | 0.064 → 0.043 | 0.007 → 0.004 | 0.389 → 0.302 |
| wheel in, 5 notches | middle, 4, 0.549 | 44 | 21 | 22 → 22 | 62.4 → 58.8 | 308 → 242 | 11 → 10 | 0.115 → 0.081 | 0.015 → 0.016 | 1.405 → 1.340 |
| wheel in, 5 notches | middle, 2, 0.741 | 44 | 23 | 26 → 18 | 48.1 → 72.7 | 225 → 250 | 6 → 7 | 0.085 → 0.111 | 0.009 → 0.018 | 1.030 → 1.611 |
| wheel in, 5 notches | reading, 0, 1 | 44 | 24 | 32 → 24 | 37.3 → 50.5 | 175 → 200 | 7 → 9 | 0.093 → 0.087 | 0.018 → 0.013 | 0.911 → 1.012 |
| drag pan | reading, 0, 1 | 44 | 25 | 52 → 54 | 23.1 → 22.4 | 158 → 142 | 4 → 4 | 0.091 → 0.064 | 0.001 → 0.001 | 0.640 → 0.582 |
| trackpad pan, 20 events | reading, 0, 1 | 44 | 25 | 68 → 68 | 17.7 → 17.6 | 67 → 67 | 2 → 2 | 0.003 → 0.049 | 0.000 → 0.009 | 0.322 → 0.641 |
| **the journey** | | | | 588 → 567 | | | | 1.109 → 1.101 | 0.114 → 0.136 | 9.858 → 10.992 |

#### the estate's `PaymentService.cs`, ladder

| Move | Band, step, scale | Cards | Skipped after | Frames | Mean frame ms | Max frame ms | Frames over 20 ms | Style s | Layout s | Task s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| at rest, first framed | reading, 0, 1.45 | 11 | 0 | | | | | | | |
| Zoom Out button | reading, 1, 1.208 | 11 | 0 | 72 → 73 | 16.6 → 16.5 | 42 → 33 | 1 → 1 | 0.007 → 0.008 | 0.001 → 0.001 | 0.093 → 0.083 |
| Zoom Out button | middle, 2, 1.007 | 11 | 0 | 74 → 74 | 16.3 → 16.2 | 17 → 17 | 0 → 0 | 0.005 → 0.005 | 0.002 → 0.002 | 0.056 → 0.053 |
| Zoom Out button | middle, 3, 0.839 | 11 | 0 | 74 → 74 | 16.3 → 16.3 | 17 → 17 | 0 → 0 | 0.009 → 0.009 | 0.001 → 0.001 | 0.053 → 0.045 |
| wheel out, 5 notches | reading, 1, 1.074 | 11 | 0 | 58 → 60 | 20.8 → 20.4 | 100 → 92 | 7 → 7 | 0.022 → 0.019 | 0.001 → 0.001 | 0.268 → 0.251 |
| wheel out, 5 notches | middle, 3, 0.796 | 11 | 0 | 66 → 72 | 18.3 → 16.9 | 58 → 42 | 5 → 2 | 0.025 → 0.024 | 0.005 → 0.005 | 0.312 → 0.233 |
| wheel out, 5 notches | far, 5, 0.59 | 11 | 0 | 66 → 68 | 18.2 → 17.8 | 67 → 50 | 4 → 4 | 0.029 → 0.032 | 0.003 → 0.004 | 0.328 → 0.280 |
| drag pan | far, 5, 0.59 | 11 | 0 | 68 → 68 | 17.5 → 17.6 | 33 → 42 | 6 → 5 | 0.033 → 0.042 | 0.001 → 0.003 | 0.212 → 0.249 |
| trackpad pan, 20 events | far, 5, 0.59 | 11 | 0 | 74 → 74 | 16.3 → 16.4 | 17 → 17 | 0 → 0 | 0.001 → 0.003 | 0.000 → 0.001 | 0.054 → 0.066 |
| wheel in, 5 notches | middle, 4, 0.796 | 11 | 0 | 66 → 70 | 18.4 → 17.2 | 75 → 58 | 4 → 2 | 0.015 → 0.012 | 0.003 → 0.002 | 0.291 → 0.185 |
| wheel in, 5 notches | middle, 2, 1.074 | 11 | 0 | 66 → 69 | 18.3 → 17.5 | 58 → 58 | 4 → 2 | 0.017 → 0.012 | 0.003 → 0.003 | 0.297 → 0.219 |
| wheel in, 5 notches | reading, 0, 1.45 | 11 | 0 | 72 → 72 | 16.8 → 16.9 | 33 → 33 | 2 → 2 | 0.014 → 0.018 | 0.003 → 0.004 | 0.190 → 0.216 |
| drag pan | reading, 0, 1.45 | 11 | 0 | 69 → 68 | 17.5 → 17.6 | 67 → 67 | 3 → 3 | 0.026 → 0.026 | 0.000 → 0.001 | 0.247 → 0.286 |
| trackpad pan, 20 events | reading, 0, 1.45 | 11 | 0 | 74 → 74 | 16.4 → 16.4 | 17 → 17 | 0 → 0 | 0.003 → 0.003 | 0.000 → 0.000 | 0.105 → 0.083 |
| **the journey** | | | | 900 → 915 | | | | 0.205 → 0.212 | 0.022 → 0.024 | 2.507 → 2.251 |

#### `packages/explorer/src/client/views/localView/controller.ts`, ladder

| Move | Band, step, scale | Cards | Skipped after | Frames | Mean frame ms | Max frame ms | Frames over 20 ms | Style s | Layout s | Task s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| at rest, first framed | reading, 0, 1.45 | 22 | 1 | | | | | | | |
| Zoom Out button | reading, 1, 1.208 | 22 | 1 | 67 → 68 | 18.0 → 17.8 | 100 → 100 | 3 → 2 | 0.029 → 0.027 | 0.002 → 0.002 | 0.236 → 0.228 |
| Zoom Out button | middle, 2, 1.007 | 22 | 1 | 72 → 72 | 16.6 → 16.6 | 42 → 42 | 1 → 1 | 0.029 → 0.035 | 0.004 → 0.005 | 0.108 → 0.118 |
| Zoom Out button | middle, 3, 0.839 | 22 | 0 | 71 → 73 | 16.9 → 16.6 | 58 → 33 | 2 → 1 | 0.038 → 0.028 | 0.005 → 0.004 | 0.138 → 0.116 |
| wheel out, 5 notches | reading, 1, 1.074 | 22 | 1 | 26 → 28 | 49.1 → 44.9 | 358 → 317 | 8 → 8 | 0.067 → 0.071 | 0.003 → 0.004 | 1.047 → 0.917 |
| wheel out, 5 notches | middle, 3, 0.796 | 22 | 0 | 18 → 44 | 67.1 → 27.8 | 175 → 217 | 9 → 7 | 0.134 → 0.110 | 0.018 → 0.014 | 1.486 → 0.738 |
| wheel out, 5 notches | far, 5, 0.59 | 22 | 0 | 26 → 39 | 48.7 → 33.1 | 250 → 233 | 7 → 10 | 0.074 → 0.117 | 0.009 → 0.017 | 1.239 → 0.946 |
| drag pan | far, 5, 0.59 | 22 | 1 | 32 → 34 | 37.2 → 37.0 | 200 → 150 | 8 → 10 | 0.102 → 0.117 | 0.003 → 0.004 | 0.875 → 0.754 |
| trackpad pan, 20 events | far, 5, 0.59 | 22 | 1 | 72 → 72 | 16.8 → 16.7 | 50 → 42 | 1 → 1 | 0.002 → 0.005 | 0.000 → 0.001 | 0.186 → 0.186 |
| wheel in, 5 notches | middle, 4, 0.796 | 22 | 1 | 31 → 33 | 43.7 → 42.0 | 242 → 292 | 6 → 4 | 0.043 → 0.054 | 0.009 → 0.009 | 1.046 → 0.982 |
| wheel in, 5 notches | middle, 2, 1.074 | 22 | 3 | 29 → 30 | 41.7 → 41.0 | 192 → 208 | 7 → 8 | 0.054 → 0.066 | 0.012 → 0.012 | 1.115 → 0.969 |
| wheel in, 5 notches | reading, 0, 1.45 | 22 | 3 | 34 → 48 | 35.0 → 25.5 | 175 → 150 | 8 → 8 | 0.082 → 0.113 | 0.015 → 0.019 | 0.853 → 0.716 |
| drag pan | reading, 0, 1.45 | 22 | 2 | 54 → 56 | 22.1 → 21.5 | 117 → 125 | 5 → 4 | 0.068 → 0.070 | 0.000 → 0.003 | 0.639 → 0.610 |
| trackpad pan, 20 events | reading, 0, 1.45 | 22 | 2 | 74 → 50 | 16.4 → 24.1 | 17 → 233 | 0 → 5 | 0.001 → 0.073 | 0.000 → 0.011 | 0.114 → 0.649 |
| **the journey** | | | | 608 → 646 | | | | 0.723 → 0.885 | 0.082 → 0.104 | 9.082 → 7.929 |

#### the chain of four files retained (this repository), ladder

| Move | Band, step, scale | Cards | Skipped after | Frames | Mean frame ms | Max frame ms | Frames over 20 ms | Style s | Layout s | Task s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| at rest, first framed | reading, 0, 1.45 | 98 | 63 | | | | | | | |
| Zoom Out button | reading, 1, 1.208 | 98 | 62 | 48 → 47 | 25.6 → 25.6 | 167 → 192 | 3 → 3 | 0.097 → 0.110 | 0.003 → 0.004 | 0.583 → 0.613 |
| Zoom Out button | middle, 2, 1.007 | 98 | 60 | 53 → 54 | 22.7 → 22.4 | 167 → 158 | 3 → 3 | 0.052 → 0.067 | 0.013 → 0.016 | 0.449 → 0.446 |
| Zoom Out button | middle, 3, 0.839 | 98 | 51 | 60 → 61 | 19.9 → 19.8 | 142 → 133 | 2 → 2 | 0.093 → 0.103 | 0.009 → 0.009 | 0.322 → 0.334 |
| wheel out, 5 notches | reading, 1, 1.074 | 98 | 62 | 19 → 14 | 69.1 → 98.8 | 333 → 383 | 8 → 8 | 0.051 → 0.068 | 0.001 → 0.003 | 2.234 → 2.956 |
| wheel out, 5 notches | middle, 3, 0.796 | 98 | 50 | 17 → 18 | 76.0 → 71.2 | 308 → 317 | 8 → 8 | 0.203 → 0.150 | 0.041 → 0.036 | 2.888 → 2.603 |
| wheel out, 5 notches | far, 5, 0.59 | 98 | 48 | 26 → 26 | 46.4 → 47.8 | 433 → 458 | 2 → 2 | 0.200 → 0.201 | 0.022 → 0.024 | 2.442 → 2.210 |
| drag pan | far, 5, 0.59 | 98 | 54 | 34 → 32 | 35.8 → 37.9 | 417 → 433 | 4 → 5 | 0.180 → 0.121 | 0.000 → 0.002 | 1.075 → 1.087 |
| trackpad pan, 20 events | far, 5, 0.59 | 98 | 47 | 74 → 71 | 16.3 → 17.0 | 17 → 67 | 0 → 1 | 0.001 → 0.012 | 0.000 → 0.001 | 0.308 → 0.432 |
| wheel in, 5 notches | middle, 4, 0.796 | 98 | 49 | 28 → 28 | 67.3 → 66.6 | 733 → 725 | 2 → 2 | 0.129 → 0.171 | 0.038 → 0.025 | 3.822 → 3.788 |
| wheel in, 5 notches | middle, 2, 1.074 | 98 | 54 | 16 → 31 | 86.6 → 48.6 | 517 → 567 | 5 → 3 | 0.214 → 0.252 | 0.030 → 0.029 | 2.974 → 2.718 |
| wheel in, 5 notches | reading, 0, 1.45 | 98 | 59 | 31 → 35 | 42.0 → 39.7 | 425 → 467 | 2 → 2 | 0.222 → 0.192 | 0.037 → 0.027 | 2.235 → 2.385 |
| drag pan | reading, 0, 1.45 | 98 | 61 | 40 → 38 | 32.0 → 33.1 | 292 → 300 | 4 → 5 | 0.152 → 0.099 | 0.000 → 0.001 | 0.960 → 0.945 |
| trackpad pan, 20 events | reading, 0, 1.45 | 98 | 61 | 68 → 68 | 17.8 → 17.8 | 108 → 117 | 2 → 1 | 0.002 → 0.006 | 0.000 → 0.001 | 0.498 → 0.403 |
| **the journey** | | | | 514 → 523 | | | | 1.594 → 1.552 | 0.194 → 0.178 | 20.790 → 20.918 |


## What the numbers say

- **Skipping does what it promises, and the promise is small here.** With cards skipped, layerization (deciding the compositor's layers from the painted chunks, which the many scaled names, dots and buttons of a slot card make numerous) about halves, 158 to 86 ms on `still-picture.ts` and 142 to 90 and 183 to 94 ms on the chain, and painting falls by a fifth to a third on the chain. Style recalculation does not fall: each ladder step draws the wires again, and the wires read every anchor dot, so the skipped cards are brought up to date by the reading (forced style and layout, 16 to 23 ms before, 52 to 101 ms after), and the cull's own work costs script time each frame.
- **The cost is the commit, which neither mechanism touches.** On the chain, 1.6 to 1.9 s of a move's 2.4 to 2.8 s of main frames is the commit, the main thread waiting on the compositor to take the frame, rastered in software here; on `still-picture.ts` 0.35 s of 1.0 to 1.2 s. That is the drawing of what is on screen, which must be drawn; Chromium already leaves off-screen content out of the raster at rest. Style was 0.1 s and layout a few milliseconds per move before the pass.
- **Per move.** One move paid in both runs: the wheel zoom out to the middle band on `controller.ts`, 0.73 and 0.75 s after against 1.51 and 1.47 s before. The trackpad pan at reading scale cost more on `still-picture.ts` (0.32 to 0.64 s) and on `controller.ts` (0.11 to 0.65 s), though not on the chain (0.50 to 0.40 s): a pan brings skipped cards in, and their style, layout and paint, which the bundle before had already done, are paid as they arrive. Over a whole journey the totals moved within the noise on every page but `controller.ts`'s ladder, 9.08 to 7.93 s, whose two runs before agreed to the hundredth; its growing composition went the other way, 1.97 to 2.50 s.
- **The caveat.** These are a headless browser's numbers with software raster; on the owner's GPU browser the commit and raster weigh far less, and style and layerization, which skipping does reduce, weigh more. The same journeys on the owner's machine, with the patch applied, would settle whether it pays where it matters.

## Forks decided

- **Gated skipping, not skipping on every card.** `content-visibility: auto` contains a card's paint and stacking whether or not it is skipped, so on every card it would clip the dots grown past a card's edge, lift the wires over the dots and paint the test halo over the card. Gating it to cards off the frame keeps every card on screen drawn exactly as before; the spec and the pictures check it.
- **The held height from the layout, not the browser's remembered size alone.** `contain-intrinsic-size: auto 1px 1px` sized a card first placed off the frame at a pixel: the measurement read it so (the fit at 1.45), and the browser's own test of which cards are near the frame used it too. The layout's measured height, less padding and border, is exact, with `auto` in front so the browser's memory of the same height wins once it has drawn the card.
- **Every card drawn before the page is measured**, at the three places the page measures (a render, a remeasure, the search's trial), rather than a class on the map toggled around the measurement: the cards a render builds are new and unmarked anyway, and the cull after the picture marks them again.
- **A margin of a quarter frame on screen plus 64 px of the picture.** The 64 px cover what a card draws past its box (the test halo and its shadow, the subject's glow, the grown dots); the lead lets a pan or a zoom bring cards in before they arrive. Chromium's own margin of the viewport is wider still, so the lead decides nothing about which cards are skipped.
- **Containment left out**, since it measured nothing and changes the picture.
- **Skipping left out of the product**, since it did not pay on these journeys; the trial is kept whole as the patch, with its spec and unit tests.

## Unfinished

- Skipping measured on the owner's own browser, with a GPU, which this machine cannot do.
- The wires read every anchor on every redraw, so a skipped card is brought up to date at every step; reading the off-frame ends from the rows the layout already measured (the search's `rowsOf`) would let skipped cards stay skipped, and would be the next thing to try if skipping is taken up.
- The commit is the cost: what the slot card asks of the compositor (every scaled name, dot and button its own transformed chunk) is where a faster picture would come from, and is not this experiment's.
