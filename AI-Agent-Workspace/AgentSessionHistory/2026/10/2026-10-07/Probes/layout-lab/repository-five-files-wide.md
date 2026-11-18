# Layout lab, the wider space: repository, five files

_Run 2026-10-07T14:13:30.264Z, over a capture of 2026-10-07T13:18:56.776Z (Chrome/145.0.7632.6). 36 settings of the grid `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSweeps=2,4,8`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 1,188 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Spots | Foreign | Escaping | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 515 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| orderSweeps=2 | 460 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| orderSweeps=8 | 450 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| rankingTie=right orderSweeps=2 | 483 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| rankingTie=right | 464 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| rankingTie=right orderSweeps=8 | 452 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| rankingTie=left orderSweeps=2 | 435 | 2.232 | seed 10 | 1.793 | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 | seed 1 | seed 10 after 8 | seed 10 | 1.793 |
| rankingTie=left | 450 | 2.232 | seed 10 | 1.793 | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 | seed 1 | seed 10 after 8 | seed 10 | 1.793 |
| rankingTie=left orderSweeps=8 | 445 | 2.232 | seed 10 | 1.793 | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 | seed 1 | seed 10 after 8 | seed 10 | 1.793 |
| rankingPull=1 orderSweeps=2 | 449 | 2.041 | seed 3 | 1.805 | seed 3 | 1.805 | 290,969 | 745 | 3818 | 42 | seed 2 | seed 3 after 1 | seed 3 | 1.805 |
| rankingPull=1 | 421 | 2.041 | seed 3 | 1.805 | seed 3 | 1.805 | 290,969 | 745 | 3818 | 42 | seed 2 | seed 3 after 1 | seed 3 | 1.805 |
| rankingPull=1 orderSweeps=8 | 433 | 2.041 | seed 3 | 1.805 | seed 3 | 1.805 | 290,969 | 745 | 3818 | 42 | seed 2 | seed 3 after 1 | seed 3 | 1.805 |
| rankingPull=1 rankingTie=right orderSweeps=2 | 442 | 2.041 | seed 3 | 1.805 | seed 3 | 1.805 | 290,969 | 745 | 3818 | 42 | seed 2 | seed 3 after 1 | seed 3 | 1.805 |
| rankingPull=1 rankingTie=right | 423 | 2.041 | seed 3 | 1.805 | seed 3 | 1.805 | 290,969 | 745 | 3818 | 42 | seed 2 | seed 3 after 1 | seed 3 | 1.805 |
| rankingPull=1 rankingTie=right orderSweeps=8 | 431 | 2.041 | seed 3 | 1.805 | seed 3 | 1.805 | 290,969 | 745 | 3818 | 42 | seed 2 | seed 3 after 1 | seed 3 | 1.805 |
| rankingPull=1 rankingTie=left orderSweeps=2 | 417 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| rankingPull=1 rankingTie=left | 417 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| rankingPull=1 rankingTie=left orderSweeps=8 | 427 | 2.200 | seed 6 | 1.799 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 | seed 1 | seed 6 after 4 | seed 6 | 1.799 |
| rankingPull=2 orderSweeps=2 | 418 | 1.795 | seed 23 | 1.798 | seed 1 | 1.780 | 301,157 | 685 | 3373 | 38 | seed 1 | seed 10 after 8 | seed 10 | 1.797 |
| rankingPull=2 | 422 | 1.795 | seed 23 | 1.798 | seed 1 | 1.780 | 301,157 | 685 | 3373 | 38 | seed 1 | seed 10 after 8 | seed 10 | 1.800 |
| rankingPull=2 orderSweeps=8 | 433 | 1.795 | seed 23 | 1.798 | seed 1 | 1.780 | 301,157 | 685 | 3373 | 38 | seed 1 | seed 10 after 8 | seed 10 | 1.800 |
| rankingPull=2 rankingTie=right orderSweeps=2 | 434 | 2.007 | seed 14 | 1.800 | seed 2 | 1.766 | 304,014 | 605 | 3616 | 44 | seed 2 | none | seed 2 | 1.766 |
| rankingPull=2 rankingTie=right | 450 | 2.007 | seed 14 | 1.800 | seed 2 | 1.766 | 304,014 | 605 | 3616 | 44 | seed 2 | none | seed 2 | 1.766 |
| rankingPull=2 rankingTie=right orderSweeps=8 | 442 | 2.007 | seed 14 | 1.800 | seed 2 | 1.766 | 304,014 | 605 | 3616 | 44 | seed 2 | none | seed 2 | 1.766 |
| rankingPull=2 rankingTie=left orderSweeps=2 | 453 | 1.852 | seed 8 | 1.863 | seed 10 | 1.814 | 298,046 | 716 | 3858 | 44 | ranked | seed 6 after 4; seed 7 after 5; seed 8 after 6 | seed 8 | 1.863 |
| rankingPull=2 rankingTie=left | 464 | 1.852 | seed 8 | 1.863 | seed 10 | 1.814 | 298,046 | 716 | 3858 | 44 | ranked | seed 6 after 4; seed 7 after 5; seed 8 after 6 | seed 8 | 1.863 |
| rankingPull=2 rankingTie=left orderSweeps=8 | 557 | 1.852 | seed 8 | 1.863 | seed 10 | 1.814 | 298,046 | 716 | 3858 | 44 | ranked | seed 6 after 4; seed 7 after 5; seed 8 after 6 | seed 8 | 1.863 |
| rankingPull=5 orderSweeps=2 | 664 | 1.925 | seed 8 | 1.905 | seed 8 | 1.905 | 346,285 | 684 | 3265 | 37 | ranked | seed 8 after 6 | seed 8 | 1.905 |
| rankingPull=5 | 648 | 1.925 | seed 8 | 1.905 | seed 8 | 1.905 | 346,285 | 684 | 3265 | 37 | ranked | seed 8 after 6 | seed 8 | 1.905 |
| rankingPull=5 orderSweeps=8 | 644 | 1.925 | seed 8 | 1.905 | seed 8 | 1.905 | 346,285 | 684 | 3265 | 37 | ranked | seed 8 after 6 | seed 8 | 1.905 |
| rankingPull=5 rankingTie=right orderSweeps=2 | 601 | 2.084 | seed 4 | 1.964 | seed 4 | 1.964 | 360,520 | 707 | 2537 | 49 | seed 2 | seed 4 after 2 | seed 4 | 1.964 |
| rankingPull=5 rankingTie=right | 601 | 2.084 | seed 4 | 1.964 | seed 4 | 1.964 | 360,520 | 707 | 2537 | 49 | seed 2 | seed 4 after 2 | seed 4 | 1.964 |
| rankingPull=5 rankingTie=right orderSweeps=8 | 604 | 2.084 | seed 4 | 1.964 | seed 4 | 1.964 | 360,520 | 707 | 2537 | 49 | seed 2 | seed 4 after 2 | seed 4 | 1.964 |
| rankingPull=5 rankingTie=left orderSweeps=2 | 551 | 1.925 | seed 8 | 1.905 | seed 8 | 1.905 | 346,285 | 684 | 3265 | 37 | ranked | seed 8 after 6 | seed 8 | 1.905 |
| rankingPull=5 rankingTie=left | 572 | 1.925 | seed 8 | 1.905 | seed 8 | 1.905 | 346,285 | 684 | 3265 | 37 | ranked | seed 8 after 6 | seed 8 | 1.905 |
| rankingPull=5 rankingTie=left orderSweeps=8 | 561 | 1.925 | seed 8 | 1.905 | seed 8 | 1.905 | 346,285 | 684 | 3265 | 37 | ranked | seed 8 after 6 | seed 8 | 1.905 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=2 rankingTie=right orderSweeps=2 | seed 2 | 1.766 | 304,014 | 605 | 3616 | 44 |
| 2 | rankingPull=2 rankingTie=right | seed 2 | 1.766 | 304,014 | 605 | 3616 | 44 |
| 3 | rankingPull=2 rankingTie=right orderSweeps=8 | seed 2 | 1.766 | 304,014 | 605 | 3616 | 44 |
| 4 | rankingTie=left orderSweeps=2 | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 |
| 5 | rankingTie=left | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 |
| 6 | rankingTie=left orderSweeps=8 | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 |
| 7 | rankingPull=2 orderSweeps=2 | seed 10 | 1.797 | 298,343 | 705 | 3524 | 42 |
| 8 | baseline | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 |
| 9 | orderSweeps=2 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 |
| 10 | orderSweeps=8 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=2 rankingTie=right orderSweeps=2 | seed 2 | 1.766 | 304,014 | 605 | 3616 | 44 |
| 2 | rankingPull=2 rankingTie=right | seed 2 | 1.766 | 304,014 | 605 | 3616 | 44 |
| 3 | rankingPull=2 rankingTie=right orderSweeps=8 | seed 2 | 1.766 | 304,014 | 605 | 3616 | 44 |
| 4 | rankingPull=2 orderSweeps=2 | seed 1 | 1.780 | 301,157 | 685 | 3373 | 38 |
| 5 | rankingPull=2 | seed 1 | 1.780 | 301,157 | 685 | 3373 | 38 |
| 6 | rankingPull=2 orderSweeps=8 | seed 1 | 1.780 | 301,157 | 685 | 3373 | 38 |
| 7 | rankingTie=left orderSweeps=2 | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 |
| 8 | rankingTie=left | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 |
| 9 | rankingTie=left orderSweeps=8 | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 |
| 10 | baseline | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Spots | Foreign | Escaping |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingTie=left orderSweeps=2 | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 |
| 2 | rankingTie=left | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 |
| 3 | rankingTie=left orderSweeps=8 | seed 10 | 1.793 | 285,519 | 675 | 1602 | 58 |
| 4 | rankingPull=2 orderSweeps=2 | seed 23 | 1.798 | 297,483 | 714 | 3551 | 46 |
| 5 | rankingPull=2 | seed 23 | 1.798 | 297,483 | 714 | 3551 | 46 |
| 6 | rankingPull=2 orderSweeps=8 | seed 23 | 1.798 | 297,483 | 714 | 3551 | 46 |
| 7 | baseline | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 |
| 8 | orderSweeps=2 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 |
| 9 | orderSweeps=8 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 |
| 10 | rankingTie=right orderSweeps=2 | seed 6 | 1.799 | 286,608 | 691 | 1601 | 58 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
