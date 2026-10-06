# Layout lab: estate, chain

_Run started 2026-10-06T20:46:36.477Z, finished 2026-10-06T20:46:47.463Z, over a capture of 2026-10-06T20:31:07.324Z (Chrome/145.0.7632.6). 432 configurations, 31 of them one lever at a time, from the grid `rankingPull=0,0.5,1,2,5;rankingTie=fewest,right,left;orderSeed=none,1,2,3,4,5,6,7,8;orderSweeps=4,8;symbolOrder=layout,alphabetical,appearance;columnGap=60,100,140;itemGap=16,24,32;bandGap=16,28,40;membraneNeck=40,60,90;membranePadding=8,12,18;cardMaxWidth=none,480,400,320,260` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

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
| rankingPull=0.5 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |
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

### columnGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| columnGap=60 | 33,125 (-12.2%) | 28,233 | 7,901 | 33 (-2.9%) | 105 | 2 / 7 | 75 | 0 | 9 | 2,726 × 842 | 7,901 | 2.028 |
| columnGap=140 | 42,527 (+12.7%) | 38,393 | 7,901 | 34 (+0.0%) | 110 | 2 / 17 | 75 | 0 | 9 | 3,366 × 842 | 7,901 | 2.378 |

### itemGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| itemGap=16 | 37,596 (-0.3%) | 33,313 | 7,719 | 34 (+0.0%) | 105 | 2 / 11 | 75 | 0 | 9 | 3,046 × 834 | 7,719 | 2.187 |
| itemGap=32 | 37,839 (+0.3%) | 33,313 | 8,093 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 849 | 8,093 | 2.204 |

### bandGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| bandGap=16 | 37,437 (-0.8%) | 33,313 | 7,629 | 33 (-2.9%) | 110 | 2 / 9 | 75 | 0 | 9 | 3,046 × 814 | 7,629 | 2.165 |
| bandGap=40 | 38,008 (+0.7%) | 33,313 | 8,217 | 33 (-2.9%) | 110 | 2 / 16 | 75 | 0 | 9 | 3,046 × 856 | 8,217 | 2.243 |

### membraneNeck

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneNeck=40 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |
| membraneNeck=90 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |

### membranePadding

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membranePadding=8 | 36,456 (-3.4%) | 32,065 | 7,781 | 33 (-2.9%) | 105 | 2 / 14 | 75 | 0 | 9 | 2,942 × 814 | 7,781 | 2.171 |
| membranePadding=18 | 39,654 (+5.1%) | 35,185 | 8,081 | 33 (-2.9%) | 115 | 2 / 11 | 75 | 0 | 9 | 3,202 × 884 | 8,081 | 2.258 |

