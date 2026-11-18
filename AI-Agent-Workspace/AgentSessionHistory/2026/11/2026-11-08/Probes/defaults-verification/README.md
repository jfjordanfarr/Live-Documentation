# Defaults verification: rendering, search and hover

_Historical diagnostic evidence, captured November 8, 2026. Type binding, the solver and contained-sphere fidelity have passed focused review; normal large-scene settling and the complete gate remain failing at this checkpoint. These findings support the [current root record](../../../ChatHistory/2026/11/2026-11-08.1.record.md); they are not a claim of owner acceptance or full verification._

The third complete gate passed 1,718 unit and 115 integration tests, then 328/345 browser cases. The record preserves all 17 stopping points. This probe retains the unique measurements behind the subsequent corrections. Both builders used one browser/CPU lock; root remained browser-idle during measurements.

## Fixed inputs and provenance

The diagnostic comparisons use the saved gate's 950-file payload, SHA-256 `befc6ffb5a02c9dc0e421fd6ea3791bf3ffb5666413038d52d4816ec8b52fda4`. Its original JavaScript hash is `49756c8d897600b1e0ef06adf77e945bf9d2d1cdfaae5346f43ab0f4866bdc0c`. This prevents later type-binding changes to graph edges from explaining a renderer or solver improvement. The old-renderer control uses source at `5b610371` with the same payload and explicit view settings.

The [capture manifest](capture-manifest.json) gives each retained file's original byte count and SHA-256. Compressed JSON and CPU profiles decompress to those exact source bytes. The retained diagnostic scripts are historical captures with their original temporary paths, not installed project commands. The original solver can be recovered from `5b610371:packages/explorer/src/client/views/localView/network-simplex.ts`; its [recorded hash](search/solver-original-provenance.json) was checked against those committed bytes. Generated site bundles and source maps remain temporary and are not duplicated here.

## 3D drawing attribution

On a fresh generator.ts Connections/Skin/one-hop view at 1280×800, the [frame profile](drawing/frame-profile.json) records 197 frames over about 60.5 seconds, averaging 308.7 ms between frames. Mean measured animation CPU was 8.27 ms: physics 1.56 ms, drawing submission 4.22 ms, names/focus 1.72 ms and body work 0.33 ms. All 129 nodes were shown and packing was empty; motion was still progressing. Main-thread CPU time was 3.18 seconds over 61.7 seconds wall time. The software renderer's GPU process was heavily occupied.

The submitted drawing contained about 255,290 triangles. Its 829 contained-file sphere meshes accounted for 218,856 triangles, alongside 18 balloons. A [full-sphere frustum check](drawing/visibility-profile.json), retaining near-plane and edge intersections, found 272 then 441 of those file spheres intersecting the view at two observed moments. Offscreen removal alone cannot solve a full Fit with most files visible.

The [layer attribution](drawing/frozen-layer-profile.json) deliberately pauses motion at one pose and temporarily hides layers. These are diagnostic pictures, not product alternatives or evidence of settling. The baseline and restored images were byte-identical, and the temporary routing/visibility/freeze changes were removed.

| Fixed-pose drawing | Measured frames/second | Submitted triangles |
| --- | ---: | ---: |
| All layers | 3.10 | 256,604 |
| Contained-file spheres hidden | 9.77 | 37,748 |
| Balloons hidden | 3.57 | 243,644 |
| Outer skins hidden | 3.52 | 248,400 |
| All interiors and skins hidden | 25.98 | 16,584 |

This identifies the contained-file meshes as the largest cost in that view. It does not establish adequate performance for Whole or the bare graph. The next bounded prototype uses a ray-intersected sphere behind a two-triangle primitive, with full contents, radius, front-side clipping, surface depth, colors and lighting preserved. Independent native-sphere references and root visual/motion review are required before acceptance; no physics or settling change follows from these measurements.

### First sphere prototype: edge coverage sent back

The [first prototype measurements](drawing/sphere-first/sphere-main-prototype.json) compare the same deliberately frozen repository pose: 3.37 to 6.32 fps, and 256,604 to 39,406 triangles. Root viewed the matched [native](drawing/sphere-first/sphere-main-native.png) and [analytic](drawing/sphere-first/sphere-main-analytic.png) pictures: contents and placement are retained. This does not prove acceptable settling.

