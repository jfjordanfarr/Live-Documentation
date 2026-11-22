# The default arrival of November 22, and a wire's words entered: what was measured and seen

_Historical evidence, taken on November 22, 2026 (02:03 to 02:21 UTC) by a builder of the 2D map, on its worktree's build of the day branch at `b3fe1749a` with the change this folder belongs to. The machine was shared with other builders throughout, at a load average of 16 to 31. This is a first milestone; what it leaves is under "Not done"._

## What changed

- Tuning → 2D Layout → **Arrival** defaults to *Reading, Then Neighbours, Look After*, the owner's choice by eye that day.
- **Arrival Waits** defaults to *While Pointed At Or Focused*, and **Arrival Rest** (1.5 s) is the least time at reading size, the owner's "ensure a minimum of N seconds of reading view size time, then permit immediate zoom-out when pointer exits node".
- Tuning → 2D Wires → **Wire Answers** defaults to *On*, and a wire's words can be entered by the pointer, selected and copied.

## The frames, measured as the probe of November 21 measured them

[`arrival-probe.mjs`](../../../2026-11-21/Probes/arrival-pull-back/arrival-probe.mjs) through the browser lane, 1,280 by 800, the continuing search off, Arrival left at the default, the pointer never on the card. The numbers are in [`numbers/`](numbers/).

**What is firm: the elements restyled, which do not depend on the load.**

| Subject | Elements under the map | The look's one change, at rest after the ease | In the frames of the ease |
| --- | ---: | --- | --- |
| the estate's `Contracts/IPaymentService.cs` | 1,197 | 625 in one pass | the reading look alone |
| `packages/engine/src/live-docs/pathfind.ts` | 5,916 | 2,599 in one pass | the reading look alone |
| `packages/engine/src/config/liveDocumentationConfig.ts`, 78 neighbours | 11,965 | 6,541 in one pass | the reading look alone |

The look changes once, in the frame after the ease's last, in every run. That is the form the measurement of November 21 favoured, now the default.

**What the measurement found beside it.** With Wire Answers on, every frame of the ease restyled the wires: 149 to 151 elements on the estate, 799 to 800 on `pathfind.ts` and **1,293 on the heavy subject**, 44 ms of style a frame at that load. The cause, from the trace: the band's width (`--wire-band`) written on the wires' overlay at each change of scale, a property every wire inherits. It is mended in the same change: the width is written only when the camera is at rest. The slowed run below was taken on the mended build, and its ease restyles 0 to 11 elements a frame on the estate and none on the heavy subject, the wires' 1,294 falling once, at rest, in the frame of the look's change.

**What is not firm: the times.**

| Condition | Subject | Ease | Frames in it | The look's change at rest | Note |
| --- | --- | ---: | ---: | ---: | --- |
| full, before the band's mend | estate | 950–967 ms | 18–19 | 233–267 ms | load 16 to 31 |
| full, before the band's mend | `pathfind.ts` | 1,350–2,217 ms | 7–12 | 650–1,417 ms | load 16 to 31 |
| full, before the band's mend | heavy | 883–2,350 ms | 7–9 | 1,567–2,400 ms | load 16 to 31 |
| two slowed cores, after the mend | estate | 733 ms | 9 | 1,200 ms | the two cores shared with a build |
| two slowed cores, after the mend | `pathfind.ts` | 7,300 ms | 5 | 6,516 ms | the two cores shared with a build |
| two slowed cores, after the mend | heavy | 25,099 ms | 3 | 24,232 ms | the two cores shared with a build |

An ease is 700 ms by its clock; every figure above it is the machine's load. On November 21, at a load of 1 to 5, the same form eased in 27 to 32 frames with a worst of 33 to 50 ms on the heavy subject and changed its look at rest in 450 to 467 ms, and on two slowed cores in 1.2 to 2.2 s. **These runs do not replace those figures; they say the counts hold under the new default and no more. A measurement on a quiet machine is owed, at full speed and slowed, on the build with the band's mend.**

## The strips

Eight frames of the browser's screencast across each ease, from the probe: [`numbers/default--full--heavy--strip.png`](numbers/default--full--heavy--strip.png), [`numbers/default--full--pathfind--strip.png`](numbers/default--full--pathfind--strip.png), [`numbers/default--full--estate--strip.png`](numbers/default--full--estate--strip.png), and the same three under `default--weak`.

**My eye on the heavy subject's strip.** The card with its descriptions shrinks into the neighbourhood in one look: the prose becomes a grey texture, the wires gather at the right, and the neighbours' cards come in at the edges. No frame shows two looks at once and nothing pops while the picture moves. The last gap is the pause at rest before the names grow, 1.4 s in this strip, which is the load's; by the earlier quiet measurement it is half a second. I could judge stills of the motion only, and under that load not its smoothness.

## The Arrival Rest: 1.5 s, and why

The rest is not the time to read the card. The pointer on the card, or the focus in it, gives that for as long as it stays. The rest is the time to see what stands there and to bring a pointer to it. Counted from what a person does in it: about a quarter of a second to take in a new picture; the file's name and the first words under it, at about four words a second (silent reading of English non-fiction runs near 240 words a minute); and a hand's move to a large target in the middle of the view, about half a second. That is near 1.5 s. The 0.9 s it replaces was the hold of November 19, at which the probe of November 21 found a reader "pulled off" the words. It is a reckoning from component times and not a measured optimum: the lever runs from 0.5 to 6 s, and the owner's eye decides.

## The pictures: the arrival waiting on a reader, and a wire's words entered

