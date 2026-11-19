# The cells' cost: the 2D press's first frame with Cells under name

_Historical evidence, taken in the night of 2026-11-18 to 19 by the builder of the cells-cost round, from commit `a91d7f89` (before) and the round's change in `packages/explorer/src/client/views/localView/card-factory.ts` (after). The red case is `tests/e2e/force-graph-focus.spec.ts`, "the 2D and 3D presses return at once…"; its bound (500 ms for the press's own time) is unchanged._

**The setup.** This repository's Explorer and the estate sample, built by `npm run build`, `npm run live-docs:visualize` and `npm run live-docs:visualize:estate`, served on port 8790, Chromium launched as the browser suite launches it (WebGL on the graphics card, compositing on the processor). The profiles are Chrome traces (`devtools.timeline`) of the case's own press: `/?view=local&mode=3d&node=packages/engine/src/live-docs/graph.ts`, wait for the 3D map to settle, press 2D, at 1280 × 720.

## Where the time was

The press's own time ends when the frame the browser owes after the click is drawn. With Count that frame took 59 ms. With Cells under name it took 358 ms:

| In the first frame after the press | Count | Cells under name, before | Cells under name, after |
| --- | --- | --- | --- |
| Animation-frame callbacks | 23 ms | 25 ms | 26 to 35 ms |
| The marks' `ResizeObserver` callbacks | none | 38 callbacks, 290 ms in all, each forcing its own style recalculation (232 to 584 elements, 6 to 12 ms each) | 1 callback, 19 to 26 ms, no forced recalculation |
| Style recalculation after the callbacks | none | 8 ms (the last toolbar's) | 1 recalculation, 40 to 50 ms (1,545 elements) |
| Pre-paint, paint, layerize | 31 ms | 35 ms | 35 to 45 ms |
| **The frame** | **59 ms** | **358 ms** | **133 to 174 ms** |

So the 350 ms were neither the number of elements as such nor the paint: they were **38 layouts in a row**. Every handle's marks are two toolbars (the line beside the name and the field under it, `createHiddenCells` and `createHiddenField`), each with a `ResizeObserver` of its own. Each callback first read its toolbar's room (`clientWidth`, `clientHeight`) and then wrote its marks; the read came after the previous toolbar's writes, so the browser restyled and laid out the page before it could answer, nineteen directories times two. The style of one mark is not cheap (a marble's tint is a `color-mix` of custom properties, every mark carries an inline style and a ring drawn by `::before`), which is why each forced pass cost 6 to 12 ms, but done once that styling costs 40 to 50 ms for every shown mark of the map together.

The element census of the case's map at the reading look (Cells under name): 2,111 elements inside the directories' labels against 319 with Count. In the 18 shown fields: 372 buttons (one per hidden file, every one placed), 417 circles, **425 SVG `<title>` elements**, 29 mask parts. The 18 lines beside the names hold 390 more, all inside `display: none` at this look, so the browser builds them but does not style them. No closed directory is drawn on this map.

## What changed

1. **One `ResizeObserver` for every handle's marks** (`observeRoom` in `card-factory.ts`), which reads every toolbar's room first and then draws them all: one layout instead of one per toolbar. The rooms read are the same `clientWidth` and `clientHeight` as before, so the drawing is the same to the pixel. Chromium does not keep an observed element alive once it leaves the page (checked: 100 of 100 observed elements, shown and `display: none`, were collected after they were removed while the shared observer lived on).
2. **No SVG `<title>` in the marks' drawing** (`fieldMarkup` with `marked`): the drawing is `aria-hidden` and `pointer-events: none`, and the buttons over it say each name on hover and to assistive technology, so those titles were never read; they were 425 of the elements styled in that frame. A closed directory's cells keep their titles, where the pointer reaches them.

What a mark is did not change: one button per file and per directory, pressed to pin or open, named on hover, reached by the toolbar's arrow keys and read by assistive technology as "Pin …" or "Open …".

## The case, before and after

The press's own time (the press's return less the 2D map's measured render), eight runs each:

| | 1 worker | 2 workers |
| --- | --- | --- |
| Before | 547, 565, 572, 582, 591, 608, 715, 878 ms; **0 of 8 passed** | 725, 752, 767, 779, 784, 794, 839, 892 ms; **0 of 8 passed** |
| After | 281, 297, 313, 325, 380, 386, 405, 493 ms; **8 of 8 passed** | 288, 291, 298, 300, 304, 310, 313, 321 ms; **8 of 8 passed** |

The machine was shared with other builders through these runs (load average about 5), which is the likely spread of the after runs at one worker. With Count the root had measured 206 to 254 ms, so Cells under name now costs the press some 50 to 80 ms more than Count, where it cost about 350.

The 3D press of the same case, which the change does not touch, took 374 to 522 ms before at one worker (one run of eight over the bound) and 391 to 497 ms after; it is near its bound on this machine on its own account.

## The picture is unchanged

Each look was compared before and after on this repository (`/?view=local&node=packages/engine/src/live-docs/pathfind.ts`) and the estate (`/samples/estate/?view=local&node=PaymentService/Data/PaymentsContext.cs`, also dragged so that its handles are in view), with Hidden Files at Cells under name and at Cells, at 1440 × 900: the reading look, then Zoom Out pressed until the far look and the overview. For every toolbar of every picture, the marks' drawing (its SVG, titles aside), each button's place, size, ring, shown state, hover text, accessible name and keyboard stop are identical before and after (18 pictures, each look of each subject under both values). On the pixels: the reading and far looks undragged are identical to the pixel on both subjects under both values, and so is this repository's overview. The estate's overview differed in a few hundred pixels by at most 5 levels of 255, and once this repository's overview by 2,532 pixels by at most 15, on the wires and card edges; two runs of the same bundle differ the same way (the repository's second after run matched the before picture exactly), so that is the overview's own run-to-run noise, not the marks. The dragged pictures cannot be compared by pixel: the same drag lands a pixel or two apart from run to run, before as after; their marks compare identical as above.

| Picture | What I see |
| --- | --- |
| `repo-pathfind-2d-reading.png` | The reading look at `pathfind.ts`: `…ages/engine/src/live-docs/history` at the right draws its hidden files as two rows of small cells under its name, as in the defaults round's picture. |
| `repo-pathfind-2d-far.png` | The far look: `history` draws two cells and a veiled third beside its name. |
| `repo-pathfind-2d-far-cells-in-line.png` | The same look with Hidden Files at Cells: the same marks beside the name. |
| `repo-pathfind-2d-overview.png` | The overview: the handles at the size of the file names, the marks beside the names that have room for them. |
| `estate-payments-context-2d-reading-dragged.png` | The estate, dragged: `PaymentService`'s one hidden file is one dim cell under its chevron. |
| `estate-payments-context-2d-far-dragged.png` | The far look, the same drag. |
| `estate-payments-context-2d-overview-dragged.png` | The overview: `PaymentService` with its one cell after the name; `SqlServer` draws none. |
