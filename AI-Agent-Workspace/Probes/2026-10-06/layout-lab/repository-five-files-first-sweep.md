# Layout lab: repository, five files

_Run started 2026-10-06T20:39:59.712Z, finished 2026-10-06T20:42:59.426Z, over a capture of 2026-10-06T20:28:17.195Z (Chrome/145.0.7632.6). 432 configurations, 31 of them one lever at a time, from the grid `rankingPull=0,0.5,1,2,5;rankingTie=fewest,right,left;orderSeed=none,1,2,3,4,5,6,7,8;orderSweeps=4,8;symbolOrder=layout,alphabetical,appearance;columnGap=60,100,140;itemGap=16,24,32;bandGap=16,28,40;membraneNeck=40,60,90;membranePadding=8,12,18;cardMaxWidth=none,480,400,320,260` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

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
| rankingPull=0.5 | 373,803 (+0.0%) | 156,684 | 253,355 | 668 (+0.0%) | 12861 | 62 / 1835 | 190 | 0 | 7 | 3,851 × 3,936 | 253,355 | 2.200 |
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

### columnGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| columnGap=60 | 363,219 (-2.8%) | 140,924 | 253,355 | 594 (-11.1%) | 12856 | 58 / 1585 | 190 | 0 | 7 | 3,611 × 3,936 | 253,355 | 2.125 |
| columnGap=140 | 384,624 (+2.9%) | 172,444 | 253,355 | 689 (+3.1%) | 12858 | 64 / 2006 | 190 | 0 | 7 | 4,091 × 3,936 | 253,355 | 2.248 |

### itemGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| itemGap=16 | 367,227 (-1.8%) | 156,684 | 246,245 | 660 (-1.2%) | 12508 | 61 / 1737 | 190 | 0 | 7 | 3,851 × 3,840 | 246,245 | 2.166 |
| itemGap=32 | 380,422 (+1.8%) | 156,684 | 260,467 | 658 (-1.5%) | 13184 | 62 / 1930 | 190 | 0 | 7 | 3,851 × 4,032 | 260,467 | 2.226 |

### bandGap

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| bandGap=16 | 366,285 (-2.0%) | 156,684 | 245,623 | 684 (+2.4%) | 12631 | 62 / 1759 | 190 | 0 | 7 | 3,851 × 3,828 | 245,623 | 2.177 |
| bandGap=40 | 381,341 (+2.0%) | 156,684 | 261,095 | 649 (-2.8%) | 13080 | 61 / 1910 | 190 | 0 | 7 | 3,851 × 4,044 | 261,095 | 2.222 |

### membraneNeck

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneNeck=40 | 371,445 (-0.6%) | 156,684 | 250,967 | 681 (+1.9%) | 12729 | 62 / 1810 | 190 | 0 | 7 | 3,851 × 3,896 | 250,967 | 2.195 |
| membraneNeck=90 | 377,477 (+1.0%) | 156,684 | 257,142 | 651 (-2.5%) | 13042 | 62 / 1881 | 190 | 0 | 7 | 3,851 × 3,996 | 257,142 | 2.209 |

### membranePadding

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membranePadding=8 | 359,951 (-3.7%) | 147,428 | 245,955 | 632 (-5.4%) | 12434 | 63 / 1819 | 190 | 0 | 7 | 3,659 × 3,808 | 245,955 | 2.136 |
| membranePadding=18 | 394,787 (+5.6%) | 171,180 | 264,098 | 683 (+2.2%) | 13482 | 62 / 1889 | 190 | 0 | 7 | 4,148 × 4,116 | 264,098 | 2.280 |

