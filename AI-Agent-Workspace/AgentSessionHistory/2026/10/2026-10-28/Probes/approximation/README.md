# The repulsion's approximation, measured against the exact sum

_A layout-lab measurement of October 28, 2026, by a builder subagent (Claude Opus 5.5) for the owner's decision of that day that an approximation may be the 3D field's default, with the exact field kept as the oracle. The tables below are copied from the lab's report beside this file, [measurements.md](measurements.md), whose JSON companion holds every number. They are historical measurements of the code as it stood that day on a shared machine, not a runtime guarantee. The proposal at the end is the builder's; the root and the owner decide._

## Brief

The T3 bundle's 3D view froze on 2026-10-27. One exact evaluation of its 21,720 spheres took 2.2 seconds (235,868,340 pairs), and the first tick took fifteen of them, 33.8 seconds (the diagnosis is `AI-Agent-Workspace/Probes/2026-10-27/t3-code/3d-startup.md`). The task: build a Barnes–Hut repulsion for the field behind a lever named `approximation`. Zero means none of it, the exact sum as it was; larger is faster and less exact. Keep the overlaps exact, measure what each setting buys and costs, and propose a default.

## What was built

- **The field.** `SpatialField` (`packages/explorer/src/client/views/forceGraphPhysics.ts`) keeps its exact pair loop at approximation zero, unchanged to the last digit. Above zero it builds an octree over the spheres at every evaluation (`forceGraphOctree.ts`) and walks it once per sphere. A cell wholly beyond the repulsion's reach is skipped. A cell that does not hold the sphere, lies wholly within the reach and whose box's largest side is less than the approximation times its distance pushes as all its spheres would from their centre of charge. Any other cell is opened, a leaf to its spheres one by one. Overlapping pairs are found through the same tree, each cell searched by its own largest radius, and summed in the exact loop's order, so the overlaps, and every force without repulsion, are the exact loop's to the last digit. The stiffness reading counts a cell taken whole as its spheres at its centre.
- **Evaluation in steps.** An evaluation is `begin` (checks, springs, tree), `step(from, to)` over consecutive runs of spheres, and `finish` (gravity, tether, the greatest stiffness, the finite checks), so that the root can spread one evaluation across animation frames. `forces` runs the three in one call. How the spheres are divided between steps changes no number.
- **The lever.** `ForceGraphTuning.approximation`, from 0 to 1.5 in steps of 0.05, appears in the Tuning panel's 3D Layout group as Approximation, beside Repulsion Reach. It persists and travels in share links like the other levers.
- **The measure.** `npm run layout:lab -- approximation …` (`scripts/layout-lab/approximation.ts`), used for everything below.

## Method

```
npm run live-docs:visualize && npm run live-docs:visualize:estate
npm run layout:lab -- approximation repository/five,estate/five \
  --large /workspaces/Live-Documentation/dist/explorer/samples/t3-code/explorer-data.json \
  --state /workspaces/Live-Documentation/AI-Agent-Workspace/tmp/t3-code-2026-10-27/share-guide-url.txt \
  --approximations 0.3,0.35,0.4,0.45,0.5,0.7,0.9,1.2 --tick 0.3
```

The T3 bundle was read where it lies in the main checkout, never rebuilt. Its picture is the one the saved guide address shows in 3D: tests and assets hidden except the files it pins, selects or asks a path to, 21,720 spheres and 72,137 links in the connections layout, at the address's Compact settings. Timings are medians after one evaluation to warm the engine. The machine was shared with other agents' browser runs, so a timing can move by a tenth from one run to the next.

## (a) One evaluation at D3's seed, and the first tick: the T3 bundle

