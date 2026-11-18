# What moves in the 3D map's settle tail, November 16, 2026

_Historical evidence, taken by a builder at the first step of the round that was to give the 3D Local Map's rest one rule stated in what a person can see (the owner's words on the 3D picture's speed in [Turn 3 of the November 12 record](../../../2026-11-12/2026-11-12.1.record.md#turn-3); the earlier measurement in [the building map's folder](../../../2026-11-15/Screenshots/building-map/README.md)). Nothing was built at first: the measurement shows something neither of the brief's two candidates predicted, so it went back to the root first. Base commit `d54755f1`. The root's decision on it: the threshold and the count stand, the rule is said as what it is, and what a round on the forces would have to decide is [set out below](#what-a-round-on-the-forces-would-have-to-decide)._

## How it was measured

- **In the page**, on this worktree's build with a scratch probe in `motionForce` (never committed): headless Chromium at 1,440 × 900, the Explorer's defaults (one hop, Skin wrappers, Shell Depth 2, Reveal Frames 60, Approximation 0.3) with the 2D map's continuing search off, as in the browser suite. Every completed tick logged its largest move against the diagonal and which sphere made it; every drawn frame logged every sphere's place on the screen; and at every break in the motion (a field built, a wake, a stir, the tether taking hold) the probe kept the motion's whole state: the field's radii, springs, settings, softness and mass, and the spheres' positions, velocities and anchors.
- **Replayed headless** from the last such state, through the page's own `SpatialField` and `SpatialMotion`: on all four actions the replay's largest move of every tick equals the page's to the last digit (difference 0 over 1,305, 476, 150 and 111 ticks), and today's rule falls still at the same tick. So the tail can be run on past the page's rest, and at Approximation 0, exactly.
- **The headless twin** (`easeSpatialLayout`, no wrappers, no shells) was measured too, for comparison.
- Four actions: the estate's seed click (`PaymentService/PaymentService.cs`, from the archipelago at rest), opening `Portal` in the estate's Structure layout (a click on its hub), this repository's arrival on `views/forceGraphView.ts` at one hop by link, and this repository whole in Structure by link (capped at 240 s).

## What the page shows

| Action | Busy, frames (s here) | Last move of 1 px between frames | Last frame a sphere stands 1 px or more from its rest | On-screen travel after the last 1 px step |
| --- | --- | --- | --- | --- |
| Estate: seed click | 1,309 (43.0) | frame 186 | frame 1,294 | 179 px (`shell:Portal/Models`), 163 px (`shell:Gateway`) |
| Estate: open `Portal` (Structure) | 478 (13.2) | frame 131 | frame 458 | 49 px (`directory:Portal/Models`) |
| Repository: arrival at one hop | 257 (62.4) | frame 192 | frame 253 | 31 px (`vitest.config.ts`) |
| Repository whole in Structure | capped at 642 frames (240 s), 213 ticks | frame 549 | frame 637 (capped) | still unfolding at the cap |

The first two rows reproduce the November 15 measurement (1,309 and 479 frames; last 1 px step at 186 and 132). **The tail is not invisible.** "The last move of a pixel" of November 15 counted a pixel between two frames; a sphere gliding at a third of a pixel a frame moves 20 px a second at 60 frames, which the eye sees. On every action the picture comes within a pixel of its rest only 4 to 20 frames before `aria-busy` turns false. Measured in the replay with a fixed camera, the seed click's `shell:Gateway` still travels 0.12 of the diagonal (117 px at 1,440 × 900) after frame 186.

## What moves in the tail

- **Estate, seed click: the directory shells glide, one after another, and some accelerate.** `shell:Portal/Models` decays (move ratio 0.991 to 0.995 a tick, ticks 150 to 500); `shell:Portal/Pages` holds a plateau near 6 × 10⁻⁵ of the diagonal a tick (ratio about 1.000, ticks 550 to 700); `shell:Gateway` then **accelerates** from 6 × 10⁻⁵ to 2.4 × 10⁻⁴ (ratio 1.006, ticks 700 to 1,000) and decays again. Every one of these is a straight glide: its net displacement over 10 and 60 ticks equals its path. Today's rule falls still at tick 1,305 in a lull; run on, the motion carries `shell:Portal/Pages` off again (ratio 1.002 from tick 1,350) and `shell:Portal/Models` (ratio 1.0045 near tick 4,800), and comes to a true rest only after about 7,000 ticks, `shell:Portal/Models` having travelled a further 0.18 of the diagonal (87 px). These are heavy, soft shells (mass the cube root of their files, contacts a sixth of the collision's stiffness) sliding off shallow, unstable balances: neither a decay toward a balance nor a chatter about a point.
- **At Approximation 0** the same: the tail is the same kind of glide, today's rule falls still at tick 747 in an earlier lull, and the shells escape again later (`shell:Portal/Pages` accelerating from tick 1,500, `shell:Gateway` near 5,750). The approximation is not the cause.
- **Estate, opening `Portal`: a decay.** One hub, `directory:Portal/Pages`, decays geometrically at 0.993 to 0.994 a tick (a time constant of some 160 ticks), a straight glide; today's rest is 2.7 px short of where it would end.
- **Repository at one hop: a decay after the unfolding.** The picture unfolds for 168 ticks, then held, shells decay at 0.98 to 0.99 a tick (`shell:packages/engine/src`, then `shell:scripts/live-docs`, `shell:scripts/oracle`); today's rule rests 150 ticks after the hold, 2.3 px short.
- **Repository whole in Structure: no long tail.** The picture unfolds for 274 ticks before it calms under 10⁻³ of the diagonal a tick and is held; then it decays fast (0.92 a tick) and today's rule would rest 82 ticks later. At 1,266 spheres a tick spans about three frames here, so the cost is the unfolding and the price of a tick, not the rule.
- **The twin** (wrappers off) has no shells and short tails: the estate's seed click decays at 0.9905 (one file, `PostPaymentRow.cs`; rest at 376 ticks, 3.3 px short); the repository's pictures decay fast and then chatter at about 10⁻⁶ of the diagonal a tick with a net displacement near zero, a limit cycle of the approximated repulsion that vanishes at Approximation 0. That chatter is thirty times under today's threshold and holds nothing up.

