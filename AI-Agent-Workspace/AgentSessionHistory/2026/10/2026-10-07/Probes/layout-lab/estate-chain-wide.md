# Layout lab, the wider space: estate, chain

_Run 2026-10-07T14:13:30.124Z, over a capture of 2026-10-07T13:18:45.033Z (Chrome/145.0.7632.6). 36 settings of the grid `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSweeps=2,4,8`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 1,188 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Spots | Foreign | Escaping | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 35 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| orderSweeps=2 | 28 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| orderSweeps=8 | 31 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingTie=right orderSweeps=2 | 30 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingTie=right | 38 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingTie=right orderSweeps=8 | 35 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingTie=left orderSweeps=2 | 27 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingTie=left | 28 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingTie=left orderSweeps=8 | 29 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingPull=1 orderSweeps=2 | 25 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=1 | 26 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=1 orderSweeps=8 | 29 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingPull=1 rankingTie=right orderSweeps=2 | 25 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=1 rankingTie=right | 29 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=1 rankingTie=right orderSweeps=8 | 29 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingPull=1 rankingTie=left orderSweeps=2 | 27 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=1 rankingTie=left | 26 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=1 rankingTie=left orderSweeps=8 | 27 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingPull=2 orderSweeps=2 | 25 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=2 | 26 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=2 orderSweeps=8 | 27 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingPull=2 rankingTie=right orderSweeps=2 | 27 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=2 rankingTie=right | 27 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=2 rankingTie=right orderSweeps=8 | 27 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingPull=2 rankingTie=left orderSweeps=2 | 26 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=2 rankingTie=left | 29 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=2 rankingTie=left orderSweeps=8 | 28 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingPull=5 orderSweeps=2 | 26 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=5 | 25 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=5 orderSweeps=8 | 27 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingPull=5 rankingTie=right orderSweeps=2 | 25 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=5 rankingTie=right | 26 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=5 rankingTie=right orderSweeps=8 | 30 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |
| rankingPull=5 rankingTie=left orderSweeps=2 | 27 | 2.210 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=5 rankingTie=left | 25 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| rankingPull=5 rankingTie=left orderSweeps=8 | 28 | 2.200 | seed 1 | 1.917 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 | seed 1 | none | seed 1 | 1.917 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | baseline | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 2 | orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 3 | orderSweeps=8 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 |
| 4 | rankingTie=right orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 5 | rankingTie=right | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 6 | rankingTie=right orderSweeps=8 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 |
| 7 | rankingTie=left orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 8 | rankingTie=left | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 9 | rankingTie=left orderSweeps=8 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 |
| 10 | rankingPull=1 orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | baseline | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 2 | orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 3 | orderSweeps=8 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 |
| 4 | rankingTie=right orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 5 | rankingTie=right | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 6 | rankingTie=right orderSweeps=8 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 |
| 7 | rankingTie=left orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 8 | rankingTie=left | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 9 | rankingTie=left orderSweeps=8 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 |
| 10 | rankingPull=1 orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | baseline | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 2 | orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 3 | orderSweeps=8 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 |
| 4 | rankingTie=right orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 5 | rankingTie=right | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 6 | rankingTie=right orderSweeps=8 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 |
| 7 | rankingTie=left orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 8 | rankingTie=left | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |
| 9 | rankingTie=left orderSweeps=8 | seed 1 | 1.917 | 37,419 | 29 | 0 | 2 |
| 10 | rankingPull=1 orderSweeps=2 | seed 8 | 1.917 | 37,419 | 29 | 0 | 2 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
