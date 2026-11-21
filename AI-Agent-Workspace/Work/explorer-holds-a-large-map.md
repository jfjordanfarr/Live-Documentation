---
kind: issue
state: active
milestone: december-showing
order: 60
opened: 2026-11-20
---
# The Explorer holds up on a weak machine

**For the owner.** Your work machine is far smaller than this one: "Absolute crap VM", 8 GB of memory, graphics unknown, and it must "run on absolute garbage, even if some amount of precomputation time with reasonable progress indicators is required to do so" (2026-11-21). Your scans are not large: a solution each, none near a million lines. On this repository's own map a press already takes longer than the half second you set as "at once", and one of the 3D map's limits was set for a machine with no card and never measured on one.

**Done when.** On a map the size of one of your solutions, in a browser with no graphics card and a slow processor, a first picture, a search, a pin and a change between 2D and 3D are each comfortable to use, a link to the 3D map never ends in a dead page, and where the page must work before it can show, it says so and how far it has got.

**Rests on.** [One look on 2026-11-21](../AgentSessionHistory/2026/11/2026-11-21/Probes/weak-machine/README.md), this machine imitating a weak one: the estate sample (36 files) holds up in software drawing, this repository's map (1,134 files) gives two to five frames a second, and a browser that refuses WebGL shows "The Explorer stopped" on any 3D link. The first board's "about ten thousand files" was a guess and is withdrawn. Not known: your solutions' real sizes, and what that VM's browser can draw. The owner's scale, 2026-11-21 ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)): "over 100k files in just the portion of TFS I have cloned", most of them committed `packages` folders, and "tens of thousands of code files" in all; each scan is one solution of it, so the number that matters for a map is a solution's files after what is left out, which nobody has counted.

**Waiting on the owner.** Your eye on Settle Hold, the first question of [the packet](../AgentSessionHistory/2026/11/2026-11-19/Screenshots/owner-packet/README.md): it decides how long a 3D picture goes on moving and is the suite's one standing red case.

## Tasks

