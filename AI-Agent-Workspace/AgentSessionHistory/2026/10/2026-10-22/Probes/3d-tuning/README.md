# The 3D Local Map's levers, tuned by eye

_A probe of October 22, 2026, by a delegated Claude Code agent (Fable 5.1) in its own worktree at `c7ddb540`, for the root agent to take to the owner, whose eye decides. The owner's ask ([Turn 2 of the day's record](../../../ChatHistory/2026/10/2026-10-22.1.record.md#turn-2)): "tweak the tuning knobs in 3D until the structure behaves nicely", delegated to a vision-capable model because "we've led ourselves astray a bit chasing metrics whose resulting aesthetics weren't terribly aligned with what we set out to measure anyway". Nothing in the product was changed; the pictures beside this file are the evidence and the tables are what the page itself reported while they were taken. The disposable harness, every attempt's picture and its measures live under `AI-Agent-Workspace/tmp/3d-tuning/`, which git ignores._

## Brief

Find default values for the 3D Local Map's twelve levers under which the connections layout of this repository and of the estate sample reads well: subsystems as visible clusters, wires legible, nothing erupting or drifting, a person keeping their bearings through a change, and a picture pleasant to look at. Judge by looking; let a measurement inform, and say where the two disagree. Give an opinion on whether the first picture should frame itself, since about a quarter of this repository's spheres start off screen under the library's camera.

## How the pictures were taken

Both bundles were built from the worktree (`npm run live-docs:visualize`, 866 files, no history; `npm run live-docs:visualize:estate`, 36 files) and served with `http-server`. A Playwright script opened each scene in headless Chromium at 1400 × 900 (the canvas is 1140 × 850 beside the sidebar) under a share link that carries the levers and the filters, waited for `#graph-svg[aria-busy="false"]`, read every rendered sphere's world position and screen position through Three's development-tool hook (the method of `tests/e2e/force-graph-observation.ts`), took the picture, then made a change (a filter toggled, a slider moved, a file pinned by its action strip, a sphere dragged, the layout switched) and took frames while the picture eased, counted in frames drawn, which are the engine's ticks. "On screen" is the share of spheres inside the canvas; "loose" counts spheres whose nearest neighbour is more than 300 units away; "moved" is over the spheres present before and after a change. The library's first camera stands at 170 × ∛N units from the origin: 1,620 for this repository, 561 for the estate. The ticks to still are this machine's software renderer at one tick a frame; the seconds beside them are not a person's.

The history could not be stepped: the bundle carries none, and computing this repository's history is a longer job than the probe. A step feeds the picture through the same update path as a filter toggle (a membership change, held from where the spheres stand), so the toggles stand for it mechanically, with the caveat that a step with many births would move more than a toggle of the tests.

## What the shipped defaults look like

`linkGap 60, charge 60, collisionGap 5, coupling 1, nodeSize 4, symbolScale 1, gravity 0.01, chargeRange 0, linkStrength 0.25, updateEnergy 1, tether 0.01, citedByPull 1`.

- [The first picture of this repository](defaults-first-picture.png): 865 spheres, still at 495 ticks, 3,754 units across each axis (a diagonal of 6,616), 39 percent of the spheres on screen, 23 of them loose. The camera stands inside the picture's box, so the eye is in a haze of wires crossing the whole canvas; the groups that read are the rim constellations at the edges, and the core is a blur behind them. [At 1100 × 700](defaults-first-picture-1100x700.png) the share on screen is the same 38 percent.
- [Zoomed out by the wheel until 97 percent is on screen](defaults-zoomed-out-1100x700.png): the whole galaxy, but the spheres are one or two pixels and the wires a mist. Framing alone does not rescue this picture; its spread is the problem.
- A toggle of Show Tests at these defaults (237 spheres out, then in): still in 141 and 283 ticks, the spheres that stayed moving a mean of 206 and 150 units, at most 445 and 363. The motion is a smooth contraction and expansion of the whole; nothing erupts. The moves are large because the picture is large.
- [The estate](defaults-estate-first-picture.png): 36 spheres, still at 210 ticks, a diagonal of 1,057, 94 percent on screen but the rim spheres cut by the canvas edges: the picture is a little bigger than the camera's window even at this size.
- [The structure layout](defaults-structure-first-picture.png): 1,153 spheres, 32 percent on screen; the camera sits among the amber hubs and the tree cannot be seen as a tree.
- Both kinds of document on, pull one: 944 spheres, still at 841 ticks, 51 percent on screen; the long easing is the documents with their many springs settling among a wide picture.

This is the first picture the motion of 2026-10-21 makes of the gravity the owner chose on 2026-10-17 under the old motion, whose rest was 1.8 times smaller ([the decision](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-3d-picture-eases-until-still-one-motion-through-a-conservative-field-tethered-to-where-it-stood-recorded-2026-10-21)). The owner's reference for a picture they liked is [the connections picture of October 18](../../../Screenshots/2026-10-18/update-energy/connections-before-toggle.png): the whole galaxy in the frame, a dense core with knots and satellite constellations around it.

## The first picture, one or two levers at a time

This repository, the connections layout, default filters, the library's camera; still means the page said so.

| Setting | Ticks to still | Extent per axis | On screen | Loose | What the eye sees |
| --- | ---: | ---: | ---: | ---: | --- |
| shipped | 495 | 3,754 | 39% | 23 | a haze from inside |
| gravity 0.03 | 526 | 2,156 | 72% | 0 | [a wide field, cut by the frame, the groups beginning to read](gravity-0.03-first-picture.png) |
| gravity 0.04 | 591 | 1,866 | 83% | 0 | fills the frame edge to edge, the knots visible, the rim cut |
| gravity 0.05 | 615 | 1,669 | 92% | 0 | [nearly whole: a dense core, two knots, satellite constellations with air between them](gravity-0.05-first-picture.png) |
| gravity 0.06 | 701 | 1,508 | 97% | 0 | whole with a margin, a touch tighter |
| gravity 0.1 | 804 | 1,155 | 100% | 0 | [a dense ball; the knots merge, less air](gravity-0.1-first-picture.png) |
| spring 0.5 | 464 | 3,688 to 4,023 | 39% | 17 | the size unchanged |
| spring 1 | 411 | 3,819 to 3,915 | 41% | 31 | hubs become stars with their leaves pulled tight; more spheres stand alone |
| spring 2 | 273 | 3,909 to 3,997 | 53% | 36 | starrier, still sooner |
| charge 30 | 406 | 2,712 | 55% | 7 | the knots a little denser; the camera still inside |
| charge 120 | 452 | 5,314 | 22% | 57 | an empty sky |
| reach 400 | never (240 s in the page; 20,000 ticks headless) | about 1,400 | | | the spheres never come to rest |
| reach 600 | 681 | 1,725 | 93% | 0 | like gravity 0.05 |
| reach 800 | 544 | 1,946 | 83% | 0 | like gravity 0.04 |
| gravity 0.02, reach 800 | 660 | 1,653 | 94% | 0 | like gravity 0.05 |
| gravity 0.03, spring 1 | 368 | 2,097 to 2,267 | 75% | 0 | groups distinct with voids between; does not fit |
| gravity 0.05, spring 1 | 359 | 1,621 to 1,764 | 95% | 0 | [the crispest grouping of the sweep: compact constellations with air, a core with two knots](gravity-0.05-spring-1-first-picture.png) |
| gravity 0.06, spring 1 | 483 | 1,478 to 1,593 | 98% | 0 | the same, tighter |
| gravity 0.05, spring 0.5 | 570 | 1,635 to 1,698 | 93% | 0 | between the two above |
| gravity 0.025, charge 30 | 457 | 1,693 | 92% | 0 | like gravity 0.05 with slightly denser knots |
| gravity 0.03, charge 30, spring 1 | 321 | 1,513 to 1,586 | 98% | 0 | like gravity 0.05, spring 1 |
| gravity 0.04, charge 40 | 657 | 1,516 | 96% | 0 | like gravity 0.06 |
| gravity 0.05, base radius 6 | 592 | 1,643 | 93% | 0 | the spheres read as objects and the hubs stand out; the core is more occluded |
| gravity 0.05, spring 1, base radius 6 | 425 | 1,538 to 1,703 | 96% | 1 | [the stars prominent, the picture still airy](gravity-0.05-spring-1-base-radius-6-first-picture.png) |

What the sweep says, in plain words. The size of the picture is set by gravity against the repulsion, about the square root of the charge over the gravity; the spring strength does not change the size but changes the texture, and the repulsion's reach, when bounded, does what gravity does with nothing gravity does not, while at 400 the picture never comes still. Gravity between 0.04 and 0.06 is where this repository's galaxy fits the library's camera and the groups read; 0.05 is the middle of that. A stronger spring makes the groups crisper and the picture still sooner, and would answer the owner's wish of 2026-10-17 for "more pull between connected neighbours"; it is ruled out below by the structure layout. A larger base radius is a matter of taste: the hubs stand out and the core hides more.

Where the measurement and the eye disagree: the layout lab's drift measure (two cycles of the tests toggled, headless) prefers more gravity at every step, 0.06 over 0.03 over 0.01, since the unchanged spheres move 27, 50 and 93 units a restore, and it is indifferent to the spring. The eye stops at 0.05 because 0.1 is a ball whose knots have merged, and would take spring 1 for the look. The ticks to still prefer spring 1 and charge 30 (321 to 359 ticks against 615), which the eye does not weigh much: at a real renderer's rate the difference is a few seconds of a smooth easing.

## Journeys at gravity 0.05, everything else as shipped

- A toggle of Show Tests, 237 spheres out: [frame 16](gravity-0.05-tests-off-frame-16.png), [frame 46](gravity-0.05-tests-off-frame-46.png), [still at 297](gravity-0.05-tests-off-still.png). The picture contracts as one body toward its centre; every constellation keeps its place and its neighbours, most of the move is done by frame 46 and the rest is a slow settle; the spheres that stayed moved a mean of 117 units, at most 235. Back in: still at 220, a mean of 103, the born tests landing beside their files and the picture breathing out. Bearings are kept, by eye, throughout.
- [Show Related Docs](gravity-0.05-related-docs-on.png): 64 documents in violet land inside the mass among the files that cite them, their lines faint; still at 351 ticks, the files moving a mean of 111 units. [Show Citing Docs beside it, pull one](gravity-0.05-citing-docs-on-pull-1.png): the fifteen further documents and their 323 citations arrive as light violet fans from a few spheres inside the mass; still at 236, a mean of 64. The code's groups still read under the fans.
- [Citing Pull at zero](gravity-0.05-citing-docs-on-pull-0.png): a change of the forces, which unfolds the picture afresh at full strength: still at 349 ticks, a mean move of 92 and one document travelling 677 units to the rim, where its fan now crosses the whole picture to the files it cites (the decisions log, probably). Pull back to one: 727 ticks, a mean of 147, at most 1,144. A lever is the costly change, a filter the cheap one; that is the design of 2026-10-21 and holds at every setting. By eye, pull one answers "where does this document live" (among its files) and pull zero answers "what does this document cite" (a fan that can be followed); one is the better default for a picture of the code, and the owner asked to see it before asserting either, which these two pictures are.
- [graph.ts pinned by its action strip](gravity-0.05-pinned-graph-ts.png): the picture fades to the pinned neighbourhood and nothing moves (a pin changes attention, not membership). A sphere dragged a sixth of the canvas and let go: still 391 ticks later, the others moving a mean of 37 units, at most 177; the drag is hard to read under the pin's fade, which is the design and not a tuning matter.
- [graph.ts as the subject](gravity-0.05-subject-graph-ts.png) and [the tests toggled off under it](gravity-0.05-subject-graph-ts-tests-off.png): the camera at the file, its wires lit as thick tubes; after the toggle the file is where it was under its label and its neighbours have shifted a little. The bearings of a close view hold through a change.
- [The structure layout](gravity-0.05-structure-first-picture.png): 1,153 spheres, still at 410 ticks, 89 percent on screen: a tree-ball with the big amber hubs reading as hubs and their leaves in fans, where the shipped gravity had the camera inside the tree. The tests toggled off: still at 289, a mean move of 106. [Switched to connections, frame 45](gravity-0.05-structure-to-connections-frame-45.png) and [still at 407](gravity-0.05-structure-to-connections-still.png): the switch rearranges the whole (a mean move of 449, at most 1,309), as a new layout unfolding freely does by design, and the result fits the frame.
- [The estate](gravity-0.05-estate-first-picture.png): 36 spheres, still at 247 ticks, whole in the frame with every wire readable but small, a ring in the middle of the canvas; [its structure layout](gravity-0.05-estate-structure.png) forms in place (still at 326, a mean move of 73) and the way back takes 338. At the shipped gravity the estate ran past the canvas edges; here it is whole and would take a closer camera, which is the framing question below.

**The tether and the energy, at gravity 0.05.** With the tether at 0.03 the first picture is the same picture (1,670 across against 1,669) and still at 506 ticks against 615; the tests toggled off and on twice: still in 133, 139, 132 and 139 ticks against 297 and 220, the unchanged spheres moving a mean of 95, 70, 77 and 74 units against 117 and 103, the greatest move 183 and 151 against 235 and 211, and after the two cycles the picture is the first picture to the eye, every group in its place (the extent 1,670, 1,618, 1,610). The motion is the same breathing cut short: the spheres go where the change asks and stop. The drift measure says the same (a restore moves the unchanged spheres 31 units at 0.03 against 50 at 0.01 on this repository's connections layout at gravity 0.03, and settles in 125 to 133 ticks against 238 to 381). The cost the decision of 2026-10-21 names, that the tether's rest is not the forces' own, did not show in two cycles; it would show as a picture that drifts a little with every change, which the lab's cycles can watch for. With the update energy at 0.5 the toggle is the same journey slower: still in 421 and 359 ticks against 297 and 220, to the same rest within a unit (a mean move of 117 and 102 either way); [frame 46 at energy 0.5](gravity-0.05-energy-0.5-tests-off-frame-46.png) shows the tests gone and the others not yet drawn in, where [frame 46 at energy 1](gravity-0.05-tests-off-frame-46.png) is most of the way. The motion at 1 is smooth with no jolt to cure, so there is nothing for a lower energy to buy.

## A defect found: spring 1 destroys the structure layout

At spring strength 1, half the slider's range, the structure layout of this repository blew up on its first picture: every position became NaN, the page showed [a blank canvas](structure-spring-1-blank.png) with no message, and every later change was "still" in 11 ticks. The same happens headlessly, at the shipped gravity as at 0.05 (`npm run layout:lab -- spatial repository/five --assets false --layout structure --config '{"forceGraph":{"linkStrength":1}}'` reports bounds of NaN and calls the picture still in 456 ticks), and in both journeys that carried spring 1. At spring 0.5 and at the shipped 0.25 the layout is well. The cause is the stability bound of the explicit step on a hub with many springs: in the structure layout every file has one containment link, so the degree rule gives every hub-to-leaf spring the full strength, and a hub with n leaves feels n such springs; the largest hub here, `packages/engine/src/live-docs/adapters`, has 61. It blows up at 61 × 1 and holds at 61 × 0.5, so the bound lies between those; at the shipped 0.25 a directory of roughly 120 to 240 files would reach it, and such directories exist in real repositories. This is the mechanism the decision of 2026-10-21 met once with dashpots ("a hub of fifty springs blew the explicit step up"), now reachable from a slider and latent at the default. The connections layout did not blow up at spring 1 or 2 here, since few of its degree-one leaves share one hub. A fix belongs in the physics, bounding what a hub can feel or sub-stepping, not in the slider's range; the lab should also refuse to call a NaN picture still.

## Recommended defaults

```json
{ "gravity": 0.05, "tether": 0.03 }
```

Every other lever as shipped. The reasons, in order of weight:

- **Gravity 0.05.** This repository's galaxy fits the library's camera with the core, the knots and the satellite constellations all legible, which is the look of the October 18 picture the owner liked; a toggle moves the unchanged spheres a mean of about 115 units and settles in 220 to 300 ticks, against 150 to 206 and 141 to 283 at 0.01, the motion itself the same smooth breathing; the structure layout fits where it did not; the estate is whole. The owner found 0.05 too tight on 2026-10-17, under the old motion whose rest was 1.8 times smaller than this one's, so 0.05 today is near the spread of the 0.01 they chose then: this is the same picture at the new physics, not a return to the one they rejected. If they want more air, 0.04 fills the frame edge to edge with the rim cut; 0.06 is the same picture a touch tighter; the eye will not tell 0.045 from 0.055.
- **Spring strength 0.25, unchanged.** Spring 1 gives the crispest grouping and the fastest settle and would be the recommendation by eye for the connections layout alone, and it blanks the structure layout. 0.5 is safe on this repository with half the margin and buys half the look; not worth a default that another repository's directory can break. Once the physics bounds a hub's stiffness, 1 is worth looking at again.
- **Charge 60, link gap 60, clearance 5, unchanged.** Charge 30 at gravity 0.025 looks the same as charge 60 at 0.05; these three are the Compact and Relaxed presets' numbers and changing one of them would change what Relaxed means. Gravity is the lever that is not a preset's.
- **Repulsion reach 0, unchanged.** Bounded at 600 or 800 it makes the picture gravity makes, more slowly; at 400 the picture never comes still. A lever one of whose middle settings hangs the engine is worth a look of its own.
- **Coupling 1, base radius 4, symbol scaling 1, unchanged.** Base radius 6 is a legitimate taste (hubs prominent, core more hidden); the October 18 picture was at 4.
- **Citing Pull 1, unchanged**, the owner's own "see it before asserting it", with the two pictures above for the assertion.
- **Tether 0.03.** A change moves the unchanged spheres a fifth less and is still in half the ticks, and the picture after two cycles is the first picture to the eye; the still pictures at 0.01 and 0.03 cannot be told apart, so the difference is only the length of the motion, which the owner may prefer either way. 0.01 was their choice of the day before, made to be tuned by eye; this is that tuning's reading.
- **Update energy 1, unchanged.** The same journey slower to the same rest; the motion at 1 has nothing a lower energy would cure.

## The first picture's framing

Yes, it should frame itself once. The library's camera stands at 170 × ∛N, which grows with the cube root of the file count, while the picture's extent grows faster, about with the square root of the count times the charge over the gravity; no one gravity fits every bundle to that camera. At the shipped gravity this repository's camera is inside the picture ([39 percent on screen](defaults-first-picture.png)) and the estate's is a little too close ([the rim cut](defaults-estate-first-picture.png)); at 0.05 this repository fits and [the estate is small](gravity-0.05-estate-first-picture.png); a repository three times this size would outgrow the camera again. Gravity should be chosen for legibility, the spacing of a group against its neighbours, and the camera for fit, as `frameCameraSpheres` already fits a directory. When: once, at the moment the unfolding picture calms and the tether takes hold (the page's own event, `UNFOLDED_FRACTION`, some 140 ticks before stillness and at nearly the final size), moved over half a second as the directory framing is, and not tracked continuously through the unfold, which would show the picture shrinking while it grows, nor on every later change, which would take the bearings a change is meant to keep. A subject or a pin carried by the address keeps its own camera. The pictures that argue for it are the wheel zoom-out at the shipped gravity, where framing shows [dust](defaults-zoomed-out-1100x700.png), and the estate at 0.05, where a frame would make a small whole picture a readable one.

## What the Explorer made hard to see

- The spring slider's blank canvas gave no sign that the picture was gone: the page said still, the tray and the controls stood as usual. A picture whose positions are not numbers should say so.
- The layout lab's `spatial` verb reports a NaN picture as still with zero overlaps; its stillness test passes when the move is not a number.
- The pin's fade left the dragged sphere's journey hard to judge; a drag with a pin active is a picture of two attentions.
- Nothing else got in the way: the page's `aria-busy` says when it is still, the share link carries every lever, and the action strip pins a hovered sphere by a click, so every journey could be driven and read from the rendered scene.

## Not done, and uncertain

- No step of the history was taken (no history in the bundle).
- The frames were counted on a software renderer; a GPU's cadence shows the same ticks faster and the feel is the owner's to judge in their browser. The share link `?s=` of each scene is in the harness's `measures.json` beside its pictures under `AI-Agent-Workspace/tmp/3d-tuning/out/`.
- The structure layout's stability bound is placed between 61 × 0.5 and 61 × 1 from two observations; the exact bound was not measured.
- The 2D Local Map was not looked at; nothing here changes it.
