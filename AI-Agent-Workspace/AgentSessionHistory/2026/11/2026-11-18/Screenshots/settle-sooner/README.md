# The 3D settle, sooner: a pacing that changes no path, and a shorter tail for the eye

_Historical evidence, taken 2026-11-19 by the builder of the round `settle-sooner`, from `main` at `c29e2a4a`. It follows [the running down of the discovery case's slow settle](../suite-reds/README.md), whose first section this round answers. "Main" is a build of `c29e2a4a` in a scratch copy; "paced" is this round's first commit. Frames are counted by the suite's own observer of drawn frames (`force-graph-observation.ts`); seconds are wall time beside the machine's one-minute load, on the graphics card, at 1280 × 800 (the discovery case) and 1440 × 900 or 960 (the estate's)._

## Step 1: a frame takes as many of a tick's substeps as fit, once the picture has entered

**What changed.** The page takes the 3D motion within 10 ms a frame, a tick in parts. A part was held to one evaluation of the field, so a frame drew one substep, and a stiff picture whose every tick takes several substeps took a frame for each. Now, once the whole picture has entered, a part reaches through as many of a tick's substeps as the budget holds (sized by the rate the last part measured), never past the tick's end; while the picture still enters, a piece a frame, and at the first call after a piece or a hand moved spheres, the part is what it was, one evaluation at most, by the same rule as before line for line. That first call is why a new piece is drawn first where it was placed: it reads the field and goes no further, as `force-graph-structure-cells.spec.ts:134` holds for a bubble's pop (a build that let that call reach through a tick moved a popped file 11.3 units in the pop's frame, past the case's 5). It is the second of the two pacings tried in [suite-reds](../suite-reds/README.md), made landable.

**Why no path can change.** A tick's numbers are the same however it is divided (`SpatialMotion.advance`, held by its unit tests since 2026-10-28). The only thing the page does at a frame that touches the motion on its own is the reveal's next piece; a hand, a wake, a step of history and a change of perspective happen when a person makes them. While the pieces enter, at a piece's first call and at a hand's, the pacing is as it was, so each piece meets the motion at the moment it always has; after the last piece, nothing meets it but the ticks. A part never passes a tick's end, so a frame still completes at most one tick and the tether's hold and the rest rule read every tick as before.

**The proof.** Every sphere's place at rest on three pictures, three runs each of main and of the paced build, compared by id; the paced build's three runs were taken before its first-call rule above, the number after the semicolon on the final build ([`step-1/runs-and-places.json`](step-1/runs-and-places.json) has the numbers and main's places):

| Picture | Spheres at rest | Spheres in the same place to the last digit, every run against every run | Frames to rest, main | Frames to rest, paced |
| --- | --- | --- | --- | --- |
| This repository, the largest group's seed clicked (the discovery case, `force-graph-discovery.spec.ts:70`) | 305 | 305 of 305 | 5,247, 5,248, 5,248 | 2,637, 2,637, 2,637; 2,638 |
| Its archipelago, before the click | 101 | 101 of 101 | 43 | 43; 43 |
| The estate, `PaymentService/PaymentService.cs` clicked on the archipelago (Skin, one hop) | 26 | 26 of 26 | 999, 999, 999 | 996, 996, 996; 997 |
| The estate's Whole in Structure with Skin (`force-graph-exploration.spec.ts:206`) | 54 | 54 of 54 | 240, 240, 240 | 236, 236, 236; 237 |
| Its first picture, `Portal` open, before Whole | 11 | 11 of 11 | 155 | 153; 154 |

The tolerance asked for was the rest rule's own, 3 × 10⁻⁵ of the picture's diagonal; none was needed: the largest difference of any coordinate on any picture is exactly zero, and the screenshots at rest are the same bytes (`cmp`), so one of each is kept: [`step-1/discovery-rest.png`](step-1/discovery-rest.png), [`step-1/estate-rest.png`](step-1/estate-rest.png), [`step-1/whole-rest.png`](step-1/whole-rest.png). The start is deterministic as the page makes it: the same link, the same viewport, the pointer moved off the picture at once after the click, and on these pictures an evaluation of the field fits the budget, so even main's pacing while entering depends on nothing timed. Main's 5,247 against 5,248 is the observer's count of the frame in which the busy flag fell, not the motion: the places are identical.

**Seconds**, wall time from the click to rest, with the load before, at the click and after:

| Picture | Main | Paced |
| --- | --- | --- |
| Discovery growth | 88.5 s (2.9/2.9/2.3), 88.5 s (1.8/1.8/2.0), 91.5 s (2.8/2.5/3.0) | 44.3 s (2.6/2.4/1.9), 46.3 s (2.1/2.1/2.4), 45.3 s (2.4/2.4/2.5) |
| Estate seed click | 21.0 s, 19.0 s, 22.1 s (load 1.4 to 3.2) | 20.0 s, 20.1 s, 20.0 s (load 1.9 to 2.6) |
| Estate Whole | 5.9 s, 4.9 s, 4.9 s | 4.9 s, 5.9 s, 4.9 s |

**What it does not do.** The discovery growth's path is main's, and main's path takes about 2,600 ticks to rest, so at a tick a frame it rests in 2,637 frames, under the case's bound of 2,700 by 62; in the lane, with the pointer left where the seed's name stood, the case passed in 2,638 frames and 46.1 s at a load of 2.5. The estate's pictures, whose ticks are mostly one substep already, gain a few frames. The tail itself is untouched; that is step 2.

**A hand.** A part is held to one evaluation at a call after a hand moved a sphere, as every part was, so a drag goes as it went; the pacing reaches further only between such calls.

**Frames now depend on the machine.** Before, a frame drew one substep whatever the machine, so a settle's frames were the picture's alone. Now a frame draws as many substeps as fit in its 10 ms, so a loaded machine draws fewer a frame and takes more frames: the discovery growth took 3,883 frames (215 s) at a load of 24 to 29 with a screenshot every 60 frames, against 2,638 at a load of 2.5, and still rested with all 305 spheres in main's places to the last digit. Under such a load the discovery case's bound of 2,700 frames can be crossed again by the machine, not the picture.

**The lane, on the final build of step 1**, each file alone through the browser lane: `force-graph-structure-cells` 3 passed, `force-graph-discovery` 3 passed (the grown group at rest in 2,638 frames, 46.1 s), `force-graph-exploration` 8 passed (`:206`, the case the first pacing broke, among them), `force-graph-building` 3, `force-graph-defaults` 7, `force-graph-focus` 15, `force-graph-shells` 9, `history-emphasis` 16. Loads 2.3 to 4.0.

## Step 2: why the tail is long, and a Settle Hold to try by eye

### How it was measured

A scratch build of main kept the motion's whole state at the first completed tick after the picture had wholly entered (positions, velocities, anchors, the field's radii, springs, softness and mass, the strength), and the ticks from there to rest. Replayed headlessly through the page's own `SpatialField` and `SpatialMotion`, each settle ends at the page's tick to the last digit: the discovery growth 2,606 ticks, the estate's seed click 998, and a third picture, this repository in Structure with Skin with `packages/explorer/src/client` open, then the `views` bubble clicked open (103 spheres), 479; every place at rest identical, difference 0. Every alternative below was first tried on those replays from the same state, then the one kept was built and measured in the page.

### What the tail is

On the discovery growth the picture **calms** (no sphere moves a thousandth of the diagonal in a tick, the calm at which a first picture's tether takes hold) 149 ticks after its last piece. The rule of rest fires 2,457 ticks later. In between, the picture's spread does not change (its radius of gyration 490 then 491 units, its centre the same) and the 101 spheres that were on screen before the click hardly move (median 14 units), but **the 204 new spheres rearrange**: a median of 205 units each, 203 of the 305 spheres more than 50 units, the farthest 710, on a picture 1,304 units wide.

They move as slow creeps broken by sudden snaps. `contained-sphere-reference.ts`, one wire, creeps inward 190 units over 800 ticks at 1 to 2 × 10⁻⁴ of the diagonal a tick (some 0.2 to 0.45 units, a few pixels a second at sixty frames), snaps outward 200 units in 100 ticks at 1.8 × 10⁻³ (it passes by another sphere), then creeps outward 160 units more over 1,500 ticks; `tuning-levers.ts` snaps near tick 1,700, `pointer-frames.ts` near 2,150. At each one's fastest, the forces along its path are large and nearly cancel: for `contained-sphere-reference.ts` repulsion 1.9 and the tether 1.1 pushing on, gravity 2.8 holding back, a net of 1.6; while it creeps, the tether pulls some 9 units of force toward where it was born, 444 units away at rest, against the mass's repulsion, and the net is under a hundredth of that. The curvature along its path, the others held, is positive (0.05 to 0.2, against the tether's own 0.02): no single sphere sits on a ridge; it is the group as a whole that is soft. Every glider named in [suite-reds](../suite-reds/README.md) is a newcomer, held by its tether to the place it was born, a seeded direction beside its first neighbour, a place no person saw.

What the tail is not: after today's rest, run on, the replay never comes truly still; two spheres (`reader-links.ts`, `word-seams.ts`) trade a cycle of 2.5 × 10⁻⁵ of the diagonal a tick for 60,000 ticks, just under the rule's 3 × 10⁻⁵, the approximated repulsion's limit cycle; today's rule rightly ignores it.

The estate's seed click and the `views` opening have the same shape on a smaller scale: calm at 90 and 57 ticks, rest at 998 and 479, the spheres moving a median of 36 and 13 units after calm (of 330 and 948).

[`step-2/discovery-tail-gliders.json`](step-2/discovery-tail-gliders.json) lists the eight spheres that travel farthest in the discovery tail, with their forces and curvature at their fastest.

### What was tried, on the replays (ticks to today's rule; how far each sphere rests from today's rest: median, ninetieth centile, farthest)

| Alternative | Discovery (2,606; width 1,304) | Estate seed click (998; width 330) | `views` opened (479; width 948) |
| --- | --- | --- | --- |
| A sphere sleeps (held still) once its own move and its force have stayed under the rule's speed for 10 ticks, wakes when its force changes by as much | 2,720 ticks, 6,857 sleeps and 6,669 wakes; 3.6 / 6.4 / 9 | 958, 258 wakes; 1.1 / 1.7 / 2.1 | |
| The same at three times the speed | 4,716 ticks, 24,868 sleeps; 22 / 43 / 66 | 767; 3.5 / 8.4 / 15 | |
| The same at ten times | 768; 128 / 258 / 672 | 469; 13 / 32 / 54 | |
| A drag rising as the largest move falls under 3 × 10⁻⁴, up to ten times | 792; 120 / 240 / 638 | 499; 4.5 / 17 / 35 | 150; 4.1 / 18 / 98 |
| The same under 10⁻³, up to ten times | | 2,983 (later) | 131; 5.7 / 19 / 100 |
| A tick's time rising (up to four times) as the move falls under 3 × 10⁻⁴ | 2,360; 10 / 20 / 37 | 937; 1.0 / 2.9 / 4.9 | 700 (later); 0.9 / 4.6 / 44 |
| New spheres untethered until the picture calms, then anchored where they stand | 426; 308 / 529 / 885 | 338; 72 / 121 / 142 | 237; 70 / 105 / 162 |
| **Settle Hold 0.02**: at the calm, each sphere also held where it stands then | **284; 129 / 299 / 711** | **171; 32 / 77 / 104** | **186; 8.4 / 27 / 100** |
| Settle Hold 0.05 | 229; 129 / 302 / 710 | 173; 34 / 80 / 108 | 156; 10 / 32 / 101 |
| Settle Hold 0.005 | 898; 138 / 282 / 708 | | |

Sleeping churns: a sleeping sphere's force changes as its neighbours creep, so it wakes, and at a threshold the eye cannot see it shortens nothing; at one high enough to shorten it is a freeze, with FIRE's waking and sleeping in every sphere. A rising drag only slows the creeps, so what is left to travel is still to travel; it rested sooner on some pictures and later on another. Faster time keeps the rest (the same path, sampled more coarsely) but the rule counts a move a tick, so it rested little sooner and, on `views`, later. Untethering the newcomers moves the picture most of all. **The Settle Hold** is the one that shortens every picture by a factor of 2.6 to 9 with a pull that changes nothing at the moment it takes hold: it rests the picture where it was when it calmed, as the distances show (they are the distances the picture would have travelled after its calm, 129 / 304 / 710 on discovery).

### The Settle Hold, built behind a lever

**What it is.** Once the whole picture has entered and calmed, with no hand on a sphere, each sphere is also held where it stands then, beside its tether, by a pull of the lever's strength per unit of distance. The tether toward where it stood before and this hold toward where it calmed are one pull, of their summed strength, toward the mean of the two places weighed by their strengths (`SpatialMotion.settleHere`); the pull on every sphere is therefore unchanged at the moment it takes hold and grows only as a sphere moves on, so nothing jumps: the creeps slow to a stop within some 135 ticks. It is the tether's own reason, a person's bearings, applied at the moment the picture looks settled: what was seen when it calmed is what stays. Its price: the rest is not the forces' balance, but the calmed picture's.

**Where.** Tuning, 3D, Forces: **Settle Hold**, below Tether, 0 to 0.1 by 0.001, **0 by default** (the picture as it is today; at 0 the code takes no new path, and the lever-0 runs below rest with every sphere in main's place to the last digit). It travels in a share link like its neighbours and changes no force, so moving it changes the next settle, not the picture on screen.

**What it does to a first picture.** The calm at which a first picture's tether takes hold is the same calm, so on a first picture the hold is a tether as strong as both, from that moment: the archipelago rested in 30 frames instead of 43, its seeds 17 units (median) from today's; the `client` opening in 245 frames instead of 424.

**What it does to a hand and to the history.** A drag wakes the motion, which lets the hold go (`anchorHere` gives the tether back its own strength) and while a hand holds a sphere it never takes hold, so a drag moves as today; once the hand lets go and the picture calms again, it holds again. Nothing sleeps, so nothing has to be woken: every sphere feels every force at every tick, and a sphere pushed by a dragged neighbour moves as it does today, only held a little toward where it last calmed. Each step of the history is a change of what is shown, which wakes the motion and lets the hold go; between steps a picture that has calmed stops gliding sooner. One limit of the trial: a field rebuilt after the hold took hold and without a wake (a perspective change revealing more pieces) keeps the held anchors at the tether's own strength until it calms and holds again.

### In the page (load 24 to 31 throughout, another builder's work; frames and seconds are both the machine's now, so compare the columns, not with step 1)

| Picture | Settle Hold 0 (today) | 0.02 | 0.05 | Distance from today's rest at 0.02 (median / 90th / farthest; width) | at 0.05 |
| --- | --- | --- | --- | --- | --- |
| Discovery growth (`force-graph-discovery.spec.ts:70`) | 3,883 frames, 215 s | 490 frames, 27.9 s | 389 frames, 22.6 s | 130 / 298 / 709 (1,304) | 128 / 298 / 706 |
| Estate, seed `PaymentService/PaymentService.cs` clicked | 997 frames, 85.2 s | 169 frames, 13.5 s | 171 frames, 10.6 s | 32 / 77 / 104 (330) | 34 / 80 / 108 |
| This repository in Structure, `views` opened | 480 frames, 31.4 s | 197 frames, 12.8 s | 154 frames, 10.6 s | 9.4 / 31 / 74 (948) | 10 / 32 / 101 |

The page's distances agree with the replays' (the first picture differs a little under the lever, so the grown one starts elsewhere). Numbers and every place are in [`step-2/runs-and-places.json`](step-2/runs-and-places.json).

### The pictures

- Rests side by side, Settle Hold 0, 0.02 and 0.05, the map's canvas alone: [`discovery`](step-2/discovery-rests-side-by-side.png), [`estate`](step-2/estate-rests-side-by-side.png), [`views`](step-2/views-rests-side-by-side.png).
- Up to five frames across the last third of each settle and its rest (a picture was taken every 60 drawn frames, so a settle of a few hundred frames has one or two in its last third): discovery at [0](step-2/discovery-hold-0-last-third.png), [0.02](step-2/discovery-hold-0.02-last-third.png), [0.05](step-2/discovery-hold-0.05-last-third.png); estate at [0](step-2/estate-hold-0-last-third.png), [0.02](step-2/estate-hold-0.02-last-third.png), [0.05](step-2/estate-hold-0.05-last-third.png); `views` at [0](step-2/views-hold-0-last-third.png), [0.02](step-2/views-hold-0.02-last-third.png), [0.05](step-2/views-hold-0.05-last-third.png).

**Do the two rests read as the same picture?** To my eye: **`views`, yes**: the `localView · 78` bubble right of the `views` hub, `panels`, `search` and `bootstrap` below left, the `worldMap` bubble above, all where they were, a few spheres shifted. **Discovery, the same at a glance and not in detail**: the group's tangle in the lower left with the seed's name at its heart and the other seeds dimmed around it, at the same scale; but held, the tangle is more compact, the seed's name sits higher, the tests (green) gather at the top rather than ringing the group, and a large ringed sphere stands at its lower right; a person who studied today's rest would not find each file in the same place. **Estate, no**: the same members, but the shells `Gateway · 2` and `Pages · 3` and the hub's files stand in another arrangement round `Hub · 3`. In every last-third strip at 0 the picture barely changes between frames at this size, which is the slowness itself: it is visibly finished long before it is said to be. 0.02 and 0.05 rest almost alike; 0.02 is the gentler.

### Links that open each picture with the lever set at 0.02

Relative to the Explorer's root (built by `npm run live-docs:visualize` and `npm run live-docs:visualize:estate`); change 0.02 with the slider after opening, or open without the lever for today's:

- Discovery, then click the largest group's seed, `local-storage.ts` (hover it for its name): `/?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGccAXGhHACTQQBMoAGAOg4CZ5SaYpSj8QAcwxoArsQDqRYsRwYRkEGhQoQAXx3wAjlBDR2OoA`
- Estate, then click `PaymentService.cs` on the archipelago: `/samples/estate/?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGccAXGhHACTQQBMoAGAOg4CYBffvACOUENHb8gA`
- This repository in Structure with `packages/explorer/src/client` open, then click the `views` bubble: `/?s=N4IgbiBcDMA0IBsqgGYHsBOBjApgcQwEMAHAC2RAGccAXGhHACTQQBMoAGAOg4CZ4A5hjQBXYgHUixYjgyUoVANYBLAHYgAvhvgBHBdHbwAngso0MIrDREYcIeO0gBtEMUJZFhATkoB6HAAexAiYsr6U2L5YCMo4qjQgALoaQA`
