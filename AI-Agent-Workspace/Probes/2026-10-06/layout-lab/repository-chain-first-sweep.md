# Layout lab: repository, chain

_Run started 2026-10-06T20:43:09.920Z, finished 2026-10-06T20:45:50.841Z, over a capture of 2026-10-06T20:28:32.860Z (Chrome/145.0.7632.6). 432 configurations, 31 of them one lever at a time, from the grid `rankingPull=0,0.5,1,2,5;rankingTie=fewest,right,left;orderSeed=none,1,2,3,4,5,6,7,8;orderSweeps=4,8;symbolOrder=layout,alphabetical,appearance;columnGap=60,100,140;itemGap=16,24,32;bandGap=16,28,40;membraneNeck=40,60,90;membranePadding=8,12,18;cardMaxWidth=none,480,400,320,260` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

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
| rankingPull=0.5 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
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

### columnGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| columnGap=60 | 309,003 (-5.6%) | 212,996 | 120,069 | 1090 (-5.9%) | 1516 | 62 / 3035 | 320 | 1 | 8 | 4,210 × 3,437 | 120,069 | 2.120 |
| columnGap=140 | 346,404 (+5.8%) | 257,156 | 120,069 | 1231 (+6.3%) | 1517 | 63 / 3392 | 320 | 1 | 8 | 4,770 × 3,437 | 120,069 | 2.282 |

### itemGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| itemGap=16 | 324,765 (-0.8%) | 235,076 | 117,161 | 1156 (-0.2%) | 1505 | 64 / 3133 | 320 | 1 | 8 | 4,490 × 3,349 | 117,161 | 2.185 |
| itemGap=32 | 330,062 (+0.8%) | 235,076 | 123,013 | 1145 (-1.1%) | 1549 | 62 / 3305 | 320 | 1 | 8 | 4,490 × 3,525 | 123,013 | 2.214 |

### bandGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| bandGap=16 | 324,659 (-0.8%) | 235,076 | 117,057 | 1151 (-0.6%) | 1526 | 60 / 3147 | 320 | 1 | 8 | 4,490 × 3,365 | 117,057 | 2.187 |
| bandGap=40 | 330,188 (+0.9%) | 235,076 | 123,089 | 1148 (-0.9%) | 1509 | 64 / 3299 | 320 | 1 | 8 | 4,490 × 3,509 | 123,089 | 2.209 |

### membraneNeck

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneNeck=40 | 327,240 (-0.0%) | 235,076 | 119,789 | 1151 (-0.6%) | 1488 | 62 / 3230 | 320 | 1 | 8 | 4,490 × 3,437 | 119,789 | 2.194 |
| membraneNeck=90 | 327,746 (+0.1%) | 235,076 | 120,489 | 1145 (-1.1%) | 1556 | 62 / 3217 | 320 | 1 | 8 | 4,490 × 3,437 | 120,489 | 2.203 |

### membranePadding

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membranePadding=8 | 313,725 (-4.2%) | 221,224 | 118,677 | 1130 (-2.4%) | 1484 | 62 / 3174 | 320 | 1 | 8 | 4,266 × 3,373 | 118,677 | 2.143 |
| membranePadding=18 | 348,023 (+6.3%) | 255,854 | 122,159 | 1224 (+5.7%) | 1564 | 62 / 3287 | 320 | 1 | 8 | 4,826 × 3,533 | 122,159 | 2.291 |

