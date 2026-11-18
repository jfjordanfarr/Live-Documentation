# Tone and hierarchy on the 2D map: milestone 1

_Historical: a builder's evidence for the root's review and the owner's eye, taken 2026-11-15. The round is explained in [Turn 1 of the November 15 record](../../../ChatHistory/2026/11/2026-11-15.1.record.md#turn-1); the design as it stands is in [the Explorer design](../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md)._

Milestone 1 changes tone only: no font size, line height, weight or box. Inside a card the file's name, a symbol's name and the prose are three tones where they were one grey. No wire glows, and a wire is drawn one way, 0.7 opaque as it always was: a hover fades the others and boosts nothing. An opened directory's outline can be seen, a step under a card's border. The legend's samples are drawn as the marks they name. Milestone 2 (rows drawn as faint bars at the overview, and names not broken inside words there) is not in these pictures: at seven presses out a card is still a name over a blank box.

The round's first form drew a wire at rest at half strength and a lit wire whole with the glow, and its outline was `#45454e`. The root compared resting strengths on that build and corrected it the same day: the bloom of a bundle was the glow and not the opacity, and lighting a wire broke the owner's rule to fade the irrelevant rather than boost the relevant. The `after/` pictures and the pairs here are of the corrected build; the first form's pictures were replaced.

## How they were taken

A fresh visitor's defaults (three zoom looks, Flow, the continuing search on and waited for) in headless Chromium at 1440 by 900, device pixel ratio 1, the pointer parked on the toolbar. `before/` is a build of `cb53d7c7`, `after/` this round's branch at `c8c9ee6e`. Each has `fallback/`, this container's font (DejaVu Sans, with its own line metrics), and `segoe/`, the same glyphs under Segoe UI's line metrics, by the font faces `tests/e2e/zoom-looks.spec.ts` injects. The two metrics differ where the browser sizes a line (the reading look) and hardly at all in the far looks, whose lines the stylesheet states. Tone does not depend on the metrics; both are here because a fit could have.

Links, for either build: `branch-renderer.ts` is `/?view=local&node=packages/explorer/src/client/views/localView/branch-renderer.ts`; `localView` opened is `/?s=N4IgbiBcDMA0IBMoG0QAcCGBjA1hg5gKYDOA9IQB5oA2A9gE6H2nH1albUCWhAdgC6kwPAO5k6WDNQBqokAF0AvkA` and `client` opened `/?s=N4IgbiBcDMA0IBMoG0QAcCGBjA1hg5gKYDOA9IQB5oA2A9gE6H2nH1albUCWhAdgC4gAugF8gA`, each then Fit; the estate's payment service is `/samples/estate/?view=local&node=PaymentService/PaymentService.cs`.

## Before and after, side by side (`pairs/`)

Crops at one pixel to one, before on the left or above, after on the right or below, a magenta rule between. `-fallback` and `-segoe` name the metrics.

| Picture | What it shows |
| --- | --- |
| `card-arrival-*.png` | `branch-renderer.ts`'s card at arrival. Before, the name, the Purpose, each symbol's name and each description are one grey and the descriptions are the larger type. After, the names lead and the prose recedes. |
| `wires-out3-*.png` | The same subject three presses out, the connections look. Before, the fan into Internals blooms and is the brightest thing in the picture. After, the same wires at the same opacity without their glow: the fan is a fan of lines, and the names stand over it. |
| `row-hovered-*.png` | At arrival with the row `renderBranches` hovered. Before, its wires are drawn at 1 with a glow, above a wire at rest. After, they are drawn as a wire at rest and the others are faded. |
| `localView-fit-*.png` | `packages/explorer/src/client/views/localView` opened, after Fit (the overview look), before above after. The lines no longer glow, the names are brighter, and the directory's outline can be seen at the picture's edge. |
| `client-fit-*.png` | `packages/explorer/src/client` opened, after Fit (the connections look), before above after. |
| `client-card-hovered-*.png` | The same with the card `types.ts` hovered in Flow: its lines keep their look and the rest fade, as before; only the glow is gone. |
| `estate-out3-*.png` | The estate sample's `PaymentService/PaymentService.cs` three presses out: the sparse picture. The chain reads at once without the glow, and the two directories' outlines can be seen, quieter than the cards' borders. |
| `nested-out5-*.png` | `branch-renderer.ts` five presses out, the card's right edge and the nested directories' outlines beside it, at twice their size. Before, the outlines cannot be seen. After, three faint rules a few pixels apart, under the card's border in strength. |
| `legend-3x.png` | The 2D legend at three device pixels to one. Before, the wire samples are another blue and green than a wire's and glow, the dots are 10 px, and the test-backed sample is a gold glow. After, each is the mark as the picture draws it. |