The [estate reference readings](drawing/sphere-first/sphere-estate-reference.json) compare the analytic mark with an independent 96×64 native sphere mesh (12,096 triangles per mark), holding uploaded matrices, colors and lights. Camera distance/offset and near/far planes deliberately exercise the surface. Labels are held during these GPU diagnostics; these are not normal interface journeys. Root viewed every pair below.

| Case | Native high-resolution reference | First analytic prototype |
| --- | --- | --- |
| Close | [Reference](drawing/sphere-first/sphere-estate-close-reference.png) | [Prototype](drawing/sphere-first/sphere-estate-close-analytic.png) |
| Off axis | [Reference](drawing/sphere-first/sphere-estate-off-axis-reference.png) | [Prototype](drawing/sphere-first/sphere-estate-off-axis-analytic.png) |
| Near-plane annulus | [Reference](drawing/sphere-first/sphere-estate-near-cap-reference.png) | [Prototype](drawing/sphere-first/sphere-estate-near-cap-analytic.png) |
| Front surface fully clipped | [Reference](drawing/sphere-first/sphere-estate-front-clipped-reference.png) | [Prototype](drawing/sphere-first/sphere-estate-front-clipped-analytic.png) |
| Camera inside | [Reference](drawing/sphere-first/sphere-estate-inside-reference.png) | [Prototype](drawing/sphere-first/sphere-estate-inside-analytic.png) |
| Far-plane cap | [Reference](drawing/sphere-first/sphere-estate-far-cap-reference.png) | [Prototype](drawing/sphere-first/sphere-estate-far-cap-analytic.png) |

Front-clipped and camera-inside pairs are pixel-identical, preserving native FrontSide behavior without substituting a back intersection. The annulus keeps its hole. However, the analytic silhouette and depth-cut rims have visibly harder pixel steps than the native antialiased reference, most clearly at close zoom and on the annulus/far cap. Root withheld static visual acceptance and requested edge-focused coverage comparisons that preserve actual opacity/depth interaction. Whole-image mean difference is insufficient to judge this localized defect. Transition capture must also preserve the clipped hole rather than filling a convex disk. Five bounds tests pass; an invalid infinite-camera test fixture was corrected to a valid finite matrix for an infinite far plane, without changing its expected behavior.

The [actual capability probe](drawing/sphere-capabilities.json) records a four-sample context exposing `OES_sample_variables` and `OES_shader_multisample_interpolation`. A sample-ID shader compiles when its extension is enabled before precision declarations. A late directive fails; normal Lambert shader injection puts it too late. The next authorized prototype uses explicit raw-shader bindings with Three's existing Lambert chunks/uniforms and actual per-sample hits, retaining native mesh compatibility where the extensions are absent. Runtime coverage, lighting/encoding, translucent overlap, shifted-lens and eye-plane-crossing cases and cost remain to be verified. No alpha smoothing or alpha-to-coverage was accepted: combining coverage with existing blending can change effective opacity, and full-sample depth writes at a partial rim can hide later transparent layers. If this path does not retain useful performance, projected geometric contours remain an experiment rather than a chosen replacement.

## Per-sample spheres: static acceptance and normal motion

The [static provenance](drawing/sphere-per-sample/contained-sphere-static-provenance.json) records held camera/pose conditions, source hashes and independent native references. The material uses actual sample-level rays and depth with Three's Lambert shader chunks and existing transparency/order. Unsupported sample extensions, tone mapping or output encoding retain the native mesh. The actual combined interpolation/sample-ID runtime probe resolves one of four red samples to 64/255.

In the [held main comparison](drawing/sphere-per-sample/per-sample-sphere-main-prototype.json), native, per-sample and restored native rendering measure 3.19, 5.17 and 3.14 fps. The [native](drawing/sphere-per-sample/per-sample-sphere-main-native.png), [candidate](drawing/sphere-per-sample/per-sample-sphere-main-analytic.png) and [restored](drawing/sphere-per-sample/per-sample-sphere-main-restored.png) pictures retain the same contents. These are fixed-pose measurements, not settling results.

Root reviewed the shader/source tests and personally viewed the matched close/off-axis, near/far clipped, shifted-lens, eye-plane-outside, overlapping and fallback views retained in this directory. The [estate readings](drawing/sphere-per-sample/per-sample-estate-reference.json) retain eleven cases. The [close-edge enlargement](drawing/sphere-per-sample/per-sample-close-edge-comparison.png) shows the original quad's hard staircase corrected: mean maximum-channel edge error 5.80→0.75, interior maximum one. The [finer native reference](drawing/sphere-per-sample/high-res-estate-reference.json) and [convergence strip](drawing/sphere-per-sample/high-res-near-cap-convergence.png) reduce near-annulus edge disagreement 5.923→1.555 when native tessellation increases 96×64→192×128, preserving the clipped hole.