21,720 spheres and 72,137 links in the connections layout; settings `{"linkGap":32,"charge":30,"collisionGap":2,"coupling":1,"nodeSize":4,"symbolScale":1,"linkWidth":1,"nodeZoomResistance":0.3,"wireZoomResistance":0.9,"gravity":0.025,"chargeRange":0,"approximation":0.3,"linkStrength":0.5,"updateEnergy":1,"tether":0.02,"citedByPull":1}`. The first spheres of the picture with the links among them, seated where D3 seats a first picture; the median of the runs after one to warm the engine.

| Spheres | Approximation | Milliseconds | Runs | Stiffness | Overlaps |
| ---: | --- | ---: | ---: | ---: | ---: |
| 1,000 | 0 (exact) | 6.7 | 5 | 614.1 | 1,715 |
| 1,000 | 0.3 | 8.2 | 5 | 614.1 | 1,715 |
| 1,000 | 0.35 | 6.9 | 5 | 614.1 | 1,715 |
| 1,000 | 0.4 | 6.3 | 5 | 614.1 | 1,715 |
| 1,000 | 0.45 | 5.7 | 5 | 614.1 | 1,715 |
| 1,000 | 0.5 | 5.0 | 5 | 614.1 | 1,715 |
| 1,000 | 0.7 | 3.6 | 5 | 613.9 | 1,715 |
| 1,000 | 0.9 | 3.0 | 5 | 612.1 | 1,715 |
| 1,000 | 1.2 | 2.4 | 5 | 611.0 | 1,715 |
| 5,000 | 0 (exact) | 152.1 | 5 | 1051.3 | 11,687 |
| 5,000 | 0.3 | 82.0 | 5 | 1051.3 | 11,687 |
| 5,000 | 0.35 | 69.1 | 5 | 1051.3 | 11,687 |
| 5,000 | 0.4 | 56.5 | 5 | 1051.3 | 11,687 |
| 5,000 | 0.45 | 47.4 | 5 | 1051.2 | 11,687 |
| 5,000 | 0.5 | 41.8 | 5 | 1051.2 | 11,687 |
| 5,000 | 0.7 | 26.9 | 5 | 1050.3 | 11,687 |
| 5,000 | 0.9 | 20.5 | 5 | 1049.6 | 11,687 |
| 5,000 | 1.2 | 16.5 | 5 | 1046.9 | 11,687 |
| 21,720 | 0 (exact) | 2901.7 | 3 | 2263.6 | 64,388 |
| 21,720 | 0.3 | 596.2 | 5 | 2263.4 | 64,388 |
| 21,720 | 0.35 | 476.9 | 5 | 2263.4 | 64,388 |
| 21,720 | 0.4 | 379.9 | 5 | 2263.2 | 64,388 |
| 21,720 | 0.45 | 330.7 | 5 | 2263.1 | 64,388 |
| 21,720 | 0.5 | 247.6 | 5 | 2262.9 | 64,388 |
| 21,720 | 0.7 | 155.5 | 5 | 2261.8 | 64,388 |
| 21,720 | 0.9 | 117.8 | 5 | 2258.7 | 64,388 |
| 21,720 | 1.2 | 94.7 | 5 | 2258.1 | 64,388 |

The first tick of the whole picture at approximation 0.3, as the page takes it (the field built, the motion begun, one tick): 15 evaluations in 10.21 s.

## (b) The forces' error against the exact sum

At the T3 seed, and at the exact field's rest of this repository's and the estate's pictures.

The approximation changes the repulsion alone, so the error of a setting is its field's difference from the exact field's, measured against the exact repulsion. Relative RMS is the root of the summed squared errors over the summed squared repulsions; the greatest is the worst sphere's error over its own repulsion, and over the repulsions' root mean square.

