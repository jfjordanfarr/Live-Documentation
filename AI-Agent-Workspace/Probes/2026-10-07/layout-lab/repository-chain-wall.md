# Layout lab, the wider space: repository, chain

_Run 2026-10-07T15:23:00.125Z, over a capture of 2026-10-07T15:22:51.349Z (Chrome/145.0.7632.6). 30 settings of the grid `membraneDepth=0,1,2,3,none;bandGap=-40,0,28;membraneNeck=0,60`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 990 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 600 | 2.200 | seed 2 | 2.070 | seed 7 | 2.064 | 418,877 | 177,128 | 1423 | 3,736 | 2155 | 107 | 0 | seed 2 | none | seed 2 | 2.070 |
| bandGap=-40 membraneNeck=0 membraneDepth=0 | 266 | 1.640 | seed 12 | 1.623 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 | ranked | seed 7 after 5; seed 12 after 10 | seed 12 | 1.623 |
| bandGap=-40 membraneDepth=0 | 264 | 1.640 | seed 12 | 1.623 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 | ranked | seed 7 after 5; seed 12 after 10 | seed 12 | 1.623 |
| bandGap=0 membraneNeck=0 membraneDepth=0 | 247 | 1.640 | seed 12 | 1.623 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 | ranked | seed 7 after 5; seed 12 after 10 | seed 12 | 1.623 |
| bandGap=0 membraneDepth=0 | 257 | 1.640 | seed 12 | 1.623 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 | ranked | seed 7 after 5; seed 12 after 10 | seed 12 | 1.623 |
| membraneNeck=0 membraneDepth=0 | 256 | 1.640 | seed 12 | 1.623 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 | ranked | seed 7 after 5; seed 12 after 10 | seed 12 | 1.623 |
| membraneDepth=0 | 251 | 1.640 | seed 12 | 1.623 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 | ranked | seed 7 after 5; seed 12 after 10 | seed 12 | 1.623 |
| bandGap=-40 membraneNeck=0 membraneDepth=1 | 312 | 1.866 | seed 14 | 1.778 | seed 6 | 1.723 | 391,811 | 180,038 | 917 | 3,066 | 54 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.778 |
| bandGap=-40 membraneDepth=1 | 281 | 1.867 | seed 14 | 1.780 | seed 6 | 1.723 | 391,761 | 180,038 | 918 | 3,066 | 58 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.780 |
| bandGap=0 membraneNeck=0 membraneDepth=1 | 289 | 1.864 | seed 14 | 1.762 | seed 6 | 1.715 | 391,850 | 180,067 | 897 | 3,068 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.762 |
| bandGap=0 membraneDepth=1 | 292 | 1.867 | seed 14 | 1.761 | seed 6 | 1.719 | 391,817 | 180,127 | 915 | 3,075 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.761 |
| membraneNeck=0 membraneDepth=1 | 278 | 1.866 | seed 14 | 1.763 | seed 6 | 1.717 | 392,143 | 180,431 | 899 | 3,096 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.763 |
| membraneDepth=1 | 277 | 1.868 | seed 14 | 1.763 | seed 6 | 1.722 | 392,194 | 180,491 | 917 | 3,131 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.763 |
| bandGap=-40 membraneNeck=0 membraneDepth=2 | 293 | 1.888 | seed 14 | 1.778 | seed 6 | 1.723 | 391,782 | 180,038 | 918 | 3,066 | 54 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.778 |
| bandGap=-40 membraneDepth=2 | 292 | 1.887 | seed 14 | 1.780 | seed 6 | 1.722 | 391,683 | 180,038 | 916 | 3,066 | 58 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.780 |
| bandGap=0 membraneNeck=0 membraneDepth=2 | 299 | 1.867 | seed 14 | 1.762 | seed 6 | 1.715 | 391,863 | 180,092 | 898 | 3,068 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.762 |
| bandGap=0 membraneDepth=2 | 288 | 1.866 | seed 14 | 1.761 | seed 6 | 1.719 | 391,915 | 180,127 | 916 | 3,075 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.761 |
| membraneNeck=0 membraneDepth=2 | 302 | 1.868 | seed 14 | 1.763 | seed 6 | 1.717 | 392,101 | 180,456 | 897 | 3,096 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.763 |
| membraneDepth=2 | 276 | 1.868 | seed 14 | 1.763 | seed 6 | 1.723 | 392,247 | 180,491 | 919 | 3,131 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.763 |
| bandGap=-40 membraneNeck=0 membraneDepth=3 | 290 | 1.888 | seed 14 | 1.778 | seed 6 | 1.723 | 391,782 | 180,038 | 918 | 3,066 | 54 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.778 |
| bandGap=-40 membraneDepth=3 | 282 | 1.886 | seed 14 | 1.780 | seed 6 | 1.722 | 391,683 | 180,038 | 916 | 3,066 | 58 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.780 |
| bandGap=0 membraneNeck=0 membraneDepth=3 | 285 | 1.866 | seed 14 | 1.762 | seed 6 | 1.715 | 391,863 | 180,092 | 898 | 3,068 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.762 |
| bandGap=0 membraneDepth=3 | 275 | 1.866 | seed 14 | 1.761 | seed 6 | 1.719 | 391,915 | 180,127 | 916 | 3,075 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.761 |
| membraneNeck=0 membraneDepth=3 | 289 | 1.868 | seed 14 | 1.763 | seed 6 | 1.716 | 392,101 | 180,456 | 897 | 3,096 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.763 |
| membraneDepth=3 | 279 | 1.868 | seed 14 | 1.763 | seed 6 | 1.723 | 392,247 | 180,491 | 919 | 3,131 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.763 |
| bandGap=-40 membraneNeck=0 | 504 | 2.149 | seed 2 | 2.077 | seed 2 | 2.077 | 390,949 | 147,842 | 1436 | 3,776 | 3291 | 105 | 0 | seed 2 | none | seed 2 | 2.077 |
| bandGap=-40 | 498 | 2.171 | seed 2 | 2.105 | seed 2 | 2.105 | 391,688 | 148,662 | 1437 | 3,776 | 3699 | 97 | 0 | seed 2 | none | seed 2 | 2.105 |
| bandGap=0 membraneNeck=0 | 497 | 2.136 | seed 2 | 2.023 | seed 2 | 2.023 | 393,570 | 150,804 | 1425 | 3,826 | 2416 | 105 | 0 | seed 2 | none | seed 2 | 2.023 |
| bandGap=0 | 504 | 2.162 | seed 2 | 2.036 | seed 2 | 2.036 | 394,933 | 152,134 | 1417 | 3,826 | 2600 | 97 | 0 | seed 2 | none | seed 2 | 2.036 |
| membraneNeck=0 | 499 | 2.175 | seed 2 | 2.052 | seed 7 | 2.050 | 416,943 | 175,176 | 1445 | 3,687 | 1950 | 115 | 0 | seed 2 | none | seed 2 | 2.052 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=-40 membraneNeck=0 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 2 | bandGap=-40 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 3 | bandGap=0 membraneNeck=0 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 4 | bandGap=0 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 5 | membraneNeck=0 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 6 | membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 7 | bandGap=0 membraneDepth=1 | seed 14 | 1.761 | 388,732 | 176,173 | 1024 | 3,164 | 4 | 73 | 4 |
| 8 | bandGap=0 membraneDepth=2 | seed 14 | 1.761 | 388,732 | 176,173 | 1024 | 3,164 | 4 | 73 | 4 |
| 9 | bandGap=0 membraneDepth=3 | seed 14 | 1.761 | 388,732 | 176,173 | 1024 | 3,164 | 4 | 73 | 4 |
| 10 | bandGap=0 membraneNeck=0 membraneDepth=1 | seed 14 | 1.762 | 388,701 | 176,113 | 1027 | 3,157 | 4 | 73 | 4 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=-40 membraneNeck=0 membraneDepth=0 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 |
| 2 | bandGap=-40 membraneDepth=0 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 |
| 3 | bandGap=0 membraneNeck=0 membraneDepth=0 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 |
| 4 | bandGap=0 membraneDepth=0 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 |
| 5 | membraneNeck=0 membraneDepth=0 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 |
| 6 | membraneDepth=0 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 |
| 7 | bandGap=0 membraneNeck=0 membraneDepth=1 | seed 6 | 1.715 | 391,850 | 180,067 | 897 | 3,068 | 0 | 84 | 7 |
| 8 | bandGap=0 membraneNeck=0 membraneDepth=3 | seed 6 | 1.715 | 391,863 | 180,092 | 898 | 3,068 | 0 | 84 | 7 |
| 9 | bandGap=0 membraneNeck=0 membraneDepth=2 | seed 6 | 1.715 | 391,863 | 180,092 | 898 | 3,068 | 0 | 84 | 7 |
| 10 | membraneNeck=0 membraneDepth=3 | seed 6 | 1.716 | 392,101 | 180,456 | 897 | 3,096 | 0 | 84 | 7 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=-40 membraneNeck=0 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 2 | bandGap=-40 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 3 | bandGap=0 membraneNeck=0 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 4 | bandGap=0 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 5 | membraneNeck=0 membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 6 | membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 7 | bandGap=0 membraneDepth=1 | seed 14 | 1.761 | 388,732 | 176,173 | 1024 | 3,164 | 4 | 73 | 4 |
| 8 | bandGap=0 membraneDepth=2 | seed 14 | 1.761 | 388,732 | 176,173 | 1024 | 3,164 | 4 | 73 | 4 |
| 9 | bandGap=0 membraneDepth=3 | seed 14 | 1.761 | 388,732 | 176,173 | 1024 | 3,164 | 4 | 73 | 4 |
| 10 | bandGap=0 membraneNeck=0 membraneDepth=1 | seed 14 | 1.762 | 388,701 | 176,113 | 1027 | 3,157 | 4 | 73 | 4 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
- The fragments count, for each of the files' real directories in each column, its runs of neighbouring cards beyond the first: how far the directories interleave, whatever membranes the setting drew. Where a setting draws fewer membranes than the files have directories (`membraneDepth`), the full score's membrane terms shrink with them, so full scores compare only among settings of one depth; the length, the vertical length, the spots, the height and the fragments compare across all.