The [four-sphere overlap readings](drawing/sphere-per-sample/per-sample-estate-interleaved-overlap-skin.json) preserve opacity 0.75 and actual skin/order. Only three of 106,653 interior pixels differ by more than three channels, with maximum five and mean 0.0633; individual silhouette masks correct an earlier union mask's misclassification of internal rims. Matched [native](drawing/sphere-per-sample/per-sample-estate-interleaved-overlap-skin-reference.png) and [per-sample](drawing/sphere-per-sample/per-sample-estate-interleaved-overlap-skin-analytic.png) pictures remain available. The [unsupported-path check](drawing/sphere-per-sample/sphere-fallback.json) has zero differing channels across 35 instances; its [native](drawing/sphere-per-sample/sphere-native-compatibility.png) and [fallback](drawing/sphere-per-sample/sphere-fallback-compatibility.png) pictures are identical.

Root accepted this static fidelity and then personally completed the [normal Skin/Cloud camera and perspective journey](../../../Screenshots/2026-11-08/contained-spheres/README.md) on the activated served build. No scene freeze, route substitution or plane manipulation was used there. The primary's separate [motion provenance](drawing/sphere-per-sample/contained-motion-provenance.json) explains the controlled near-plane capture test. That test exposed a native fallback carrier defect: an old convex hull filled the clipped hole. Actual uploaded front-facing triangles now preserve it, with independent Three Raycaster tests; the [old filled carrier](drawing/sphere-per-sample/native-contained-motion-old-hull/clip-back-moving.png) and [corrected carrier](drawing/sphere-per-sample/native-contained-motion/clip-back-moving.png) retain the failure and repair. These separate runs have their own poses, so they are not a pixel-identical comparison.

The [normal arrivals](drawing/sphere-per-sample/contained-normal-arrivals.json) and [dynamic readings](drawing/sphere-per-sample/contained-dynamic-arrivals.json) still fail the original 60-second main-generator settling requirement. Native and analytic controls are available in 2.85 and 2.34 seconds, but both remain in motion. The repeated diagnostic reaches 251 revisions/187 draws for native and 272/208 for analytic, with all 129 members revealed and empty packing queues, despite reducing triangles 255,290→38,092. The fixed-pose gain has not established adequate dynamic performance. An early/late drawing-cost investigation remains open; no physics, force, timing, threshold, content or test deadline change has been selected. Whole and the bare graph also require their own checks.

The [late-frame attribution](drawing/sphere-per-sample/quad-cost-compact.json), [raw uploaded data](drawing/sphere-per-sample/quad-cost-raw.json.gz), [capture script](drawing/sphere-per-sample/quad-cost-probe.cjs) and [analysis script](drawing/sphere-per-sample/quad-cost-analyze.cjs) identify avoidable empty drawing. Across all sixteen shared full-reveal revisions 101–250, native and analytic runs have identical uploaded centers, radii, alpha, projection and view matrices. They retain all 829 contained files and use the same gate3 payload, Skin/one-hop settings, 1019×750 backing canvas and DPR one. Root read the complete scripts, aggregate comparisons and selected early/late per-instance cases, not every raw coordinate.

| Motion revision | Eye-plane-crossing spheres wholly outside the frustum | Submitted quad area, in viewport equivalents | Area proved empty |
| --- | ---: | ---: | ---: |
| 110 | 0 | 0.2715 | 0 |
| 150 | 0 | 0.2764 | 0 |
| 200 | 2 | 2.2957 | 2 |
| 250 | 3 | 3.2996 | 3 |

At revision 250, three real WebForms files lie more than 200 view-space units off-axis, with radii between three and five. Crossing the eye plane makes their conservative quad expand to the full viewport even though the entire sphere is outside the frustum. The three empty quads cover 2,292,750 pixel positions before sample-level shading. These summed areas measure overdraw, not the union or visible sphere coverage. Early revisions 110→150 measure 2.50 fps native and 4.75 analytic; late 150→250 measure 2.74 and 2.68. Root authorized conservative whole-sphere rejection against all six planes before expansion, retaining intersecting spheres and existing rendering/physics. This diagnoses avoidable work; it does not prove that the forthcoming correction satisfies 60-second settling or account for every native-rendering cost.

