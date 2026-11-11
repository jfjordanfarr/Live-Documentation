# History inside the bubbles

Status: implementation evidence, 2026-11-11, captured by a builder for the root's review and then the owner's eye. Not yet committed. Origin: the owner's question in [Turn 6 of the November 10 record](../../../ChatHistory/2026/11/2026-11-10.1.record.md#turn-6), "Is it possible to still get the illumination of the changed node even if it's buried deep in the bubbles? (Without nuking performance?)", under the standing ask of October 31, "it should be obvious what is actually changing as a commit is walked by during history playback".

## What changed

At a step of the history, with Tuning's Changed Files not None, what a wrapper's skin shows within it carries the step, in both layouts, by one rule: a change is shown at the innermost thing the picture draws for it.

- A changed file drawn as a dot inside a skin is coloured as a changed sphere is, by the same function (`emphasizedSphere`): white and whole under Glow, its kind's colour under Dim.
- A changed file not drawn, inside a veiled bubble or a veiled body, lights that bubble. A file the step deleted, which has no dot, lights the innermost drawn bubble of the directory it stood in, or the skin itself where no bubble inside holds that directory.
- An open bubble or a skin whose changes are lit dots is not lit: the dots say where.
- Under Dim, unchanged dots fall to a fifth of their alpha as unchanged spheres do, and a bubble or a skin holding no change of the step dims with them; one holding a change keeps its alpha. Nothing is enlarged.
- A lit bubble or skin is drawn white, as a changed sphere is, with a bright edge about two and a half pixels wide on screen whatever its size; face-on it stays as faint as it was, so an open bubble's dots read through it. (Second round, after the root refused the first edge: see below.)

Since the second round the 2D/3D transition's frozen bodies carry the light, and the suite holds a history sample that veils (`samples/history-veil`) with two browser cases over it.

A step only recolours: each body's coloured units are kept with what of the step they were coloured for, and a body is coloured again only when that changes. No body is packed again and no hull or list of units is rebuilt.

## How it was captured

A temporary Playwright probe (removed after use), headless Chromium with its software renderer, against the suite's static server on port 8766 serving `dist/explorer`, built from this checkout at `9bdbf7cd` for "before" and with the change for "after". This repository's own bundle, the 3D Structure layout, nothing pinned, Group Wrappers at their default Skin, the tuning's Changed Files set as named, the pointer parked over the sidebar. Viewport 1440×960. The stills were taken at device scale 2: the whole picture saved at CSS scale (1440×960), and a second picture clipped to the skins' projected box at device scale (2×), so that single dots can be judged.

## The pictures

This repository, steps 695 (`e99d592d`, "Repair Explorer history, discovery and directory framing") and 697 (`c91c019d`, "Make 3D exploration reversible and preserve view orientation"):

- `before-step{695,697}-{glow,dim,both}.png` and `…-bubbles@2x.png`: the build before the change. No dot inside any skin is lit or dimmed in any mode (0 white dots of 902 and 903; every dot at alpha 0.75).
- `after-step{695,697}-{glow,dim,both}.png` and `…-bubbles@2x.png`: the same pictures after. Under Glow and Both 70 of 902 dots are white at step 695 and 51 of 903 at step 697, most of them in `packages`, a few in `tests` and `scripts`; under Dim and Both the other dots are at alpha 0.15. Neither step deletes a file under a skin and the repository has fewer than 1,024 files, so no bubble or skin is lit in these pictures.

The scripted history sample (`dist/explorer/samples/history`), Structure layout, nothing pinned:

- `after-sample-step3-glow*`: "Rewrite the big helper as a huge one". `lib/big.ts` was deleted and `lib/huge.ts` born in its place: `lib`'s skin is lit (its own directory holds no inner bubble) and huge.ts's dot is white. In `src` one dot of `src/app`, a file the step changed, is white, and neither balloon nor the skin is lit.
- `after-sample-step4-{glow,dim}*`: "Retire the legacy helper". main.ts's dot white under Glow; under Dim main.ts whole, util.ts and the other dots at 0.15, the `src/engine` balloon at 0.2 and `src/app` whole.

The veiling sample (`dist/explorer/samples/history-veil`, `VEIL_SCRIPT` in `tests/integration/live-docs/scripted-repository.ts`, built by `npm run live-docs:visualize:history-sample` since the second round): a `big` tree of 1,050 files (21 directories of 5 of 10 files), a `wide` tree of 10 and the entry, over four commits. The Glow pictures are from it, with the final edge.

