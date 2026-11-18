# 3D Local Map drift: estate, toggling tests, the relaxed preset

Historical layout-lab measurement, 2026-10-18T03:00:25.508Z. Each row settles the full picture, then toggles the same spheres out and back in for every cycle, each change fed from the carried positions by the update energy as the page feeds it: at 1 the library's full reheat, at a fraction a reheat to that alpha, at 0 placement alone. Extent is the root-mean-square distance of every sphere from the picture's centroid; growth is the last extent over the start's. The unchanged spheres' mean move is averaged over the cycles; the settle is the ticks the engine took for a change, the removal and the restore alike.

| Layout | Energy | Gravity | Reach | Spheres (toggled) | Start extent | Extent by cycle | Growth | Unchanged mean move | Greatest move | Settle ticks |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| connections | 1 | 0.05 | unbounded | 35 (0) | 108.8 | 114.9, 114.0, 115.5, 114.3, 115.6 | 1.06× | 30.7 | 122.5 | 300 |
| connections | 0.3 | 0.05 | unbounded | 35 (0) | 108.8 | 112.2, 113.7, 114.7, 115.8, 114.6 | 1.05× | 12.5 | 53.0 | 248 |
| connections | 0.1 | 0.05 | unbounded | 35 (0) | 108.8 | 110.6, 111.0, 112.2, 112.5, 113.3 | 1.04× | 6.2 | 20.8 | 200 |
| connections | 0.05 | 0.05 | unbounded | 35 (0) | 108.8 | 109.7, 110.6, 111.0, 111.0, 111.4 | 1.02× | 3.3 | 10.3 | 170 |
| connections | 0.02 | 0.05 | unbounded | 35 (0) | 108.8 | 109.2, 109.6, 109.8, 110.3, 110.6 | 1.02× | 1.3 | 3.9 | 130 |
| connections | 0 | 0.05 | unbounded | 35 (0) | 108.8 | 108.8, 108.8, 108.8, 108.8, 108.8 | 1.00× | 0.0 | 0.0 | 0 |
| structure | 1 | 0.05 | unbounded | 53 (0) | 148.0 | 151.2, 152.3, 152.6, 151.7, 151.3 | 1.02× | 16.1 | 75.3 | 300 |
| structure | 0.3 | 0.05 | unbounded | 53 (0) | 148.0 | 149.4, 152.0, 151.2, 150.2, 150.5 | 1.02× | 8.3 | 35.9 | 248 |
| structure | 0.1 | 0.05 | unbounded | 53 (0) | 148.0 | 148.1, 148.4, 149.8, 150.6, 151.0 | 1.02× | 4.2 | 15.1 | 200 |
| structure | 0.05 | 0.05 | unbounded | 53 (0) | 148.0 | 147.3, 148.1, 148.4, 148.4, 149.1 | 1.01× | 2.4 | 7.9 | 170 |
| structure | 0.02 | 0.05 | unbounded | 53 (0) | 148.0 | 147.7, 147.4, 147.4, 147.7, 148.0 | 1.00× | 1.0 | 3.1 | 130 |
| structure | 0 | 0.05 | unbounded | 53 (0) | 148.0 | 148.0, 148.0, 148.0, 148.0, 148.0 | 1.00× | 0.0 | 0.0 | 0 |
