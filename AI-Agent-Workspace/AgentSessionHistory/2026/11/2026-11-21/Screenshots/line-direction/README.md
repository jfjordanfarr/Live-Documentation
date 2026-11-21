# Which way a line runs: the Wire Answers and Direction Marks trials

_Historical evidence, taken on November 21, 2026 by the builder of the two trials, on its branch's built site, at 1,280 by 800, with the continuing search off. The trials are described in [the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md), "Which way a line runs, two trials". They answer strangers' top-ranked stumble of that day, [which way a line runs, and what it carries](../../Probes/line-direction/README.md)._

Both levers stand in Tuning → 2D Wires and are off by default:
- **Wire Answers** (*Off*, *On*) makes a wire answer a rested pointer, a press and the keyboard's focus.
- **Direction Marks** (*None*, *Along*, *Against*) draws small open chevrons on each wire.

The script is [`shots.mjs`](shots.mjs), run through the browser lane.

## The pictures

**The estate's `PaymentService` with `Data` opened.** These are the steps a blind playtester took: the folder `PaymentService` chosen in the search, then `PaymentService/Data` opened by its handle. Every line here is a pair line between two files.
- `estate-data--marks-none.png`, `--marks-along.png`, `--marks-against.png`: Direction Marks at each value.
- `estate-data--answers-on.png`: Wire Answers on, with nothing asked. It is the same picture as with the lever off, since a band draws nothing.
- `estate-data--wire-rested.png`: the pointer at rest on the line from `App.config` to `PaymentsContext.cs`.
- `estate-data--wire-pinned.png`: the same line pressed, with the pointer then moved away.

**This repository's `pathfind.ts` at reading size**, where the wires run between rows and some run in bundles:
- `repo-pathfind--reference-rested.png`: a reference rested on.
- `repo-pathfind--reference-pinned.png`: the same reference pressed, with the pointer then moved away.
- `repo-pathfind--run-rested.png`: a bundle's shared run rested on. This is the gathered run's answer.
- `repo-pathfind--marks-along.png`: Along at reading size.

**A dense view of this repository**: the same arrival with Zoom Out pressed twice.
- `repo-dense--marks-none.png`, `--marks-along.png`, `--marks-against.png`: Direction Marks at each value.
- `repo-dense--marks-along--strings.png` and `repo-dense--marks-against--strings.png`: the parallel wires at the lower right, enlarged twice.
- `repo-dense--marks-along--trunk.png`: the bundle above `pathfind.ts`, enlarged twice.
- `repo-dense--wire-rested.png`: a wire rested on in the dense view, with marks along.

## What each wire said

These are the words in the panel. Each is also the band's spoken name, joined as one sentence.

| Wire | Head | Below it |
| --- | --- | --- |
| Estate, the pair line from `App.config` to `PaymentsContext.cs` | `PaymentsContext.cs` uses `App.config` | `PaymentsDb` · 1 reference |
| Repository, a reference into `reachability` | `pathfind.ts` uses `graph.ts` | `LiveDocGraph` · 1 reference |
| Repository, the shared run of `graph.ts`'s `LiveDocGraph` | `graph.ts` is used by `pathfind.test.ts`, `sources-facts.ts`, `emit.ts` +3 | `LiveDocGraph` · 20 references |

## What I see

