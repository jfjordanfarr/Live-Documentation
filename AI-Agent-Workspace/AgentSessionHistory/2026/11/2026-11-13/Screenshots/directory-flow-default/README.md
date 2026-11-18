Evidence for Flow becoming the default of the 2D Local Map's Opened Directory, 2026-11-13: a builder's pictures of the default, written up by the root at the landing. Historical: it describes that commit, not the product after it.

The owner had found Flow "superior in basically every place I look" ([Turn 2 of the November 13 record](../../2026-11-13.1.record.md#turn-2)) and could not answer in words whether the grid should go ([Turn 3](../../2026-11-13.1.record.md#turn-3)), so the default was changed for their eye, the grid one choice away in Tuning. The width term that lets the layout's price choose how an opened directory stands landed first ([its evidence](../directory-flow-price/README.md)).

## The pictures

Thirty, 1,440 by 900, headless Chromium with nothing remembered, so the page is in Flow and the three looks. Named `{subject}-{arrival|fit|zoom3}-{fallback|segoe}.png`: as the address opens, after Fit, and after three presses of Zoom Out; `fallback` is this container's font, `segoe` the same with Segoe UI's line metrics, which is what the owner's screen draws. Subjects: `scripts`, `scripts/live-docs`, `packages/explorer/src/client`, its `views/localView`, and the estate sample's `Contracts`.

**One thing in them is no longer true.** They were taken on the builder's branch, which did not yet hold the card round's last step (`d1dce996`). In them a closed directory's box shrinks with the map and cannot be read when zoomed out: every box along `client`'s top at Fit, and `inspect` in `live-docs-zoom3`. On `main`, with both changes, the boxes hold their names at the look's size; the root checked this on the rebuilt preview (below).

What the root saw in the three it opened, each under Segoe's metrics:

- `scripts-arrival`: five closed boxes two columns wide above `steps.mjs`, whose three users stand to its right, one line to each.
- `client-fit`: one band of twenty cards across the middle third of the frame, in the order of use, with room above and below; the price's choice, accepted with the width term.
- `live-docs-zoom3`: `cli.ts` at the left with a line to each of the nine files that use it, names whole.

The builder reports shapes and line counts identical under both metrics (`client` wraps at four rows with 29 lines, `localView` stands unwrapped with 143), and that `localView` at Fit cuts a few names in its narrow right-hand columns to an ellipsis.

## The root's check of the merged build

On the folder rebuilt from `main` with both changes, under both metrics, each opened by a plain address with nothing remembered:

| Directory | As | Layout | Cards | Lines | Closed boxes |
| --- | --- | --- | --- | --- | --- |
| `scripts` | arrival | Flow | 4 | 3 | five, at reading size |
| `packages/explorer/src/client` | Fit | Flow | 20 | 29 | seven, each name held and readable |
| `scripts/live-docs` | three presses out | Flow | 11 | 9 | `inspect`, its name held and readable |

Type-check, the 1,042 unit cases of the client and the layout lab, and lint pass on the merged tree. The builder ran every browser spec that opens a directory on its own branch: after its fixes the 2D ones passed but for five 3D clock cases, and two more 3D cases failed on the clock alone with "Slow, not broken". The full gate on `main` was still owed when this was written.

## To see it

On the day's preview: [`scripts`](http://127.0.0.1:8999/?view=local&dir=scripts), [`client`](http://127.0.0.1:8999/?view=local&dir=packages/explorer/src/client) (press Fit), [`scripts/live-docs`](http://127.0.0.1:8999/?view=local&dir=scripts/live-docs). The grid is under Tuning → 2D Layout → Opened Directory.