### cardMaxWidth

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cardMaxWidth=480 | 327,403 (+0.0%) | 235,076 | 120,069 | 1158 (+0.0%) | 1515 | 62 / 3227 | 320 | 1 | 8 | 4,490 × 3,437 | 120,069 | 2.200 |
| cardMaxWidth=400 | 320,614 (-2.1%) | 228,287 | 120,069 | 1150 (-0.7%) | 1521 | 62 / 3226 | 320 | 1 | 8 | 4,339 × 3,437 | 120,069 | 2.178 |
| cardMaxWidth=320 | 308,753 (-5.7%) | 214,344 | 122,236 | 1157 (-0.1%) | 1579 | 62 / 3162 | 320 | 1 | 8 | 4,008 × 3,525 | 122,236 | 2.152 |
| cardMaxWidth=260 | 294,099 (-10.2%) | 195,486 | 126,756 | 1149 (-0.8%) | 1625 | 64 / 3118 | 320 | 1 | 8 | 3,560 × 3,592 | 126,756 | 2.112 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=alphabetical columnGap=60 itemGap=16 membraneNeck=90 membranePadding=8 cardMaxWidth=260 | 285,261 (-12.9%) | 158,786 | 150,816 | 995 (-14.1%) | 1095 | 30 / 1548 | 322 | 1 | 8 | 3,040 × 3,570 | 150,816 | 1.925 |
| rankingPull=5 rankingTie=left orderSweeps=8 orderSeed=4 symbolOrder=alphabetical columnGap=60 itemGap=16 bandGap=40 membraneNeck=40 cardMaxWidth=260 | 308,167 (-5.9%) | 188,168 | 148,080 | 1030 (-11.1%) | 383 | 45 / 3184 | 355 | 1 | 8 | 3,280 × 3,899 | 148,080 | 1.971 |
| rankingPull=1 orderSeed=2 symbolOrder=appearance columnGap=60 itemGap=32 bandGap=16 membranePadding=8 cardMaxWidth=320 | 303,729 (-7.2%) | 178,225 | 150,474 | 994 (-14.2%) | 975 | 34 / 1706 | 323 | 1 | 8 | 3,488 × 3,609 | 150,474 | 1.972 |
| rankingPull=5 rankingTie=right orderSweeps=8 orderSeed=4 columnGap=60 itemGap=16 bandGap=16 membranePadding=8 cardMaxWidth=320 | 291,739 (-10.9%) | 198,392 | 115,939 | 1017 (-12.2%) | 771 | 61 / 3851 | 367 | 1 | 8 | 3,520 × 3,402 | 115,939 | 1.975 |
| rankingPull=1 rankingTie=left orderSeed=7 symbolOrder=alphabetical columnGap=60 itemGap=32 bandGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 295,340 (-9.8%) | 178,668 | 139,684 | 949 (-18.0%) | 1142 | 59 / 3094 | 324 | 1 | 8 | 3,488 × 3,511 | 139,684 | 1.997 |
| rankingPull=5 orderSweeps=8 orderSeed=8 symbolOrder=appearance columnGap=60 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 299,157 (-8.6%) | 198,392 | 124,048 | 1042 (-10.0%) | 706 | 60 / 3987 | 367 | 1 | 8 | 3,520 × 3,592 | 124,048 | 2.005 |
| rankingPull=0.5 rankingTie=right orderSeed=8 symbolOrder=alphabetical columnGap=60 itemGap=16 bandGap=40 membranePadding=8 cardMaxWidth=320 | 279,439 (-14.6%) | 176,860 | 124,842 | 1045 (-9.8%) | 1516 | 57 / 2730 | 320 | 1 | 8 | 3,488 × 3,452 | 124,842 | 2.009 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance columnGap=60 itemGap=16 bandGap=40 membraneNeck=40 membranePadding=8 | 310,491 (-5.2%) | 201,092 | 132,973 | 910 (-21.4%) | 1078 | 73 / 3042 | 324 | 1 | 8 | 3,986 × 3,288 | 132,973 | 2.016 |
| rankingPull=1 rankingTie=right orderSeed=1 symbolOrder=appearance columnGap=60 bandGap=40 membranePadding=8 cardMaxWidth=400 | 318,780 (-2.6%) | 192,219 | 151,713 | 973 (-16.0%) | 935 | 40 / 1914 | 322 | 1 | 8 | 3,823 × 3,720 | 151,713 | 2.017 |
| rankingPull=2 rankingTie=left orderSeed=2 columnGap=60 itemGap=16 bandGap=40 membraneNeck=90 membranePadding=8 cardMaxWidth=480 | 321,317 (-1.9%) | 200,172 | 145,736 | 948 (-18.1%) | 988 | 45 / 1829 | 322 | 1 | 8 | 3,986 × 3,599 | 145,736 | 2.019 |
| rankingPull=2 rankingTie=left orderSeed=7 symbolOrder=alphabetical columnGap=60 itemGap=16 bandGap=40 cardMaxWidth=260 | 295,775 (-9.7%) | 174,254 | 147,193 | 986 (-14.9%) | 1307 | 64 / 2760 | 322 | 1 | 8 | 3,280 × 3,624 | 147,193 | 2.022 |
| rankingPull=2 rankingTie=right orderSeed=2 symbolOrder=alphabetical itemGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 317,136 (-3.1%) | 199,933 | 146,282 | 1099 (-5.1%) | 908 | 33 / 1772 | 322 | 1 | 8 | 3,768 × 3,550 | 146,282 | 2.031 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=0.5 rankingTie=left orderSeed=7 columnGap=60 itemGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 278,007 (-15.1%) | 158,002 | 143,832 | 1039 (-10.3%) | 3433 | 87 / 4827 | 320 | 1 | 8 | 3,040 × 3,332 | 143,832 | 2.318 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=alphabetical columnGap=60 itemGap=16 membraneNeck=90 membranePadding=8 cardMaxWidth=260 | 285,261 (-12.9%) | 158,786 | 150,816 | 995 (-14.1%) | 1095 | 30 / 1548 | 322 | 1 | 8 | 3,040 × 3,570 | 150,816 | 1.925 |
| rankingPull=1 rankingTie=left orderSeed=7 symbolOrder=alphabetical columnGap=60 itemGap=32 bandGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 295,340 (-9.8%) | 178,668 | 139,684 | 949 (-18.0%) | 1142 | 59 / 3094 | 324 | 1 | 8 | 3,488 × 3,511 | 139,684 | 1.997 |
| rankingPull=1 rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance columnGap=60 itemGap=16 bandGap=40 membraneNeck=40 membranePadding=8 | 310,491 (-5.2%) | 201,092 | 132,973 | 910 (-21.4%) | 1078 | 73 / 3042 | 324 | 1 | 8 | 3,986 × 3,288 | 132,973 | 2.016 |
| rankingPull=1 orderSweeps=8 orderSeed=4 symbolOrder=appearance columnGap=60 bandGap=40 membraneNeck=40 membranePadding=8 cardMaxWidth=480 | 319,908 (-2.3%) | 200,649 | 143,472 | 905 (-21.8%) | 1435 | 70 / 3162 | 323 | 1 | 8 | 3,986 × 3,678 | 143,472 | 2.106 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 372 ms on average.
