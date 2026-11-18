# Layout lab: repository, chain

_Run started 2026-10-06T20:51:21.425Z, finished 2026-10-06T20:55:23.347Z, over a capture of 2026-10-06T20:28:32.860Z (Chrome/145.0.7632.6). 648 configurations, 16 of them one lever at a time, from the grid `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSeed=none,1,2,3,4,5,6,7,8;orderSweeps=4,8;symbolOrder=layout,alphabetical,appearance` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

## The model against the page

The baseline configuration reproduces the page to the pixel: every card's width and height, the placement measure, the picture's size and every membrane label's height are the page's.

Pretext's layout agreed with the page on every text at capture.

## The baseline

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |

## Each lever alone

Every lever moved by itself from the baseline, the others held.


### rankingPull

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=1 | 350,786 (+7.1%) | 236,797 | 145,080 | 1075 (-7.2%) | 956 | 39 / 1995 | 323 | 1 | 8 | 4,490 × 3,633 | 145,080 | 2.144 |
| rankingPull=2 | 353,315 (+7.9%) | 236,248 | 148,043 | 1056 (-8.8%) | 957 | 43 / 2073 | 322 | 1 | 8 | 4,490 × 3,711 | 148,043 | 2.151 |
| rankingPull=5 | 359,168 (+9.7%) | 262,765 | 125,906 | 1119 (-3.4%) | 1114 | 73 / 4648 | 367 | 1 | 8 | 4,577 × 3,643 | 125,906 | 2.284 |

### rankingTie

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingTie=right | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=left | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |

### orderSeed

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSeed=1 | 347,076 (+6.0%) | 235,076 | 141,947 | 1247 (+7.7%) | 3320 | 91 / 5426 | 320 | 1 | 8 | 4,490 × 3,356 | 141,947 | 2.587 |
| orderSeed=2 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| orderSeed=3 | 370,739 (+13.2%) | 235,076 | 172,238 | 1120 (-3.3%) | 1458 | 105 / 4203 | 320 | 1 | 8 | 4,490 × 3,250 | 172,238 | 2.340 |
| orderSeed=4 | 347,076 (+6.0%) | 235,076 | 141,947 | 1247 (+7.7%) | 3320 | 91 / 5426 | 320 | 1 | 8 | 4,490 × 3,356 | 141,947 | 2.587 |
| orderSeed=5 | 380,176 (+16.1%) | 235,076 | 179,920 | 1225 (+5.8%) | 3765 | 93 / 3217 | 320 | 1 | 8 | 4,490 × 2,805 | 179,920 | 2.657 |
| orderSeed=6 | 330,621 (+1.0%) | 235,076 | 124,343 | 1164 (+0.5%) | 1845 | 63 / 3252 | 320 | 1 | 8 | 4,490 × 3,437 | 124,343 | 2.256 |
| orderSeed=7 | 347,076 (+6.0%) | 235,076 | 141,947 | 1247 (+7.7%) | 3320 | 91 / 5426 | 320 | 1 | 8 | 4,490 × 3,356 | 141,947 | 2.587 |
| orderSeed=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |

### orderSweeps

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| orderSweeps=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |

### symbolOrder

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| symbolOrder=alphabetical | 331,135 (+1.1%) | 235,076 | 124,121 | 1182 (+2.1%) | 1531 | 55 / 3028 | 320 | 1 | 8 | 4,490 × 3,444 | 124,121 | 2.214 |
| symbolOrder=appearance | 329,209 (+0.6%) | 235,076 | 123,323 | 1187 (+2.5%) | 1529 | 57 / 3177 | 320 | 1 | 8 | 4,490 × 3,430 | 123,323 | 2.213 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=1 | 350,786 (+7.1%) | 236,797 | 145,080 | 1075 (-7.2%) | 956 | 39 / 1995 | 323 | 1 | 8 | 4,490 × 3,633 | 145,080 | 2.144 |
| rankingPull=1 orderSweeps=8 | 350,786 (+7.1%) | 236,797 | 145,080 | 1075 (-7.2%) | 956 | 39 / 1995 | 323 | 1 | 8 | 4,490 × 3,633 | 145,080 | 2.144 |
| rankingPull=1 orderSeed=2 | 350,786 (+7.1%) | 236,797 | 145,080 | 1075 (-7.2%) | 956 | 39 / 1995 | 323 | 1 | 8 | 4,490 × 3,633 | 145,080 | 2.144 |
| rankingPull=1 orderSweeps=8 orderSeed=2 | 350,786 (+7.1%) | 236,797 | 145,080 | 1075 (-7.2%) | 956 | 39 / 1995 | 323 | 1 | 8 | 4,490 × 3,633 | 145,080 | 2.144 |
| rankingPull=1 orderSeed=7 | 341,736 (+4.4%) | 236,797 | 133,744 | 937 (-19.1%) | 1193 | 69 / 3270 | 323 | 1 | 8 | 4,490 × 3,515 | 133,744 | 2.148 |
| rankingPull=1 orderSweeps=8 orderSeed=7 | 341,736 (+4.4%) | 236,797 | 133,744 | 937 (-19.1%) | 1193 | 69 / 3270 | 323 | 1 | 8 | 4,490 × 3,515 | 133,744 | 2.148 |
| rankingPull=1 rankingTie=left | 351,389 (+7.3%) | 237,312 | 145,378 | 1084 (-6.4%) | 956 | 39 / 1998 | 324 | 1 | 8 | 4,490 × 3,633 | 145,378 | 2.148 |
| rankingPull=1 rankingTie=left orderSweeps=8 | 351,389 (+7.3%) | 237,312 | 145,378 | 1084 (-6.4%) | 956 | 39 / 1998 | 324 | 1 | 8 | 4,490 × 3,633 | 145,378 | 2.148 |
| rankingPull=1 rankingTie=left orderSeed=1 | 351,389 (+7.3%) | 237,312 | 145,378 | 1084 (-6.4%) | 956 | 39 / 1998 | 324 | 1 | 8 | 4,490 × 3,633 | 145,378 | 2.148 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=1 | 351,389 (+7.3%) | 237,312 | 145,378 | 1084 (-6.4%) | 956 | 39 / 1998 | 324 | 1 | 8 | 4,490 × 3,633 | 145,378 | 2.148 |
| rankingPull=1 rankingTie=left orderSeed=2 | 351,389 (+7.3%) | 237,312 | 145,378 | 1084 (-6.4%) | 956 | 39 / 1998 | 324 | 1 | 8 | 4,490 × 3,633 | 145,378 | 2.148 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=2 | 351,389 (+7.3%) | 237,312 | 145,378 | 1084 (-6.4%) | 956 | 39 / 1998 | 324 | 1 | 8 | 4,490 × 3,633 | 145,378 | 2.148 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=right | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=left | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| orderSeed=2 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| orderSeed=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| orderSweeps=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| orderSweeps=8 orderSeed=2 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| orderSweeps=8 orderSeed=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=right orderSweeps=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=right orderSeed=2 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=right orderSweeps=8 orderSeed=2 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=right orderSeed=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=right orderSweeps=8 orderSeed=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=left orderSweeps=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=left orderSeed=2 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=left orderSweeps=8 orderSeed=2 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=left orderSeed=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingTie=left orderSweeps=8 orderSeed=8 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| rankingPull=1 orderSeed=1 | 335,846 (+2.6%) | 236,797 | 127,225 | 1157 (-0.1%) | 1823 | 64 / 3208 | 323 | 1 | 8 | 4,490 × 3,709 | 127,225 | 2.274 |
| rankingPull=1 orderSweeps=8 orderSeed=1 | 335,846 (+2.6%) | 236,797 | 127,225 | 1157 (-0.1%) | 1823 | 64 / 3208 | 323 | 1 | 8 | 4,490 × 3,709 | 127,225 | 2.274 |
| rankingPull=1 orderSeed=7 | 341,736 (+4.4%) | 236,797 | 133,744 | 937 (-19.1%) | 1193 | 69 / 3270 | 323 | 1 | 8 | 4,490 × 3,515 | 133,744 | 2.148 |
| rankingPull=1 orderSweeps=8 orderSeed=7 | 341,736 (+4.4%) | 236,797 | 133,744 | 937 (-19.1%) | 1193 | 69 / 3270 | 323 | 1 | 8 | 4,490 × 3,515 | 133,744 | 2.148 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 373 ms on average.
