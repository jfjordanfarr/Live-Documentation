# The 3D Local Map while it builds, November 15, 2026

_Historical evidence, in two parts. First, taken by a builder before building anything, at the first step of the round in which the 3D Local Map's nodes are to take no hover and no click while the map builds (the owner's decision in [Turn 4 of that day's record](../../2026-11-15.1.record.md#turn-4)): how long the map stays busy. The brief said to stop and hand the numbers back if "busy" lasted more than about three seconds on the common actions, since a map that refuses a click for half a minute is worse than the fault. It does, so nothing was built then; the build is the base commit `7038efd6`. Second, [after building it](#after-building-it) on the root's choice of "placed and framed": how long building lasts, and the pictures._

## After building it

Building is a body being packed, the reveal bringing spheres in, a perspective change into 3D or a change of what is shown, and the camera's 650 ms framing flight with them; a lull under 200 ms does not end it. While it lasts the container carries `data-building` ("begun", then "shown" after 300 ms, when the cursor waits and a line sweeps along the map's top edge). `aria-busy` still says the settle. The rows below were measured as before, headless, three runs each, with `data-building` in place of `aria-busy` ([building-measurements.json](building-measurements.json); the history step in [building-history-step.json](building-history-step.json), measured again once the history sample carried the change). The 60 fps estimate is the frames ÷ 60 plus the 0.2 s hold; the flight and the hold are clock time, not frames, so on a fast machine building is about the larger of that and 0.85 s where a flight runs.

| Action | Busy before, s here / ≈ at 60 fps | Building, s here (median / worst) | Building, frames | ≈ s at 60 fps |
| --- | --- | --- | --- | --- |
| Estate: arrival by link (from page load) | 6.9 / 3.4 | 1.7 / 1.8 | 20 | 0.5 |
| Estate: click on a seed | 38.2 / 21.8 | 0.3 / 0.3 | 2 | 0.2 to 0.3 |
| Estate: Pin from a sphere's actions | 5.3 / 3.8 | 0.6 / 0.6 | 20 | 0.6 |
| Estate: open a directory (Structure) | 12.6 / 8.0 | 0.9 / 0.9 | 24 | 0.6 to 0.9 |
| Estate: perspective change from 2D | 7.1 / 5.0 | 3.3 / 3.5 | 122 | 2.2 |
| History sample: a step | 1.4 / 1.4 | 0.9 / 0.9 | 51 | 0.9 |
| Repository: arrival on a file at one hop (from page load) | 30.7 / 3.5 | 8.5 / 9.2 | 46 | 1.0 |
| Repository: click a sphere of that hop | over 60 / over 6.2 | not measured, see below | | |
| Repository: perspective change from 2D | 23.2 / 4.6 | 5.6 / 5.6 | 121 | 2.2 |
| Repository whole in Structure: arrival | over 60 / over 3.6 | 10.8 | 66 | 1.3 |

- On this machine the repository's rows are long in seconds because a frame takes 150 to 300 ms to draw in software; in frames, building is 46 to 124 against busy's 207 to over 370.
- The estate's seed click builds for only the hold: its picture is in at once and no framing flight follows a pin. So the sign never shows there, as a quick update should not flash it.
- The repository's click row is not measured: the setup now waited only for building's end, not the settle, and the sphere it aimed at drifted from under the pointer before the press, which then fell on bare canvas (the address did not change, and the map was not building at the press). That is the drift after building, the same as before this change.
- These rows but the history step were measured on the build before a later fix in this round, which stopped a camera that follows without a flight from counting as building; the fix can only shorten them.

### Pictures and recordings

At 1,440 by 900 unless said. The pointer is not drawn in headless pictures: it rests where the seed was clicked.

