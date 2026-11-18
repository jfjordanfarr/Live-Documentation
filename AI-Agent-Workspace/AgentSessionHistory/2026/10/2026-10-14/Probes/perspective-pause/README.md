# The pause on switching from 2D to 3D: measured

_Historical record, October 14, 2026, by the root Claude Code agent (Fable 5.1), of what holds the page when the Local Map changes from 2D to 3D, measured because the owner reported "big pauses switching from 2D to 3D but lower than 16 seconds. Closer to like... 2-6 seconds?" ([Turn 6 of the day's record](../../../ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)) after the agent had named a sixteen-second busy flag. Nothing was changed for it; the numbers say what the two things are._

## Method

A script of the agent's own, disposable, against both bundles served from `dist/explorer` on an otherwise idle machine (20 cores, headless Chromium with software rendering, so the absolute times are slower than a desktop's). The page opens the Local Map in 2D on a file, rests 1.5 s, then the script installs a frame counter (`requestAnimationFrame`, one timestamp per frame), an observer of the 3D container's `aria-busy` attribute and of its first canvas, notes the time and clicks 3D. Twenty seconds later it reads: when the canvas appeared, when the engine ticked first (`aria-busy` turning true), when it last reported stopped, and the longest gap between two frames, which is the longest the main thread was held. Two runs each.

## What it found

[pause.json](pause.json):

| Bundle | Files | Canvas appears and the engine ticks first | Longest main-thread freeze | Freeze begins | Engine reports stopped |
| --- | ---: | ---: | ---: | ---: | ---: |
| Repository, run 1 | 651 | 9.88 s | 9.79 s | 0.11 s | 25.9 s |
| Repository, run 2 | 651 | 9.73 s | 9.68 s | 0.08 s | 25.8 s |
| Estate, run 1 | 35 | 1.07 s | 1.04 s | 0.04 s | 16.2 s |
| Estate, run 2 | 35 | 1.00 s | 0.96 s | 0.04 s | 16.1 s |

Two separate things, as the owner's numbers and the agent's both said:

- **The pause a person sees** is one freeze of the main thread from just after the click until the first frame of 3D: on this machine 9.7 s for the repository's 651 files and 1.0 s for the estate's 35. It is the 3D library's first picture: `forceGraphView.ts` creates the instance with `warmupTicks(100)`, and the library runs those hundred simulation ticks synchronously, with the Three scene's creation, before it paints; later pictures use `warmupTicks(0)` and evolve from the visible positions, so the pause is paid once per page. The frame gap starts within 0.1 s of the click, so the cover and the capture of the 2D scene are not where the time goes. The owner's "2-6 seconds" on a desktop with a GPU is this freeze at the repository's size.
- **The sixteen seconds** is the library's cooldown: from the first tick, the engine keeps running for about 16 s whatever the simulation has settled to, since `cooldownTime` is a clock (15 s by default) rather than the simulation's own energy, and the container reports `aria-busy` the whole while. A person sees spheres drifting ever more slowly; a browser test waiting for rest waits the clock out.

## What could be done, not done here

The freeze is the warm-up, so the remedies are its: fewer synchronous warm-up ticks when the picture starts from positions it was given (the fold from 2D hands every file a position, so a cold start's hundred ticks are not needed there); or the warm-up run in chunks across frames so the page stays responsive and the fold is seen forming; or the first picture's positions computed off the main thread. The cooldown is the clock, and could end when the simulation's alpha falls below a threshold instead. Either is a change to the 3D view's settling and belongs to its own turn, with the owner's eye on the motion.
