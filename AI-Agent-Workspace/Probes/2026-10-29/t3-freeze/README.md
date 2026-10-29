# T3 3D responsiveness — October 29, 2026

Historical diagnostic and repair record. Triggered by [the owner's failed interactive trial](../../../ChatHistory/2026/10/2026-10-29.1.record.md#turn-3) of the October 28 T3 bundle. The bounded rendering repair passed the full gate; the broader control-system design and large-scale settling remain open.

The preserved bundle is served through the existing Explorer task on port 8900. The root entered its Connections/3D view with Show Tests enabled and no pins, before receiving the owner's exact four-pin URL. This is a larger workload than yesterday's tests-hidden measurement. It reproduces severe stuttering, not yet the exact reported freeze.

The integrated Chromium browser reports hardware acceleration through ANGLE/D3D11 on an NVIDIA RTX 3090, at 1065×622 and device pixel ratio 1. These measurements are not SwiftShader results. [The two CPU-profile summaries](browser-profile.json) retain self-times, sampled functions, main-thread long tasks and the environment reading. They are summaries of Chrome's program profiler, not agent traces.

- A 30.899-second sample observed animation gaps up to 1,683.5 ms and repeated main-thread tasks around 650–770 ms. The timing observation began before this sample, so those maxima describe the observed opening/settling session rather than only this profile window.
- A 21.517-second sample puts 3,728 ms of self-time in the per-mesh callback of `drawSpatialGraphOnChange`; garbage collection accounts for 1,274 ms. Scene traversal, matrix composition, native link updates, batching and projected names occupy much of the remainder. The physics tree walk is a smaller cost.
- The served bundle's zero-based line 5987, column 6159 corresponds to the draw guard's fresh per-mesh snapshot arrays and Map. Line 4943, column 25041 is the library's link-position update; line 6026, column 36893 is name projection. These were mapped back to the checked-in source rather than guessed from minified names.

The 10 ms setting bounds one portion of the physics work; it is not a bound on the complete animation frame. The page still repeatedly traverses and updates the native scene, and the draw guard builds a complete fresh snapshot even when a paced physics part has not yet moved any positions. Determining which of those passes can be removed without changing the picture or interactions is the next diagnostic step.

The initial profiler helper failed because its host lacks a global timer; the two successful samples use Playwright's wait. No failed helper is counted as product evidence. The owner's precise freeze symptoms and URL were requested asynchronously and remain pending at this checkpoint.

## Candidate observations

[Frame observations](frame-observations.json) preserve the subsequent samples. The baseline and first candidate used the original visual settings; the later candidate uses wire resistance 0.2 after the owner's density finding. These sample different moments of settling and framing, so they are indicative workload observations, not a matched-state speedup benchmark.

- Baseline, 27,823 nodes / 80,108 links: 24 animation frames in 9,467 ms while moving; after explicitly stopping physics, 37 in 9,970 ms. A stationary scene was still expensive.
- First candidate: 84 frames in 9,962 ms while moving; 364 in 10,007 ms after stopping physics. Every one of 100 sampled positions moved during the live interval.
- A following first-candidate trace measured 107 native engine calls taking 5,404 ms, but just one actual WebGL pass, 289 ms, with 255 ms in batch preparation. This motivated retaining batch classification and removing the inert link force.
- Latest candidate, physics running: 120 frames in 10,261 ms, median gap 83.3 ms, p95 100.1 ms, maximum 383.3 ms. All sampled positions changed and the full graph remains. This is not a 60 fps claim.

The code changes preserve the force settings and membership: actual position/appearance revisions govern redraw, labels and picking; unchanged wire endpoints retain their transforms; batch classification and working lists are reused; link endpoints bind on membership changes rather than through a zero-strength spring force every frame; camera bounds avoid per-sphere vector allocations. The full gate passed 1,452 unit, 113 integration and 208 browser tests, with one worker and no browser retries. No timing limit or correctness assertion was relaxed. Manual inspection, pinning and recentering worked on the full T3 scene; a reader overlay intercepting a Pin attempt and a later stale hover target were recorded as unsuccessful attempts rather than counted as passes.

The T3 bundle under `dist/explorer/samples/t3-code-today/` now carries the verified client (SHA-256 `d19f0eec57804188ac6cbd5ac18be141ef06426f1fdbee0a248a3ddcda0ccf8d`). Its original data is unchanged (SHA-256 `6095f16ca601805d33e1301a043faba5af0a8bf5a31b03957b3b1d002ec00f97`). The diagnostic page was replaced with a fresh page without observation hooks or a forced pause. The earlier portable ZIP remains the historical October 27 deliverable, not this updated client.

A targeted [layout-preservation comparison](layout-preservation.json) checked the old and new headless implementations on a pair, ring, high-degree star, disconnected graph and staged 512-node reveal. Positions, velocities, tick counts and stillness matched exactly through the chosen bounds. This checks preservation against the previous implementation, not independent accuracy. One ring had not settled within 250 ticks in either version; it was not called converged. The fresh T3 page's compact early placement is a live startup state, not the mature organic overview shown after the longer earlier run.

## The visual question

The [pictures](../../../Screenshots/2026-10-29/README.md) exposed a second problem. Lower wire resistance, with unchanged positions and camera, made the dense web visible. Fit then showed all spheres instead of the 3,863 previously in frame. The owner liked the overall structure but asked whether the 3D parameters themselves need different definitions, normalization or dynamic tuning against competing objectives ([Turns 5–7](../../../ChatHistory/2026/10/2026-10-29.1.record.md#turn-5)). No new default or adaptive algorithm is selected. The agent had deliberately paused physics for the appearance comparison and disclosed that when the owner questioned the stillness; it is not evidence of a settled layout or another freeze.
