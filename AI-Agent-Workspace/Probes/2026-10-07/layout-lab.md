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

## The wall: the layout's rules as levers

The owner's go ([Turn 20](../../ChatHistory/2026/10/2026-10-06.1.record.md#turn-20)): "Can we try cranking out a lot of computation here locally to try and find it with respect to a few known scenes?", the wall being whatever caps the picture's improvement, which the agent had said was the layout's own rules rather than two dimensions or the browser. The first rule made a lever is the membranes': `membraneDepth`, how many levels of directory below the retained files' common directory are membranes, every level by default; files deeper belong to the membrane at that level, so at zero no directory shapes the order or the placement and the cards interleave freely. It runs through the exploration (`exploreBranches`), the tuning and the lab, and the page draws every depth as the lab predicts, to the pixel (`verify` on the five files at depths 0, 1, 2 and full; [the pictures](../../Screenshots/2026-10-07/README.md#the-membrane-rule-relaxed-later-on-october-7)). Beside it the lab's signals gained `fragments`, the runs beyond the first that each of the files' real directories forms in each column, so that the price of interleaving is read in both directions whatever membranes a setting drew. Three grids over the four scopes, 32 seeds each (`*-wall.md`, `*-wall-pull.md`, `*-wall-room.md` beside this page):

```
npm run layout:lab -- widen <bundle/scope> --starts 32 --grid "membraneDepth=0,1,2,3,none;bandGap=-40,0,28;membraneNeck=0,60" --label wall
npm run layout:lab -- widen <bundle/scope> --starts 32 --grid "membraneDepth=0,1,none;rankingPull=0,1,2" --label wall-pull
npm run layout:lab -- widen <bundle/scope> --starts 32 --grid "membranePadding=0;bandGap=0;membraneNeck=0" --label wall-room
```

A negative band gap lets sibling membranes overlap by as much; the room grid keeps every membrane and gives it no padding, no gap and no neck. The chain scope holds three of the lab's own files, whose graph the day's work had changed since the morning's capture, so it was recaptured before its grids ran; the other three scopes' captures still match the page.

The vertical wire length, the placement's own measure, at the picture the search ends on (patience 8 from two seeds), by scope and relaxation, with the crossing spots, the picture's height and the fragments of that picture; the best start tabulated where it differs from the search's end:

| Scope | Baseline | Membranes with no room (padding, gap and neck at zero) | Sibling membranes overlapping by 40 px, no neck | No membranes | Shortest found anywhere |
| --- | ---: | ---: | ---: | ---: | ---: |
| This repository, five files | 161,899 (seed 6; 691 spots; 3,562 tall) | 137,606 (−15%; 600 spots; 3,000 tall; 0 fragments) | 135,618 (−16%; 715 spots; 3,059 tall; 0) | 141,753 (−12%; 527 spots; 2,528 tall; 7 fragments); best start 141,000 | no membranes with pull 2: 107,164 (−34%; 565 spots; 2,438 tall; 7 fragments). With membranes: depth 2's best start 129,443 (−20%; 681 spots; 2 fragments), 116,909 with the overlap (−28%); the search ends at 146,711 there, the page's price preferring fewer crossings |
| This repository, the chain | 159,866 (seed 2; 1,456 spots; 3,978 tall) | 148,415 (−7%; 1,265 spots; 3,716 tall; 0) | 147,842 (−8%; 1,436 spots; 3,776 tall; 0) | 187,434 (+17%; 834 spots, −43%; 3,275 tall; 3 fragments); best start 187,193 | the overlap, 147,842; with pull 1 and no membranes the vertical is 178,958 at 836 spots |
| The estate, five files | 20,051 (seed 1; 49 spots; 1,500 tall) | 15,759 (−21%; 53 spots; 1,253 tall; 0); best start 13,477 (−33%) | 14,430 (−28%; 65 spots; 1,068 tall; 0) | 15,020 (−25%; 53 spots; 811 tall; 0); best start 14,058 (1 fragment) | the room-less membranes' best start, 13,477 |
| The estate, the chain | 7,492 (seed 8; 29 spots; 795 tall) | 6,709 (−10%; 28 spots; 671 tall; 0) | 6,690 (−11%; 31 spots; 710 tall; 0) | 6,101 (−19%; 20 spots, −31%; 775 tall; 0) | no membranes, 6,101 |

