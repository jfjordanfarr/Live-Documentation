# 3D Local Map drift on synthetic graphs: a toy, a mid-sized and a large shape

Historical layout-lab measurement, about 00:20 UTC on 2026-10-18, over `measureDrift` with the relaxed preset's forces, five cycles of three hundred ticks, toggling the test files. Each synthetic graph is `clusters` directories of a chain of `files` implementation files with `tests` test files each and no link between clusters: the shape that drifts. Growth is the extent after the fifth restore over the settled start; move is the mean move of the unchanged spheres per restore, averaged over the cycles. The script that produced it is disposable and not kept; the numbers are read from its output as printed.

| Graph | Layout | Gravity | Spheres (toggled) | Start extent | Growth | Unchanged mean move |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| toy, 2 clusters of 2 files and 1 test | connections | 0 | 6 (2) | 86.4 | 3.17× | 43.5 |
| toy | connections | 0.02 | 6 (2) | 64.2 | 1.18× | 13.1 |
| toy | connections | 0.03 | 6 (2) | 57.9 | 1.14× | 10.9 |
| toy | connections | 0.05 | 6 (2) | 49.5 | 1.04× | 8.1 |
| toy | connections | 0.1 | 6 (2) | 39.6 | 0.98× | 4.3 |
| toy | structure | 0 | 9 (2) | 107.3 | 1.16× | 8.9 |
| toy | structure | 0.02 | 9 (2) | 84.3 | 1.05× | 20.6 |
| toy | structure | 0.05 | 9 (2) | 61.8 | 1.05× | 8.4 |
| toy | structure | 0.1 | 9 (2) | 46.3 | 1.01× | 9.5 |
| mid, 4 clusters of 12 files and 4 tests | connections | 0 | 64 (16) | 339.0 | 2.73× | 123.4 |
| mid | connections | 0.02 | 64 (16) | 220.3 | 1.04× | 30.4 |
| mid | connections | 0.03 | 64 (16) | 190.0 | 1.05× | 24.5 |
| mid | connections | 0.05 | 64 (16) | 155.3 | 1.05× | 24.9 |
| mid | connections | 0.1 | 64 (16) | 113.9 | 1.05× | 18.4 |
| mid | structure | 0 | 69 (16) | 232.2 | 0.94× | 33.0 |
| mid | structure | 0.02 | 69 (16) | 186.8 | 0.99× | 22.6 |
| mid | structure | 0.05 | 69 (16) | 152.1 | 0.99× | 34.8 |
| mid | structure | 0.1 | 69 (16) | 119.9 | 1.02× | 17.4 |
| large, 8 clusters of 25 files and 8 tests | connections | 0 | 264 (64) | 504.4 | 3.07× | 270.4 |
| large | connections | 0.02 | 264 (64) | 368.7 | 1.16× | 73.7 |
| large | connections | 0.03 | 264 (64) | 331.7 | 1.12× | 60.0 |
| large | connections | 0.05 | 264 (64) | 279.4 | 1.07× | 43.7 |
| large | connections | 0.1 | 264 (64) | 211.1 | 1.03× | 27.8 |
| large | structure | 0 | 273 (64) | 426.1 | 0.96× | 41.3 |
| large | structure | 0.02 | 273 (64) | 320.4 | 0.95× | 39.5 |
| large | structure | 0.05 | 273 (64) | 251.1 | 0.98× | 43.9 |
| large | structure | 0.1 | 273 (64) | 201.3 | 0.99× | 30.3 |

A synthetic tree is one component through its root hub, so its structure layout does not drift as this repository's did (1.87 times on 1,061 spheres), where the real tree's size lets a full reheat spread it; the connections layout drifts in every size without gravity. Gravity 0.02 held the mid shape but not the toy (1.18) or the large one (1.16); 0.05 held every shape within 7 percent; 0.1 within 5 percent at about 40 percent of the ungoverned extent.
