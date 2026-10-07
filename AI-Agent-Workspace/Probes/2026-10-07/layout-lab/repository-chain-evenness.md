# Layout lab: repository, chain

_Run started 2026-10-07T21:57:23.094Z, finished 2026-10-07T21:57:41.050Z, over a capture of 2026-10-07T19:17:20.925Z (Chrome/145.0.7632.6). 25 configurations, 8 of them one lever at a time, from the grid `membraneEvenness=0,0.5,1,2,5;rowLevelness=0,0.5,1,2,5` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

## The model against the page

The baseline configuration reproduces the page to the pixel: every card's width and height, the placement measure, the picture's size and every membrane label's height are the page's.

Pretext's layout agreed with the page on every text at capture.

## The baseline

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 402,221 (+0.0%) | 275,867 | 159,866 | 1456 (+0.0%) | 2637 | 97 / 4745 | 369 | 4 | 8 | 4,417 × 3,978 | 159,866 | 24,736 | 2,827 | 2.200 |

## Each lever alone

Every lever moved by itself from the baseline, the others held.


### membraneEvenness

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneEvenness=0.5 | 402,682 (+0.1%) | 275,867 | 160,474 | 1414 (-2.9%) | 2952 | 13 / 1388 | 369 | 4 | 8 | 4,417 × 3,967 | 160,474 | 11,040 | 2,326 | 2.145 |
| membraneEvenness=1 | 402,724 (+0.1%) | 275,867 | 160,555 | 1416 (-2.7%) | 2955 | 13 / 1388 | 369 | 4 | 8 | 4,417 × 3,960 | 160,555 | 10,937 | 2,345 | 2.146 |
| membraneEvenness=2 | 403,822 (+0.4%) | 275,867 | 161,450 | 1410 (-3.2%) | 3119 | 13 / 1349 | 369 | 4 | 8 | 4,417 × 3,958 | 161,450 | 10,371 | 2,257 | 2.159 |
| membraneEvenness=5 | 417,669 (+3.8%) | 275,867 | 175,363 | 1385 (-4.9%) | 4477 | 13 / 1342 | 369 | 4 | 8 | 4,417 × 4,197 | 175,363 | 4,126 | 1,214 | 2.297 |