What the tables say:

- **The membranes' ordering rule costs little or nothing.** Freed of every membrane, the order step keeps every directory's cards together anyway on both estate scopes (0 fragments), and on the five files breaks the directories in 7 places for a picture no shorter than the one membranes with no room give (141,753 against 137,606). On the chain, no membranes makes the vertical wire 17% longer while halving the crossing spots: the bands the rule imposes help the barycenter sweep, a heuristic, find short wires. The rule is not where the length hides.
- **The membranes' room is the price.** The padding (12 px and a border), the gap between sibling membranes (28 px), the neck that joins a membrane's segments (60 px of overlap) and the label's line cost 15% of the vertical wire on the five files, 7% on the chain, 21% on the estate's five files (33% at the best start), 10% on the estate's chain, with no directory broken. Of the three, the gap is worth most: sibling membranes allowed to overlap by 40 px give 14 to 16% on the five files, 8% on the chain, 28% on the estate's five, 11% on its chain; the neck alone 2%, 1%, 8% and nothing.
- **The leaf directories are the costly levels.** On the five files, membranes for two levels below the root (`packages/engine`, `packages/explorer`, `scripts/layout-lab` and their peers) and none deeper have the shortest start of any setting that keeps membranes, 129,443 px (−20%, 2 fragments, crossing spots at the baseline's), 116,909 with the overlap; the page's price does not pick that start, keeping one with fewer crossings at 146,711, so the search never shows it. One level (`packages`, `scripts`, `tests`) gives 148,736; three, 163,051 at the search's end.
- **The pull compounds.** Without membranes the pull of 2 takes the five files to 107,164 px (−34%) at 7 fragments, the best full score of any setting anywhere; on the chain the pull without membranes shortens the vertical wire that losing the membranes had lengthened (178,958 against 187,434) and keeps the halved crossings. With the membranes the pull trades length for tidiness, as the wider space found.
- **The order step's headroom is real.** At most relaxations the shortest start tabulated is shorter than the picture the search ends on, by 7% on the estate's five files without membranes (14,058 against 15,020) and 15% with room-less membranes (13,477 against 15,759), and a start the full score prefers is often one the page's price does not keep. That spread is the heuristic's and the price's, not the plane's.
- **A shift in the chain, unexplained.** The chain's recapture reproduced the page to the pixel, its 52 files and 255 wires unchanged since the morning's capture with the same length and the same crossing spots at the ranked start; yet the order step counts its own crossings there at 8,064 where the morning's tabulation counted 7,941, and seed 2 now gives the picture seed 5 gave, so the baseline's search ends at seed 2 at the same price. The cause was not found today; the day's tables for the chain are the fresh run's, consistent in themselves.

So, to the owner's question: neither two dimensions nor the browser is the wall these scopes meet. The measured price of the membrane rule is almost entirely the room the design gives membranes to be legible, a dial already in the tuning (padding, band gap, neck), and the remainder is the order heuristic's distance from the best start it could find. What the lab cannot price is the eye: a membrane with no room hugs its cards and touches its siblings, and a picture without membranes loses where a file lives except by the path under its name ([the pictures](../../Screenshots/2026-10-07/README.md#the-membrane-rule-relaxed-later-on-october-7)).

## Open

- The membranes' room as the owner's trade: the band gap, the neck and the padding against 10 to 33% of the vertical wire; a membrane allowed to overlap its sibling by a few pixels (a negative band gap) is the "little non-orthogonality" the lab says pays most per pixel of room given up.
- Membranes for the upper levels only (`membraneDepth` 2 on the five files), for the owner's eye, and a price the search can see it by.
- The pull as a fork: a page search that samples it needs a membrane term in the price and a smoother move across column changes; or the lab's reading sets fixed defaults, which today are the baseline's.
- The rules not yet levers: wires behind cards instead of through lanes, sub-columns for a tall rank, a backward reference drawn backward, a soft gap in the solver; each a larger change of the order step or the placement.
- The sweep count at two, for the owner's go; a churn weighted by where the eye is, or a ramp, should chains of small moves appear; the churn's blindness to rows reordering within a card.
