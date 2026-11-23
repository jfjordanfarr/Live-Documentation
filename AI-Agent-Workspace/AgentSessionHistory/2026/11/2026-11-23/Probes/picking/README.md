# A shell's skin takes the press from a sphere seen through it: what was measured

**Historical evidence, 2026-11-23, 01:27 to about 01:50 UTC.** Taken by a builder on a worktree of `f152fbb6e`, its bundles built there, one worker, each run a hold of the browser lane of its own, WebGL on the graphics card (ANGLE, D3D12, RTX 3090), load 1.9 to 5.9 with other builders' runs and builds beside. The probe was a spec of its own and is kept here as text ([`ray-probe.spec.ts.txt`](ray-probe.spec.ts.txt)); its outputs are [`run-six-plain.txt`](run-six-plain.txt) and [`run-slowed-sixfold.txt`](run-slowed-sixfold.txt). **Nothing in the product was changed**: the measurement supports the first hypothesis, which makes it a question of what a press takes, the root's to rule.

The case is `force-graph-focus.spec.ts`, "a focused URL centers its node, direct clicks pin it, and More opens its details": this repository's 3D map focused on `packages/engine/src/live-docs/graph.ts`, the camera turned until a press takes graph.ts somewhere on its disc, a click there (pinning it), and the pointer left at rest. Sometimes the actions then offered are the shell of `packages/explorer`'s.

## How the ray was read

At each reading, in the page, the ray from the camera through the pointer's place was met, independently of the page's picker, with every drawn sphere (each as the sphere its uploaded instance matrix says, analytically) and every triangle of the uploaded wrappers' mesh (Möller and Trumbore, both faces), giving each thing met and how far along the ray. Beside it the page's own picker (`spatialPick`, which is `nodeAt`), the camera's line of sight, the frames drawn, the motion's substeps, `aria-busy` and whose actions are offered.

**The reader and the picker agree.** Over a grid of points every 12 px across the canvas on six pictures at rest, the picker's answer is the reader's in 4,530 of 4,530, 4,530 of 4,530, 4,545 of 4,547, 4,503 of 4,503, 4,503 of 4,503 and 4,500 of 4,502 points (the four strays are at a sphere's edge, where the picker meets a tessellated sphere and the reader a true one). At the failing moment too.

## The failing moment

Not reproduced in six plain runs (load 4.7): in every one the ray at the pressed point met graph.ts alone, from the click to rest. Reproduced once in three with the page's processor slowed six times (`Emulation.setCPUThrottlingRate`; the other two did not reach the case's start, the focus label not shown in five seconds under the slowing). The numbers, in the picture's units along the ray:

| Reading | Camera's line of sight | graph.ts on the ray (enter to exit; the ray's distance from its centre, of its radius) | The shell of `packages/explorer` on the ray | Picker | Actions offered | Substeps, busy |
| --- | --- | --- | --- | --- | --- | --- |
| At the click | (-0.5068, 0.1689, 0.8453) | 670.0 to 690.0; 0.43 of 10.01 | not met | graph.ts | none | 319, busy |
| 6 frames on | (-0.5188, 0.1729, 0.8372) | 670.4 to 690.0; 1.85 of 10.01 | not met | graph.ts | graph.ts | 325, busy |
| The first wrong reading, 72 frames after the click | (-0.5313, 0.1771, 0.8285) | 669.1 to 687.8; 3.67 of 10.01; **its opacity 0.15** | **490.9 to 491.7**, a grazing chord at its edge | shell | shell | 391, busy |
| At rest | (-0.5313, 0.1771, 0.8285) | 669.2 to 687.9; 3.59 of 10.01; opacity 0.15 | 488.6 to 499.6 | shell | shell | 433, at rest |

What this says:

- **The rule is working as written (the first hypothesis).** At the wrong moment the shell's skin is really nearer along the pointer's ray than graph.ts, by some 178 units; graph.ts stands wholly behind it (it enters graph.ts at 669, it left the skin at 492).
- **graph.ts is not a cell of that shell.** It lies in `packages/engine`; the shell is `packages/explorer`'s. It is a free sphere, drawn as itself, standing behind the skin, and the pointer stays inside it throughout (0.4 to 3.7 units from its centre, of a radius of 10).
- **Not a stale picture.** The picker and the reader of what was uploaded agree; spheres and skins are written in the same upload from the same places (`update` in `forceGraphBatches.ts`), and the picker uses the camera of the moment for both.
- **What moved is chiefly the camera.** The case's turn of the camera is a drag; the trackball goes on turning after the release, its damping a share each frame, so a slow page carries the turn on for many frames. Here the line of sight turned another 1.8 degrees between the click and the first wrong reading. The camera turns about its target, near graph.ts, so graph.ts keeps its place on the screen under the pointer while the shell's edge sweeps in front of it. The picture was also still settling (319 to 391 substeps). This fits yesterday's readings: the centre 0 to 8.7 px from the pointer, the picture at 384 to 433 substeps and busy, more failures under more load.
- **It stays so at rest.** Once the camera and the picture stop, the shell still takes the point, now through a chord of 11 units of its skin.
- **And the pressed sphere fades.** Once the shell is rested on, attention is the shell's, and graph.ts, pinned a moment before and still under the pointer, is drawn at opacity 0.15 where it was 0.75.
- [The screenshot at the first wrong reading](wrong-pick.png): the shell of `packages/explorer` rimmed and its one action (Open) offered at its side; graph.ts's name stands just under the pointer; graph.ts itself, faded, sits at the skin's lower-left edge, where the skin is drawn densest.