[`shots.mjs`](shots.mjs), at 02:23 UTC on the build with the band's mend, nothing chosen in Tuning but the continuing search off; what it read is in [`shots.json`](shots.json). The pink ring is the script's mark of the pointer, which a screenshot does not draw. Subjects: the estate's `PaymentService/Data/PaymentsContext.cs` and this repository's `pathfind.ts`. Files are named `<estate|repo>--<pointer|focus|wire>--<moment>.png`.

| Journey | What the page said and did |
| --- | --- |
| estate, pointer | landed at reading size (`1-lands`); the pointer brought to the file's name; after 4 s on the card the map still said `waiting`, its camera not moving, the scale unchanged (`2-waits`); the ease's first frame came 48 ms after the pointer began to leave; 717 ms, 21 frames, the longest 67 ms, the reading look throughout, the look changed 167 ms after the last (`release--strip`, `3-released`) |
| estate, focus | the same with the keyboard's focus on the file's name: `waiting` after 4 s; the ease's first frame 61 ms after the focus began to leave by Shift+Tab; 833 ms, 20 frames, the longest 150 ms |
| repo, focus | `waiting` after 4 s; first frame 66 ms after the focus left; 1,317 ms, 17 frames; the look's change at rest a frame of 650 ms |
| repo, pointer | `waiting` after 4 s; first frame 328 ms after the pointer began to leave, and 4 frames in 1,667 ms: the machine's load fell on this run, and it shows nothing of the motion |
| estate, wire | a pointer rested on the wire from `dbo.usp_PostPayment.sql` to `PaymentsContext.cs` (`1-rested`); half way across the 20 px to the panel the words stood (`2-on-the-way`); inside, a drag along the head selected "PaymentsContext.cs uses dbo.usp_PostPayment.sql" (`3-inside-selected`); Escape took the words away with the pointer where it was (`4-escape`) |
| repo, wire | the same on the wire from `pathfind.ts` to `queries.test.ts`: the words stood on the way, "queries.test.ts uses pathfind.ts" was selected, Escape took them away |

**My eye, on the two I looked at.** [`estate--pointer--release--strip.png`](estate--pointer--release--strip.png): the card with its descriptions draws back evenly into its folder and its neighbours, one look through the motion, and in the last frame the names stand larger, the look changed at rest. It reads as one picture moving away. [`estate--wire--3-inside-selected.png`](estate--wire--3-inside-selected.png): the panel stands below and to the right of the point asked at, on neither card the wire joins; its head is selected end to end; the wire's two cards keep their look and the others are faded, so what the words speak of is still what stands out while the pointer is inside them.
Two more, opened in the second milestone. [`estate--focus--2-waits.png`](estate--focus--2-waits.png): the card stands at reading size four seconds after it landed, the focus ring drawn round the file's name and nothing else marked; a person sees where the keyboard is and that the picture is waiting on it. [`repo--wire--3-inside-selected.png`](repo--wire--3-inside-selected.png): on this repository's pulled-back picture the panel says "queries.test.ts uses pathfind.ts", its head selected; it stands to the right of the wire, clear of both the cards it names, and lies over three rows of `emit.ts`, a card it does not speak of, as a floating panel does. Everything but the one wire is faded, and on a view this dense that is what makes the wire findable at all.

## Second milestone, 03:10 to 03:55 UTC: the new cases seen failing, and one case's failure understood

**Each new browser case against a build that breaks what it holds.** One build carried a switch the page read at start, taken out again before the commit; each mutant was run once through the lane on the case named.

| The product broken so | The case | It failed with |
| --- | --- | --- |
| the wait ignores the pointer | the default arrival waits while the pointer is on the card | the map never said `waiting` |
| the wait ignores the focus | the keyboard's focus holds the default arrival | the map never said `waiting` |
| the rest shortened to nothing | the default arrival rests at reading size for the rest | the map never said `resting` |
| no input ends an arrival | a person who moves the camera while the arrival waits has taken it | after the wheel the map still said `waiting` |
| no input ends an arrival | the person's input during the rest ends the arrival | passed at first: the pointer stood on the card, and under the default a held arrival keeps the camera as still as an ended one. The case now also asks that the arrival is over, and then failed with `waiting` |
| reduced motion ignored | where the person prefers reduced motion, the default arrival is on the neighbours at once | an arrival rested and eased |
| the panel takes no pointer | hoverable | nothing was selected by the drag along the head |
| the way to the panel drops the words | hoverable | the words were gone at step 2 of 38 |
| Escape dismisses nothing | dismissible | the words still stood |
| a clock removes the words after two seconds | persistent | the words were gone after four seconds on the wire |

To tell the rest's start from the picture's settling, the map now says `settling` before `resting`; before that the rest's case could not have failed on a picture that took longer than the rest to settle.

**The trial's case that pulled back at a rest of 0.75 s.** In the first milestone the trial value "pointed" let the picture pull back although the case had brought the pointer to the card. Run again twice at 0.75 s and twice at 1.5 s on a calmer lane (load 11 to 22), with the page logging each frame, it held all four times: the picture said it rested 70 to 180 ms before the pointer was over the card, and the pointer was over the card for every frame after. The trial holds only a pointer that reaches the card before the rest ends, and the case reaches it after half a dozen round trips to the page; the failing run was at a load near 30, with a lint and the unit tests running beside it. So the case races the rest and lost: the case's fault, not the product's. Its own trace was overwritten before I read it, so this is the reading the four later runs support and not one taken from the failing run. The case now says which it was, by asking that the map still says it settles or rests when the pointer is on the card.

## Not done

- A measurement on a quiet machine (above): the load did not fall below 8 in either milestone.
- The strips of the focus journey and this repository's stills were not opened.
