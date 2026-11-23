# What fills the time before the transition's first frame

**Historical evidence, 2026-11-23, about 01:27 to 02:15 UTC.** Taken by a builder at `4ee8f124b` (the mend of the press of 3D) merged with the day branch's tip `f152fbb6e`, bundles built in its own worktree, one worker, every browser run a hold of the lane. The probe was a spec file added for the round and removed again (`tests/e2e/zz-first-frame-probe.spec.ts`, never committed): the case's own instrument (the layer's append noted before the page's code runs, the first animation frame that finds the layer) with Chromium's trace of the interval taken through `browser.startTracing` (timeline, style invalidation tracking, the V8 sampling profiler). The raw traces (28 to 288 MB each) stayed in scratch and are gone; their readings are here, and the probe and the two trace readers are kept beside this page as text ([probe.spec.ts.txt](probe.spec.ts.txt), [analyze-trace.mjs.txt](analyze-trace.mjs.txt), [invalidations.mjs.txt](invalidations.mjs.txt)), so that the measure can be taken again. Bundle positions (`index.js:5177:104999`) were read against the built bundle and are named by their source lines below.

## What the case measures, in the code's own terms

- **The transition's start** is `document.body.append(layer)` in `animatePerspective` (`perspectiveTransition.ts`, line 270): the case's init script wraps `Element.prototype.append` and notes the time when the appended node is the `.perspective-transition` layer.
- **The first frame** is the first `requestAnimationFrame` callback of the case's own watch that finds the layer. A callback runs at the start of a frame, before that frame's style, layout and paint, so what the case counts is everything the page does between the append and the next frame's start: the rest of the task that appended the layer.

That task is the last slice of the cards' copies (a `MessageChannel` task) and the microtask chain it resolves: `capture.copied.then(...)` in `changePerspective` (`index.ts`, lines 1430 to 1451), which runs `animatePerspective` (builds the layer, appends it, draws `frame(start)`) and then `releaseCover()` (line 1450).

## The timeline, from the browser's own trace

This repository's picture, `graph.ts` as the case opens it, 14,810 elements under `#view-map`, the transition's layer 1,077 elements to 2D and 1,079 to 3D. Four traced presses each way, at loads of 6.5 before and 5.3 after the first hold's three and 3.8 before and 3.6 after the fourth (the tracing slows the page's script, the cards' copies several times over, and the interval itself little: its first frames read 300 to 427 ms traced against 346 to 418 untraced; read the shape and the shares here, and the untraced numbers below for time). The four presses' readings are in [traced-presses.jsonl](traced-presses.jsonl).

**To 3D**, milliseconds from the layer's append (traced runs 1 to 4, first frame by the case's measure 390, 316, 300, 427):

