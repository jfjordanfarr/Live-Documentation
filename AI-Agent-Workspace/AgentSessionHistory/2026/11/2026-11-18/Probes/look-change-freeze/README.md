# The look change's freeze: measured, its cause, and the mend

_Historical evidence, taken in the night of 2026-11-18 to 19 by the builder of the look-change round (branch `look-change-freeze`), for the owner's words on seeing the stall: "Hmmm, yeah the stutter of performance as the stylesheet breakpoints were hit was jarring" ([the record's Turn 37](../../2026-11-18.1.record.md#turn-37); the stall was first seen in [the camera's pictures](../../Screenshots/camera-intent/README.md))._

**The setup.** This repository's Explorer and the estate sample, built by `npm run build`, `npm run live-docs:visualize` and `npm run live-docs:visualize:estate`. Each bundle measured was copied aside and served beside the others on port 8827, and its files' checksums checked against what the port served before each run. The cause was found on `main` at `f3714076`; the numbers in the tables are from `main` at `924bec80` (with the returning connections round, which stands each card's hubs at its name, `standHubs`) against the same with this round's change. Chromium launched as the browser suite launches it (`tests/e2e/browser-launch.ts`: WebGL on the graphics card, the page composited and rastered on the processor), 1440 × 900, the continuing search off. **The machine was shared** with several other builders through every run (load average 4 to 14): one frame's time swings by half or more from run to run, so the counts of style passes and elements below are the firm numbers and the milliseconds are each given with their runs.

## Where the time went

`look-change-trace.cjs` drives a journey, keeps every frame the page drew (its time, the camera's scale, the look) and a Chromium trace of the page's main thread; `look-change-tasks.cjs` and `style-per-change.cjs` read the trace around each change of look; the scripts' positions were mapped back to the source through the bundle's source map. The journey on `packages/engine/src/live-docs/pathfind.ts`: eight wheel notches out from reading (across reading to connections), eight more (across connections to overview), then the same back in.

The change from reading to connections, before the round (`f3714076`, the first run; elements restyled and milliseconds):

| When | What | Style pass |
| --- | --- | --- |
| the change's frame | `morphLook` reads `container.offsetWidth` to restart the cross-fade's animations (`controller.ts`) | 2,592 elements, 73 ms, **forced** |
| the same frame | the new look; the legend's `checkVisibility` (`spatial-legend.ts`) forces the restyle the frame owed anyway | 2,525 elements, 127 ms |
| 200 ms later | the fade's end: the class comes off and the wires drawn again read the layout (`computeLayoutExtents`) | 2,738 elements, 100 ms, **forced** |

So a change of look restyled the whole map **three times**, and only one of the three was the new look's. Selector matching was a small part of each pass (Chromium's selector statistics: 30 to 40 ms of an instrumented two-second pass); the cost is the number of elements whose style is computed again, each carrying the cards' many custom properties.

**Why each pass was whole.**

1. **The flush.** `morphLook` took the class `local-look-fading` off, read a box and put the class back, so that the animations would start again. When no fade is running the class is already off, and the read only restyles the map at the old look, because the change has just written the look's custom properties (`--look-from-scale`, `--look-zoom`, `--look-keep`) on the map, which every element inherits.
2. **The fade's end, twice over.** The held scales of the look left (`--title-scale-from`, `--name-scale-from` and four more) were declared on every card and row under the class; a custom property is inherited by everything inside its element, so taking them away restyled everything inside every card. And one rule under the class, `.local-look-fading … .local-card-actions > :not(.local-file-more)`, ends in a part that names no class, tag or attribute: the browser cannot tell which elements it may reach, so the class's coming or going restyled everything inside the map. Found by taking each of the class's 21 rules out of the page in turn at rest in connections: every rule left the class's removal at 2,737 elements but that one, without which it was 508.

**Ruled out.** The wires are not rebuilt (their elements are kept by key, `connections.ts`); layout is 5 to 20 ms of a change; the cells' observers mended on November 18 fire once and cost 7 ms here. **`standHubs`** (asked about when `main` moved) runs only at the overview's edges, inside the Files Only re-layout's measurement (`branch-renderer.ts`, after the cards' heights are read), and forces no style pass or layout of its own in any of the traces; it is not at the reading and connections edge at all. Its writes (`--hub-y` on each card's wrapper) are custom properties inherited by the card, so where their values change they add the card's elements to the next style pass.

## The mend

- `controller.ts`, `morphLook`: the box is read only when the class was on, a change inside the last one's fade, where the animations do need restarting. The animations start as before, since the page's last style is without the class.
- `reading.css`: the held scales of the look left hang on `data-look-from`, which the controller now keeps until the next change, instead of on the fade's class; nothing at rest reads them, only the fade's animations. The one card-level override under the class (`--title-scale`, from connections back to reading) moved onto the element that draws it, the held name. The rule ending in `:not(.local-file-more)` names its elements, `> button:not(.local-file-more)`: the same elements, since every child of `.local-card-actions` is a button (`card-factory.ts`, `card-reading.ts`).

Nothing about the looks, their edges, the cross-fade's design or the camera changed.

## Before and after

**Whole-map passes** (style passes of at least half as many elements as the change's largest), on `pathfind.ts`, from 1.3 s before the change's mark to 0.7 s after it; the same counts in both runs of each:

| Change | `main` (`924bec80`) | With the mend |
| --- | --- | --- |
| reading → connections | 3 (2,617, 2,528, 2,741) | **1** (2,528), then 988 at the fade's end |
| connections → reading | 3 (2,211, 2,648, 3,196) | **1** (2,648), then 1,142 |
| connections → overview | 4 (2,203, 2,765, 2,077, 1,387) | 2 (2,766, then 1,546 or 2,077) |
| overview → connections | 4 (1,464, 1,680, 2,769, 2,927) | 2 to 4, all but one of them the Files Only re-layout's |

Between reading and connections the page now restyles about 3,500 elements a change where it restyled about 7,900. The passes left at the overview's edges belong to "Zoomed Out Fully: Files Only", which measures and lays out the picture again at those edges by design (`refreshReadingGeometry`, `layoutScene`, the rows put back at the move's end), not to the cross-fade.

**The main thread's long tasks** at the reading → connections change, `main` against the mend, the first run of each at load 13 (task length, of it style):

| Task | `main` | With the mend |
| --- | --- | --- |
| the frame that changes the look | 797 ms, 583 style | 378 ms, 220 style |
| the fade's end, 200 ms later | 305 ms, 264 style | 175 ms, 130 style |

**Frames.** The longest frame within half a second of each change (`edge-frames.cjs`, ms, one entry per run). At this load the frames say less than the counts:

| Picture | Change | `main` | With the mend |
| --- | --- | --- | --- |
| `pathfind.ts`, 5,708 elements, the wheel | reading → connections | 783, 717 | 367, 717 |
| | connections → overview | 800, 767 | 467, 1,017 |
| | overview → connections | 1,183, 1,067 | 550, 917 |
| | connections → reading | 1,117, 650 | 450, 550 |
| `pathfind.ts`, the arrival's ease (Reading, Then Neighbours) | reading → connections | 783 | 350 |
| `controller.ts`, 8,959 elements (the larger picture), the wheel | reading → connections | 1,300 | 483 |
| | connections → overview | 1,517 | 983 |
| | overview → connections | 1,733 | 933 |
| | connections → reading | 767 | 367 |
| the estate's `PaymentsContext.cs`, 903 elements (the control) | the four changes | 183, 250, 233, 150 | 83, 133, 133, 67 |

Earlier the same night, at load 5 to 7 and on `f3714076`, the same journeys gave 333 to 450 ms at the reading and connections edge before and 217 to 367 after: the same direction, a smaller step, the noise as large as the gain. **The stall is shorter, not gone.** The frame that changes the look still holds one restyle of the whole map and its paint, and the screencast's frames (below) show that frame still standing for most of a second at this load.

**Frame strips** (`edge-strip.cjs`, the screencast across the reading → connections edge on the wheel, eight frames, each labelled with its time after the one before): [`main`](edge-strip-pathfind-main.png), the frame of the change 924 ms after the one before it; [with the mend](edge-strip-pathfind-mended.png), 764 ms. In both the fifth frame shows the cross-fade mid-way (names at both sizes, as the camera round saw), and the last three the connections look at rest. A screencast frame waits for the picture's raster as well as for the main thread, which in this container is drawn on the processor.

## What is left, and the options

The one restyle a change of look needs is proportional to the picture: the looks' sizes are custom properties on the map that every element inherits, so every element's style is computed again, here about 0.05 to 0.1 ms an element under load. Three ways to make it smaller, none taken here, for root:

1. **Skip the style of cards off the frame** (`content-visibility: auto` on cards wholly outside it). Chromium does not compute the style of a skipped subtree until it nears the screen, so a change of look would restyle what is seen. It was tried on 2026-11-06 for raster and not taken (`direction.md`, "Tried and not taken"; [the numbers](../../../2026-11-06/Screenshots/card-culling/README.md)): it did not pay in software raster, and it brings paint containment (clipping the dots grown outward, the hubs, the test halo) and a stacking context for every card, which that trial gated. The cost here is style, not raster, so the question is new; the gated trial's patch is the place to start.
2. **Cheaper elements**: fewer custom properties computed for each card and row (a card carries dozens; a row its own scale and dot formulas, and since this round the look left's three); a refactor of `reading.css`.
3. **The Files Only re-layout at the overview's edges**: it measures every card twice (`refreshReadingGeometry` after the attribute changes, then `pageMeasurer` again inside `layoutScene`, the widths kept); perhaps once would do. That is `branch-renderer.ts`, outside this round.

## The pictures at rest are the same

`rest-pictures.cjs` takes, on `pathfind.ts` and the estate's `PaymentsContext.cs`, the arrival (reading), three Zoom Out presses (connections), four more (overview), four Zoom In presses (connections, from overview) and three more (reading, from connections), each 700 ms after the map's rest, as a screenshot and as a dump of every element in the map (its box on screen to a hundredth of a pixel, display, visibility, opacity, transform, scale, font size, colour, and its `::before` and `::after`). `main` was taken twice and the mend twice, and each pair compared:

- **Reached on the way out (reading, connections, overview), the mend against `main`:** every element the same in all six (0 of 903 on the estate, 0 of 5,708, 5,540 and 5,456 on `pathfind.ts`), and every pixel the same but in the corner of the Zoom Out button just pressed (a box of about 35 × 40 px at the bottom left), which differs as much between two runs of `main`.
- **Reached on the way back in:** two runs of the same bundle already differ (`main` against `main`: 38 to 582 elements, every difference a hundredth of a pixel in place, and up to 45,040 pixels), since the camera's way back lands a hundredth of a pixel apart from run to run; the mend against `main` differs by the same kind and amount (4 to 109 elements, a hundredth of a pixel). Nothing differs in display, visibility, opacity, size or colour.

The data-look-from that now stays written at rest changes nothing drawn.

## The case that holds it

`tests/e2e/look-change-cost.spec.ts`, two cases on the estate, by count and not by clock: a change between reading and connections restyles the whole map once each way (a restyle of the whole map is measured on the page itself, by setting one custom property on the map); and the fade's class, added and taken away at rest in each look, restyles less than half of what the whole map's restyle touches. Both pass on the mended build; both fail on `main` at `924bec80`: three whole-map restyles each way (the whole map 583 elements on the estate; out, 592, 698 and 703), and the class's coming and going restyling 702 elements in connections against the whole map's 568, 454 against 385 in overview, 757 against 583 in reading.

## Making it again

From the repository root, with a bundle served (`npx http-server dist/explorer -p 8827 -c-1 --silent`), under the browser lock:

- `JOURNEY=wheel-out,wheel-out,wheel-in,wheel-in OUT=result.json TRACE_OUT=trace-%.json npx tsx AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/look-change-freeze/look-change-trace.cjs` (also `JOURNEY=arrival`, `SUBJECT=…`, `BASE=/samples/estate/`, `RUNS=2`, `SELECTORS=1` for Chromium's selector statistics, `GAPS=1` to print every long frame);
- `node …/edge-frames.cjs result.json` for the frames at each change; `node …/style-per-change.cjs trace-1.json 1300 700` and `node …/look-change-tasks.cjs trace-1.json` for the style passes and tasks. The traces (6 to 13 MB each) are not kept;
- `OUT_DIR=dir npx tsx …/rest-pictures.cjs`, then `COMPARE=dirA,dirB npx tsx …/rest-pictures.cjs`, for the pictures and dumps at rest; `OUT=strip.png npx tsx …/edge-strip.cjs` for a strip.
