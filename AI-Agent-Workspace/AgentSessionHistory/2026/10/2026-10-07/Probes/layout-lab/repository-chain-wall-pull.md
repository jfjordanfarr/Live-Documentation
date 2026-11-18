# Layout lab, the wider space: repository, chain

_Run 2026-10-07T15:22:57.110Z, over a capture of 2026-10-07T15:22:51.349Z (Chrome/145.0.7632.6). 9 settings of the grid `membraneDepth=0,1,none;rankingPull=0,1,2`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 297 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 617 | 2.200 | seed 2 | 2.070 | seed 7 | 2.064 | 418,877 | 177,128 | 1423 | 3,736 | 2155 | 107 | 0 | seed 2 | none | seed 2 | 2.070 |
| membraneDepth=0 | 263 | 1.640 | seed 12 | 1.623 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 | ranked | seed 7 after 5; seed 12 after 10 | seed 12 | 1.623 |
| rankingPull=1 membraneDepth=0 | 269 | 1.614 | seed 12 | 1.600 | seed 4 | 1.594 | 385,234 | 184,162 | 746 | 3,016 | 0 | 0 | 6 | ranked | seed 7 after 5; seed 9 after 7; seed 12 after 10 | seed 12 | 1.600 |
| rankingPull=2 membraneDepth=0 | 247 | 1.628 | seed 12 | 1.615 | seed 14 | 1.602 | 377,386 | 175,868 | 865 | 2,949 | 0 | 0 | 5 | ranked | seed 7 after 5; seed 12 after 10 | seed 12 | 1.615 |
| membraneDepth=1 | 315 | 1.868 | seed 14 | 1.763 | seed 6 | 1.722 | 392,194 | 180,491 | 917 | 3,131 | 0 | 84 | 7 | seed 1 | seed 7 after 5; seed 14 after 12 | seed 14 | 1.763 |
| rankingPull=1 membraneDepth=1 | 325 | 1.817 | seed 14 | 1.719 | seed 3 | 1.697 | 390,717 | 177,394 | 914 | 3,207 | 0 | 61 | 6 | seed 1 | seed 4 after 2; seed 7 after 5; seed 8 after 6; seed 9 after 7; seed 12 after 10; seed 14 after 12 | seed 14 | 1.719 |
| rankingPull=2 membraneDepth=1 | 308 | 1.812 | seed 14 | 1.709 | seed 14 | 1.709 | 386,820 | 171,555 | 1015 | 3,091 | 0 | 57 | 4 | seed 1 | seed 5 after 3; seed 7 after 5; seed 12 after 10; seed 14 after 12 | seed 14 | 1.709 |
| rankingPull=1 | 555 | 2.112 | seed 16 | 2.091 | seed 3 | 1.964 | 431,792 | 189,593 | 1235 | 3,721 | 1255 | 81 | 0 | ranked | seed 3 after 1; seed 5 after 3 | seed 5 | 2.047 |
| rankingPull=2 | 552 | 2.115 | seed 2 | 2.112 | seed 3 | 1.990 | 437,534 | 196,132 | 1265 | 3,820 | 1248 | 78 | 0 | seed 2 | none | seed 2 | 2.112 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=1 membraneDepth=0 | seed 12 | 1.600 | 379,461 | 178,958 | 836 | 2,935 | 0 | 0 | 5 |
| 2 | rankingPull=2 membraneDepth=0 | seed 12 | 1.615 | 385,060 | 185,505 | 804 | 3,317 | 0 | 0 | 3 |
| 3 | membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 4 | rankingPull=2 membraneDepth=1 | seed 14 | 1.709 | 386,820 | 171,555 | 1015 | 3,091 | 0 | 57 | 4 |
| 5 | rankingPull=1 membraneDepth=1 | seed 14 | 1.719 | 389,552 | 173,544 | 1023 | 3,210 | 0 | 55 | 3 |
| 6 | membraneDepth=1 | seed 14 | 1.763 | 389,092 | 176,537 | 1022 | 3,220 | 1 | 73 | 4 |
| 7 | rankingPull=1 | seed 5 | 2.047 | 430,939 | 188,887 | 1301 | 3,821 | 2191 | 83 | 0 |
| 8 | baseline | seed 2 | 2.070 | 402,221 | 159,866 | 1456 | 3,978 | 2637 | 97 | 0 |
| 9 | rankingPull=2 | seed 2 | 2.112 | 415,158 | 172,144 | 1405 | 4,548 | 2981 | 85 | 0 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=1 membraneDepth=0 | seed 4 | 1.594 | 385,234 | 184,162 | 746 | 3,016 | 0 | 0 | 6 |
| 2 | rankingPull=2 membraneDepth=0 | seed 14 | 1.602 | 377,386 | 175,868 | 865 | 2,949 | 0 | 0 | 5 |
| 3 | membraneDepth=0 | seed 11 | 1.611 | 385,648 | 187,193 | 796 | 3,179 | 0 | 0 | 8 |
| 4 | rankingPull=1 membraneDepth=1 | seed 3 | 1.697 | 390,717 | 177,394 | 914 | 3,207 | 0 | 61 | 6 |
| 5 | rankingPull=2 membraneDepth=1 | seed 14 | 1.709 | 386,820 | 171,555 | 1015 | 3,091 | 0 | 57 | 4 |
| 6 | membraneDepth=1 | seed 6 | 1.722 | 392,194 | 180,491 | 917 | 3,131 | 0 | 84 | 7 |
| 7 | rankingPull=1 | seed 3 | 1.964 | 431,792 | 189,593 | 1235 | 3,721 | 1255 | 81 | 0 |
| 8 | rankingPull=2 | seed 3 | 1.990 | 437,534 | 196,132 | 1265 | 3,820 | 1248 | 78 | 0 |
| 9 | baseline | seed 7 | 2.064 | 418,877 | 177,128 | 1423 | 3,736 | 2155 | 107 | 0 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | rankingPull=1 membraneDepth=0 | seed 12 | 1.600 | 379,461 | 178,958 | 836 | 2,935 | 0 | 0 | 5 |
| 2 | rankingPull=2 membraneDepth=0 | seed 12 | 1.615 | 385,060 | 185,505 | 804 | 3,317 | 0 | 0 | 3 |
| 3 | membraneDepth=0 | seed 12 | 1.623 | 386,295 | 187,434 | 834 | 3,275 | 0 | 0 | 3 |
| 4 | rankingPull=2 membraneDepth=1 | seed 14 | 1.709 | 386,820 | 171,555 | 1015 | 3,091 | 0 | 57 | 4 |
| 5 | rankingPull=1 membraneDepth=1 | seed 14 | 1.719 | 389,552 | 173,544 | 1023 | 3,210 | 0 | 55 | 3 |
| 6 | membraneDepth=1 | seed 14 | 1.763 | 389,092 | 176,537 | 1022 | 3,220 | 1 | 73 | 4 |
| 7 | baseline | seed 2 | 2.070 | 402,221 | 159,866 | 1456 | 3,978 | 2637 | 97 | 0 |
| 8 | rankingPull=1 | seed 16 | 2.091 | 410,050 | 165,909 | 1402 | 4,357 | 2983 | 83 | 0 |
| 9 | rankingPull=2 | seed 2 | 2.112 | 415,158 | 172,144 | 1405 | 4,548 | 2981 | 85 | 0 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
- The fragments count, for each of the files' real directories in each column, its runs of neighbouring cards beyond the first: how far the directories interleave, whatever membranes the setting drew. Where a setting draws fewer membranes than the files have directories (`membraneDepth`), the full score's membrane terms shrink with them, so full scores compare only among settings of one depth; the length, the vertical length, the spots, the height and the fragments compare across all.