| From | What | ms |
| --- | --- | --- |
| 0 | `document.body.append(layer)`: one `:has()` style invalidation scheduled on `<body>` (stack: `Element.append` < `animatePerspective`) | under 1 |
| 0 | `frame(start)`, the first drawing of the canvas and the copies' places | 9 to 31 |
| 9 to 31 | `releaseCover()` → the hold's release (`perspectiveTransition.ts` 413 to 423): `held.cover.remove()` schedules a second `:has()` invalidation on `<body>`; then **`void getComputedStyle(root).opacity` (line 418) forces `UpdateLayoutTree` of 1,085 elements** (the layer's 1,079 copies and six more), self time in `Document::recalcStyle`, the profile wholly in the release function | **353, 293, 277, 379** |
| | `settleViews()`: the 2D map, now not drawn, made inert | under 1 |
| 299 to 427 | **The first frame** (the case's mark) | |
| +0 | that frame's callbacks: the transition's `frame` 7 to 29 ms; the 2D key's observer (`panels/spatial-legend.ts`): `checkVisibility` on every `.local-cell`, 11 to 16 ms with a forced layout of 8 ms, then `replaceChildren` of the key's row, which schedules a third `:has()` invalidation on `<body>` | 25 to 45 |
| | **that frame's style: `UpdateLayoutTree` of 4 elements, 248 to 344 ms in `Document::updateStyleInvalidationIfNeeded`**; the invalidation set matched 320 `.symbol-row` elements inside the 2D map just put away | **344, 272, 248, 294** |
| | commit, then frames of 35 to 55 ms (traced) | |

So to 3D a person waits two long frames, not one: the probe's frame clock of traced run 1 (milliseconds from the press) reads the last frame before the transition at 3,110.9, its start at 3,127.4, then frames at **3,517.0 and 3,920.7**, then 3,946.8, 3,963.4 and every 16.7 ms on. The case counts the first gap and not the second.

**To 2D**, traced runs 1 to 4 (first frame 352, 363, 304, 363):

| From | What | ms |
| --- | --- | --- |
| 0 | the append, its `:has()` invalidation on `<body>`; `frame(start)` | 2 to 9 |
| 2 to 9 | the hold's release, the cover's removal (a second `:has()` invalidation) and **the same forced read, `UpdateLayoutTree` of 1,413 elements**: the layer's 1,077 copies and about 336 `.symbol-row` elements of the map now shown, matched by the two `:has()` invalidations | **347, 357, 299, 351** |
| 304 to 363 | the first frame, then frames of 23 to 28 ms: no second stall this way | |

**What a person misses.** The motion's clock starts when the layer is built (`const start = performance.now()` beside the append, line 272), not when it is first seen, and it runs 1.4 s. So the first painted frame already stands at about a quarter of the motion, past the 0.3 s in which the directory membranes peel, and to 3D the second painted frame at about half. The traced runs' frame clock: to 2D the first frame 304 to 363 ms after the start, then frames 24 to 28 ms apart; to 3D the first 300 to 427 ms after the start and **the second 295 to 404 ms after that**, then 26 to 56 ms apart; the layer gone about 1.03 to 1.15 s after its first frame either way.

## The causes

**1. The copies' style: about 300 µs an element, both ways.** Each copy is a shallow clone given every computed property of its original as one inline declaration block (`visualCopySteps`, `perspectiveTransition.ts` lines 475 to 484). On this map an element's computed style lists **795 properties, 323 of them custom properties** (`--…`, the page's tokens, inherited by every element). A copy's custom properties are never read: every property that used one is copied with its value already worked out, and the layer inherits the page's own. Measured in the page, 1,000 copies made the same way from the map's card elements and their style forced (load about 3.8; [copy-style-cost.jsonl](copy-style-cost.jsonl)):

| Copies carrying | ms for 1,000, two runs |
| --- | --- |
| all 795 declarations | 248, 201 |
| the 472 that are not custom properties | 90, 94 |
| none | 11, 16 |

So the custom properties are 41 per cent of the declarations and some 60 per cent of the style's cost. The forced read at line 418 is where the cost is paid, not why: the layer's style must be worked out before its first frame is painted whether or not anything reads it first, so taking the read away would move the same 300 ms past the case's mark and show the person the motion no sooner. It was left as it is.

**2. A walk of the whole page from one small write in the first frame, paid per copy (3D only, the second frame).** The trace's invalidation tracking names the write and the walk: every insertion or removal of an element anywhere under `<body>` (the layer, the hold's cover, the key's row) schedules on `<body>` the page's one `:has()` descendant invalidation set, `{.perspective-controls, .symbol-row, .legend-row--gathered, .pin-tray, .history-scrubber, #controls}`, which the browser answers by walking the document beneath it. Its members come from the stylesheet's non-subject `:has()` rules: `.symbol-row` from `reading.css` lines 2, 10 and 11 (`.node-card:is(:has(.local-file-read), .local-slot-card) .symbol-row`), the others from `shell.css` 416 to 428 (`#main:has(#detail-panel.visible…)`) and `local.css` 476 (`body:has(#map-container[data-lod="overview"]) …`, which makes `<body>` itself an anchor). The first two of these walks fall inside the forced read and cost 2 to 3 ms there (the layer, just inserted, is restyled whole and not walked). The third, from the 2D key's `replaceChildren` in the first frame's callback, is answered in that frame's own style update, once the layer's 1,079 copies are styled and stand in the walk's way: **248 to 344 ms in `Document::updateStyleInvalidationIfNeeded`, with 4 elements restyled.**

**What that walk pays for is the copies, not the rows.** On first reading the trace pointed at the 320 `.symbol-row` elements it matched inside the map just put away. The measure below says otherwise: a stylesheet with `.symbol-row` taken out of the `:has()` rules did not shorten the second frame (186 ms against 173 and 185 with the candidate alone), while the candidate, which changes nothing of the map and only takes 41 per cent of the declarations off each copy, shortened it by 40 per cent (from 281 to 310 down to 173 to 185). So the walk's cost is paid per copy and in proportion to the copy's inline declarations. By what operation of the browser was not found: no trace event names a copy in that interval, and the profile is native code throughout. (The code's own comment at `perspectiveTransition.ts` line 468 already knows that a copy's large inline style is serialized lazily when its attributes are read; whether the walk does that was not shown.)

That write is the key's observer of the sixteenth milestone (`panels/spatial-legend.ts` line 145, "read again whenever the map's view is shown or put away"): the hold's release takes `perspective-held` off the map's view, the observer asks for a frame, and in the transition's first frame it reads every cell's `checkVisibility` (11 to 16 ms), finds none drawn, and empties the row. The milestone took out the line that kept the row from being drawn while the map was away ("the row may be drawn empty while nobody can see it"); drawn empty, it costs this. By the code the write comes with that change; whether the second stall stood on a build before it was not measured. It is the `:has()` rules that make one small write cost 300 ms; any element inserted or removed under `<body>` while the map is away pays the same, the key's row is only the first.

Nothing else of size stands in the interval: the canvas's drawing is under 30 ms, the layout of the layer 7 to 8 ms, paint 2 to 10 ms and the canvas's hand-over to the compositor 9 to 23 ms a frame; the other threads' tasks (compositor, Viz, GPU) run beside the main thread and do not hold it (the 3D picture is drawn by the graphics card in this container, not a software renderer). Line numbers are those at `4ee8f124b`.

## The candidate for the first cause, measured

**`ebe5759f1`**, one commit of its own, said in its message to be a candidate for review: in `visualCopySteps` (`perspectiveTransition.ts`, the loop at lines 475 to 484 of `4ee8f124b`) a name beginning `--` is skipped, and the declarations are pushed into a list rather than written at the property's index. Nothing else.

How it was measured: the two builds' client scripts were kept side by side and the probe put one or the other in place before each page was opened (the server serves files as they stand), run turn and turn about in one hold, the same data for both; each press is the case's own instrument, with the machine's one-minute load read immediately before and after it. One hold, 02:00 to 02:05 UTC, loads 1.7 to 3.8 throughout; every reading is in [before-and-after.jsonl](before-and-after.jsonl). Milliseconds, five runs each way in the order taken, then the median:

| This repository's picture (`graph.ts`) | Before | With the candidate |
| --- | --- | --- |
| **First frame to 2D** (bound 400) | 347, 314, 332, 310, 390; **332** | 181, 168, 179, 173, 168; **173** |
| **First frame to 3D** (bound 400) | 311, 295, 316, 312, 288; **311** | 178, 167, 169, 174, 158; **169** |
| The second frame to 3D, after the first | 298, 281, 310, 296, 279; 296 | 185, 173, 180, 187, 171; 180 |
| Press of 2D less its render (bound 500) | 301, 299, 280, 291, 286; 291 | 296, 285, 302, 286, 285; 286 |
| Press of 3D returned (bound 500) | 271, 252, 269, 251, 263; 263 | 276, 263, 266, 281, 271; 271 |
| The cards' copies, the page's own measure, to 2D | 2,866, 2,696, 2,701, 2,798, 2,756 | 1,854, 1,754, 1,981, 1,784, 1,793 |
| The same, to 3D | 2,363, 2,218, 2,449, 2,299, 2,306 | 1,615, 1,554, 1,558, 1,608, 1,566 |
| **The motion begins**, from the press, to 2D | 4,909, 4,745, 4,598, 4,784, 4,792; **4,784** | 3,710, 3,602, 3,799, 3,608, 3,588; **3,608** |
| **The motion begins**, to 3D | 2,722, 2,554, 2,808, 2,652, 2,642; **2,652** | 1,838, 1,761, 1,776, 1,829, 1,770; **1,776** |
| The layer gone, to 2D / to 3D (medians) | 5,897 / 3,779 | 4,927 / 3,041 |
| Frames drawn while the layer stands, to 2D | 43, 48, 47, 48, 41 | 54, 56, 55, 55, 57 |
| The same, to 3D | 45, 46, 45, 46, 46 | 52, 53, 53, 51, 53 |
| Longest gap between frames after the second, to 2D / to 3D | 42 to 45 / 47 to 49 | 41 to 45 / 40 to 44 |

| The estate (`PaymentService.cs`), one run each, layer 142 and 153 elements | Before (load 2.5) | With the candidate (load 1.7) |
| --- | --- | --- |
| First frame to 2D / to 3D | 48 / 54 | 28 / 56 |
| Second frame to 3D | 47 | 33 |
| The copies to 2D / to 3D | 331 / 362 | 236 / 261 |
| The motion begins to 2D / to 3D | 705 / 421 | 616 / 322 |

**What the candidate does, read from these.** The first frame comes 160 and 140 ms sooner, each way, every run under the bound with some 220 ms to spare where before it stood 290 to 390 against 400. It does a second thing the case does not hold: the copies, made in slices before the motion, read 41 per cent fewer properties of each element, and are done about 1 s sooner on this picture, **so the motion begins 1.2 s sooner to 2D and 0.9 s sooner to 3D**, and 0.1 s sooner on the estate. The presses themselves do not move (the press of 3D reads within 10 ms either way; its spread is the copies' second slice, below). The motion runs the same 1.4 s on its clock, the layer standing 1.1 to 1.3 s after its first frame on both builds, and more of it is drawn (some ten more frames each way, since less of it falls before the first). The second frame to 3D is still 171 to 187 ms: the candidate shortens it and does not take it away.

**The second cause, taken away for one run.** With the candidate and a stylesheet in which `reading.css`'s three rules select `.node-card .symbol-row` without `:has()` (a look not the product's: the rows of a card without a reading control are laid out as grid rows too; built for the measure only, never committed), one run, load 3.8 to 3.4: first frame to 2D 166, to 3D 189, **the second frame to 3D 186**. Taking `.symbol-row` out of the `:has()` set left the second frame where the candidate had it, which is what moved the reading of the second cause above from the rows to the copies.

**What the eye sees.** The frames were not taken as pictures this round: the hold for them stood sixth in the lane at the round's end and was withdrawn. What stands for the eye is the frame clock above, every frame from the press until the layer is gone: on both builds the motion begins with one frame, runs at 16 to 45 ms a frame and ends when the layer goes, the same length on its clock; with the candidate it is first drawn at about an eighth of its course where before it was a quarter (`frame` reads its progress from the layer's start), and on the way to 3D the second frame now jumps from an eighth to about a quarter where it jumped from a quarter to a half. Whether the copies look the same, a card's colours and type, was not looked at by eye; by the code nothing a copy draws reads a custom property, since every property is copied with its value worked out, and no browser case reads one from the layer (a search of `tests/e2e` for the layer's classes and `getPropertyValue("--`).

