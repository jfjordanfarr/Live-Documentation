# Where the still-picture instrument's reading spends its time, and whether a change of look costs more at the day's end than at its start

**Historical evidence, 2026-11-22.** Measured by a builder between 07:07 and 07:40 UTC in its own worktree at the day branch's tip, `3cd947724`, and, for the second question, against the day's start, `76cd9914c`, built into a scratch folder. Headless Chromium through the browser lane, one hold at a time. **The machine was heavily shared throughout**: its one-minute load average ran from 7 to 64 over the half hour, other builders' work, so every time below is a time at a load, and each is given with it. Where two things are compared they were measured in the same page back to back, or in turn, so that the load falls on both.

## 1. The instrument's reading

The lanes case of `tests/e2e/local-map-branches.spec.ts` reads a retained picture of five of this repository's files whole (`readPicture` in `tests/e2e/still-picture.ts`) and had come to time out at its 60 s. That morning the picture was 516 wires, 113 cards and 247,314 samples (25,623 elements under the map).

### Where the time goes

[`reading-probe.mts`](reading-probe.mts) with `profile` takes the reading under the browser's own sampling profiler and sums the samples by the function they fell in ([the numbers](numbers/reading--profile-before.json)). The reading took 81.9 s under the profiler and 56.8 s without it, at a load of 7.

| Where | Time under the profiler | Share |
| --- | --- | --- |
| `getPointAtLength`, the browser finding each sample's point | 56.5 s | 69 % |
| The reading's own script: each sample asked against every directory, lane and card | 15.0 s | 18 % |
| Idle | 4.7 s | 6 % |
| `isPointInFill`, the membranes' fill test | 3.8 s | 5 % |
| `elementFromPoint`, the page's hit test | 0.4 s | under 1 % |
| `getBoundingClientRect` | 0.2 s | under 1 % |

**Root's guess was that every sample of every wire is asked against every card. It is true and it is the smaller part**: 18 % in script and 5 % in the fill test it reaches. Seven tenths of the reading is the browser's walk to each sample's point.

### Why the walk costs so much

The browser finds a point at a length by walking the path from its start, at every call. A wire sampled every 8 px therefore pays for everything before each point again and again, and a wire's walk costs about its length squared. [`point-cost.mjs`](point-cost.mjs) measured it on every sixth wire of the picture (114 wires, 41,057 samples; [the numbers](numbers/point-cost.json)):

| Walk | Time | A point |
| --- | --- | --- |
| On the wire in the page | 6.3 s | 154 µs |
| On a copy of the wire in a frame of its own, a document of a hundred elements | 6.0 s | 147 µs |
| On short paths, one for each segment of the wire (below) | 2.1 s | 52 µs |

The copy in a small document costs the same, so the cost is the walk itself and not the size of the page. (A copy in no document cannot be measured at all: the browser refuses a path that is not rendered. An earlier run of the first two walks, at a load of 28, gave 283 and 447 µs a point.)

### The mend, in two parts, neither of which changes a number

1. **The questions, asked of fewer.** A wire's samples are taken first, so the box they lie in is known; only a directory, a lane or a card whose own box meets that box can hold one of them, and each sample is asked against those and not against every box in the picture. Each card's box is read once and the cards of each file are looked up, not searched for, at every wire. The answers are the same by construction.
2. **The walk, made short.** Each wire of several segments is given, for each segment, a short path that stands for the wire up to that segment: everything before the segment as one straight line of the same length, as the browser itself measures that much of the wire, in a sub-path of its own, and then the segment from its own start. The browser's walk then reaches the segment with the same length behind it and the same point under it. It is still the browser's arithmetic, which the instrument has always kept as its oracle; whether it gives the same point is a fact about the browser and was measured, not assumed: **of 40,961 samples on 108 wires, none differed in any digit**. A wire whose short paths do not measure the wire's own length to the digit is walked whole as before, and so is a stub (a polygon) and any path written in other than absolute moves, lines and curves. The short paths stand, while the picture is read, in a hidden drawing of no size that takes no pointer, and are taken away before the reading returns.