## The whole frames (`before/` and `after/`, each with `fallback/` and `segoe/`)

| Picture | What it shows |
| --- | --- |
| `branch-renderer-arrival.png` | `branch-renderer.ts` alone, at arrival (the reading look). |
| `branch-renderer-row-hovered.png` | The same with the row `renderBranches` hovered. |
| `branch-renderer-out3.png` | Three presses of Zoom Out (the connections look). |
| `branch-renderer-out5.png` | Five presses, where the nested directories' outlines stand beside the card. |
| `branch-renderer-out7.png` | Seven presses (the overview look): the blank boxes milestone 2 is to answer. |
| `localView-opened-fit.png` | `localView` opened, after Fit. |
| `client-opened-fit.png` | `client` opened, after Fit. |
| `client-opened-card-hovered.png` | The same with `types.ts` hovered. |
| `estate-payment-arrival.png` | The estate's payment service at arrival. |
| `estate-payment-out3.png` | Three presses out. |
| `legend.png` | The legend at one pixel to one. `legend-3x.png`, beside the folders, is the same at three. |

## Measured

**Contrast**, by `tests/e2e/contrast.ts`, against a card's `#232326` and, in brackets, a hovered card's `#2f2f33`: the file's name `#f2f2f2` 14.00 to 1 (11.91); a symbol's name `#ededed` 13.39 (11.39); the prose `#b0b0b0` 7.23 (6.15). Before, all three were `#cccccc`, 9.76 (8.30). An opened directory's outline against the map's `#1e1e1e`: `#3d3d45` 1.55 to 1, before `#2f2f34` 1.25; a card's border, `#3f3f46`, is 1.60.

**What removing the glow buys.** `/?view=local&node=packages/explorer/src/client/types.ts` (373 wires drawn, 263 of them with a glow on the build before and none after), by the method of [the November 6 frame-cost probe](../../../Probes/2026-11-06/frame-cost/README.md)'s `zoom-perf.cjs` and `zoom-perf-wheel.cjs`: Chromium's performance metrics and the animation-frame intervals over the 1.2 s after a move, three moves in a row, the default tuning with the continuing search off, headless at 1440 by 960. Those scripts load their modules from the working directory's own `node_modules`, which a worktree has not, so their method was run from a copy with ordinary imports and one variant. Two passes, the builds in opposite order; the machine's one-minute load was 6.3 and 3.9 at the start and end of the first pass and 5.1 and 9.2 for the second, two other builders at work. `frame-cost-pass1.json` and `frame-cost-pass2.json` are the output.

| Move | Build | Frames in 1.2 s | Longest frame, ms | Main-thread task time, s |
| --- | --- | --- | --- | --- |
| Wheel zoom out, first | before | 36, 41 | 450, 550 | 2.56, 3.81 |
| | after | 74, 54 | 17, 67 | 0.43, 0.66 |
| Wheel zoom out, second | before | 12, 9 | 617, 1217 | 6.85, 9.00 |
| | after | 16, 12 | 333, 500 | 0.77, 1.18 |
| Wheel zoom out, third | before | 20, 21 | 967, 1150 | 6.03, 7.39 |
| | after | 67, 47 | 83, 117 | 0.77, 1.09 |
| Zoom Out press, first | before | 54, 51 | 233, 250 | 0.46, 0.50 |
| | after | 69, 66 | 100, 133 | 0.24, 0.25 |
| Zoom Out press, second | before | 72, 70 | 33, 50 | 0.11, 0.15 |
| | after | 73, 71 | 33, 33 | 0.12, 0.15 |
| Zoom Out press, third (the change to the connections look) | before | 14, 11 | 483, 867 | 1.19, 1.70 |
| | after | 32, 12 | 433, 800 | 0.84, 1.54 |

