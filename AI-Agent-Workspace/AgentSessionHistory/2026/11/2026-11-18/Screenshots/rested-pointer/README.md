# The pointer's rest: strips of frames before and after

_Historical evidence, taken 2026-11-19 by the builder of the round. The rule is the design system's *hover intent*, in [Interaction and Accessibility](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md). The owner's words that asked for it are in [Turn 22 of the November 18 record](../../2026-11-18.1.record.md#turn-22): "What I don't want to have is an application which is shooting random text at me every which way as I scroll my mouse across the screen (which it most certainly does in the 3D local map ...)"._

## The setup

- **Builds.** "main" is the Explorer built from main at `30eaee09`, before the round. "new" is the round's build, with the rest at 350 ms within 4 px.
- **Views and boards.** Each strip is taken on four pictures at 1280 × 800:
  - `3d-repo`: this repository's 3D Local Map, subject `forceGraphView.ts`;
  - `3d-estate`: the estate's 3D map at its start;
  - `world-repo` and `world-estate`: the World Map of each board.
- **The sweep.** A script swept the pointer across the middle of the picture and back, in two legs of about 700 ms each and never stopping, from the bottom-left corner.
- **The rest.** It then moved onto one thing and held still for 700 ms. In 3D, that thing was the first point on the sweep's line where the pointing hand showed; on the World Map, the second piece.
- **How it was read.**
  - The page recorded, at every animation frame, whether a sphere's actions, a wire's words, a peek, a fade or a door's name showed. It also recorded the pointing hand.
  - The pictures come from the browser's own screencast: each strip is twelve frames chosen evenly and labelled with their time.
  - `*-rested.png` is the page at the end of the rest.
- **The fade in 3D** is in the buffers, not the page, so the 3D strips show it but the counts do not. The browser cases measure it from the buffers.

## Counts per strip, in frames

| Picture | Build | Frames in the sweep | With actions | With a wire's words | With a peek | With the rest faded (World) | With door names | With the pointing hand | First words in the rest, ms from the start of the approach |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 3d-repo | main | 294 | 265 | 12 | | | | 210 | 0 (see below) |
| 3d-repo | new | 230 | 72 (see below) | 0 | | | | 164 | 0 (see below) |
| 3d-estate | main | 249 | 90 | 0 | | | | 48 | 550 |
| 3d-estate | new | 246 | **0** | 0 | | | | 46 | 917 |
| world-repo | main | 280 | | | 84 | 84 | 39 | | 500 |
| world-repo | new | 279 | | | **0** | **0** | **0** | | 900 |
| world-estate | main | 257 | | | 40 | 40 | 30 | | 467 |
| world-estate | new | 264 | | | **0** | **0** | **0** | | 917 |

The approach to the resting point itself took about 550 ms. So the new build's words came about 350 ms after the pointer stopped; main's came on arrival.

**`3d-repo` is a flaw of the script, not of the rule.** The script parked the pointer in the bottom-left corner for 600 ms before the sweep. On this repository's picture that corner lies inside the large `explorer` directory shell, so the pointer *rested on the shell* and its actions showed: correctly, by the rule. The sweep then began inside the same shell, and a pointer moving about on a thing it has rested on keeps it, so those actions stayed for the first 72 frames. The strip still shows the difference that matters:
- **main** put words beside the pointer through the whole sweep: a wire's tooltip ("explorer · 203 uses forceGraphEmphasis.ts", "forceGraphBatches.ts uses …"), the action strip hopping from sphere to sphere, and the picture fading and lighting a web of wires frame after frame.
- **new** keeps the shell's actions until the pointer leaves the shell, then shows nothing more. Two frames show the shell's own lit web after the sweep's turn; the script's pacing stalled there, and the stall was a rest.

## What I see

| Picture | What it shows | What I see |
| --- | --- | --- |
| `main-3d-estate-sweep.png` | The sweep on main. | Frame after frame the picture changes under the moving pointer. An action strip (folder, centre, more) appears over PaymentService, then Database, then Contracts, then Database again. The whole picture fades to a few lit groups each time and comes back. |
| `new-3d-estate-sweep.png` | The same sweep, new. | Nothing appears and nothing fades in any of the eleven frames; the picture holds still. The only change is the pointing hand, which a screencast does not draw, and a wrapper's rim where the pointer touches one, too faint to see at this size. |
| `main-3d-estate-rest.png`, `new-3d-estate-rest.png` | Coming to rest on the PaymentService group. | **main:** the strip and the fade come as soon as the pointer arrives. **new:** at 573 ms the pointer has arrived and nothing has changed. At 913 ms the strip appears beside PaymentService, and one frame later, 938 ms, the rest fades. |
| `main-world-repo-sweep.png` | The World Map sweep on main. | A peek opens for every region and piece crossed: REPOSITORY, pages, GITHUB, `tests stands on generator` with its thirteen edges. The board fades around each. |
| `new-world-repo-sweep.png` | The same sweep, new. | Twelve frames of the same still board: no panel, no fade, no door names. |
| `new-world-repo-rest.png` | Coming to rest on `generator`. | Still through 828 ms. At 985 ms the peek stands beside generator, naming `packages/generator`, what calls it and what it stands on. From 1128 ms the rest of the board fades. |
| `new-world-estate-rested.png` | At rest on `gateway`, on the estate. | The peek names the folder it opens, `Gateway`, under its name, with what it offers, calls and stands on. |
| the `main-` and `new-` counterparts of the rest | | The same, without the wait. |

**Does the picture now feel dead under a moving pointer?**
- **On the World Map, no.** Every piece, wire and door shows the pointing hand at once, and the board stays readable on its own: names and kinds are drawn on it.
- **In 3D it is closer.** A bare sphere's only at-once sign is the pointing hand. A wrapped group adds its rim, and a sweep shows nothing else.
- If that reads as dead to the owner's eye, the next step within the rule is a sign on the touched sphere itself (its own outline, in a colour the view already has). Nothing of the rest of the picture should change. I did not add one: the brief said "use what the palette and the view already have; no new colour", and a sphere has no outline today.

## The dwell

350 ms is 21 frames at sixty a second; 250 ms is 15 and 500 ms is 30.
- **A sweep never rests, whatever the dwell.** A rest is a pointer held within 4 px, and it starts again when the hand drifts further. The sweep strips show nothing at 350.
- **What the dwell decides** is whether a hand that hesitates on its way somewhere is shown words, and how long a deliberate rest waits:
  - at 250, a quarter second's hesitation as the hand turns would flash words;
  - at 500, a deliberate rest waits half a second, as long as a slow native tooltip.
- **These two are reasoned from the frame counts, not watched.** I did not build 250 or 500 to look at them.
- 350 is the owner's "modestly long hover". The number is one constant, `REST_DWELL` in `views/pointerRest.ts`, for the owner's eye to move.
