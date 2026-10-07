# The layout lab, October 7: the continuing search

_Design instrument, continued. Root agent: Claude Fable 5.1. Run under the owner's go on step 5 of the animated re-layout's plan in [Turn 17](../../ChatHistory/2026/10/2026-10-06.1.record.md#turn-17) of the October 6 session, after their questions of [Turn 15](../../ChatHistory/2026/10/2026-10-06.1.record.md#turn-15) and answers of [Turn 16](../../ChatHistory/2026/10/2026-10-06.1.record.md#turn-16): the count of starts configurable, more starts converging on a best with the picture moved only to a new best, the search continuing after the first picture, stopping "if the diff between last best and most recent best is below some threshold" until the map is marked dirty, and the churn cost permuted "just as we have for the other knobs". The lab's own record is [October 6's](../2026-10-06/layout-lab.md); this page records what the search does and what the simulation says about the churn cost._

## What was built, as the lab sees it

The page's order step now keeps searching after the first picture is painted: one seeded start per idle moment, from the seed after the last the first paint tried, each priced without the page from each card's rows measured once, adopted and moved to when its price plus the churn against the shown picture beats the shown picture's own, settling after eight starts without a better picture found or at a cap of thirty-two, afresh on every change (the patience counted unadopted starts until later in the day; see below) ([the decisions log](../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-order-step-keeps-searching-after-the-first-picture-and-the-picture-moves-to-a-better-one-recorded-2026-10-07)). The lab's `restarts` verb tabulates the starts as before and then runs the page's own judge over them at several churn costs (`--churn`), with the starts before paint (`--first`) and the patience (`--patience`) of the page's defaults:

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

## Later on October 7: the owner's reading, and four more tables

The owner's reply ([Turn 18](../../ChatHistory/2026/10/2026-10-06.1.record.md#turn-18)) asked whether the churn cost could ramp from low to high as the search goes on, suspected a churn cost of 0 would do, offered a churn measured by where the eye is, would go "as low as 3" starts before paint, and would "love the wider sweep. Even if we just had to do a ludicrously wide sweep here locally so that we could bring back semi-optimal defaults for a typical start." The first three questions were answered from the morning's tabulations without the page, by a disposable script over the run JSON; the fourth by a new verb of the lab.

### Fewer starts before paint

The search simulated from a first paint of the ranking's order and the first 0, 1, 2, 3, 4 or 8 seeds, patience 8, churn 100:

| Scope | First paint at 1 to 4 seeds | Then | At no seed | At 8 seeds |
| --- | --- | --- | --- | --- |
| This repository, five files | seed 1 every time | seed 6 adopted, 2 to 5 starts in | ranked painted; seed 1 after 1 start, seed 6 after 6 | seed 6 painted; no move |
| This repository, the chain | the ranking's order every time | seed 5 adopted, 1 to 4 starts in | the same, seed 5 after 5 | seed 5 painted; no move |
| The estate, five files | seed 1 every time | nothing | ranked painted; seed 1 after 1 | seed 1 painted; see below |
| The estate, the chain | the ranking's order every time | seed 8 adopted, 4 to 7 starts in | the same, seed 8 after 8 | seed 8 painted; no move |

Seeds 2 to 4 better nothing before paint on any of the four scopes, so the page's Order Starts fell from 4 to 2: the same first picture, two starts sooner. Watched in the page at the new defaults (moves at zero length, the root's attributes read every 100 ms): the five files paint seed 1 in 207 ms by the page's clock (three starts; October 6 measured 263 ms for five) and adopt seed 6 at the fourth idle start, settled at the twelfth; the chain paints the ranking's order in 338 ms (470 ms for five starts this morning) and adopts seed 5 at the third, settled at the eleventh; the estate's five settle at the eighth with nothing; the estate's chain adopts seed 8 at the sixth, settled at the fourteenth. Each is what the simulation says at two seeds.

### The churn cost, and the stopping rule

At churn 0 and at 100 the simulated search makes the same moves in every run of the table above but one: the estate's five files from a first paint of eight seeds, where churn 0 passes through three small moves (45 px of price for 3 swapped pairs, then 208 px for none, then 1,681 for one) to seed 23, a picture 10% shorter in vertical wire (17,992 against 20,051), and churn 100 refuses the first, 45 px for 3 pairs, and settles eight starts later without reaching the others, because the patience counted starts since the last adoption. The refusal was right; the stopping was the defect. The judge now counts the patience from the last start that bettered the best price found, churn aside, adopted or not; with that rule churn 100 reaches seed 23 in one move of two pairs (1,934 px of price) after fifteen starts, and churn 0 and 100 agree on every run of every scope. So the owner's suspicion holds here, no ramp was built, and the churn cost is a slider (Churn Cost, 0 to 400 px a pair, 100) for the owner to try 0 by eye. The churn counts pairs of cards in one column that swap; a move of 0 pairs and 208 px shows that rows reordering within a card are not counted, nor where on the screen a swap is, which is the owner's "higher precision" and stays open.