Each cell is the first pass, then the second. A wheel zoom, the move a person makes and the one that redraws the wires at every frame, cost the main thread a sixth to a ninth of what it did, and its longest frame fell from between 0.45 and 1.2 s to between 17 and 120 ms, except in the second wheel zoom on the build after, 333 and 500 ms. The two builds report the change to the connections look one move apart, the build before by the end of the second wheel zoom and the build after by the end of the third, under the same wheel input; the wheel check at the foot of this page found the scale and the look the same on both once each move has settled, so this is the look read at the end of a window the slow build overruns, and the second and third rows compare the same moves read at slightly different moments. A press that changes no look gains on its first frame only; the press that changes the look is the look's own cost, a restyle of every card, and the glow was a small part of it. This is a software renderer on a loaded machine: the ratios are the finding, not the milliseconds.

`red-run-cb53d7c7.txt` is the new spec, `tests/e2e/local-map-tone.spec.ts`, run against the build before: its five cases fail, and the file lists what each expected and found.

## What the builder's eye still finds wrong

- Where many wires lie over one another (the fan into Internals in `wires-out3`) the bundle is still the densest thing on the picture, since their strengths add; without the glow it is a fan of lines and the names beat it, but it is not quiet.
- Nested directories' outlines a few pixels apart (`nested-out5`) read as a ruled margin rather than as three regions; each can now be seen, and nothing says which is which until its label is in view.
- The legend's wire samples, true to a wire, are thin beside the dots and the test-backed card.
- The path under a file's name (`#888888`, 10 px) is 4.42 to 1 on the card, under the 4.5 the small-text rule asks; it was so before and the brief left it as it is.

# Milestone 2: rows as bars when zoomed out fully, beside files only

_Historical, as above: evidence of 2026-11-15 for a comparison the owner is to make. One of the two answers is to be deleted after their look._

The owner's report of November 13 was that zoomed out fully a card is a name over a tall blank box. "Zoomed Out Fully → Files only" (November 13, a Tuning choice) answers it by collapsing each card to its name and laying the picture out again. This milestone builds the other answer for a fair comparison: every card keeps its box, and each row it no longer draws is a faint bar where the row's name stood, as long as the name; with it, a file's name at this look is held smaller, down to the connections look's size, where that keeps a word whole.

## The three, matched (`overview/`)

Each subject at the seventh Zoom Out press, a fresh visitor's defaults but for the one choice, 1440 by 900, under both line metrics (`fallback/`, `segoe/`).

| Folder | What it is |
| --- | --- |
| `overview/keep/` | Cards keeping their size as today: the build of `b956e179`. |
| `overview/bars/` | The same with bars and the fitted name: this milestone's build, the default. |
| `overview/files/` | Files only, on this milestone's build, chosen in Tuning. |
| `overview/matched/` | The three side by side, keep then bars then files only, a magenta rule between: the map's whole area as `<subject>-<metrics>.png` (three frames wide, to be opened at full size), and a crop at one pixel to one as `detail-<subject>-<metrics>.png`. |

The subjects: `pinned-branch-renderer-out7` (`branch-renderer.ts` pinned), `pinned-types-out7` (`packages/explorer/src/client/types.ts` pinned, the crowded one), `client-opened-out7` (`packages/explorer/src/client` opened). `overview/bars/*/symbol-pinned-out7.png`, and `matched/symbol-pinned-<metrics>-3x.png` at three times its size, is `branch-renderer.ts` with its symbol `renderBranches` pinned by name: that row drawn in full among the bars.

## What the builder's eye prefers, picture by picture

- **`branch-renderer.ts` pinned: files only.** With bars the cards stop being blank, and a glance says which file is long and which short; but the picture is still as tall as its rows, so three of its cards run off the frame, where files only has the whole neighbourhood and every wire's two ends in half the frame. The bars are the better answer to "the box is empty"; files only is the better picture.
- **`types.ts` pinned: files only, more clearly.** `types.ts` with bars is a ladder of twenty-odd bars running off the bottom of the frame, with its wires leaving from a hub halfway down; files only shows the hub and its whole fan at once. What the bars alone say here is that `types.ts` is far larger than its neighbours, which files only does not say at all.
- **`client` opened: files only; the bars change nothing here.** An opened directory's members are Flow's compact cards, which lay out no rows, so there is nothing to draw a bar for: the bars' frame differs from today's only in its names, `markdown.test.ts` and `download.ts` whole at a smaller size where today's breaks them as "markdow/n.tes…" and "downloa/d.ts". Files only gives each name the lines it needs ("detail/Panel.ts", "layout-presets./test.ts" whole) where the other two cut them.

