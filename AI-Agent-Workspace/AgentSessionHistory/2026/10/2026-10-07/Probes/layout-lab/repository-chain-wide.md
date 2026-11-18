# Layout lab, the wider space: repository, chain

_Run 2026-10-07T14:13:30.183Z, over a capture of 2026-10-07T13:19:09.795Z (Chrome/145.0.7632.6). 36 settings of the grid `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSweeps=2,4,8`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 1,188 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Spots | Foreign | Escaping | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 613 | 2.200 | seed 5 | 2.070 | seed 7 | 2.064 | 418,877 | 1423 | 2155 | 107 | ranked | seed 5 after 3 | seed 5 | 2.070 |
| orderSweeps=2 | 553 | 2.200 | seed 5 | 2.070 | seed 7 | 2.064 | 418,877 | 1423 | 2155 | 107 | ranked | seed 5 after 3 | seed 5 | 2.070 |
| orderSweeps=8 | 602 | 2.200 | seed 5 | 2.070 | seed 7 | 2.064 | 418,877 | 1423 | 2155 | 107 | ranked | seed 5 after 3 | seed 5 | 2.070 |
| rankingTie=right orderSweeps=2 | 572 | 2.200 | seed 5 | 2.070 | seed 7 | 2.064 | 418,877 | 1423 | 2155 | 107 | ranked | seed 5 after 3 | seed 5 | 2.070 |
| rankingTie=right | 550 | 2.200 | seed 5 | 2.070 | seed 7 | 2.064 | 418,877 | 1423 | 2155 | 107 | ranked | seed 5 after 3 | seed 5 | 2.070 |
| rankingTie=right orderSweeps=8 | 557 | 2.200 | seed 5 | 2.070 | seed 7 | 2.064 | 418,877 | 1423 | 2155 | 107 | ranked | seed 5 after 3 | seed 5 | 2.070 |
| rankingTie=left orderSweeps=2 | 549 | 2.200 | seed 5 | 2.070 | seed 7 | 2.064 | 418,877 | 1423 | 2155 | 107 | ranked | seed 5 after 3 | seed 5 | 2.070 |
| rankingTie=left | 543 | 2.200 | seed 5 | 2.070 | seed 7 | 2.064 | 418,877 | 1423 | 2155 | 107 | ranked | seed 5 after 3 | seed 5 | 2.070 |
| rankingTie=left orderSweeps=8 | 519 | 2.200 | seed 5 | 2.070 | seed 7 | 2.064 | 418,877 | 1423 | 2155 | 107 | ranked | seed 5 after 3 | seed 5 | 2.070 |
| rankingPull=1 orderSweeps=2 | 528 | 2.112 | seed 16 | 2.091 | seed 3 | 1.964 | 431,792 | 1235 | 1255 | 81 | ranked | seed 3 after 1; seed 5 after 3 | seed 5 | 2.047 |
| rankingPull=1 | 545 | 2.112 | seed 16 | 2.091 | seed 3 | 1.964 | 431,792 | 1235 | 1255 | 81 | ranked | seed 3 after 1; seed 5 after 3 | seed 5 | 2.047 |
| rankingPull=1 orderSweeps=8 | 532 | 2.112 | seed 16 | 2.091 | seed 3 | 1.964 | 431,792 | 1235 | 1255 | 81 | ranked | seed 3 after 1; seed 5 after 3 | seed 5 | 2.047 |
| rankingPull=1 rankingTie=right orderSweeps=2 | 538 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=1 rankingTie=right | 539 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=1 rankingTie=right orderSweeps=8 | 543 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=1 rankingTie=left orderSweeps=2 | 520 | 2.108 | seed 20 | 2.096 | seed 3 | 1.969 | 432,789 | 1249 | 1256 | 78 | ranked | seed 3 after 1; seed 5 after 3 | seed 5 | 2.055 |
| rankingPull=1 rankingTie=left | 530 | 2.108 | seed 20 | 2.096 | seed 3 | 1.969 | 432,789 | 1249 | 1256 | 78 | ranked | seed 3 after 1; seed 5 after 3 | seed 5 | 2.055 |
| rankingPull=1 rankingTie=left orderSweeps=8 | 545 | 2.108 | seed 20 | 2.096 | seed 3 | 1.969 | 432,789 | 1249 | 1256 | 78 | ranked | seed 3 after 1; seed 5 after 3 | seed 5 | 2.055 |
| rankingPull=2 orderSweeps=2 | 535 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=2 | 551 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=2 orderSweeps=8 | 608 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=2 rankingTie=right orderSweeps=2 | 676 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=2 rankingTie=right | 616 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=2 rankingTie=right orderSweeps=8 | 638 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=2 rankingTie=left orderSweeps=2 | 585 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=2 rankingTie=left | 535 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=2 rankingTie=left orderSweeps=8 | 547 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 | seed 2 | none | seed 2 | 2.112 |
| rankingPull=5 orderSweeps=2 | 590 | 2.265 | seed 23 | 2.071 | seed 23 | 2.071 | 435,387 | 1325 | 1800 | 72 | seed 2 | seed 3 after 1 | seed 3 | 2.105 |
| rankingPull=5 | 602 | 2.265 | seed 23 | 2.071 | seed 23 | 2.071 | 435,387 | 1325 | 1800 | 72 | seed 2 | seed 3 after 1 | seed 3 | 2.105 |
| rankingPull=5 orderSweeps=8 | 618 | 2.265 | seed 23 | 2.071 | seed 23 | 2.071 | 435,387 | 1325 | 1800 | 72 | seed 2 | seed 3 after 1 | seed 3 | 2.105 |
| rankingPull=5 rankingTie=right orderSweeps=2 | 598 | 2.265 | seed 23 | 2.071 | seed 23 | 2.071 | 435,387 | 1325 | 1800 | 72 | seed 2 | seed 3 after 1 | seed 3 | 2.105 |
| rankingPull=5 rankingTie=right | 587 | 2.265 | seed 23 | 2.071 | seed 23 | 2.071 | 435,387 | 1325 | 1800 | 72 | seed 2 | seed 3 after 1 | seed 3 | 2.105 |
| rankingPull=5 rankingTie=right orderSweeps=8 | 580 | 2.265 | seed 23 | 2.071 | seed 23 | 2.071 | 435,387 | 1325 | 1800 | 72 | seed 2 | seed 3 after 1 | seed 3 | 2.105 |
| rankingPull=5 rankingTie=left orderSweeps=2 | 560 | 2.224 | ranked | 2.224 | seed 2 | 2.124 | 486,403 | 1200 | 1812 | 93 | ranked | none | ranked | 2.224 |
| rankingPull=5 rankingTie=left | 563 | 2.224 | ranked | 2.224 | seed 2 | 2.124 | 486,403 | 1200 | 1812 | 93 | ranked | none | ranked | 2.224 |
| rankingPull=5 rankingTie=left orderSweeps=8 | 587 | 2.224 | ranked | 2.224 | seed 2 | 2.124 | 486,403 | 1200 | 1812 | 93 | ranked | none | ranked | 2.224 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=1 orderSweeps=2 | seed 5 | 2.047 | 430,939 | 1301 | 2191 | 83 |
| 2 | rankingPull=1 | seed 5 | 2.047 | 430,939 | 1301 | 2191 | 83 |
| 3 | rankingPull=1 orderSweeps=8 | seed 5 | 2.047 | 430,939 | 1301 | 2191 | 83 |
| 4 | rankingPull=1 rankingTie=left orderSweeps=2 | seed 5 | 2.055 | 431,550 | 1320 | 2224 | 82 |
| 5 | rankingPull=1 rankingTie=left | seed 5 | 2.055 | 431,550 | 1320 | 2224 | 82 |
| 6 | rankingPull=1 rankingTie=left orderSweeps=8 | seed 5 | 2.055 | 431,550 | 1320 | 2224 | 82 |
| 7 | baseline | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 8 | orderSweeps=2 | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 9 | orderSweeps=8 | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 10 | rankingTie=right orderSweeps=2 | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=1 orderSweeps=2 | seed 3 | 1.964 | 431,792 | 1235 | 1255 | 81 |
| 2 | rankingPull=1 | seed 3 | 1.964 | 431,792 | 1235 | 1255 | 81 |
| 3 | rankingPull=1 orderSweeps=8 | seed 3 | 1.964 | 431,792 | 1235 | 1255 | 81 |
| 4 | rankingPull=1 rankingTie=left orderSweeps=2 | seed 3 | 1.969 | 432,789 | 1249 | 1256 | 78 |
| 5 | rankingPull=1 rankingTie=left | seed 3 | 1.969 | 432,789 | 1249 | 1256 | 78 |
| 6 | rankingPull=1 rankingTie=left orderSweeps=8 | seed 3 | 1.969 | 432,789 | 1249 | 1256 | 78 |
| 7 | rankingPull=1 rankingTie=right orderSweeps=2 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 |
| 8 | rankingPull=1 rankingTie=right | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 |
| 9 | rankingPull=1 rankingTie=right orderSweeps=8 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 |
| 10 | rankingPull=2 orderSweeps=2 | seed 3 | 1.990 | 437,534 | 1265 | 1248 | 78 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | baseline | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 2 | orderSweeps=2 | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 3 | orderSweeps=8 | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 4 | rankingTie=right orderSweeps=2 | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 5 | rankingTie=right | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 6 | rankingTie=right orderSweeps=8 | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 7 | rankingTie=left orderSweeps=2 | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 8 | rankingTie=left | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 9 | rankingTie=left orderSweeps=8 | seed 5 | 2.070 | 402,221 | 1456 | 2637 | 97 |
| 10 | rankingPull=5 orderSweeps=2 | seed 23 | 2.071 | 435,387 | 1325 | 1800 | 72 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