- `after-veil-step1-glow*`: "Touch a corner of the big tree". With `wide` present the picture's files pass 1,024, so `big` is veiled whole, one milky bubble. A changed file in it lights that bubble white with a thin bright edge. `after-veil-step1-glow-refused-wide-edge*` is the first round's picture of the same moment (from the temporary sample below), the edge a share of the radius: a glaring halo tens of pixels thick, refused by the root.
- `after-veil-step2-glow*`: "Retire the small tree and touch a veiled corner". `big` is open and `big/d20/e2` to `e4` are veiled within it; the changed `big/d20/e3/f04.ts` lights the veiled `big/d20/e3`, the white disc with a crisp rim near the middle, and neither of its veiled siblings.
- `after-veil-step3-glow*`: "Delete a file in the veiled corner". `big/d20/e2` is open at this step, one file fewer; the deleted `big/d20/e2/f05.ts` lights it, the thin white ring at the upper left, its dots readable inside.

The Dim pictures of veils are from the first round's temporary sample, built into `dist/explorer/samples/probe-veil` and removed after: a `big` tree of 1,100 files (22 directories), a `wide` tree of 300 and two small files, with `big/d21/...` where the permanent sample has `big/d20/...`. Nothing is lit under Dim, so the edge does not change them.

- `after-veil-step1-dim*`: `big` veiled whole keeps its alpha, holding the change, while `wide` and `small` dim.
- `after-veil-step2-dim*`: the veiled `big/d21/e3`, holding the change, keeps its alpha; the other seven veiled bubbles dim.
- `after-veil-step3-dim*`: nothing of the step is drawn as a dot; every dot is at 0.15 and the bubbles holding nothing dim.

`after-playback-686-696-glow.webm`: ten steps of playback at 2 steps a second over this repository's root picture under Glow, recorded by Playwright at 1440×960.

`measurements.json`: every measurement below, and each picture's counts read from the uploaded buffers.

## The numbers

Playback of this repository's root Structure picture with nothing pinned, under Glow, 20 steps at 2 steps a second from step 676 to 696, paused in the page the moment the twentieth step lands; frames are the renderer's actual draws (`window.renderedFrames`). Then ten keyboard steps back, each the synchronous cost of its task from the window's capture of the key to its bubble. "Recolouring" is the page's own measure of the new pass, `live-docs:history-units`.

| Run | Build | Frames in the 20 steps | Wall | Frames/s | Keyboard step, median / max | Recolouring per step |
| --- | --- | --- | --- | --- | --- | --- |
| 1, sequential | before | 57 | 10.17 s | 5.60 | 95.6 / 202.0 ms | none |
| 2, sequential | before | 54 | 10.16 s | 5.32 | 91.8 / 175.1 ms | none |
| 3, sequential | first shading | 51 | 10.12 s | 5.04 | 97.0 / 206.9 ms | 0.92 ms mean, 1.4 max |
| 4, sequential | first shading | 50 | 10.07 s | 4.97 | 104.8 / 194.7 ms | 0.98 ms mean, 1.4 max |
| 5, sequential | final | 53 | 10.21 s | 5.19 | 98.8 / 203.2 ms | 0.94 ms mean, 1.4 max |
| 6, sequential | final | 53 | 10.30 s | 5.15 | 96.3 / 187.3 ms | 0.95 ms mean, 1.5 max |
| 7, interleaved | final | 52 | 10.20 s | 5.10 | 94.2 / 185.5 ms | 0.96 ms mean, 1.7 max |
| 8, interleaved | before | 54 | 10.31 s | 5.24 | 96.7 / 181.6 ms | none |
| 9, interleaved | final | 52 | 10.15 s | 5.13 | 95.0 / 185.1 ms | 1.00 ms mean, 2.7 max |
| 10, interleaved | before | 54 | 10.24 s | 5.27 | 89.3 / 173.6 ms | none |