| Picture | Spheres | Approximation | Relative RMS | Greatest, own | Greatest, of the scale |
| --- | ---: | --- | ---: | ---: | ---: |
| t3-code at D3's seed | 21,720 | 0.3 | 0.00446 | 0.120 | 0.00614 |
| t3-code at D3's seed | 21,720 | 0.35 | 0.00637 | 0.104 | 0.00853 |
| t3-code at D3's seed | 21,720 | 0.4 | 0.00854 | 0.134 | 0.0115 |
| t3-code at D3's seed | 21,720 | 0.45 | 0.0107 | 0.130 | 0.0140 |
| t3-code at D3's seed | 21,720 | 0.5 | 0.0127 | 0.145 | 0.0165 |
| t3-code at D3's seed | 21,720 | 0.7 | 0.0277 | 0.531 | 0.0471 |
| t3-code at D3's seed | 21,720 | 0.9 | 0.0503 | 0.384 | 0.0806 |
| t3-code at D3's seed | 21,720 | 1.2 | 0.0820 | 3.02 | 0.134 |
| repository connections at rest | 876 | 0.3 | 0.00375 | 0.0360 | 0.00558 |
| repository connections at rest | 876 | 0.35 | 0.00550 | 0.0540 | 0.00867 |
| repository connections at rest | 876 | 0.4 | 0.00734 | 0.119 | 0.0113 |
| repository connections at rest | 876 | 0.45 | 0.00911 | 0.183 | 0.0138 |
| repository connections at rest | 876 | 0.5 | 0.0112 | 0.178 | 0.0172 |
| repository connections at rest | 876 | 0.7 | 0.0272 | 0.279 | 0.0430 |
| repository connections at rest | 876 | 0.9 | 0.0545 | 0.534 | 0.0815 |
| repository connections at rest | 876 | 1.2 | 0.0926 | 1.55 | 0.161 |
| repository structure at rest | 1,164 | 0.3 | 0.00296 | 0.00858 | 0.00427 |
| repository structure at rest | 1,164 | 0.35 | 0.00447 | 0.0139 | 0.00712 |
| repository structure at rest | 1,164 | 0.4 | 0.00600 | 0.0221 | 0.0106 |
| repository structure at rest | 1,164 | 0.45 | 0.00763 | 0.0301 | 0.0137 |
| repository structure at rest | 1,164 | 0.5 | 0.0103 | 0.0329 | 0.0230 |
| repository structure at rest | 1,164 | 0.7 | 0.0321 | 0.0558 | 0.0575 |
| repository structure at rest | 1,164 | 0.9 | 0.0615 | 0.174 | 0.107 |
| repository structure at rest | 1,164 | 1.2 | 0.104 | 0.363 | 0.185 |
| estate connections at rest | 36 | 0.3 | 0.00164 | 0.00420 | 0.00424 |
| estate connections at rest | 36 | 0.35 | 0.00280 | 0.00727 | 0.00625 |
| estate connections at rest | 36 | 0.4 | 0.00413 | 0.00727 | 0.00675 |
| estate connections at rest | 36 | 0.45 | 0.00616 | 0.0157 | 0.0149 |
| estate connections at rest | 36 | 0.5 | 0.0109 | 0.0213 | 0.0237 |
| estate connections at rest | 36 | 0.7 | 0.0384 | 0.182 | 0.0639 |
| estate connections at rest | 36 | 0.9 | 0.0593 | 0.293 | 0.107 |
| estate connections at rest | 36 | 1.2 | 0.0815 | 0.588 | 0.192 |
| estate structure at rest | 54 | 0.3 | 2.55e-16 | 1.08e-15 | 5.31e-16 |
| estate structure at rest | 54 | 0.35 | 2.55e-16 | 1.08e-15 | 5.31e-16 |
| estate structure at rest | 54 | 0.4 | 0.000896 | 0.00359 | 0.00395 |
| estate structure at rest | 54 | 0.45 | 0.00210 | 0.00800 | 0.00585 |
| estate structure at rest | 54 | 0.5 | 0.00519 | 0.0120 | 0.0136 |
| estate structure at rest | 54 | 0.7 | 0.0316 | 0.113 | 0.0469 |
| estate structure at rest | 54 | 0.9 | 0.0658 | 0.203 | 0.101 |
| estate structure at rest | 54 | 1.2 | 0.0996 | 0.542 | 0.189 |

