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

## The root's reading _(November 20, 2026, 03:00 UTC)_

Read by the root: this record, the whole diff of the three specs, and three of the five pictures (today's `scripts/live-docs` at the default Width Cost, a sound four-column picture; today's manifest at a Return Cost of 500, every adapter in one column and no return, which reads well; the focus case after Centre on). The two pictures of the old data were not looked at. The cases were not run again by the root. On `main` as `89f6d813`.

- **The two 2D cases are accepted as mended.** Each now stands on a fixed program where the lever decides something, each was shown able to fail, and the product was right on today's map in both. What they leave to say: the price's walk over a directory's shapes stops at the first that is not cheaper, so on today's `scripts/live-docs` a two-row shape is never priced; whether that walk should look further is a question about the product, not this case's.
- **The focus case is truer and still red,** at the step after Centre on, where the file rests 14 to 46 px from the room's centre. That may be the product's fault and is the next thing to run down, by the step this record names.
- **To change in the focus case's helper when it is next worked on:** it re-derives in the spec what a press would take, a hundred lines of rays against spheres and skins that must agree with the page's own `nodeAt`. The case is about focusing, pinning and centring, not about picking; asking the page's own picker through the inspection hook the spec already reads would say the same with none of the geometry written twice. Keep the spec's own version only if that hook cannot be made.

## The focus case run down

_Taken on November 20, 2026, 04:00 to 06:40 UTC, by the builder of the round `focus` on `21b6e602` and its mend `deea7381`, through the browser lane, on the graphics card (ANGLE, D3D12, RTX 3090), at loads of 1.4 to 17 while other builders' holds ran between ours. The container's rebuild had left its own browser install broken: Playwright 1.58.2's unpacking of Chromium hung under Node 26 from 03:39, and `post-create.sh` never reached the card's EGL, so a browser drew in software and the suite's first check stopped it. This round ran a private copy instead, from `/tmp/claude-1000/focus/`: Playwright's headless shell, build 1208 (Chrome for Testing 145.0.7632.6), unpacked by hand from Playwright's own download, and Mesa's EGL (`libegl1`, `libegl-mesa0`, `libwayland-client0`, unpacked from their packages without installing), reached through `PLAYWRIGHT_BROWSERS_PATH`, `LD_LIBRARY_PATH` and `__EGL_VENDOR_LIBRARY_FILENAMES`; the suite's first check then named D3D12. Every number below is from that browser. Nothing shared was changed._

**What the page aims at and where it ends.** A scratch build of the view (not committed) logged at every frame after the press of Centre on the framing's own target, insets and subject; a probe case (not committed) read at every frame the drawn sphere of `graph.ts` projected through the camera, the place of its name and whether it was shown, the file's actions (Pin, Centre, More), and where focus stood. Six runs on `21b6e602`:

- The framing aims at `graph.ts` in the room the controls leave: insets right 0 and bottom 64 once the reader has closed (its first frames still finish the Fit that opening the reader asked for, right 361). Its last frame, at 650 ms, puts the sphere at (509.5, 303.0) of a 1,019 × 670 frame whose room is 1,019 × 606: the room's centre to the tenth of a pixel, every run. The picture is still (no substep). **The camera is right.**
- The name of `graph.ts` went as the sphere came to rest: at 972 ms in one run, standing then at (509.1, 303.0); at 797 ms in two others, at (486.0, 305.5) and (479.0, 306.1), 23.5 and 30.5 px left and 2.5 and 3.1 px low. A hidden name keeps the place it last stood at. The case looked once for the name shown, which it was in mid-flight, and then polled its place: the place of a name since hidden. That is the record's 14 to 46 px left and 2 to 4 px low, steady, a different offset each run: where the flight was when the name went. When the name went within 8 px of the centre the case passed, which is why the round that timed the whole suite saw it fail 1 of 3 alone (22.7 px) as `force-graph-focus.spec.ts:182`: this same case, its line moved by the helpers of `89f6d813`.
- Why it went. The file's actions held keyboard focus throughout, on More: the case presses More and then Inspect, the menu gives focus back to More, and the reader, closing on its own Centre on, gives it back to More again (the design system's *Where focus goes*). Actions holding focus stood still on the screen (`positionActionStrip`: "a settling sphere must not pull a control away from a person aiming at it or using the keyboard"), so they stayed where they were set when More was pressed, above where `graph.ts` then stood: (459 to 573, 267 to 309) in the frame, a little below the room's centre. Opening the reader framed the scope in the room left of it and carried `graph.ts` away to the left; Centre on brought it back to the centre, under its own actions. Every side its name could stand on met them, so the name was hidden, and the actions covered the file. [`focus-before-name-hidden-under-its-actions.png`](focus-before-name-hidden-under-its-actions.png) (the page with the mend undone, below): `graph.ts` at the room's centre under its own Pin, Centre and More, unnamed.
- On the map before the landing `graph.ts` needed no turn and was clicked at the room's centre; its actions stood above the centre and its name had room below them. That is why the case passed there.

**The verdict: both, the page at the cause.** The case took for the file's place the place of a name the page had hidden. The page left the file's own actions where the camera's flight began, over the file it had centred, and so hid its name; the strip's own purpose ("keep the accessible controls with the sphere while the simulation or camera moves") and the design system's legibility say it should not.

