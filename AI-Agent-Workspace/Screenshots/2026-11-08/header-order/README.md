# The card's header ordered: the name leads, the controls follow

_Status: implementation evidence for the root's review and the owner's eye, not a verdict. A builder built the header round (its milestone 3) from the root's brief under the six principles the owner accepted ([the November 7 record, Turn 3](../../../ChatHistory/2026/11/2026-11-07.1.record.md#turn-3), cleared in [Turn 4](../../../ChatHistory/2026/11/2026-11-07.1.record.md#turn-4--november-8)), on top of its milestones 1 (one-line names) and 2 (the switch's cost), uncommitted in its worktree._

The pictures and counts were taken by [`held-names.cjs`](../../../Probes/2026-11-07/one-line-names/held-names.cjs) with `ORDER=1`. "After" is the builder's bundle (port 8911). "Before" is the bundle of milestones 1 and 2 (port 8914), whose header is milestone 1's: the controls in the card's top right corner, the name on one line beside or below them. Both were taken in a private headless Chromium at 1440 × 960, with a fresh profile and the background search off. The camera moved by the Zoom Out button, one step a press.

## What was built

The six principles, as `held-lines.ts` states them and the design document's far-bands paragraph now carries them:

1. **The name leads.** The name starts on the header's first line at every zoom.
2. **Whole before cut, few lines before many.** The name takes the fewest lines that hold it whole, each filled before the next starts. It breaks only at its seams: a hyphen, a dot, a capital, and before a short extension's dot, so that ".ts" can stand beside More under a filled first line. It is cut with an ellipsis only when the header's lines run out.
3. **The controls follow the name at the right edge.** They stand on the name's last line where its text leaves them room, otherwise on the line after. They are never above the name.
4. **A control shares a line only where it fits.** From the far band out, More is held no taller than a line of the name. At the middle band the three controls' line is as tall as they are.
5. **No empty line, nothing shrinks.** When the lines run out, the name is cut beside the controls. Where the controls leave no room even for the ellipsis, they take the line after, and the name keeps its line.
6. **It changes only at a step,** and the box audit holds every rule at every press.

At the reading band this is the browser's own layout. The controls stand in the header after the name, in its focus order. The name's button ends with a room as large as the controls as held at the band's last step: that room shares the name's last line where it fits and wraps to a line of its own where it does not. The controls stand at the header's bottom right.

From the middle band out, the card reading chooses the lines and the controls' place at render for each band and step, and writes them as an attribute and a custom property. The stylesheet draws them as written.

## The counts

Every card's held name at every press, classified four ways:

- whole on one line, sharing it with the controls;
- whole on one line, with the controls alone on the line after;
- whole on two lines or more;
- cut with an ellipsis.

The table also counts the cards whose controls stand above the name's first line or beside a line with more of the name below them ("controls above the name"). Before, that was every card, since the controls stood in the corner.

The names on two lines or more and the cut names are listed as drawn after the change, once each. The JSON files beside the pictures hold every card at every press, before and after.

### `symbolAnchors.ts` pinned alone, the owner's subject

