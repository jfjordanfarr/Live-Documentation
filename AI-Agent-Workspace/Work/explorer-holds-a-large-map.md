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
- state: active
- holds: a builder out since 22:15 UTC on 2026-11-20, its worktree from `0976d4909`, record to the day's `Probes/press-cost/`
- evidence:

`force-graph-focus.spec.ts:262` is red on `main`: the 3D press took 406 ms on a picture of four cards and 637 ms on five, against 500 ([the cause](../AgentSessionHistory/2026/11/2026-11-19/2026-11-19.1.record.md#work-notes-the-browser-stages-sixth-red-explained-the-presss-cost-grows-with-the-picture-and-this-landing-adds-two-files-to-the-picture-the-case-looks-at)). The bound is not moved.

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