### rowLevelness

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rowLevelness=0.5 | 402,162 (-0.0%) | 275,867 | 159,866 | 1436 (-1.4%) | 2637 | 97 / 4745 | 369 | 4 | 8 | 4,417 × 3,978 | 159,866 | 24,736 | 2,827 | 2.196 |
| rowLevelness=1 | 402,568 (+0.1%) | 275,867 | 160,245 | 1443 (-0.9%) | 2629 | 97 / 4758 | 369 | 4 | 8 | 4,417 × 3,978 | 160,245 | 24,399 | 2,448 | 2.198 |
| rowLevelness=2 | 402,541 (+0.1%) | 275,867 | 160,665 | 1464 (+0.5%) | 2585 | 96 / 4777 | 369 | 4 | 8 | 4,417 × 3,860 | 160,665 | 23,211 | 2,155 | 2.196 |
| rowLevelness=5 | 402,777 (+0.1%) | 275,867 | 160,923 | 1464 (+0.5%) | 2595 | 96 / 4788 | 369 | 4 | 8 | 4,417 × 3,860 | 160,923 | 23,745 | 2,037 | 2.198 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneEvenness=0.5 rowLevelness=5 | 403,125 (+0.2%) | 275,867 | 161,014 | 1427 (-2.0%) | 2889 | 13 / 1402 | 369 | 4 | 8 | 4,417 × 3,944 | 161,014 | 11,427 | 2,024 | 2.144 |
| membraneEvenness=0.5 rowLevelness=0.5 | 402,615 (+0.1%) | 275,867 | 160,460 | 1418 (-2.6%) | 2935 | 13 / 1393 | 369 | 4 | 8 | 4,417 × 3,967 | 160,460 | 11,068 | 2,312 | 2.145 |
| membraneEvenness=1 rowLevelness=2 | 402,906 (+0.2%) | 275,867 | 160,810 | 1416 (-2.7%) | 2939 | 13 / 1393 | 369 | 4 | 8 | 4,417 × 3,954 | 160,810 | 10,840 | 2,190 | 2.145 |
| membraneEvenness=0.5 | 402,682 (+0.1%) | 275,867 | 160,474 | 1414 (-2.9%) | 2952 | 13 / 1388 | 369 | 4 | 8 | 4,417 × 3,967 | 160,474 | 11,040 | 2,326 | 2.145 |
| membraneEvenness=1 | 402,724 (+0.1%) | 275,867 | 160,555 | 1416 (-2.7%) | 2955 | 13 / 1388 | 369 | 4 | 8 | 4,417 × 3,960 | 160,555 | 10,937 | 2,345 | 2.146 |
| membraneEvenness=0.5 rowLevelness=1 | 402,616 (+0.1%) | 275,867 | 160,463 | 1426 (-2.1%) | 2937 | 13 / 1393 | 369 | 4 | 8 | 4,417 × 3,967 | 160,463 | 11,063 | 2,311 | 2.147 |
| membraneEvenness=0.5 rowLevelness=2 | 402,865 (+0.2%) | 275,867 | 160,651 | 1430 (-1.8%) | 2923 | 13 / 1392 | 369 | 4 | 8 | 4,417 × 3,957 | 160,651 | 11,099 | 2,173 | 2.147 |
| membraneEvenness=1 rowLevelness=1 | 402,881 (+0.2%) | 275,867 | 160,747 | 1424 (-2.2%) | 2954 | 13 / 1390 | 369 | 4 | 8 | 4,417 × 3,960 | 160,747 | 10,856 | 2,224 | 2.148 |
| membraneEvenness=1 rowLevelness=0.5 | 402,689 (+0.1%) | 275,867 | 160,535 | 1432 (-1.6%) | 2954 | 13 / 1390 | 369 | 4 | 8 | 4,417 × 3,960 | 160,535 | 10,957 | 2,335 | 2.149 |
| membraneEvenness=1 rowLevelness=5 | 404,239 (+0.5%) | 275,867 | 162,278 | 1410 (-3.2%) | 3013 | 13 / 1402 | 369 | 4 | 8 | 4,417 × 3,929 | 162,278 | 10,411 | 1,910 | 2.152 |
| membraneEvenness=2 | 403,822 (+0.4%) | 275,867 | 161,450 | 1410 (-3.2%) | 3119 | 13 / 1349 | 369 | 4 | 8 | 4,417 × 3,958 | 161,450 | 10,371 | 2,257 | 2.159 |
| membraneEvenness=2 rowLevelness=0.5 | 403,791 (+0.4%) | 275,867 | 161,348 | 1401 (-3.8%) | 3146 | 13 / 1344 | 369 | 4 | 8 | 4,417 × 3,975 | 161,348 | 10,422 | 2,240 | 2.159 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rowLevelness=0.5 | 402,162 (-0.0%) | 275,867 | 159,866 | 1436 (-1.4%) | 2637 | 97 / 4745 | 369 | 4 | 8 | 4,417 × 3,978 | 159,866 | 24,736 | 2,827 | 2.196 |
| membraneEvenness=0.5 rowLevelness=0.5 | 402,615 (+0.1%) | 275,867 | 160,460 | 1418 (-2.6%) | 2935 | 13 / 1393 | 369 | 4 | 8 | 4,417 × 3,967 | 160,460 | 11,068 | 2,312 | 2.145 |
| membraneEvenness=0.5 | 402,682 (+0.1%) | 275,867 | 160,474 | 1414 (-2.9%) | 2952 | 13 / 1388 | 369 | 4 | 8 | 4,417 × 3,967 | 160,474 | 11,040 | 2,326 | 2.145 |
| membraneEvenness=2 rowLevelness=0.5 | 403,791 (+0.4%) | 275,867 | 161,348 | 1401 (-3.8%) | 3146 | 13 / 1344 | 369 | 4 | 8 | 4,417 × 3,975 | 161,348 | 10,422 | 2,240 | 2.159 |
| membraneEvenness=2 rowLevelness=1 | 404,094 (+0.5%) | 275,867 | 161,875 | 1398 (-4.0%) | 3206 | 13 / 1344 | 369 | 4 | 8 | 4,417 × 3,975 | 161,875 | 10,200 | 2,108 | 2.164 |
| membraneEvenness=2 rowLevelness=2 | 414,342 (+3.0%) | 275,867 | 172,284 | 1383 (-5.0%) | 4369 | 13 / 1344 | 369 | 4 | 8 | 4,417 × 3,987 | 172,284 | 5,516 | 1,117 | 2.275 |
| membraneEvenness=5 rowLevelness=0.5 | 417,479 (+3.8%) | 275,867 | 175,351 | 1361 (-6.5%) | 4471 | 13 / 1345 | 369 | 4 | 8 | 4,417 × 4,197 | 175,351 | 4,129 | 1,208 | 2.291 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 718 ms on average.
