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
| its picture | 93 cards, 546 symbol rows | 98 cards, 627 rows |
| its cost a trial | 132 ms | 237 ms |
| **3D, `graph.ts` focused** (`force-graph-focus.spec.ts:72`), either client | not covered at the first view: no turn needed | covered from the first view by the translucent `packages/explorer` shell; the case's press point inside the `packages/engine` shell |

The four cases' own runs on the new client and new docs: all four red, as on `main`.

## Where the 2D search's time goes

A CPU profile of each search, mapped through the bundle's source map. On the new docs, 73 s sampled: the placement's network simplex (`rankByNetworkSimplex`) 53.7 s (73 %), inside `layoutScene` 63.5 s (87 %); of the solver, rebuilding the tree's postorder each pivot 16.2 s, the cut values 8.6 s, the tight tree's growth 12.8 s, the entering edge's search with its tests of a node's side of the cut 12.4 s. Measuring the page (`tryAdoptPicture`, the cards' heights and widths) 14.7 s. Ordering the starts 2.5 s. On the old docs the shares are the same (solver 60 %, layout 77 %) over 22 s. So the search is longer on the new docs because it tries nearly twice as many pictures (each adoption makes a fresh list of joins) and each costs nearly twice as much (a bigger placement).

**One plain saving, built.** Each test of which side of a pivot's cut a node lies on found the leaving edge's lower end again, twice, once for the node and once for the head; a pivot now finds it once (`headSide` in `network-simplex.ts`). The two are the same test by construction: the head lies below the edge exactly when it is the edge's lower end. On 252 random acyclic systems of 5 to 700 nodes, with zero weights and negative separations among them, the mended solver's every result (positions, cost, optimality) was the same JSON as the original's, and the solver took 1,525 ms against 1,863 (18 % less). The 2D unit cases (464) pass. It does not bring the search under the cases' 45 s; the pictures it tries and the price of each are what the owner's choice decides.

## The focus case's camera never turned

The case orbits the camera to bring `graph.ts` out from behind whatever stands in front of it, pressing at a fixed point: the frame's centre and 200 px down and right. Once the map has built, a press on a sphere grabs the sphere (`forceGraphRenderer.ts`, and `force-graph-building.spec.ts` holds it). On the new docs that point lies inside the `packages/engine` directory shell at every one of the eight presses: the camera stood at (−52.1, −34.5, 684.2) after each of them, to the tenth, while the engine shell was dragged and the motion kept running (`aria-busy` true throughout). On the old docs `graph.ts` was clear at the first view, so the turns were never needed; when the probe turned the camera there anyway, the press point was on the background for seven turns of eight and the camera turned some 19° a turn.

[`focus-after-eight-presses.png`](focus-after-eight-presses.png): the new docs after the eighth press. `live-docs/graph.ts`'s name at the centre; the `explorer` shell, the large membrane above right, whose disc takes in `graph.ts`; `engine · 135` below it, where the presses landed.
