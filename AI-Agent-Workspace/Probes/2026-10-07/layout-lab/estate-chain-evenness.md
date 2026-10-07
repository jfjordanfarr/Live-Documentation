# Layout lab: estate, chain

_Run started 2026-10-07T22:01:23.424Z, finished 2026-10-07T22:01:24.596Z, over a capture of 2026-10-07T22:01:13.203Z (Chrome/145.0.7632.6). 25 configurations, 8 of them one lever at a time, from the grid `membraneEvenness=0,0.5,1,2,5;rowLevelness=0,0.5,1,2,5` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

## The model against the page

The baseline configuration reproduces the page to the pixel: every card's width and height, the placement measure, the picture's size and every membrane label's height are the page's.

Pretext's layout agreed with the page on every text at capture.

## The baseline

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 37,728 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 105 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 922 | 200 | 2.200 |

## Each lever alone

Every lever moved by itself from the baseline, the others held.


### membraneEvenness

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneEvenness=0.5 | 37,275 (-1.2%) | 33,313 | 7,158 | 29 (-14.7%) | 44 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,158 | 52 | 136 | 1.953 |
| membraneEvenness=1 | 37,275 (-1.2%) | 33,313 | 7,158 | 29 (-14.7%) | 44 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,158 | 52 | 136 | 1.953 |
| membraneEvenness=2 | 37,366 (-1.0%) | 33,313 | 7,216 | 29 (-14.7%) | 54 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,216 | 11 | 112 | 1.974 |
| membraneEvenness=5 | 37,373 (-0.9%) | 33,313 | 7,224 | 29 (-14.7%) | 54 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,056 | 7,224 | 7 | 112 | 1.975 |

### rowLevelness

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rowLevelness=0.5 | 37,729 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 110 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 918 | 196 | 2.210 |
| rowLevelness=1 | 37,729 (+0.0%) | 33,313 | 7,901 | 34 (+0.0%) | 110 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,901 | 918 | 196 | 2.210 |
| rowLevelness=2 | 37,877 (+0.4%) | 33,313 | 7,985 | 34 (+0.0%) | 110 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 7,985 | 918 | 154 | 2.213 |
| rowLevelness=5 | 37,891 (+0.4%) | 33,313 | 8,021 | 34 (+0.0%) | 110 | 2 / 12 | 75 | 0 | 9 | 3,046 × 842 | 8,021 | 936 | 145 | 2.214 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneEvenness=0.5 | 37,275 (-1.2%) | 33,313 | 7,158 | 29 (-14.7%) | 44 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,158 | 52 | 136 | 1.953 |
| membraneEvenness=1 | 37,275 (-1.2%) | 33,313 | 7,158 | 29 (-14.7%) | 44 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,158 | 52 | 136 | 1.953 |
| membraneEvenness=0.5 rowLevelness=0.5 | 37,318 (-1.1%) | 33,313 | 7,182 | 29 (-14.7%) | 48 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,182 | 28 | 105 | 1.961 |
| membraneEvenness=0.5 rowLevelness=1 | 37,318 (-1.1%) | 33,313 | 7,182 | 29 (-14.7%) | 48 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,182 | 28 | 105 | 1.961 |
| membraneEvenness=0.5 rowLevelness=2 | 37,318 (-1.1%) | 33,313 | 7,182 | 29 (-14.7%) | 48 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,182 | 28 | 105 | 1.961 |
| membraneEvenness=1 rowLevelness=0.5 | 37,318 (-1.1%) | 33,313 | 7,182 | 29 (-14.7%) | 48 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,182 | 28 | 105 | 1.961 |
| membraneEvenness=1 rowLevelness=1 | 37,318 (-1.1%) | 33,313 | 7,182 | 29 (-14.7%) | 48 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,182 | 28 | 105 | 1.961 |
| membraneEvenness=0.5 rowLevelness=5 | 37,326 (-1.1%) | 33,313 | 7,204 | 29 (-14.7%) | 50 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,204 | 24 | 96 | 1.965 |
| membraneEvenness=1 rowLevelness=5 | 37,326 (-1.1%) | 33,313 | 7,204 | 29 (-14.7%) | 50 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,204 | 24 | 96 | 1.965 |
| membraneEvenness=1 rowLevelness=2 | 37,328 (-1.1%) | 33,313 | 7,194 | 29 (-14.7%) | 52 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,194 | 24 | 101 | 1.969 |
| membraneEvenness=2 rowLevelness=5 | 37,358 (-1.0%) | 33,313 | 7,230 | 29 (-14.7%) | 54 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,230 | 11 | 96 | 1.974 |
| membraneEvenness=2 rowLevelness=0.5 | 37,359 (-1.0%) | 33,313 | 7,216 | 29 (-14.7%) | 54 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,216 | 11 | 105 | 1.974 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneEvenness=0.5 | 37,275 (-1.2%) | 33,313 | 7,158 | 29 (-14.7%) | 44 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,158 | 52 | 136 | 1.953 |
| membraneEvenness=1 | 37,275 (-1.2%) | 33,313 | 7,158 | 29 (-14.7%) | 44 | 0 / 0 | 75 | 0 | 9 | 3,046 × 1,052 | 7,158 | 52 | 136 | 1.953 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 47 ms on average.