### cardMaxWidth

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cardMaxWidth=480 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |
| cardMaxWidth=400 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |
| cardMaxWidth=320 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |
| cardMaxWidth=260 | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 2.200 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=2 rankingTie=right orderSeed=8 symbolOrder=appearance columnGap=60 itemGap=16 bandGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 31,152 (-17.4%) | 26,985 | 6,978 | 26 (-23.5%) | 0 | 1 / 6 | 75 | 0 | 9 | 2,622 × 804 | 6,978 | 1.701 |
| rankingPull=5 orderSweeps=8 orderSeed=8 symbolOrder=appearance columnGap=60 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 31,564 (-16.3%) | 26,985 | 7,434 | 25 (-26.5%) | 0 | 2 / 8 | 75 | 0 | 9 | 2,622 × 840 | 7,434 | 1.724 |
| rankingPull=1 rankingTie=left orderSeed=8 symbolOrder=appearance columnGap=60 itemGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 31,442 (-16.7%) | 26,985 | 7,262 | 26 (-23.5%) | 0 | 2 / 8 | 75 | 0 | 9 | 2,622 × 830 | 7,262 | 1.728 |
| rankingPull=2 rankingTie=right orderSeed=8 symbolOrder=appearance columnGap=60 itemGap=16 membraneNeck=90 membranePadding=8 cardMaxWidth=320 | 31,442 (-16.7%) | 26,985 | 7,262 | 26 (-23.5%) | 0 | 2 / 8 | 75 | 0 | 9 | 2,622 × 830 | 7,262 | 1.728 |
| rankingPull=1 rankingTie=right orderSeed=8 symbolOrder=appearance columnGap=60 bandGap=40 membranePadding=8 cardMaxWidth=320 | 31,843 (-15.6%) | 26,985 | 7,734 | 25 (-26.5%) | 0 | 2 / 10 | 75 | 0 | 9 | 2,622 × 858 | 7,734 | 1.750 |
| rankingTie=right orderSeed=8 symbolOrder=appearance columnGap=60 itemGap=32 | 32,890 (-12.8%) | 28,233 | 7,738 | 26 (-23.5%) | 0 | 1 / 6 | 75 | 0 | 9 | 2,726 × 876 | 7,738 | 1.755 |
| rankingPull=1 orderSweeps=8 orderSeed=8 columnGap=60 itemGap=32 membraneNeck=90 membranePadding=8 cardMaxWidth=320 | 31,723 (-15.9%) | 26,985 | 7,502 | 29 (-14.7%) | 0 | 2 / 8 | 75 | 0 | 9 | 2,622 × 782 | 7,502 | 1.756 |
| orderSweeps=8 orderSeed=8 columnGap=60 bandGap=16 membraneNeck=40 cardMaxWidth=400 | 32,502 (-13.9%) | 28,233 | 7,158 | 30 (-11.8%) | 0 | 1 / 5 | 75 | 0 | 9 | 2,726 × 783 | 7,158 | 1.761 |
| rankingPull=5 rankingTie=left orderSeed=8 symbolOrder=appearance columnGap=60 bandGap=16 membranePadding=18 | 34,351 (-9.0%) | 30,105 | 7,450 | 25 (-26.5%) | 0 | 1 / 3 | 75 | 0 | 9 | 2,882 × 894 | 7,450 | 1.762 |
| orderSweeps=8 orderSeed=1 symbolOrder=appearance columnGap=60 itemGap=32 bandGap=16 membraneNeck=40 cardMaxWidth=480 | 32,687 (-13.4%) | 28,233 | 7,507 | 29 (-14.7%) | 0 | 1 / 5 | 75 | 0 | 9 | 2,726 × 846 | 7,507 | 1.764 |
| rankingPull=2 orderSeed=8 columnGap=60 itemGap=16 bandGap=16 membraneNeck=90 | 32,358 (-14.2%) | 28,233 | 7,012 | 31 (-8.8%) | 0 | 1 / 5 | 75 | 0 | 9 | 2,726 × 775 | 7,012 | 1.765 |
| rankingTie=right orderSeed=8 columnGap=60 bandGap=40 membraneNeck=90 membranePadding=8 cardMaxWidth=480 | 31,833 (-15.6%) | 26,985 | 7,692 | 28 (-17.6%) | 0 | 2 / 10 | 75 | 0 | 9 | 2,622 × 779 | 7,692 | 1.767 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=5 rankingTie=right orderSweeps=8 orderSeed=4 columnGap=60 itemGap=16 bandGap=16 membranePadding=8 cardMaxWidth=320 | 30,985 (-17.9%) | 26,985 | 6,575 | 28 (-17.6%) | 32 | 2 / 25 | 75 | 0 | 9 | 2,622 × 925 | 6,575 | 1.947 |
| orderSweeps=8 orderSeed=3 columnGap=60 itemGap=16 bandGap=16 membraneNeck=90 membranePadding=8 cardMaxWidth=480 | 30,985 (-17.9%) | 26,985 | 6,575 | 28 (-17.6%) | 32 | 2 / 25 | 75 | 0 | 9 | 2,622 × 925 | 6,575 | 1.947 |
| rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance columnGap=60 bandGap=16 membraneNeck=40 membranePadding=8 | 31,079 (-17.6%) | 26,985 | 6,670 | 27 (-20.6%) | 28 | 2 / 25 | 75 | 0 | 9 | 2,622 × 972 | 6,670 | 1.939 |
| rankingPull=5 symbolOrder=appearance columnGap=60 bandGap=16 membraneNeck=90 membranePadding=8 cardMaxWidth=400 | 31,134 (-17.5%) | 26,985 | 6,756 | 26 (-23.5%) | 0 | 2 / 25 | 75 | 0 | 9 | 2,622 × 981 | 6,756 | 1.879 |
| rankingPull=5 orderSweeps=8 orderSeed=8 symbolOrder=appearance columnGap=60 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 31,564 (-16.3%) | 26,985 | 7,434 | 25 (-26.5%) | 0 | 2 / 8 | 75 | 0 | 9 | 2,622 × 840 | 7,434 | 1.724 |
| rankingPull=5 rankingTie=right orderSeed=5 symbolOrder=appearance columnGap=60 bandGap=16 membraneNeck=40 | 32,355 (-14.2%) | 28,233 | 6,872 | 24 (-29.4%) | 0 | 2 / 23 | 75 | 0 | 9 | 2,726 × 1,015 | 6,872 | 1.882 |
| rankingPull=5 rankingTie=left symbolOrder=appearance columnGap=60 itemGap=32 bandGap=40 membranePadding=18 cardMaxWidth=320 | 34,798 (-7.8%) | 30,105 | 7,790 | 23 (-32.4%) | 0 | 2 / 26 | 75 | 0 | 9 | 2,882 × 1,149 | 7,790 | 1.978 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 25 ms on average.
