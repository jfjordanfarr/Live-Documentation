# Layout lab: estate, five files

_Run started 2026-10-06T20:46:00.652Z, finished 2026-10-06T20:46:27.399Z, over a capture of 2026-10-06T20:30:56.193Z (Chrome/145.0.7632.6). 432 configurations, 31 of them one lever at a time, from the grid `rankingPull=0,0.5,1,2,5;rankingTie=fewest,right,left;orderSeed=none,1,2,3,4,5,6,7,8;orderSweeps=4,8;symbolOrder=layout,alphabetical,appearance;columnGap=60,100,140;itemGap=16,24,32;bandGap=16,28,40;membraneNeck=40,60,90;membranePadding=8,12,18;cardMaxWidth=none,480,400,320,260` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

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
| rankingPull=0.5 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
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

### columnGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| columnGap=60 | 59,722 (-9.4%) | 45,015 | 20,860 | 56 (-12.5%) | 205 | 5 / 50 | 111 | 1 | 9 | 2,840 × 1,433 | 20,860 | 2.032 |
| columnGap=140 | 72,668 (+10.2%) | 59,975 | 20,860 | 65 (+1.6%) | 216 | 5 / 91 | 111 | 1 | 9 | 3,480 × 1,433 | 20,860 | 2.336 |

### itemGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| itemGap=16 | 65,524 (-0.6%) | 52,495 | 20,324 | 63 (-1.6%) | 192 | 5 / 72 | 111 | 1 | 9 | 3,160 × 1,417 | 20,324 | 2.169 |
| itemGap=32 | 66,386 (+0.7%) | 52,495 | 21,396 | 63 (-1.6%) | 209 | 5 / 76 | 111 | 1 | 9 | 3,160 × 1,449 | 21,396 | 2.206 |

### bandGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| bandGap=16 | 64,950 (-1.5%) | 52,495 | 19,708 | 64 (+0.0%) | 216 | 5 / 70 | 111 | 1 | 9 | 3,160 × 1,373 | 19,708 | 2.182 |
| bandGap=40 | 66,972 (+1.5%) | 52,495 | 22,028 | 62 (-3.1%) | 196 | 5 / 81 | 111 | 1 | 9 | 3,160 × 1,493 | 22,028 | 2.207 |

### membraneNeck

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneNeck=40 | 65,446 (-0.8%) | 52,495 | 20,284 | 64 (+0.0%) | 155 | 5 / 85 | 111 | 1 | 9 | 3,160 × 1,433 | 20,284 | 2.156 |
| membraneNeck=90 | 66,731 (+1.2%) | 52,495 | 21,760 | 63 (-1.6%) | 322 | 4 / 60 | 111 | 1 | 9 | 3,160 × 1,433 | 21,760 | 2.296 |

### membranePadding

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membranePadding=8 | 63,706 (-3.4%) | 50,319 | 20,572 | 65 (+1.6%) | 205 | 5 / 76 | 111 | 1 | 9 | 3,040 × 1,381 | 20,572 | 2.166 |
| membranePadding=18 | 69,335 (+5.1%) | 55,759 | 21,304 | 66 (+3.1%) | 215 | 5 / 75 | 111 | 1 | 9 | 3,340 × 1,511 | 21,304 | 2.273 |