## (c) Pictures eased to rest from one seed: this repository and the estate

The page's cold-start picture of each bundle (tests shown, assets hidden), eased headlessly as the page eases a first picture until still or 5,000 ticks, at each setting from the same seed; settings `{"linkGap":60,"charge":60,"collisionGap":5,"coupling":1,"nodeSize":4,"symbolScale":1,"linkWidth":1,"nodeZoomResistance":0.3,"wireZoomResistance":0.9,"gravity":0.025,"chargeRange":0,"linkStrength":0.5,"updateEnergy":1,"tether":0.02,"citedByPull":1}`. The shift is each sphere's distance from where the exact field's rest put it, over that picture's diagonal; overlaps are pairs of spheres that interpenetrate. Two rows measure noise: the exact sum taken in another order, every cell of the tree opened, and the exact rest eased again from where it stopped, held there, which is how surely the motion's stillness places a sphere at all.

| Bundle | Layout | Approximation | Spheres | Ticks to still | Overlaps | Deepest | Bounds | Seconds | Mean shift | Greatest shift |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| repository | connections | 0 (exact) | 876 | 548 | 0 | 0.00 | 2378.9 × 2399.3 × 2408.9 | 3.5 | 0.0% | 0.0% |
| repository | connections | 0, its rest eased again | 876 | 106 | | | | | 0.38% | 1.8% |
| repository | connections | 1e-9 (every cell opened) | 876 | 548 | 0 | 0.00 | 2378.9 × 2399.3 × 2408.9 | 5.6 | 1.1e-13% | 2.2e-12% |
| repository | connections | 0.3 | 876 | 492 | 0 | 0.00 | 2385.9 × 2404.3 × 2413.5 | 3.0 | 0.34% | 2.2% |
| repository | connections | 0.35 | 876 | 509 | 0 | 0.00 | 2386.8 × 2405.2 × 2414.2 | 2.6 | 0.68% | 2.8% |
| repository | connections | 0.4 | 876 | 511 | 0 | 0.00 | 2386.4 × 2405.3 × 2417.3 | 2.5 | 0.40% | 2.9% |
| repository | connections | 0.45 | 876 | 591 | 0 | 0.00 | 2390.0 × 2404.8 × 2415.5 | 2.4 | 0.60% | 3.7% |
| repository | connections | 0.5 | 876 | 469 | 0 | 0.00 | 2397.6 × 2408.8 × 2414.4 | 1.9 | 0.91% | 5.4% |
| repository | connections | 0.7 | 876 | 508 | 0 | 0.00 | 2405.1 × 2445.6 × 2447.9 | 1.5 | 1.8% | 7.5% |
| repository | connections | 0.9 | 876 | not still after 5000 | 0 | 0.00 | 2369.5 × 2418.3 × 2419.5 | 10.4 | 2.9% | 9.4% |
| repository | connections | 1.2 | 876 | not still after 5000 | 0 | 0.00 | 2356.6 × 2473.3 × 2472.1 | 9.1 | 7.8% | 31% |
| repository | structure | 0 (exact) | 1164 | 355 | 0 | 0.00 | 2713.1 × 2626.5 × 2687.4 | 10.0 | 0.0% | 0.0% |
| repository | structure | 0, its rest eased again | 1164 | 86 | | | | | 0.44% | 1.7% |
| repository | structure | 1e-9 (every cell opened) | 1164 | 355 | 0 | 0.00 | 2713.1 × 2626.5 × 2687.4 | 17.1 | 7.6e-13% | 8.2e-12% |
| repository | structure | 0.3 | 1164 | 355 | 0 | 0.00 | 2715.7 × 2631.5 × 2690.4 | 9.9 | 0.43% | 3.4% |
| repository | structure | 0.35 | 1164 | 357 | 0 | 0.00 | 2717.7 × 2637.1 × 2687.9 | 9.6 | 0.49% | 7.2% |
| repository | structure | 0.4 | 1164 | 358 | 0 | 0.00 | 2718.7 × 2637.6 × 2693.8 | 8.9 | 0.61% | 7.4% |
| repository | structure | 0.45 | 1164 | 358 | 0 | 0.00 | 2718.7 × 2640.4 × 2695.7 | 5.9 | 0.75% | 6.6% |
| repository | structure | 0.5 | 1164 | 354 | 0 | 0.00 | 2726.8 × 2646.8 × 2704.5 | 4.7 | 0.85% | 6.3% |
| repository | structure | 0.7 | 1164 | 439 | 0 | 0.00 | 2745.4 × 2685.6 × 2730.8 | 4.0 | 1.6% | 9.6% |
| repository | structure | 0.9 | 1164 | not still after 5000 | 0 | 0.00 | 2718.7 × 2692.4 × 2682.6 | 53.5 | 2.4% | 7.6% |
| repository | structure | 1.2 | 1164 | not still after 5000 | 0 | 0.00 | 2763.2 × 2758.4 × 2738.2 | 30.3 | 7.7% | 27% |
| estate | connections | 0 (exact) | 36 | 265 | 0 | 0.00 | 440.3 × 377.9 × 398.9 | 0.0 | 0.0% | 0.0% |
| estate | connections | 0, its rest eased again | 36 | 77 | | | | | 0.55% | 1.7% |
| estate | connections | 1e-9 (every cell opened) | 36 | 265 | 0 | 0.00 | 440.3 × 377.9 × 398.9 | 0.0 | 2.7e-14% | 1.3e-13% |
| estate | connections | 0.3 | 36 | 264 | 0 | 0.00 | 440.4 × 378.5 × 399.0 | 0.0 | 0.061% | 0.13% |
| estate | connections | 0.35 | 36 | 265 | 0 | 0.00 | 440.5 × 379.0 × 399.0 | 0.0 | 0.17% | 0.53% |
| estate | connections | 0.4 | 36 | 267 | 0 | 0.00 | 439.9 × 379.0 × 398.9 | 0.0 | 0.33% | 0.69% |
| estate | connections | 0.45 | 36 | 283 | 0 | 0.00 | 440.2 × 375.9 × 397.0 | 0.0 | 0.50% | 1.2% |
| estate | connections | 0.5 | 36 | 258 | 0 | 0.00 | 439.7 × 380.3 × 397.8 | 0.0 | 0.47% | 1.1% |
| estate | connections | 0.7 | 36 | 294 | 0 | 0.00 | 443.9 × 384.7 × 404.1 | 0.0 | 1.6% | 3.6% |
| estate | connections | 0.9 | 36 | not still after 5000 | 0 | 0.00 | 457.0 × 389.7 × 405.6 | 0.2 | 3.4% | 8.7% |
| estate | connections | 1.2 | 36 | not still after 5000 | 0 | 0.00 | 478.2 × 394.1 × 393.9 | 0.2 | 7.7% | 17% |
| estate | structure | 0 (exact) | 54 | 218 | 0 | 0.00 | 496.0 × 471.4 × 537.7 | 0.0 | 0.0% | 0.0% |
| estate | structure | 0, its rest eased again | 54 | 73 | | | | | 0.46% | 1.4% |
| estate | structure | 1e-9 (every cell opened) | 54 | 218 | 0 | 0.00 | 496.0 × 471.4 × 537.7 | 0.0 | 3.7e-14% | 2.1e-13% |
| estate | structure | 0.3 | 54 | 218 | 0 | 0.00 | 496.0 × 471.4 × 537.7 | 0.0 | 0.0019% | 0.0076% |
| estate | structure | 0.35 | 54 | 218 | 0 | 0.00 | 495.9 × 471.5 × 537.7 | 0.0 | 0.026% | 0.41% |
| estate | structure | 0.4 | 54 | 217 | 0 | 0.00 | 495.9 × 473.2 × 538.8 | 0.0 | 0.12% | 1.5% |
| estate | structure | 0.45 | 54 | 219 | 0 | 0.00 | 495.5 × 479.3 × 539.6 | 0.0 | 0.41% | 4.2% |
| estate | structure | 0.5 | 54 | 222 | 0 | 0.00 | 497.5 × 479.5 × 538.8 | 0.0 | 0.55% | 4.6% |
| estate | structure | 0.7 | 54 | 228 | 0 | 0.00 | 505.0 × 473.8 × 554.3 | 0.0 | 1.3% | 4.6% |
| estate | structure | 0.9 | 54 | 221 | 0 | 0.00 | 521.5 × 479.0 × 573.1 | 0.0 | 3.4% | 14% |
| estate | structure | 1.2 | 54 | 265 | 0 | 0.00 | 518.1 × 481.9 × 570.3 | 0.0 | 5.5% | 21% |

