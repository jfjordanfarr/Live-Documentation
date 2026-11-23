# What fills the time before the transition's first frame

**Historical evidence, 2026-11-23, about 01:27 to 02:08 UTC, and a second milestone after the root's review from 02:08 to 03:10 UTC (its own section at the end).** Taken by a builder at `4ee8f124b` (the mend of the press of 3D) merged with the day branch's tip `f152fbb6e`, bundles built in its own worktree, one worker, every browser run a hold of the lane. The probe was a spec file added for the round and removed again (`tests/e2e/zz-first-frame-probe.spec.ts`, never committed): the case's own instrument (the layer's append noted before the page's code runs, the first animation frame that finds the layer) with Chromium's trace of the interval taken through `browser.startTracing` (timeline, style invalidation tracking, the V8 sampling profiler). The raw traces (28 to 288 MB each) stayed in scratch and are gone; their readings are here, and the probe and the two trace readers are kept beside this page as text ([probe.spec.ts.txt](probe.spec.ts.txt), [analyze-trace.mjs.txt](analyze-trace.mjs.txt), [invalidations.mjs.txt](invalidations.mjs.txt)), so that the measure can be taken again. Bundle positions (`index.js:5177:104999`) were read against the built bundle and are named by their source lines below.

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

## Second milestone, 02:08 to 03:10 UTC: is the candidate's picture the same, and do the cases pass on it

The root's review accepted the measurement and asked for four things before the candidate is taken: what a copy draws that an inline declaration cannot reach, by the code; the layer pixel for pixel with and without the candidate; the case and the specs that change perspective, on the candidate; and the gate's other checks. "Not done" above is answered here.

### 1. By the code: what a copy draws from the stylesheets

`visualCopySteps` clones each element shallowly and takes off its `id`, `class`, `tabindex`, `role`, every `data-` attribute and every `on…` attribute before writing its computed style inline (`perspectiveTransition.ts` lines 468 to 471). So a copy keeps only its tag and its other attributes (`aria-…`, `title`, `type`, `href`, an SVG's geometry), and stands in the layer under three things that keep their classes: the layer itself (`.perspective-transition.local-map-host`), a card's wrapper (`.perspective-card.local-column.center`, cards only) and `<body>`. A copy's own pseudo-elements are not copied; they are drawn afresh from the stylesheets against the copy where it stands.

- **Pseudo-elements.** All 114 selectors of the Explorer's ten stylesheets that draw a `::before`, `::after`, `::marker`, `::first-letter`, `::placeholder`, `::backdrop` or `::-webkit-…` were read (a search of `client/styles/` for each). All but 14 carry a class or an id in the compound they draw on (`.node-card.test-backed::before`, `.local-directory-cell::before`, `.local-closed-shape--tab::before`, `.symbol-row.local-row-moving::before`, `.local-file-name-held::after` and the rest), which a copy no longer has. The 14 whose drawn compound is a tag (`summary`, `input`, `span`) each need an ancestor class or a `data-` attribute that nothing in the layer has: `.sources-group`, `.history-step-dialog`, `.filter-toggle`, `.tuning-slider`, `.sidebar-checkbox`, `.sidebar-details`, and `summary[data-tuning-changed]` (a `data-` attribute, taken off a copy). **So no stylesheet rule draws a pseudo-element on a copy, before or after the candidate;** the browser's own pseudo-elements (a list item's or a `summary`'s `::marker`, a placeholder, a scrollbar) read no custom property. One consequence, the same on both builds and not the candidate's: a card's test-backed halo, which is its `::before`, is not in its copy.
- **`!important` rules,** the one way a stylesheet value could override a copy's inline one: five declarations in two rules, `body.dragging *` (cursor and selection, no custom property) and `.internals-anchor` (a class). Neither reaches a copy's look through a custom property.
- **Animations.** A copy carries its original's computed `animation-name`, so an original caught mid-animation at the capture would start that animation again in its copy, with the keyframes resolved against the copy. Of the keyframes that read custom properties, `backward-rise` runs on the perspective controls, never copied; `local-step-mark` and `local-step-mark-membrane` (a card or membrane the history's step marks, for a second) read `--state-selected-rgb`, `--state-selected` and `--line-membrane`, palette tokens the palette writes on the page's root only (`palette.ts`, `paletteStylesheet`), which a copy inherits as before; **and the nine `local-look-*` keyframes** (`reading.css` 742 to 748), which run for 160 ms under `.local-look-fading` after a change of the map's look, read custom properties set between the root and the element: by class rules on `.local-slot-card` and its rows (`--name-scale`, `--row-control-scale`, `--dot-scale`, `--node-control-scale`, `--title-scale` and their `-from` forms, `reading.css` 152 to 350 and 665 to 679), by the map's controller on the map (`--look-zoom`, `controller.ts` 2066) and by the card's reading on its foot (`--foot-y`, `--foot-scale`, `card-reading.ts` 881 to 882). Here the candidate changes something: before it, a copy caught within 160 ms of a look change started its own 160 ms replay from its original's values; with it, the copy finds none of them and every one falls back to 1, so its replay starts from no scaling. Neither is the look the map had, and either lasts 160 ms from the copy's insertion.
- **Transitions:** a card's copy has `transition: none` written over its own (`perspectiveTransition.ts` line 260), and no other copy changes style after its insertion but a directory shell's opacity, whose transition values are copied already worked out.