### The crossing and height costs on the grown graph

The morning's tabulations retried at crossing 0, 20, 40, 80 and 160 px and height 0, 2, 5 and 10 px: the page's pick does not change between crossing 20 and 160 at any height on any scope (at crossing 0 or 20 with height 0 the estate's chain keeps seed 2 instead of seed 8). Where the cheap price and the full score disagree the gap is under 1%: the chain's seed 5 (full score 2.070) against seed 7 (2.064), the estate five's seed 23 (2.078) against seed 1 (2.065); the five files and the estate's chain agree. The costs are not the lever; the start is.

### The wider space

The lab's new `widen` verb tabulates the starts at every setting of the ranking's pull (0, 1, 2, 5) and tie rule (fewest, right, left) and the order's sweep count (2, 4, 8): 36 settings of 33 starts, 1,188 layouts a scope, every start's full score against the baseline setting's ranked start so that the settings compare, and the page's search simulated at each from two seeds with the patience 8 at churn 100. The reports are beside this page (`*-wide.md`); the runs took 579 s on the five files, 675 s on the chain, 30 s on the estate's scopes.

```
npm run layout:lab -- widen <bundle/scope> --starts 32
```

| Scope | Baseline: the search ends at | Best setting by where the search ends | Best setting by its best start | The sweep count | The tie rule at no pull |
| --- | --- | --- | --- | --- | --- |
| This repository, five files | seed 6, 1.799 | pull 2, tie right: seed 2, 1.766 (−1.8%; 6% more wire, 12% fewer crossing spots, 24% fewer escaping wires, more foreign samples) | the same | 2, 4 and 8 identical at every setting | left: seed 10, 1.793; right: as baseline |
| This repository, the chain | seed 5, 2.070 | pull 1: seed 5, 2.047 (−1.1%; 7% more wire, 11% fewer spots, 17% fewer foreign samples, 14% fewer escaping) | pull 1: seed 3, 1.964 (−5%), which the page's price does not pick (it keeps seed 16, 2.091) | identical at every setting | nothing |
| The estate, five files | seed 1, 2.065 | the baseline | sweeps 2: seed 15, 2.062 | identical | nothing |
| The estate, the chain | seed 8, 1.917 | the baseline | the baseline | identical | nothing |

What the four say together:

- **Two sweeps are the sweep's fixed point.** On every scope, at every setting, two left-and-right passes give the picture four or eight give. The sweep count could fall to two for a cheaper start; the page's order step is 4 to 8 ms of a 65 to 120 ms start, so the saving is small.
- **The tie rule is not a dial.** At no pull it moves nothing on three scopes and 0.3% on the five files.
- **The pull is the dial that matters, and its best value differs by scope.** Pull 2 with the tie to the right is the five files' best by the full score and worse than no pull on the chain (2.112 against 2.070); pull 1 is the chain's best and a wash on the five files (1.805 against 1.799). Each gain is a trade the price does not see: more wire for fewer crossing spots, fewer foreign samples and fewer escaping wires. The estate's scopes are indifferent. This is the owner's question answered for one lever: the optimal dial does differ by context, and no one setting of the pull beats the baseline on both of this repository's scopes, so the baseline stands as the robust default.
- **The page's price cannot judge the pull.** At pull 1 on the chain the page's price keeps seed 16 (2.091) where the full score prefers seed 3 (1.964), because the pull's gains are in the membranes the routed wires cross and the wires that escape them, which the price (vertical wire, the order's crossings, the height) does not count. A search over the pull in the page would need a price term for the membranes, or the deck's signals computed in the page (the lab's routing is 400 ms a layout), before it could choose; and a change of pull changes columns, which the move today snaps.
- **The start's lottery dwarfs every lever.** The full score runs from 2.2 at the ranked start to 1.77 at the best start on the five files; the levers move it by 0.03.

## Open

- The pull as a fork for the owner: a page search that samples it needs a membrane term in the price and a smoother move across column changes; or the lab's reading sets fixed defaults, which today are the baseline's.
- The sweep count at two, for the owner's go.
- A churn weighted by where the eye is, or a ramp, should the wider space ever bring chains of small moves; the churn's blindness to rows reordering within a card.
