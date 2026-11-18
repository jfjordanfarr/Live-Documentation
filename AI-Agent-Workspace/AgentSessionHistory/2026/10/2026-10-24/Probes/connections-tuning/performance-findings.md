# Connections rendering performance — October 24, 2026

Historical measurements from the [Connections tuning probe](README.md). The first investigation predates the final physics repair and visual selection; the later reproduction below uses the selected 12-segment spheres and repaired physics. Neither measurements nor a passing stopwatch establish aesthetic quality.

## Conditions and the test timeout

Installed Playwright Chromium ran headlessly in the devcontainer using ANGLE/Vulkan SwiftShader, a CPU renderer. The viewport was 1280×800, the WebGL canvas 1019×750, DPR 1, with the full graph focused on the generator. Tests explicitly selected node resistance 0, wire resistance 1 and width 1, rather than the proposed .45/.9/.9 defaults. Antialiasing remained enabled.

The new wire spec failed while waiting for `#graph-svg` to settle, before its wire assertions: `Expected: "false"; Received: "true"; Timeout: 25000ms`. **That 25-second allowance was introduced in today's draft test. It was never established by a passing original-renderer run and is not a historical performance contract.** Correcting that assumption does not erase the separately measured rendering cost. No timeout was changed during this investigation.

## Where the frame time went

CDP timeline traces measured the following. Force values are gravity / spring / tether; all three rows use the new renderer.

| Case | Forces | Settle time | Draws | Dominant synchronization |
| --- | --- | ---: | ---: | --- |
| Candidate | .025 / .5 / .02 | 37.662s | 402 | 28.384s in 401 `ReadPixels` calls |
| Old forces only | .01 / .25 / .01 | 64.371s | 529 | 51.965s in 528 `ReadPixels` calls |
| Candidate, GPU compositing enabled | .025 / .5 / .02 | 31.249s | 402 | 27.932s in GPU-thread `MakeCurrent` |

The candidate spent only 1.880s inside the JavaScript renderer wrapper and .319s in style/layout lifecycle phases. Deferred graphics work was paid at compositor synchronization. The trace's nested durations must not be added together. `ReadPixels` identifies where the wait occurs; it does not establish that copying pixels causes the whole wait. Enabling GPU compositing moved the wait into GPU-context synchronization while retaining SwiftShader. Browser launch flags therefore did not solve the underlying cost, and no persistent browser configuration changed.

## Synchronous draw measurements

On a settled scene, each sample called the real renderer and then read a pixel to require observable completion. Ten repetitions were run, discarding the first two. Camera, positions, radii and materials stayed fixed within each scene. Temporary geometry replacements and visibility changes were restored afterward.

| Mean milliseconds per draw | New renderer | Original renderer |
| --- | ---: | ---: |
| Whole scene, `gl.finish` only | 4.85 | 6.06 |
| Whole scene, one-pixel read | 78.14 | 38.61 |
| Whole scene, full-canvas read | 81.16 | 39.25 |
| Nodes only, one-pixel read | 66.39 | 16.04 |
| Wires only, one-pixel read | 29.36 | 30.71 |
| Empty scene, one-pixel read | 5.78 | 5.23 |
| Whole scene, spheres at 8 segments | 45.00 | 37.23 |
| Whole scene, spheres at 12 segments | 65.89 | 45.53 |
| Whole scene, spheres at 16 segments | 84.94 | 55.13 |

The earlier `gl.finish`-only timing missed deferred completion in this harness. A full-canvas read cost only about 3ms more than one pixel in the new scene. The controlled new-scene 8/12/16 comparison establishes sphere tessellation as a substantial cost: 36,846 / 80,166 / 141,726 triangles, respectively, with the same visible subjects and two draw calls. Component timings are not additive.

The original bundle was served from the preserved `before/` preview, using candidate force settings. It contained 871 nodes and 2,036 wires versus 876 and 2,046 in the new bundle; camera, layout, visible sphere count and wire rendering also differed. Its 36.950s initial settle had no frame counter. These are **not pixel-matched old/new comparisons**: neither the full difference nor a precise wire speedup can be attributed to renderer architecture. Within-scene tessellation comparisons are the stronger evidence. These software-renderer measurements do not predict hardware GPU performance.

## Reproducing the final verification failure