So by the code the candidate changes a copy's picture in one case only: a press within 160 ms of a change of the 2D map's look, and only in the 160 ms that follow the copy's insertion.

### 2. By the picture: the layer pixel for pixel

**How.** A probe spec of the round (`tests/e2e/zz-first-frame-pixels.spec.ts`, never committed; its text is kept beside this page as [pixels.spec.ts.txt](pixels.spec.ts.txt)) kept the two builds' client scripts side by side, as in the first milestone, and put one or the other in place before each page was opened, turn and turn about in one hold, the data the same. **The motion's clock was held still by the page's own frame requests:** before the page's code ran, `requestAnimationFrame` was wrapped, and the first request after the layer's append, which is the transition's own (it draws `frame(start)` at once and asks for its next frame at its end), and every request made from inside it, were taken by the probe. To 3D the layer was left as `frame(start)` drew it, the motion's first moment (progress 0: every card unfolded at its 2D place, every membrane whole, every wire in its 2D course, nothing of the 3D picture drawn). To 2D one frame was given at 1,399.5 ms of the 1,400, the motion's last moment before the layer goes (progress 0.0004: the same, the cards returned), and the layer then left as that frame drew it. Nothing else's frames were touched. Each page was brought to rest first (the 2D map still for a second; the 3D picture at `aria-busy="false"` and its subject's name still for a second), so that the 2D map is placed the same from one load to the next; the layer's box was captured a second after the clock was held. Each pair was taken three times, before, after and before again, so that the before-to-before pair says what differs with nothing changed.

**The pictures.** This repository at `graph.ts`, both ways: in the frame 5 and 6 cards, 3 and 4 of them test-backed, 5 open directory shells, 154 and 110 wires of which 9 and 4 gathered into a file pair's width. This repository's `scripts` directory (`?dir=scripts`, the picture `spatial-legend.spec.ts` keys its kinds on), both ways: 5 cards, 3 test-backed, 2 open shells and 6 closed directories drawn as cells of the two kinds there are (implementation, test). The estate at `PaymentService.cs`, both ways: one card, 2 open shells, 17 wires. Between them, everything the 2D legend names: the offering and using wires, the test-backed card, a gathered file pair's width, the kinds' cells; and both kinds of directory shell.

| Picture, way | Pixels of the layer | Before against after | Before against before again |
| --- | --- | --- | --- |
| `graph.ts`, to 3D | 1,019 × 670 | **0** | 0 |
| `graph.ts`, to 2D | 1,019 × 601 | **0** | 0 |
| `scripts`, to 3D | 1,019 × 670 | **0** | 0 |
| `scripts`, to 2D | 1,019 × 601 | **24, up to 114 levels of 255**, then **0** in a second hold | 0, 0 |
| estate, to 3D | 1,019 × 670 | **0** | 0 |
| estate, to 2D | 1,019 × 601 | 97 and 96 in two holds, up to 2 levels | 24 and 24, up to 1 level |

Every comparison is in [pixels-compare.jsonl](pixels-compare.jsonl), every capture with its load, its counts and what stood near the layer's bottom edge in [pixels-captures.jsonl](pixels-captures.jsonl), and the `contact-sheet` readings in [pixels-diagnose.jsonl](pixels-diagnose.jsonl). The pair kept beside this page is `graph.ts` to 3D: [before](layer--graph-ts-to-3D--before.png) and [after](layer--graph-ts-to-3D--after.png), the same 236,171 bytes each.

