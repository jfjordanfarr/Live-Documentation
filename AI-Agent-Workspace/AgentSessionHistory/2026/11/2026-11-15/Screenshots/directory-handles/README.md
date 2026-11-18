# A directory's handle at every zoom, 2026-11-15

Historical evidence for the first milestone of the directory handle ([November 15, Turn 1](../../2026-11-15.1.record.md#turn-1)): the owner found directories in the 2D map not useful when zoomed out, "because there are no buttons to interact with at that distance". The pictures are 1,440 by 900, of the 2D Local Map in its defaults (the three zoom looks, Flow for an opened directory, the Box look of a closed directory).

## Names

`{before|after}-{subject}-{moment}-{segoe|fallback}.png`

- **before** is the build of commit `cb53d7c7`; **after** is this round's.
- **segoe** is drawn with Segoe UI's line metrics over this machine's Liberation Sans (the owner's browser draws Segoe UI); **fallback** with this machine's own lines.
- **Subjects:**
  - `client`: `packages/explorer/src/client` opened (`/?view=local&dir=packages/explorer/src/client`), a membrane with seven closed boxes above its files.
  - `scripts`: `scripts` opened, five closed boxes and four files.
  - `engine-src`: `packages/engine/src` opened, a directory of four directories.
  - `root`: the scan root (`/?view=local`), six closed boxes with no membrane around them.
  - `branch-renderer`: `branch-renderer.ts` as the subject (`/?view=local&node=packages/explorer/src/client/views/localView/branch-renderer.ts`), whose membranes are drawn only around what its wires need.
- **Moments:** `arrive` as the page arrives (the reading look); `out3` and `out5` after three and five presses of Zoom Out (the connections look); `out7` after seven (the overview look); `fit` after the Fit button.

## What to look at

- **`client-out3`, `client-out5`, `client-out7`, `client-fit`, before and after.** Before, the opened directory's label is cut at its start ("…plorer/src/client") above its first column, loses its controls, and at the overview is about 6 px tall beside file names of 13 px; "Open" is a text button about 7 px tall or missing, and "bootst…" is cut. After, the label is a handle: a chevron pointing down, the parent's path muted and the directory's own name in the primary tone, at the file names' size, with More beside it; every closed box leads its name with a chevron pointing right, and every name is whole ("bootstrap" and "persistence" brought down in size to fit).
- **`client-arrive`, `scripts-arrive`, `engine-src-arrive`, `root-arrive`, before and after.** The reading look. The "Open" text button and the close cross are gone; the chevron leads the name, and in a closed box More stands on the name's line at the right, the row under the count left empty so that the box keeps its size. The strip above an opened directory's cards is 60 units tall where it was 30, which is the room the held handle needs at the overview.
- **`branch-renderer-*`.** With a file as the subject the camera stands inside large membranes, whose handles are at their top left, off screen at three, five and seven presses out, before and after alike; `fit` shows them: after, the parent's path is cut from its start, the own name is whole, More stays, and a count of what is hidden is drawn whole or, as here, not at all. The after pictures were taken once main's cue and tone rounds were merged in, so they also show the 3D button's amber cue and the quieter wires, and the picture holds a few more files than the before one.

The `before` pictures were taken under Segoe UI's lines only; the `after` pictures under both.

## A nested directory opened, and the gap that remains there

`{before|after}-nested-engine-src-live-docs-{opened|fit}-segoe.png`: `packages/engine/src` opened, then `live-docs` inside it. Before, both labels are a few pixels tall after Fit and `adapters` stands 30 units lower than `heuristics` and `history` beside it. After, each directory's handle is held at the file names' size and each first row is level. What remains in `after-…-opened`: the row of `config`, `languages` and `tooling` stands 19 units lower than the strip above it needs (it was 79 in this round's first form, whose picture this one replaces). The columns to their right, where `live-docs` rises to the top, begin under the parent's strip, the nested membrane's padding (13) and a lane's (6), and a picture standing from the top levels the first item of every column.

## Opening and closing at the overview

`after-open-close-*`, seven presses out on `client`:

1. `1-pointer-on-the-closed-box`: the pointer over `history`; the box's edge and its chevron light.
2. `2-opening`: a frame of the move, about a tenth of a second after a click on the box's body, away from its name.
3. `3-opened`: `history` is a membrane inside `client`, its own handle pointing down.
4. `4-pointer-on-the-handle`: the pointer over the opened directory's name; the whole handle lights.
5. `5-closed-by-the-handle`: after a click on the name, `history` is a box again.

`after-keyboard-*-fallback.png`, the same by keyboard alone: `1-focus-on-the-closed-box`, the focus ring around the whole of `history` after Tab reaches its handle; `2-opened-focus-on-the-handle`, after Enter, the ring around the opened handle's chevron and name together.