The manifest retains the independent reference/probe source and hashes. Those scripts use their original temporary paths and are historical evidence, not installed tooling. First-quad comparisons above remain unchanged. No browser regressions or full-gate pass are implied by this visual acceptance.

Cleanup also retained the root's [earlier normal-journey recording](drawing/sphere-per-sample/root-early-wait-trial.webm), whose harness could mistake the period before a transition overlay appeared for its completion. Its early return stills were replaced, and acceptance uses the corrected normal journey linked above. The earlier recording is provenance of the harness error, not evidence of a persistent title defect. Additional builder/root scripts and complete before/after dependency inspection outputs are retained by hash in the manifest; an empty file from a failed preliminary query was discarded rather than promoted as evidence.

### Frustum correction: unchanged pixels, settling still open

The actual vertex shader now rejects only whole spheres outside a projection plane, with a conservative float32 allowance. Frozen carrier projection retains offscreen geometry because the transition can translate it back into view. Root removed an unused TypeScript copy of the bounds formula and its tests after confirming that only those tests consumed it; actual GPU comparisons and independent native geometry must protect the shader itself.

The [held comparison](drawing/sphere-per-sample/frustum-held-comparison.json.gz) exercises actual scene revisions 110 and 250, switching old shader → corrected shader → old shader while keeping all 829 instances, order and camera fixed. Root read all scalar fields, reviewed the source change, viewed the late [before](drawing/sphere-per-sample/frustum-held-250-before.png) and [after](drawing/sphere-per-sample/frustum-held-250-after.png) pictures, and independently verified byte-identical PNGs for all three modes at both revisions. The raw matrices are retained; root did not manually read every coordinate. At revision 250, measured drawing improves 2.09→5.27→2.09 fps. Early revision 110 varies 6.21→5.31→5.37, so it does not establish an early-frame gain. Each window includes a final verification draw/readback; these remain controlled held-pose observations.

The subsequent [unmodified normal arrival](drawing/sphere-per-sample/frustum-normal-arrival.json), on the exact gate3 graph without routes/freezes, still reports busy at 60.027 seconds. It draws 318 frames and retains 829 contained files, with 38,092 submitted triangles; focus and tuning controls are available at 1.593 and 1.640 seconds. The [final normal picture](drawing/sphere-per-sample/frustum-normal-generator-analytic.png) records that failed journey. This is useful drawing progress, not a passing settling result. The existing helper is investigating the established simulation/render scheduling contract read-only before any timing or ordinary-node change is selected.

The subsequent source/history audit confirmed the existing deliberate frame-based reveal and partial-physics policy; no independent timer was lost. Root retained it for this round. The [post-frustum layer attribution](drawing/sphere-per-sample/post-frustum-layer-profile.json) holds revision 250 and changes visibility only for diagnosis. Baseline drawing is 6.388 fps; hiding 55 ordinary nodes gives 7.183, hiding 18 nested balloons gives 9.097, and hiding 829 contained files gives 8.984. Restorations measure 6.036, 6.274 and 5.977 and all reproduce the baseline RGBA exactly. The [script](drawing/sphere-per-sample/scripts/contained-layer-after-frustum.mts) preserves the measurement. These pictures are not proposed content reductions. Ordinary-node replacement would also need a new correct picker, so root bounded this round at the verified contained-file correction.

### Actual GPU and carrier regressions

The [final browser attachments](drawing/sphere-per-sample/contained-browser-final-results.json) record four passing cases in 33.7 seconds: supported and native-compatible GPU comparisons, and both directions of clipped carrier travel for each backend. Sixteen native-reference poses per backend cover side intersections, near/far clipping, shifted lenses, visible/offscreen eye-plane crossings, eye-inside/behind and translucent overlap under the actual skin. The supported reference uses 192×128 native geometry; the compatibility reference uses the existing twelve-segment sphere and is pixel-identical. Explicit native geometry/material guards prevent a future ordinary-node change from silently making the analytic renderer its own oracle.

