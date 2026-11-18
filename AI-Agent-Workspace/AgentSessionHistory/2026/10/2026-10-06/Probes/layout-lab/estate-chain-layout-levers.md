# Layout lab: estate, chain

_Run started 2026-10-06T20:46:06.942Z, finished 2026-10-06T20:46:23.202Z, over a capture of 2026-10-06T20:31:07.324Z (Chrome/145.0.7632.6). 648 configurations, 16 of them one lever at a time, from the grid `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSeed=none,1,2,3,4,5,6,7,8;orderSweeps=4,8;symbolOrder=layout,alphabetical,appearance` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

## The model against the page

The baseline configuration reproduces the page to the pixel: every card's width and height, the placement measure, the picture's size and every membrane label's height are the page's.

Pretext's layout agreed with the page on every text at capture.

## The baseline

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |

## Each lever alone

Every lever moved by itself from the baseline, the others held.


### rankingPull

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=1 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |
| rankingPull=2 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |
| rankingPull=5 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |

### rankingTie

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingTie=right | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |
| rankingTie=left | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |

### orderSeed

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSeed=1 | 38,524 (+2.1%) | 33,313 | 9,120 | 35 (+2.9%) | 44 | 2 / 9 | 75 | 0 | 9 | 3,046 × 729 | 9,120 | 2.075 |
| orderSeed=2 | 37,324 (-1.1%) | 33,313 | 7,151 | 29 (-14.7%) | 32 | 3 / 32 | 75 | 0 | 9 | 3,046 × 1,005 | 7,151 | 2.192 |
| orderSeed=3 | 37,324 (-1.1%) | 33,313 | 7,151 | 29 (-14.7%) | 32 | 3 / 32 | 75 | 0 | 9 | 3,046 × 1,005 | 7,151 | 2.192 |
| orderSeed=4 | 37,324 (-1.1%) | 33,313 | 7,151 | 29 (-14.7%) | 32 | 3 / 32 | 75 | 0 | 9 | 3,046 × 1,005 | 7,151 | 2.192 |
| orderSeed=5 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |
| orderSeed=6 | 38,524 (+2.1%) | 33,313 | 9,120 | 35 (+2.9%) | 44 | 2 / 9 | 75 | 0 | 9 | 3,046 × 729 | 9,120 | 2.075 |
| orderSeed=7 | 37,324 (-1.1%) | 33,313 | 7,151 | 29 (-14.7%) | 32 | 3 / 32 | 75 | 0 | 9 | 3,046 × 1,005 | 7,151 | 2.192 |
| orderSeed=8 | 37,419 (-0.8%) | 33,313 | 7,492 | 29 (-14.7%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 795 | 7,492 | 1.917 |

### orderSweeps

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSweeps=8 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |

### symbolOrder

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| symbolOrder=alphabetical | 37,516 (-0.6%) | 33,313 | 7,451 | 31 (-8.8%) | 32 | 2 / 21 | 75 | 0 | 9 | 3,046 × 910 | 7,451 | 2.112 |
| symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSweeps=8 orderSeed=1 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| orderSweeps=8 orderSeed=6 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| orderSeed=8 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| orderSweeps=8 orderSeed=8 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| rankingTie=right orderSweeps=8 orderSeed=1 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| rankingTie=right orderSweeps=8 orderSeed=6 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| rankingTie=right orderSeed=8 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| rankingTie=right orderSweeps=8 orderSeed=8 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| rankingTie=left orderSweeps=8 orderSeed=1 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| rankingTie=left orderSweeps=8 orderSeed=6 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| rankingTie=left orderSeed=8 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |
| rankingTie=left orderSweeps=8 orderSeed=8 symbolOrder=appearance | 37,444 (-0.8%) | 33,313 | 7,550 | 27 (-20.6%) | 0 | 2 / 9 | 75 | 0 | 9 | 3,046 × 874 | 7,550 | 1.910 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=right orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=right orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=right orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=right orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=right orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=right orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=right orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=left orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=left orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=left orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=left orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=left orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingTie=left orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=right orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=right orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=right orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=right orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=left orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=left orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=left orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=left orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=right orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=right orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=right orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=right orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=left orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=left orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=left orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=left orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=right orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=right orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=right orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=right orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=right orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=right orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=right orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=left orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=left orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=left orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=left orderSweeps=8 orderSeed=4 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=left orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| rankingPull=5 rankingTie=left orderSweeps=8 orderSeed=7 symbolOrder=appearance | 37,215 (-1.4%) | 33,313 | 7,055 | 29 (-14.7%) | 34 | 2 / 30 | 75 | 0 | 9 | 3,046 × 1,025 | 7,055 | 2.179 |
| symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingTie=right symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingTie=right orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingTie=right orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingTie=right orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingTie=left symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingTie=left orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingTie=left orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingTie=left orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 rankingTie=right symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 rankingTie=right orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 rankingTie=right orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 rankingTie=left symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 rankingTie=left orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 rankingTie=left orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 rankingTie=right symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 rankingTie=right orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 rankingTie=right orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 rankingTie=left symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 rankingTie=left orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 rankingTie=left orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 rankingTie=right symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 rankingTie=right orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 rankingTie=right orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 rankingTie=right orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 rankingTie=left symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 rankingTie=left orderSweeps=8 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 rankingTie=left orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |
| rankingPull=5 rankingTie=left orderSweeps=8 orderSeed=5 symbolOrder=appearance | 37,311 (-1.1%) | 33,313 | 7,152 | 25 (-26.5%) | 0 | 2 / 29 | 75 | 0 | 9 | 3,046 × 1,051 | 7,152 | 2.076 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 25 ms on average.