- **The recolouring itself** costs about 1 ms a step (20 ms over the 20 steps, at most 2.7 ms for one), for five bodies holding about 1,100 units, against a step whose synchronous work is about 90 to 100 ms. It shows in no keyboard step: the medians overlap (before 89 to 97 ms, final 94 to 99 ms).
- **Frames drawn** fell by about two in ten seconds: before 57, 54, 54 and 54 (mean 54.75), final 53, 53, 52 and 52 (mean 52.5), about 4 %. The recolouring's 20 ms cannot account for 2 frames of about 190 ms each; the cost is per frame, most likely the wrapper shader's extra varying and branch over the large, overdrawn transparent balloons in the software renderer: the first shading, with no branch, drew 51 and 50.
- No step packed a body, rebuilt a hull or rebuilt a list of units for the emphasis: `live-docs:body-packing` and `live-docs:wrapper-hulls` count the same before and after (17 or 18 packings, 9 hull frames over the run), since they come from the steps that change what the picture holds (files born, symbol counts changed).
- A variant carrying the light in the veil's varying, to remove the extra varying, was built and measured from 05:20 UTC, but the machine was by then loaded from outside this container: both builds fell to 32 to 42 frames and a step's 500 ms stretched to 950 ms. Those runs are kept in `measurements.json` as discarded; the variant was not kept.

**Second round (06:46 to 07:05 UTC), the final edge against `9bdbf7cd`, interleaved, four pairs.** The root had read the load average at about 2; before each run it read 8 to 15 for the 1-minute figure, which includes the run before it, since the software renderer keeps about ten cores busy. Frames are lower than in the first round for both builds, so the machine was not as quiet as in the first round's interleaved pairs.

| Pair | Final frames (wall) | Before frames (wall) | Load before final / before |
| --- | --- | --- | --- |
| 1 | 46 (10.26 s) | 47 (10.27 s) | 13.7 / 14.8 |
| 2 | 47 (10.22 s) | 48 (10.41 s) | 10.8 / 8.6 |
| 3 | 47 (10.30 s) | 48 (10.31 s) | 9.1 / 8.9 |
| 4 | 46 (10.30 s) | 48 (10.32 s) | 8.0 / 9.6 |

The final shading drew 46.5 frames on average against 47.75 before, about one frame and a quarter fewer in ten seconds (2.6 %), every pair in the same direction. The recolouring stayed at about 1 ms a step (19 to 22 ms over 20 steps, at most 3.8 ms for one). The variant carrying the light in the veil's varying was not tried again in this round, for time.

## What reads well and what does not

**Reads well**

- Under Both, at this repository's overview, the changed files are the white points in a field dimmed to 0.15: at step 695 the cluster in `packages` (the history files under `explorer/src/client`) and a few at the top of `tests` are found at a glance, even at 1×.
- Under Dim alone the changed dots keep their kind's colour at full alpha among dots at 0.15; at 1× they are the only bright blue points left.
- A lit veiled bubble (veil sample, step 2) is a white disc with a bright rim among pale blue veils, unmistakable at 2× and visible at 1×. A lit open bubble (step 3) is a white ring whose dots still read inside it.
- In the scripted sample a deletion lights `lib`'s outline white while the born file's dot is white within it, and `src`'s balloons stay unlit around their white dot, as the rule says.

**Does not read well, or is open**

- Under Glow alone at 1×, 70 white dots among 902 are specks of 2 to 4 px: they read as a paler patch in `packages`, not as dots one can count, and single dots are found only at 2× or on zooming in. The camera frames the bubbles at about 290 by 430 px because the step panel takes the left third of the picture; that limits finding them more than the colouring does. Lit dots, like lit spheres, are Lambert-shaded, so their lit side is light grey rather than white.
- A veiled body lit whole (veil sample, step 1) was loud in the first round: a bright white halo tens of pixels thick around a body of 1,100 files for one changed file. The root refused it; the second round's edge is about two and a half pixels whatever the size. The body is still a large pale grey disc, since its veil, already milky, turns white, and the veil's sphere still shows past the hull's facets as it does unlit. For the owner's eye.
- The first shading tried, a white tint alone, was rejected by eye: a lit open bubble could not be told from an unlit one, and a lit veil was only a little paler than the others. The veil and scripted-sample Glow pictures were taken again with the final shading; this repository's pictures and every Dim picture were taken with the first, which draws them identically, since nothing in them is lit.
- A hub that the Structure layout draws as its one file (`lib` at "Retire the legacy helper", where lib/legacy.ts was deleted) shows no deletion: lighting the file that remains would say that it changed. This lies outside the bubbles and predates the change.
- Since the second round the 2D/3D transition's frozen bodies carry the light too: a lit bubble or skin folds white.
- A small lit open bubble (veil sample, step 3) is now a thin white ring, about one and a quarter CSS pixels in a picture taken at device scale 2: found, but less prominent than the first round's wider rim.
