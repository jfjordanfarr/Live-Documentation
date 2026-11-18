# A return as one term of the price: measurements

_Historical evidence, measured 2026-11-16 for the second milestone of the round of [Turn 5 of the November 15 record](../../2026-11-15.1.record.md#turn-5). The decision is in [the decisions log](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md), the first milestone's measurements in [fewest-returns](../fewest-returns/README.md), and the pictures in [the milestone's pictures](../../Screenshots/fewest-returns-2/README.md)._

The ranking prices each cycle's candidate orders by the columns of the picture each makes: every reference spans columns, forward or back, and a returning one costs the return cost more. "Greedy" is the ranking at `3f734433`; "fewest" the first milestone's, every cycle in its fewest-returns order. The scripts ran from a scratch folder three levels down with `npx --offline tsx --tsconfig <repository>/tsconfig.base.json`; their imports are adjusted to this folder. The greedy ranking was imported from `branches-base.ts`, a copy of `branches.ts` at `3f734433` with its relative imports made absolute, which is not kept.

## The table

`flip-table.md` (made by `table.py` from `fine.md`, `fine-monotone.md`, the first milestone's lab table and `readings.json`): for each of the 34 pictures the fewest-returns order changed, the least return cost at which the priced ranking leaves the greedy order, with the candidates as built (path) and with only candidates that return no more than the greedy order; the lab's signals of the fewest-returns picture against the greedy one; and my reading of the two pictures by eye, from the contact sheets.

- "0 (+2)" leaves at nought for an order that returns two more references than the greedy order; "0 (o)" for an order on the way that is not the fewest-returns order.
- Readings: **better** the fewest-returns picture reads better; **only scores better** it reads worse though its numbers are better; **mixed** some of each; **neutral** no difference worth naming.
- Only scores better: `dotnetConfig.ts` leaves at 0.5, `sourceAnalysis.ts` at 20, `powershell.ts` above 20. Better: twelve of thirteen leave by 0.25; `go.ts` at 2. Hence the default, 0.25.

## The rest

| File | What it holds |
| --- | --- |
| `flip.ts`, `fine.ts` | The least flipping cost per picture, and each picture's state (greedy, fewest, another, or more returns than greedy) at costs from 0 to 20. |
| `fine.md` | The candidates as built. At 0.25: 10 pictures keep the greedy order, 3 return more than it (`branch-scene.ts` +2, `branches.ts` +2, the `localView` directory +1). |
| `fine-monotone.md` | Measured, not adopted: candidates limited to orders that return no more than the greedy order. No picture returns more; `branch-scene.ts` and the directory take the fewest-returns order at nought, `branches.ts` keeps the greedy order up to 5. |
| `fine-col2.md`, `fine-col5.md`, `fine-col10.md` | Measured, not added: a price per column of the picture at 2, 5 and 10. At 5, `css.ts` and `aspnet.ts` keep the greedy order up to 4 and 1.5, and the only-scores-better `dotnetConfig.ts` up to 1.5, widening the safe band to 0.25–1.5; `go.ts` then needs 5. |
| `fine-stack5.md`, `fine-stack20.md` | Measured, not added: a price per card in the fullest column. It does not return `adapters/index.ts` to the greedy order; at 20 it takes the fewest-returns order, also worse than the greedy one. |
| `lab-default-build.md` | The layout lab on the deck's four scopes and the 33 files at the default against the greedy order, each captured from the default page; the last column is the drift of each layout from the page it was captured from (the greedy one drifts because the page is the default's; the default's is 0 everywhere). |
| `lab-merged-build.md` | The same after merging `main` at `efbda787` (the far view's files-only look and the day's records): the lab's layout at the default agrees with the page on all 37, no drift. |
| `return-cost-red.txt` | `tests/e2e/return-cost.spec.ts` run against the first milestone's page, served from its build: it fails at its first assertion, the registry standing left at the default. |
| `drift-probe.ts`, `drift-probe.txt` | Why the lab drew a returning-connections line on `core.ts` that the page did not: the return's using end names no symbol, and the page anchors it on the Internals row's dot, which its disclosure hides. |
| `drift-fewest.ts`, `drift-fewest.txt` | With that mended, the lab against the first milestone's page on the seven pictures that drifted (five of them already at the base): no drift on any. |
| `timing2.ts`, `timing2.txt` | The ranking's time before and now on the pictures with the most candidates and the largest pictures, and the candidates per picture over the repository's 975. |
| `find-case.ts` | The search that found the unit case where the greedy order wins at half a column. |
| `sheets.ts` | The contact sheets. |