## Whether the picture comes to rest

The motion stops when no sphere moves more than 3×10⁻⁵ of the diagonal a tick for ten ticks. An approximated field's forces jump wherever a cell's width-to-distance ratio crosses the setting. A sphere moving a little can make some cell somewhere cross, the jump moves other spheres, and at large settings the jumps keep each other going. This is the result of the specified rule; it is not a defect of the implementation.

- **The real pictures** (table above): at 0.9 and 1.2, three of the four pictures were never still in 5,000 ticks, against 218 to 548 for the exact field. At 0.7 and below, all four came to rest, in at most 1.24 times as many ticks as the exact field took, and at 0.5 and below in at most 1.08 times as many.
- **Small scenes**: 36 scenes of 120, 150 and 250 spheres, clouds hung from random springs and chains, six seeds each, unfolded from D3's seed and held once calm as the page does, with 3,000 ticks at most. At 0.3 and 0.5 every scene came to rest, the worst in 1.17 and 1.19 times the exact field's ticks. At 0.7, one did not, a cloud of 250 whose largest move hovered at 1.5 times the stillness threshold. In an earlier run, a chain of 150 at 0.7 moved for 20,000 ticks with its many spheres jittering by 0.04 to 0.08 a tick against a threshold of 0.066.
- **A smoothed rule, prototyped outside the source**: a cell whose ratio falls in the band from 0.7 times the setting up to the setting pushes partly whole and partly opened, blended smoothly, so that no force jumps at the threshold. Over the same 36 scenes nothing stayed restless at 0.3, 0.5 or 0.7, and ticks stayed within 1.04 times the exact field's at 0.5 and below. On the real pictures 0.9 came to rest on all four (493, 408, 272 and 234 ticks), but 1.2 still did not on this repository's two. It costs about twice as much at each setting, since the band is computed both ways: at the T3 seed 1,472 ms at 0.3, 605 at 0.5, 334 at 0.7 and 253 at 0.9, against the shipped rule's 596, 248, 156 and 118 of the run above (separate runs on the shared machine). At equal cost the shipped rule moves the rest pictures less: smoothed at 0.5, a mean shift of 0.44% and 0.66% of the diagonal on this repository against 0.34% and 0.43% for the shipped rule at 0.3. The prototype's rest tables are not reproduced here; the prototype is not in the source.

