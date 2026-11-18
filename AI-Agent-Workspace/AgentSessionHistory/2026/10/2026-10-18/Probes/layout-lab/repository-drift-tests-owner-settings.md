# 3D Local Map drift: repository, toggling tests, the relaxed preset

Historical layout-lab measurement, 2026-10-18T22:47:18.555Z. Each row settles the full picture, then toggles the same spheres out and back in for every cycle, each change fed from the carried positions by the update energy as the page feeds it: at 1 the library's full reheat, at a fraction a reheat to that alpha, at 0 placement alone. Extent is the root-mean-square distance of every sphere from the picture's centroid; growth is the last extent over the start's. The unchanged spheres' mean move is averaged over the cycles; the settle is the ticks the engine took for a change, the removal and the restore alike.

| Layout | Energy | Spring | Gravity | Reach | Spheres (toggled) | Start extent | Extent by cycle | Growth | Unchanged mean move | Greatest move | Settle ticks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| connections | 0.1 | 0.25 | 0.01 | unbounded | 834 (221) | 764.5 | 776.2, 785.0, 794.2, 801.5, 807.9 | 1.06× | 25.7 | 138.6 | 200 |
| connections | 0.1 | 0.25 | 0.01 | 300 | 834 (221) | 365.7 | 364.5, 364.4, 365.1, 365.8, 366.7 | 1.00× | 13.9 | 90.5 | 200 |
| connections | 0.1 | 0.25 | 0.01 | 600 | 834 (221) | 527.1 | 525.9, 526.3, 527.1, 527.8, 529.2 | 1.00× | 18.6 | 121.3 | 200 |
| structure | 0.1 | 0.25 | 0.01 | unbounded | 1118 (235) | 875.2 | 883.4, 891.5, 900.0, 906.7, 912.6 | 1.04× | 37.3 | 179.5 | 200 |
| structure | 0.1 | 0.25 | 0.01 | 300 | 1118 (235) | 396.3 | 395.9, 397.0, 398.2, 398.7, 399.4 | 1.01× | 14.8 | 60.3 | 200 |
| structure | 0.1 | 0.25 | 0.01 | 600 | 1118 (235) | 566.5 | 567.4, 569.6, 571.9, 573.8, 575.3 | 1.02× | 22.0 | 118.8 | 200 |
