# Layout lab, the wider space: estate, five files

_Run 2026-10-07T14:13:30.202Z, over a capture of 2026-10-07T13:18:33.651Z (Chrome/145.0.7632.6). 36 settings of the grid `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSweeps=2,4,8`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 1,188 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Spots | Foreign | Escaping | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 70 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| orderSweeps=2 | 66 | 2.200 | seed 15 | 2.062 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 | seed 1 | none | seed 1 | 2.095 |
| orderSweeps=8 | 74 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingTie=right orderSweeps=2 | 57 | 2.200 | seed 15 | 2.062 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 | seed 1 | none | seed 1 | 2.095 |
| rankingTie=right | 58 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingTie=right orderSweeps=8 | 59 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingTie=left orderSweeps=2 | 57 | 2.200 | seed 15 | 2.062 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 | seed 1 | none | seed 1 | 2.095 |
| rankingTie=left | 56 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingTie=left orderSweeps=8 | 58 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=1 orderSweeps=2 | 54 | 2.200 | seed 15 | 2.062 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 | seed 1 | none | seed 1 | 2.095 |
| rankingPull=1 | 59 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=1 orderSweeps=8 | 60 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=1 rankingTie=right orderSweeps=2 | 58 | 2.200 | seed 15 | 2.062 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 | seed 1 | none | seed 1 | 2.095 |
| rankingPull=1 rankingTie=right | 56 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=1 rankingTie=right orderSweeps=8 | 59 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=1 rankingTie=left orderSweeps=2 | 56 | 2.200 | seed 15 | 2.062 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 | seed 1 | none | seed 1 | 2.095 |
| rankingPull=1 rankingTie=left | 55 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=1 rankingTie=left orderSweeps=8 | 57 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=2 orderSweeps=2 | 53 | 2.200 | seed 15 | 2.062 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 | seed 1 | none | seed 1 | 2.095 |
| rankingPull=2 | 55 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=2 orderSweeps=8 | 56 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=2 rankingTie=right orderSweeps=2 | 53 | 2.200 | seed 15 | 2.062 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 | seed 1 | none | seed 1 | 2.095 |
| rankingPull=2 rankingTie=right | 57 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=2 rankingTie=right orderSweeps=8 | 60 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=2 rankingTie=left orderSweeps=2 | 59 | 2.200 | seed 15 | 2.062 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 | seed 1 | none | seed 1 | 2.095 |
| rankingPull=2 rankingTie=left | 61 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=2 rankingTie=left orderSweeps=8 | 66 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 | seed 1 | none | seed 1 | 2.065 |
| rankingPull=5 orderSweeps=2 | 79 | 2.417 | seed 17 | 2.430 | ranked | 2.417 | 77,883 | 66 | 115 | 17 | ranked | none | ranked | 2.417 |
| rankingPull=5 | 79 | 2.417 | seed 5 | 2.430 | ranked | 2.417 | 77,883 | 66 | 115 | 17 | ranked | seed 5 after 3 | seed 5 | 2.430 |
| rankingPull=5 orderSweeps=8 | 77 | 2.417 | seed 5 | 2.430 | ranked | 2.417 | 77,883 | 66 | 115 | 17 | ranked | seed 5 after 3 | seed 5 | 2.430 |
| rankingPull=5 rankingTie=right orderSweeps=2 | 73 | 2.417 | seed 17 | 2.430 | ranked | 2.417 | 77,883 | 66 | 115 | 17 | ranked | none | ranked | 2.417 |
| rankingPull=5 rankingTie=right | 75 | 2.417 | seed 5 | 2.430 | ranked | 2.417 | 77,883 | 66 | 115 | 17 | ranked | seed 5 after 3 | seed 5 | 2.430 |
| rankingPull=5 rankingTie=right orderSweeps=8 | 82 | 2.417 | seed 5 | 2.430 | ranked | 2.417 | 77,883 | 66 | 115 | 17 | ranked | seed 5 after 3 | seed 5 | 2.430 |
| rankingPull=5 rankingTie=left orderSweeps=2 | 72 | 2.417 | seed 17 | 2.430 | ranked | 2.417 | 77,883 | 66 | 115 | 17 | ranked | none | ranked | 2.417 |
| rankingPull=5 rankingTie=left | 73 | 2.417 | seed 5 | 2.430 | ranked | 2.417 | 77,883 | 66 | 115 | 17 | ranked | seed 5 after 3 | seed 5 | 2.430 |
| rankingPull=5 rankingTie=left orderSweeps=8 | 80 | 2.417 | seed 5 | 2.430 | ranked | 2.417 | 77,883 | 66 | 115 | 17 | ranked | seed 5 after 3 | seed 5 | 2.430 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | baseline | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |
| 2 | orderSweeps=8 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |
| 3 | rankingTie=right | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |
| 4 | rankingTie=right orderSweeps=8 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |
| 5 | rankingTie=left | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |
| 6 | rankingTie=left orderSweeps=8 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |
| 7 | rankingPull=1 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |
| 8 | rankingPull=1 orderSweeps=8 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |
| 9 | rankingPull=1 rankingTie=right | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |
| 10 | rankingPull=1 rankingTie=right orderSweeps=8 | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 2 | rankingTie=right orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 3 | rankingTie=left orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 4 | rankingPull=1 orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 5 | rankingPull=1 rankingTie=right orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 6 | rankingPull=1 rankingTie=left orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 7 | rankingPull=2 orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 8 | rankingPull=2 rankingTie=right orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 9 | rankingPull=2 rankingTie=left orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 10 | baseline | seed 1 | 2.065 | 65,373 | 49 | 160 | 5 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 2 | rankingTie=right orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 3 | rankingTie=left orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 4 | rankingPull=1 orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 5 | rankingPull=1 rankingTie=right orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 6 | rankingPull=1 rankingTie=left orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 7 | rankingPull=2 orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 8 | rankingPull=2 rankingTie=right orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 9 | rankingPull=2 rankingTie=left orderSweeps=2 | seed 15 | 2.062 | 63,368 | 54 | 159 | 5 |
| 10 | baseline | seed 23 | 2.078 | 63,623 | 51 | 191 | 5 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
