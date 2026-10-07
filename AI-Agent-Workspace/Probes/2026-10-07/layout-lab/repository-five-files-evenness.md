# Layout lab: repository, five files

_Run started 2026-10-07T21:56:59.560Z, finished 2026-10-07T21:57:12.500Z, over a capture of 2026-10-07T19:12:55.109Z (Chrome/145.0.7632.6). 25 configurations, 8 of them one lever at a time, from the grid `membraneEvenness=0,0.5,1,2,5;rowLevelness=0,0.5,1,2,5` with seed 1. Weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline scores 2.200 by definition._

## The model against the page

The baseline configuration reproduces the page to the pixel: every card's width and height, the placement measure, the picture's size and every membrane label's height are the page's.

Pretext's layout agreed with the page on every text at capture.

## The baseline

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 299,570 (+0.0%) | 157,074 | 175,954 | 796 (+0.0%) | 3667 | 55 / 2076 | 190 | 0 | 7 | 3,851 × 3,322 | 175,954 | 17,762 | 1,177 | 2.200 |

## Each lever alone

Every lever moved by itself from the baseline, the others held.


### membraneEvenness

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneEvenness=0.5 | 299,862 (+0.1%) | 157,074 | 176,162 | 780 (-2.0%) | 3714 | 29 / 770 | 190 | 0 | 7 | 3,851 × 3,318 | 176,162 | 9,129 | 1,165 | 2.134 |
| membraneEvenness=1 | 299,952 (+0.1%) | 157,074 | 176,226 | 779 (-2.1%) | 3723 | 29 / 770 | 190 | 0 | 7 | 3,851 × 3,318 | 176,226 | 9,043 | 1,164 | 2.135 |
| membraneEvenness=2 | 301,486 (+0.6%) | 157,074 | 177,935 | 778 (-2.3%) | 3863 | 28 / 719 | 190 | 0 | 7 | 3,851 × 3,289 | 177,935 | 7,551 | 775 | 2.144 |
| membraneEvenness=5 | 308,297 (+2.9%) | 157,074 | 185,348 | 765 (-3.9%) | 4096 | 27 / 679 | 190 | 0 | 7 | 3,851 × 3,528 | 185,348 | 4,491 | 665 | 2.180 |

### rowLevelness

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rowLevelness=0.5 | 299,602 (+0.0%) | 157,074 | 175,958 | 797 (+0.1%) | 3661 | 54 / 2081 | 190 | 0 | 7 | 3,851 × 3,318 | 175,958 | 17,714 | 1,165 | 2.200 |
| rowLevelness=1 | 299,598 (+0.0%) | 157,074 | 175,958 | 800 (+0.5%) | 3661 | 54 / 2081 | 190 | 0 | 7 | 3,851 × 3,318 | 175,958 | 17,714 | 1,165 | 2.201 |
| rowLevelness=2 | 299,598 (+0.0%) | 157,074 | 175,958 | 800 (+0.5%) | 3661 | 54 / 2081 | 190 | 0 | 7 | 3,851 × 3,318 | 175,958 | 17,714 | 1,165 | 2.201 |
| rowLevelness=5 | 302,111 (+0.8%) | 157,074 | 178,311 | 798 (+0.3%) | 3677 | 46 / 2142 | 190 | 0 | 7 | 3,851 × 3,267 | 178,311 | 16,892 | 511 | 2.211 |

## The best found, by the weighted score

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| membraneEvenness=0.5 | 299,862 (+0.1%) | 157,074 | 176,162 | 780 (-2.0%) | 3714 | 29 / 770 | 190 | 0 | 7 | 3,851 × 3,318 | 176,162 | 9,129 | 1,165 | 2.134 |
| membraneEvenness=1 | 299,952 (+0.1%) | 157,074 | 176,226 | 779 (-2.1%) | 3723 | 29 / 770 | 190 | 0 | 7 | 3,851 × 3,318 | 176,226 | 9,043 | 1,164 | 2.135 |
| membraneEvenness=0.5 rowLevelness=1 | 299,906 (+0.1%) | 157,074 | 176,182 | 781 (-1.9%) | 3717 | 29 / 770 | 190 | 0 | 7 | 3,851 × 3,318 | 176,182 | 9,094 | 1,160 | 2.135 |
| membraneEvenness=0.5 rowLevelness=0.5 | 299,887 (+0.1%) | 157,074 | 176,162 | 782 (-1.8%) | 3714 | 29 / 770 | 190 | 0 | 7 | 3,851 × 3,318 | 176,162 | 9,129 | 1,165 | 2.135 |
| membraneEvenness=1 rowLevelness=0.5 | 301,076 (+0.5%) | 157,074 | 177,248 | 781 (-1.9%) | 3853 | 29 / 694 | 190 | 0 | 7 | 3,851 × 3,318 | 177,248 | 8,021 | 858 | 2.143 |
| membraneEvenness=0.5 rowLevelness=2 | 300,052 (+0.2%) | 157,074 | 176,450 | 803 (+0.9%) | 3778 | 29 / 695 | 190 | 0 | 7 | 3,851 × 3,318 | 176,450 | 8,875 | 1,026 | 2.144 |
| membraneEvenness=2 | 301,486 (+0.6%) | 157,074 | 177,935 | 778 (-2.3%) | 3863 | 28 / 719 | 190 | 0 | 7 | 3,851 × 3,289 | 177,935 | 7,551 | 775 | 2.144 |
| membraneEvenness=1 rowLevelness=1 | 301,167 (+0.5%) | 157,074 | 177,378 | 785 (-1.4%) | 3867 | 28 / 695 | 190 | 0 | 7 | 3,851 × 3,308 | 177,378 | 7,911 | 828 | 2.145 |
| membraneEvenness=1 rowLevelness=2 | 301,214 (+0.5%) | 157,074 | 177,723 | 789 (-0.9%) | 3890 | 28 / 718 | 190 | 0 | 7 | 3,851 × 3,289 | 177,723 | 7,691 | 722 | 2.149 |
| membraneEvenness=2 rowLevelness=0.5 | 304,833 (+1.8%) | 157,074 | 181,647 | 777 (-2.4%) | 3902 | 27 / 707 | 190 | 0 | 7 | 3,851 × 3,289 | 181,647 | 5,695 | 722 | 2.156 |
| membraneEvenness=2 rowLevelness=1 | 304,837 (+1.8%) | 157,074 | 181,647 | 777 (-2.4%) | 3902 | 27 / 707 | 190 | 0 | 7 | 3,851 × 3,289 | 181,647 | 5,695 | 722 | 2.156 |
| membraneEvenness=2 rowLevelness=2 | 304,837 (+1.8%) | 157,074 | 181,647 | 777 (-2.4%) | 3902 | 27 / 707 | 190 | 0 | 7 | 3,851 × 3,289 | 181,647 | 5,695 | 722 | 2.156 |

