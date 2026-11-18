# The 2D/3D transition's frames, before and after the switch-cost fix

_Status: evidence for the root's eye, since the switch-cost round (milestone 2 of the 2D builder) held the transition's look by browser checks alone. Taken on 2026-11-08 by [`motion-frames.cjs`](../../../Probes/2026-11-07/switch-cost/motion-frames.cjs) in a private headless Chromium at 1440 × 960, a fresh profile with the background search off, under the machine's browser lock. "After" is the bundle of milestones 1 and 2 as accepted (staged in the builder's worktree, served on 8911). "Before" is the bundle of `476ea2c8` (8914)._

## How the frames were taken

The subject is the focus case's picture: this repository's 3D Local Map on `packages/engine/src/live-docs/graph.ts`. The probe presses 2D and takes five frames, then presses 3D and takes five more. Each frame is taken at 0, 0.35, 0.7, 1.05 and 1.4 s from the transition's start, the moment its layer is appended to the page (not from the press).

On this machine a frame of the 3D picture takes a few hundred milliseconds to draw, so a frame taken by the clock would land wherever the renderer allowed. Instead the probe gives the page's animation frames a frozen time while each picture is taken: the transition draws exactly its state at that time, then the clock is released.

Each caption gives the time and the transition's elapsed fraction of its 1.4 s as the layer recorded it. At 1.4 s the layer may already be gone, and the destination drawn; the caption then says "ended". Each strip shows the five frames side by side at two fifths of their size.

| Strip | What it shows |
| --- | --- |
| [after-to-2d.png](after-to-2d.png) | 3D to 2D, after: the spheres gather, the cards unfold from their tokens, the membranes return from the leaves outward. |
| [before-to-2d.png](before-to-2d.png) | The same, before. |
| [after-to-3d.png](after-to-3d.png) | 2D to 3D, after: the membranes peel from the root inward, the cards fold to named tokens, the wires gather, the tokens travel to their spheres. |
| [before-to-3d.png](before-to-3d.png) | The same, before. |

At the same times the frames before and after show the same picture: the same cards folding to the same scale, the same membranes peeling, and the same names travelling. The one difference that is not the transition is the final frame on the way to 3D. Before, that frame is already the destination at rest, with its shells drawn; after, it is the transition's last frame.

## What the frames do not show: the first frame's delay

Frozen time hides one thing a person sees: how long after its start the transition draws its next frame, since what comes before that frame is lost. The probe measures it on the real clock.

| Run | Bundle | To 2D | To 3D |
| --- | --- | --- | --- |
| First run | Before (`476ea2c8`) | 4,629 ms | 112 ms |
| First run | After (milestones 1 and 2) | 507 ms | 755 ms |
| Second run, three hours later | After (milestones 1 and 2) | 117 ms | 147 ms |
| Second run, three hours later | After, with milestone 3 and the hold's corrections | 142 ms | 147 ms |

The switch regression, which notes the transition's start without freezing anything, read 83 to 179 ms on both bundles over three runs.

So the half second and three quarters of the first run were not the bundle's: the same bundle read 117 and 147 ms when the probe ran again. Most likely they were the machine's, which other agents' builds and runs share outside the browser lock. The interim hand-back of 2026-11-08 had named them a fault of the fix, and two causes for it; that was wrong, and one of the two corrections made for it (the held map keeping its height until shown again) was taken back.

The other corrections stand on their own:

- a transparent cover over the views' room takes the pointer while a picture is held, which the old inert cover never did;
- the 2D map's keys are held back while its cards are copied, in place of making it inert;
- the regression now also requires the first frame within 400 ms of the start.

Before the fix, on the way to 2D, the first frame came 4.6 s after the start. The page was busy laying out its copy of every element of the 2D map, and the whole transition went unseen.