## The noise a setting is judged against

Two rows of the rest table measure noise. The exact sum taken in another order (every cell opened, 1e-9) moved no sphere by more than 10⁻¹³ of the diagonal and changed no tick. The motion's rest is insensitive to rounding, so rounding sets no floor. The exact rest eased again from where it stopped, held there as the page holds a picture it moves again, moved its spheres a mean 0.38% to 0.55% of the diagonal, at most 1.4% to 1.8%, in 73 to 106 ticks. That is how surely the motion's stillness places a sphere at all, and it is the yardstick used here. Ticks to still are judged against the exact field's own count.

## What is proposed

**Approximation 0.3 as the default, the shipped rule unchanged; the root and the owner decide.**

The brief asked for "the smallest θ whose rest pictures and ticks to still stay within what your numbers show as noise". Every smaller setting is closer to exact, so this is read as the largest setting that stays within the noise: the most speed the accuracy allows.

- **0.3 stays within the noise.** Its rest pictures shift a mean 0.34% and 0.43% of the diagonal on this repository and 0.06% and 0.002% on the estate, within the motion's own 0.38% to 0.55%. Its greatest shift, 2.2% and 3.4% on this repository, is up to twice the motion's own 1.7% to 1.8%. Its ticks to still (492, 355, 264, 218) are at or under the exact field's (548, 355, 265, 218). Its forces' error at rest is 0.3% to 0.4% of the repulsion (relative RMS).
- **0.35 and above leave the noise on some picture.** From 0.35 to 0.5, at least one of this repository's two pictures shifts by a mean beyond the motion's own: 0.49% to 0.91%, against 0.38% and 0.44%. The structure picture's greatest shifts are 6.3% to 7.4%, about four times the floor's. The steps are not monotonic (0.35's connections picture moved more than 0.4's), because each setting's easing takes its own path to a nearby rest.
- **What 0.3 buys at T3 scale.** One evaluation at the T3 seed took 596 ms against the exact sum's 2,902 ms in the same run: 4.9 times as fast, or 3.7 times against the 2,212 ms measured on 2026-10-27. The first tick as the page takes it was 15 evaluations in 10.2 seconds, against the exact field's 15 in 33.8 seconds. That is still far beyond a frame. The spread of an evaluation across frames, for which the field now has steps, and the gradual reveal remain needed.
- **What it costs on small pictures.** At 1,000 spheres from the seed, 0.3 took 8.2 ms against the exact 6.7 ms. On this repository's pictures, eased whole, it took no longer than the exact field (3.0 against 3.5 seconds, and 9.9 against 10.0).

