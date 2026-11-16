# The first draw's time, `main`'s build and this branch's

_Historical evidence, measured 2026-11-16 for the fifth leg. `timing.ts` drew each picture ten times on each build, the search off (`searchStarts: 0`), at 1440 by 900, with one unrecorded warm-up draw each; the builds interleaved and their order reversed every round. `main-own` is `main`'s build (`28b7f224`) on `main`'s own graph; `main-same` is the same build given this branch's `explorer-data.json`, so that both draw the same picture; `mine` is this branch's build on that data. The time is the page's `data-layout-ms`: the ranking, the cards, the order step's starts and their placement._

| Picture | Build | Median ms | Range | Draws |
| --- | --- | --: | --- | --- |
| `branch-renderer.ts` | main-own | 1243 | 1158 to 1856 | 1221, 1817, 1856, 1704, 1198, 1191, 1265, 1210, 1158, 1339 |
| `branch-renderer.ts` | main-same | 1663.5 | 1395 to 2192 | 1986, 2192, 1772, 2063, 1921, 1395, 1555, 1449, 1503, 1518 |
| `branch-renderer.ts` | mine | 1565 | 1444 to 1909 | 1802, 1790, 1807, 1909, 1505, 1444, 1570, 1456, 1550, 1560 |
| `branches.ts` | main-own | 1195 | 1085 to 1659 | 1659, 1495, 1375, 1156, 1130, 1085, 1313, 1093, 1150, 1234 |
| `branches.ts` | main-same | 1203 | 1067 to 1453 | 1453, 1389, 1348, 1357, 1123, 1067, 1171, 1083, 1165, 1235 |
| `branches.ts` | mine | 1239.5 | 1091 to 1686 | 1388, 1686, 1472, 1289, 1107, 1091, 1190, 1104, 1270, 1209 |
| `index.ts` | main-own | 567 | 475 to 1074 | 1074, 589, 790, 476, 478, 511, 640, 475, 609, 545 |
| `index.ts` | main-same | 514 | 466 to 817 | 660, 589, 817, 479, 482, 504, 489, 466, 524, 575 |
| `index.ts` | mine | 522.5 | 467 to 843 | 843, 752, 705, 508, 467, 482, 474, 474, 544, 537 |

On the same data the two builds draw alike within the noise; `main`'s own graph gives `branch-renderer.ts` two files fewer to draw (`cycle-order.ts`, `cycle-trials.ts`: 24 files used where 26), which is the first sitting's difference. The first four rounds ran while another builder's sitting had just released the machine and are slower on every build.

`bench-explore.ts` timed the ranking alone (`exploreBranches`, cycle candidates included) in Node on this branch's graph, `main`'s module against this branch's, alternating, ten runs each after two warm-ups: `branch-renderer.ts` 16.7 ms (12.7 to 19.6) on `main` against 14.4 (12.7 to 17.2), `branches.ts` 16.2 (12.6 to 23.4) against 15.6 (12.2 to 21.8), `adapters/index.ts` 12.9 (9.0 to 18.6) against 15.2 (10.9 to 18.2).
