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

## Not finished: the cut said at the edges

A lever of its own beside Step, Tuning → 2D Layout → **Cut Counted**, default off, is built in the working tree but not committed (`views/localView/cut-signs.ts` and its wiring). At each edge past which what the last step opened goes on, it draws an arrow and the count of its cards, a focus stop that pans to them.

- **What the first look showed.** On the estate step it counted 31, 27 and 4 cards at three edges, where `Data` holds three files. None of the controls could be seen in the picture, and on `history` it drew none.
- The cards it reads, or the place it draws them, are wrong. This is not yet found, and no picture of it is kept.
