# A cycle's order as a trial of the continuing search: measurements

_Historical evidence, measured 2026-11-16 for the third, fourth and fifth legs of the round of [Turn 5 of the November 15 record](../../2026-11-15.1.record.md#turn-5). The decision is in [the decisions log](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md); the earlier legs' measurements are in [fewest-returns](../fewest-returns/README.md) and [fewest-returns-2](../fewest-returns-2/README.md); the pictures in [the leg's pictures](../../Screenshots/fewest-returns-3/README.md)._

The scripts ran from a scratch folder three levels down with `npx --offline tsx --tsconfig <repository>/tsconfig.base.json`; their imports are adjusted to this folder. The captures they read (`captures/`, one per picture, from the page with the search off) are not kept: `capture-all.ts` makes them again from a built bundle.

## The third leg: a nominal placement before the first draw (refused)

| File | What it holds |
| --- | --- |
| `placed-flip.ts`, `placed-flip.md` | Each candidate laid out on the nominal model from the page's starts and priced by the page's price with the two terms; the least Return Cost at which the choice leaves the greedy order. A default separated the readings (1475 to 2675), but `adapters/index.ts` took the fewest-returns order at every cost. |
| `choice-time.md` | Why it was refused: the choice took 150 ms to 2.5 s on the first draw of the largest pictures, one exact placement of `branch-renderer.ts` or `branches.ts` alone 170 to 320 ms on either model. |

## The fourth leg: the continuing search, on real card sizes

| File | What it holds |
| --- | --- |
| `capture-all.ts`, `capture-first.txt`, `capture-final.txt` | Every changed picture captured from the page with the search off, and the lab's first draw against it: no drift on any of the 33, on the build before the merge with `main` and on the final build. |
| `real-flip.ts`, `real-flip.md` | The flip table: each picture walked as the search walks it (`walkCycleTrials`), on its capture, at every Return Cost from 0 to 5000 px by 25, the least cost at which it leaves the greedy order, what stands at a few costs, and the memory comparison (item 4). |
| `components.ts`, `components.md` | The page's price term by term for `adapters/index.ts`, `go.ts`, `branch-renderer.ts`, `branches.ts` and `dotnetConfig.ts`: why the search keeps or leaves the greedy order. |
| `trial-time.ts`, `trial-time.md` | What one cycle trial costs the search: ranking, order step and placement on the card model. |
| `final-shots.ts`, `final-shots.md` | The pictures as first drawn and as the search leaves them, and the first draw's time on this build and on `main`'s. |

## The fifth leg: the first draw's time, the registry's arrival, the page against the walk

| File | What it holds |
| --- | --- |
| `timing.ts`, `bench-explore.ts`, `first-draw-time.md` | The first draw's time on `main`'s build and this branch's, interleaved, on the same data and on `main`'s own; the ranking's own time in Node, `main`'s module read from a `git archive` of `main` extracted beside the script as `main-tree/`. |
| `watch.ts`, `registry-arrival.md` | `adapters/index.ts` arriving with the default search on both builds: the search's status every three seconds, and the look. |
| `agree-5.ts`, `page-and-walk.md` | Every trial of the 33 pictures, the lab's walk against the page's own record: verdicts, prices, the page's measurement. |
| `feet-read.ts`, `feet.md` | Every trial's prediction on a build without the feet, beside the final build's and the walk's: what standing each card's foot as the trial dresses it changes. |
| `feet-case-red.md` | The `core.ts` feet case failing on the build without the feet, and `branches.ts` passing. |