**What the differences are, looked at.**

- **The estate to 2D**: every differing pixel lies in the layer's bottom three rows, x 601 to 641, on both builds alike. The page's 2D/3D control stands just below the layer there (`button.has-backward-wires.backward-rising`, its box from x 605, y 612), and it was playing its backward cue, the 1.8 s `backward-rise` glow (`local.css` 323), whose box shadow (blur 11.0 to 12.7 px, spread 2.9 to 3.6 px, at a different moment of its course in each capture) reaches up over the layer's bottom edge. A page control drawn over the layer, at a different instant each time; not the layer.
- **`scripts` to 2D, the first hold** ([the difference marked in red over the picture before](diff--scripts-to-2D--first-hold.png)): the 24 pixels are the two "···" of the closed directory `contact-sheet`'s More: in the before picture it stands just after the name, in the after picture some 50 px further right, at the label's end. Nothing else of the picture differs. It did not come again. In a second hold the pair was identical pixel for pixel, and in every later capture where the More's place in the frozen copy was read from the copy itself it stood 118 px from the copy's left: five with the candidate and nine without. In two more runs, the original's More, sampled every 16 to 40 ms from the press of 2D for four seconds, stood at 118 px throughout on both builds, and two copies made afresh at the freeze by the transition's own method, one with the custom properties and one without, both put it at 118 px. So the custom properties do not place it. What the one capture froze was the original at the moment its copy was made, which is earlier with the candidate since the copying is faster; whether that moment met a passing state of the label, and what that state was, was not found. **Once in seven captures with the candidate, never in thirteen without; not shown to be the candidate's, and not shown not to be.**

### 3. The cases on the candidate

**The press case**, `force-graph-focus.spec.ts` "the 2D and 3D presses return at once…", five runs at one worker in a hold of its own (02:29 to 02:30 UTC; load 2.45 just before it, and 3.09 as the one-minute average read as it ended, which spans the five): **five passed.**

| Run | First frame to 2D (400) | First frame to 3D (400) | Press of 2D less its render (500) | Press of 3D (500) | Longest wait after 2D / 3D (1,000) |
| --- | --- | --- | --- | --- | --- |
| 1 | 261.6 | 214.8 | 360.9 | 297.4 | 287 / 440 |
| 2 | 192.3 | 190.5 | 318.0 | 278.2 | 217 / 416 |
| 3 | 189.9 | 184.8 | 309.5 | 271.6 | 214 / 360 |
| 4 | 191.0 | 181.1 | 286.8 | 285.5 | 227 / 389 |
| 5 | 190.1 | 172.9 | 428.0 | 333.9 | 207 / 356 |

Against the brief's five of the build before, 346 to 418 to 3D and 350 to 414 to 2D, the first frame now comes at 173 to 262 ms. The press of 2D less its render (360.9, 318.0, 309.5, 286.8, 428.0) is the press's own time, unchanged by the candidate.

**The focus spec whole**, one worker (02:31 to 02:34 UTC, load 2.92 at its start): 17 passed, 1 failed, the known red of the 3D pick, "a focused URL centers its node, direct clicks pin it, and More opens its details": "the actions offered should be those of packages/engine/src/live-docs/graph.ts; they are: "Actions for the shell of packages/explorer" (shell:packages/explorer)… aria-busy is true; its motion has run 409 substeps". The press case passed within it (first frame 193.9 to 2D, 190.3 to 3D).

