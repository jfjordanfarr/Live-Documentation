# 3D Local Map: the repulsion's approximation measured

Historical layout-lab measurement, 2026-10-28T18:29:47.047Z. Every number is of the code as it stood then; the JSON companion holds them all.

## One evaluation at D3's seed: t3-code

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

## The forces' error against the exact sum

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

## Pictures eased to rest from one seed

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