## The trade between length and crossings

The configurations no other beats on both the length and the crossing spots, shortest first.

| Configuration | Length px (vs baseline) | Horizontal | Vertical | Crossing spots (vs baseline) | Foreign samples | Escaping wires / samples | Lane passages | Backward | Columns | Picture w × h | Placement measure | Unevenness | Unlevel | Score |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 299,570 (+0.0%) | 157,074 | 175,954 | 796 (+0.0%) | 3667 | 55 / 2076 | 190 | 0 | 7 | 3,851 × 3,322 | 175,954 | 17,762 | 1,177 | 2.200 |
| membraneEvenness=0.5 | 299,862 (+0.1%) | 157,074 | 176,162 | 780 (-2.0%) | 3714 | 29 / 770 | 190 | 0 | 7 | 3,851 × 3,318 | 176,162 | 9,129 | 1,165 | 2.134 |
| membraneEvenness=1 | 299,952 (+0.1%) | 157,074 | 176,226 | 779 (-2.1%) | 3723 | 29 / 770 | 190 | 0 | 7 | 3,851 × 3,318 | 176,226 | 9,043 | 1,164 | 2.135 |
| membraneEvenness=2 | 301,486 (+0.6%) | 157,074 | 177,935 | 778 (-2.3%) | 3863 | 28 / 719 | 190 | 0 | 7 | 3,851 × 3,289 | 177,935 | 7,551 | 775 | 2.144 |
| membraneEvenness=2 rowLevelness=0.5 | 304,833 (+1.8%) | 157,074 | 181,647 | 777 (-2.4%) | 3902 | 27 / 707 | 190 | 0 | 7 | 3,851 × 3,289 | 181,647 | 5,695 | 722 | 2.156 |
| membraneEvenness=5 | 308,297 (+2.9%) | 157,074 | 185,348 | 765 (-3.9%) | 4096 | 27 / 679 | 190 | 0 | 7 | 3,851 × 3,528 | 185,348 | 4,491 | 665 | 2.180 |
| membraneEvenness=5 rowLevelness=0.5 | 308,297 (+2.9%) | 157,074 | 185,348 | 765 (-3.9%) | 4096 | 27 / 679 | 190 | 0 | 7 | 3,851 × 3,528 | 185,348 | 4,491 | 665 | 2.180 |
| membraneEvenness=5 rowLevelness=1 | 308,297 (+2.9%) | 157,074 | 185,348 | 765 (-3.9%) | 4096 | 27 / 679 | 190 | 0 | 7 | 3,851 × 3,528 | 185,348 | 4,491 | 665 | 2.180 |
| membraneEvenness=5 rowLevelness=2 | 308,297 (+2.9%) | 157,074 | 185,348 | 765 (-3.9%) | 4096 | 27 / 679 | 190 | 0 | 7 | 3,851 × 3,528 | 185,348 | 4,491 | 665 | 2.180 |
| membraneEvenness=5 rowLevelness=5 | 308,297 (+2.9%) | 157,074 | 185,348 | 765 (-3.9%) | 4096 | 27 / 679 | 190 | 0 | 7 | 3,851 × 3,528 | 185,348 | 4,491 | 665 | 2.180 |

## What the numbers are

- Length is the routes' arc length in the picture's pixels, horizontal and vertical parts summed over points every eight pixels, as the deck reads a drawn wire; the deck's screen pixels equal these at its scale of 1.
- Crossing spots are the deck's own count over the same sampled routes.
- Foreign samples are points of a wire inside a membrane that holds neither of its ends; escaping wires have both ends in one membrane and leave it. The membranes here are the sharp outlines; the page rounds the corners by the padding.
- A note under a card the page never showed ("+N symbols", "N references read back") is set from the font's glyph widths, one line unless its words overflow; every other text is Pretext's layout of the page's own measurement.
- A solve took 518 ms on average.
