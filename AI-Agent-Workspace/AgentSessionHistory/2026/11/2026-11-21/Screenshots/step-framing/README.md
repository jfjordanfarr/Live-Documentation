# What a step frames: Tuning's Step trial, second round

_Historical evidence, taken on November 21, 2026 by the builder of the trial, on its branch's built site, at 1,280 by 800. The trial is described in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md), "What a step frames, a trial beside the least pan". It answers the blind playtest's picture of that day, [`007-click.png`](../../Probes/blind-playtests/estate-directory-sonnet-medium-arrival-then-neighbours/shots/007-click.png): `PaymentService/Data` opened, `Payment.cs` cut at the bottom and `PaymentService.cs` cut at the right edge._

_The first round's pictures were replaced by these. The root ruled on them: an ease out that cannot deliver the whole is not taken, and a directory opened by its handle is a step under Least Pan too. Since then, Whole and With Its Lines ease only where some scale at or above the floor holds what they frame, else they do what Least Pan does; and opening a directory by its handle brings its label and first row into view under every value._

## The steps

Each step was taken from the same starting picture under each value, in a fresh page with the continuing search off. Only Tuning → 2D Layout → Step changed between runs.

1. **`estate-data`**: on the estate sample, the folder `PaymentService` chosen in the search, as the playtester did, then `PaymentService/Data` opened by its handle.
2. **`repo-history`**: on this repository, the arrival at reading size on `packages/engine/src/live-docs/pathfind.ts`, then `packages/engine/src/live-docs/history` opened by the handle on its drawn label. No frame holds it whole at or above the floor.
3. **`repo-cell`**: the same arrival, then the first of `history`'s cells pressed, which pins `bundled.test.ts` and brings its card in. This stands in for "a neighbour pinned from a card", because a neighbour pinned from a card whose card is already in view brings no newcomer.

## The files

For each step:
- `<step>--before.png`: the starting picture;
- `<step>--<value>--rest.png`: the picture at rest after the step;
- `<step>--<value>--frames.png`: six frames taken one after another during the 2.6 s after the press, left to right.

The values are `least` (Least Pan, the default), `whole` (Whole) and `lines` (With Its Lines). The script is [`shots.mjs`](shots.mjs), run through the browser lane on the built site.

Scales at rest (reading scale is 1 in every start):

| Step | Least Pan | Whole | With Its Lines |
| --- | ---: | ---: | ---: |
| `estate-data` | 1 | 1 | 0.907 |
| `repo-history` | 1 | 1 | 1 |
| `repo-cell` | 1 | 1 | 0.764 |

## What I see

- **`estate-data`, Least Pan.** The camera pans up to `Data`'s label and first row, and `Payment.cs` comes in whole at the foot. `App.config` is cut at the top, and `PaymentService.cs` at the right edge.
- **`estate-data`, Whole.** Nearly the same picture, since `Data` fits at reading size: `Data` whole, with `Payment.cs` lifted a little clear of the toolbar. On this step Whole buys little.
- **`estate-data`, With Its Lines.** Still the best of the nine. The camera eases to 0.907, and `Data`'s three files, `App.config` and `PaymentService.cs` stand whole with every line of the step. The frames read as one move: the re-layout with `Data` outlined, then one ease.
- **`repo-history`, all three.** These are now one picture. The scale is kept, and the camera pans the least that brings `history`'s label and `summary.ts`, its first row, into view at the right of the frame. The person keeps reading size and the subject's neighbourhood at the left. Most of `history` is still beyond the right and bottom edges: that is what the cut said at the edges is for (below).
  - In the first round, Whole and With Its Lines threw the camera to a third of reading size here, and Least Pan left the label cut at the right edge.
- **`repo-cell`, Least Pan and Whole.** The same: the scale kept, and the new card `bundled.test.ts` whole at the right, with `bundled.ts` beside it. The subject `pathfind.ts` is out of view to the left.
- **`repo-cell`, With Its Lines.** Eased to 0.764 to hold `bundled.test.ts` and the cards its lines reach (`summary.ts`, `bundled.ts`, `queries.test.ts`). The names read.

## The nearer bound for steps: not shown

The root asked to try a nearer bound for a step's ease, two thirds of reading scale, against the Arrival floor (about a third), on folders of middling size, and to bring both.