## What still looks wrong with the bars

- A card with a long name and one or two rows is still a name over an empty box (`membrane-outline.ts`, `card-reading.ts` in the `branch-renderer.ts` frames): the name comes first, and the bars it would cover are not drawn.
- A bar directly under a row pinned by name stands a pixel or two from the pinned row's frame (`symbol-pinned-*-3x.png`).
- Fitting each name by its own widest word puts names of different sizes side by side (`detail-client`: `markdown.test.ts` and `download.ts` beside `errors.ts`).
- At this zoom a bar is two to three pixels tall: it reads as texture, which is its purpose, and at the tenth press it is under two.

## The wheel check

`wheel-scale.json`: the map's scale after each of three wheel zooms out (five 40 px notches 40 ms apart) on `types.ts`, on the build before milestone 1 and a build without the glow, each at the machine's speed and with Chromium's CPU throttled sixfold: 1, 0.7408, 0.5488 and 0.4066 in all four, and the connections look from the second zoom in all four. A wheel's zoom does not depend on the frame rate. The one-move difference in the frame-cost table above was the look read at the end of a 1.2 s window, which a slow build overruns and a fast one does not.

## What was chosen, and a symbol pinned by name under it

Files only was chosen, by the owner's eye and this comparison, and became the default of Tuning → 2D Layout → Zoomed Out Fully the same day; the bars were removed, and the pictures above stay as the evidence for the choice. The fitted name was kept for both choices.

## Files only draws what the person pinned by name (`overview/pinned-symbol/`)

The first build of the default drew nothing for a symbol pinned by name: no row, no wire of its own, and a frame on the card that on the subject's card could not be told from the subject's own border. The root's decision the same day: files only means files and what the person pinned by name, since a pin is the person's own question. Seven presses out, under Segoe UI's line metrics, 1440 by 900; `before/` is the build of `9991c102` and `after/` the build with the pinned rows.

| Picture | What it shows |
| --- | --- |
| `one-symbol-files-before-then-after.png` | `renderBranches` pinned on `branch-renderer.ts`, files only. Before, a compact card and nothing else. After, the row beneath the file's name with its dots, its name whole, and its own wire. |
| `three-symbols-files-before-then-after.png` | `renderBranches` and `BranchStage` on `branch-renderer.ts` and `startOrder` on `branch-restarts.ts`, files only: three rows on two cards, each card grown by its pins and by nothing else. |
| `one-symbol-keep-before-then-after.png`, `three-symbols-keep-before-then-after.png` | The same with "Cards keep their size". Before, the pinned row's name is held at the look's size and cut ("render…"). After, it is brought down in size until it is whole, with its More and its dots: the same rule as under files only. |
| `detail-three-symbols-one-size-3x.png` | The two pinned cards of the three-symbols frame under files only, at three times their size: `renderBranches` and `BranchStage` on one card at one size, the tighter one's (2.3; alone, `BranchStage` would have 2.7), and `startOrder` on the other card at its own (3.2). The frame was retaken after the directory handle's round was merged, so the directories above the cards carry their handles. |
| `detail-whole-file-pin-and-subject-2x.png` | A whole-file pin (`branch-restarts.ts`, at the left) beside the subject's card (`branch-renderer.ts`, at the right) under files only, at twice their size: both are a card in a blue frame, and the eye cannot say which is pinned and which is the subject. |
| `before/`, `after/` | The whole frames: `one-symbol`, `three-symbols` (each `-files` and `-keep`) and `whole-file-out7-files.png`. |
| `red-run-9991c102.txt` | The two new cases of `tests/e2e/overview-files.spec.ts` failing on the build before: no row laid out. The third, the way out and back in, holds on both. |

What the builder's eye still finds wrong: a pinned row's name brought down to stay whole is small beside its file's name (about 8 px on screen for `renderBranches` at the seventh press, where the file's name is about 15); and the whole-file pin's sign, above, which was left as it is.
