# What a step frames: Tuning's Step trial, its first three values

_Historical evidence, taken on November 21, 2026 by the builder of the trial, on its branch's built site, at 1,280 by 800. The trial is described in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md), "What a step frames, a trial beside the least pan". It answers the blind playtest's picture of that day, [`007-click.png`](../../Probes/blind-playtests/estate-directory-sonnet-medium-arrival-then-neighbours/shots/007-click.png): `PaymentService/Data` opened, `Payment.cs` cut at the bottom and `PaymentService.cs` cut at the right edge._

## The steps

Each step was taken from the same starting picture under each value, in a fresh page with the continuing search off. Only the value of Tuning → 2D Layout → Step changed between runs.

1. **`estate-data`**: on the estate sample, the folder `PaymentService` was chosen in the search, as the playtester did, and then `PaymentService/Data` was opened by its handle. It fits whole at reading scale.
2. **`repo-history`**: on this repository, the arrival at reading size on `packages/engine/src/live-docs/pathfind.ts`, and then `packages/engine/src/live-docs/history` was opened by its handle. This is the folder of the brief that does not fit at reading scale once opened.
3. **`repo-cell`**: the same arrival, and then the first of `history`'s cells was pressed, which pins `bundled.test.ts` and brings its card in. This stands in for "a neighbour pinned from a card": a neighbour's pin from a card whose card is already in view brings no newcomer in today's code, so the lever has nothing to act on there.

## The files

For each step there is:
- `<step>--before.png`: the starting picture;
- `<step>--<value>--rest.png`: the picture at rest after the step;
- `<step>--<value>--frames.png`: six of the frames taken one after another during the 2.6 s after the press, left to right.

The values are `least` (Least Pan, the default), `whole` (Whole) and `lines` (With Its Lines). The script is [`shots.mjs`](shots.mjs), run through the browser lane on the built site.

Scales at rest: reading scale is 1 in every start.

| Step | Least Pan | Whole | With Its Lines |
| --- | ---: | ---: | ---: |
| `estate-data` | 1 | 1 | 0.907 |
| `repo-history` | 1 | 0.335 (the floor) | 0.335 (the floor) |
| `repo-cell` | 1 | 1 | 0.764 |

## What I see

- **`estate-data`, Least Pan.** This is no longer the playtest's picture, because two faults found while building the trial are mended in it (below). The camera now pans up to `Data`'s own label and first row, and `Payment.cs` happens to come in whole at the foot. `PaymentService.cs` is still cut at the right edge.
  - Before the mends, this step left `Payment.cs` cut at the bottom, as the playtest saw: the folder chosen in the search had left its own newcomer pending, and the pan went to that folder rather than to `Data`.
- **`estate-data`, Whole.** The scale is kept. The camera pans up so that the whole `Data` membrane stands in view, its L-shaped top included, with `PaymentsContext.cs` at its top right and `Payment.cs` whole at its foot. `App.config` is cut at the top, and `PaymentService.cs` is still cut at the right, since neither is part of `Data`.
  - Names stay at reading size. The person's place, `Data`'s label, moves up by about 120 px and stays recognisable.
- **`estate-data`, With Its Lines.** The camera eases out to 0.907, and everything the playtester needed is whole: `Data`'s three files, `App.config`, and `PaymentService.cs` with its lines.
  - The frames show the motion: the re-layout with `Data`'s outline marked at the old frame, then one ease outward. It reads as one move.
  - Names shrink by a tenth and still read easily. To my eye this is the best of the three on this step.
- **`repo-history`, Least Pan.** The label is held where it was pressed, and the opened directory runs off the right and the bottom. Only `summary.ts` and part of another card show.
  - Opened by its handle, the label had been drawn before, so under today's rule this is no newcomer and there is no pan at all.
- **`repo-history`, Whole.** The camera eases out to the floor, 0.335, since `history` does not fit whole even there. It then pans the least that brings `…/live-docs/history`'s label and `summary.ts`, its first row, into view, in the middle of the frame. `format.ts`, `textStore.ts` and `shape.ts` show to the right, and the pathfind neighbourhood shows above.
  - The names are at the floor's size, small but legible.
  - Most of `history` is still out of view, and the person's place moved a long way. On this folder, Whole buys a smaller picture and little more of the folder.
- **`repo-history`, With Its Lines.** The floor again, with `history`'s label at the room's top left, and `summary.ts`, `format.ts`, `textStore.ts`, `shape.ts` and `bundled.ts` below it.
  - The lower half and the right of the view are empty. This is the worst of the three on this step: what it shows is a corner of the folder at the smallest size, with empty map beside it.
- **The fault behind both, found while looking.** In the first pictures, `history`'s label was out of view at the floor. Its "first row" had been read from every box the directory holds, and some of those stand above its label, beside the columns of the directory that encloses it. The pan entered there, with the label below the view.
  - The first row is now read under the label. This mends Least Pan's newcomer too, wherever a membrane is not a rectangle.
- **`repo-cell`, Least Pan and Whole.** These are the same: the scale is kept, and the new card `bundled.test.ts` is brought whole into view at the right, with `bundled.ts` beside it. The subject `pathfind.ts` is out of view to the left.
- **`repo-cell`, With Its Lines.** The camera eases out to 0.764 to hold `bundled.test.ts` and the cards its lines reach. The names read.

## What my eye says of the three, in short

- **Least Pan** keeps the place best, and still cuts what the step produced whenever it is larger than the view.
- **Whole** shows the opened thing whole where it fits at the scale, with the names unchanged: on the estate it is the playtest's fix at no cost. On a folder too large it drops to the floor, the place jumps, and what it shows is no more useful than Least Pan's.
- **With Its Lines** gave the best estate picture, everything the question needed at nine tenths of reading size, and a useful pull back after the cell's press. On a large folder it is the worst, a corner at the floor with empty map beside it.
- None of them cuts names past the floor. Whole and With Its Lines shrink them to it on the large folder.

## Not built, and not pictured

- The fourth value: the least pan with a sign at each edge counting the cards it cuts. Its arithmetic (`cutByEdge`, `cutPan` in `camera-intent.ts`) is written and unit-tested; its interface is not built.
- The motion as a recording: the frames are stills, six of each run.