**The mends** (`deea7381`).

- The page (`forceGraphView.ts`, `positionActionStrip`): actions holding keyboard focus stay at the place in the picture where their sphere stood, which the camera carries, and go with the sphere itself while the camera follows it or holds it in place, as it does the subject; under the pointer or an open menu they still stand still on the screen. A sphere's own settling still does not pull them from under the keyboard; a flight of the camera takes them along. An independent review (one subagent, reading the code) found that the place in the picture alone left the same fault for a subject whose picture settles while the camera follows it, the actions drifting against a sphere the camera holds still; the second clause is its mend. No camera or layout math changed, so there is no new Vitest case: the framing was right, and which point a focused strip is placed by is the page's behaviour, held by the browser case.
- The case (`force-graph-focus.spec.ts`): `expectFocused` reads in one look that the name is shown and where it stands; after Centre on it checks that the actions of `graph.ts` stand beside it (their middle within 2 px across, their nearer edge more than 7 px and less than the sphere's radius and 12 px above or below its centre), not over it; and what a press would take is asked of the page's own picker, which the scene now offers its observers as `spatialPick` (`nodeAt`'s answer, read-only), in place of a hundred lines of rays against spheres and skins written to agree with it.

[`focus-after-centre-named-beside-its-actions.png`](focus-after-centre-named-beside-its-actions.png): after the mend, `graph.ts` at the room's centre, its actions above it, its name below. A sound picture.

**Runs, all through the lane.**

| What | When (UTC), load | Result |
| --- | --- | --- |
| The probe on `21b6e602` | 04:15 to 04:28, 1.6 to 5 | 6 of 6 hid the name at rest; the sphere at the centre to 0.1 px each time |
| The case on the mend, one worker | 05:13, about 5 | 2 of 2 |
| The case, ten times, one worker | 05:21 to 05:24, 9.0 falling to 3.1 | **10 of 10**, 12.9 to 14.1 s each |
| The whole spec file, the gate's two-worker pass | 05:24 to 05:27, 3.1 to 1.9 | **15 of 15** |
| The rest of the `force-graph-*` family, two passes at two workers | 05:38 to 05:46, 8.1 to 2.3 | 65 of 66. The one failure, `force-graph-discovery.spec.ts:70`, is a settle: "the largest group grows from its seed" did not come to rest within its 2,700 substeps (2,720). Alone at one worker, load 3.1, it failed the same way (2,703). The suite's timing round found it failing 3 of 3 alone on `21b6e602`, before this mend, and the record of November 19 measured that settle at 5,147 substeps; it is that settle's fault, not this round's |

**Proof that the case can fail.** Two breaks, each built, run and undone (`git status` clean of them after):

- **The page's mend undone** (actions holding focus standing still on the screen again): red 3 of 3 (06:15, load 17 from another builder's work), each at the check after Centre on (`force-graph-focus.spec.ts:147`), "the name is shown within 8 px of the room's centre", received Infinity: the name hidden. The before picture above is the first of these.
- **The framing made to forget the controls along the bottom** (`frameCameraSpheres` centring in the whole frame's height): red 2 of 2 (06:28, load 12.7), each at the first check, the focused URL (`:134`), received 32 px: half the controls' 64 px. So the case measures an off-centre camera, and not only a hidden name.

## The mend made simpler

_Taken on November 20, 2026, 06:35 to 07:10 UTC, by the same builder, at the root's review of the run-down; through the lane, on the container's own browser (Playwright's headless shell 1208 in its usual folder, Mesa's EGL installed by the root at about 05:57), whose first line named D3D12 (RTX 3090) in every hold._

The root asked that actions holding keyboard focus simply go with their sphere: keyboard focus is no place on the screen, so a settling sphere cannot pull a control away from it, and no reason was recorded for the rule of 2026-10-20 having named the keyboard beside the pointer. Keeping instead the place in the picture where the sphere had stood left the actions behind whenever the camera did not hold that sphere, and the review's leftover was the same fault met from the other side. No reason against it was found in a case or the record, so it is built: `positionActionStrip` returns early only under the pointer or an open menu, and a control holding focus is not hidden from under it. The design system gains the rule (2.2, "A thing's actions go with what they act on, except under the pointer or an open menu").

- The focus case, ten times at one worker (06:52 to 06:55, load 0.8 to 2.3): **10 of 10**.
- The whole spec file at the gate's two workers (06:55 to 06:58, load 2.3 to 1.6): the fifteen cases it now holds **15 of 15**; the sixteenth, the trial below, failed as it did alone and is not kept.
- A case-level check was tried and left out: on the estate sample, `PaymentResultModel.cs`'s Pin pressed with the mouse, the pointer moved off, the grown picture let rest, then the actions' middle against the sphere's. In 5 of 5 runs alone and 1 at two workers the sphere had moved **0.0 px** on the screen after its own pin, so the check could not fail whatever the actions did; a journey where a focused strip's sphere moves on its own is not cheap to find steady.
- With the mend undone the page is the code before this round: the red of the run-down above (3 of 3 at the check after Centre on, the name hidden) is that proof, and was not run again.
