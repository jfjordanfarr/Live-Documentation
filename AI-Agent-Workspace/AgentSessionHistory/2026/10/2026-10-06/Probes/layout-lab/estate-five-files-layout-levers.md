# Layout lab: estate, five files

_Run started 2026-10-06T20:45:16.057Z, finished 2026-10-06T20:45:56.425Z, over a capture of 2026-10-06T20:30:56.193Z (Chrome/145.0.7632.6). 648 configurations, 16 of them one lever at a time, from the grid `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSeed=none,1,2,3,4,5,6,7,8;orderSweeps=4,8;symbolOrder=layout,alphabetical,appearance` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

## The model against the page

The baseline configuration reproduces the page to the pixel: every card's width and height, the placement measure, the picture's size and every membrane label's height are the page's.

Pretext's layout agreed with the page on every text at capture.

## The baseline

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |

## Each lever alone

Every lever moved by itself from the baseline, the others held.


### rankingPull

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=1 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
| rankingPull=2 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
| rankingPull=5 | 77,883 (+18.1%) | 67,927 | 16,014 | 66 (+3.1%) | 115 | 17 / 162 | 163 | 1 | 9 | 3,046 × 1,399 | 16,014 | 2.417 |

### rankingTie

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingTie=right | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
| rankingTie=left | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |

### orderSeed

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| orderSeed=3 | 64,065 (-2.9%) | 52,495 | 18,665 | 59 (-7.8%) | 258 | 5 / 61 | 111 | 1 | 9 | 3,160 × 1,508 | 18,665 | 2.183 |
| orderSeed=4 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
| orderSeed=5 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
| orderSeed=6 | 66,317 (+0.6%) | 52,495 | 20,738 | 64 (+0.0%) | 216 | 6 / 81 | 111 | 1 | 9 | 3,160 × 1,295 | 20,738 | 2.212 |
| orderSeed=7 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
| orderSeed=8 | 65,003 (-1.4%) | 52,495 | 20,024 | 65 (+1.6%) | 199 | 6 / 73 | 111 | 1 | 9 | 3,160 × 1,281 | 20,024 | 2.169 |

### orderSweeps

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSweeps=8 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |

### symbolOrder

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| symbolOrder=alphabetical | 67,198 (+1.9%) | 52,495 | 21,406 | 67 (+4.7%) | 227 | 5 / 77 | 111 | 1 | 9 | 3,160 × 1,480 | 21,406 | 2.258 |
| symbolOrder=appearance | 66,365 (+0.6%) | 52,495 | 21,160 | 72 (+12.5%) | 216 | 5 / 78 | 111 | 1 | 9 | 3,160 × 1,533 | 21,160 | 2.263 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=right orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=right orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=right orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=right orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=left orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=left orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=left orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=left orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| orderSweeps=8 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingTie=right orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingTie=right orderSweeps=8 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingTie=left orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingTie=left orderSweeps=8 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=1 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=1 orderSweeps=8 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=1 rankingTie=right orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=1 rankingTie=left orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=2 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=2 orderSweeps=8 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=2 rankingTie=right orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=2 rankingTie=left orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=8 symbolOrder=alphabetical | 63,769 (-3.3%) | 52,495 | 18,154 | 58 (-9.4%) | 209 | 5 / 71 | 111 | 1 | 9 | 3,160 × 1,429 | 18,154 | 2.134 |
| orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| orderSweeps=8 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| orderSweeps=8 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingTie=right orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingTie=right orderSweeps=8 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingTie=right orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingTie=left orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingTie=left orderSweeps=8 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingTie=left orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 orderSweeps=8 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 orderSweeps=8 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 rankingTie=right orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 rankingTie=right orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 rankingTie=left orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 rankingTie=left orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 orderSweeps=8 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 orderSweeps=8 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 rankingTie=right orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 rankingTie=right orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 rankingTie=left orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=1 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 rankingTie=left orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=appearance | 63,797 (-3.3%) | 52,495 | 18,986 | 57 (-10.9%) | 214 | 6 / 74 | 111 | 1 | 9 | 3,160 × 1,301 | 18,986 | 2.130 |
| orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| orderSweeps=8 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingTie=right orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingTie=left orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=1 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=1 orderSweeps=8 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=1 rankingTie=right orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=1 rankingTie=left orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=2 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=2 orderSweeps=8 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=2 rankingTie=right orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=2 rankingTie=left orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=alphabetical | 65,293 (-1.0%) | 52,495 | 20,118 | 56 (-12.5%) | 157 | 6 / 77 | 111 | 1 | 9 | 3,160 × 1,516 | 20,118 | 2.113 |
| orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=right orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=right orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=right orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=right orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=left orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=left orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=left orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingTie=left orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 rankingTie=right orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 rankingTie=right orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 rankingTie=right orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 rankingTie=left orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 rankingTie=left orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 rankingTie=right orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 rankingTie=right orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 rankingTie=left orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=1 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 rankingTie=left orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=2 | 65,373 (-0.9%) | 52,495 | 20,051 | 49 (-23.4%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2.065 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 62 ms on average.
