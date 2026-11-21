# The 2D/3D transition's frames, before and after the press-cost round

_Status: historical evidence, taken 2026-11-20 by the press-cost builder. The tool was [`motion-frames.cjs`](../../Probes/press-cost/motion-frames.cjs), the script of 2026-11-08 launched with the suite's browser options. It ran in a private headless Chromium at 1440 × 960, a fresh profile with the background search off, in the browser lane. "Before" is `main` at `0976d4909`. "After" is the same with this round's change ([the probe's record](../../Probes/press-cost/README.md))._

The subject is the regression's picture: this repository's 3D Local Map on `packages/engine/src/live-docs/graph.ts`. The script presses 2D and takes five frames, then presses 3D and takes five more. It takes them at 0, 0.35, 0.7, 1.05 and 1.4 s from the transition's start, with the page's animation clock frozen at each time, as in [the switch-motion record](../../../2026-11-08/Screenshots/switch-motion/README.md). The 0 s frame is the first frame, 0.7 s is mid-fold, and 1.4 s is the last. Each strip shows the five frames side by side at two fifths of their size, captioned with the time and the transition's progress.

| Strip | What it shows |
| --- | --- |
| [before-to-3d.png](before-to-3d.png) | 2D to 3D, before: the card of graph.ts and its neighbours with their wires, then the cards folding to named tokens with the wires gathering, the tokens travelling to their spheres, and the 3D map at rest with its shells. |
| [after-to-3d.png](after-to-3d.png) | The same, after. |
| [before-to-2d.png](before-to-2d.png) | 3D to 2D, before: the spheres gathering about graph.ts, the wires, then the cards unfolding from their tokens. The 1.4 s frame is the transition's last, at progress 1.00. |
| [after-to-2d.png](after-to-2d.png) | The same, after. The 1.4 s frame is the arrived 2D map, the transition's layer gone. |

## What differs

The two runs were compared pixel by pixel, counting pixels that differ by more than 24 in any channel. The frames from 0 to 1.05 s are the same in both directions: 0.00 % of pixels differ, except 0.01 % at 0.35 s on the way to 2D. The last frame on the way to 3D is the same too.

The one difference is the last frame on the way to 2D (4.2 %), and it is not the transition. Frozen at 1.4 s, the "before" run caught the layer still standing at progress 0.9999. Its start was read a fraction of a millisecond off, as its caption shows by reading "-0.00" at 0 s. The "after" run caught it gone, showing the arrived 2D map with its directory membranes drawn. The 2026-11-08 record saw the same at the boundary, on the way to 3D.

By eye, the cards fold to the same scale at the same times, and the wires gather the same way. The names travel to the same spheres, and the membranes go as before.