The carrier tests establish an actual GPU hole and three distinct target-specific rim points, then require the nine hole pixels to stay clear and all three rims to remain visible while the canonical directory label travels. Root reviewed the failed pictures and found that rounding a pixel-center coordinate as an index shifted the probe toward the rim. Floor indexing corrected the test, with its original 0.9-radius camera cut, phases, color/opacity checks and deadlines retained. The independent skin raster anchor differs from the initial label anchor by −0.000151 pixels horizontally and +0.53 vertically, within its one-pixel guard. A [temporary wider-hole trial](drawing/sphere-per-sample/contained-browser-fourth-pass-attachments.json) is preserved as investigation, not the final fixture. The final spec was not run against the old convex-hull asset; the old filled-hole defect is established by the separate preserved native motion pictures above. No negative-control run is invented.

## Generated graph verification

After build and regeneration, the [semantic edge comparison](graph/semantic-diff.json) contains 954 files and 6,971 distinct edges, versus the saved gate3 graph's 950 and 6,943. Four real source/test files are added; no file is removed. Six false Three Camera edges and one false Three Scene edge are gone. Ten Shape/Reach/Placed references now target their actual internal origins, three Models namespace references are newly correct, and 637 previously correct internal typed edges remain. Root read the complete changed-edge lists and checked the generated external Camera text beside the retained real world-map Camera links. The graph remains derived from the Live Docs; there is no name blacklist or private runtime override.

The final complete run, gate five, passed lint/build/typechecking, all 1,740 unit tests, all 115 integration tests and documentation audits, then **345 of 350 browser cases** in 1.1 hours. It exits one. The preceding attempt stopped before tests on four import-order lint errors; those were corrected with regeneration unchanged. The [complete log](gate5/full-gate.log.gz), [source hashes](gate5/source-sha256.json) and [asset hashes](gate5/asset-sha256.json) preserve the exact result. Main data is SHA-256 `f26ab52b9149832440eb3f27af582fc1e61060c576f3a6a66d63e8c681fe244e`; client JavaScript is `596fbc8e254e7c8205111ce9173ebdeb4232ee5f1ccba01c70d9259335779079`. Unlike the controlled performance probes, this run uses the newly corrected graph, so its timings measure the combined change.

All new defaults, Whole, correspondence and actual-GPU/carrier cases pass. The formerly failing Off/two-hop seed-growth, main arrival, manual-pan/wheel round trips, controlled history growth, absent-file reverse travel and hidden view-switch cases also pass. Five timeouts remain; the complete source traces, exact error messages and available failure pictures are retained under [gate5/failures](gate5/failures/), with hashes in the capture manifest:

| Case | Actual stopping point | What the evidence does not establish |
| --- | --- | --- |
| Whole update | Initial busy wait exceeds 150 seconds, before update assertions; same stopping point as gate three. | Busy state alone does not establish actual motion or a failed update control. |
| Shared historical address | Total 30-second case budget expires after reloading step two, before missing-commit/return assertions. | No trace console or page errors; the frozen fixture has eight files. This does not identify the settling cause. |
| Historical drag | Home's initial busy wait exceeds 60 seconds, before a drag. | Four ReadPixels stall warnings are not a diagnosis. No console errors, shader errors, page errors or crashes were recorded. |
| Repository/chain diagram capture | Total 30-second case budget expires inside the synchronous capture evaluation; about 12.19 seconds had already elapsed at issuance. | Issuance is not callback entry. No failure screenshot exists; the last trace JPEG is only 289 ms after issuance. |
| Page visibility | Completion wait actually exhausts 45.076 seconds after visibility restoration. | Pause retention is proved (91 cards, tried one/next two), but final camera/card/search flags and counters were not recorded. |

Root viewed the four available failure screenshots and the last layout-capture trace JPEG, without treating the latter as a picture at failure. The existing helper audited trace/source evidence read-only; no changed deadline or inferred environmental excuse follows. After the complete run, the primary made bounded capture-phase and visibility-state observations on the frozen tested build, preserving the original assertions, limits and 80/80 search settings. Those follow-ups cannot turn this failed full run into a pass.

The [focused measurements](gate5/focused/summary.json), [commands/results](gate5/focused/run-results.json), [capture events](gate5/focused/capture-events.json) and [visibility events](gate5/focused/visibility-events.json) retain those observations. Capture passes alone in 23.8 seconds, with 102 cards and 711 rows. Its callback starts 11 ms after issuance and takes 11.746 seconds, of which 11.637 is the card loop; measured row/preparation work is 4.933 seconds and repeated constant probes 3.201. The gap from callback's pre-return marker to the host result is 2.593 seconds, covering serialization/transport. This identifies costs in that passing run; it does not establish which phase exhausted the failed full-run budget.