**Wire Answers**
- **Passing over draws nothing.** In the recorded run, a pointer crossing a wire in twelve steps left no panel and no fade.
- **A rest.** After the 350 ms dwell, the rested line is the only one left at its resting look. Every other wire fades to a tenth, and the cards at its two ends keep their look while the others fade. The panel reads the way the line runs: the file on the right uses the file on the left.
- **Where the panel stands.** The first pictures stood the panel below and right of the pointer. There it hid `PaymentsContext.cs`'s name, the very card it named. It now takes the World Map's rule for a panel beside its subject, with the wire's two cards weighted four times. In the estate it stands above the line, clear of both cards.
- **A press.** The panel gains the World Map's pinned look, a blue left border and a close control, and it stays after the pointer leaves. In the first round the fade went out once the pointer crossed a row on its way out, while the words stayed. A pin's light is now put back when another hover ends. In the second pinned picture the line is lit again.
- **Escape** lets go of the pin: after it, no panel stands.
- **The bundle's run.** It answers for its six wires at once. On the repository its panel covers part of `graph.ts`'s card, which is cut at the left edge. The run has no single far card, so only its offering card is weighed. This is still wrong: on a crowded arrival every side of a point near a card covers some card.
- **Still open: one lit wire in the repository's rest pictures.** One curve, from `graph.ts`'s `LiveDocGraph` pin up toward the top edge, stays bright while the others fade. It is either a second drawn wire for the same pair of symbols, which the highlight keeps by its symbols, or the bundle's members stacked. I did not settle which.

**Direction Marks**
- **On the estate's `Data` step.** Each line holds one chevron at its middle. At the middle an S-curve is at its steepest, so most chevrons point up or down rather than left or right. They tell the way along the line, but not the left-to-right reading at a glance. Along and Against are easy to tell apart, and neither adds a colour.
- **At reading size on the repository.** The chevrons are small (an arm about 6 px on a plain wire) and quiet beside the rows.
- **Where it turns to noise:**
  - *Bundles.* Each member of a bundle draws its own marks on the shared run, at slightly different places, so a bundle reads as a stack of chevrons. Above `pathfind.ts` they show as "»»»»" on one line, and in a pile on its riser.
  - *Parallel wires.* On the "guitar strings" at the lower right, the chevrons scatter across the strings like a field of arrows. Their way is clear, but they are busy.
  - *A mend I would make next:* write marks on a bundle's run once, not on its members where they lie under it. Whether marks should also wait for a pointed-at card, the brief's other choice, is for the owner's eye.
- **Density chosen.** One mark at the middle, and on a wire longer than 640 px one in the middle of each equal stretch of about 320 px. None stands within 28 px of an end. Marks are drawn on every wire except a returning connection's laces and a bundle's run.

## Costs

### A frame of panning

Measured on the largest folder opened in this repository: `packages/explorer/src/client/views/localView`, opened from `controller.ts`. That view has 86 cards and 498 wire paths, and with Wire Answers on, 409 bands.

Each configuration had three drags of 120 pointer moves, each begun on a wire where one lay under the start. The figures are the browser's own counters on the shared machine.

| Levers | Frames in the three drags | Median frame (ms) | 90th percentile frame (ms) | Script, style and layout per frame (ms) |
| --- | --- | --- | --- | --- |
| Both off | 364, 367, 399 | 16.7 | 16.8, 16.8, 16.8 | 2.78, 1.76, 1.82 |
| Wire Answers on | 353, 355, 399 | 16.7 | 33.3, 33.3, 16.8 | 2.97, 2.05, 2.31 |
| Marks along | 328, 351, 172 | 16.7 | 33.3, 16.8, 33.3 | 3.17, 3.81, 3.81 |
| Both on | 300, 304, 399 | 16.7 | 16.8, 16.8, 16.8 | 2.73, 1.56, 2.71 |

Every drag's median frame is the display's 16.7 ms. The per-frame main-thread time moves within the machine's noise: both levers on measured lower than either alone. The 33 ms tenths come and go across runs. I read no cost of panning from either lever that this machine can show.

### A move under marks

This mattered more than the pan. The first build measured each wire through the page (`getTotalLength`, `getPointAtLength`). Opening `localView` with Along then held the page in one task of **137 seconds**, during the move that redraws every wire each frame, and the folder never settled.

The marks now walk the path's own commands in [`wire-marks.ts`](../../../../../../../packages/explorer/src/client/views/localView/wire-marks.ts). With that walk, the same opening reported no long task after its first five seconds, and the page settled.

The first window's 17-second longest task includes the page's own load of this repository, which the observer buffers from the start. I did not take the same probe with marks off to separate the two.