| Press | Band / step | Before: one line, shared | one line, alone | two lines or more | cut | controls above the name | After: one line, shared | one line, alone | two lines or more | cut | controls above the name | After, the names on two lines or more and the cut, as drawn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | reading / 0 | none held | | | | | none held | | | | | |
| 1 | reading / 1 | none held | | | | | none held | | | | | |
| 2 | middle / 2 | 0 | 12 | 0 | 0 | 12 | 12 | 0 | 0 | 0 | 0 |  |
| 3 | middle / 3 | 0 | 12 | 0 | 0 | 12 | 10 | 2 | 0 | 0 | 0 |  |
| 4 | middle / 4 | 0 | 8 | 0 | 4 | 12 | 5 | 7 | 0 | 0 | 0 |  |
| 5 | far / 5 | 0 | 10 | 0 | 2 | 12 | 10 | 0 | 2 | 0 | 0 | `branch-renderer / .ts`, `symbol-highlight / .ts` |
| 6 | far / 6 | 0 | 5 | 0 | 7 | 12 | 5 | 3 | 4 | 0 | 0 | `local-map-corset.spec / .ts`, `branch- / renderer.ts`, `symbol- / highlight.ts`, `symbolAnchors.test / .ts` |
| 7 | overview / 7 | 0 | 5 | 0 | 7 | 12 | 4 | 1 | 7 | 0 | 0 | `local-map-corset. / spec.ts`, `branch- / renderer.ts`, `connections / .ts`, `symbol- / highlight.ts`, `controller / .ts`, `symbolAnchors / .ts`, `symbolAnchors. / test.ts` |
| 8 | overview / 8 | 0 | 4 | 0 | 8 | 12 | 3 | 1 | 6 | 2 | 0 | `local-map- / corset.spec…`, `branch- / renderer / .ts`, `connectio / ns.ts`, `symbol- / highlight / .ts`, `controlle / r.ts`, `symbol / Anchors.ts`, `symbol / Anchors.t…`, `measurer / .ts` |
| 9 | overview / 9 | 0 | 3 | 0 | 9 | 12 | 0 | 3 | 5 | 4 | 0 | `still-picture / .ts`, `local-map- / corset.sp…`, `branch- / rend…`, `connecti / ons.ts`, `symbol- / high…`, `controll / er.ts`, `symbol / Anchors.ts`, `symbol…`, `measurer / .ts` |
| 10 | overview / 10 | 0 | 0 | 0 | 12 | 12 | 0 | 0 | 5 | 7 | 0 | `still-pi…`, `local-m…`, `branches / .ts`, `branch / -re…`, `co…`, `symbol / -hi…`, `contro / lle…`, `symbol / Anchors / .ts`, `pin-state / .ts`, `symb…`, `card-model / .ts`, `measur / er.ts` |

### The box audit's three subjects, at the far and overview bands' first and last steps

`tests/e2e/still-picture.ts` alone:

| Press | Band / step | Before: one line, shared | one line, alone | two lines or more | cut | controls above the name | After: one line, shared | one line, alone | two lines or more | cut | controls above the name | After, the names on two lines or more and the cut, as drawn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | far / 5 | 0 | 15 | 0 | 31 | 46 | 17 | 2 | 26 | 1 | 0 | `local-map-corset.spec / .ts`, `force-graph-discovery. / spec.ts`, `force-graph-reveal. / spec.ts`, `force-graph-focus.spec / .ts`, `explorer-navigation. / spec.ts`, `perspective-zoom.spec / .ts`, `force-graph-wrappers. / spec.ts`, `force-graph-shells. / spec.ts`, `local-map-row-motion. / spec.ts`, `card-ladder-boxes. / spec.ts`, `local-map-overview. / spec.ts`, `local-map-hidden.spec / .ts`, `force-graph- / directories.spec.ts`, `force-graph- / exploration.spec.ts`, `local-map-motion.spec / .ts`, `local-map-search.spec / .ts`, `local-map-keyboard. / spec.ts`, `local-map-learning. / spec.ts`, `local-map-branches. / spec.ts`, `local-map-framing. / spec.ts`, `explorer-history.spec / .ts`, `local-map-packing. / spec.ts`, `local-map-directories. / spec.ts`, `world-map-design. / spec.ts`, `world-map-estate.spec / .ts`, `layout-lab.spec / .ts`, `local-map- / simplicity.s…` |
| 6 | far / 6 | 0 | 9 | 0 | 37 | 46 | 9 | 7 | 21 | 9 | 0 | `local-map-corset. / spec.ts`, `force-graph- / discovery.spe…`, `force-graph-reveal. / spec.ts`, `force-graph-focus. / spec.ts`, `explorer- / navigation.spe…`, `perspective-zoom. / spec.ts`, `force-graph- / wrappers.spec…`, `force-graph-shells. / spec.ts`, `local-map-row- / motion.spec.ts`, `card-ladder-boxes. / spec.ts`, `local-map- / overview.spec.ts`, `local-map-hidden. / spec.ts`, `force-graph- / directories.sp…`, `force-graph- / exploration.sp…`, `local-map-motion. / spec.ts`, `local-map-search. / spec.ts`, `local-map- / keyboard.spec…`, `local-map-learning. / spec.ts`, `local-map- / branches.spec…`, `local-map-framing. / spec.ts`, `local-map-path. / spec.ts`, `explorer-history. / spec.ts`, `card-reading.spec / .ts`, `local-map-packing. / spec.ts`, `local-map- / directories.sp…`, `local-map-pins. / spec.ts`, `world-map-design. / spec.ts`, `world-map-estate. / spec.ts`, `layout-lab. / spec.ts`, `local-map- / simplicit…` |
| 7 | overview / 7 | 0 | 8 | 0 | 38 | 46 | 7 | 1 | 33 | 5 | 0 | `still-picture-geometry / .ts`, `still-picture / .ts`, `local-map- / corset.spec.ts`, `force-graph- / discovery.spec / .ts`, `force-graph- / reveal.spec.ts`, `force-graph- / focus.spec.ts`, `explorer- / navigation.spec / .ts`, `perspective- / zoom.spec.ts`, `force-graph- / wrappers.spec / .ts`, `force-graph- / shells.spec.ts`, `card-slots.spec / .ts`, `local-map-row- / motion.spe…`, `card-ladder- / boxes.spec.ts`, `card-ladder. / spec.ts`, `local-map- / overview.spec / .ts`, `local-map- / hidden.spec.ts`, `force-graph- / directories.spec / .ts`, `force-graph- / exploration. / spec.ts`, `local-map- / motion.spe…`, `local-map- / search.spec.ts`, `local-map- / keyboard.spec / .ts`, `local-map- / learning.spec.ts`, `local-map- / branches.spec / .ts`, `inspection.spec / .ts`, `local-map- / framing.spec.ts`, `pin-clicks.spec / .ts`, `local-map-path. / spec.ts`, `explorer- / history.spec.ts`, `still-picture. / spec.ts`, `card-reading. / spec.ts`, `local-map- / packing.spec.ts`, `local-map- / directories.…`, `search-bar.spec / .ts`, `local-map-pins. / spec.ts`, `world-map- / design.spe…`, `world-map- / estate.spec…`, `layout-lab. / spec.ts`, `local-map- / simplicity. / spec.ts` |
| 10 | overview / 10 | 0 | 2 | 0 | 44 | 46 | 2 | 1 | 5 | 38 | 0 | `capture / .ts`, `static / Explorer…`, `local- / storage.ts`, `symbol / Anchor…`, `still-picture- / geometry.ts`, `design-audit / .ts`, `still-pi / cture / .ts`, `local-…`, `force…`, `explo…`, `pers…`, `card-…`, `inspe…`, `pin-c…`, `still-…`, `searc…`, `worl…`, `la…`, `lo…` |

`rosetta-manifest.json` pinned whole:

| Press | Band / step | Before: one line, shared | one line, alone | two lines or more | cut | controls above the name | After: one line, shared | one line, alone | two lines or more | cut | controls above the name | After, the names on two lines or more and the cut, as drawn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | far / 5 | 0 | 9 | 0 | 9 | 18 | 9 | 8 | 1 | 0 | 0 | `rosetta-manifest. / json` |
| 6 | far / 6 | 0 | 9 | 0 | 9 | 18 | 9 | 0 | 9 | 0 | 0 | `compiler-edges. / json`, `rosetta- / manifest.json` |
| 7 | overview / 7 | 0 | 9 | 0 | 9 | 18 | 9 | 0 | 9 | 0 | 0 | `compiler- / edges.json`, `rosetta- / manifest.json` |
| 10 | overview / 10 | 0 | 2 | 0 | 16 | 18 | 0 | 7 | 1 | 10 | 0 | `mai…`, `com…`, `Mai…`, `rosetta- / manifes / t.json` |

The estate's `PaymentService.cs` with its `PaymentService` row pinned:

| Press | Band / step | Before: one line, shared | one line, alone | two lines or more | cut | controls above the name | After: one line, shared | one line, alone | two lines or more | cut | controls above the name | After, the names on two lines or more and the cut, as drawn |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | far / 5 | 0 | 5 | 0 | 6 | 11 | 6 | 4 | 1 | 0 | 0 | `hand-verified-edges. / json` |
| 6 | far / 6 | 0 | 2 | 0 | 9 | 11 | 2 | 0 | 9 | 0 | 0 | `PaymentQuery / .cs`, `PaymentResult / .cs`, `PaymentRequest / .cs`, `IPaymentService / .cs`, `compiler-edges. / json`, `hand-verified- / edges.json`, `PostPaymentRow / .cs`, `PaymentsContext / .cs`, `PaymentService / .cs` |
| 7 | overview / 7 | 0 | 2 | 0 | 9 | 11 | 2 | 0 | 8 | 1 | 0 | `Payment / Query.cs`, `Payment / Result.cs`, `Payment / Request.cs`, `IPayment / Service.cs`, `compiler- / edges.json`, `hand-verified- / edges.json`, `PostPayment / Row.cs`, `Payments / Context.cs`, `PaymentS…` |
| 10 | overview / 10 | 0 | 0 | 0 | 11 | 11 | 0 | 0 | 2 | 9 | 0 | `Paymen / tQu…`, `Paymen / tRe…`, `IPayme / ntS…`, `com…`, `han…`, `Payment / .cs`, `Post / Paym…`, `Payment / sCon…`, `App. / config`, `Pay…` |

### What the counts say

- **Names whole.** On the still picture at the overview band's first step, one line had cut 38 names of 46. Now 33 stand whole on two lines or more and 5 are cut, and the test specs tell each other apart again ("local-map- / overview.spec / .ts", "local-map- / hidden.spec.ts"). At the far band's first step, 26 stand whole on two lines where 31 were cut. On the payment service at the overview band's first step, "Payment / Query.cs", "Payment / Result.cs" and "Payment / Request.cs" are no longer all "Paym…".
- **The owner's band.** "branch-renderer / .ts" and "symbol-highlight / .ts" have More beside the extension at the far step, the price of a filled first line. At the sixth press the room is narrower, and the names break at their hyphen: "branch- / renderer.ts".
- **The middle band.** Long names stand on the first line with the three controls on the line under them (7 of 12 at the fourth press). Short names share their line with the controls, as before.
- **The last step.** The overview band's last step (the tenth press) still cuts most names: cards are narrow there against a name held at 15 px. A segment wider than a line breaks inside, as the rules allow ("Paymen / tQu…", "rosetta- / manifes / t.json"). One line had cut the same names harder ("Paym…").
- **The controls.** No card's controls stand above its name at any press after the change.

## Pictures

Each picture is in the folder twice, prefixed "before-" and "after-".

| Picture | What it shows |
| --- | --- |
| symbolAnchors-00-reading-0.png, symbolAnchors-01-reading-1.png | The owner's subject at the reading band, where the layout itself changed: the controls stand in the header after the name, on the line they share with it, at the header's right edge, and that line is about 24 px tall where it was about 17, the room the name's button keeps for the controls as held one press out. Here the "before" pictures are of `476ea2c8`, built for them (the milestone 1+2 bundle was no longer at hand); at the reading band its header is milestone 1's, whose round changed nothing there. |
| still-picture-00-reading-0.png, still-picture-01-reading-1.png | The still picture at the reading band's two presses: every card's controls after its name at the right edge, held at 1.2 × one press out within the same room; before (`476ea2c8`), in the card's corner beside a header padded to keep them clear. |
| symbolAnchors-03-middle-3.png, symbolAnchors-04-middle-4.png | The owner's subject at the middle band's third and fourth presses, where the three controls move: a long name on the first line and the controls under it, a short name sharing its line with them. Before, the controls stood in the corner above the names. |
| symbolAnchors-05-far-5-panned.png, symbolAnchors-06-far-6-panned.png | The owner's `localView` band at the fifth and sixth presses (the map dragged 700 px left): "branch-renderer" / ".ts" with More, where milestone 1 drew "branch-rend…" and `476ea2c8` "branch- / renderer.ts" beside a More taller than a line. |
| still-picture-05-far-5.png, still-picture-07-overview-7.png | The still picture at the far band's first press and the overview band's first press: the test specs whole on two and three lines, More after each. |
| rosetta-pinned-whole-06-far-6.png, rosetta-pinned-whole-07-overview-7.png | `rosetta-manifest.json` pinned whole: "compiler- / edges.json" and "rosetta- / manifest.json" whole. |
| payment-service-pinned-06-far-6.png, payment-service-pinned-07-overview-7.png | The payment service: its files told apart at the overview band. |