- [`estate-0-hovered.png`](estate-0-hovered.png), [`estate-2-arrived.png`](estate-2-arrived.png), [`estate.webm`](estate.webm): the estate at the Explorer's defaults (Skin, one hop). The largest group's seed, `PaymentService/PaymentService.cs`, hovered by the pointer's own move (three seeds faded), clicked with the pointer left still: built in 0.4 s, too quickly for the sign; arrived with nothing hovered and nothing faded.
- [`repository-0-hovered.png`](repository-0-hovered.png), [`repository-2-arrived.png`](repository-2-arrived.png), [`repository.webm`](repository.webm): the same on this repository at the defaults, the seed `persistence/local-storage.ts` of a group of 522 files: 94 spheres faded by the hover before the click; built in 1.0 s; arrived with nothing hovered or faded; the pointer's first move then hovered (118 faded).
- [`repository-long-build-0-hovered.png`](repository-long-build-0-hovered.png), [`repository-long-build-1-building.png`](repository-long-build-1-building.png), [`repository-long-build-2-arrived.png`](repository-long-build-2-arrived.png), [`repository-long-build.webm`](repository-long-build.webm): the same seed with a build long enough to see, two hops and Reveal Frames 240, wrappers off (the browser spec's setting): 6.8 s of building here, the sign showing in the middle picture (the bright stroke under the search bar, left of centre), nothing faded throughout, nothing hovered at arrival, and the first move hovering (197 faded).
- [`edge-top.png`](edge-top.png), [`edge-top-later.png`](edge-top-later.png): the map's top edge at device scale 2 while it builds, 550 ms apart, the stroke at two places of its sweep. [`edge-reduced-motion-top.png`](edge-reduced-motion-top.png): under reduced motion, a still line the width of the map. [`edge-toolbar.png`](edge-toolbar.png): the toolbar at the same moment, unchanged. [`edge-whole.png`](edge-whole.png): the whole page at device scale 2.

What the builder's eye finds: the sweep is quiet and reads as a soft brightening travelling along the header's lower border, which is where the eye already sees the map begin; it is easy to miss when the eye is on the picture, and that may be right or too quiet, which is the owner's to judge. Under reduced motion the still line reads as a slightly brighter, thicker border, so it says less than the sweep. The waiting cursor cannot be pictured headless; the spec reads it as `progress` over the canvas.

## The settle's tail, reported and not changed

_Note of November 16, 2026: the "last visible move" here counts a pixel between two consecutive frames; the directory shells glide below that pace and are seen to (on the seed click one travels 117 px after frame 186, and the picture comes within a pixel of its rest only at frame 1,294), as [the measurement of what moves in the tail](../../../2026-11-16/Screenshots/motion-rest/README.md) shows._

The test that ends `aria-busy` is the motion's stillness in [`forceGraphLayout.ts`](../../../../../../../packages/explorer/src/client/views/forceGraphLayout.ts), `STILL_FRACTION` and `QUIET_TICKS` at lines 347 to 351 and the count at lines 535 to 544: once the tether holds (`holding`), no sphere is held by a hand, and the largest move of a tick has stayed at or under 3 × 10⁻⁵ of the picture's diagonal for ten ticks in a row, the motion calls `onStill`, which the view turns into `simulationRunning = false` once the reveal is whole. On the estate's seed click that threshold is a few hundredths of a unit, far under a pixel, and the picture took some 1,100 frames after its last 1 px move to reach it. Not measured: what moves in that tail. Two candidates, from the code: a slow creep of a loosely held part (another group's seed, held only by a gravity of 0.025 that Group Separation weakens for a group, and by the tether of 0.02) toward its balance, a few hundredths of a unit a tick; or a small limit cycle of the approximated repulsion (Approximation 0.3), whose forces jump as a sphere crosses a cell's opening threshold, so that a sphere chatters below a pixel and the ten quiet ticks keep restarting, as the design records of larger approximations that never come to rest. Logging each tick's largest move against the diagonal and which sphere made it, and the same click at Approximation 0, would tell them apart.

## How it was measured

Headless Chromium (the container's software renderer), 1,440 by 900, the Explorer's defaults (one hop, Skin wrappers, Reveal Frames 60) save the 2D map's continuing search, which is off as in the browser suite. Each action was run three times, each in a fresh page. "Busy" is the map's existing `aria-busy` state, true while the picture's motion has not fallen still or a body is being packed: from the action (for an arrival, from the start of the page's load) to the moment it turns false, capped at 60 s. Alongside it, from the frames the page drew:

