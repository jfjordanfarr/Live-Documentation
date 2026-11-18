# Layout lab, the wider space: estate, five files

_Run 2026-10-07T15:18:19.441Z, over a capture of 2026-10-07T13:18:33.651Z (Chrome/145.0.7632.6). 30 settings of the grid `membraneDepth=0,1,2,3,none;bandGap=-40,0,28;membraneNeck=0,60`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 990 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 88 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 20,051 | 49 | 1,500 | 160 | 5 | 0 | seed 1 | none | seed 1 | 2.065 |
| bandGap=-40 membraneNeck=0 membraneDepth=0 | 36 | 1.650 | seed 21 | 1.630 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 | ranked | seed 6 after 4 | seed 6 | 1.644 |
| bandGap=-40 membraneDepth=0 | 42 | 1.650 | seed 21 | 1.630 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 | ranked | seed 6 after 4 | seed 6 | 1.644 |
| bandGap=0 membraneNeck=0 membraneDepth=0 | 35 | 1.650 | seed 21 | 1.630 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 | ranked | seed 6 after 4 | seed 6 | 1.644 |
| bandGap=0 membraneDepth=0 | 34 | 1.650 | seed 21 | 1.630 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 | ranked | seed 6 after 4 | seed 6 | 1.644 |
| membraneNeck=0 membraneDepth=0 | 33 | 1.650 | seed 21 | 1.630 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 | ranked | seed 6 after 4 | seed 6 | 1.644 |
| membraneDepth=0 | 35 | 1.650 | seed 21 | 1.630 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 | ranked | seed 6 after 4 | seed 6 | 1.644 |
| bandGap=-40 membraneNeck=0 membraneDepth=1 | 47 | 2.784 | seed 25 | 2.243 | seed 25 | 2.243 | 58,171 | 13,071 | 56 | 1,318 | 377 | 6 | 0 | ranked | seed 6 after 4 | seed 6 | 2.995 |
| bandGap=-40 membraneDepth=1 | 51 | 3.474 | seed 25 | 2.876 | seed 2 | 2.399 | 61,080 | 17,691 | 66 | 1,305 | 447 | 6 | 0 | ranked | seed 6 after 4 | seed 6 | 3.826 |
| bandGap=0 membraneNeck=0 membraneDepth=1 | 49 | 1.954 | seed 25 | 1.917 | seed 25 | 1.917 | 58,783 | 13,866 | 57 | 1,339 | 10 | 6 | 0 | ranked | seed 6 after 4 | seed 6 | 1.963 |
| bandGap=0 membraneDepth=1 | 52 | 2.162 | seed 25 | 2.053 | seed 2 | 2.035 | 61,837 | 18,478 | 64 | 1,361 | 25 | 6 | 0 | ranked | seed 6 after 4 | seed 6 | 2.182 |
| membraneNeck=0 membraneDepth=1 | 64 | 1.993 | seed 25 | 1.963 | seed 25 | 1.963 | 60,199 | 15,842 | 58 | 1,446 | 10 | 6 | 0 | ranked | seed 6 after 4 | seed 6 | 1.993 |
| membraneDepth=1 | 50 | 2.179 | seed 25 | 2.054 | seed 25 | 2.054 | 60,875 | 17,150 | 54 | 1,452 | 142 | 6 | 0 | ranked | seed 6 after 4 | seed 6 | 2.189 |
| bandGap=-40 membraneNeck=0 membraneDepth=2 | 58 | 2.946 | seed 23 | 2.929 | seed 19 | 2.358 | 61,072 | 14,819 | 55 | 1,295 | 510 | 5 | 0 | seed 1 | seed 6 after 4 | seed 6 | 2.910 |
| bandGap=-40 membraneDepth=2 | 65 | 3.648 | seed 23 | 3.940 | seed 19 | 2.755 | 61,798 | 15,479 | 51 | 1,295 | 953 | 5 | 0 | seed 1 | none | seed 1 | 2.763 |
| bandGap=0 membraneNeck=0 membraneDepth=2 | 66 | 1.955 | seed 23 | 1.864 | seed 23 | 1.864 | 60,553 | 13,919 | 50 | 1,332 | 0 | 5 | 0 | seed 1 | none | seed 1 | 1.917 |
| bandGap=0 membraneDepth=2 | 67 | 2.154 | seed 23 | 2.085 | seed 19 | 2.040 | 63,203 | 17,476 | 52 | 1,371 | 170 | 5 | 0 | seed 1 | none | seed 1 | 2.049 |
| membraneNeck=0 membraneDepth=2 | 64 | 2.010 | seed 23 | 1.913 | seed 23 | 1.913 | 62,264 | 16,352 | 52 | 1,429 | 0 | 5 | 0 | seed 1 | none | seed 1 | 1.966 |
| membraneDepth=2 | 62 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 20,051 | 49 | 1,500 | 160 | 5 | 0 | seed 1 | none | seed 1 | 2.065 |
| bandGap=-40 membraneNeck=0 membraneDepth=3 | 60 | 2.946 | seed 23 | 2.929 | seed 19 | 2.358 | 61,072 | 14,819 | 55 | 1,295 | 510 | 5 | 0 | seed 1 | seed 6 after 4 | seed 6 | 2.910 |
| bandGap=-40 membraneDepth=3 | 65 | 3.648 | seed 23 | 3.940 | seed 19 | 2.755 | 61,798 | 15,479 | 51 | 1,295 | 953 | 5 | 0 | seed 1 | none | seed 1 | 2.763 |
| bandGap=0 membraneNeck=0 membraneDepth=3 | 60 | 1.955 | seed 23 | 1.864 | seed 23 | 1.864 | 60,553 | 13,919 | 50 | 1,332 | 0 | 5 | 0 | seed 1 | none | seed 1 | 1.917 |
| bandGap=0 membraneDepth=3 | 60 | 2.154 | seed 23 | 2.085 | seed 19 | 2.040 | 63,203 | 17,476 | 52 | 1,371 | 170 | 5 | 0 | seed 1 | none | seed 1 | 2.049 |
| membraneNeck=0 membraneDepth=3 | 62 | 2.010 | seed 23 | 1.913 | seed 23 | 1.913 | 62,264 | 16,352 | 52 | 1,429 | 0 | 5 | 0 | seed 1 | none | seed 1 | 1.966 |
| membraneDepth=3 | 65 | 2.200 | seed 23 | 2.078 | seed 1 | 2.065 | 65,373 | 20,051 | 49 | 1,500 | 160 | 5 | 0 | seed 1 | none | seed 1 | 2.065 |
| bandGap=-40 membraneNeck=0 | 60 | 2.946 | seed 23 | 2.929 | seed 19 | 2.358 | 61,072 | 14,819 | 55 | 1,295 | 510 | 5 | 0 | seed 1 | seed 6 after 4 | seed 6 | 2.910 |
| bandGap=-40 | 62 | 3.648 | seed 23 | 3.940 | seed 19 | 2.755 | 61,798 | 15,479 | 51 | 1,295 | 953 | 5 | 0 | seed 1 | none | seed 1 | 2.763 |
| bandGap=0 membraneNeck=0 | 64 | 1.955 | seed 23 | 1.864 | seed 23 | 1.864 | 60,553 | 13,919 | 50 | 1,332 | 0 | 5 | 0 | seed 1 | none | seed 1 | 1.917 |
| bandGap=0 | 65 | 2.154 | seed 23 | 2.085 | seed 19 | 2.040 | 63,203 | 17,476 | 52 | 1,371 | 170 | 5 | 0 | seed 1 | none | seed 1 | 2.049 |
| membraneNeck=0 | 66 | 2.010 | seed 23 | 1.913 | seed 23 | 1.913 | 62,264 | 16,352 | 52 | 1,429 | 0 | 5 | 0 | seed 1 | none | seed 1 | 1.966 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=-40 membraneNeck=0 membraneDepth=0 | seed 6 | 1.644 | 55,341 | 15,020 | 53 | 811 | 0 | 0 | 0 |
| 2 | bandGap=-40 membraneDepth=0 | seed 6 | 1.644 | 55,341 | 15,020 | 53 | 811 | 0 | 0 | 0 |
| 3 | bandGap=0 membraneNeck=0 membraneDepth=0 | seed 6 | 1.644 | 55,341 | 15,020 | 53 | 811 | 0 | 0 | 0 |
| 4 | bandGap=0 membraneDepth=0 | seed 6 | 1.644 | 55,341 | 15,020 | 53 | 811 | 0 | 0 | 0 |
| 5 | membraneNeck=0 membraneDepth=0 | seed 6 | 1.644 | 55,341 | 15,020 | 53 | 811 | 0 | 0 | 0 |
| 6 | membraneDepth=0 | seed 6 | 1.644 | 55,341 | 15,020 | 53 | 811 | 0 | 0 | 0 |
| 7 | bandGap=0 membraneNeck=0 membraneDepth=2 | seed 1 | 1.917 | 62,520 | 16,227 | 55 | 1,375 | 10 | 5 | 0 |
| 8 | bandGap=0 membraneNeck=0 membraneDepth=3 | seed 1 | 1.917 | 62,520 | 16,227 | 55 | 1,375 | 10 | 5 | 0 |
| 9 | bandGap=0 membraneNeck=0 | seed 1 | 1.917 | 62,520 | 16,227 | 55 | 1,375 | 10 | 5 | 0 |
| 10 | bandGap=0 membraneNeck=0 membraneDepth=1 | seed 6 | 1.963 | 59,542 | 15,887 | 60 | 1,050 | 0 | 8 | 0 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=-40 membraneNeck=0 membraneDepth=0 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 |
| 2 | bandGap=-40 membraneDepth=0 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 |
| 3 | bandGap=0 membraneNeck=0 membraneDepth=0 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 |
| 4 | bandGap=0 membraneDepth=0 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 |
| 5 | membraneNeck=0 membraneDepth=0 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 |
| 6 | membraneDepth=0 | seed 29 | 1.614 | 54,230 | 14,058 | 51 | 758 | 0 | 0 | 1 |
| 7 | bandGap=0 membraneNeck=0 membraneDepth=2 | seed 23 | 1.864 | 60,553 | 13,919 | 50 | 1,332 | 0 | 5 | 0 |
| 8 | bandGap=0 membraneNeck=0 membraneDepth=3 | seed 23 | 1.864 | 60,553 | 13,919 | 50 | 1,332 | 0 | 5 | 0 |
| 9 | bandGap=0 membraneNeck=0 | seed 23 | 1.864 | 60,553 | 13,919 | 50 | 1,332 | 0 | 5 | 0 |
| 10 | membraneNeck=0 membraneDepth=2 | seed 23 | 1.913 | 62,264 | 16,352 | 52 | 1,429 | 0 | 5 | 0 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=-40 membraneNeck=0 membraneDepth=0 | seed 21 | 1.630 | 55,320 | 15,000 | 50 | 811 | 0 | 0 | 0 |
| 2 | bandGap=-40 membraneDepth=0 | seed 21 | 1.630 | 55,320 | 15,000 | 50 | 811 | 0 | 0 | 0 |
| 3 | bandGap=0 membraneNeck=0 membraneDepth=0 | seed 21 | 1.630 | 55,320 | 15,000 | 50 | 811 | 0 | 0 | 0 |
| 4 | bandGap=0 membraneDepth=0 | seed 21 | 1.630 | 55,320 | 15,000 | 50 | 811 | 0 | 0 | 0 |
| 5 | membraneNeck=0 membraneDepth=0 | seed 21 | 1.630 | 55,320 | 15,000 | 50 | 811 | 0 | 0 | 0 |
| 6 | membraneDepth=0 | seed 21 | 1.630 | 55,320 | 15,000 | 50 | 811 | 0 | 0 | 0 |
| 7 | bandGap=0 membraneNeck=0 membraneDepth=2 | seed 23 | 1.864 | 60,553 | 13,919 | 50 | 1,332 | 0 | 5 | 0 |
| 8 | bandGap=0 membraneNeck=0 membraneDepth=3 | seed 23 | 1.864 | 60,553 | 13,919 | 50 | 1,332 | 0 | 5 | 0 |
| 9 | bandGap=0 membraneNeck=0 | seed 23 | 1.864 | 60,553 | 13,919 | 50 | 1,332 | 0 | 5 | 0 |
| 10 | membraneNeck=0 membraneDepth=2 | seed 23 | 1.913 | 62,264 | 16,352 | 52 | 1,429 | 0 | 5 | 0 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
- The fragments count, for each of the files' real directories in each column, its runs of neighbouring cards beyond the first: how far the directories interleave, whatever membranes the setting drew. Where a setting draws fewer membranes than the files have directories (`membraneDepth`), the full score's membrane terms shrink with them, so full scores compare only among settings of one depth; the length, the vertical length, the spots, the height and the fragments compare across all.