## What a rule of rest could buy

Candidate rules run over the exact replays (ticks to rest; the largest change of the resting place from today's, at 1,440 × 900):

| Rule | Estate seed click | Estate open `Portal` | Repository one hop |
| --- | --- | --- | --- |
| Today: each tick's largest move ≤ 3 × 10⁻⁵ of the diagonal for 10 ticks | 1,305 | 476 | 150 |
| Remaining travel, by the 10-tick ratio, under 10⁻⁴ of the diagonal | 7,948 (87 px elsewhere) | 1,363 (2.7 px) | 389 (2.2 px) |
| No sphere strays 10⁻⁴ of the diagonal for 30 ticks | 7,136 (87 px) | 891 (2.4 px) | 348 (2.1 px) |
| No sphere strays 3 × 10⁻⁴ for 30 ticks | 6,766 (87 px) | 671 (1.8 px) | 259 (1.6 px) |
| No sphere strays 10⁻³ for 30 ticks | 1,303 (0.1 px) | 466 (0.2 px) | 178 (0.6 px) |
| Today's rule at 10⁻⁴ | 470 (88 px) | 303 (5.6 px) | 86 (2.7 px) |
| Today's rule at 3 × 10⁻⁴ | 280 (104 px) | 182 (16 px) | 40 (8.4 px) |

Every rule that rests when what is left to move is under a pixel rests **later** than today, by 1.4 to 6 times, and somewhere visibly other (on the seed click, at the shells' true balance 87 px away). Every rule that rests sooner freezes a picture that is still visibly gliding, and rests visibly elsewhere. Today's threshold is itself about a speed a person cannot see at 1,440 × 900 (some 0.03 px a tick, under 2 px a second at 60 frames), and it fires within a few frames of the picture coming within a pixel of its rest.

## A picture at rest stays put

Watched in the page on the same build, with nothing touched, for 600 animation frames after `aria-busy` turned false: on the estate's seed click (rested in 1,306 ticks, 39.5 s) and on opening `Portal` (477 ticks, 14.2 s), the motion took **no tick**, **no sphere moved** in the world or on the screen (largest change 0), the page drew no frame, and `aria-busy` never turned true again. What stops it: the view ticks the engine only while the motion runs (`animateFocus` in `forceGraphView.ts`, `if (simulationRunning && motion) simulation.tick()`), `onStill` ends that once the reveal is whole (`simulationRunning = false`), and D3's own simulation is made stopped (`forceSimulation(...).stop()`), so no timer of its own ticks it; only a wake, a stir, a new piece or a hand starts it again. `motionForce` itself would still move the spheres if something ticked it after `onStill`, since it takes the step before it asks whether it is still, but neither the page nor the headless twin, whose loop ends at stillness, does. Nothing was built for it.

## What a round on the forces would have to decide

Nothing here is built. These are the questions a round on the 3D motion's forces would carry, with what the replay already says about them, and its constraint: **shorten the glide without moving where a picture ends by more than a few pixels.**

### Which bodies glide, and how fast

Speeds are each tick's largest move; at 1,440 × 900 a pixel is about 1.0 × 10⁻³ of the diagonal on the seed click and the repository at one hop and 1.8 × 10⁻³ on the opened `Portal`; "px/s" is at sixty ticks a second.

| Picture | What glides | Speed through the tail |
| --- | --- | --- |
| Estate, seed click | `shell:Portal/Models` (2 files), then `shell:Portal/Pages` (3), then `shell:Gateway` (2), and again after today's rest | Models decays from 6 × 10⁻⁴ to 3 × 10⁻⁵ of the diagonal a tick (0.6 to 0.03 px a tick, 36 to 2 px/s); Pages holds about 6 × 10⁻⁵ (3.6 px/s); Gateway gathers speed from 6 × 10⁻⁵ to 2.4 × 10⁻⁴ (15 px/s) and slows again |
| Estate, open `Portal` | `directory:Portal/Pages`, a bubble of 3 files | a decay from 9 × 10⁻⁴ to 3 × 10⁻⁵ a tick at 0.993 a tick (0.5 to 0.016 px a tick, 30 to 1 px/s) |
| Repository, one hop | `shell:packages/engine/src`, then `shell:scripts/live-docs` and `shell:scripts/oracle` | a decay from 4 × 10⁻⁴ to 2.5 × 10⁻⁵ a tick at 0.98 to 0.99 (0.4 to 0.03 px a tick) |
| Repository whole in Structure | the hubs `directory:tests`, `directory:packages` at the end of the unfolding | no glide: once held, a decay at 0.92 a tick, at rest 82 ticks later; the time goes to the 274 ticks of unfolding and a tick's price at 1,266 spheres |

Every body that glides is a directory's body drawn whole: a shell in Connections, a bubble in Structure. The files glide only as they are carried.

### What holds a body, and what does not

| | A file | `shell:Portal/Models` | `shell:Portal/Pages` | `shell:Gateway` | `shell:packages/engine/src` |
| --- | --- | --- | --- | --- | --- |
| Mass (the cube root of its files) | 1 | 1.26 | 1.44 | 1.26 | 5.21 |
| Contacts (share of the collision's stiffness) | 1 | 1/6 | 1/6 | 1/6 | 1/6 |
| Wires, summed strength | its references' | none | none | one, 0.5 | twelve, 1.24 |
| Tether, per unit of mass | 0.02 | 0.016 | 0.014 | 0.016 | 0.004 |
| Gravity, per unit of mass | 0.025 within its group, 0.02 of the group's common pull | 0.016 | 0.014 | 0.016 | 0.004 |

- **The tether** (0.02) pulls each body toward where it stood when the motion began; **gravity** (0.025) toward the origin, of which Group Separation (0.2) takes a fifth from each group's common pull, leaving 0.02. A body wired to nothing is a group of one, so the part of gravity that holds a group together does nothing for it: `shell:Portal/Models` and `shell:Portal/Pages` on the seed click are held by the tether and the common pull alone, 0.04 a unit, and per unit of their mass about 0.03.
- **Mass** changes how a body moves, never the forces: a body of 1.44 is pushed a third slower than a file by the same slope. **The drag** (0.2 per unit of time) takes the same share of every body's speed whatever its mass, so a heavy body's glide is slower in proportion.
- **Softness** matters only in contact: the glides measured touch nothing, and making the shells as hard as files from the glide on changed no tick of the seed click or the opened `Portal`.

### Why the balance there is shallow, or no balance

- A body held round the mass by gravity against the mass's repulsion is held firmly in and out, but round the mass the two nearly cancel: where gravity's pull balances a central repulsion, its sideways stiffness is exactly cancelled, and only the tether holds. The other bodies' repulsion, not central, can tip that past nothing.
- Measured on the seed click's replay, the energy's curvature along the glide's own line (every sphere moving together, as the motion moves them) is 2 × 10⁻³ a unit² while Models decays (ticks 300 and 1,300), 5 × 10⁻³ while Pages holds its plateau (tick 650), and **negative** where a shell gathers speed: −1.8 × 10⁻³ as Gateway leaves (tick 900) and −1.2 × 10⁻⁴ as Pages leaves after today's rest (tick 2,000). The tether alone would give 0.02. So the valleys are a tenth as steep as the tether would make them, and at times saddles.
- The glides are pushed by the slope and held back by the drag: at tick 300 the slope along the line is 0.064, and 0.064 ÷ (1.26 × 0.2) is the speed measured, 5.1 × 10⁻⁴ of the diagonal a unit of time. A glide crawls because the slope is gentle and the drag counts the mass, not because anything holds it back near a balance.

### Experiments on the replay

Each lever is applied from the tick of the last pixel step between frames (183, 129 and 24 ticks after the captured state), so that the picture's arrangement before the tail is today's and the lever acts on the glide alone. Ticks to today's rule; how far that rest stands from today's, at 1,440 × 900; and the ticks to a true rest (no sphere straying 10⁻⁴ of the diagonal for 60 ticks).

| Lever | Estate seed click | Estate open `Portal` | Repository one hop |
| --- | --- | --- | --- |
| Today's forces | 1,305; true rest 7,371 | 476; 1,043 | 150; 470 |
| Every body weighs one | 2,074, **46 px** elsewhere; 6,200 | **427, 0.5 px; 884** | **120, 1.3 px; 243** |
| Drag halved (0.1) | 1,558, **48 px**; 3,900 | **348, 1.7 px; 680** | **132, 2.1 px; 305** |
| Shells as hard as files | unchanged | unchanged | 149, 1.6 px; 424 |
| Tether doubled (0.04) | 1,086, **96 px**; 1,308 | 856, **184 px**; 1,123 | 96, **11 px**; 182 |
| Group Separation 0 | 1,022, **95 px**; 2,134 | 477, 7 px; 1,043 | 154, **36 px**; 402 |

- **Where the tail is a decay** (the opened `Portal`, the repository at one hop), the levers on speed shorten it within the constraint: weighing every body as one, or halving the drag, brings today's rule 10 to 27 % sooner and a true rest 15 to 48 % sooner, each within about 2 px of today's rest. Halving the drag is for every sphere, not only the shells, and may let a picture swing where it now settles; weighing a shell as one undoes the November 7 choice that let a large shell's many contacts stop shortening every tick's step, so its price in substeps would have to be measured again.
- **Where the tail is a cascade off shallow balances** (the seed click), no lever kept the end within a few pixels: which way a shell slides off decides where the picture ends, and any change of the motion's pace takes another way, 46 to 96 px from today's rest. The levers that hold harder (the tether, the full common pull) come to a true rest soonest, at 1,308 and 2,134 ticks against 7,371, but some 95 px away, and change every picture's rest, as the opened `Portal`'s 184 px shows.
- The experiments a forces round would run first, then: (1) the speed levers on the shells alone (a shell's mass, or a drag for heavy bodies), measured on more pictures and with their price in substeps; (2) on the seed click, whether the shells' sideways hold can be made a little steeper (a wire to what they are cut from, or a tether that counts their mass) without moving where its first lull already holds the picture; (3) whether a picture whose rest a lull decides is acceptable as it is, since today's rule already holds it there and the eye cannot tell a lull from a balance.

## Files

- [`tail-measurements.json`](tail-measurements.json): for each action, every frame (its largest step, its largest distance from the place at rest, busy, milliseconds since the action) and every tick (its largest move against the diagonal, the sphere that made it, the breaks), and the motion's state at the last break, from which the replays run.
- [`after-rest.json`](after-rest.json): the 600 frames watched after rest on the two estate actions: frames waited, frames drawn, the motion's ticks, the largest move of any sphere in the world and on the screen, and whether the map turned busy again.
- [`before/estate-seed-click-rest.png`](before/estate-seed-click-rest.png): the estate at rest after the seed click, today's rule. The shells `Models · 2`, `Gateway · 2`, `Pages · 3` are the bodies whose glides make the tail.
- [`before/estate-portal-open-rest.png`](before/estate-portal-open-rest.png): the estate at rest after opening `Portal` in Structure.
- [`before/repository-one-hop-rest.png`](before/repository-one-hop-rest.png): this repository at rest after arriving on `views/forceGraphView.ts` at one hop.
- [`before/repository-whole-structure-rest.png`](before/repository-whole-structure-rest.png): this repository whole in Structure at the 240 s cap, **not at rest**: still unfolding, its hubs strung out on long containment lines.