- **frames**: the animation frames in the busy span. The physics takes one step a frame while a step fits its 10 ms budget, so frames stand for steps, and frames ÷ 60 is roughly what the same span would take on a machine that draws at 60 frames a second (an estimate, not a measurement).
- **all entered**: the frame by which every sphere of the picture had entered.
- **last visible move**: the last frame in which some sphere moved at least 1 px on the screen since the frame before (the camera's own moves count, since the eye sees them).

The raw rows are in [busy-measurements.json](busy-measurements.json).

## What it found

| Action | Busy, s here (median / worst) | Busy, frames | Frames a second here | ≈ s at 60 fps | All entered, frame | Last visible move, frame |
| --- | --- | --- | --- | --- | --- | --- |
| Estate: arrival on `Portal/Services/GatewayClient.cs` by link (from page load) | 6.9 / 7.4 | 201 | 29 | 3.4 | 13 | 136 |
| Estate: click on a seed of the archipelago (`PaymentService/PaymentService.cs`) | 38.2 / 40.7 | 1,309 | 34 | 21.8 | 1 | 186 |
| Estate: Pin from a sphere's actions | 5.3 / 6.0 | 225 | 43 | 3.8 | 6 | 145 |
| Estate: open a directory (Structure, a click on the `Portal` bubble) | 12.6 / 14.1 | 479 | 38 | 8.0 | 1 | 132 |
| Estate: perspective change from 2D, a file selected | 7.1 / 7.1 | 298 | 42 | 5.0 | 110 | 161 |
| History sample (7 files): a step | 1.4 / 1.4 | 82 | 60 | 1.4 | 3 | none |
| Repository: arrival on `views/forceGraphView.ts` at one hop by link (from page load), 133 spheres | 30.7 / 32.0 | 207 | 7 | 3.5 | 50 | 207 |
| Repository: click a sphere of that hop (`forceGraphLayout.ts`), 154 spheres | over 60 (all three capped) | over 370 | 6 | over 6.2 | 8 | 264 |
| Repository: perspective change from 2D, that file | 23.2 / 23.4 | 275 | 12 | 4.6 | 118 | 210 |
| Repository whole in Structure: arrival by link, 1,256 spheres | over 60 (all three capped) | over 215 | 3.5 | over 3.6 | 65 | still moving at the cap |

- **Busy lasts far longer than three seconds** on every common action but the tiny history sample, here and in the 60 fps estimate alike. The estate's seed click, the journey of the original finding, stays busy for 1,309 frames, some 38 s here and about 22 s at 60 fps.
- **Busy outlasts what the eye sees.** On the estate the last visible move comes at 132 to 186 frames, while busy runs to 201 to 1,309: on the seed click the picture looks still for six sevenths of the busy time, and on opening a directory for nearly three quarters of it. On this repository the picture visibly drifts for most of the span (at 6 frames a second here, each frame carries a whole physics step).
- **The picture is in early.** Every sphere has entered by frame 1 to 50 after a click, a pin or an arrival, and by frame 110 to 119 after a perspective change, whose own animation runs first.
- A history step on this repository was not measured: this worktree's bundle carries no history (`History: none`; the history cache is not committed and was not built here). The scripted history sample stands in for it.

## Two definitions of "building", for the root

- **Placed and framed**: building while a body is being packed, the reveal is still bringing spheres in, or the camera's framing flight (650 ms) is running; the drift after that is not building. From the table, about 0.7 to 2.6 s at 60 fps on every action measured. The picture can still drift for a few seconds afterwards.
- **Cooled**: the present `aria-busy`, until the motion falls still. The table's busy column.

A middle definition was measured too: **visibly still**, until no sphere moves 1 px on the screen between frames (the last-visible-move column, about 2.2 to 4.4 s at 60 fps where the picture stopped moving within the cap; the whole repository in Structure had not). The motion does not compute anything on the screen today, so this would need a new measure inside it.