The reading as it stood is kept word for word as `tests/e2e/still-picture-reference.ts`, and `tests/e2e/still-picture-reference.spec.ts` holds the instrument to it, to the last digit of every number, on a retained picture and a path of the estate sample. [`reading-probe.mts`](reading-probe.mts) makes the same comparison on the lanes picture and two others, with the times.

### What was not measured when this was written

The whole reading before and after on the three pictures, and the lanes case three times alone, were queued in the lane behind three other builders' holds when the fifty minutes ran out; the handback says what had come back. From the parts measured, a reading of the lanes picture should fall from about 57 s at a load of 7 to somewhat under 20 s at the same load: the walk to about a third of its time, the questions to a small part of theirs.

## 2. A change of look on the heavy subject, day's start against day's tip

A change of look on `packages/engine/src/config/liveDocumentationConfig.ts` had been measured that day at about three times its style cost of November 21, at a different load. [`look-probe.mjs`](look-probe.mjs) opens the subject at reading size on each build's site in turn, start, tip, start, tip, five times, presses Zoom Out until the look is connections, and reads from the browser's timeline the largest style pass and the elements it restyled; then presses Return to reading size and reads the same ([the ten runs](numbers/look-change.jsonl)).

| Run | Build | Load (1 min) | To connections: style, elements | Back to reading: style, elements |
| --- | --- | --- | --- | --- |
| 1 | start | 26.6 | 868 ms, 6,541 | 776 ms, 7,063 |
| 1 | tip | 36.7 | 3,625 ms, 7,010 | 2,160 ms, 7,567 |
| 2 | start | 38.3 | 1,302 ms, 6,541 | 999 ms, 7,064 |
| 2 | tip | 35.0 | 1,045 ms, 7,010 | 1,353 ms, 7,567 |
| 3 | start | 30.6 | 849 ms, 6,541 | 704 ms, 7,064 |
| 3 | tip | 25.6 | 560 ms, 7,010 | 713 ms, 7,566 |
| 4 | start | 22.8 | 567 ms, 6,541 | 470 ms, 7,063 |
| 4 | tip | 19.4 | 313 ms, 7,010 | 302 ms, 7,566 |
| 5 | start | 16.8 | 309 ms, 6,541 | 269 ms, 7,063 |
| 5 | tip | 14.6 | 356 ms, 7,010 | 412 ms, 7,566 |

**The load made the number.** The style time follows the machine's load, on both builds alike: a factor of four on the start's own five runs (309 to 1,302 ms) and of eleven on the tip's (313 to 3,625 ms), each falling as the load fell. In the two pairs taken at the lowest load the tip was faster once (313 against 567 ms) and slower once (356 against 309 ms). Nothing here shows the tip slower beyond that.

**What did grow is the picture.** The tip restyles 7,010 elements where the start restyles 6,541, seven in a hundred more, and that is the map's own growth: 86 cards and 13,066 elements under the map where the start has 81 and 12,141, the heavy subject having gained five neighbours in the day. No rule keyed on the viewport's attribute shows as a cost at this resolution. November 21 measured 271 to 275 ms for 6,420 elements at full speed; the lowest-load runs here, 309 and 356 ms at a load of 15 to 17, are that number with the day's growth and the day's load.

Not done: a run of each build with the browser's selector statistics, to name the costliest rules. It was tried last in the same hold, at a load of 54, and its page did not answer a press within thirty seconds. It would have decided nothing the ten runs leave open.

## How to run these again

Each through the lane, the bundles built first (`npm run build`, `npm run e2e:bundles`):

- `node scripts/browser-lane.mjs --label <who> -- npx tsx --tsconfig ./tsconfig.base.json <this folder>/reading-probe.mts <repository> <out> [profile] [once] [only=lanes] [label=<name>]`
- `node scripts/browser-lane.mjs --label <who> -- node <this folder>/point-cost.mjs <repository> <out>`
- `node scripts/browser-lane.mjs --label <who> -- node <this folder>/look-probe.mjs <repository> <out> <runs> start=<site folder> tip=<site folder>`; the day's start was built with `git worktree add --detach <folder> 76cd9914c`, then `npm ci`, `npm run build` and `npm run live-docs:visualize` in it.
