# Layout lab, the wider space: estate, chain

_Run 2026-10-07T15:18:20.129Z, over a capture of 2026-10-07T13:18:45.033Z (Chrome/145.0.7632.6). 30 settings of the grid `membraneDepth=0,1,2,3,none;bandGap=-40,0,28;membraneNeck=0,60`, each with 33 starts laid out alone (the ranking's order and the seeds 1 to 32), 990 layouts in all. Full-score weights: lengthPx 1, spots 0.3, foreignSamples 0.2, escapingSamples 0.1, pictureHeight 0.1, backward 0.5; the baseline setting's ranked start scores 2.200 by definition, and every start of every setting is scored against it. The page's price is the vertical length plus 80 px a crossing and 5 px a pixel of height; the search is simulated at 100 px a swapped pair from a first paint of the ranking's order and the first 2 seeds, with a patience of 8._

## Every setting

For each setting: what a start costs the lab, the ranked start's full score, the start the page's price keeps and its full score, the start the full score prefers with the deck's signals of its picture, and the page's search from its first paint to where it ends.

| Setting | ms / start | Ranked: full | Page's price keeps | Its full | Full score prefers | Its full | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments | Search: first paint | Moves | Final | Its full |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: |
| baseline | 42 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 7,492 | 29 | 795 | 0 | 2 | 0 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| bandGap=-40 membraneNeck=0 membraneDepth=0 | 20 | 1.636 | ranked | 1.636 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 | ranked | none | ranked | 1.636 |
| bandGap=-40 membraneDepth=0 | 20 | 1.636 | ranked | 1.636 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 | ranked | none | ranked | 1.636 |
| bandGap=0 membraneNeck=0 membraneDepth=0 | 19 | 1.636 | ranked | 1.636 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 | ranked | none | ranked | 1.636 |
| bandGap=0 membraneDepth=0 | 20 | 1.636 | ranked | 1.636 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 | ranked | none | ranked | 1.636 |
| membraneNeck=0 membraneDepth=0 | 20 | 1.636 | ranked | 1.636 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 | ranked | none | ranked | 1.636 |
| membraneDepth=0 | 18 | 1.636 | ranked | 1.636 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 | ranked | none | ranked | 1.636 |
| bandGap=-40 membraneNeck=0 membraneDepth=1 | 26 | 2.212 | seed 2 | 2.271 | ranked | 2.212 | 36,296 | 6,648 | 29 | 826 | 116 | 2 | 0 | seed 2 | none | seed 2 | 2.271 |
| bandGap=-40 membraneDepth=1 | 27 | 2.212 | seed 2 | 2.271 | ranked | 2.212 | 36,296 | 6,648 | 29 | 826 | 116 | 2 | 0 | seed 2 | none | seed 2 | 2.271 |
| bandGap=0 membraneNeck=0 membraneDepth=1 | 25 | 1.993 | seed 2 | 2.172 | ranked | 1.993 | 36,380 | 6,786 | 29 | 828 | 0 | 2 | 0 | seed 2 | none | seed 2 | 2.172 |
| bandGap=0 membraneDepth=1 | 24 | 1.993 | seed 2 | 2.172 | ranked | 1.993 | 36,380 | 6,786 | 29 | 828 | 0 | 2 | 0 | seed 2 | none | seed 2 | 2.172 |
| membraneNeck=0 membraneDepth=1 | 24 | 2.005 | seed 2 | 2.178 | ranked | 2.005 | 36,696 | 7,236 | 29 | 856 | 0 | 2 | 0 | seed 2 | none | seed 2 | 2.178 |
| membraneDepth=1 | 23 | 2.005 | seed 2 | 2.178 | ranked | 2.005 | 36,696 | 7,236 | 29 | 856 | 0 | 2 | 0 | seed 2 | none | seed 2 | 2.178 |
| bandGap=-40 membraneNeck=0 membraneDepth=2 | 32 | 2.593 | seed 8 | 2.289 | seed 8 | 2.289 | 36,839 | 6,690 | 31 | 710 | 230 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 2.289 |
| bandGap=-40 membraneDepth=2 | 34 | 2.593 | seed 8 | 2.279 | seed 8 | 2.279 | 36,809 | 6,690 | 30 | 710 | 230 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 2.279 |
| bandGap=0 membraneNeck=0 membraneDepth=2 | 31 | 2.206 | seed 8 | 1.879 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 1.879 |
| bandGap=0 membraneDepth=2 | 31 | 2.206 | seed 8 | 1.879 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 1.879 |
| membraneNeck=0 membraneDepth=2 | 32 | 2.200 | seed 8 | 1.907 | seed 8 | 1.907 | 37,378 | 7,492 | 28 | 795 | 0 | 2 | 0 | ranked | seed 8 after 6 | seed 8 | 1.907 |
| membraneDepth=2 | 33 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 7,492 | 29 | 795 | 0 | 2 | 0 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| bandGap=-40 membraneNeck=0 membraneDepth=3 | 37 | 2.593 | seed 8 | 2.289 | seed 8 | 2.289 | 36,839 | 6,690 | 31 | 710 | 230 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 2.289 |
| bandGap=-40 membraneDepth=3 | 33 | 2.593 | seed 8 | 2.279 | seed 8 | 2.279 | 36,809 | 6,690 | 30 | 710 | 230 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 2.279 |
| bandGap=0 membraneNeck=0 membraneDepth=3 | 28 | 2.206 | seed 8 | 1.879 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 1.879 |
| bandGap=0 membraneDepth=3 | 29 | 2.206 | seed 8 | 1.879 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 1.879 |
| membraneNeck=0 membraneDepth=3 | 31 | 2.200 | seed 8 | 1.907 | seed 8 | 1.907 | 37,378 | 7,492 | 28 | 795 | 0 | 2 | 0 | ranked | seed 8 after 6 | seed 8 | 1.907 |
| membraneDepth=3 | 30 | 2.200 | seed 8 | 1.917 | seed 8 | 1.917 | 37,419 | 7,492 | 29 | 795 | 0 | 2 | 0 | ranked | seed 8 after 6 | seed 8 | 1.917 |
| bandGap=-40 membraneNeck=0 | 30 | 2.593 | seed 8 | 2.289 | seed 8 | 2.289 | 36,839 | 6,690 | 31 | 710 | 230 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 2.289 |
| bandGap=-40 | 32 | 2.593 | seed 8 | 2.279 | seed 8 | 2.279 | 36,809 | 6,690 | 30 | 710 | 230 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 2.279 |
| bandGap=0 membraneNeck=0 | 31 | 2.206 | seed 8 | 1.879 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 1.879 |
| bandGap=0 | 31 | 2.206 | seed 8 | 1.879 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 | seed 1 | seed 8 after 6 | seed 8 | 1.879 |
| membraneNeck=0 | 30 | 2.200 | seed 8 | 1.907 | seed 8 | 1.907 | 37,378 | 7,492 | 28 | 795 | 0 | 2 | 0 | ranked | seed 8 after 6 | seed 8 | 1.907 |

## The settings by where the search ends

What the page would show at each setting once its search has settled, by the full score; the baseline is what it shows today.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=-40 membraneNeck=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 2 | bandGap=-40 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 3 | bandGap=0 membraneNeck=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 4 | bandGap=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 5 | membraneNeck=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 6 | membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 7 | bandGap=0 membraneNeck=0 membraneDepth=2 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |
| 8 | bandGap=0 membraneDepth=2 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |
| 9 | bandGap=0 membraneNeck=0 membraneDepth=3 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |
| 10 | bandGap=0 membraneDepth=3 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |

## The settings by their best start

What each setting can reach by the full score, whichever start gets there; a setting high here and low above has a best start the page's price does not pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=-40 membraneNeck=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 2 | bandGap=-40 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 3 | bandGap=0 membraneNeck=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 4 | bandGap=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 5 | membraneNeck=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 6 | membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 7 | bandGap=0 membraneNeck=0 membraneDepth=2 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |
| 8 | bandGap=0 membraneDepth=2 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |
| 9 | bandGap=0 membraneNeck=0 membraneDepth=3 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |
| 10 | bandGap=0 membraneDepth=3 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |

## The settings by the page's price

The start the page's price keeps at each setting, by the full score; where this and the first table differ, the search's churn or patience stopped short of the price's pick.

| Rank | Setting | Start | Full score | Length px | Vertical px | Spots | Height px | Foreign | Escaping | Fragments |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bandGap=-40 membraneNeck=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 2 | bandGap=-40 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 3 | bandGap=0 membraneNeck=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 4 | bandGap=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 5 | membraneNeck=0 membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 6 | membraneDepth=0 | ranked | 1.636 | 32,739 | 6,101 | 20 | 775 | 0 | 0 | 0 |
| 7 | bandGap=0 membraneNeck=0 membraneDepth=2 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |
| 8 | bandGap=0 membraneDepth=2 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |
| 9 | bandGap=0 membraneNeck=0 membraneDepth=3 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |
| 10 | bandGap=0 membraneDepth=3 | seed 8 | 1.879 | 37,048 | 6,891 | 30 | 767 | 0 | 1 | 0 |

## What the numbers are

- A setting is the ranking's pull and tie rule and the order's sweep count; the spacing stays at the page's values. Every start of every setting is laid out alone and scored by the full weighted score against the baseline setting's ranked start, so the scores compare across settings.
- The page's price is what the page knows the moment a start is placed: the vertical wire length plus the costs of the order's own crossings and the picture's height. The full score reads the routed wires the page never draws for a start: the length, the crossing spots, the samples over foreign membranes, the escaping wires, the picture's height and the backward wires.
- The search is the page's own judge over the setting's starts in seed order, as the restarts report simulates it.
- The fragments count, for each of the files' real directories in each column, its runs of neighbouring cards beyond the first: how far the directories interleave, whatever membranes the setting drew. Where a setting draws fewer membranes than the files have directories (`membraneDepth`), the full score's membrane terms shrink with them, so full scores compare only among settings of one depth; the length, the vertical length, the spots, the height and the fragments compare across all.