Visibility fails again. Camera and cards are still; search is the measured blocker. At 44.999 seconds after resume, all 80 seeds are tried and 99 alignment trials completed, with search running. The actual deadline callback executes at 45.064 seconds with 100 alignments; a final reading at 45.120 seconds has 101. A later mutation reports capped at 45.606 seconds with 109 alignments, 29 seed adoptions and 25 alignment adoptions, shown/best score both 2,490,598. The 45-second requirement remains failed. Temporary observers are restored byte for byte; the [original](gate5/focused/original-helper-sha256.json) and [restored](gate5/focused/restored-helper-sha256.json) hashes agree, as do all 94 served assets and 97 product paths. The retained driver and diagnostic patches are historical observations, not installed test instrumentation.

Root accepted the bounded round for integration with these limits recorded. The [builder handback](builder-handback.txt) preserves its final report and temporary-path inventory as received. Further ordinary-node picking, simulation-clock changes, typography, grouped-content counts/legend and the remaining settling work are outside this delivered round.

## 2D search: exact solver bookkeeping

The original search profile completes its unchanged 80 starts and 79 alignment trials in about 57.6 seconds. Network-simplex ranking accounts for 36.73 seconds inclusive; tree rebuilding and cut values together account for 40.5% of the full profile. Pause/resume and retention of all 91 cards work correctly. The [original CPU profile](search/search.cpuprofile.gz) and [source-mapped aggregation](search/profile-source-summary.json.gz) preserve the attribution.

The correction updates the two exchanged tree edges, reuses invocation-local scratch and computes immutable node balances once. It preserves sorted traversal, arithmetic and tie order, pivot limits, exact positions, cost and optimality. The existing independent enumeration oracle remains intact.

- [Captured real solver inputs](search/real-solver-inputs.json.gz), [comparison script](search/compare-solvers.ts) and [complete exact-output result](search/solver-equivalence.json.gz): all 436 cases agree, including 24 real calls, 400 seeded cases and 12 all-zero variants; input constraints are unchanged. Root checked the aggregate, script and original-source hash, not every output coordinate manually.
- Six focused files passed 87 tests. Strict TypeScript checking passed.
- Only the solver was substituted in the frozen JavaScript for the [browser comparison](search/comparison-summary.json), as described by its [provenance](search/candidate/provenance.json). Static server files and the graph payload stayed unchanged.
- Both original pause/visibility tests passed with 80/80, the 60-second global limit and 45-second search-rest requirement: 50.2 and 45.1 seconds total respectively. These are the unchanged tests in [local-map-hidden.spec.ts](../../../../tests/e2e/local-map-hidden.spec.ts).

| Matched observation after visibility restoration | Original | Solver candidate |
| --- | ---: | ---: |
| Time to completed configured search | 55,585.2 ms | 36,853.2 ms |
| Seed / alignment trials | 80 / 79 | 80 / 79 |
| Seed / alignment adoptions | 17 / 14 | 17 / 14 |
| Chosen seed | 10 | 10 |
| Shown / best score | 2,432,088 / 2,431,960 | 2,432,088 / 2,431,960 |
| Placement cost; optimal | 997,218; true | 997,218; true |
| Retained cards | 91 | 91 |

The [final candidate picture](search/candidate/finished.png), personally viewed by root, is pixel-identical to the original at 1600×1000: zero different RGBA pixels. The [candidate CPU profile](search/candidate/search.cpuprofile.gz) and both [original](search/measurements.json.gz) and [candidate](search/candidate/measurements.json.gz) readings remain available. These are measured runs, not a universal performance guarantee. Before/after source dependency inspection has 71 inbound reached files, three direct, observed depth five.

## Unpin does not end an ongoing hover

The [stable-hover diagnostic](drawing/unpin-hover.json) reproduces the direct-label test's failure at its original 1280×720 viewport. Clicking removes Estate.sln's own pin and moves it to the dim frontier, but the pointer remains on its label; hover correctly keeps opacity at 0.75 through the five-second poll. A real move to a proven empty canvas point clears hover and gives 0.3000000119 opacity, without another click. There is no focus-visible keyboard target in either state.

Root read the complete measurements and viewed both [hover retained](drawing/unpin-stable-hover.png) and [pointer departed](drawing/unpin-after-empty-point.png). The test correction adds that pointer departure before asserting dimming; it keeps the pin-state and less-than-0.5 assertions and leaves product hover behavior unchanged.
