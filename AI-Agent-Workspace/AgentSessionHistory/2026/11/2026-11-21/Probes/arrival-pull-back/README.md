# The arrival's pull-back: what was tried, today's motion measured, and three alternatives

_Historical evidence, taken on the evening of November 21, 2026 (18:29 to 18:55 UTC) by a builder of the 2D map, on its worktree's build of the day branch at `a11f7d007`. Load average 1 to 5 on this machine, which is shared with other builders. Pictures are in [`Screenshots/arrival-pull-back/`](../../Screenshots/arrival-pull-back/)._

## The owner's words

At 18:15 UTC that day the owner described the arrival they want:

> "what I had described was an automatic zoom-out from the single focused pinned item to its neighborhood, ensuring that the user knew the full detail available _and_ that the user started with less outer visual context and _grew into it_ automatically … we attempted to build this at least once and found that, due to jarring performance hits caused by breakpoint transitions, the start-framing-only-one-card-then-zoom-to-neighborhood approach failed on complex scenes."

This piece measures that motion and brings alternatives for their eye.

## 1. What was tried before

The record holds **one** built attempt, and it is today's Tuning → 2D Layout → Arrival → *Reading, Then Neighbours* (`then-neighbours`).

- **The ask.** The owner asked for it on 2026-11-19 at 00:55 UTC ([Turn 22 of the November 18 record](../../../2026-11-18/2026-11-18.1.record.md#turn-22)): "perhaps that's a reasonable best-of-both-worlds default?"
- **Its predecessor was never built.** Root named it the "pre-timed zoom-out" of November 4. That was a proposal only ([Turn 15 of the November 3 record](../../../2026-11-03/2026-11-03.1.record.md)).
- **Built and landed.** It was built that night on the branch `camera-intent` and landed as `cb766ad6` … `e8ff39cf`. Its shape: hold 900 ms at reading size, then ease 700 ms to the Fit frame, never past the connections look's last press. Any press, wheel, key or touch ends it. Reading Size stayed the default.
- **The owner's verdict** ([Turn 37](../../../2026-11-18/2026-11-18.1.record.md#turn-37)):
  - On the repository: "Hmmm, yeah the stutter of performance as the stylesheet breakpoints were hit was jarring."
  - On the estate: "Smaller freeze. That actually was fun. For a clean little toy example, it doesn't feel bad at all."
- **Measured then** ([the camera's pictures](../../../2026-11-18/Screenshots/camera-intent/README.md), "The stall at the look's edge"): 20 frames of 17 ms on `pathfind.ts`, then frames 267 and 250 ms late around the look change.
- **One fix since.** The [look-change freeze round](../../../2026-11-18/Probes/look-change-freeze/README.md) cut the change from three whole-map restyles to one; the ease's longest frame on `pathfind.ts` went from 783 ms to 350 ms. That round says itself: "The stall is shorter, not gone."
- **Strangers never saw the motion.** The blind runs of November 21 waited for the picture's rest.

The search was made by one read-only subagent over the records, summaries, Memory and probes. It did not read any agent's private reasoning.

## 2. Today's motion, measured

**The script.** [`arrival-probe.mjs`](arrival-probe.mjs), run through the browser lane on the built site, 1,280 by 800, with the continuing search off. It keeps:

- every frame the page drew, each with its time, the camera's scale and the map's look and band;
- a Chromium trace of the renderer's main thread; each long frame (over 50 ms) is split into its self time in script, style (and how many elements each style pass restyled), layout and paint;
- the screencast, from which each strip is cut.

**The conditions.**

- *Full*: the browser suite's launch, WebGL on the graphics card.
- *Weak*: software drawing, the page's thread slowed four times by the browser's throttle, and the whole browser held to two cores with `taskset -c 0,1`, as [the weak-machine probe](../weak-machine/README.md) did that morning.

**The subjects.**

- The estate's `Contracts/IPaymentService.cs`: 9 cards.
- This repository's `packages/engine/src/live-docs/pathfind.ts`: 16 cards, 5,910 elements in the map.
- The heaviest honest neighbourhood here, `packages/engine/src/config/liveDocumentationConfig.ts`: 78 neighbours across the engine, the Explorer, the generator, the scripts and the tests; 79 cards, 11,794 elements. It is the seed of the repository's largest group.

**Which breakpoints are crossed.** One per pull-back: the zoom looks' edge from *reading* to *connections*.

- The look is one state on the map (`data-look`, `data-lod` and `--text-scale` on `#map-container`). Every card crosses it in the same frame. No card has a state of its own.
- Two smaller restyles follow it: the look's cross-fade ends 200 ms later, and the prose fades below 0.74 of reading scale.
- The crossing fell at scale 0.58 on `pathfind.ts` and 0.54 on the heavy subject. On the estate, which sits at 1.45 at reading size, it fell at 0.81.

**Where the worst frame falls.** Always on the look change. Its cost is mostly style.

| Subject | Condition | Ease (ms) | Frames | Worst frame | Its style (the whole-map pass) |
| --- | --- | ---: | ---: | ---: | --- |
| estate | full | 700 | 35–36 | 50 ms | (no frame over 50 ms) |
| estate | weak | 867 | 19 | 183 ms | 115 ms (624 elements) |
| `pathfind.ts` | full | 1,117–1,283 | 21–22 | 317–333 ms | the change's frame 217–233 ms, style 146–156 ms (2,595 elements) |
| `pathfind.ts` | weak | 2,017 | 10 | 1,050 ms | 727 ms (2,595 elements) |
| heavy | full | 850–1,017 | 19 | 417–433 ms | 271–275 ms (6,420 elements) |
| heavy | weak | 5,083 | 6 | 3,283 ms | 2,000 ms (6,420 elements) |

**What the eye gets.** The ease runs smoothly in the reading look down to about 0.55 of reading scale. Then one frame stands for 0.4 s at full speed and 1 to 3 s on the weak machine. The picture then lands, often with one more late frame for the fade's end.

The strips show it. In [`then-neighbours--full--heavy--strip.png`](../../Screenshots/arrival-pull-back/then-neighbours--full--heavy--strip.png) the seventh frame comes 749 ms after the sixth. On the weak machine, [`then-neighbours--weak--heavy--strip.png`](../../Screenshots/arrival-pull-back/then-neighbours--weak--heavy--strip.png) is a slide show.

**What this means.** Root's suspicion holds: the cost is the breakpoint, one whole-map restyle and its paint. The motion itself is cheap.

All the numbers are in [`numbers/`](numbers/); [`summarize.mjs`](summarize.mjs) turns them into the table below.

## 3. The alternatives

They are built as values of the same Arrival lever. The default, Reading Size, is unchanged. The other values are unchanged, and any input still ends the motion.

- **Look After** (`then-neighbours-after`). The cards keep the reading look through the whole ease, prose included, and change once at rest at its end, with the look's existing 160 ms cross-fade. This is the usual cure for *level-of-detail popping*: hold the level through the motion and switch once at rest.
- **Look Before** (`then-neighbours-before`). After the hold the cards take the look the ease ends in, at reading size and at rest. The camera waits out the change's cross-fade and its end ([`ARRIVAL_LOOK_LEAD_MS`](../../../../../../../packages/explorer/src/client/views/localView/camera-intent.ts), 350 ms and the fade's end), then eases in that one look. This is the destination's state prepared before the motion. It is the nearest that a state held on the whole map allows: the look cannot be computed without being shown.

`arrivalLookChange` in `camera-intent.ts` says where each value changes the look; the controller holds the look in `heldLook` while it does. The two do not change the restyle's size. They move it to a moment when nothing moves.

| Subject | Condition | Today: worst frame in the ease | Look After: the ease / the change at rest | Look Before: the change at rest / the ease |
| --- | --- | --- | --- | --- |
| estate | full | 50 ms | smooth (36–39 frames, worst 67–83 ms) / 38–58 ms style | 17 ms / smooth (42 frames, every one 17 ms) |
| `pathfind.ts` | full | 317–333 ms | 25–35 frames, worst 50 ms / **267–400 ms** (2,596 elements) | 250–283 ms / smooth (38–39 frames, worst 33–50 ms) |
| heavy | full | 417–433 ms | smooth (27–32 frames, worst 33–50 ms) / **450–467 ms** (6,421 elements) | **517–617 ms** / 14–15 frames, worst 83–233 ms |
| `pathfind.ts` | weak | 1,050 ms | 14 frames / **1,217 ms** | **767 ms** / 3 frames in 483 ms |
| heavy | weak | 3,283 ms | 9 frames / **2,150 ms** | **1,717 ms** / 1 frame in 433 ms |

The bold figures are the frame of the change; the first runs of Look Before, with a lead of 200 ms, are not counted. Root's earlier milestone gave the weak machine's Look After freeze as 2.6 to 2.9 s. That figure is of the whole frame. The change itself measured 2,150 ms (heavy) and 1,217 ms (`pathfind.ts`) here, and in an earlier run 2,883 and 2,567 ms.

**My eye on the strips.**

- **Look After**, [`then-neighbours-after--full--heavy--strip.png`](../../Screenshots/arrival-pull-back/then-neighbours-after--full--heavy--strip.png): the ease is the smoothest motion of the three. The descriptions shrink with the map into a grey texture of tiny lines, which reads as a picture moving away. Then at rest, after the strip's last frame, the map holds still for half a second and the names cross-fade up to their connections size.
  - The single step at rest is honest: the freeze cannot be seen as a stutter, because nothing moves.
  - The swap from grey prose to bold names is a visible pop. The cross-fade softens it over 160 ms and does not smear: the two looks share no moving part.
- **Look Before**, [`then-neighbours-before--full--heavy--strip.png`](../../Screenshots/arrival-pull-back/then-neighbours-before--full--heavy--strip.png): at reading size the card suddenly swells. The connections look draws names at 2.2 times their reading size, so at reading scale they stand huge, and the descriptions fade away. Then the camera eases out and the names shrink to their legible size as the neighbours come in.
  - The motion is smooth at full speed.
  - The swell at reading size is the strongest change of the three. It replaces the words the person may have started to read with bigger names. Someone reading the first description would lose it. It also says "here is a different view" before the camera says it.
- **Today's**: smooth, then a stop mid-motion, then the end. It is the stop the owner called jarring.

**On the weak machine nothing is smooth.**

- *Look After* — eases in 9 to 14 frames, then freezes 1.2 to 2.2 s at rest.
- *Look Before* — freezes 0.8 to 1.7 s at rest, then eases in one to three frames. Each frame of the connections look in motion still costs 166 to 433 ms there: 47 to 95 ms of paint and 74 to 97 ms of style. The style is a restyle of 665 to 1,396 elements in the ease that I have not traced to its source.

### Why the reading look is not free to shrink on the weak machine

[`share-probe.mjs`](share-probe.mjs) counted what each look draws over the heavy subject's whole map ([`numbers/share--full.json`](numbers/share--full.json), `inventory`).

- **Descriptions**: 109 prose blocks, 36,064 characters, all drawn while the reading look shrinks through the ease.
- **Buttons**: 534 row and file action buttons in the reading look against 297 in connections.
- **Constant in both**: 109 symbol names, 79 file names, 217 path and directory lines, and 56 test chips.

As the ease pulls back, every card comes into the frame. On a processor that rasters software layers, each frame paints all of that text at a new scale. Under Look After that is 84–140 ms of paint a frame on `pathfind.ts` (weak). The prose is the bulk: 36,064 of the 46,449 characters drawn.

### The restyle that belongs to cards outside the window

Root asked whether the look could change card by card, the unseen cards during the rest and only the seen ones when the camera starts.

[`share-probe.mjs`](share-probe.mjs) made the look's own writes by hand at rest at reading size on the heavy subject. It made them three times over the whole map, and three times with every card outside the window skipped (`content-visibility: hidden`, which leaves a subtree's style uncomputed). The page's style passes say what each cost.

| Condition | Whole map | Cards outside the window skipped |
| --- | --- | --- |
| full | 6,416 elements, 87–107 ms | 1,457 elements, 21–24 ms |
| weak | 6,416 elements, 428–718 ms | 1,457 elements, 90–119 ms |

At reading size only 2 of the 79 cards meet the window: 613 of their 10,347 elements. **About 78 % of the look's restyle belongs to cards nobody sees.** What is left, 1,457 elements, is the two cards and the map's own furniture: directory bands, labels and cells.

So the per-card look would cut the change in motion to a fifth. It was not built in this piece, for what it would cost:

- **The stylesheet.** The look is read by about 150 rules in `reading.css` and `local.css`. Each one keys on the map's attributes through a descendant selector (`[data-lod="far"] .local-slot-card …`, `[data-looks="three"]…`). Moving the state onto each card's wrapper means no element may have two holders of the state above it. A card inside an opened directory's band has one today, through the map. Under a per-card state it would have the band's and its wrapper's, which match together and disagree. So the directories' labels and cells need holders of their own, and the rules for the legend (`body:has(#map-container[data-lod="overview"])`) a decision.
- **The cross-fade.** It is the map's: `local-look-fading`, `data-look-from`, `--look-zoom`. It would become per card, with a card caught half in view at the camera's start changing in view.
- **The wires.** They end at dots whose size and place change with the look. A wire between a changed card and an unchanged one would be drawn to each at its own look, and every slice would redraw the wires. They are unseen off the window but cost a drawing each.
- **The browser's own form.** A cheaper form of the same idea is `content-visibility: auto` on the cards through the arrival only. The browser then computes a card's style when it nears the screen, so the cards coming in during the ease would restyle a few at a time, unasked. It was tried for raster on 2026-11-06 and not taken, because of paint containment: dots grown outward clipped, the test halo cut, a stacking context a card. For style it is untried. Nothing built here tries it.

My recommendation: the share is large enough to be worth a piece of its own, as its first step. Measure `content-visibility: auto` held through the arrival as a fourth value, since it needs no change to the stylesheet. Build the per-card state only if that one's containment faults show on the cards.

## 4. The rest at reading size before the pull-back

- **How long.** 900 ms after the picture has settled: the camera's own move, the layout's and any drag ended. Measured from the moment the map says its camera moves to the first frame of the ease:
  - full: 1.5–1.7 s on the estate, 2.4–2.7 s on `pathfind.ts`, 2.9–3.3 s on the heavy subject;
  - weak: 2.8–3.9 s, 6.9–7.6 s, 11–16.6 s.
  - Look Before adds its lead.
- **What cancels it.** A pointer pressed, a wheel turned, a key pressed or a touch begun on the map (`ARRIVAL_ENDING_INPUTS`). A pointer that only passes over does not, so a person reading with their eyes alone, or with the pointer resting on the words, is pulled off them 900 ms after the picture settles: [`arrival-waits--never--strip.png`](../../Screenshots/arrival-pull-back/arrival-waits--never--strip.png).
- **The alternative, built as a lever of its own and pictured.** Tuning → 2D Layout → **Arrival Waits** (*Never*, the default; *While Pointed At*).
  - While a pointer that moved since the arrival began stands on the subject's card, the hold starts again every frame. 900 ms after the pointer leaves, the ease begins.
  - [`arrival-waits--pointed--strip.png`](../../Screenshots/arrival-pull-back/arrival-waits--pointed--strip.png): the pointer on the file's name holds reading size for 3 s and 0.6 s after leaving; 2 s after leaving, the neighbours.
  - A pointer that was already on that spot when the page opened does not hold it, since a pointer at rest on a spot it did not move to says nothing of reading.
- **A touch screen** has no pointer that rests. A finger on the card is a `touchstart`, which today ends the arrival where it stands, at reading size, so a touch reader who touches the card to read it is not pulled away. One who reads without touching is pulled away after 900 ms, as a mouse reader who does not point is. Holding longer for anyone who might be reading would need a sign of reading that does not exist on touch. A longer hold, or none, is the owner's choice.
- I changed nothing in the default rest.

## What the owner should open first

1. *Look After* on this repository's `liveDocumentationConfig.ts`, then on `pathfind.ts`: the smooth pull-back with its one step at rest.
2. Today's *Reading, Then Neighbours* on the same two, for the stutter they described.
3. *Look Before* on the same two: whether the swell at reading size is acceptable.
4. Any of the three with *Arrival Waits: While Pointed At*, reading the subject's descriptions with the pointer on the card.

## Files

| File | What it is |
| --- | --- |
| [`arrival-probe.mjs`](arrival-probe.mjs) | The motion's probe: frames, trace, long frames' contents, look changes, strips |
| [`share-probe.mjs`](share-probe.mjs) | The share of the look's restyle outside the window, and what each look draws |
| [`waits-probe.mjs`](waits-probe.mjs) | A reader's pointer on the card under Arrival Waits, as two strips |
| [`summarize.mjs`](summarize.mjs) | The table below from the numbers |
| [`numbers/`](numbers/) | Every run's readings: per subject, its frames' summary, every long frame with its contents, each look change's frames, and the screencast's gaps |

## Every run

Rest is from the map's first saying that its camera moves to the ease's first frame. The ease is the frames, each at a new scale, that end at the last change of scale. "Worst" is the longest frame in the ease. TN is *Reading, Then Neighbours*. The heavy subject's "look change at" is relative to the ease's start (negative: before it).

| Condition | Subject | Arrival | Run | Rest before the ease (ms) | Ease (ms) | Frames | Median | 90th | Worst (ms) | Worst at (ms, scale) | Worst: style (elements) / layout / paint / script | Look change at (ms, scale) |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| full | estate | TN | 1 | 1550 | 700 | 35 | 16.7 | 33.3 | 50 |  |  | 417, 0.811 |
| full | estate | TN | 2 | 1567 | 700 | 36 | 16.7 | 33.3 | 49.9 |  |  | 400, 0.811 |
| full | estate | TN-after | 1 | 1633 | 767 | 39 | 16.7 | 33.3 | 83.3 | 767, 0.576 | 57.5 (625+75) / 6.1 / 3.6 / 14.5 | 767, 0.576 |
| full | estate | TN-after | 2 | 1683 | 750 | 36 | 16.7 | 33.3 | 66.7 | 750, 0.576 | 37.8 (625+75) / 3.9 / 9.1 / 9.8 | 750, 0.576 |
| full | estate | TN-before | 1 | 1933 | 700 | 42 | 16.7 | 16.7 | 16.7 |  |  | -333, 1.45 |
| full | estate | TN-before | 2 | 1933 | 700 | 42 | 16.7 | 16.7 | 16.8 |  |  | -333, 1.45 |
| full | pathfind | TN | 1 | 2450 | 1283 | 21 | 16.7 | 233.3 | 333.4 | 1283, 0.335 | 22.7 (665+120) / 1.2 / 14.7 / 29.5 | 567, 0.579 |
| full | pathfind | TN | 2 | 2700 | 1117 | 22 | 16.7 | 216.6 | 316.6 | 900, 0.339 | 50.1 (1043+173) / 2 / 31.6 / 18 | 550, 0.579 |
| full | pathfind | TN-after | 1 | 2383 | 950 | 35 | 16.7 | 33.4 | 266.6 | 950, 0.335 | 179.6 (2596+119+163+649) / 11.9 / 23.1 / 38.1 | 950, 0.335 |
| full | pathfind | TN-after | 2 | 2700 | 1083 | 25 | 33.3 | 50 | 399.9 | 1083, 0.335 | 259.8 (2596+163+649) / 20.3 / 43.7 / 54.1 | 1083, 0.335 |
| full | pathfind | TN-before | 1 | 2567 | 733 | 38 | 16.7 | 33.3 | 50 |  |  | -183, 1 |
| full | pathfind | TN-before | 2 | 2550 | 700 | 39 | 16.7 | 16.8 | 33.4 |  |  | -200, 1 |
| full | heavy | TN | 1 | 2933 | 850 | 19 | 16.7 | 83.3 | 416.7 | 767, 0.537 | 270.6 (6420+981) / 25.8 / 65.5 / 16.1 | 767, 0.537 |
| full | heavy | TN | 2 | 3167 | 1017 | 19 | 16.7 | 233.3 | 433.4 | 783, 0.537 | 275.4 (6420+981) / 23.8 / 68.2 / 15.5 | 783, 0.537 |
| full | heavy | TN-after | 1 | 3083 | 700 | 27 | 16.7 | 33.4 | 50 |  |  | 1150, 0.335 |
| full | heavy | TN-after | 2 | 3267 | 700 | 32 | 16.7 | 33.4 | 33.4 |  |  | 1167, 0.335 |
| full | heavy | TN-before | 1 | 3700 | 767 | 14 | 33.4 | 116.6 | 233.4 | 233, 1 | 95.2 (2366+210+319) / 5.5 / 56.1 / 54.5 | 0, 1 |
| full | heavy | TN-before | 2 | 4117 | 467 | 15 | 33.3 | 50 | 83.4 | 83, 0.819 | 17.8 (1396) / 0 / 33.9 / 7.9 | -300, 1 |
| weak | estate | TN | 1 | 2750 | 867 | 19 | 16.7 | 150.1 | 183.3 | 567, 0.771 | 114.9 (624+75) / 6.8 / 19.4 / 26.7 | 567, 0.771 |
| weak | estate | TN-after | 1 | 3867 | 1683 | 15 | 50 | 83.3 | 1000 | 1683, 0.576 | 725.1 (4+625+23+43+75) / 37.4 / 95.6 / 125.2 | 1683, 0.576 |
| weak | estate | TN-before | 1 | 3283 | 783 | 25 | 33.3 | 50 | 116.6 | 783, 0.576 | 9.4 (4+5) / 2.7 / 21 / 33.8 | -217, 1.45 |
| weak | pathfind | TN | 1 | 6917 | 2017 | 10 | 50 | 1050 | 1050 | 1417, 0.502 | 727.4 (59+2595+649) / 48.5 / 135.3 / 53.4 | 1417, 0.502 |
| weak | pathfind | TN-after | 1 | 7600 | 1917 | 14 | 50 | 83.4 | 1216.5 | 1917, 0.335 | 804.9 (2596+119+163+649) / 48.3 / 140 / 157.8 | 1917, 0.335 |
| weak | pathfind | TN-before | 1 | 7583 | 483 | 3 | 166.7 | 183.3 | 183.3 | 183, 0.394 | 74.3 (665) / 0 / 47.3 / 28.5 | -667, 1 |
| weak | heavy | TN | 1 | 14483 | 5083 | 6 | 150 | 3283.1 | 3283.1 | 3667, 0.427 | 1999.9 (6420+278+981) / 283.8 / 526.4 / 300.9 | 3667, 0.427 |
| weak | heavy | TN-after | 1 | 11216 | 2983 | 9 | 100 | 2149.9 | 2149.9 | 2983, 0.335 | 1313.2 (6421+209+981) / 120.1 / 318.3 / 236.8 | 2983, 0.335 |
| weak | heavy | TN-before | 1 | 16583 | 433 | 1 | 433.4 | 433.4 | 433.4 | 433, 0.335 | 97.2 (1396+1+209) / 6.5 / 95 / 145.9 | -1133, 1 |

Look After's change at rest falls outside the ease where its frame stood before the ease's last change of scale. The change's own frames, wherever they fall, are each run's `lookFrames` in [`numbers/`](numbers/). On the heavy subject at full speed they were 450–467 ms (6,421 elements restyled).

## What this does not show

- The owner's machine. The weak condition ranks; it does not predict.
- The motion as felt. Strips are the screencast's frames; the owner's eye on their preview decides.
- The per-card look, which was measured as a share and not built (above).
- The restyle of 665 to 1,396 elements inside Look Before's ease on the weak machine, which is not traced to its source.

## 5. Second round: the unseen cards' restyle skipped (`content-visibility: auto`)

_Taken 19:29 to 20:09 UTC the same evening on the day branch at `a90c583c6`, merged into the builder's worktree. The machine's load average was 3 to 13: other builders shared it, and at 11 to 13 a frame's time swings by half. The elements restyled, which do not depend on the load, are the firm numbers._

**What was tried.** A trial lever, Tuning → 2D Layout → **Unseen Cards** (*Drawn*, the default; *Skipped*). Under Skipped each card's wrapper gets three properties:

- `content-visibility: auto`;
- its measured size as `contain-intrinsic-size: auto <w> auto <h>`, to the fraction of a pixel;
- `overflow-clip-margin: 48px`.

It is **not landed**: the stills at rest are not equal to the Drawn ones (below). The whole change is kept as [`unseen-cards.patch`](unseen-cards.patch), which applies to the day branch at `a90c583c6`.

### The stills at rest, Drawn against Skipped

[`stills-probe.mjs`](stills-probe.mjs) takes the three subjects at rest in the three looks: the arrival at reading size, three Zoom Out presses for connections, then four more for overview. It takes them twice with Drawn and once with Skipped, and compares the map's room pixel for pixel with a fuzz of 2 %. The sidebar's Tuning badge counts a lever moved from its default, as it should.

| Subject | Look | Drawn against Drawn | Drawn against Skipped |
| --- | --- | ---: | ---: |
| estate | reading | 15 | 130 |
| estate | connections | 0 | 0 |
| estate | overview | 0 | 0 |
| `pathfind.ts` | reading | 0 | 673 |
| `pathfind.ts` | connections | 0 | 602 |
| `pathfind.ts` | overview | 5 | 489 |
| heavy | reading | 0 | 649 |
| heavy | connections | 0 | 461 |
| heavy | overview | 134 | 4,114 |

The first build, without `overflow-clip-margin` and with whole-pixel sizes, differed by 25,800 to 94,598 pixels a still. The paint containment that `content-visibility` brings clipped three things: the subject's glow, the test-backed halo, and the pins that stand on a card's edge. Clip room and fractional sizes brought it to the table above. The two faults left:

1. **A stacking context for every card.** An opened directory's membrane outline, which passes behind a card's glow, is drawn under the skipped wrapper where it was drawn over the glow ([the picture](../../Screenshots/arrival-pull-back/unseen-cards/stills--pathfind-reading--drawn-skipped-difference.png): the faint rounded line above the cards at the left is gone under Skipped). That accounts for the 461 to 673 pixels at reading and connections.
2. **A card's box at the overview.** At the overview under Files Only every card takes a compact form, so a card's box does change between looks there. A skipped card off the window keeps the size it was last drawn at, in another look. The column extents the wires are routed by move by a fraction, and the vertical runs of the wires and one card edge shift by a pixel ([the picture](../../Screenshots/arrival-pull-back/unseen-cards/stills--heavy-overview--drawn-skipped-difference.png)). That accounts for 4,114 pixels on the heavy subject.

Both change a still at rest, so the trial is not clean. Making it clean would need two things: the membranes drawn above every card's own layer, and each card's size written again whenever the look changes its form. Neither is small.

### What Skipped does to the motion

Every run is in [`numbers/unseen-cards/`](numbers/unseen-cards/), and [`summarize2.mjs`](summarize2.mjs) gives the table at the end of this section. On the heavy subject:

| Journey | Condition | Drawn: worst frame, elements restyled at the look's change | Skipped: the same |
| --- | --- | --- | --- |
| the crossing pull-back (today's form) | full | 950–1,017 ms, 7,460–7,850 (at load 11–13) | 267 ms, 4,597–4,757, and a second frame of 233–267 ms restyling 3,001 |
| the crossing pull-back | weak | 2,000 ms, 7,460 | 883–967 ms, 3,957, and a second frame restyling 3,908 |
| a wheel across the edge (8 notches) | full | 550–600 ms, 7,460–7,739 | 217–250 ms, 4,697 |
| a wheel across the edge | weak | 2,333 ms, 7,461 | 1,033 ms, 4,807 |
| Look After, the change at rest | full | 450–467 ms, 6,421 (first round) | 417 ms, 7,866 |
| Look Before, the change at rest | full | 517–617 ms, 6,420 (first round) | 167 ms, 3,741, and a frame restyling 3,883 |

**Halved, not removed.** At reading size 78 % of the restyle belonged to cards outside the window. Where the crossing falls, though, the camera is already at about 0.55 of reading scale and many more cards are in view: about 4,600 elements are styled there under Skipped.

A second frame of about 3,000 elements follows, forced from script. The wires' drawing measures every anchor (`measureLayoutExtents` → `withTransformReset`, `layout-measure.ts:111`), and that reaches into the skipped cards. The arrival's tick does the same each frame through `frameRect` (`controller.ts`), which also goes through `withTransformReset`.

**The cards that enter the window late.** Under Skipped, one or two frames in the motion restyle 1,000 to 4,300 elements outside the look's change. They are the cards the camera brings near, arriving together rather than a few at a time, and on the heavy subject at full speed they fall in the second long frame above. In the strips ([crossing, Skipped, full](../../Screenshots/arrival-pull-back/unseen-cards/crossing-skipped--full--heavy--strip.png)) no card shows unstyled or jumps: a skipped card's box keeps its size, and its contents are drawn in the frame it is styled in. The gap that remains is the 577 ms between the sixth and seventh frames, where the Drawn strip had 749.

### The floor: Skipped, with neither forced restyle in the motion

This was a probe build only, not landed. Behind a flag set by the probe, two things were taken out of the motion:

- the legend did not ask the cells at the look's change;
- the wires were not drawn while the camera moved, only once it rested.

| Journey | Condition | Drawn, floor | Skipped, floor |
| --- | --- | --- | --- |
| crossing, heavy | full | 400–417 ms, 7,460 | 300–400 ms, 4,597 (the look's own pass, 3,734 elements, 173–231 ms of style) |
| crossing, heavy | weak | 2,300 ms | 1,067–1,567 ms |
| wheel, heavy | full | 483–533 ms | 250–267 ms |
| wheel, heavy | weak | 1,900 ms | 1,417 ms |

**The floor is still hundreds of milliseconds.** What is left in the frame is the look's own style pass over what stands in view at the crossing, about 3,700 elements in 173 to 231 ms, which is about 50 µs an element at full speed. Paint adds 50 to 70 ms. Neither forced restyle adds cost of its own: each forces earlier a restyle the frame would make anyway, and with them gone the frame makes it itself (Drawn 400–417 ms with the floor, 417–433 ms without it in the first round).

- **The legend's query** (`watchLocalKinds` → `checkVisibility` over every closed directory's cell, `spatial-legend.ts:130`) is safe to remove for real. What it shows could be read from the map's own state, the look and the kinds of the cells drawn. But it buys no frame time.
- **The wires' anchors** would cost a rework of the router's input to do honestly: anchors from the layout's own numbers, the cards' places and each row's offset in its card, which the branch renderer already holds, in place of the page's boxes. That buys nothing while every card in view is restyled anyway. It matters only once the look's change itself is cheap.

### Item 5: the restyle inside Look Before's ease

On the weak machine, Look Before restyled 666 elements (`pathfind.ts`) and 1,621 (heavy) in one frame of its ease. The trace says it is forced from script by the arrival's own tick: `beginArrival`'s `tick` calls `frameRect()` every frame (`controller.ts`), which resets the map layer's transform to read its box (`withTransformReset`), forcing whatever style is owed at that moment.

The forcing site is certain. What it was owed, I take to be the prose's hiding (`updatePresentation(false)`, scheduled a frame after the look is changed): 665 elements is the prose and row parts of `pathfind.ts`'s cards. That attribution is unconfirmed. Two ways to confirm it or rule it out: read `frameRect` once when the ease begins, rather than every frame; or write the prose's state in the same frame as the look.

### My recommendation

**The cause is the cost of each element's style, not their number alone.**

- The cards carry dozens of custom properties inherited from the map (`--text-scale`, `--control-scale`, `--look-*`, every held scale) and formulas over them. A look's change computes all of it again for every element under the map.
- Skipping the unseen cards halves the stall on this repository's heaviest neighbourhood and does not end it. The camera crosses the edge where much of the picture is already in view.
- The per-card look I estimated before (about 150 rules re-keyed, the cross-fade made per card, the wires drawn between looks) would buy the same half, without containment's faults but at a far larger cost. I no longer recommend it.

What I would do first is the look-change freeze round's own second option, **cheaper elements**:

1. Measure the style cost of one card at the change, by its custom properties and `calc()`s. Chromium's selector statistics and a card with its properties removed one by one would show which dominate.
2. Move the held sizes from inherited custom properties to a few container-level values read by the few elements that draw text, so that a look's change restyles names and dots rather than every element of every card.

The aim is the same 7,460-element pass at a fifth of its cost. Combined with Skipped, or without it, that is the route to the owner's arrival without a stall. It is a measurement before a design, and I have not started it.

### Every run of the second round

TN is *Reading, Then Neighbours*. "Look change" gives the frame of the look's change and the next one, each with the elements restyled. "Other frames" gives the most restyled in any other frame of the motion, and how many such frames restyled over 200.

| Run | Subject | # | Ease (ms) | Frames | Median | 90th | Worst (ms) | Worst at (scale) | Look change: frame (ms), elements restyled | Other frames: most restyled in one, frames restyling over 200 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| after-skipped--full | pathfind | 1 | 850 | 42 | 16.7 | 16.7 | 166.6 | 0.335 | 166.6 ms, 3366; 33.3 ms, 177 | 0, 0 |
| after-skipped--full | heavy | 1 | 700 | 39 | 16.7 | 16.8 | 33.4 |  | 416.7 ms, 7866; 33.3 ms, 290 | 0, 0 |
| after-skipped--weak | pathfind | 1 | 750 | 22 | 33.3 | 50 | 66.7 | 0.335 | 683.2 ms, 3368; 266.7 ms, 1226 | 8, 0 |
| after-skipped--weak | heavy | 1 | 2400 | 13 | 50 | 116.6 | 1733.3 | 0.335 | 1733.3 ms, 7871; 283.3 ms, 2083 | 13, 0 |
| before-drawn--weak | pathfind | 1 | 483 | 9 | 50 | 150 | 150 | 0.819 | 616.7 ms, 3248; 133.3 ms, 1222 | 666, 1 |
| before-drawn--weak | heavy | 1 | 783 | 3 | 116.6 | 566.7 | 566.7 | 1 | 1599.9 ms, 7462; 283.3 ms, 2709 | 1621, 1 |
| before-skipped--full | pathfind | 1 | 700 | 41 | 16.7 | 16.7 | 33.4 |  | 116.7 ms, 3246; 33.3 ms, 178 | 665, 1 |
| before-skipped--full | heavy | 1 | 717 | 23 | 33.3 | 33.4 | 133.4 | 1 | 166.7 ms, 3741; 216.6 ms, 3883 | 2767, 1 |
| before-skipped--weak | pathfind | 1 | 850 | 11 | 49.9 | 150.1 | 233.3 | 1 | 666.6 ms, 3248; 216.7 ms, 1224 | 670, 2 |
| before-skipped--weak | heavy | 1 | 917 | 3 | 216.6 | 500 | 500 | 1 | 883.2 ms, 3884; 916.7 ms, 3886 | 3267, 2 |
| crossing-drawn--full | estate | 1 | 750 | 14 | 33.4 | 149.9 | 166.7 | 0.598 | 149.9 ms, 759; 16.7 ms, 2 | 322, 2 |
| crossing-drawn--full | estate | 2 | 817 | 17 | 33.3 | 116.7 | 133.3 | 0.771 | 133.3 ms, 699; 33.3 ms, 26 | 333, 1 |
| crossing-drawn--full | pathfind | 1 | 900 | 11 | 50 | 100 | 433.3 | 0.502 | 433.3 ms, 3409; 100 ms, 242 | 59, 0 |
| crossing-drawn--full | pathfind | 2 | 883 | 12 | 33.4 | 116.7 | 416.6 | 0.537 | 416.6 ms, 3305; 116.7 ms, 242 | 1, 0 |
| crossing-drawn--full | heavy | 1 | 1550 | 10 | 49.9 | 1016.7 | 1016.7 | 0.537 | 1016.7 ms, 7850; 183.3 ms, 2810 | 0, 0 |
| crossing-drawn--full | heavy | 2 | 1567 | 11 | 50 | 233.3 | 950.1 | 0.473 | 950.1 ms, 7571; 233.3 ms, 427 | 0, 0 |
| crossing-drawn--weak | estate | 1 | 1100 | 15 | 33.3 | 183.3 | 466.7 | 0.661 | 466.7 ms, 699; 183.3 ms, 266 | 19, 0 |
| crossing-drawn--weak | pathfind | 1 | 2783 | 9 | 66.7 | 1583.2 | 1583.2 | 0.473 | 1583.2 ms, 3469; 816.6 ms, 1287 | 9, 0 |
| crossing-drawn--weak | heavy | 1 | 3200 | 5 | 166.6 | 1999.9 | 1999.9 | 0.502 | 1999.9 ms, 7460; 866.7 ms, 2926 | 6, 0 |
| crossing-skipped--full | estate | 1 | 700 | 35 | 16.7 | 33.3 | 50 |  | 50 ms, 699 | 378, 1 |
| crossing-skipped--full | estate | 2 | 700 | 38 | 16.7 | 33.3 | 33.4 |  | 33.3 ms, 624; 16.7 ms, 75 | 334, 1 |
| crossing-skipped--full | pathfind | 1 | 950 | 24 | 16.7 | 150.1 | 233.3 | 0.342 | 200.1 ms, 3409; 33.3 ms, 120 | 1337, 2 |
| crossing-skipped--full | pathfind | 2 | 917 | 24 | 16.7 | 166.8 | 200 | 0.335 | 166.8 ms, 3246; 33.3 ms, 120 | 1164, 2 |
| crossing-skipped--full | heavy | 1 | 1100 | 23 | 16.7 | 233.3 | 266.7 | 0.537 | 266.7 ms, 4757; 233.3 ms, 3001 | 3825, 1 |
| crossing-skipped--full | heavy | 2 | 1117 | 22 | 16.7 | 250.1 | 266.7 | 0.579 | 266.7 ms, 4597; 266.6 ms, 3001 | 3597, 1 |
| crossing-skipped--weak | estate | 1 | 783 | 20 | 16.7 | 100 | 233.2 | 0.811 | 233.2 ms, 703; 83.4 ms, 260 | 8, 0 |
| crossing-skipped--weak | pathfind | 1 | 1667 | 12 | 33.4 | 433.2 | 883.4 | 0.537 | 883.4 ms, 3468; 433.2 ms, 1289 | 5, 0 |
| crossing-skipped--weak | heavy | 1 | 2167 | 9 | 33.4 | 966.5 | 966.5 | 0.335 | 883.4 ms, 3957; 966.5 ms, 3908 | 4, 0 |
| wheel-drawn--full | heavy | 1 | 2417 | 60 | 16.7 | 83.3 | 550 | 0.587 | 550 ms, 7460; 83.3 ms, 212 | 2596, 4 |
| wheel-drawn--full | heavy | 2 | 2383 | 54 | 16.8 | 50.1 | 599.9 | 0.589 | 599.9 ms, 7739; 83.3 ms, 213 | 2886, 3 |
| wheel-drawn--weak | heavy | 1 | 6183 | 32 | 83.3 | 250.1 | 2333.3 | 0.577 | 2333.3 ms, 7461; 500 ms, 216 | 4007, 2 |
| wheel-skipped--full | heavy | 1 | 1983 | 52 | 16.8 | 50.1 | 216.7 | 0.566 | 216.7 ms, 4697; 200 ms, 2957 | 2959, 5 |
| wheel-skipped--full | heavy | 2 | 2000 | 59 | 16.7 | 50 | 250 | 0.58 | 250 ms, 4697; 216.6 ms, 2957 | 3415, 4 |
| wheel-skipped--weak | heavy | 1 | 4833 | 28 | 99.9 | 633.3 | 1033.3 | 0.58 | 1033.3 ms, 4807; 833.3 ms, 3015 | 3602, 3 |

The floor's runs (probe build, not landed):

| Run | Subject | # | Ease (ms) | Frames | Median | 90th | Worst (ms) | Worst at (scale) | Look change: frame (ms), elements restyled | Other frames: most restyled in one, frames restyling over 200 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| floor-crossing-drawn--full | pathfind | 1 | 867 | 24 | 16.7 | 133.3 | 233.3 | 0.362 | 150.1 ms, 3246 | 1313, 1 |
| floor-crossing-drawn--full | pathfind | 2 | 900 | 24 | 16.7 | 166.6 | 200 | 0.355 | 166.6 ms, 3246 | 1313, 1 |
| floor-crossing-drawn--full | heavy | 1 | 917 | 20 | 16.7 | 183.3 | 400 | 0.579 | 400 ms, 7460; 183.3 ms, 2602 | 111, 0 |
| floor-crossing-drawn--full | heavy | 2 | 917 | 18 | 16.7 | 166.7 | 416.6 | 0.578 | 416.6 ms, 7460; 166.7 ms, 2602 | 111, 0 |
| floor-crossing-drawn--weak | pathfind | 1 | 1533 | 12 | 33.4 | 400 | 800 | 0.579 | 800 ms, 3305; 400 ms, 1174 | 2, 0 |
| floor-crossing-drawn--weak | heavy | 1 | 3083 | 4 | 500 | 2299.9 | 2299.9 | 0.473 | 2299.9 ms, 7460; 500 ms, 2714 | 11, 0 |
| floor-crossing-skipped--full | pathfind | 1 | 967 | 22 | 16.7 | 166.7 | 233.3 | 0.342 | 200 ms, 3246 | 1044, 2 |
| floor-crossing-skipped--full | pathfind | 2 | 967 | 22 | 16.7 | 166.5 | 250 | 0.335 | 183.2 ms, 3246 | 1645, 1 |
| floor-crossing-skipped--full | heavy | 1 | 1017 | 12 | 33.3 | 333.4 | 399.9 | 0.537 | 399.9 ms, 4597; 333.4 ms, 4452 | 121, 0 |
| floor-crossing-skipped--full | heavy | 2 | 967 | 19 | 16.7 | 300.1 | 333.2 | 0.335 | 300.1 ms, 4597; 50 ms, 220 | 4307, 1 |
| floor-crossing-skipped--weak | pathfind | 1 | 2300 | 12 | 33.4 | 949.9 | 966.6 | 0.335 | 949.9 ms, 3305; 966.6 ms, 1175 | 5, 0 |
| floor-crossing-skipped--weak | heavy | 1 | 3033 | 3 | 1066.6 | 1566.6 | 1566.6 | 0.335 | 1066.6 ms, 3743; 1566.6 ms, 3909 | 3214, 1 |
| floor-wheel-drawn--full | heavy | 1 | 2383 | 53 | 16.7 | 83.3 | 483.4 | 0.582 | 483.4 ms, 7460 | 2384, 5 |
| floor-wheel-drawn--full | heavy | 2 | 2283 | 54 | 33.3 | 50 | 533.3 | 0.587 | 533.3 ms, 7460 | 2384, 5 |
| floor-wheel-drawn--weak | heavy | 1 | 5066 | 34 | 66.6 | 216.6 | 1900 | 0.574 | 1900 ms, 7460 | 2801, 3 |
| floor-wheel-skipped--full | heavy | 1 | 2117 | 54 | 33.3 | 83.2 | 266.7 | 0.585 | 266.7 ms, 4735; 33.3 ms, 48 | 2167, 10 |
| floor-wheel-skipped--full | heavy | 2 | 1900 | 57 | 16.7 | 66.7 | 250 | 0.58 | 250 ms, 4697; 50 ms, 49 | 1593, 8 |
| floor-wheel-skipped--weak | heavy | 1 | 6367 | 27 | 116.7 | 949.9 | 1416.6 | 0.549 | 1200 ms, 4676; 1416.6 ms, 3016 | 3425, 3 |

The second round's files: [`stills-probe.mjs`](stills-probe.mjs) (the stills compared), [`where.cjs`](where.cjs) (a trace's bundle positions mapped to the source through the source map), [`summarize2.mjs`](summarize2.mjs) (the tables above), [`unseen-cards.patch`](unseen-cards.patch) (the lever, not landed), [`numbers/unseen-cards/`](numbers/unseen-cards/) (every run and the stills' counts), and the strips and stills under [`Screenshots/arrival-pull-back/unseen-cards/`](../../Screenshots/arrival-pull-back/unseen-cards/). [`arrival-probe.mjs`](arrival-probe.mjs) now also takes a wheel journey (`JOURNEY=wheel`), every frame's restyle, each style pass's cause, and the floor's flag (`FLOOR=1`).

## 6. Third round: where a look change's style time goes

_Taken 20:13 to 21:10 UTC the same evening on the day branch at `8f88d9590`, merged into the builder's worktree. The load average is stated beside each group of times; the counts of elements do not depend on it._

This round looked into the cost of each element's style when the zoom look changes. The heavy subject is `liveDocumentationConfig.ts`: 12,040 elements under the map at reading size, of which the look change restyles 6,474. The probes are kept beside this record:

- [`style-probe.mjs`](style-probe.mjs) snapshots every computed property of every element at rest in each look.
- [`cost-probe.mjs`](cost-probe.mjs) makes one change on the map at rest, flushes the style, and times the browser's own style pass, five times.
- [`waste-probe.mjs`](waste-probe.mjs) snapshots before and after each change made in place.

Their numbers are in [`numbers/look-style/`](numbers/look-style/).

### A hypothesis, measured and refuted

**The hypothesis (root's).** A custom property changed on the map is inherited by every element under it. So the held sizes the look writes there (`--text-scale`, `--control-scale` and the fade's `--look-*`) would make every element recompute, whether or not it reads them. If that were the cost, the remedy would be to register them as not inherited and set them only where they are read.

**The mechanism is real.** Measured in place (`cost-probe`, at rest, the browser's style pass; load 2.6, median of five):

| Case | Change made on the map | Elements restyled | Time |
| --- | --- | ---: | ---: |
| A | a custom property no rule reads | 7,348 | 118 ms |
| A′ | the same property registered `inherits: false` | 1 | 0.1 ms |
| C | the held scales alone, to the connections look's 2.2 | 7,348 | 70 ms |
| D | the look's attributes alone (`data-lod`, `data-look`, `data-step`) | 6,474 | 143 ms |
| B | the whole look change, attributes and held scales | 6,474 | 144 ms |
| E | a data attribute no rule reads | 0 | 0 ms |

**But it is not where the look change's time goes.** The attributes alone (D) restyle the same 6,474 elements in the same time as the whole change (B).

The in-place snapshots (`waste-probe`) say why: of the 6,474 elements the whole change restyles, **5,909 genuinely change a computed value**. Only 565 (9 %) are restyled for nothing.

- **The attributes alone** change 5,649 elements; the held scales add 923 more, nearly all `transform` on dots, names and row actions.
- **By property, the changes are:** visibility on 2,168, display on 1,134, transition-delay on 1,211, transform-origin and perspective-origin (which follow a box's size) on about 3,000, and positions, insets and minimum sizes on 500 to 700 each.
- **By element, they are:**
  - the closed directories' cells: `svg` and `path` 585 each, `circle.local-cell` 365, `button.local-directory-cell` 328;
  - the rows' parts: reading blocks, names and pins 273 each, anchors 198 to 300, read buttons 193;
  - the prose: `wbr` 272, `p` 172, prose blocks 163, `code` 110.

So moving the held scales to non-inherited properties would save at most the 9 % restyled for nothing. **Not built.** An earlier comparison of two rest states, made before the in-place one, had counted 4,463 elements (37 %) differing only in custom properties. Inside the change's own pass those are restyled by the attributes anyway, so that count does not apply.

**Selector matching is a small share.** Chromium's selector statistics (trace category `disabled-by-default-blink.debug`) gave 110 ms of matching in total across the change's style passes. The pass was 4.1 s long, because that instrument slows it about twentyfold; it was used only for this share. The invalidation tracking named the causes:

- "Related style rule" 3,519;
- "Attribute" 1,446;
- invalidation sets matched by class 1,545 and by tag 1,439;
- the fade's "Animation" 649 to 1,284.

### The upper bound of hiding two subtree kinds at their roots

The two largest groups of elements that change are the closed directories' cell fields and the prose. In this probe each was hidden at its roots before the look change (`content-visibility: hidden`, which leaves the subtree's style uncomputed), and the look change then timed:

| Subject, condition (load) | Whole change (B) | Cells skipped (F) | Prose skipped (G) | Both (H) |
| --- | --- | --- | --- | --- |
| heavy, full (5.3) | 6,474, 163 ms | 6,131, 173 ms | 5,984, 189 ms | 5,641, 147 ms |
| heavy, weak (4.3) | 6,474, 900 ms | 6,131, 1,145 ms | 5,984, 814 ms | 5,641, 828 ms |
| `pathfind.ts`, full (6.2) | 2,592, 132 ms | 2,327, 84 ms | 2,364, 90 ms | 2,099, 107 ms |
| `pathfind.ts`, weak (4.6) | 2,592, 323 ms | 2,327, 352 ms | 2,364, 344 ms | 2,099, 374 ms |

The roots were 30 cell fields and 546 prose blocks on the heavy subject, and 22 and 314 on `pathfind.ts`. **Both skipped remove 13 % of the elements on the heavy subject and 19 % on `pathfind.ts`**, and no time that rises above the load's noise. The 30 to 45 % I estimated before measuring does not hold: most of the cells' and the prose's changes are on their roots and first children, not deep in their subtrees.

### The structural floor

Of the 5,909 elements whose values change on the heavy subject, **1,848 are topmost**: no element above them up to the map changes. On `pathfind.ts` it is 944 of 3,158. The count is the same within each card or band. If every part that belongs to one look sat under one root of its own, and a look change swapped those roots, this is about how many elements a change would touch: **29 % of today's pass on the heavy subject, 36 % on `pathfind.ts`.**

The topmost kinds are mostly per row: its anchor (300), its reading block (273), its name (193), its read and pin buttons (193 each), its More (30); and per card: its actions, its path, its directory line, its name, its type references, its meta line and its tests (60 to 86 each).

So the honest design would be the second kind: *each look's parts under a root of their own*, the next look's subtree styled while the picture rests and swapped at its root. It is not *hide two subtree kinds at their roots*. It would bring the pass to about a third.

What would have to stay equal for the stills:

- **Box sizes.** Each look's subtree would have to give its card the same box in each look, since a card's box never changes with zoom.
- **The 160 ms cross-fade.** It would have to run between two subtrees, not between two sizes of one, so the held things that travel from one look's size to the next would become a cross-fade of two elements.
- **The wires' anchors.** The dots on the rows' edges stand inside the per-look parts, so they would have to stand in the same place in both subtrees, or sit outside them.

It is a design, not a refactor, and it was not started.

### The two small changes

1. **The legend's question to the cells, moved after the frame: tried, and not landed** (`spatial-legend.ts`, `watchLocalKinds`).
   - It is asked in the change's animation callbacks, which force the whole map's restyle from inside the legend's script, before the frame would have made it.
   - Asked instead after the frame had been styled (a timer from the animation callback), no style pass was forced from the legend in the trace, and the time was unchanged, as section 5's floor said: the restyle is owed anyway.
   - But the answer changed. In `spatial-legend.spec.ts` ("the Local Map shows the matching legend"), a press of 2D from the estate's 3D map then drew a kinds row, "Implementation", where the case expects none. Asked later, the legend found a coloured cell visible in a picture the earlier moment had not yet shown it in, and no later change asked it again.
   - So its moment is part of its answer, and moving it is not the equivalent change it looked like. It is reverted.
   - I did not try deriving the answer from the map's own state. That would copy the stylesheet's rules on which cells show in which look into script, where the two could drift apart, and it buys no frame time.
2. **`frameRect` read once per ease: tried, and not landed.**
   - Reading the frame once removed the forcing from the arrival's tick. The same restyle of 665 to 784 elements was then forced one call later, by `framePlace` in `updateMapTransform`.
   - What was owed was traced with invalidation tracking:
     - the end of the look's cross-fade, 200 ms after the change: its class removed, which re-matches its rules on the closed directories' cell buttons (226), the rows' pins, Mores, read buttons and names (49 to 55 each), and the reading blocks (51);
     - its redrawing of the wires (104 path attributes).
   - On the slowed machine Look Before's lead had seen the class gone inside the change's own long frame, and began the ease before that restyle had been drawn.
   - **The mend that landed instead:** Look Before now waits one frame after the first frame without the class, so that the restyle is the browser's own in that frame. Its result is below.

**Look Before's ease after the mend**, on two slowed cores in software (load 6.1):

- **`pathfind.ts`:** 14 frames in the ease (median 50 ms, worst 183 ms at its last frame), where the first round had 3 frames in 483 ms. No style pass inside the ease restyles more than a handful of elements.
- **The heavy subject:** 8 frames (median 133 ms, worst 333 ms at its last frame), where the first round had 1 to 3.

The browser specs of the camera, Tuning and navigation pass with it.

## Recommendation for the next day's piece

Measure before designing, once more. Take a prototype of *each look's parts under a root of their own* on one card's markup, outside the stylesheet, and compare a swap of roots with today's attributes on the same card. The structural floor says about a third of today's pass; the prototype would say whether that third holds once the cross-fade and the anchors are kept, and what the stills would need.

If it holds, it is the route to the owner's arrival without a stall: the next look's parts styled while the picture rests for 900 ms at reading size, and swapped at the crossing.

If it does not, what is left is the stylesheet's weight per element. In that case the arrival should keep a look change at rest, as Look After does, and the owner should be told plainly that a pull-back on a picture of this size stutters once on a slow machine.
