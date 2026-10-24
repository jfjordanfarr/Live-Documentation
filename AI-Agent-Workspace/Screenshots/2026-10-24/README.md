# 3D wire and node sizing — October 24, 2026

Historical visual experiment requested in [Turn 9](../../ChatHistory/2026/10/2026-10-24.1.record.md#turn-9) and [Turn 10](../../ChatHistory/2026/10/2026-10-24.1.record.md#turn-10). Chromium, 1600×1000 CSS pixels, DPR 1. The candidate has count-weighted screen-space wires: a 1 CSS-pixel baseline, growing gently to at most three times that for code references. The cache supplied all 640 history commits; these captures show today's graph, 873 files before the default asset filter.

## Node comparison

Both treatments use the same settled node positions and the same camera at each distance. Perspective nodes use the product's native sphere radii. The temporary constant-size experiment interprets those radii as CSS pixels, preserving exposed-surface size ratios: the median radius is about 5 pixels. It changes only rendered node scale through a browser probe, without changing forces. It is not a shipped setting. Labels still follow the product's existing perspective-based selection and placement, so these pictures do **not** establish a completed label treatment for constant-size nodes. Wire shading and node depth rules are the same in each pair. No browser errors were reported.

| View | Perspective nodes | Constant-size nodes |
| --- | --- | --- |
| Whole graph arrival | [Perspective](overview-arrival-perspective.png) | [Constant](overview-arrival-constant.png) |
| Whole graph, pulled back | [Perspective](overview-far-perspective.png) | [Constant](overview-far-constant.png) |
| Generator neighbourhood arrival | [Perspective](generator-arrival-perspective.png) | [Constant](generator-arrival-constant.png) |
| Generator neighbourhood, closer | [Perspective](generator-near-perspective.png) | [Constant](generator-near-constant.png) |

Root's observation: constant-size nodes reveal distant files and prevent near spheres from obscuring large areas of a neighbourhood. When pulled far back, they pile up into a dense cluster. The owner subsequently selected [independent continuous resistance](../../ChatHistory/2026/10/2026-10-24.1.record.md#turn-11) so both endpoints and intermediate treatments can be tried; the temporary comparison was superseded by those public controls.

## Wires in motion

- [Orbited overview](screen-overview-orbit.png): same screen-space wire treatment, with perspective nodes.
- [Closer after orbit](screen-overview-closer.png): the wires retain their apparent widths. The stills document positions reached with normal mouse orbit and wheel input; they do not replace a frame-by-frame motion audit.

These are development captures before final regression verification. Final validation and any revised defaults will be recorded below.

## Sphere detail and the selected Connections treatment

The first force comparison used the earlier 873-document bundle, 872 visible files, before the integration repair. All four use node resistance .25, wire resistance .9, thickness .9 and a fitted camera at 1600×1000. These preserve the visual basis for the subsequent selection; they are not pixel-matched against the final 878-document build.

| Gravity / spring / tether | Capture | Root's judgment |
| --- | --- | --- |
| .01 / .25 / .01 | [Baseline](connections-forces-baseline.png) | Many overview nodes remain small. |
| .01 / .75 / .02 | [Stronger spring](connections-forces-wide.png) | Compact groups, with a pinched central projection. |
| .025 / .5 / .02 | [Selected balance](connections-forces-middle.png) | Readable groups with room to approach and orbit. |
| .05 / 1 / .03 | [Strongest candidate](connections-forces-crisp.png) | Too much competition among enlarged spheres and names. |

After comparing force, resistance and label settings, root selected gravity .025, spring .5, tether .02, node resistance .45, wire resistance .9 and thickness .9. The [probe](../../Probes/2026-10-24/connections-tuning/README.md) records alternatives and judgment. Ordinary wires use alpha .16; labels reserve 10px between rectangles and reveal ordinary context at perspective radii 6px/unscoped or 14px/scoped. Root re-viewed the main and estate after the numerical integration repair.

The same generator neighbourhood and zoom at 1600×1000, with temporary native sphere geometry replacements only:

| Detail | Capture | Judgment |
| --- | --- | --- |
| 8 segments | [Eight](generator-detail-8.png) | Visible polygon corners on larger nearby spheres. |
| 12 segments | [Twelve](generator-detail-12.png) | Selected: smooth enough nearby, with lower completed drawing cost than sixteen. |
| 16 segments | [Sixteen](generator-detail-16.png) | Small visual gain for substantial extra software-renderer cost. |

These comparisons use the repaired physics and all selected display values; the production sphere setting was then changed to twelve. The [performance findings](../../Probes/2026-10-24/connections-tuning/performance-findings.md) explain why synchronous completed drawing, rather than the earlier `gl.finish` measurement, informed this choice. Adaptive detail was not implemented because separate transparent detail batches would lose global depth order.

## Final production captures

The selected twelve-segment build, with its public defaults and repaired integration. The main bundle has 878 documents, 877 visible nodes and all 640 history entries; the estate has 36 files. Root personally inspected the overview, middle distance, generator close-up, estate zoom/orbit frames, close view and inspection. Both capture journeys reported no browser errors. The main viewport is 1600×1000; the estate is 1280×800, both DPR 1.

| State | Capture |
| --- | --- |
| Full Connections arrival | [Overview](connections-overview.png) |
| Closer, ordinary context names revealed | [Middle distance](connections-medium.png) |
| Full graph after orbit | [Orbit](connections-orbit.png) |
| Generator selected and approached | [Generator neighbourhood](connections-generator-close.png) |
| Small estate arrival | [Estate overview](connections-estate-overview.png) |
| Approaching GatewayClient | [Zoom frame](connections-estate-zoom.png) |
| Orbit in progress | [Orbit frame](connections-estate-orbit-motion.png) |
| Close view after orbit | [Estate close-up](connections-estate-close.png) |
| Fit recovery, then evidence inspection | [Inspection](connections-estate-inspection.png) |
| Independent resistance and width controls | [Tuning](connections-estate-tuning.png) |

Root's judgment: the overview's groups remain distinct, middle-distance names are useful without shrinking their text, and the selected neighbourhood remains recognizable through approach, orbit and inspection. The graph still has projected crossings and crowded hubs; this pass does not claim to solve direction or occlusion. The [probe verification](../../Probes/2026-10-24/connections-tuning/README.md#verification-status) records the full gate separately from this visual evidence.

Final verification passed the complete `safe:commit -- --e2e` chain, including all 206 browser tests, 1,405 unit tests and 113 integration tests. The isolated tree's 58 changed product/source documentation files matched the main workspace exactly; the separate devcontainer changes were preserved outside that verification.

## Structure sizing reopened

The [Structure probe](../../Probes/2026-10-24/structure-sizing/README.md) follows the owner's [Turns 13–14](../../ChatHistory/2026/10/2026-10-24.1.record.md#turn-13). The [current committed overview](structure-current-overview.png) was captured after switching from Connections to Structure and waiting until still, with fresh settings at 1600×1000, DPR 1. It shows the orange Directory key already present in the sidebar and the large recursive ancestor spheres. This is baseline evidence, not a candidate adopted by the owner. The first probe's subsequent numerical observation failed in its transpiled Playwright helper; the screenshot itself completed before that failure.

All comparisons use fresh settings at 1600×1000 CSS pixels, DPR 1, with the same existing bundle data. “Display only” retains the recursive physics, framing and label placement. “Quieter names” gives deep directory names the file proximity gate while retaining root/top-level landmarks. The two flat sizes have physical radii 4 and 6.35, with the same zoom resistance as files. The [probe findings](../../Probes/2026-10-24/structure-sizing/README.md#findings-and-status) distinguish measured controls from root judgment. These are disposable candidates, not a shipped change.

### Repository comparisons

| Treatment | Overview | Closer | Orbit in progress | After orbit |
| --- | --- | --- | --- | --- |
| Recursive | [Overview](structure-repo-recursive.png) | [Closer](structure-repo-recursive-closer.png) | [In motion](structure-repo-recursive-orbit-frame.png) | [After orbit](structure-repo-recursive-orbited.png) |
| Immediate entries, display only | [Overview](structure-repo-immediate-display.png) | — | — | — |
| Immediate entries, settled | [Overview](structure-repo-immediate.png) | [Closer](structure-repo-immediate-closer.png) | [In motion](structure-repo-immediate-orbit-frame.png) | [After orbit](structure-repo-immediate-orbited.png) |
| Immediate entries, quieter names | [Overview](structure-repo-immediate-quiet.png) | [Closer](structure-repo-immediate-quiet-closer.png) | [In motion](structure-repo-immediate-quiet-orbit-frame.png) | [After orbit](structure-repo-immediate-quiet-orbited.png) |
| Flat baseline, quieter names | [Overview](structure-repo-flat-base-quiet.png) | [Closer](structure-repo-flat-base-quiet-closer.png) | [In motion](structure-repo-flat-base-quiet-orbit-frame.png) | [After orbit](structure-repo-flat-base-quiet-orbited.png) |
| Flat larger, quieter names | [Overview](structure-repo-flat-quiet.png) | [Closer](structure-repo-flat-quiet-closer.png) | [In motion](structure-repo-flat-quiet-orbit-frame.png) | [After orbit](structure-repo-flat-quiet-orbited.png) |

### Estate comparisons

| Treatment | Overview | Closer | Orbit in progress | After orbit |
| --- | --- | --- | --- | --- |
| Recursive | [Overview](structure-estate-recursive.png) | [Closer](structure-estate-recursive-closer.png) | [In motion](structure-estate-recursive-orbit-frame.png) | [After orbit](structure-estate-recursive-orbited.png) |
| Immediate entries, display only | [Overview](structure-estate-immediate-display.png) | — | — | — |
| Immediate entries, settled | [Overview](structure-estate-immediate.png) | [Closer](structure-estate-immediate-closer.png) | [In motion](structure-estate-immediate-orbit-frame.png) | [After orbit](structure-estate-immediate-orbited.png) |
| Immediate entries, quieter names | [Overview](structure-estate-immediate-quiet.png) | [Closer](structure-estate-immediate-quiet-closer.png) | [In motion](structure-estate-immediate-quiet-orbit-frame.png) | [After orbit](structure-estate-immediate-quiet-orbited.png) |
| Flat baseline, quieter names | [Overview](structure-estate-flat-base-quiet.png) | [Closer](structure-estate-flat-base-quiet-closer.png) | [In motion](structure-estate-flat-base-quiet-orbit-frame.png) | [After orbit](structure-estate-flat-base-quiet-orbited.png) |
| Flat larger, quieter names | [Overview](structure-estate-flat-quiet.png) | [Closer](structure-estate-flat-quiet-closer.png) | [In motion](structure-estate-flat-quiet-orbit-frame.png) | [After orbit](structure-estate-flat-quiet-orbited.png) |

Root personally viewed all sizing overviews and the principal close comparisons. The sampled orbit captures document the journey; they do not constitute a continuous video or a complete regression suite. The repository flat-baseline captures predate the flat legend-marker correction: their two differently sized dots should be read as a prototype error, not a second size encoding. The current disposable flat bundles use a single uniform marker; the estate flat captures were refreshed with it.

### Names available through attention

In the larger flat candidate, `tests/integration/programs/csharp` has no resting overview label. [Hover](structure-flat-hover.png) reveals its full path and relevant subtree; clicking that name opens the [directory reader](structure-flat-inspection.png), which reports 68 descendant files and lists its four child directories. The final reader capture waits for the opening transition to finish. No page errors were reported in this journey.
