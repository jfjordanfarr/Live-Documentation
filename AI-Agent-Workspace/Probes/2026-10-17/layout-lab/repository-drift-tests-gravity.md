# 3D Local Map drift: repository, toggling tests, the relaxed preset

Historical layout-lab measurement, 2026-10-18T00:04:02.731Z. Each row settles the full picture, then toggles the same spheres out and back in for every cycle, each change a full reheat from the carried positions, as the page does today. Extent is the root-mean-square distance of every sphere from the picture's centroid; growth is the last extent over the start's. The unchanged spheres' mean move is averaged over the cycles.

| Layout | Gravity | Reach | Spheres (toggled) | Start extent | Extent by cycle | Growth | Unchanged mean move | Greatest move |
| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| connections | 0 | unbounded | 780 (199) | 890.3 | 1329.8, 1631.5, 1876.5, 2089.2, 2272.9 | 2.55× | 324.1 | 1152.6 |
| connections | 0.02 | unbounded | 780 (199) | 579.5 | 608.9, 618.7, 615.8, 614.1, 619.1 | 1.07× | 84.3 | 752.1 |
| connections | 0.05 | unbounded | 780 (199) | 414.7 | 422.9, 427.3, 428.6, 430.4, 427.4 | 1.03× | 63.8 | 541.1 |
| connections | 0.1 | unbounded | 780 (199) | 317.0 | 321.1, 321.7, 323.0, 324.3, 324.2 | 1.02× | 50.5 | 367.6 |
| structure | 0 | unbounded | 1061 (213) | 968.6 | 1316.7, 1520.5, 1654.1, 1741.4, 1814.3 | 1.87× | 289.5 | 1061.6 |
| structure | 0.02 | unbounded | 1061 (213) | 665.2 | 710.1, 718.4, 722.0, 729.1, 727.7 | 1.09× | 117.0 | 664.9 |
| structure | 0.05 | unbounded | 1061 (213) | 487.5 | 504.2, 506.6, 511.6, 512.5, 511.6 | 1.05× | 79.0 | 420.7 |
| structure | 0.1 | unbounded | 1061 (213) | 369.0 | 374.7, 376.8, 377.9, 378.2, 378.3 | 1.03× | 53.4 | 314.6 |
