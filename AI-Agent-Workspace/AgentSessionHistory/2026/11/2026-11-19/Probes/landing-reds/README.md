# Three red browser cases after the engine round's landing: code or data

_A record of 2026-11-20 UTC (02:00 to 03:30), not current documentation. Taken by the builder of the round `landing-reds` on `16629d43` (`main`, whose client is the landing `86ba38c3`'s), through the browser lane, on the graphics card (ANGLE, D3D12, RTX 3090), at a load of about 2.3 with nothing else running. Temporary probes (not committed) opened each case's own address and read the page._

## How code was told from data

As on [November 19](../map-reds/README.md#how-code-was-told-from-data): the served bundle is the client's script and `explorer-data.json`; swapping the second alone gives today's client on yesterday's map. The landing changed the stored format of a Live Doc (a title now reads `` # `tsconfig.json` ``), so today's builder cannot read the pre-landing docs; the old data was built by the pre-landing builder from a `git archive` of `3d2bdc683` in a scratch folder, with this worktree's dependencies linked in and the repository's own packages its own.

- the old docs (`3d2bdc683`): 1,093 files;
- the new docs (`16629d43`): 1,120 files.

| Case | Today's client, old data | Today's client, today's data |
| --- | --- | --- |
| `local-map-directories.spec.ts:553`, Width Cost turns a directory's shape | passed | failed |
| `return-cost.spec.ts:75`, a link's Return Cost | passed | failed |
| `force-graph-focus.spec.ts:108`, a focused URL, at one worker, repeated | 8 of 8 passed | 0 of 8 passed |

All three are the map's growth, not the landing's code. The third is not intermittent on a quiet machine: it failed 8 runs of 8 at one worker and 10 of 12 at two (the gate's first pass), in three different ways (below).

## What each case protects, and where it stands

- **Width Cost** (`local-map-directories.spec.ts`): a person who frees the width sees an opened directory stand wider, and the link carries that choice to another screen. Cause shown (data), subject moved, proven to fail when the lever is ignored; green 5 of 5.
- **Return Cost** (`return-cost.spec.ts`): the Return Cost a link names is the one the search prices a cycle's orders with, and Tuning shows it. Cause shown (data), subject moved, proven to fail when the search ignores the link's cost; green 5 of 5.
- **Focus** (`force-graph-focus.spec.ts`): a focused link centres its file, a click on its sphere pins it, More opens its details, and Centre on brings it back to the centre. Two of its three failures were the helper's (shown, mended); the third, the subject 14 to 46 px off centre after Centre on, is shown only on today's map and its cause is **not found**. The case is still red, 5 of 5. Next step: record, frame by frame after the press of Centre on, the framing's own `target`, `insets` and the camera's quaternion in `forceGraphView.ts` (a scratch build), to see whether the framing aims at graph.ts and the last frame's re-aiming moves it, or aims elsewhere; and try the same press on the old data after the same pin, to tell picture from code.

## Width Cost on `scripts/live-docs`

The price's walk starts from the narrowest shape and wraps the tallest rank at fewer rows while the next shape is strictly cheaper; it stops at the first that is not (`searchFlowShape`, by design). The shapes priced, at the default Width Cost and at nought:

| Data | Width Cost | Rows priced (price) | Chosen | Columns, width |
| --- | --- | --- | --- | --- |
| old | default | none 45,268; 9: 30,632; **4: 27,260**; 3: 27,894 | 4 | 5, 1,739 px |
| old | 0 | none 40,278; 9: 23,812; 4: 18,610; 3: 17,414; **2: 9,078**; 1: 19,113 | 2 | 7, 2,394 px |
| today | default | none 72,209; 12: 42,023; **6: 39,353**; 4: 42,843 | 6 | 4, 1,455 px |
| today | 0 | none 69,049; 12: 37,033; **6: 32,533**; 4: 34,193 | 6 | 4, 1,455 px |

The directory gained five files (`absoluteLinks.ts`, its test, `cli.test.ts`, `inspect/history.test.ts`, `inspect/resolve.test.ts`). With the width free every shape is cheaper, but wrapping from six rows to four still costs more, so the walk stops at six both times: the lever moves the price and no longer the choice on this directory. Whether two rows, which the walk never reaches today, would be cheaper is not known; that is the walk's documented stopping rule, not a fault with one right answer.

[`live-docs-today-width-cost-default.png`](live-docs-today-width-cost-default.png): today, the default. Four columns: `inspect` closed and `absoluteLinks.ts`, `sample-build.ts`, `cli.ts` on the left, the commands in three columns to the right, every card legible. A sound picture. [`live-docs-before-width-cost-0.png`](live-docs-before-width-cost-0.png): the old data at Width Cost nought, two rows across seven columns running off the frame's right, the shape the case used to see.

**The subject, moved.** The estate sample's `Contracts` (a fixed C# program, `tests/integration/programs/csharp/estate`) turns with the lever: at the default the narrow shape (none 10,844 against two rows 11,626), three columns, 1,002 px; at nought two rows (4,806 against 5,854 for none and 5,214 for one), four columns, 1,374 px. The estate's other directories, Rosetta's C and C# `src`, and this repository's directories do not, or not reliably. The case now opens `Contracts` and asserts the same things.

## Return Cost on `adapters/manifest.ts`

The search on (4 starts, patience 4), the counts of returning connections the overlay showed:

| Data | Return Cost 0 | 250 to 500 | 1,000 | 1,150 to 1,500 |
| --- | --- | --- | --- | --- |
| old | 1 (kept) | 1 (kept) | 1, then 0 (moved) | 1, then 0 (moved) |
| today | 1, then 0 (moved) | 1, then 0 | 1, then 0 | 1, then 0 |

The manifest and the adapters around it came to read their source through `tooling/sourceText.ts` in the landing; with that card in the picture the order that returns nothing is the cheaper one in wire alone, and the search moves to it at any Return Cost, nought included. [`manifest-today-return-cost-500.png`](manifest-today-return-cost-500.png): today at 500, every adapter (`cargo.ts`, `pyproject.ts`, `pom.ts`, `gomod.ts` …) in one column right of the manifest, no return drawn, tidy. [`manifest-before-return-cost-500.png`](manifest-before-return-cost-500.png): the old data at 500, the greedy order kept, `openings.ts` left of the manifest and an adapter column further right with a return. The product is right: it chooses the cheaper picture, and here there is no longer a trade for the lever to decide.

**The subject, moved.** No sample had a cycle the search tries at every cost (the estate's ring of three is tried at none: each order of three files returns one). The Rosetta C# program's `Models/ModelFactory.cs` and `Models/Record.cs` use each other: the greedy order shows two returns; the other order returns one and is priced 1,786 px of wire dearer at no Return Cost (shown 18,775 against 20,561). So it is kept at 0 and at 1,500 and adopted at 6,000. The case now opens it by links naming 500 (kept, `[2]`, one trial) and 4,000 (moved, `[2, 1]`), and Tuning shows each value; the default's link still shows the default. It no longer depends on where the default stands.

## Proof that the two mended cases can fail

A temporary change to `branch-renderer.ts` (removed, rebuilt, `git status` clean of it): the shape's price counted Width Cost at 12 whatever the lever said, and the search priced returns at 1,500 whatever the link said. Both mended cases went red: the directory case at `expect(free.shape).not.toEqual(chosen.shape)`, the Return Cost case at "at 4,000 px a return is worth the wire". With the product restored: each 5 runs of 5 green, and both spec files whole green (17 cases).

## The focus case

Eight runs at one worker, today's data, before any change: 1 failed at the first turn (the camera turned 0°), 3 at the click on graph.ts (no pin: the press did not reach graph.ts), 4 after Centre on graph.ts (the focus 30 to 46 px from the room's centre). The same eight on old data: all green. Old data with one turn forced before the click: 6 of 6 green, so a turn alone does not cause the third.

**The first two: what a press takes.** The page picks a press by the nearest sphere or wrapper skin the ray meets, a skin taking it for its seed (`nodeAt` in `forceGraphRenderer.ts`); a directory shell is drawn as its skin alone. The helpers asked only whether a sphere's disc lay near: `backgroundPoint` could choose a point on a shell's skin, which the press grabbed (camera 0°), and `hittablePoint` could choose a point of graph.ts's disc that the translucent `explorer` shell covers, which the click opened instead of pinning graph.ts. Mended: the helper now asks what a press at each point takes from the drawn buffers themselves (spheres at their drawn centre and radius, skins as their uploaded triangles, skins bursting open skipped), and a background point must take nothing at both ends of the drag and 8 px around each. When no point of the frame takes a press as a turn, it says so. After the mend, 13 runs: no failure at the turn or the click.

**The third, not found.** After Centre on graph.ts the picture is still (`aria-busy` false, substeps unchanged) and the camera stops within half a second, at graph.ts 14 to 46 px left of the centre of the room, 2 to 4 px low, steady for six seconds, differing run to run. [`focus-after-centre-off-by-15-to-46-px.png`](focus-after-centre-off-by-15-to-46-px.png): the end of one such run, graph.ts pinned, its actions near the frame's centre, at the left edge of the large `explorer · 233` shell. The framing (`frameCameraSpheres`) centres a subject in the uncovered room by construction, and the detail panel was closed when it ran. Whether the page or the case is wrong here was not settled in this round.