**The alternative, if speed matters more than staying within the noise: 0.5.** It takes 248 ms at the T3 seed, 11.7 times the exact run's speed and 2.4 times 0.3's. Its rest pictures shift a mean 0.85% to 0.91% of the diagonal on this repository, about twice the motion's own, and up to 5.4% to 6.3%. It came to rest everywhere it was measured.

## Open questions for the root and the owner

- **The smoothed opening rule.** It brought to rest the small scene the shipped rule left restless at 0.7 and all four real pictures at 0.9, at about twice the cost per setting. It would change the rule the brief specified, so it is not adopted here.
- **The slider's range.** The range runs 0 to 1.5 as the brief suggested, but at 0.9 and above most pictures measured never came to rest, so a person can choose a picture that never falls still. Whether to narrow the range or keep the upper end for looking is a design choice.
- **A change of the lever unfolds the picture.** `forceGraphView.ts` rebuilds the field and eases the picture afresh at full strength for any change of the force settings, and the approximation is among them, so moving the slider unfolds the picture as moving gravity does. Holding where the spheres stand might suit a change of accuracy better. The view was not changed.
- **Small pictures.** At 1,000 spheres from D3's seed the exact sum (6.7 ms) is faster than 0.3 (8.2 ms) and about as fast as 0.35; the tree only pays from about 0.4 at that size. Whether the field should sum exactly below some size is open; it was not done, since it would make the lever's meaning depend on the picture.
- **The exact sum in steps.** At approximation zero the evaluation in steps is the old loop to the last digit, in one call or divided. In one call it measured 5% to 15% slower than before the split (medians 117–140 ms against 133–150 ms at 5,000 spheres, interleaved runs), and no single difference of the split accounted for it.