**The same rule without any race, at the build's end:** at graph.ts's own centre, as the case starts (252 to 294 substeps, busy), in all eight runs that reached it (a first single run, whose output is not kept, the six plain and the slowed one) the ray enters the shell of `packages/explorer` at 259 to 365 and leaves it at 508 to 556, and meets graph.ts at 579 to 638; the picker gives the shell. A person sees graph.ts through the skin's faint face ([picture](build-end-graph-behind-shell.png)), and a press there takes the shell: the case's own `uncover`, turning the camera up to eight times until some point of graph.ts's disc takes graph.ts, exists for this (its comment of 2026-11-19 says so). In one run a wrapped group's skin (`tests/integration/fixtures/powershell-wires/expected/compiler-edges.json`, opacity 0.6) was met first, at 159 to 205.

## What each alternative changes on pictures at rest

The same grid, every 12 px over the canvas, the pictures held at rest (`aria-busy` false), counting the points where a rule's answer differs from today's. "Under a skin" counts the points where today's answer is a skin.

| Picture | Points on the canvas | On something | Under a skin today | A changes | What A gives instead (points) |
| --- | ---: | ---: | ---: | ---: | --- |
| This repository's 3D start, graph.ts (and the same pinned at one hop: the same picture) | 4,530 | 1,809 | 1,741 | **38** | all from the shell of `packages/explorer` to a sphere behind it: `document.ts` 5, `boardGraph.ts` 4, `sources-facts.ts` 3, `graph.ts` 2, and 21 points over 14 others |
| This repository, graph.ts pinned, two hops | 4,547 | 663 | 555 | **32** | from the wrapped group of `compiler-edges.json` to spheres behind it (`types.ts` 3, `palette.ts` 2, `still-picture.ts` 2, ...) and from the shell of `packages/explorer` to spheres behind it |
| The estate, `PaymentService/PaymentService.cs` (and pinned at one hop: the same picture) | 4,503 | 140 | 87 | **0** | |
| The estate, pinned, two hops | 4,502 | 62 | 2 | **0** | |

- **A, what is seen is what is pressed** (a sphere drawn as itself, not a cell of the skin, takes the pick wherever the ray meets it, behind a skin too): 2 per cent of the points on something in this repository's start, 5 per cent at two hops, none on the estate. A shell stays pressable wherever no free sphere stands behind it, which is nearly all of its face: the shell of `packages/explorer` keeps all but 38 of its points. The shells' own files are drawn as cells, not spheres, so a full shell keeps its whole face. As a pure rule it is one line: given the nearest sphere hit and the nearest skin hit, the sphere when there is one, else the skin.
  - A narrower form, **A under Skin alone**: under the two Cloud looks the skin is drawn as a mist that veils what is behind it, so what is seen there is the cloud; the sphere would take the pick only under Skin, the default. Not measured apart: every picture above was under Skin.
- **B, attention holds** (what a press took keeps the pointer's attention while the pointer has not moved and its ray still meets it): changes nothing on a picture at rest, by its definition. It would hold this case (the ray met graph.ts throughout). It leaves the build's end as it is: graph.ts seen through the shell and not pressable at its centre, the hidden door the case's `uncover` works around.
- **C, as now**: the measured fault stands; a person who has just pressed graph.ts and not moved is offered the shell's actions, and the pinned sphere fades under the pointer.

**What the measurement favours: A.** It is the only one that answers both the moving case and the still one, it moves 0 to 38 points of some 4,500 on the four pictures, and it is the one with a pure rule. B could be added to A for a sphere that drifts out from under a still pointer after a press, but nothing measured here needs it: through the failure the pointer stayed inside graph.ts.

## Not done

- No rule was changed and no browser case was written; the root rules on the fork first.
- The grid's counts are of points, not of things: a sphere that A makes pressable may have been pressable elsewhere on its disc before.
- The reproduction needs the processor slowed and came once in three; a made situation that does not wait for a race (a free sphere behind a shell on a picture at rest) is what the case for A would stand on: on this repository's start, at rest, 38 such points already exist; the estate's frozen pictures above have none at their default camera.
