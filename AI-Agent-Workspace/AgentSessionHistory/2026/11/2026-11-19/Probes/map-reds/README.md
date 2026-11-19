# Four red cases on this repository's map: code or data

_Historical evidence, taken 2026-11-19 between 17:25 and 18:10 UTC by the builder of the round `map-reds`, on `892833fc` (whose code is `2af0289b`'s), through the browser lane, on the graphics card, at a load of 2.2 to 3.9. A temporary probe (not committed) opened each case's own address and read the page; nothing was asserted by it._

## How code was told from data

The cases went green at `a93ac108` and red at `2af0289b`. The page the suite serves is two things: the client's script (`static/index.js`) and the data built from the Live Docs (`explorer-data.json`). Built by either commit's builder, the same docs give the same data **to the byte** (`cmp`), so the parser's and builder's changes in between change nothing the page reads, and a hybrid is a swap of one file:

- the old docs (`a93ac108`): 1,079 files, 2,770 edges;
- the new docs (`2af0289b`): 1,091 files, 2,857 edges. The twelve new files are the history's `rows.ts`, `words.ts`, `textStore.ts`, `compareText.ts`, `headCheck.ts` and `regenerate.ts` and six tests.

The old client is `a93ac108` built in a scratch copy and run with that commit's own suite; the new client is this worktree's. The 2D map's code (`views/localView/`) is the same in both commits (`git diff --stat` is empty), so the 2D numbers are taken with the new client only. The history is not in any of these bundles; the four cases fail without it.

## The numbers

| | Old docs | New docs |
| --- | --- | --- |
| **3D, the whole repository enters** (`force-graph-update.spec.ts:140`, bound 1,300 substeps): old client, one evaluation a frame | rest at 841 frames, 17.8 s | rest at 1,360 frames, 29.1 s |
| the same, new client | rest at 907 substeps in 825 frames, 18.2 s | rest at **1,423 substeps** in 1,324 frames, 27.1 s |
| spheres | 1,065 | 1,077 |
| **2D, the search on the five files with 80 seeds** (the tuning of `local-map-hidden.spec.ts:51`), from first paint to its end | **22.5 s**: 80 seeds, 90 boundary joins, 9 adoptions (8 of them joins) | **73.7 s**: 80 seeds, 231 joins, 29 adoptions (26 joins); the last adoption of a seed (seed 77) at 43 s, then 138 joins more |
| **2D, the same with 4 seeds** (the tuning of `local-map-search.spec.ts:65`, whose first wait is 45 s), on the client with the saving below | 12.8 s: 4 seeds, 90 joins, 9 adoptions | 37.3 s: 4 seeds, 185 joins, 13 adoptions |
| its picture | 93 cards, 546 symbol rows | 98 cards, 627 rows |
| its cost a trial | 132 ms | 237 ms |
| **3D, `graph.ts` focused** (`force-graph-focus.spec.ts:72`), either client | not covered at the first view: no turn needed | covered from the first view by the translucent `packages/explorer` shell; the case's press point inside the `packages/engine` shell |

The four cases' own runs on the new client and new docs: all four red, as on `main`.

## What the 3D settle does with its last 700 substeps

Every sphere's place read once a second through a whole entry on the new docs (new client, load 5; this run rested at 1,413 substeps, the first at 1,423, so the count moves by about ten between runs). The picture is 5,282 units across, 1,077 spheres. Up to substep 590 nearly every sphere moves more than a thousandth of that a second; by substep 673 fifteen do, and the median sphere is under 2 × 10⁻⁵ a second from substep 755. **From substep 673 to rest, half the settle, two to nineteen spheres move at a time and the rest stand.** From there to rest the median sphere moves 0.5 units; 65 move more than 10, and ten more than 50: `visualize-rosetta.ts` 236, `visualize-sample.ts` 217, `relatedDocs.test.ts` 182, `sample-build.ts` 152, `relatedDocs.ts` 125, `find-orphans.ts` 121, `cli.ts` 112, `generate.ts` 79, `word-seams.test.ts` 68, `summarizeChange.ts` 55. It is the tail [the settle's round](../../../2026-11-18/Screenshots/settle-sooner/README.md#what-the-tail-is) found on the discovery picture: calm early, then a few spheres creeping and snapping. None of the ten is among the twelve new files; the new files changed where everything stands, and with it which few creep and for how long.

## Where the 2D search's time goes

A CPU profile of each search, mapped through the bundle's source map. On the new docs, 73 s sampled: the placement's network simplex (`rankByNetworkSimplex`) 53.7 s (73 %), inside `layoutScene` 63.5 s (87 %); of the solver, rebuilding the tree's postorder each pivot 16.2 s, the cut values 8.6 s, the tight tree's growth 12.8 s, the entering edge's search with its tests of a node's side of the cut 12.4 s. Measuring the page (`tryAdoptPicture`, the cards' heights and widths) 14.7 s. Ordering the starts 2.5 s. On the old docs the shares are the same (solver 60 %, layout 77 %) over 22 s. So the search is longer on the new docs because it tries nearly twice as many pictures (each adoption makes a fresh list of joins) and each costs nearly twice as much (a bigger placement).

**One plain saving, built.** Each test of which side of a pivot's cut a node lies on found the leaving edge's lower end again, twice, once for the node and once for the head; a pivot now finds it once (`headSide` in `network-simplex.ts`). The two are the same test by construction: the head lies below the edge exactly when it is the edge's lower end. On 252 random acyclic systems of 5 to 700 nodes, with zero weights and negative separations among them, the mended solver's every result (positions, cost, optimality) was the same JSON as the original's, and the solver took 1,525 ms against 1,863 (18 % less). The 2D unit cases (464) pass. On the page, the 80-seed search on the new docs with the mended solver ended exactly where the original's did: 80 seeds, 231 joins, 29 adoptions (26 joins), seed 77, a shown price of 3,197,457. It took 81.8 s at a load of 7.5 against the original's 73.7 s at 3.9; the solver's parts the change does not touch (the postorder, the cut values, the tight tree) took 17 % longer in that run, the machine's share, and the entering edge's search 9.9 s against 12.4, about a third less once that is allowed for: some 8 % of the solver, 6 % of the search. It does not bring the search under the cases' 45 s; the pictures it tries and the price of each are what the owner's choice decides.

## The focus case's camera never turned

The case orbits the camera to bring `graph.ts` out from behind whatever stands in front of it, pressing at a fixed point: the frame's centre and 200 px down and right. Once the map has built, a press on a sphere grabs the sphere (`forceGraphRenderer.ts`, and `force-graph-building.spec.ts` holds it). On the new docs that point lies inside the `packages/engine` directory shell at every one of the eight presses: the camera stood at (−52.1, −34.5, 684.2) after each of them, to the tenth, while the engine shell was dragged and the motion kept running (`aria-busy` true throughout). On the old docs `graph.ts` was clear at the first view, so the turns were never needed; when the probe turned the camera there anyway, the press point was on the background for seven turns of eight and the camera turned some 19° a turn.

[`focus-after-eight-presses.png`](focus-after-eight-presses.png): the new docs after the eighth press. `live-docs/graph.ts`'s name at the centre; the `explorer` shell, the large membrane above right, whose disc takes in `graph.ts`; `engine · 135` below it, where the presses landed.

**The case mended** (`force-graph-focus.spec.ts`, `backgroundPoint`): it turns the camera from a point of the background, no drawn sphere within 8 px of either end of the drag and the canvas under both, and checks that each turn turned the camera by more than 5°. Through the lane at 18:00 UTC on the new client: passed on the new docs (15.9 s) and on the old (13.0 s); unmended, it fails on the new docs as on `main`.

## Second leg: Settle Hold on the two 3D cases, and the placement solver made faster with every picture the same

_Taken 2026-11-19 between 18:13 and 19:05 UTC on `01b32fb0` and the commits after it, through the lane, while other builders loaded the machine (load 3 to 26). Wall seconds are given with the load; processor time is given where it was read._

### Settle Hold, set by the link alone, no default changed (today's docs, 1,077 spheres)

| Settle | Bound | Settle Hold 0 | Settle Hold 0.02 |
| --- | --- | --- | --- |
| `force-graph-update.spec.ts:140`, the whole repository enters (counted from the page's load; the case counts from a little later) | 1,300 | 1,421, 1,421 | 677, 680; the case itself, 572 |
| `force-graph-discovery.spec.ts:70`, the archipelago | 300 | 149, 149 | 137, 137 |
| the same, the largest group grows from its seed (305 spheres) | 2,700 | 5,147, 5,146 (43 to 48 s of the main thread) | 578, 578 (6 to 8 s) |

A temporary copy of each case with `settleHold: 0.02` in its entry link passed whole: the update case's five settles took 572, 145, 328, 154 and 99 substeps against 1,300, 450, 800, 450 and 350, in 67 s against its 240 s clock; the discovery case 137 and 576, with every picture expectation held (members, alphas, rings, counts, frontier wires). Neither case asserts where a sphere rests beyond stillness.

### The solver, three steps, each held to the solver as it stood (`01b32fb0`) as its oracle

The page's own solver was made to keep every system it was given (a scratch build, not committed): during the 80-seed search on the five files it solved **342 systems** of about 1,470 to 1,561 nodes and 3,524 constraints, and the search ended as it does on `main`. Every step below gives the same JSON as the oracle on all 342, on the seeded random systems of `network-simplex.equivalence.test.ts`, and on its three real systems; the 466 2D unit cases pass; and on the page the 80-seed search ends exactly as today's (80 seeds, 231 joins, 29 adoptions, seed 77, price 3,197,457) under each step's build. Processor time of the oracle and each step over all 342, interleaved system by system:

| Step (commit) | Oracle | The step | Less |
| --- | --- | --- | --- |
| 1. Only the moved subtree numbered again and its cut values summed (`c4fb0f68`) | 80.7 s, 107.7 s | 59.7 s, 73.4 s | 26 %, 32 % |
| 1 and 3a. The tight tree grown from two heaps (`38225b30`) | 94.6 s | 46.2 s | 51 % |
| 1, 3a and 3b. The entering edge sought below the leaving edge only (`a83a89fb`) | 62.0 s | 27.0 s | 56 % |

On the page (today's docs, 80 seeds, CPU profile; load 8 to 26, so compare the solver's column, not the wall):

| Build | Wall, paint to end | Load | Solver | Placement measured on the page (`tryAdoptPicture`) |
| --- | --- | --- | --- | --- |
| `01b32fb0` | 131.2 s | 9.1 | 92.1 s (70 %) | 30.3 s |
| step 1 | 121.2 s | 10.5 | 74.5 s (62 %) | 32.4 s |
| step 3a | 113.8 s | 9.8 rising to 26 | 50.8 s (46 %) | 35.3 s |
| step 3b | 68.0 s | 8.4 | 28.6 s (42 %) | 24.7 s |

On the quiet machine of the first leg the search took 73.7 s with 53.7 s in the solver; with the solver at about a third of that, it would take some 37 s there.

**What is left** in the final profile: numbering again the subtree an exchange moves, 18 s of 68 (the entering edge's ends' common ancestor is usually high in the tree, so the subtree is most of it; Graphviz does the same); the measuring of an adopted or promising picture on the page, 24.7 s with its own placement (the cards' heights and pins at the trial's widths 8.0 s, the cards' natural widths 5.0 s, putting the rows in the trial's order 3.4 s, drawing the adopted picture 2.2 s); the entering edge 7.0 s.

**Measuring the page, not built.** A card's natural width is measured again at every trial whose predicted price beats the shown picture's (the 29 adopted in this search, and those refused once measured). It depends on the card's content (its rows shown and their words, and its foot of returning connections, which a cycle's trial changes), the cap on a card's width, the fonts, and the card reading's room writes: the classes and properties `CardReading.measure` leaves on a card at the previous trial's widths (a name cut, a name's held lines, the foot held) are still on it when the next trial's `widths()` sets `max-content` and reads, since only `measure()` takes them back. So the natural width read at one trial may depend on the widths of the trial before; caching it once a search could change a picture, and was not done. Whether that dependence is real, a picture's widths following the order its trials were measured in, is a lead for a later round, not shown. Everything else measured there (heights, pins) depends on the trial's own widths and row order.

### The two 2D cases on the final build, current docs (load 12 to 16)

- `local-map-search.spec.ts:65`: its first competition now ends within the 45 s wait (line 73), where it did not before; the case fails at its 90 s test timeout during the second (line 92). Red.
- `local-map-hidden.spec.ts:51`: the search after the return does not end within 45 s (line 73). Red.

Both were run once under a load of 12 to 16; neither was run on a quiet machine after the change.

### When the search stops (the owner's rule), from the price the search showed through the 80-seed search on today's docs (before the solver's steps; seconds at load 3.9)

The search shows its first picture at a price of 3,444,817, has 3,426,808 at 37.8 s, and finds seed 77 at 42.7 s (3,200,099, 6.6 % lower). The seeds end at 45.9 s at 3,199,385. The 151 joins after that take 28 s more and lower the price by 0.06 %, to 3,197,457 at 65.2 s; the last 58 joins, 8.5 s, lower it by nothing.