### A press costs the same whatever the picture's size
- state: review
- holds: the branch `press-landing`, its checkout `.claude/worktrees/landing`: the mend's last commit is `5594f9f1b`, and `main` was merged into it on 2026-11-21; not on `main`
- evidence: the builder's commit `13b2fb807`; [its record, with root's review at the end](../AgentSessionHistory/2026/11/2026-11-19/Probes/press-cost/README.md#roots-review-2026-11-21-the-press-is-mended-and-the-round-does-not-land-yet) and [its frames](../AgentSessionHistory/2026/11/2026-11-19/Screenshots/press-cost/README.md). Under one load, twelve runs in each checkout, a press of 2D took 496 ms at the median on `main` and 248 on the mend, a press of 3D 748 and 132. The whole browser suite on the mend merged at `main`'s tip: 596 passed, and the case red on `main` passed.

`force-graph-focus.spec.ts:262` is red on `main`: the 3D press took 406 ms on a picture of four cards and 637 ms on five, against 500 ([the cause](../AgentSessionHistory/2026/11/2026-11-19/2026-11-19.1.record.md#work-notes-the-browser-stages-sixth-red-explained-the-presss-cost-grows-with-the-picture-and-this-landing-adds-two-files-to-the-picture-the-case-looks-at)). The bound is not moved.

**Held back for one pass, on the transition's first frame.** The mend makes it later: after the transition's start it came 284 ms at the median on `main` and 346 on the mend on the way to 2D, 335 and 346 on the way to 3D, and over its bound of 400 ms in four runs of twelve where `main` was over in none ([the comparison](../AgentSessionHistory/2026/11/2026-11-19/Probes/press-cost/first-frame-compare.txt)). Landed as it is, the case that is always red on `main` would be red in some runs. The pass: what fills the time between a transition's start and its first frame, on `main` and on the mend, by a trace that shows the page's style, layout and paint; a mend that leaves the first frame no later than `main`'s; then the gate with its whole browser stage and the comparison again. The larger picture's case on the branch does not hold the first frame's bound (root's `eb8dac271`); whether it should is that pass's to say once the cause is known. For the owner if the pass does not settle it: on `main` the first frame already comes about 0.3 s after the start, the time in which the directory outlines peel away, so that part of the motion is hardly seen today; starting the motion's clock at its first frame would show it, and would change how the motion reads.

### A held picture that the keyboard cannot wander into
- state: open
- holds: not begun; it follows the press's mend, which is not on `main`
- evidence:

With the press's mend a 2D map held during the change to 3D is made inert only when it is released, so for one to three seconds a Tab can move focus into it and lose it at the release; the destination map has had the same exposure since 2026-11-08. A guard on the held surface, with a browser case. What also still grows with the picture, found by the same builder and left: a second placement of the subject on the way to 2D, with the same anchor as the first, which draws the connections again (46 ms on the larger picture).

### A 3D link in a browser that gives no WebGL
- state: done
- holds: on the day branch `day/2026-11-21` since the merge `f7e3ad843` (the builder's commits `9d90aefbf`, `3ef749389`, `ff4540ac9`) and root's follow-up `8e1c9d13f`; not yet on `main`
- evidence: [the probe that found it](../AgentSessionHistory/2026/11/2026-11-21/Probes/weak-machine/README.md); a browser regression launched without WebGL ([`webgl-refused.spec.ts`](../../tests/e2e/webgl-refused.spec.ts), nine cases, five of them failing before the mend with "The Explorer stopped" on screen), run by root with both Tuning files and the 3D cue's: 22 of 22 pass; [the pictures, with what the question costs a 2D visit](../AgentSessionHistory/2026/11/2026-11-21/Screenshots/webgl-refused/README.md); the design system's rule: a view the browser cannot draw is not offered, its control says why, and a request for it shows the subject in a view the browser can draw

Where WebGL is refused, a link to the 3D map, a remembered 3D, Back to a 3D entry and the 3D control all show the same subject in 2D; the 3D control and Tuning's 3D Layout stay where they are, unavailable, saying "3D needs WebGL, which this browser does not offer"; a person's remembered choice of 3D is left alone for a browser that draws it. The browser is asked whether it gives WebGL only when 3D is asked for (by a link, a remembered choice or a press), or once a 2D page is idle after its first picture: asked at every start, it delayed a 2D arrival's first picture by about 90 ms on a graphics card. Found on the way and mended in the same merge: the browser case for Reset to defaults was red on `main` because it read a changed lever's dot inside a folded group, where nothing is drawn and the reading is whatever the browser last laid out (5px on 2026-11-20, 0px on 2026-11-21, same code); it now opens the group first and asks the same of the dot.

### A WebGL context lost and never given back
- state: open
- holds: not begun; found by the builder of the task above on 2026-11-21 and written into its pictures' README
- evidence:

Different from a browser that refuses WebGL at the start: here the 3D map is drawing and the browser takes its context away (a graphics process that dies, memory pressure, a machine drawing in software, which is where it is likeliest). Today the drawing stops, draws again if the context is restored, and if it is not the map stays blank with its controls standing and nothing said. To be reproduced before it is designed.

### Maps of a solution's size on a weak machine, measured before anything is mended
- state: open
- holds: begun by root's probe of 2026-11-21; the walk through pins, presses and searches not done
- evidence:

Public .NET solutions of the sizes the owner describes: load, first picture, search, pin, the change of view, the tab's memory, in software drawing on two cores with the processor slowed. What the probe ranks first: the 2D map's continuing search, which holds the page to a few frames a second while it runs, and the 3D picture's cost a frame. The owner's leave for "precomputation time with reasonable progress indicators" is a design none of the trials took: work done once and kept, in place of work done at every opening. The 3D map draws at most 1,024 files inside closed groups, a limit that cost nothing on the card and gave three frames a second without one when lifted.

### The first 2D picture measures before it writes
- state: open
- holds: not begun
- evidence:

About a third of the first picture's 1.8 s on this repository is the browser laying the page out again because a card is measured, written, and the next measured ([where the suite's time goes](../AgentSessionHistory/2026/11/2026-11-19/Probes/suite-time/README.md)). Pictures identical to the byte.

### A click that cannot cost the picture
- state: open
- holds: [the proposal](../AgentSessionHistory/2026/11/2026-11-19/Probes/open-close-pin/README.md), nothing built
- evidence:

Five of six strangers lost their 3D picture to a click on a pinned sphere, which unpins it. For a showing driven by hand that is the fault most likely to be met. The whole design of open, close and pin is the owner's to read; this task is only the part that keeps a stray click from letting go.
