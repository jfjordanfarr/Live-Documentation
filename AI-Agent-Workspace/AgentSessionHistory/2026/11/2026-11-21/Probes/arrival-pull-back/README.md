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
