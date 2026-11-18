# Layout lab: repository, five files

_Run started 2026-10-06T20:46:32.190Z, finished 2026-10-06T20:51:11.351Z, over a capture of 2026-10-06T20:28:17.195Z (Chrome/145.0.7632.6). 648 configurations, 16 of them one lever at a time, from the grid `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSeed=none,1,2,3,4,5,6,7,8;orderSweeps=4,8;symbolOrder=layout,alphabetical,appearance` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

## The model against the page

The baseline configuration reproduces the page to the pixel: every card's width and height, the placement measure, the picture's size and every membrane label's height are the page's.

Pretext's layout agreed with the page on every text at capture.

## The baseline

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 373,803 (+0.0%) | 156,684 | 253,355 | 668 (+0.0%) | 12861 | 62 / 1835 | 190 | 0 | 7 | 3,851 × 3,936 | 253,355 | 2.200 |

## Each lever alone

Every lever moved by itself from the baseline, the others held.


### rankingPull

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=1 | 350,843 (-6.1%) | 168,996 | 218,675 | 677 (+1.3%) | 7636 | 59 / 1802 | 211 | 0 | 7 | 4,014 × 3,193 | 218,675 | 2.041 |
| rankingPull=2 | 369,334 (-1.2%) | 179,416 | 228,245 | 566 (-15.3%) | 7726 | 63 / 1519 | 230 | 0 | 7 | 4,014 × 3,399 | 228,245 | 2.032 |
| rankingPull=5 | 368,777 (-1.3%) | 214,590 | 192,663 | 636 (-4.8%) | 2927 | 30 / 1002 | 297 | 0 | 7 | 3,996 × 3,439 | 192,663 | 1.960 |

### rankingTie

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingTie=right | 373,803 (+0.0%) | 156,684 | 253,355 | 668 (+0.0%) | 12861 | 62 / 1835 | 190 | 0 | 7 | 3,851 × 3,936 | 253,355 | 2.200 |
| rankingTie=left | 381,571 (+2.1%) | 155,580 | 262,171 | 608 (-9.0%) | 12718 | 64 / 2240 | 188 | 0 | 7 | 3,851 × 4,109 | 262,171 | 2.218 |

### orderSeed

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSeed=1 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSeed=2 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSeed=3 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSeed=4 | 351,868 (-5.9%) | 156,684 | 228,286 | 658 (-1.5%) | 8994 | 64 / 2478 | 190 | 0 | 7 | 3,851 × 4,230 | 228,286 | 2.119 |
| orderSeed=5 | 284,508 (-23.9%) | 156,684 | 160,416 | 775 (+16.0%) | 3425 | 58 / 2102 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.857 |
| orderSeed=6 | 351,910 (-5.9%) | 156,684 | 228,223 | 660 (-1.2%) | 8991 | 64 / 2496 | 190 | 0 | 7 | 3,851 × 4,230 | 228,223 | 2.121 |
| orderSeed=7 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSeed=8 | 347,618 (-7.0%) | 156,684 | 222,907 | 612 (-8.4%) | 9292 | 59 / 2438 | 190 | 0 | 7 | 3,851 × 4,313 | 222,907 | 2.092 |

### orderSweeps

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSweeps=8 | 373,803 (+0.0%) | 156,684 | 253,355 | 668 (+0.0%) | 12861 | 62 / 1835 | 190 | 0 | 7 | 3,851 × 3,936 | 253,355 | 2.200 |