**The probe's own failures.** The two estate runs each failed after their readings were taken, at the probe's last look: after the return to 3D the subject's name stood 30.9 px from the room's centre, the same on both builds, where the probe asked for 8. The case does not make that return on the estate; it is noted, not followed.

## What would take the rest away, not built

With the candidate, what is left is about 170 ms before the first frame each way and, to 3D, a second frame of about 180 ms. Both are the copies' remaining 472 declarations an element, met once by the style the first frame needs and once, to 3D, by the walk the key's write sets off. Not built or measured, in the order I would try them:

- **The key not writing while the map is put away** (`panels/spatial-legend.ts` line 145, outside this round's files): the sixteenth milestone let the row be drawn empty while the map is away; drawn empty in the transition's first frame, it is the trigger of the second frame's walk. Leaving the row as it stood until the map is shown again, then reading it, would take that write out of the transition, and is the one step that touches no rule of the stylesheet.
- **No `:has()` anchor on `<body>` or `#main`**: `body:has(#map-container[data-lod="overview"])` (`local.css` 476) and the four `#main:has(#detail-panel.visible…)` rules (`shell.css` 416 to 428) written as a class or attribute the page already knows (the map's level of detail, the detail panel's being open), so that no insertion anywhere in the page schedules a walk of all of it. The measure above took `.symbol-row` out of the set and left the anchors; the walk, and the second frame, stood. (`reading.css` lines 2, 10 and 11 could lose their `:has()` the same way if the card carried a class for having its file's reading control, written where `views/localView/card-reading.ts` adds the control; by this measure that is not where the time goes.)
- **Fewer declarations a copy**: of the 472 left, most hold the value the copy would have anyway (a property's initial value, or the parent copy's for an inherited one). Copying only those that differ from a reference element's computed style would take the copies toward the 11 to 16 ms a thousand of the bare measure, both frames with them, and the copying before the motion again. It is the larger change: the reference must be read under the same parent, and a property inherited by a child copy must still be written where its parent's differs.

The forced read in the hold's release (line 418) is not a cause and was left: the layer's style is owed before its first frame whether or not anything asks for it first.

## Secondarily: the time after the press's handler

In the traced presses of 3D the click's handler took 131 to 154 ms by the page's own measure (`live-docs:switch-press`) and the case's `returned` read 263 to 299 ms. Between them, traced run 2 shows: the handler's microtasks 16 ms, one frame 20 ms, and then **a slice of the cards' copies of 100.7 ms** (`slice` in `captureLocalScene`, `perspectiveTransition.ts` lines 163 to 178), whose message was posted by the first slice inside the handler and so stands before the case's own. Its budget is "as long as the page was away since the last slice, within the bounds" (`COPY_SLICE_MOST = 100`): the handler kept the page away for more than 100 ms after the first slice, so the second slice takes the most, 100 ms, before the page answers anything. So the 136 to 155 ms of the sixteenth milestone is the copies' second slice at its largest, the handler's microtasks and a frame; it is the copying, not the press. What the five merges added at the press was not looked for this round.

## How it scales, and what the day added

The interval is paid per copied element, not per element of the map: before the candidate about 0.29 ms a copy on this picture (311 to 332 ms for 1,077 to 1,079 copies) and 0.34 on the estate (48 to 54 ms for 142 to 153); with it about 0.16 on this picture. So the 85 and 70 ms the day added to the first frame (`landing2-3d`, section 5) are, by this reading, what the map's growth from 13,781 to 14,810 elements adds to the copies that meet the destination's frame, together with whatever the day's code added to each element's computed style (more custom properties among the page's tokens would cost every copy). Neither the number of copies nor the number of custom properties was counted on the earlier builds, so this is a reading, not a measure.

## Not done

- The case itself (`force-graph-focus.spec.ts`, "the 2D and 3D presses return at once…") was not run on the candidate: a hold of it before the candidate was queued and withdrawn when the lane stood five deep, and the before and after above were taken by the probe with the case's own instrument instead. It is owed, five runs, before the candidate is taken.
- The transition's frames as pictures, both ways on both pictures, before and after: withdrawn the same way. Owed, with the copies' look by eye.
- The estate traced; the estate's before and after at five runs (one each here).
- The gate: lint over the changed file passed and the Explorer's type-check passed (`npm run build -w packages/explorer`); `live-docs:generate` after the probe was removed changed no doc (1,360 unchanged); no unit or browser suite was run.
- No command was refused this round.
