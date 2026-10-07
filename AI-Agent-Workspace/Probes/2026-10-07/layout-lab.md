# The layout lab, October 7: the continuing search

_Design instrument, continued. Root agent: Claude Fable 5.1. Run under the owner's go on step 5 of the animated re-layout's plan in [Turn 17](../../ChatHistory/2026/10/2026-10-06.1.record.md#turn-17) of the October 6 session, after their questions of [Turn 15](../../ChatHistory/2026/10/2026-10-06.1.record.md#turn-15) and answers of [Turn 16](../../ChatHistory/2026/10/2026-10-06.1.record.md#turn-16): the count of starts configurable, more starts converging on a best with the picture moved only to a new best, the search continuing after the first picture, stopping "if the diff between last best and most recent best is below some threshold" until the map is marked dirty, and the churn cost permuted "just as we have for the other knobs". The lab's own record is [October 6's](../2026-10-06/layout-lab.md); this page records what the search does and what the simulation says about the churn cost._

## What was built, as the lab sees it

The page's order step now keeps searching after the first picture is painted: one seeded start per idle moment, from the seed after the last the first paint tried, each priced without the page from each card's rows measured once, adopted and moved to when its price plus the churn against the shown picture beats the shown picture's own, settling after eight unadopted starts or at a cap of thirty-two, afresh on every change ([the decisions log](../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-order-step-keeps-searching-after-the-first-picture-and-the-picture-moves-to-a-better-one-recorded-2026-10-07)). The lab's `restarts` verb tabulates the starts as before and then runs the page's own judge over them at several churn costs (`--churn`), with the starts before paint (`--first`) and the patience (`--patience`) of the page's defaults:

```
npm run layout:lab -- restarts <bundle/scope> --starts 32 --churn 0,50,100,200,400 --label search
```

The four reports are beside this page under `layout-lab/` (`*-search.md`); their captures and run JSON are rebuilt on demand and not committed. The captures were retaken today, since the graph grew by the day's files (the motion and search modules and their tests), and the lab reproduces every scope's first paint to the pixel.

## The search watched in the page

Each scope opened fresh with the default dials and the move length at zero, the root's `data-search-*` attributes read every 100 ms (the probe script is disposable):

| Scope | First paint | Adopted | After how many idle starts | Settled after | Time to settle | Shown price, churn aside | Vertical wire |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| This repository, five files | seed 1 (of ranked, seeds 1 to 4) | seed 6 | 2 | 10 | 1.3 to 1.6 s | 546,404 to 532,909 (−2.5%) | 175,954 to 161,899 (−8.0%) |
| This repository, the chain | ranked | seed 5 | 1 | 9 | 2.2 s | to 744,876 | 221,751 to 159,866 (−27.9%) |
| The estate, five files | seed 1 | none | | 8 | 0.7 s | 40,031 | 20,051 |
| The estate, the chain | ranked | seed 8 | 4 | 12 | 0.6 s | 18,431 to 16,987 (−7.8%) | 7,901 to 7,492 (−5.2%) |

A start costs the page about 65 ms on the five files, 120 on the chain and 15 on the estate's scopes, in idle time. The price the search put on each adopted start from the page's answers was within 0.3% of the price the page measured for it (five files: 543,454 against 542,109 with the churn; the estate's chain 18,225 against 17,187, a 6% gap on a small picture whose rows the arithmetic model stands a few pixels off). The chain's first paint on the grown graph stood at 221,751 px of vertical wire, where the October 6 tabulation's best had been 153,477: the four seeds the page tries before paint found nothing good on this graph, and the first idle start did.

## The search simulated, and the churn cost

The simulation runs the page's judge over the lab's 32 tabulated starts. At the page's churn cost of 100 px a swapped pair it reproduces every scope's run exactly: the same adoptions after the same number of starts, settled at the same count. Across churn costs:

| Scope | The one move the search makes | Its gain, churn aside | Pairs swapped | Gain per pair | Made at churn 0 to 100 | At 200 | At 400 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| This repository, five files | seed 1 to seed 6 | 13,495 px | 92 | 147 | yes | no | no |
| This repository, the chain | ranked to seed 5 | 131,245 px | 34 | 3,860 | yes | yes | yes |
| The estate, five files | none offered | | | | | | |
| The estate, the chain | ranked to seed 8 | 1,444 px | 2 | 722 | yes | yes | yes |

Every move the search finds on these scopes is one move; after it, eight starts better nothing and the search settles. The churn cost decides only the five-file move, worth 147 px of wire a swapped pair: it pays at 100 and not at 200. The chain's and the estate's moves pay at every cost tried. So 100 stands: it keeps every move seen, and the one it could lose is the smallest per pair. Whether a move worth 147 px a pair is worth the eye's disturbance is the owner's call; the dial is Search Patience's neighbour in Tuning, as `churnCost`, not yet a slider.

Found on the way: on the chain the full weighted score (the deck's signals) prefers seed 7 where the page's cheap price prefers seed 5, and on the estate's five files it prefers seed 1 where the cheapest vertical is seed 23's; the crossing-and-height cost grid these reports still try stops at 40 where the page's cost is 80, so the "agree" column of the older table is not the page's setting. The costs' tabulation of October 6 could be rerun on the grown graph with the page's grid; not done today.

## Open

- Whether the first paint should try fewer starts now that the search follows, for a faster first picture; the chain's first paint takes 470 ms for five starts.
- The owner's wider permutation: the ranking's tie rule and pull and the sweep count as further dimensions of a start, and whether the best dials differ by scope, which the four scopes' tables can begin to answer.
- The churn cost as a slider.
