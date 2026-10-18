# 3D Local Map drift: repository, toggling tests, the relaxed preset

Historical layout-lab measurement, 2026-10-18T00:18:55.152Z. Each row settles the full picture, then toggles the same spheres out and back in for every cycle, each change a full reheat from the carried positions, as the page does today. Extent is the root-mean-square distance of every sphere from the picture's centroid; growth is the last extent over the start's. The unchanged spheres' mean move is averaged over the cycles.

| Layout | Gravity | Reach | Spheres (toggled) | Start extent | Extent by cycle | Growth | Unchanged mean move | Greatest move |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| connections | 0 | 200 | 780 (199) | 350.3 | 395.6, 419.7, 440.0, 457.1, 476.5 | 1.36× | 66.1 | 364.2 |
| connections | 0 | 500 | 780 (199) | 556.3 | 651.0, 703.2, 742.1, 768.4, 791.6 | 1.42× | 99.7 | 640.7 |
| connections | 0.05 | 200 | 780 (199) | 223.2 | 224.2, 225.1, 225.0, 224.8, 225.6 | 1.01× | 32.1 | 172.1 |
| connections | 0.05 | 500 | 780 (199) | 342.6 | 347.9, 347.1, 346.4, 347.5, 348.5 | 1.02× | 61.3 | 400.1 |
| structure | 0 | 200 | 1061 (213) | 369.0 | 411.1, 424.7, 436.0, 447.1, 457.9 | 1.24× | 71.8 | 310.1 |
| structure | 0 | 500 | 1061 (213) | 585.3 | 664.6, 700.3, 722.8, 733.3, 738.6 | 1.26× | 114.8 | 620.3 |
| structure | 0.05 | 200 | 1061 (213) | 241.1 | 242.1, 243.0, 243.0, 243.8, 244.0 | 1.01× | 35.1 | 174.8 |
| structure | 0.05 | 500 | 1061 (213) | 377.3 | 382.1, 384.7, 384.5, 385.5, 385.7 | 1.02× | 57.5 | 326.9 |
