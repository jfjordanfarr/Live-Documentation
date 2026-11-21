# The Explorer where WebGL is refused, after the mend

_Historical evidence, taken on November 21, 2026 by the builder of the mend, on the built site of its branch. The defect is finding 3 of [the root's probe of that day](../../Probes/weak-machine/README.md): in a Chromium launched with `--disable-3d-apis`, a link to the 3D map opened "The Explorer stopped" over an empty map ([its picture](../../Probes/weak-machine/no-webgl--estate-3d--12s.png)). The rule the mend establishes is in [Interaction and Accessibility](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md), section 10.2._

## How they were taken

- **The browser.** Chromium from Playwright, launched with `--disable-3d-apis`, as the probe launched it, but headed, on an Xvfb screen of 1280 by 860 of its own, so that the browser draws its own native tooltip; a headless browser draws none.
- **The addresses.** The estate sample's `PaymentService/PaymentService.cs` and this repository's `packages/engine/src/live-docs/graph.ts`, each asked for in 3D: `?view=local&mode=3d&node=…`, the probe's own addresses.
- **The tooltip.** The X server's own pointer was moved onto the 3D control (`warp.py`) and held for 2.5 s, and the whole screen was captured with ImageMagick's `import`; a pointer moved through Playwright reaches the page and not the browser's tooltip, which did not show in a first attempt. Xvfb does not draw the cursor itself, so no arrow is seen over the control.
- **The focus.** The control was then given keyboard focus and the toolbar's corner cropped from the page.
- **The script** is [`shots.mjs`](shots.mjs), with [`warp.py`](warp.py), run through the browser lane on the built site.

## The pictures

| Picture | What it is |
| --- | --- |
| [`estate--3d-link.png`](estate--3d-link.png) | The estate sample's 3D link, once the 2D map was at rest |
| [`estate--3d-control-hovered.png`](estate--3d-control-hovered.png) | The whole screen, the pointer resting on the 3D control |
| [`estate--3d-control-focused.png`](estate--3d-control-focused.png) | The toolbar, the 3D control holding keyboard focus |
| [`repo--3d-link.png`](repo--3d-link.png) | This repository's 3D link, once the 2D map was at rest |
| [`repo--3d-control-hovered.png`](repo--3d-control-hovered.png) | The whole screen, the pointer resting on the 3D control |
| [`repo--3d-control-focused.png`](repo--3d-control-focused.png) | The toolbar, the 3D control holding keyboard focus |
| [`estate--tuning-3d-layout-hovered.png`](estate--tuning-3d-layout-hovered.png) | The whole screen, Tuning open, the pointer resting on its 3D Layout heading after a press on it |

## What I see

- **The subject asked for is on screen, in 2D.** On the estate's link, `PaymentService.cs` stands in the middle of the map as the subject's card, its uses coming in from the left in green, its context line under the sidebar naming it. On this repository's link, `graph.ts` is the same, with its neighbours to either side. No panel says "The Explorer stopped", nothing says the map is building, and the page recorded no error on either.
- **The address says 2D.** The browser's address bar shows the page's own `?s=` address, which decodes to the 2D map of the subject; the `mode=3d` that was asked for is gone.
- **The 3D control is where it always is,** beside 2D, which is pressed in blue. Its label is the dim grey of the toolbar's disabled buttons; nothing else on the page changed, and no word of ours was added to it.
- **Its explanation.** Under the pointer, the browser's own tooltip reads "3D needs WebGL, which this browser does not offer", in the same native box as every other control's tooltip. The accessibility tree reads the toolbar as Fit current scope, Whole, Layout tuning, 2D (pressed), 3D (disabled), and the 3D control's description is the same sentence.
- **Its focus.** With keyboard focus the 3D control carries the toolbar's blue ring at full strength around its dim label, so the focus is as easy to see as on any other control.
- **The amber cue is off.** Where WebGL is offered, the 3D control lights amber when the 2D map draws connections against its order, to call the person to 3D; where it is not, the mend leaves the cue unlit, since the control could not answer. Neither picture shows it lit; I did not check whether either scope would light it in a browser with WebGL, so the pictures do not prove the rule, which rests on the code.

- **Tuning's 3D Layout.** With Tuning open, the 3D Layout heading stands where it always stands, between the 2D levers and History, folded, in a faded blue beside History's full blue. A press on it opened nothing, and under the pointer the same tooltip reads "3D needs WebGL, which this browser does not offer". History stays offered, since its levers drive the scrubber both maps share. The tooltip box sits over the History heading while it shows; that is where the browser puts a native tooltip, under the pointer.

## What I doubt

- **A sighted keyboard user sees nothing on focus.** The native tooltip shows to a resting pointer only; on focus, the explanation reaches a screen reader as the control's description, but a sighted person who tabs to it sees only the ring. This is the standing state of every native tooltip in the Explorer (Interaction and Accessibility, section 11.2), not something this mend made worse; a custom tooltip shown on focus would be a change for the whole toolbar.
- **The tooltip was seen on Linux under Xvfb, not on Windows.** The owner's machine will draw it in its own system style.
- **The words were changed once.** The first pictures read "…which this browser has turned off", the brief's words; the root changed them the same day, since a browser may simply have no WebGL to give. The hovered pictures here were taken again with the words as they now stand.

## What the question costs a 2D visit

The first build asked the browser at every page's start. Asking alone, in a fresh page of `about:blank`, cost the first page of a browser on the graphics card 731 ms, and then 49 to 54 ms a page; in software, 28 to 34 ms. The root ruled that a 2D arrival should pay nothing: since then the browser is asked at the start only when 3D is asked for then, at a press of 3D, or once the page is idle after its first picture (within three seconds), and the 3D control and Tuning's group become unavailable then.

**How it was measured.** The estate sample's `PaymentService/PaymentService.cs` in 2D, each run in a fresh browser at 1280 by 800, so that each was a browser's first page. A run's time is from the start of navigation to the moment the 2D map's placed picture (`#map-container .local-placed`) was put into the page. "Before" is the build that asked at the start: this branch with one line added to ask at the start, built for the purpose. "After" is the build with the late question. The two builds were served side by side and taken in turn, nine runs each, so that the machine's load fell on both alike. Load average over the run: 11.75 before it, 8.45 after it, on twenty threads shared with other agents.

| Drawing | Before, median (runs) | After, median (runs) |
| --- | ---: | ---: |
| The graphics card | 1,023 ms (860 to 1,278) | 935 ms (860 to 1,446) |
| Software | 907 ms (789 to 1,143) | 922 ms (787 to 1,207) |

On the card the late question brings the first picture about 90 ms sooner. In software no difference stands above the noise. The 731 ms of the bare page did not show in full: by the time the Explorer asks, its page has already started the graphics process for itself. An earlier pair of runs, taken one build after the other rather than in turn under different loads (6.6 and 16.5), gave 1,112 ms before and 1,447 ms after on the card; that is the load, which is why the measurement above takes the two in turn.

## Not mended: a WebGL context lost and never restored

Found while reading the renderer for this mend, and left for a task of its own. A weak machine drawing WebGL in software is where a browser is most likely to take a context back (a lost graphics process, a reset after a long frame, memory pressure).

- `packages/explorer/src/client/views/forceGraphRenderer.ts:30` creates the 3D map's `WebGLRenderer` once, for the page's life, and `:67` draws through it (`this.gpu.render(this.world, this.eye)`).
- Three handles the loss itself (`node_modules/three/src/renderers/WebGLRenderer.js`, three r186): `onContextLost` at `:1113` calls `event.preventDefault()`, which tells the browser the page wants the context back, and sets `_isContextLost = true`; `render` at `:1646` then returns at once (`if ( _isContextLost === true ) return;`). `onContextRestore` at `:1123` sets it false and builds the GL state again, so geometry and materials are uploaded afresh at the next draw.
- The Explorer's one listener is `packages/explorer/src/client/views/forceGraphBatches.ts:697`, `renderer.domElement.addEventListener("webglcontextrestored", () => { previousCamera = []; })`, which makes the next frame draw although the camera has not moved. Nothing listens for `webglcontextlost`.
- **So today:** while the context is lost the canvas is blank and nothing throws; the motion, the picking (done on the processor), the labels, the toolbar and the 3D control all go on standing as if the map were drawn; `aria-busy` on `#graph-svg` goes on following the motion (`views/forceGraphView.ts:762`, `:2605`). If the browser restores the context, the picture comes back on the next frame. If it never does (the browser gives up after repeated losses, or blocks WebGL for the page), the 3D map stays blank for good, with its controls standing and no sign of why, and 3D stays offered.
- Not measured here: no context was lost on purpose (`WEBGL_lose_context.loseContext()` on the map's own canvas would do it) and no picture was taken of it.
