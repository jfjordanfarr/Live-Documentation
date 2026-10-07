# Layout lab: estate, five files

_Run started 2026-10-07T22:00:59.877Z, finished 2026-10-07T22:01:02.026Z, over a capture of 2026-10-07T22:00:53.360Z (Chrome/145.0.7632.6). 25 configurations, 8 of them one lever at a time, from the grid `membraneEvenness=0,0.5,1,2,5;rowLevelness=0,0.5,1,2,5` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

## The model against the page

The baseline configuration reproduces the page to the pixel: every card's width and height, the placement measure, the picture's size and every membrane label's height are the page's.

Pretext's layout agreed with the page on every text at capture.

## The baseline

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 65,373 (+0.0%) | 52,495 | 20,051 | 49 (+0.0%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2,161 | 580 | 2.200 |

## Each lever alone

Every lever moved by itself from the baseline, the others held.


### membraneEvenness

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneEvenness=0.5 | 65,394 (+0.0%) | 52,495 | 20,051 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,504 | 20,051 | 886 | 580 | 2.144 |
| membraneEvenness=1 | 65,468 (+0.1%) | 52,495 | 20,136 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,504 | 20,136 | 801 | 495 | 2.145 |
| membraneEvenness=2 | 65,486 (+0.2%) | 52,495 | 20,188 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,556 | 20,188 | 749 | 495 | 2.149 |
| membraneEvenness=5 | 66,140 (+1.2%) | 52,495 | 21,152 | 55 (+12.2%) | 270 | 1 / 17 | 111 | 1 | 9 | 3,160 × 1,448 | 21,152 | 455 | 414 | 2.309 |

### rowLevelness

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rowLevelness=0.5 | 65,373 (+0.0%) | 52,495 | 20,051 | 49 (+0.0%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2,161 | 580 | 2.200 |
| rowLevelness=1 | 65,373 (+0.0%) | 52,495 | 20,051 | 49 (+0.0%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2,161 | 580 | 2.200 |
| rowLevelness=2 | 65,474 (+0.2%) | 52,495 | 20,164 | 49 (+0.0%) | 160 | 4 / 65 | 111 | 1 | 9 | 3,160 × 1,500 | 20,164 | 1,991 | 467 | 2.203 |
| rowLevelness=5 | 65,596 (+0.3%) | 52,495 | 20,386 | 53 (+8.2%) | 210 | 3 / 58 | 111 | 1 | 9 | 3,160 × 1,500 | 20,386 | 1,973 | 393 | 2.281 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneEvenness=0.5 | 65,394 (+0.0%) | 52,495 | 20,051 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,504 | 20,051 | 886 | 580 | 2.144 |
| membraneEvenness=1 | 65,468 (+0.1%) | 52,495 | 20,136 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,504 | 20,136 | 801 | 495 | 2.145 |
| membraneEvenness=0.5 rowLevelness=0.5 | 65,468 (+0.1%) | 52,495 | 20,136 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,504 | 20,136 | 801 | 495 | 2.145 |
| membraneEvenness=0.5 rowLevelness=1 | 65,468 (+0.1%) | 52,495 | 20,136 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,504 | 20,136 | 801 | 495 | 2.145 |
| membraneEvenness=1 rowLevelness=0.5 | 65,468 (+0.1%) | 52,495 | 20,136 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,504 | 20,136 | 801 | 495 | 2.145 |
| membraneEvenness=1 rowLevelness=1 | 65,468 (+0.1%) | 52,495 | 20,136 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,504 | 20,136 | 801 | 495 | 2.145 |
| membraneEvenness=0.5 rowLevelness=2 | 65,493 (+0.2%) | 52,495 | 20,164 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,504 | 20,164 | 801 | 467 | 2.146 |
| membraneEvenness=2 | 65,486 (+0.2%) | 52,495 | 20,188 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,556 | 20,188 | 749 | 495 | 2.149 |
| membraneEvenness=2 rowLevelness=0.5 | 65,486 (+0.2%) | 52,495 | 20,188 | 50 (+2.0%) | 160 | 2 / 24 | 111 | 1 | 9 | 3,160 × 1,556 | 20,188 | 749 | 495 | 2.149 |
| baseline | 65,373 (+0.0%) | 52,495 | 20,051 | 49 (+0.0%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2,161 | 580 | 2.200 |
| rowLevelness=0.5 | 65,373 (+0.0%) | 52,495 | 20,051 | 49 (+0.0%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2,161 | 580 | 2.200 |
| rowLevelness=1 | 65,373 (+0.0%) | 52,495 | 20,051 | 49 (+0.0%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2,161 | 580 | 2.200 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 65,373 (+0.0%) | 52,495 | 20,051 | 49 (+0.0%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2,161 | 580 | 2.200 |
| rowLevelness=0.5 | 65,373 (+0.0%) | 52,495 | 20,051 | 49 (+0.0%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2,161 | 580 | 2.200 |
| rowLevelness=1 | 65,373 (+0.0%) | 52,495 | 20,051 | 49 (+0.0%) | 160 | 5 / 64 | 111 | 1 | 9 | 3,160 × 1,500 | 20,051 | 2,161 | 580 | 2.200 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 86 ms on average.
