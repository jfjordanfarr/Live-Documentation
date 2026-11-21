---
kind: issue
state: active
milestone: december-showing
order: 60
opened: 2026-11-20
---
# The Explorer holds a large map on a modest machine

**For the owner.** Your work's code is larger than our samples and your work machine is smaller than this one: little memory, and probably no graphics card like the one the tests draw on. On this repository's own map a press already takes longer than the half second you set as "at once", and one of the 3D map's limits was set for a machine with no card and never measured on one.

**Done when.** On a map of about ten thousand files, drawn without a graphics card, a first picture, a search, a pin and a change between 2D and 3D each stay inside the bounds the suite holds today, and the tab's memory fits a machine of 8 GB.

**Waiting on the owner.** Your eye on Settle Hold, the first question of [the packet](../AgentSessionHistory/2026/11/2026-11-19/Screenshots/owner-packet/README.md): it decides how long a 3D picture goes on moving and is the suite's one standing red case. And roughly how much code the largest repository you would show holds.

## Tasks

### A press costs the same whatever the picture's size
- state: review
- holds: the branch `press-landing` at `5594f9f1b`, its checkout `.claude/worktrees/landing`; not on `main`
- evidence: the builder's commit `13b2fb807`; [its record, with root's review at the end](../AgentSessionHistory/2026/11/2026-11-19/Probes/press-cost/README.md#roots-review-2026-11-21-the-press-is-mended-and-the-round-does-not-land-yet) and [its frames](../AgentSessionHistory/2026/11/2026-11-19/Screenshots/press-cost/README.md). Under one load, twelve runs in each checkout, a press of 2D took 496 ms at the median on `main` and 248 on the mend, a press of 3D 748 and 132. The whole browser suite on the mend merged at `main`'s tip: 596 passed, and the case red on `main` passed.

`force-graph-focus.spec.ts:262` is red on `main`: the 3D press took 406 ms on a picture of four cards and 637 ms on five, against 500 ([the cause](../AgentSessionHistory/2026/11/2026-11-19/2026-11-19.1.record.md#work-notes-the-browser-stages-sixth-red-explained-the-presss-cost-grows-with-the-picture-and-this-landing-adds-two-files-to-the-picture-the-case-looks-at)). The bound is not moved.

**Held back for one pass, on the transition's first frame.** The mend makes it later: after the transition's start it came 284 ms at the median on `main` and 346 on the mend on the way to 2D, 335 and 346 on the way to 3D, and over its bound of 400 ms in four runs of twelve where `main` was over in none ([the comparison](../AgentSessionHistory/2026/11/2026-11-19/Probes/press-cost/first-frame-compare.txt)). Landed as it is, the case that is always red on `main` would be red in some runs. The pass: what fills the time between a transition's start and its first frame, on `main` and on the mend, by a trace that shows the page's style, layout and paint; a mend that leaves the first frame no later than `main`'s; then the gate with its whole browser stage and the comparison again. The larger picture's case on the branch does not hold the first frame's bound (root's `eb8dac271`); whether it should is that pass's to say once the cause is known. For the owner if the pass does not settle it: on `main` the first frame already comes about 0.3 s after the start, the time in which the directory outlines peel away, so that part of the motion is hardly seen today; starting the motion's clock at its first frame would show it, and would change how the motion reads.

### A held picture that the keyboard cannot wander into
- state: open
- holds: not begun; it follows the press's mend, which is not on `main`
- evidence:

With the press's mend a 2D map held during the change to 3D is made inert only when it is released, so for one to three seconds a Tab can move focus into it and lose it at the release; the destination map has had the same exposure since 2026-11-08. A guard on the held surface, with a browser case. What also still grows with the picture, found by the same builder and left: a second placement of the subject on the way to 2D, with the same anchor as the first, which draws the connections again (46 ms on the larger picture).

### A map of ten thousand files, measured before anything is mended
- state: open
- holds: not begun
- evidence:

The largest test codebase's map: load, first picture, search, pin, the change of view, the tab's memory; once on the card and once in software drawing, which stands for the work machine at its worst. The 3D map draws at most 1,024 files inside closed groups, a limit that cost nothing on the card and gave three frames a second without one when lifted.

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