### symbolOrder

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| symbolOrder=alphabetical | 355,904 (-4.8%) | 156,684 | 235,864 | 830 (+24.3%) | 9646 | 54 / 1808 | 190 | 0 | 7 | 3,851 × 3,689 | 235,864 | 2.167 |
| symbolOrder=appearance | 376,904 (+0.8%) | 156,684 | 257,053 | 816 (+22.2%) | 10965 | 72 / 2206 | 190 | 0 | 7 | 3,851 × 3,936 | 257,053 | 2.265 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=2 rankingTie=right orderSeed=2 | 285,951 (-23.5%) | 180,464 | 136,463 | 574 (-14.1%) | 1169 | 49 / 953 | 232 | 0 | 7 | 4,014 × 2,641 | 136,463 | 1.660 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 | 285,951 (-23.5%) | 180,464 | 136,463 | 574 (-14.1%) | 1169 | 49 / 953 | 232 | 0 | 7 | 4,014 × 2,641 | 136,463 | 1.660 |
| rankingPull=2 orderSeed=1 | 296,635 (-20.6%) | 179,416 | 149,485 | 637 (-4.6%) | 2236 | 43 / 1132 | 230 | 0 | 7 | 4,014 × 2,641 | 149,485 | 1.743 |
| rankingPull=2 orderSweeps=8 orderSeed=1 | 296,635 (-20.6%) | 179,416 | 149,485 | 637 (-4.6%) | 2236 | 43 / 1132 | 230 | 0 | 7 | 4,014 × 2,641 | 149,485 | 1.743 |
| rankingPull=2 rankingTie=left orderSeed=5 | 305,403 (-18.3%) | 173,432 | 163,153 | 529 (-20.8%) | 4925 | 34 / 837 | 219 | 0 | 7 | 4,014 × 2,845 | 163,153 | 1.749 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=5 | 305,403 (-18.3%) | 173,432 | 163,153 | 529 (-20.8%) | 4925 | 34 / 837 | 219 | 0 | 7 | 4,014 × 2,845 | 163,153 | 1.749 |
| rankingPull=2 orderSeed=4 | 294,092 (-21.3%) | 179,416 | 145,401 | 604 (-9.6%) | 3528 | 44 / 1107 | 230 | 0 | 7 | 4,014 × 3,109 | 145,401 | 1.752 |
| rankingPull=2 orderSweeps=8 orderSeed=4 | 294,092 (-21.3%) | 179,416 | 145,401 | 604 (-9.6%) | 3528 | 44 / 1107 | 230 | 0 | 7 | 4,014 × 3,109 | 145,401 | 1.752 |
| rankingPull=2 orderSeed=5 | 294,092 (-21.3%) | 179,416 | 145,401 | 604 (-9.6%) | 3528 | 44 / 1107 | 230 | 0 | 7 | 4,014 × 3,109 | 145,401 | 1.752 |
| rankingPull=2 orderSweeps=8 orderSeed=5 | 294,092 (-21.3%) | 179,416 | 145,401 | 604 (-9.6%) | 3528 | 44 / 1107 | 230 | 0 | 7 | 4,014 × 3,109 | 145,401 | 1.752 |
| rankingPull=2 orderSeed=7 | 294,092 (-21.3%) | 179,416 | 145,401 | 604 (-9.6%) | 3528 | 44 / 1107 | 230 | 0 | 7 | 4,014 × 3,109 | 145,401 | 1.752 |
| rankingPull=2 orderSweeps=8 orderSeed=7 | 294,092 (-21.3%) | 179,416 | 145,401 | 604 (-9.6%) | 3528 | 44 / 1107 | 230 | 0 | 7 | 4,014 × 3,109 | 145,401 | 1.752 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSeed=1 symbolOrder=alphabetical | 279,636 (-25.2%) | 156,684 | 154,242 | 848 (+26.9%) | 3415 | 49 / 1700 | 190 | 0 | 7 | 3,851 × 3,158 | 154,242 | 1.855 |
| orderSweeps=8 orderSeed=1 symbolOrder=alphabetical | 279,636 (-25.2%) | 156,684 | 154,242 | 848 (+26.9%) | 3415 | 49 / 1700 | 190 | 0 | 7 | 3,851 × 3,158 | 154,242 | 1.855 |
| rankingTie=right orderSeed=1 symbolOrder=alphabetical | 279,636 (-25.2%) | 156,684 | 154,242 | 848 (+26.9%) | 3415 | 49 / 1700 | 190 | 0 | 7 | 3,851 × 3,158 | 154,242 | 1.855 |
| rankingTie=right orderSweeps=8 orderSeed=1 symbolOrder=alphabetical | 279,636 (-25.2%) | 156,684 | 154,242 | 848 (+26.9%) | 3415 | 49 / 1700 | 190 | 0 | 7 | 3,851 × 3,158 | 154,242 | 1.855 |
| rankingPull=1 rankingTie=left orderSeed=1 symbolOrder=alphabetical | 279,636 (-25.2%) | 156,684 | 154,242 | 848 (+26.9%) | 3415 | 49 / 1700 | 190 | 0 | 7 | 3,851 × 3,158 | 154,242 | 1.855 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=1 symbolOrder=alphabetical | 279,636 (-25.2%) | 156,684 | 154,242 | 848 (+26.9%) | 3415 | 49 / 1700 | 190 | 0 | 7 | 3,851 × 3,158 | 154,242 | 1.855 |
| orderSeed=7 symbolOrder=alphabetical | 280,639 (-24.9%) | 156,684 | 156,299 | 845 (+26.5%) | 3346 | 50 / 1459 | 190 | 0 | 7 | 3,851 × 3,120 | 156,299 | 1.841 |
| orderSweeps=8 orderSeed=7 symbolOrder=alphabetical | 280,639 (-24.9%) | 156,684 | 156,299 | 845 (+26.5%) | 3346 | 50 / 1459 | 190 | 0 | 7 | 3,851 × 3,120 | 156,299 | 1.841 |
| rankingTie=right orderSeed=7 symbolOrder=alphabetical | 280,639 (-24.9%) | 156,684 | 156,299 | 845 (+26.5%) | 3346 | 50 / 1459 | 190 | 0 | 7 | 3,851 × 3,120 | 156,299 | 1.841 |
| rankingTie=right orderSweeps=8 orderSeed=7 symbolOrder=alphabetical | 280,639 (-24.9%) | 156,684 | 156,299 | 845 (+26.5%) | 3346 | 50 / 1459 | 190 | 0 | 7 | 3,851 × 3,120 | 156,299 | 1.841 |
| rankingPull=1 rankingTie=left orderSeed=7 symbolOrder=alphabetical | 280,639 (-24.9%) | 156,684 | 156,299 | 845 (+26.5%) | 3346 | 50 / 1459 | 190 | 0 | 7 | 3,851 × 3,120 | 156,299 | 1.841 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=7 symbolOrder=alphabetical | 280,639 (-24.9%) | 156,684 | 156,299 | 845 (+26.5%) | 3346 | 50 / 1459 | 190 | 0 | 7 | 3,851 × 3,120 | 156,299 | 1.841 |
| orderSeed=1 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| orderSweeps=8 orderSeed=1 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| orderSeed=2 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| orderSweeps=8 orderSeed=2 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| orderSeed=3 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| orderSweeps=8 orderSeed=3 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| orderSeed=7 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| orderSweeps=8 orderSeed=7 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingTie=right orderSeed=1 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingTie=right orderSweeps=8 orderSeed=1 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingTie=right orderSeed=2 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingTie=right orderSeed=3 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingTie=right orderSweeps=8 orderSeed=3 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingTie=right orderSeed=7 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingTie=right orderSweeps=8 orderSeed=7 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingPull=1 rankingTie=left orderSeed=1 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=1 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingPull=1 rankingTie=left orderSeed=2 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=2 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingPull=1 rankingTie=left orderSeed=3 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingPull=1 rankingTie=left orderSeed=7 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=7 symbolOrder=appearance | 283,185 (-24.2%) | 156,684 | 158,580 | 797 (+19.3%) | 3430 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.861 |
| orderSeed=5 symbolOrder=appearance | 283,384 (-24.2%) | 156,684 | 158,580 | 778 (+16.5%) | 3429 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.853 |
| orderSweeps=8 orderSeed=5 symbolOrder=appearance | 283,384 (-24.2%) | 156,684 | 158,580 | 778 (+16.5%) | 3429 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.853 |
| rankingTie=right orderSeed=5 symbolOrder=appearance | 283,384 (-24.2%) | 156,684 | 158,580 | 778 (+16.5%) | 3429 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.853 |
| rankingTie=right orderSweeps=8 orderSeed=5 symbolOrder=appearance | 283,384 (-24.2%) | 156,684 | 158,580 | 778 (+16.5%) | 3429 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.853 |
| rankingPull=1 rankingTie=left orderSeed=5 symbolOrder=appearance | 283,384 (-24.2%) | 156,684 | 158,580 | 778 (+16.5%) | 3429 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.853 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=5 symbolOrder=appearance | 283,384 (-24.2%) | 156,684 | 158,580 | 778 (+16.5%) | 3429 | 63 / 2051 | 190 | 0 | 7 | 3,851 × 3,166 | 158,580 | 1.853 |
| orderSeed=1 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSeed=2 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSeed=3 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSeed=7 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSweeps=8 orderSeed=1 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSweeps=8 orderSeed=2 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSweeps=8 orderSeed=3 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| orderSweeps=8 orderSeed=7 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingTie=right orderSeed=1 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingTie=right orderSweeps=8 orderSeed=1 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingTie=right orderSeed=2 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingTie=right orderSweeps=8 orderSeed=2 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingTie=right orderSeed=3 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingTie=right orderSweeps=8 orderSeed=3 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingTie=right orderSeed=7 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingTie=right orderSweeps=8 orderSeed=7 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingPull=1 rankingTie=left orderSeed=1 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=1 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingPull=1 rankingTie=left orderSeed=2 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=2 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingPull=1 rankingTie=left orderSeed=3 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=3 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingPull=1 rankingTie=left orderSeed=7 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=7 | 284,428 (-23.9%) | 156,684 | 160,416 | 774 (+15.9%) | 3426 | 60 / 2136 | 190 | 0 | 7 | 3,851 × 3,166 | 160,416 | 1.859 |
| rankingTie=left orderSeed=3 | 285,617 (-23.6%) | 155,580 | 162,371 | 739 (+10.6%) | 3437 | 58 / 2349 | 188 | 0 | 7 | 3,851 × 3,317 | 162,371 | 1.862 |
| rankingTie=left orderSweeps=8 orderSeed=3 | 285,617 (-23.6%) | 155,580 | 162,371 | 739 (+10.6%) | 3437 | 58 / 2349 | 188 | 0 | 7 | 3,851 × 3,317 | 162,371 | 1.862 |
| rankingTie=left orderSeed=7 | 285,617 (-23.6%) | 155,580 | 162,371 | 739 (+10.6%) | 3437 | 58 / 2349 | 188 | 0 | 7 | 3,851 × 3,317 | 162,371 | 1.862 |
| rankingTie=left orderSweeps=8 orderSeed=7 | 285,617 (-23.6%) | 155,580 | 162,371 | 739 (+10.6%) | 3437 | 58 / 2349 | 188 | 0 | 7 | 3,851 × 3,317 | 162,371 | 1.862 |
| rankingPull=2 rankingTie=right orderSeed=2 | 285,951 (-23.5%) | 180,464 | 136,463 | 574 (-14.1%) | 1169 | 49 / 953 | 232 | 0 | 7 | 4,014 × 2,641 | 136,463 | 1.660 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 | 285,951 (-23.5%) | 180,464 | 136,463 | 574 (-14.1%) | 1169 | 49 / 953 | 232 | 0 | 7 | 4,014 × 2,641 | 136,463 | 1.660 |
| rankingPull=2 rankingTie=left orderSeed=5 | 305,403 (-18.3%) | 173,432 | 163,153 | 529 (-20.8%) | 4925 | 34 / 837 | 219 | 0 | 7 | 4,014 × 2,845 | 163,153 | 1.749 |
| rankingPull=2 rankingTie=left orderSweeps=8 orderSeed=5 | 305,403 (-18.3%) | 173,432 | 163,153 | 529 (-20.8%) | 4925 | 34 / 837 | 219 | 0 | 7 | 4,014 × 2,845 | 163,153 | 1.749 |
| rankingPull=2 orderSeed=2 | 310,121 (-17.0%) | 179,416 | 162,499 | 525 (-21.4%) | 4551 | 38 / 1039 | 230 | 0 | 7 | 4,014 × 2,876 | 162,499 | 1.766 |
| rankingPull=2 orderSweeps=8 orderSeed=2 | 310,121 (-17.0%) | 179,416 | 162,499 | 525 (-21.4%) | 4551 | 38 / 1039 | 230 | 0 | 7 | 4,014 × 2,876 | 162,499 | 1.766 |
| rankingPull=2 rankingTie=right orderSeed=4 | 312,752 (-16.3%) | 180,464 | 164,386 | 519 (-22.3%) | 4539 | 41 / 1001 | 232 | 0 | 7 | 4,014 × 3,044 | 164,386 | 1.772 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=4 | 312,752 (-16.3%) | 180,464 | 164,386 | 519 (-22.3%) | 4539 | 41 / 1001 | 232 | 0 | 7 | 4,014 × 3,044 | 164,386 | 1.772 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 431 ms on average.