### cardMaxWidth

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cardMaxWidth=480 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
| cardMaxWidth=400 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
| cardMaxWidth=320 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |
| cardMaxWidth=260 | 65,951 (+0.0%) | 52,495 | 20,860 | 64 (+0.0%) | 209 | 5 / 74 | 111 | 1 | 9 | 3,160 × 1,433 | 20,860 | 2.200 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=1 orderSeed=2 columnGap=60 bandGap=16 membraneNeck=40 cardMaxWidth=480 | 57,615 (-12.6%) | 45,015 | 18,355 | 49 (-23.4%) | 100 | 5 / 49 | 111 | 1 | 9 | 2,840 × 1,440 | 18,355 | 1.866 |
| rankingPull=1 orderSeed=1 columnGap=60 membraneNeck=40 | 58,634 (-11.1%) | 45,015 | 19,531 | 46 (-28.1%) | 100 | 5 / 51 | 111 | 1 | 9 | 2,840 × 1,500 | 19,531 | 1.874 |
| rankingPull=2 rankingTie=right orderSeed=8 symbolOrder=appearance columnGap=60 itemGap=16 bandGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 55,084 (-16.5%) | 42,839 | 17,894 | 59 (-7.8%) | 135 | 6 / 60 | 111 | 1 | 9 | 2,720 × 1,166 | 17,894 | 1.903 |
| rankingPull=1 orderSweeps=8 orderSeed=1 symbolOrder=alphabetical columnGap=60 itemGap=16 bandGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=480 | 55,236 (-16.2%) | 42,839 | 18,068 | 61 (-4.7%) | 135 | 5 / 55 | 111 | 1 | 9 | 2,720 × 1,316 | 18,068 | 1.919 |
| rankingPull=0.5 orderSweeps=8 orderSeed=1 columnGap=60 itemGap=16 membraneNeck=40 membranePadding=18 cardMaxWidth=480 | 61,526 (-6.7%) | 48,279 | 19,531 | 48 (-25.0%) | 100 | 4 / 45 | 111 | 1 | 9 | 3,020 × 1,562 | 19,531 | 1.923 |
| rankingPull=0.5 rankingTie=left orderSeed=7 columnGap=60 itemGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 56,679 (-14.1%) | 42,839 | 19,460 | 55 (-14.1%) | 135 | 5 / 62 | 111 | 1 | 9 | 2,720 × 1,365 | 19,460 | 1.925 |
| rankingTie=left orderSeed=2 symbolOrder=alphabetical columnGap=60 itemGap=32 membranePadding=8 cardMaxWidth=320 | 57,352 (-13.0%) | 42,839 | 20,334 | 50 (-21.9%) | 153 | 6 / 53 | 111 | 1 | 9 | 2,720 × 1,488 | 20,334 | 1.926 |
| rankingTie=left orderSeed=2 columnGap=60 itemGap=16 bandGap=40 membraneNeck=40 membranePadding=18 cardMaxWidth=260 | 62,558 (-5.1%) | 48,279 | 20,707 | 45 (-29.7%) | 110 | 4 / 48 | 111 | 1 | 9 | 3,020 × 1,622 | 20,707 | 1.943 |
| rankingTie=left orderSweeps=8 orderSeed=1 columnGap=60 itemGap=16 bandGap=40 membraneNeck=40 membranePadding=18 cardMaxWidth=480 | 62,558 (-5.1%) | 48,279 | 20,707 | 45 (-29.7%) | 110 | 4 / 48 | 111 | 1 | 9 | 3,020 × 1,622 | 20,707 | 1.943 |
| rankingPull=1 orderSeed=2 columnGap=60 bandGap=16 membranePadding=18 cardMaxWidth=480 | 61,269 (-7.1%) | 48,279 | 19,355 | 48 (-25.0%) | 142 | 4 / 35 | 111 | 1 | 9 | 3,020 × 1,518 | 19,355 | 1.943 |
| rankingPull=1 orderSeed=2 symbolOrder=appearance columnGap=60 itemGap=32 bandGap=16 membranePadding=8 cardMaxWidth=320 | 55,319 (-16.1%) | 42,839 | 18,406 | 57 (-10.9%) | 196 | 6 / 53 | 111 | 1 | 9 | 2,720 × 1,208 | 18,406 | 1.949 |
| rankingPull=1 rankingTie=left orderSeed=8 symbolOrder=appearance columnGap=60 itemGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 56,024 (-15.1%) | 42,839 | 18,924 | 63 (-1.6%) | 135 | 6 / 67 | 111 | 1 | 9 | 2,720 × 1,227 | 18,924 | 1.950 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance columnGap=60 bandGap=16 membraneNeck=40 membranePadding=8 | 54,678 (-17.1%) | 42,839 | 17,073 | 58 (-9.4%) | 225 | 4 / 39 | 111 | 1 | 9 | 2,720 × 1,431 | 17,073 | 1.969 |
| orderSweeps=8 orderSeed=3 columnGap=60 itemGap=16 bandGap=16 membraneNeck=90 membranePadding=8 cardMaxWidth=480 | 55,004 (-16.6%) | 42,839 | 17,525 | 56 (-12.5%) | 284 | 5 / 43 | 111 | 1 | 9 | 2,720 × 1,394 | 17,525 | 2.024 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance columnGap=60 itemGap=16 bandGap=40 membraneNeck=40 membranePadding=8 | 55,776 (-15.4%) | 42,839 | 18,393 | 55 (-14.1%) | 210 | 5 / 53 | 111 | 1 | 9 | 2,720 × 1,548 | 18,393 | 1.984 |
| rankingPull=1 rankingTie=right orderSeed=1 symbolOrder=appearance columnGap=60 bandGap=40 membranePadding=8 cardMaxWidth=400 | 56,499 (-14.3%) | 42,839 | 19,802 | 54 (-15.6%) | 215 | 7 / 55 | 111 | 1 | 9 | 2,720 × 1,309 | 19,802 | 1.981 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=alphabetical columnGap=60 itemGap=16 membraneNeck=90 membranePadding=8 cardMaxWidth=260 | 57,096 (-13.4%) | 42,839 | 20,058 | 51 (-20.3%) | 221 | 5 / 36 | 111 | 1 | 9 | 2,720 × 1,440 | 20,058 | 1.965 |
| rankingTie=left orderSeed=2 symbolOrder=alphabetical columnGap=60 itemGap=32 membranePadding=8 cardMaxWidth=320 | 57,352 (-13.0%) | 42,839 | 20,334 | 50 (-21.9%) | 153 | 6 / 53 | 111 | 1 | 9 | 2,720 × 1,488 | 20,334 | 1.926 |
| rankingPull=1 orderSeed=2 columnGap=60 bandGap=16 membraneNeck=40 cardMaxWidth=480 | 57,615 (-12.6%) | 45,015 | 18,355 | 49 (-23.4%) | 100 | 5 / 49 | 111 | 1 | 9 | 2,840 × 1,440 | 18,355 | 1.866 |
| rankingPull=2 rankingTie=left orderSeed=2 columnGap=60 itemGap=16 bandGap=40 membraneNeck=90 membranePadding=8 cardMaxWidth=480 | 58,257 (-11.7%) | 42,839 | 21,207 | 47 (-26.6%) | 238 | 4 / 35 | 111 | 1 | 9 | 2,720 × 1,492 | 21,207 | 1.983 |
| rankingPull=1 orderSeed=1 columnGap=60 membraneNeck=40 | 58,634 (-11.1%) | 45,015 | 19,531 | 46 (-28.1%) | 100 | 5 / 51 | 111 | 1 | 9 | 2,840 × 1,500 | 19,531 | 1.874 |
| rankingTie=left orderSeed=2 columnGap=60 itemGap=16 bandGap=40 membraneNeck=40 membranePadding=18 cardMaxWidth=260 | 62,558 (-5.1%) | 48,279 | 20,707 | 45 (-29.7%) | 110 | 4 / 48 | 111 | 1 | 9 | 3,020 × 1,622 | 20,707 | 1.943 |
| rankingTie=left orderSweeps=8 orderSeed=1 columnGap=60 itemGap=16 bandGap=40 membraneNeck=40 membranePadding=18 cardMaxWidth=480 | 62,558 (-5.1%) | 48,279 | 20,707 | 45 (-29.7%) | 110 | 4 / 48 | 111 | 1 | 9 | 3,020 × 1,622 | 20,707 | 1.943 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 62 ms on average.