The full verification run exposed existing 25-second waits in navigation and identity tests, distinct from the new wire test's draft budget. The exact isolated bundle was served on port 8768: 877 documents, 876 rendered nodes, `graph.ts` focused, viewport 1280×720, canvas 1019×670, `localMap.searchStarts=0`, final appearance defaults .45/.9/.9, and Playwright tracing with screenshots/snapshots enabled. Only sphere tessellation changed in the comparison.

| Sphere segments | Initial settle | Draws | State at 25 seconds |
| --- | ---: | ---: | --- |
| 12 | 31.538s | 451 | Busy, 352 draws |
| 8 | 25.650s | 451 | Busy, 449 draws |
| 12, repeat | 33.270s | 451 | Busy, 337 draws |

All three runs finished with exactly identical physical node positions and camera position, and no browser errors. On the same settled scene, controlled draw-plus-one-pixel-read samples measured 42.64–46.70ms with 12 segments and 31.54–32.47ms with 8. Triangle counts were 83,388 and 38,396; both used two draw calls. The eight-segment run's separate microbenchmark labels were invalid because its initial geometry override remained active; these draw-cost ranges use only the two valid twelve-segment runs.

For comparison, the main preview's slightly different 878-document bundle at 1280×800 settled in 12.343–13.952s and 203 draws. That comparison changes both bundle and viewport; it does not isolate which difference caused the convergence change. The matched 8/12 runs establish that tessellation changes rendering cost without reducing convergence work. Even 8 segments did not reliably satisfy 25 seconds. Root chose to retain the visually selected 12 segments and correct functional test waits, rather than select geometry to satisfy this wall-clock threshold. This investigation did not change those tests.

A subsequent main-scene check on the isolated bundle observed zero additional draws across 750ms of idle time. Incrementing node resistance, wire resistance and wire thickness each caused exactly one draw, followed by zero additional idle draws. Input-to-observed-frame times were 143/111/154ms. Physical positions, camera and busy-state history stayed unchanged; no browser errors occurred. These checks establish absence of continuous redraw or reheating, not a comparative input-latency benchmark.

## Adaptive-detail prototype, not adopted

Splitting transparent spheres into separate detail meshes loses global back-to-front order when depths interleave. Three 0.186.1's `BatchedMesh` can preserve that order across different geometries, with stable instance IDs, matrix textures, and native RGBA via `setColorAt(id, Vector4)`. A browser-free prototype verified sorting, detail changes, uploaded Float32 matrix/RGBA getters, per-geometry bounds, culling, growth/recycling and disposal. Sorting/culling 876 instances took about .15ms median, excluding GPU work. A future observation helper would need per-geometry bounds and the RGBA getter, not the combined geometry's bounds or the old opacity attribute.

On the main preview's fixed `graph.ts` scene, identical 12-segment batched rendering differed from the current raster in only 84 of 3,057,000 channels, each by one byte. The camera and physical layout were unchanged. Current instancing cost 39.01–40.58ms per completed draw; uniform batched spheres cost 40.57ms. Selecting 8 segments under a conservative quarter-CSS-pixel surface-error bound reduced only 18 of 243 visible spheres and cost 39.75ms. A half-pixel bound reduced 168, retained 12 for the other 75, and cost 34.44ms. These modest gains did not justify adopting a different renderer for the observed test failure.

`WEBGL_multi_draw` was available in the measured context. Three's fallback submits one draw per visible sphere. A forced-unavailability experiment was invalid: hiding the renderer extension API left the driver macro defined, so the fallback shader failed to compile. Its timings are excluded. Any future implementation must preserve the existing instanced path where multi-draw is unavailable and measure that case properly; it must not introduce hundreds of draws there.

The temporary evidence directory is `/tmp/live-docs-connections-tuning-20261024/`. Initial evidence uses `trace-frames.cjs`, `benchmark-readback.cjs` and their trace/benchmark JSON files. Later evidence uses `batched-spheres-prototype.mjs`, `batched-spheres-browser.cjs`, `isolated-settle.cjs`, `appearance-idle.cjs`, their JSON reports and isolated-settle Playwright traces. The durable findings above remain meaningful without these disposable artifacts. No adaptive renderer, product source change or test-budget change was made by this investigation; final verification remains the root agent's follow-up.