### cardMaxWidth

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cardMaxWidth=480 | 371,837 (-0.5%) | 154,044 | 254,045 | 669 (+0.1%) | 12832 | 62 / 1840 | 190 | 0 | 7 | 3,802 × 3,936 | 254,045 | 2.195 |
| cardMaxWidth=400 | 366,901 (-1.8%) | 149,108 | 254,045 | 670 (+0.3%) | 12848 | 62 / 1841 | 190 | 0 | 7 | 3,640 × 3,936 | 254,045 | 2.183 |
| cardMaxWidth=320 | 364,723 (-2.4%) | 141,044 | 260,357 | 644 (-3.6%) | 12952 | 63 / 1903 | 190 | 0 | 7 | 3,409 × 4,015 | 260,357 | 2.172 |
| cardMaxWidth=260 | 358,444 (-4.1%) | 131,260 | 263,970 | 637 (-4.6%) | 13146 | 64 / 1937 | 190 | 0 | 7 | 3,098 × 4,063 | 263,970 | 2.158 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=alphabetical columnGap=60 itemGap=16 membraneNeck=90 membranePadding=8 cardMaxWidth=260 | 244,055 (-34.7%) | 120,624 | 149,092 | 547 (-18.1%) | 1535 | 41 / 1105 | 232 | 0 | 7 | 2,684 × 2,646 | 149,092 | 1.550 |
| rankingPull=2 orderSeed=5 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 254,374 (-31.9%) | 137,164 | 146,116 | 566 (-15.3%) | 3418 | 44 / 1152 | 230 | 0 | 7 | 2,924 × 3,033 | 146,116 | 1.628 |
| rankingPull=5 rankingTie=left orderSeed=7 symbolOrder=appearance columnGap=60 itemGap=32 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 270,764 (-27.6%) | 146,446 | 149,093 | 496 (-25.7%) | 3630 | 43 / 1161 | 297 | 0 | 7 | 2,684 × 2,928 | 149,093 | 1.641 |
| rankingPull=2 rankingTie=right orderSeed=8 symbolOrder=appearance columnGap=60 itemGap=16 bandGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 258,043 (-31.0%) | 120,624 | 163,443 | 586 (-12.3%) | 4133 | 35 / 1009 | 232 | 0 | 7 | 2,684 × 2,881 | 163,443 | 1.646 |
| rankingPull=2 rankingTie=left orderSeed=2 columnGap=60 itemGap=16 bandGap=40 membraneNeck=90 membranePadding=8 cardMaxWidth=480 | 261,979 (-29.9%) | 143,384 | 142,975 | 606 (-9.3%) | 3490 | 42 / 690 | 219 | 0 | 7 | 3,525 × 3,208 | 142,975 | 1.646 |
| rankingPull=2 rankingTie=right orderSeed=2 symbolOrder=alphabetical itemGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 266,108 (-28.8%) | 149,941 | 146,321 | 628 (-6.0%) | 1321 | 46 / 1291 | 232 | 0 | 7 | 3,295 × 2,530 | 146,321 | 1.649 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=alphabetical columnGap=60 bandGap=40 cardMaxWidth=320 | 275,759 (-26.2%) | 144,925 | 159,615 | 583 (-12.7%) | 1509 | 37 / 1158 | 232 | 0 | 7 | 3,279 × 2,826 | 159,615 | 1.658 |
| rankingPull=0.5 rankingTie=left orderSeed=7 columnGap=60 itemGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 232,847 (-37.7%) | 104,340 | 154,326 | 695 (+4.0%) | 3208 | 58 / 1884 | 190 | 0 | 7 | 2,634 × 3,047 | 154,326 | 1.665 |
| rankingPull=1 rankingTie=left orderSeed=7 symbolOrder=alphabetical columnGap=60 itemGap=32 bandGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=320 | 243,613 (-34.8%) | 114,124 | 155,842 | 731 (+9.4%) | 3215 | 50 / 1297 | 190 | 0 | 7 | 2,945 × 3,090 | 155,842 | 1.679 |
| rankingPull=5 rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance columnGap=60 itemGap=32 bandGap=40 membraneNeck=90 membranePadding=8 cardMaxWidth=260 | 277,872 (-25.7%) | 146,446 | 156,905 | 488 (-26.9%) | 3892 | 49 / 1394 | 297 | 0 | 7 | 2,684 × 3,198 | 156,905 | 1.680 |
| rankingPull=2 rankingTie=right orderSeed=1 columnGap=60 membraneNeck=90 cardMaxWidth=320 | 285,976 (-23.5%) | 144,925 | 169,685 | 477 (-28.6%) | 4522 | 38 / 960 | 232 | 0 | 7 | 3,279 × 3,097 | 169,685 | 1.681 |
| rankingTie=left orderSeed=7 symbolOrder=alphabetical columnGap=60 itemGap=16 bandGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=400 | 244,759 (-34.5%) | 123,126 | 147,713 | 731 (+9.4%) | 3067 | 60 / 1392 | 188 | 0 | 7 | 3,208 × 3,042 | 147,713 | 1.684 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rankingPull=0.5 rankingTie=left orderSeed=7 columnGap=60 itemGap=16 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 232,847 (-37.7%) | 104,340 | 154,326 | 695 (+4.0%) | 3208 | 58 / 1884 | 190 | 0 | 7 | 2,634 × 3,047 | 154,326 | 1.665 |
| rankingTie=right orderSeed=7 symbolOrder=appearance columnGap=60 itemGap=32 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 243,642 (-34.8%) | 104,340 | 165,328 | 688 (+3.0%) | 3440 | 60 / 2006 | 190 | 0 | 7 | 2,634 × 3,195 | 165,328 | 1.705 |
| rankingPull=2 rankingTie=right orderSweeps=8 orderSeed=2 symbolOrder=alphabetical columnGap=60 itemGap=16 membraneNeck=90 membranePadding=8 cardMaxWidth=260 | 244,055 (-34.7%) | 120,624 | 149,092 | 547 (-18.1%) | 1535 | 41 / 1105 | 232 | 0 | 7 | 2,684 × 2,646 | 149,092 | 1.550 |
| rankingPull=5 rankingTie=left orderSeed=7 symbolOrder=appearance columnGap=60 itemGap=32 membraneNeck=40 membranePadding=8 cardMaxWidth=260 | 270,764 (-27.6%) | 146,446 | 149,093 | 496 (-25.7%) | 3630 | 43 / 1161 | 297 | 0 | 7 | 2,684 × 2,928 | 149,093 | 1.641 |
| rankingPull=5 rankingTie=left orderSweeps=8 orderSeed=3 symbolOrder=appearance columnGap=60 itemGap=32 bandGap=40 membraneNeck=90 membranePadding=8 cardMaxWidth=260 | 277,872 (-25.7%) | 146,446 | 156,905 | 488 (-26.9%) | 3892 | 49 / 1394 | 297 | 0 | 7 | 2,684 × 3,198 | 156,905 | 1.680 |
| rankingPull=2 rankingTie=right orderSeed=1 columnGap=60 membraneNeck=90 cardMaxWidth=320 | 285,976 (-23.5%) | 144,925 | 169,685 | 477 (-28.6%) | 4522 | 38 / 960 | 232 | 0 | 7 | 3,279 × 3,097 | 169,685 | 1.681 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 416 ms on average.