**Every spec that changes perspective**, found by a search of `tests/e2e` for presses of the 2D and 3D controls (`.perspective-controls button`, a button named 2D or 3D, the page's own `textContent === label`): 22 files besides the focus spec. Each was run whole in a hold of its own, at two workers, or at one for the two that carry cases tagged `@alone` (`local-map-branches`, `history-scrubber`):

| Spec | Workers | Result |
| --- | --- | --- |
| **`perspective-zoom`** | 2 | 5 passed, **1 failed**: "perspective copies preserve every computed SVG declaration without live identifiers or hooks" (line 53) |
| `spatial-legend` | 2 | 6 passed |
| `inspection` | 2 | 14 passed |
| `local-map-mirror` | 2 | 10 passed |
| `backward-cue` | 2 | 6 passed |
| `card-reading` | 2 | 17 passed |
| `local-map-branches` | 1 | 11 passed |
| `history-2d` | 2 | 6 passed |
| `no-network` | 2 | 9 passed |
| `force-graph-directories` | 2 | 4 passed |
| `returning-connections` | 2 | 3 passed |
| `local-map-framing` | 2 | 7 passed |
| `explorer-navigation` | 2 | 8 passed |
| `local-map-packing` | 2 | 5 passed |
| `history-scrubber` | 1 | 17 passed |
| `labels-and-controls` | 2 | 6 passed |
| `overview-files` | 2 | 10 passed |
| `force-graph-shells` | 2 | 9 passed |
| `camera-intent` | 2 | 29 passed |
| `webgl-refused` | 2 | 9 passed |
| `force-graph-exploration` | 2 | 8 passed |
| `return-cost` | 2 | 3 passed |

**The one failure is the candidate's, by design, and is not a picture.** The case (written 2026-10-20 with the single declaration block the copies are written in, `708f0cfa3`) reads every computed property of a pin's SVG path in the 2D map, its own custom property `--snapshot-punctuation: "left;right:still"` among them, leaving out five that hold the map's zoom state, and holds that the path's copy in the layer carries each, inline, with the same value. With the candidate the copy carries none of the custom properties, and the failure says exactly that: 356 lines of the expected object differ, every one a name beginning `--` (`--action-size`, `--actions-count`, `--controls-y-far-0` and on), and no other property differs. The case's own comment already treats five custom properties as "the map's state at the moment of a reading, not the SVG's own declarations"; the pictures above say none of the others draws anything in a copy either. So the case and the candidate cannot both stand as they are. The case was not edited.

### 4. The gate's other checks

Each exit status read from the command itself.

- `npm run lint`: exit 0 (on the tree with the round's probe spec in it, which lint covered too).
- `npm run build`: exit 0.
- **The Vitest files that cover `perspectiveTransition.ts`: there are none.** `vitest related packages/explorer/src/client/views/perspectiveTransition.ts --run` found no test file whose imports reach it ("No test files found"). The Explorer's unit cases were run instead (`vitest run --project unit packages/explorer`): 105 files, 1,342 cases, all passed.
- `npm run live-docs:generate`, after the probe spec was removed: exit 0, 1,360 files, 0 created, 0 updated; nothing to commit.
- The lane: 29 holds of this builder's, among other builders'. Fifteen of the spec holds were queued, withdrawn before they began so that the diagnosis of the `scripts` capture could go first (had the candidate needed a mend, they would have tested the wrong build), and queued again; every one then ran. No command was refused.

### What this says of the candidate

**It is not ready to merge as it stands, for one reason: `perspective-zoom.spec.ts` line 53 holds the copies to carrying every custom property, and fails.** Everything else holds:
- the press case passes five times of five, its first frame at 173 to 262 ms;
- every other spec that changes perspective passes, and so does every case of the focus spec but its known red;
- the layer is the same, pixel for pixel, on three pictures both ways, apart from:
  - a control's glow over the estate's bottom edge, which differs between two runs of the same build too;
  - one capture of seven, with the candidate, in which `contact-sheet`'s More stood 50 px to the right. That capture is unexplained, did not come again, and is not placed by the custom properties.

The fork is the root's, and no variant of the candidate passes the case as written. The case looks at a path deep inside a card, so the custom properties would have to be on every copy, which is the cost itself. The two ways:
- **The case says what the copy must hold:** every computed declaration but the custom properties, since nothing in the layer reads them (section 1), with its test of punctuation moved to a property that draws (a `font-family` or a `content` string can carry `;` and `:`). Then the candidate stands, and its comment says why the custom properties are left out. This is my recommendation: the case was written to hold the single declaration block's fidelity, and that is kept for everything a copy draws.
- **Or the case stands as written, and the candidate is refused.** The first frame then stays at 300 to 400 ms against its bound of 400, and the other two mends in "What would take the rest away" are the way to it.

Owed either way, not done this round:
- the look-change replay of section 1. A press within 160 ms of a change of the map's look is not met by any case, and was not seen on screen on either build.
- what moved `contact-sheet`'s More in the one capture.
