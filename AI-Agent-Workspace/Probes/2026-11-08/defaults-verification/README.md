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