- On the steps above, nothing falls between the two bounds. The eases that happen stop at 0.907 and 0.764, above both bounds, and the folder that does not fit (`history`) needs less than either, so it no longer eases at all. Every picture here would be the same under either bound.
- I tried two middling folders of this repository, opened from the `client` folder chosen in the search: `packages/explorer/src/client/panels` and `.../persistence`. Neither eased under Whole or With Its Lines with the Arrival floor, so they would not differ under the nearer bound either.
- A folder whose whole needs between a third and two thirds of reading scale is still to be found before the comparison can be shown. The constant `STEP_FLOOR_RATIO` in `camera-intent.ts` holds the bound, so the comparison is one build away.

## The cut counted at the edges

A lever of its own beside Step, Tuning → 2D Layout → **Cut Counted**, default off. At each edge past which what the last step opened goes on, it draws an arrow and the count of its cards there, a focus stop whose name and tooltip say what it counts ("28 cards of what you opened past the view's right edge: show the nearest"). A press pans, at the same scale, to the nearest of that edge's cards, whole.

Each cut card is counted once, at the edge it reaches farthest past on screen, a tie to the left or right, so the counts sum to the cards that are cut (the root's ruling of the same day). As first built, a card was counted at every edge it went past: on `history` that read ↑27, →31, ↓4, which is 62 for a folder of 32 cards.

The pictures were taken with Least Pan and the lever on, by [`cut-probe.mjs`](cut-probe.mjs). It also reads what the controls watch (`data-cut-of`, `data-cut-cards`) and their boxes.

| Picture | What it is |
| --- | --- |
| [`cut-counted--history--rest.png`](cut-counted--history--rest.png) | `live-docs/history` opened by its handle from `pathfind.ts`, at rest |
| [`cut-counted--history--after-press.png`](cut-counted--history--after-press.png) | The same after one press of the right-hand control |
| [`cut-counted--history--after-press-above.png`](cut-counted--history--after-press-above.png) | The same after one press of the control above, instead |
| [`cut-counted--estate--nothing-cut.png`](cut-counted--estate--nothing-cut.png) | The estate's `Data` opened inside `PaymentService`, nothing of it cut |

- **`history` at rest: ↑1, →28, ↓2.** That is 31, the cards not wholly in view (`summary.ts` alone is), and `history`'s label and `summary.ts` stand at the right at reading size.
  - The numbers now add up, and they still tell a person where to go: almost everything is to the right.
  - What they no longer say is that most of those 28 also lie far above: the L of `history`'s membrane rises up and to the right. A card is counted at the edge it is farthest past, and for 26 of them that is the right edge by a few hundred pixels over the top.
  - The →28 sits over the right end of `summary.ts`'s label row where it meets the edge (set down on the work item as known).
- **After one press of →28: ↑6, →21, ↓3.** The camera pans, at the same scale, to `format.ts`, the nearest card past the right edge, which stands whole at the lower right with `summary.ts` and `history`'s label still in view. The place is kept and one more card is read.
  - The numbers move between edges as the view moves (6 above now, where 1 was). Each is true of the view as it stands, but a person who watched →28 become →21 may expect the other 7 to have come into view, and only one did.
- **After one press of ↑1, instead: →23, ↓7.** The only card counted above was `lens.ts`, at the top of `history`'s first column up and to the right. The press goes there whole, on both axes, about 1,600 px right and 1,300 px up, at the same scale.
  - It lands somewhere sensible, the head of the folder's main block: `lens.ts`, `bundled.test.ts` and `rows.ts` whole, and the column of `lens.ts`'s neighbours to the left.
  - It is a long jump with nothing kept: `history`'s label and `summary.ts` are gone from view. It reads as a jump rather than a step, since the smooth path the following camera takes for long moves is not used here. The ease is the flat one.
- **The estate's `Data`.** No control: `Data` stands whole after the step. `PaymentService.cs`, cut at the right, is not part of what the step opened.
- **The counts are what the page shows.** The unit cases hold the one-edge rule to the boxes the page drew on `history`; the partition was worked out by hand from those boxes before the function changed. The browser case reads each control's count against the directory's cards past each edge, by the same rule, and checks that the counts sum to the cards not wholly in view, before and after a press.
- **On the first round's report.** It said the controls counted 31, 27 and 4 on the estate's three-file step and drew nothing on `history`. That was a misread log: those counts were `history`'s, and the picture looked at was the estate's, where nothing should be drawn.
