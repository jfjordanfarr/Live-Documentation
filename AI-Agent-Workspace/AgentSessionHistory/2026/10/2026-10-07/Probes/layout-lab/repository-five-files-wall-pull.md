# Layout lab, the wider space: repository, five files

_Run 2026-10-07T15:18:19.433Z, over a capture of 2026-10-07T13:18:56.776Z (Chrome/145.0.7632.6). 9 settings of the grid `membraneDepth=0,1,none;rankingPull=0,1,2`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 297 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 656 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 161,899 | 691 | 3,562 | 1601 | 58 | 0 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| membraneDepth=0 | 188 | 1.449 | seed 1 | 1.441 | seed 25 | 1.424 | 244,635 | 141,000 | 492 | 2,528 | 0 | 0 | 8 | seed 1 | none | seed 1 | 1.441 |
| rankingPull=1 membraneDepth=0 | 164 | 1.427 | seed 2 | 1.473 | ranked | 1.427 | 241,602 | 124,413 | 507 | 2,675 | 0 | 0 | 5 | seed 2 | none | seed 2 | 1.473 |
| rankingPull=2 membraneDepth=0 | 162 | 1.441 | seed 15 | 1.416 | seed 27 | 1.410 | 234,753 | 112,072 | 521 | 2,481 | 0 | 0 | 7 | ranked | seed 7 after 5; seed 15 after 13 | seed 15 | 1.416 |
| membraneDepth=1 | 204 | 1.712 | seed 2 | 1.642 | seed 2 | 1.642 | 258,650 | 148,736 | 597 | 2,734 | 257 | 66 | 4 | seed 2 | none | seed 2 | 1.642 |
| rankingPull=1 membraneDepth=1 | 214 | 1.673 | seed 1 | 1.604 | seed 1 | 1.604 | 265,683 | 144,813 | 565 | 2,998 | 267 | 56 | 2 | seed 1 | none | seed 1 | 1.604 |
| rankingPull=2 membraneDepth=1 | 194 | 1.591 | seed 9 | 1.557 | seed 9 | 1.557 | 244,673 | 114,637 | 585 | 2,522 | 490 | 52 | 1 | ranked | seed 3 after 1; seed 9 after 7 | seed 9 | 1.557 |
| rankingPull=1 | 486 | 2.041 | seed 3 | 1.805 | seed 3 | 1.805 | 290,969 | 151,854 | 745 | 3,256 | 3818 | 42 | 0 | seed 2 | seed 3 after 1 | seed 3 | 1.805 |
| rankingPull=2 | 478 | 1.795 | seed 23 | 1.798 | seed 1 | 1.780 | 301,157 | 153,097 | 685 | 2,925 | 3373 | 38 | 0 | seed 1 | seed 10 after 8 | seed 10 | 1.800 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=2 membraneDepth=0 | seed 15 | 1.416 | 230,196 | 107,164 | 565 | 2,438 | 0 | 0 | 7 |
| 2 | membraneDepth=0 | seed 1 | 1.441 | 245,168 | 141,753 | 527 | 2,528 | 0 | 0 | 7 |
| 3 | rankingPull=1 membraneDepth=0 | seed 2 | 1.473 | 245,353 | 131,372 | 591 | 2,657 | 0 | 0 | 7 |
| 4 | rankingPull=2 membraneDepth=1 | seed 9 | 1.557 | 244,673 | 114,637 | 585 | 2,522 | 490 | 52 | 1 |
| 5 | rankingPull=1 membraneDepth=1 | seed 1 | 1.604 | 265,683 | 144,813 | 565 | 2,998 | 267 | 56 | 2 |
| 6 | membraneDepth=1 | seed 2 | 1.642 | 258,650 | 148,736 | 597 | 2,734 | 257 | 66 | 4 |
| 7 | baseline | seed 6 | 1.799 | 286,608 | 161,899 | 691 | 3,562 | 1601 | 58 | 0 |
| 8 | rankingPull=2 | seed 10 | 1.800 | 297,541 | 148,365 | 717 | 3,053 | 3548 | 46 | 0 |
| 9 | rankingPull=1 | seed 3 | 1.805 | 290,969 | 151,854 | 745 | 3,256 | 3818 | 42 | 0 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=2 membraneDepth=0 | seed 27 | 1.410 | 234,753 | 112,072 | 521 | 2,481 | 0 | 0 | 7 |
| 2 | membraneDepth=0 | seed 25 | 1.424 | 244,635 | 141,000 | 492 | 2,528 | 0 | 0 | 8 |
| 3 | rankingPull=1 membraneDepth=0 | ranked | 1.427 | 241,602 | 124,413 | 507 | 2,675 | 0 | 0 | 5 |
| 4 | rankingPull=2 membraneDepth=1 | seed 9 | 1.557 | 244,673 | 114,637 | 585 | 2,522 | 490 | 52 | 1 |
| 5 | rankingPull=1 membraneDepth=1 | seed 1 | 1.604 | 265,683 | 144,813 | 565 | 2,998 | 267 | 56 | 2 |
| 6 | membraneDepth=1 | seed 2 | 1.642 | 258,650 | 148,736 | 597 | 2,734 | 257 | 66 | 4 |
| 7 | rankingPull=2 | seed 1 | 1.780 | 301,157 | 153,097 | 685 | 2,925 | 3373 | 38 | 0 |
| 8 | baseline | seed 6 | 1.799 | 286,608 | 161,899 | 691 | 3,562 | 1601 | 58 | 0 |
| 9 | rankingPull=1 | seed 3 | 1.805 | 290,969 | 151,854 | 745 | 3,256 | 3818 | 42 | 0 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=2 membraneDepth=0 | seed 15 | 1.416 | 230,196 | 107,164 | 565 | 2,438 | 0 | 0 | 7 |
| 2 | membraneDepth=0 | seed 1 | 1.441 | 245,168 | 141,753 | 527 | 2,528 | 0 | 0 | 7 |
| 3 | rankingPull=1 membraneDepth=0 | seed 2 | 1.473 | 245,353 | 131,372 | 591 | 2,657 | 0 | 0 | 7 |
| 4 | rankingPull=2 membraneDepth=1 | seed 9 | 1.557 | 244,673 | 114,637 | 585 | 2,522 | 490 | 52 | 1 |
| 5 | rankingPull=1 membraneDepth=1 | seed 1 | 1.604 | 265,683 | 144,813 | 565 | 2,998 | 267 | 56 | 2 |
| 6 | membraneDepth=1 | seed 2 | 1.642 | 258,650 | 148,736 | 597 | 2,734 | 257 | 66 | 4 |
| 7 | rankingPull=2 | seed 23 | 1.798 | 297,483 | 148,280 | 714 | 3,053 | 3551 | 46 | 0 |
| 8 | baseline | seed 6 | 1.799 | 286,608 | 161,899 | 691 | 3,562 | 1601 | 58 | 0 |
| 9 | rankingPull=1 | seed 3 | 1.805 | 290,969 | 151,854 | 745 | 3,256 | 3818 | 42 | 0 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
- The fragments count, for each of the files' real directories in each column, its runs of neighbouring cards beyond the first: how far the directories interleave, whatever membranes the setting drew. Where a setting draws fewer membranes than the files have directories (`membraneDepth`), the full score's membrane terms shrink with them, so full scores compare only among settings of one depth; the length, the vertical length, the spots, the height and the fragments compare across all.
