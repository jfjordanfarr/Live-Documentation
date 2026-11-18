# 3D Local Map drift: repository, toggling tests, the relaxed preset

Historical layout-lab measurement, 2026-10-18T03:00:01.966Z. Each row settles the full picture, then toggles the same spheres out and back in for every cycle, each change fed from the carried positions by the update energy as the page feeds it: at 1 the library's full reheat, at a fraction a reheat to that alpha, at 0 placement alone. Extent is the root-mean-square distance of every sphere from the picture's centroid; growth is the last extent over the start's. The unchanged spheres' mean move is averaged over the cycles; the settle is the ticks the engine took for a change, the removal and the restore alike.

| Layout | Energy | Gravity | Reach | Spheres (toggled) | Start extent | Extent by cycle | Growth | Unchanged mean move | Greatest move | Settle ticks |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| connections | 1 | 0.05 | unbounded | 815 (213) | 424.1 | 428.7, 434.6, 434.0, 434.5, 434.7 | 1.02× | 60.9 | 387.3 | 300 |
| connections | 0.3 | 0.05 | unbounded | 815 (213) | 424.1 | 422.2, 424.1, 425.4, 427.8, 427.3 | 1.01× | 33.6 | 154.7 | 248 |
| connections | 0.1 | 0.05 | unbounded | 815 (213) | 424.1 | 411.6, 411.6, 412.5, 412.8, 413.1 | 0.97× | 14.7 | 74.8 | 200 |
| connections | 0.05 | 0.05 | unbounded | 815 (213) | 424.1 | 412.7, 408.0, 406.5, 406.6, 407.3 | 0.96× | 10.0 | 46.5 | 170 |
| connections | 0.02 | 0.05 | unbounded | 815 (213) | 424.1 | 417.6, 413.1, 409.6, 407.2, 405.6 | 0.96× | 6.2 | 24.6 | 130 |
| connections | 0 | 0.05 | unbounded | 815 (213) | 424.1 | 424.1, 424.1, 424.1, 424.1, 424.1 | 1.00× | 0.0 | 0.0 | 0 |
| structure | 1 | 0.05 | unbounded | 1098 (227) | 481.3 | 501.6, 509.2, 512.9, 518.0, 518.5 | 1.08× | 88.9 | 474.2 | 300 |
| structure | 0.3 | 0.05 | unbounded | 1098 (227) | 481.3 | 487.2, 490.8, 497.5, 499.8, 504.9 | 1.05× | 50.7 | 225.5 | 248 |
| structure | 0.1 | 0.05 | unbounded | 1098 (227) | 481.3 | 477.4, 477.5, 479.2, 481.7, 482.0 | 1.00× | 23.4 | 83.2 | 200 |
| structure | 0.05 | 0.05 | unbounded | 1098 (227) | 481.3 | 476.6, 474.7, 474.4, 474.7, 475.2 | 0.99× | 13.7 | 50.6 | 170 |
| structure | 0.02 | 0.05 | unbounded | 1098 (227) | 481.3 | 477.5, 474.9, 473.4, 472.4, 471.8 | 0.98× | 6.9 | 45.1 | 130 |
| structure | 0 | 0.05 | unbounded | 1098 (227) | 481.3 | 481.3, 481.3, 481.3, 481.3, 481.3 | 1.00× | 0.0 | 0.0 | 0 |
