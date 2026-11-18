# Layout lab, the wider space: repository, five files

_Run 2026-10-07T15:21:26.295Z, over a capture of 2026-10-07T13:18:56.776Z (Chrome/145.0.7632.6). 2 settings of the grid `membranePadding=0;bandGap=0;membraneNeck=0`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 66 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 491 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 161,899 | 691 | 3,562 | 1601 | 58 | 0 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| bandGap=0 membraneNeck=0 membranePadding=0 | 413 | 1.942 | seed 6 | 1.629 | seed 6 | 1.629 | 241,946 | 137,606 | 600 | 3,000 | 1103 | 65 | 0 | seed 1 | seed 6 after 4 | seed 6 | 1.629 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=0 membraneNeck=0 membranePadding=0 | seed 6 | 1.629 | 241,946 | 137,606 | 600 | 3,000 | 1103 | 65 | 0 |
| 2 | baseline | seed 6 | 1.799 | 286,608 | 161,899 | 691 | 3,562 | 1601 | 58 | 0 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=0 membraneNeck=0 membranePadding=0 | seed 6 | 1.629 | 241,946 | 137,606 | 600 | 3,000 | 1103 | 65 | 0 |
| 2 | baseline | seed 6 | 1.799 | 286,608 | 161,899 | 691 | 3,562 | 1601 | 58 | 0 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=0 membraneNeck=0 membranePadding=0 | seed 6 | 1.629 | 241,946 | 137,606 | 600 | 3,000 | 1103 | 65 | 0 |
| 2 | baseline | seed 6 | 1.799 | 286,608 | 161,899 | 691 | 3,562 | 1601 | 58 | 0 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
- The fragments count, for each of the files' real directories in each column, its runs of neighbouring cards beyond the first: how far the directories interleave, whatever membranes the setting drew. Where a setting draws fewer membranes than the files have directories (`membraneDepth`), the full score's membrane terms shrink with them, so full scores compare only among settings of one depth; the length, the vertical length, the spots, the height and the fragments compare across all.
