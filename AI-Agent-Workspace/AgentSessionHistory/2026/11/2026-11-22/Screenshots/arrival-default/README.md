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

## Third milestone, from 04:30 UTC: the quiet measurement, the keys in a mirrored picture, the last pictures

**The quiet measurement**, the same probe on the build with the band's mend, merged with the day's tip at `3a710ca38`; the load average was 3.1 at the start of the full-speed run and 3.1 to 4.4 through the slowed one. Numbers in [`numbers/quiet--full.json`](numbers/quiet--full.json) and [`numbers/quiet--weak.json`](numbers/quiet--weak.json), strips beside them.

| Condition (load) | Subject | Ease | Frames in it | Longest frame in the ease | Restyled in a frame of the ease | The look's change at rest |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| full (3.1) | estate | 767–783 ms | 41–42 | 17–33 ms | 0 | 83–100 ms, 625 elements and 149 wires |
| full (3.1) | `pathfind.ts` | about 700 ms | 40–41 | 33 ms | 0 | 350–367 ms, 2,594 and 757 wires |
| full (3.1) | heavy | 700 ms | 25–29 | 50 ms | 0 | **767–1,033 ms**, 6,867 and 1,322 wires |
| two slowed cores (3.1–4.4) | estate | 717 ms | 25 | 67 ms | 9 at most | 467 ms |
| two slowed cores (3.1–4.4) | `pathfind.ts` | about 700 ms | 10 | 100 ms | 7 at most | 2,267 ms |
| two slowed cores (3.1–4.4) | heavy | about 700 ms | 5 | 200 ms | 6 at most | **5,716 ms** |

The motion itself is clean at full speed: every frame of the ease on time on the estate and `pathfind.ts`, none over 50 ms on the heavy subject, and nothing restyled while the picture moves. **The pause at rest is longer than the figures of November 21** (450 to 467 ms at full speed and 1.2 to 2.2 s slowed, on the heavy subject), about double at full speed and more than double slowed. Not traced to its cause. Two things differ in that frame and I measured neither apart: the wires' bands, on by default now, take their width when the camera stops, in the same frame as the look's change (1,322 elements on the heavy subject), which is where this change put it; and the day's tip adds rules the cards are matched against. The next step is to write the band's width a frame after the look's change and measure the two frames.

**The arrow keys in a mirrored picture.** With the map's mirror on, Right on a card took a wire on the card's left: the case judged it by where things stand on the screen and failed on the unmended build ("the wire reaches beyond the card's right edge": expected beyond 848 px, received 577). The keys now go through the picture's one mapping (`layoutEndAt` in `reading-direction.ts`).

**The last pictures, each opened.**

- [`estate--focus--release--strip.png`](estate--focus--release--strip.png) and [`repo--focus--release--strip.png`](repo--focus--release--strip.png): Shift+Tab takes the focus to the card before the subject, and the camera, which brings a focused control into the frame, has already slid to that card in the first frame (the estate's `PostPaymentRow.cs` and `Payment.cs` stand at the left edge with their first letters at the view's edge, this repository's `graph.ts` in the middle with `pathfind.ts` pushed to the right). The pull-back then starts from there and ends on the neighbours' frame. So by keyboard a person sees two movements run together, a slide to where the focus went and the draw-back. Nothing jumps, and the ease begins where the camera stands. Whether the slide should be left out when a pull-back is about to follow is a question for the owner's eye; I did not change it.
- [`repo--pointer--2-waits.png`](repo--pointer--2-waits.png): `pathfind.ts` at reading size, its name lit under the pointer, its descriptions readable, waiting.
- [`repo--pointer--3-released.png`](repo--pointer--3-released.png): the neighbours' frame at the floor. Names read at about 9 px. **The subject's own name is not on screen:** its card is taller than the view and is centred, so the view begins at its second row. It was so under the trial too (the frame is the same), and it is the plainest fault I see in where the default lands on a tall file: a person arrives on a file and, after the pull-back, cannot read which one. A frame that enters a tall subject at its top would keep the name; not built, since it changes where the arrival ends.
- [`repo--pointer--release--strip.png`](repo--pointer--release--strip.png) was taken under load in the first milestone, four frames in 1.7 s, and shows nothing of the motion; the quiet strips under `numbers/quiet--full--*` are the ones to look at.

**What the sweep on the arrival that ships found in the product** (the sweep is not finished; its table is in the handback of that hour).

- *Names cut at the frame the arrival ends on.* The still-picture instrument, which had always read the Local Map at reading size, found six to nine symbol names cut by 1 to 24 px on three pictures of this repository once the default had pulled back. A probe on the five-file picture reached the same frame four ways (the default, the pull-back that crosses the look, Neighbours at once, and six presses of Zoom Out by hand from reading size): the same six names were cut by the same amounts every time, at scale 0.335 in the connections look. So it is not how the arrival gets there; the connections look cuts those names at its farthest press, and that press is where the arrival's floor is set, described until now as "the farthest zoom at which every card's names still read". Not mended.
- *A tall subject's name off the screen*, the picture above: found also by `pin-clicks.spec.ts`, whose fifth click, the first symbol's Pin on `branches.ts`, lies above the view after the pull-back. Not mended; the mend I would make is to enter a subject taller than the room at its top, as a step and the reading frame already do.
- *A card's Close, Pin and Read are not drawn in the connections look*, where the arrival now ends; they are in the card's menu there. One case (`local-map-pins`) pressed Close on a neighbour after arriving and now says it stays at reading size. Whether the pull-back should end in a look without those controls is the owner's to weigh.

- *A symbol chosen in the search is pulled away from.* `search-bar.spec.ts` asks that a symbol chosen in the search has its row and its actions in view; a search choice is an arrival, and the pull-back leaves the row outside the view on `pathfind.ts`. Not mended: whether a symbol's choice should pull back at all, or the end frame should hold the row, is a choice about what the arrival means.

Two more failures are not understood and may not be the arrival's: `local-map-path`'s direct link to `client/index.ts` did not draw within its five seconds, three times, and `local-map-branches`'s reading of every lane ran past its minute, also with the arrival held at reading size. Wire Answers being on, which gives every wire a second path, and the day's merged tip are the two things that differ from the last time they passed; neither was tried apart.

## Fourth milestone, from 05:27 UTC: the frame holds what was asked; the cut names measured; the pause parted

**The frame an arrival ends on holds what was asked** (the root's rule): the subject's name always, the row asked for where there was one. Built as the least pan from the old end frame (`holdAsked` in `camera-intent.ts`). Its case, "the frame the default arrival ends on holds what was asked", failed on the build before it: `branches.ts`'s name stood from 42 to 50 px in a frame that begins at 50.

**The names cut in the connections look: the facts.** A probe went out a press at a time from reading size on the five-file picture, at 1,600 by 1,000 ([`numbers/`](numbers/) holds no file for it; the lines are here).

| Press | Scale | Look | Names cut | By, on screen |
| ---: | ---: | --- | ---: | --- |
| 0 to 2 | 1 to 0.694 | reading | 0 | |
| 3 | 0.579 | connections | 6 | 13, 10, 3, 5, 7, 16 px |
| 4 | 0.482 | connections | 6 | 11, 8, 2, 4, 6, 13 px |
| 5 | 0.402 | connections | 6 | 9, 7, 2, 3, 5, 11 px |
| 6 | 0.335 | connections | 6 | 7, 6, 1, 3, 4, 9 px |

- *What sets the floor.* A constant: `ARRIVAL_FLOOR_RATIO` is `farthestRatioOf("connections")`, the zoom ladder's sixth press, 1.2 to the power of minus six (`ladder-steps.ts`). It measures nothing of the picture.
- *The cut is the look's, not the floor's.* The same six names are cut at every press of the connections look, by the same amount in the map's own units (about 22, 17, 5, 9, 12 and 27); on screen the amount shrinks with the scale. The floor is where it is smallest.
- *Why.* In the connections look a row's name is one line (`display: block; width: max-content`) drawn at the look's held scale, 2.2 (`LOOK_SCALES`), by a transform. `committedLiveDocGraph` is 121 px wide at its 11 px font and so 266 wide drawn, in a label 244 wide; the text clips across (`overflow-x: clip`) with no ellipsis, no second line and no title. The stylesheet's own formula for the name's scale knows it: the room it is given (0.9 of 323 less the More at its held size) allows 2.06, and the scale is held at 2.2 because a name is never drawn smaller. What should then give the name a second line, or a cut at a seam with its ellipsis and title, is the card reading's pass (`card-reading.ts`, the block that writes `local-name-lines-connections` and `local-name-cut`); it did neither for these rows. It reckons the room across as 323, 334 and 360 less the More's 46, that is 277, 288 and 314, where the label as drawn is 244, 234 and 266. Names between the two widths are the ones clipped. I read that from the numbers and the code and did not step through the pass.
- *What the design system says.* Its fifth principle of the visual foundations: "Nothing shrinks to make room; held sizes stay held. ... Where room runs out, the name is cut with an ellipsis or leaves the picture; it is never drawn smaller." So a row's name may be cut in the connections look, with an ellipsis. These six are clipped without one, which that rule does not allow either. On these names the two instruments do not disagree: both refuse them. They differ only on a name cut with its ellipsis, which the rule and the zoom looks' cases accept and the still picture's count of truncations refuses.
- *The mend I propose, not built:* the look gives the name its room. The card reading's room across for the connections look is made the label's width as that look draws it, so that a name too wide for one line takes the second line its slot already has (the description is not drawn there), and a name too long for two is cut at a seam with its ellipsis and title, as the pass already does for a row that keeps its description. The picture of it today is [`repo--pointer--3-released.png`](repo--pointer--3-released.png): `symbolMatchesAnchor` on two lines is the mended form, `MAX_ENUMERATED_…` the cut one; the six are neither. Moving the floor instead would not help: every press of the look cuts the same names, so a floor "by measure" would be the reading look's last press and the arrival would hardly pull back.
- The three still-picture cases stay red.

**The pause at rest, parted.** On the heavy subject, back to back in one hold (load 8 to 11; `numbers/band-*.json`):

| Condition | The band's width in the frame the camera stops | Two frames after |
| --- | --- | --- |
| full, two runs | 1,483 and 1,717 ms (style 935 and 1,072 ms; 9,840 elements) | 1,250 and 1,550 ms (style 770 and 916 ms; 8,516 elements) |
| two slowed cores | 8,833 ms (style 5,852 ms) | 6,266 ms (style 3,924 ms) |

The band's part was mine, a tenth to a seventh of the frame at full speed and three tenths slowed; it is mended (the width is written two frames after the camera stops). The larger part, the look's own pass over 6,870 elements, is not mine and is not explained by this: on November 21 the same pass over 6,420 elements took 271 to 275 ms of style at a load of 1 to 5.

**The five cases the sweep left unclassed**, each run in a hold of its own kind with nothing of mine beside it (load 12 to 13):

| Case | Alone | What parts the causes | Class |
| --- | --- | --- | --- |
| `card-reading-refresh`, two cases | failed: the card's Read control has no box | with the arrival held at reading size, both pass | needs the picture at reading size; seeded, with the reason |
| `explorer-history`, "an opened folder is a step back" | failed at 33.8 and 34.5 s of its 30 | with the arrival at reading size it passed once, in 30.2 s, and failed once, at 33.9 s | a time limit its own work fills, on the heaviest neighbourhood of this repository; the arrival is not what decides it. Not seeded and not mended: the loads were 12 to 15 |
| `local-map-path`, the direct link to `client/index.ts` | passed once, failed once | failed with Wire Answers off too | a time limit at its edge: the map is to be drawn within 5 s and takes about that; not the arrival (the map is not drawn yet when it fails) and not the wires' bands |
| `local-map-branches`, the lanes case | failed, past its minute reading every wire | failed with Wire Answers off (a wire 856 px above the top), and in the third milestone with the arrival at reading size | not the arrival and not the wires' bands; not found. It should be run on the day's tip without this branch before anything is concluded |

**Found on the way, and whose they are.**

- The search bar's case of a symbol's row "and its actions" now stays at reading size and says why: the row's Pin is the reading look's. With that, it reached its last line for the first time today and failed there on a fact of this repository: `walkBetween`, added to `pathfind.ts` that day, takes a `Neighbours`, so hovering `Neighbours` lights five rows and not four. The list is brought level with the source.
- The rest's case counted the rest between two frames of its log and once read 1,439 ms for a rest of 1,500, a late frame after the picture settled. It now reads the frame in which the map says each word, by an observer and the frames' own clock, and asks for the whole rest with no allowance.
- Two cases of the following camera (Framing, Follows Pins) expect the map to say that `pathfind.ts` is left out of the frame after a far cell is pinned, and it no longer says so. The arrival is not in them (they hold reading size, and Follows Pins frames its own arrival). `pathfind.ts` lost a function that day, and a shorter card may now fit the frame with the new one; not looked into.

## Fifth milestone, from 06:12 UTC: the names looked at and mended; the following camera's far cell

**A correction to the fourth milestone's account of the six names.** I wrote that they were clipped across with no ellipsis. I had not looked: I read "is cut off by" in the audit's message and an `overflow-x: clip` in the stylesheet and put the two together. Looked at with the eye's probe (press 3, 1,600 by 1,000; positions in screen pixels):

| Name | Its text ends at | Its button ends at | More begins at |
| --- | ---: | ---: | ---: |
| `committedLiveDocGraph` | 2,085 | 2,072 | 2,096 |
| `sourcesFacts (function)` | 1,737 | 1,727 | 1,763 |
| `resolveSymbolReference` | 1,741 | 1,738 | 1,771 |
| `emitNeighbourResult` | 2,069 | 2,064 | 2,089 |
| `emitReachableResult` | 2,071 | 2,064 | 2,089 |
| `emitSymbolPathResult` | 2,080 | 2,064 | 2,089 |

Every name was drawn whole, 9 to 30 px clear of More, and nothing clipped it (the text's own width limit was wider than the text). What the audit counts is its oldest check: a text that runs past the box of its own element. The name's button was the shorter thing: in the row's layout the Read, the Pin and the type marks keep their room though the connections look hides them, so the button ends where they begin, while the look's stylesheet gave the name the room up to More. So the fault was real but smaller than I said: the end of the name stood outside its button, where a press or a pointer's rest on it does not reach the name. The design system's fifth principle was not broken by it.

**The mend, as ruled:** in the far looks the name's room across is no wider than its button as laid out (`card-reading.ts`, `--row-label-w`; `reading.css`, `--name-room`). A name wider than that takes the second line its slot already has; one its lines cannot hold is cut by the stylesheet's ellipsis and its button's title says it whole. [`names--after--headCheck-card.png`](names--after--headCheck-card.png): `committedLiveDocGraph` on two lines, "committedLiveDoc" and "Graph", inside its button and clear of More. My eye: it reads as well as it did on one line and costs a line the row had spare; the one-line form was not wrong to look at, so this mend buys the button's truth and not legibility. The other way to the same end, widening the button over the hidden controls' room, would have kept the one line; it changes what a card's content measures when a render is made in that look, which the stylesheet's own note on names forbids, so I did not take it.

The case, `zoom-looks.spec.ts`, "in the connections look every row's name stands inside its own button…", failed on the build before the mend with exactly these six (12.9, 10.2, 2.6, 4.6, 7 and 15.5 px past their buttons at press 3) and passes after it; the audit's count of cut names on that picture is then 0.

**What the mend turned red, not resolved.** `zoom-looks.spec.ts`, "what the connections look shows does not depend on the platform font's line", fails after it on one name: under Segoe UI's line metrics, `formatDocumentationLinkComment` in `documentationLinks.ts` is cut "with 15.4 px below it, a line being 14.0 px". (Corrected the same day, from the sixth milestone's measure below: the next sentence, as first written, said the name "now needs a second line, which this machine's lines give it and Segoe UI's do not". That was a guess and it was wrong. The name is on two lines and wants a third under both fonts' lines, and its line is the same under both.) The case counts a line as the name's font size at the scale drawn (14.0 px); the line the look draws is its line height, 12.65 at that scale, 16.1 px, more than the 15.4 px free. So by the line as drawn the row does not hold another, and by the case's measure it does. I changed neither: which measure of a line is the standard is the same question as the still picture's, and it is the root's.

**Two more of `zoom-looks.spec.ts` red on that run, neither mended.** "stepped, chosen by a link, still reports the card ladder's bands and steps at every press" waits two minutes on a Zoom Out that is disabled; "a change of look moves the held parts where motion is welcome…" counts no moving part at one of its four changes of look. Both open the estate by a link that carries a Local Map setting (`zoomLooks`). A link that carries any such setting says the whole of Tuning, each lever it does not name at its default, so it puts the arrival back to Reading, Then Neighbours, Look After over the reading size these cases stored: the page pulls back to the floor and the first has no ten presses outward left. That is the cause of the first by its own evidence (the disabled button) and a likely cause of the second, not shown. The mend belongs in the cases, the link carrying `arrival: "reading"` beside its other setting, and is not made here because no hold was left to see it pass. The other specs that open such links (`descriptions-zoomed-out`, `local-map-directories`, `return-cost`, `tuning-reset`) were not looked at for the same thing.

**The rest's exact measure against a rest of nothing:** failed, as it should ("the map said it rested at reading size": undefined).

**The two cases of the following camera that lost "left out".** The product's meaning has not moved; the map has. Ten of `history`'s 31 cells, each pressed on a fresh visit under Follows Pins at 1,440 by 900 (floor 0.335):

| Cell | File | Box of the subject's name and the new card | Fits the frame at about | Said left out |
| ---: | --- | --- | ---: | --- |
| 0 | `bundled.test.ts` | 1,287 by 1,981 | 0.354 | no |
| 1 | `bundled.ts` | 822 by 2,688 | 0.261 | yes |
| 2 | `codec.ts` | 1,993 by 2,593 | 0.271 | yes |
| 3 | `derive.test.ts` | 1,272 by 2,374 | 0.296 | yes |
| 5 | `directories.test.ts` | 1,765 by 688 | 0.601 | no |
| 8 | `git.test.ts` | 870 by 449 | 1.22 | no |
| 12 | `queries.ts` | 1,417 by 2,578 | 0.272 | yes |
| 15 | `sampling.test.ts` | 1,288 by 1,981 | 0.354 | no |
| 20 | `summary.test.ts` | 1,352 by 1,710 | 0.411 | no |
| 30 | `words.ts` | 1,391 by 2,480 | 0.283 | yes |

The subject is said left out exactly where the box does not fit at the floor, in all ten. The cases pressed "the first cell", which was far enough when they were written and is now `bundled.test.ts`, a small card that lands near enough to be framed beside `pathfind.ts`. They now find their far cell by measure (`farCellIndex` in `camera-intent.spec.ts`).

## Sixth milestone: the platform's line, measured

The fifth milestone's account of the platform font case was mine and was misleading: it set the line drawn (16.1 px) against the room (15.4 px) as though the font's own line made the difference. It does not. The one name the case reports, `formatDocumentationLinkComment` in `documentationLinks.ts` (the file pinned, three presses out, the map at 0.5787, the name held at 2.2), measured on a fresh visit under each font's lines:

| | This machine's lines | Segoe UI's lines |
| --- | ---: | ---: |
| One line of the name, as the card reading measures it (`--row-line`) | 12.646 | 12.646 |
| The name's computed line height | 12.646 px | 12.646 px |
| Lines the name takes | 2 | 2 |
| Height its text needs against the height it has | 38 against 25 | 38 against 25 |
| From its text's bottom to its row's bottom | 28.63 | 28.63 |
| Its button's title | the whole name | the whole name |
| Its button's width, the room to the wrapper's edge, the name's width | 226, 311, 173.1 | 269, 354, 200.1 |

The line is the stylesheet's already: the slot card states 1.15 and the name 11 px, 12.65, and it measures the same under both. The name is cut the same way under both: it needs three lines of its button's width and has two, the most a name takes in that look (`lookHeadWrites`: "up to what a slot row holds there"). The case asserts no cut name under Segoe UI's lines only, which is why it read as a difference of platform. Only the widths differ, the emulation's face being wider than this machine's.

What each instrument says of that one name:

- **The product:** too long for two lines of its button, so cut by the stylesheet's ellipsis on the second and titled whole, as ruled for the names' mend. A third line would need 27.8 more units in a row 66 tall that holds 60.4 already.
- **The platform case** (`cutBesideRoom`): "cut with 15.4 px below it, a line being 14.0 px". Its room is from the text's drawn bottom to the row's box, 28.63 units, 16.6 px on screen less its 2 px of air; the text stands 23 units above its own row's place because the look spaces the card's heads evenly, so that room is the even gap after the head and not room the row's two lines left. Its line is the font's size as drawn, 14.0 px; the line as drawn is 1.15 of that, 16.1 px, and does not fit in 15.4.
- **The names' case and the audit's own-width check:** nothing; the text ends inside its button.

Before the mend the name had the room up to More, and the case, which passed then, counted it whole; the mend narrowed its room to its button and it now wants a third line. (That the text stands 23 units above its row's place is reckoned from the numbers above, 66 less the 60.4 two lines take against the 28.63 measured, not read from the page.) [`names--cut-on-two--segoe-lines.png`](names--cut-on-two--segoe-lines.png) and [`names--cut-on-two--this-machine.png`](names--cut-on-two--this-machine.png): "format / DocumentationLink…" and, under it, "parse / Documentation…", each with blank room between its ellipsis and More. My eye: this is worse than what the mend replaced. The fault it mended could not be seen (a name's end outside a button that draws no box); what it costs can (names cut beside empty room). The other mend, the button made as wide in the far looks as the room the name is given there, should keep the names this mend cut and still put each inside its button; it is not built or measured, and it has a trap to measure first (a card's width is taken from its content, so the button must widen without changing what the row contributes to it).

Nothing was changed for this: not the case, and not the product, since a line the stylesheet states is what it already has.

**The other two of `zoom-looks.spec.ts`.** "stepped, chosen by a link…" passes alone (6.0 s) now that its link says its arrival: the ladder's link carries a setting, and a link that carries one resets every lever it does not name. "a change of look moves the held parts…" passes alone unchanged (14.3 s): its link names the three looks, the default, which a link does not carry, so nothing was reset; it had failed in a hold the lane cut at its limit, and the load made that number.

**The four other files that open links carrying settings**, each in a hold of its own: `local-map-directories.spec.ts` 14 passed, `return-cost.spec.ts` 3 passed, `tuning-reset.spec.ts` 3 passed, `descriptions-zoomed-out.spec.ts` 6 passed and 3 failed. Of the three:

- *The link reset the arrival* (two): "the file's own line stands under its name…" and "with half the descriptions folded…" open a link that carries the trial's choice, so began pulled back and three presses further out, the cards without rows. Their link now says its arrival; both pass.
- *Pinned to the room the names had* (one, not mended): "…cut in its middle at a seam (fallback)" counts nine names of one card cut in their middle with both ends kept and finds eight. Each cut's form is checked against its own room by the case's soft measures and none of those failed; the count is of a picture, and the names' mend narrowed the room it was counted in. Which name moved was not measured. Under Segoe UI's lines the count is still nine.

`history-2d.spec.ts` passed whole, 6 cases.

**The still picture's cases of this repository, after the names' mend.** The five-file Local Map, which had the six names, passes. Three still report names, nine in all, and a probe of each picture found the same names by the same amounts, every one cut with an ellipsis and its button titled with the whole name:

| Picture | Name | Cut off by | How it is cut |
| --- | --- | ---: | --- |
| Five files, retained | `DEFAULT_LIVE_DOCUMENTATION_CONFIG` | 9 px | on two lines, wanting a third |
| | `savedPicture (function)` | 9 px | on two lines, wanting a third |
| Chain | `inferDefaultEntryNodeId` | 15 px | on one line, in a row that holds one |
| | `backwardStrength (function)` | 13 px | on two lines, wanting a third |
| | `Internals` (of `client/index.ts`) | 24 px | on one line |
| Chain, retained | `inferDefaultEntryNodeId` | 33 px | on one line, in a row that holds one |
| | `createWorldMapView` | 13 px | on two lines, wanting a third |
| | `createPersistNavScheduler` | 54 px | on one line, in a row that holds one |
| | `readPersistedNav` | 5 px | on one line, in a row that holds one |

What each instrument says: the audit's cut-off check counts any text its clip hides, an ellipsis or not, so it counts all nine (for those on two lines, the clamped third line, one line's height on screen; for those on one, the width hidden). The names' case, which asks that a name be whole or cut with its ellipsis and titled, passes on all of them. The four on two lines are the mend's doing in the sense above (their room is their button's now); `inferDefaultEntryNodeId` on the chain is not, its room being bounded by More at its held size (239 of the 243 its button has). Pictures: [`DEFAULT_LIVE_DOCUMENTATION_CONFIG`](names--still-cut--five-retained--DEFAULT_LIVE_DOCUMENTATION_CONFIG.png), [`savedPicture`](names--still-cut--five-retained--savedPicture.png), [`inferDefaultEntryNodeId`](names--still-cut--chain--inferDefaultEntryNodeId.png), [`backwardStrength`](names--still-cut--chain--backwardStrength.png), [`createWorldMapView`](names--still-cut--chain-retained--createWorldMapView.png). Nothing in the instrument was changed.

**The centre case, after the day's merge.** "Reading, Then Neighbours on `pathfind.ts` stops where names still read and centres the subject…" failed once on the merged build: the subject, shorter than the frame, stood 6.3 px below its centre. The case, written in the fourth milestone, asked for the centre whenever the card fits the frame; the rule moves the camera by the least that brings the subject's name inside the frame's padding, so a card between the frame's height and the frame less its paddings is not centred. The case now says the rule: centred where the name then stands inside the padding, else the name's top on the padding's edge. It passes alone. Which of the two it found on that run was not printed.

**On the merged build, each in a hold of its own:** `zoom-looks.spec.ts` 10 of 11 (the platform font case red, above); the search bar's two and the five-click pin passed; the rule's cases passed, the centre case after its correction; `camera-intent.spec.ts` passed whole, its 29 cases in three parts (13 of the arrival, 13 others, the rule's 3). Other builders' work shared the machine through these holds, the lane keeping the browsers apart.

## Seventh milestone, from 14:29 UTC: the button widened, one standard for a far look's name

The root withdrew the narrowing: "The narrowing was my ruling and it is withdrawn."

**The button, not the name.** In the far looks the name's room is again what More leaves, and its button spans that room. The form chosen: the button takes a right padding as wide as the room between its laid-out end and the end of the name's room, and a right margin of the same size taken back (`reading.css`, `--label-reach`). Its box grows over the room of the Read, the Pin and the type marks, which those looks do not draw and which take no press while hidden; its content box, and what the row contributes to the card's width, stay as they were. A wider flex item or a narrower hidden control would have changed the row's contribution, and a card takes its width from its content.

One thing the reach would have changed and does not: the card reading measured the button by its inner width, which includes padding, so a reading made in a far look would have measured a wider button than one made at reading size. It now takes the width of the box as drawn, less the reach, rounded as the layout rounds it (`card-reading.ts`, `labelWidth`).

**The trap, measured.** Every card's layout width and height on the five-file picture (`graph.ts`, 52 cards, 274 to 546 wide, 175 to 1,271 tall) and on the chain's (`client/index.ts`, 52 cards, 200 to 529 wide, 177 to 1,141 tall), at reading size, three presses out (connections) and seven (overview, cards keeping their size), before and after a render made in that look (the tests taken out of the picture and put back; the camera and the look stayed), on the build before the change and the build after: 624 comparisons a picture, none differing by a pixel. The numbers before are in [`numbers/cards--before--five.json`](numbers/cards--before--five.json) and [`numbers/cards--before--chain.json`](numbers/cards--before--chain.json); the buttons that reach on the build after were 62 and 48 on the five-file picture's two far looks, 122 and 65 on the chain's.

The comparison was made on the build before the rounding described above went in; it was not repeated after it, the lane's time having run out.

**Not green: the still picture still counts the six names.** On the five-file picture it reports them cut off by 9, 7, 6, 4, 3 and 1 px, the amounts they ran past their buttons before any mend, at this scale. The names are whole and inside their buttons' boxes; the names' case passes on them. The audit's own-width check measures a text against its element's content box (`design-audit.ts`, `const own = contentBox(node)`), and the reach is padding, so to that check the names' ends lie outside. This was not foreseen and nothing was changed for it: it is either the instrument's rule for a button whose padding is its own name's room, or a form of the reach that is content and still adds nothing to the row's contribution (a negative margin alone takes the reach off that contribution; no such form was found in the time). The chain's Local Map case failed on the same build, its message lost to the lane's cut, presumably the same.

**One standard, in one place.** `farLookNames` in `tests/e2e/design-audit.ts`: in the connections look and beyond a row's name is right when what is drawn of it stands inside its own button and it is whole, or cut by its own ellipsis (the stylesheet's on one line, the clamp's on its last line, or the one the card reading writes into a name cut at a seam) under a title that says the whole name. The names' case asserts no fault by it. The still picture counts the names it allows apart (a column, Shortened names, and a line of its notes that names them) and still asserts every other cut at none. A new case of `zoom-looks.spec.ts` changes one drawn name as each fault would and expects the standard to count it: no title, a wrong title, no ellipsis, drawn past its button, and cut at reading size with a title and an ellipsis.

The standard found one fault of mine on its first reading: a shortened Internals row's title said `__internals__`, the key the row is stored under, where a person reads "Internals". The title is now the name as drawn.

**`Internals`, cut by 24 px on the chain's picture.** [`internals--chain--client-index.png`](internals--chain--client-index.png): it is the only row of the subject's own card, `packages/explorer/src/client/index.ts`, a file with no public symbol, whose card is the narrowest of the picture (200 wide, its row's room 122). The connections look holds the name at 2.1 times and More at 1.94: More takes 41 of the 122, the word needs 94.5 and has 81, so it is drawn "Inter…" with its title whole. By the standard it is right. To my eye it is a fault of the look all the same, a small one: the one word that says what this card holds is the one cut, in a card with empty room below it; the word has no seam to break at, so the second line does not help it. No small mend is plain to me (a name that comes down in size before it is cut is the overview look's rule, not this look's), so nothing was changed.

**What ran on the build with the reach, each in a hold of its own, the machine's load between 17 and 20:** `zoom-looks.spec.ts` 12 of 12 (the names' case, the standard's case, the platform font case untouched, and "a change of look moves the held parts…", which failed once in its hold and passed alone); `descriptions-zoomed-out.spec.ts` 9 of 9, the count of names cut in their middle back at nine. The still picture's five-file Local Map failed as above; its retained case and the chain's were cut by the lane's limit beside the case before them; the estate's cases, `camera-intent.spec.ts` and the search bar's two were not run on this build.

## Eighth milestone, from 15:20 UTC: which check found a cut, and the runs

**The ruling on the six names the audit still counted.** The root took the first way: "The audit says which check found each cut, and the still picture sets aside only an own-width finding on a far-look row name that `farLookNames` calls right." Its reason is written beside the code (`still-picture.ts`, `scoreText`): the own-width check stands in for "this text belongs inside this box", the standard asks the exact thing of a far look's name, and a button that draws no box has no padding for a text to crowd.

- `truncations` now says, for each cut, which of its checks found it (`by`): the text past its element's own content box, a clip between the element and the text, a clip on the element or an ancestor, or two fragments over one another on a line. Nothing it counts changed.
- One thing the first run showed, which made a shortened name look like two texts over one another: a browser gives an ellipsis a fragment of its own, lying over the fragment of the text it replaces. That pair is now counted with the clip of the element drawing the ellipsis, where it belongs; any other pair is still one text over another.
- `scoreText` sets aside an own-width finding on a name the standard calls whole, and counts apart a name it calls shortened when only the own-width check and the clip of the name's own text found it. A clip by the button or an ancestor, one text over another, and any name the standard faults are cut-offs as before, and so is everything at reading size.
- Seen to fail through the scoring: the standard's case of `zoom-looks.spec.ts` now reads `scoreText` four times on one picture. As drawn, `inferDefaultEntryNodeId` is among the shortened names and not among the cut-offs, found by exactly the own-width check and its text's clip. With its title removed, the cut-offs go up by one and the shortened down by one. Drawn past its button, the cut-offs go up by one and name it. Put back, both numbers are as they were. On its first run in this form the case failed, on the ellipsis' fragment above.

**The card measure, repeated on the final build** (after the rounding of the button's measured width): both pictures, 624 comparisons each against the build before the change, none differing. The numbers after are in [`numbers/cards--after--five.json`](numbers/cards--after--five.json) and [`numbers/cards--after--chain.json`](numbers/cards--after--chain.json).

**The still pictures, each case in a hold of its own, with the names each resting picture shortens** (from the report's rows):

| Picture | State | Collisions | Cut-offs | Shortened names |
| --- | --- | ---: | ---: | --- |
| Repository, five files | `graph.ts` selected | 0 | 0 | 0 |
| Repository, five files | 5 files retained | 0 | 0 | 0 |
| Repository, chain | `index.ts` selected | 0 | 0 | 2: `inferDefaultEntryNodeId`, `Internals` |
| Repository, chain | 4 files retained | 0 | 0 | 3: `inferDefaultEntryNodeId`, `createPersistNavScheduler`, `readPersistedNav` |
| Estate, five files | `PaymentService.cs` selected | 0 | 0 | 0 |
| Estate, five files | 5 files retained | 0 | 0 | 0 |
| Estate, chain | `GatewayClient.cs` selected | 0 | 0 | 0 |
| Estate, chain | 4 files retained | 0 | 0 | 0 |

All eight passed. The four names the narrowing had put on two lines wanting a third (`DEFAULT_LIVE_DOCUMENTATION_CONFIG`, `savedPicture (function)`, `backwardStrength (function)`, `createWorldMapView`) are whole again.

**The other runs on the final build:** `zoom-looks.spec.ts` 12 of 12 (the standard's case passed on its second run, after the ellipsis' fragment was placed; "a change of look moves the held parts…" failed in its hold under a load of 18 and passed alone, 17 s); `descriptions-zoomed-out.spec.ts` 9 of 9; `camera-intent.spec.ts` whole, 29 cases in three parts; the search bar's two ran out of their 30 s limit in a hold shared with the rule's cases under that load (38 and 40 s) and passed alone (19 s each); `look-change-cost.spec.ts`, run because the reach gives a look change two more properties to lay out, 2 passed. The repository's five-file retained case was cut once by the lane's five minutes under the same load and passed in 1.4 minutes when the machine was quiet; no limit was changed.

## Ninth milestone, from 18:16 UTC: the gate's seventeen

The gate ran the whole browser suite on the merged day branch (`2d2f18f2b`) and seventeen of its failures were this branch's, the sweep left to the gate at 05:11. Each was run alone, one worker, before anything was concluded; all seventeen failed alone, so none was the load's.

**Mended in the product (two faults a person would meet).**

- *A change of perspective is not an arrival.* A subject first drawn in 2D begins an arrival, and the change from 3D to 2D then puts the subject where it stood in 3D. The arrival went on under that carried place, so a reader who had panned the 3D picture found it 284 to 290 px away after a round trip (`force-graph-focus.spec.ts`, "manual pan survives a 2D and 3D round trip…"). With the arrival held at reading size by a temporary seed that case passed, which parted it from the 3D client's own changes. The carried place now ends the arrival and begins none (`controller.ts`, `placeReturnedSubject`, called by the change of perspective alone). Both round-trip cases pass on it, the other ("the 2D and 3D presses return at once…", 215 to 220 px from the room's centre) with it.
- *A link does not carry the arrival's rest at its default.* The rest was read as one of the packing's numbers, which a share always carries, so a share of the defaults said `arrivalRest: 1.5`. It is a lever of the arrival and is carried as Arrival and Arrival Waits are, only where it is not its default, its absence reading as the default (`layout-presets.ts`; a unit case holds both directions).

**The case was wrong (the subject is not the arrival, and the case says so now).**

| Case | What it met | Mend |
| --- | --- | --- |
| `local-map-tone` "three tones" | pulled back already, three presses out was the overview | begins at reading size |
| `local-map-pins` "ancestor disclosure" | the pull-back easing under its presses | begins at reading size |
| `local-map-packing` "packing changes keep the selected file in place" | pulled back, the same change moves the cards for three frames | begins at reading size |
| `card-reading` "the portrait reading frame returns from overview" | compared the reading frame with the pulled-back picture, 2,001 px | begins at reading size |
| `local-map-overview` "the overview band joins each pair" | a gathered wire's name read from the wire, which is unnamed under Wire Answers so that it is not said twice | reads the name from the wire's band where the wire has none |
| `wire-answers` "the arrow keys go the way they point" | seeded the reading direction among the Local Map's levers; it is a choice of Appearance since the mirror's button | seeds it where the product reads it |
| `card-reading` "taps on Walk and walk" (two), "tapping Walk and walk" | neither the arrival nor a wire: with both of `pathfind.ts`'s descriptions open the second name stood at y 956, below the frame's bottom at 891, in a window 960 tall | a window 1,500 tall for that file; the third also begins at reading size |

**Seen passing on the mended build, one worker:** the two round-trip cases (16.6 and 16.5 s); `local-map-packing.spec.ts` whole, 5 of 5, its two share cases among them; and in one hold the four tap cases of `card-reading.spec.ts`, its "tapping Walk and walk" and its portrait frame, the overview's pairs, the pins' disclosure, the three tones and the arrow keys, 10 of 10. The other cases of the changed spec files were not run again: three other builders held the lane and the milestone's time ran out.

**Not mended.**

- *A wire's band over a card's control* (`card-ladder-boxes.spec.ts` at 444 and 469, `overview-files.spec.ts` at 348). It is a fault of the product. The wires' layer stands above the cards' (`view-shared.css`, 20 over 1), and a band is twelve of the screen's pixels wide whatever the zoom, so in the map's own units it is 36 wide at the arrival's floor and 43 at the overview's first press: eighteen to twenty-one units to each side of a wire in a lane, over the edge of whatever card stands beside it. The More of `still-picture.ts` is under the band of a wire between two other files. A cap on the band's width would take away what makes a wire easy to point at when zoomed out. The two mends that keep it are structural: the bands in a layer of their own under the cards, which needs the cards' layer and the layout's own box to let the pointer through where they are empty; or bands that take no pointer at all, the wire under the pointer found by geometry where the pointer's target is not a card. Neither is small and neither was begun.
- *The phone's hold* (`local-map-learning.spec.ts`, "touch taps retain command activation…"). It fails alone and fails the same way begun at reading size, so it is not the arrival's pull-back: after the hold the menu shows, Escape does not close it, and the next tap lands on its first item. The menu hears Escape only while the focus is inside it; a probe found the focus on the page's body after the hold. Why the focus is not in the menu was not found. The case keeps the reading-size seed, which it needs on a phone, where nothing attends a card and the arrival pulls back a second and a half after it lands.
- *The hidden map's search* (`local-map-hidden.spec.ts`, alone pass). It fails alone: the search does not end within its 45 s after the return. The case begins at reading size already and its own comment gives the search 41 to 42 s on November 18's repository; nothing was changed and nothing was established beyond that.

## Tenth milestone, from 19:06 UTC: a band takes no pointer

**The ruling.** The root took the first of the two designs: "A band takes no pointer; the wire under the pointer is found by geometry, and only where the pointer's target is the map's ground and nothing of a card, a control or the panel." The rule for a reader: everything of a card takes the pointer before a wire's reach does; a wire's words never cost a reader a control.

**As built.**

- `styles/local.css`: `.wire-band` takes no pointer. It stays the wire's focusable, named element, and its stroke's width stays the reach as the stylesheet says it.
- `views/localView/wire-reach.ts`, pure and unit-tested: a route walked as a line of points (by `pathPoints` of `wire-marks.ts`, the walk the direction marks already make), the distance from a point to it, and the wire at a point: within half its reach, the nearest, and of two as near the later.
- `views/localView/wire-answers.ts`, `bandUnder`: the pointer's target must be the view or something of the camera's layer that is nothing of a card, no control and no returning lace; then the wire at the pointer by `wire-reach.ts`. Each band's route is walked once and kept until its `d` changes; a move measures only to the wires whose boxes, grown by the widest reach, hold the pointer. Nothing is written to any wire on a move.
- *By arithmetic and not by the browser's `isPointInStroke`*, because the rule needs the nearer of two wires, which is a distance and not a yes or no, and because the walk was already in the product and needs no element.
- *The nearer wire answers.* That differs from what the page did: the browser gave a point to the later band in the document, however near an earlier wire ran. Of two exactly as near, the later still answers.
- *The hand.* A cursor written on the view is inherited by everything in it: putting it there and bringing the style up to date took 20 to 25 ms at the median on a picture of 87 cards (measured, twenty times each way). So the hand is a spot nine pixels across (`.wire-hand`) that stands under the pointer while it is in a wire's reach on the map's ground, and is taken away when the picture moves or is drawn again. It is looked through when the wire is sought. A press from it is the map's own, as a press from the band was.

**The price of a pointer move**, on `liveDocumentationConfig.ts` as the arrival leaves it (the connections look at 0.335; 229 wires and 221 bands today, 87 cards; the 1,293 wires of the morning's measure are not this picture's count now), three passes of 151 moves across the map's room:

| | Before | After |
| --- | --- | --- |
| The page's own hearing of one move on the map's ground, timed about a dispatched event (281 and 329 moves) | median 0.0 ms, 95th 0.1, most 0.2 | median 0.2 ms, 95th 0.5, most 1.1 |
| The same on a card (122 and 124 moves) | median 0.0 ms, 95th 0.1, most 0.2 | median 0.0 ms, 95th 0.1, most 0.2 |
| From the event's own time to the last listener, 453 real moves | median 13.1 ms, 95th 481, most 1,111 | median 14.7 ms, 95th 324, most 583 |

So finding the wire by its route costs two tenths of a millisecond a move on the ground of this picture, a millisecond at the most, and nothing on a card. Of the real moves' targets before, 25 of 453 were bands; after, none. The numbers are in [`numbers/pointer-move--before.json`](numbers/pointer-move--before.json) (its real moves' row is mixed with the dispatched ones in that file's run; the figures above for real moves before are the run before it, which printed them alone) and [`numbers/pointer-move--after.json`](numbers/pointer-move--after.json).

**The new case, whole.** On its next run it passed in all three parts (21.4 s): the card's own press under a wire's reach, the hand over a wire and none on bare ground, and the nearer of two wires answering where a later wire's reach also holds the point.

**One hold spoiled by this builder.** That run was a hold of the new case with `local-map-tone`, `local-map-pins`, `local-map-overview` and `local-map-packing` whole: 21 of 23 passed. Lint, the unit cases and the Live Docs' generation were running beside it, started when the hold stood sixth in the queue and overtaken by it; that is this builder's fault and the two failures are not parted from it. `local-map-packing` "packing changes keep the selected file in place…" counted three moving frames where more than three are asked, which it had passed twice that evening with nothing beside it. `local-map-pins` "releasing the last pinned symbol…" pressed a row's Pin after the arrival's rest, on a row easing back to the look that draws no Pin: a case that never began at reading size and had passed by being quick. It begins at reading size now, as the other cases of its file that press a row's control do. Neither was seen again: the lane's queue stood at six.

**Other runs on that build, each in a hold of its own:** `camera-intent.spec.ts` whole with `tuning-reset.spec.ts`, 32 of 32 (5.3 minutes). The other spec files the ruling named (`local-map-learning`, `card-reading`, `force-graph-focus`, `overview-files` whole, `card-ladder-boxes` whole) were not run: three builders shared the lane, each turn of this one's came after ten to twenty minutes, and the hour ran out.

The second row holds the browser's finding of the target and everything the page does when a wire's words show; it is loose, on a machine three builders share, and is given for what it is.

**The cases.** The three the gate found red pass unchanged on the build with the change, alone in one hold: `card-ladder-boxes.spec.ts` at 444 (1.8 minutes) and at 469 (1.9), and `overview-files.spec.ts` at 348, both of its pins (27 and 26 s). `wire-answers.spec.ts`'s fifteen cases that stood before pass on it unchanged but for how they find a point on a wire: a reader's signs are kept (the words after the rest, the wire lit, the way to the panel, Escape, a press that pins, a drag that pans, the keyboard's walk, the arrow keys in both readings, a gathered wire's sentence, the two audits, the marks). The page's own word for what stands at a point is never a band now, so `bandPoint` looks for the map's ground under a point on a wire's route, and for no other wire's reach there.

The new case, "everything of a card takes the pointer before a wire's reach does…", on `still-picture.ts` as the arrival leaves it: it seeks from the wires something of a card that stands in a wire's reach (points along each route and 5 px to each side, confirmed by the browser's own geometry of the band's stroke), rests the pointer there and presses. With the fault put back by a temporary rule that made the bands take the pointer again, it failed as it should: the pointer resting on the card `tests/e2e/still-picture.ts`, under the reach of the wire from `card-reading-refresh.spec.ts`, brought up a wire's words. Without it, that part passes: no words, the press heard by the card's own element, nothing pinned. Its two later parts (the hand over a wire's reach, and the nearer of two wires) failed on their first run for the case's own reason, a finder that asked for a point in no other wire's reach where every wire is in another's; they are rewritten and were queued again.

**The phone's hold: who takes the focus.** The case's steps were run once with `HTMLElement.prototype.focus` and `blur` wrapped to record their callers and with listeners on `focusin`, `focusout` and the press's events, from the hold to the Escape (begun at reading size, as the case now is):

| At (ms) | What happened |
| ---: | --- |
| 2431 | `pointerdown` and `touchstart` on the card (`div.local-card-actions`) |
| 2984 | the hold's 550 ms are up: `focus` is called on the menu's first item, by the item menu's `show`, from `showNodeActions`; the focus goes from the card's Read to that item |
| 3130 | `pointerup`, `touchend` on the card |
| 3133 | the browser's own `mousedown` for the touch, at the finger's point, where the menu now stands: on the menu's own ground (`div.item-menu`), not on an item. `focusout` of the item follows at once, to nothing |
| 3134 | `mouseup`, `click` on the menu's ground |
| 3553 | Escape: its target is the page's body; the menu, which hears Escape on itself, does not hear it and stays |

So nothing of this branch's calls `focus` or `blur`: the menu takes the focus as it should, and loses it to the browser's default for a press on something that cannot hold the focus, the menu's own ground under the finger. No listener of Wire Answers or of the arrival appears in it. Why the case passed on the day's start was not found; the same press landing on an item, a few pixels away, keeps the focus in the menu, and what an item menu lists changed that day. The mend is small and in `panels/item-menu.ts`, which is not this branch's file: a press on the menu's own ground keeps the focus where it is (the default prevented where the press is on no item), or Escape heard by the window while the menu is open. It was not made.

## Eleventh milestone, from 20:04 UTC: the menu's ground, the hand held by a case, a tap, the laces

**The item menu.** Ruled: "a press on the menu's own ground keeps the menu's focus, since the ground of a menu is the menu." `panels/item-menu.ts` prevents the default of a mouse press that lands on the menu and on no item, so the focus stays on the item that has it. The phone's hold then gets past its Escape: the menu keeps the focus after the finger lifts and Escape closes it. The case says, at that line, what the release of a touch does. It also checks, at its end, that a press outside the menu closes it and a press on an item acts.

On its first run with the mend the case failed further on, for a reason of this builder's own making: the reading-size seed added in the ninth milestone replaced the whole stored state, and with it the growing composition this file's journeys read, under which the file's name says whether its reading is open. The seed keeps that composition now.

**The hand, held by a case.** `wire-answers.spec.ts`, "the hand's spot is gone when the picture moves under a resting pointer…": on `still-picture.ts` as the arrival leaves it, one press in and back teaches where a press in puts each point of the screen; a card's control is chosen whose middle will come to a point that a wire's reach now holds on the map's ground; the pointer rests there (the spot stands under it), the zoom's button is pressed by the keyboard, and the mouse's button goes down and up with no move. The control stands at the pointer and the press is its own. With the taking-away undone (a temporary observer that showed the spot again whenever the page hid it) the case failed as it should: "More actions for Internals in force-graph-exploration.spec.ts" did not stand at the pointer, the spot did.

**The two cases of the spoiled hold, alone** (load 3, nothing of this builder's beside them): `local-map-packing.spec.ts` "packing changes keep the selected file in place…" passed (23.2 s), and `local-map-pins.spec.ts` "releasing the last pinned symbol…" passed begun at reading size (4.6 s).

**A tap on a phone.** `local-map-learning.spec.ts`, in the phone's group, "a tap on a wire's reach brings its words, and a tap on something of a card that stands in a wire's reach is the card's own": the tap on a wire pins its words, a tap elsewhere lets go of them, and the tap on the card is heard by the card's own element and brings no words. The phone's picture does offer something of a card under a reach. It passes in the composition that ships, fixed slots (three runs: 2.9 to 3.3 s).

*Not mended, and a finding:* in the growing composition, which this file's other journeys choose and which is not the default, the same tap brought no words, three runs of three; at the tapped point (62, 500) the page's own word was the map's ground (`div.local-layout`), so the tap was not a card's. A guess was tried, that the press makes the picture draw its wires again so that the band pressed is gone at the release: the release now finds the wire under it where the pressed band is gone (`wire-answers.ts`, `pointerUp`). It did not change the result, so the cause is something else and is not known; the change is kept, harmless in the seventeen cases of the wire answers and the eight of this file, and is to be taken out if it is not wanted on that footing.

**The laces.** Read from the page's own word for what stands at nine points of every control of a card in view (its corners, edges and middle), in four pictures the cases draw:

| Picture | Returning laces | Controls in view | Points read | Controls under a lace |
| --- | ---: | ---: | ---: | ---: |
| `still-picture.ts` as the arrival leaves it | 0 | 126 | 1,116 | 0 |
| `pathfind.ts` at reading size | 0 | 90 | 750 | 0 |
| The estate's `PaymentService.cs` at reading size | 2 | 24 | 216 | 0 |
| The same on a phone | 2 | 23 | 204 | 0 |

No lace's reach lay over a card's control in them. Two of the four pictures draw no lace at all.

## Twelfth milestone, from 20:29 UTC: the release's line out, and the tap's cause

(Corrects the paragraph above that begins "Not mended, and a finding": the change it says was kept is out, and the cause it says is not known is below.)

**The line at the release.** Taken back to what it was. On that build `local-map-learning.spec.ts` and `wire-answers.spec.ts` ran whole in one hold: 25 of 26, the one being the growing twin of the tap, for the reason below; the seventeen of the wire answers and the phone's tap in fixed slots pass without the line. It stays out.

**The tap in the growing composition: recorded, not read.** One tap and then one mouse's click at the same point, in each composition, on a phone, with listeners for the press's events ahead of the page's own, the setter of `hidden` wrapped for the words' panel and the hand's spot, and observers on the wires and the camera:

| | Growing, the tap at 62, 500 | Growing, a mouse's click there | Fixed slots, the tap at 242, 595 |
| --- | --- | --- | --- |
| The page's word for what stands at the point, just before | the map's ground (`div.local-layout`) | the same | the map's ground |
| Bands whose strokes hold the point | one, PaymentService.cs uses IPaymentService.cs | the same one | three |
| The press's target (`pointerdown`, `pointerup`) | `div.node-card.selected`, the subject's card | the hand's spot, over the ground | `div.local-layout` |
| What turned the wire away | the target is of a card | nothing | nothing |
| `show` called | no | yes, from `pointerUp` | yes, from `pointerUp` |
| `close`, or anything else taking the words away | never called | never | never |
| The wires drawn again, or the camera moved, between press and release | no | no | no |
| Words | none | pinned | pinned |

So it is neither the composition's fault nor touch's hearing in the page, and nothing draws the wires again: the browser gives a touch that lands beside something pressable to that thing. The point the case first chose in the growing picture lay at the subject's edge; the tap's events came with the card as their target though the ground stood at the point itself; and by the day's rule a card takes the pointer before a wire's reach does. A mouse's click at the same point, whose target is what stands there, brings the words. Whether a tap there brought words before the band's change was not measured: the band then took the pointer, and what a browser's targeting does between a band and a card beside it is not known from this record.

Nothing in the product is changed for it. The case now taps a wire at a point clear of every card by sixteen pixels and says why. Its growing twin is not kept: with that clearance the growing picture on a phone has no such point in view (the run that asked for one found none among 42 wires), so the twin could not be made to say anything the fixed-slots case does not.

## Thirteenth milestone, from 21:54 UTC: the whole-file pin made near and far

The second landing failed `overview-files.spec.ts`, "a pin made while files only is showing gives, back at reading size, the cards, rows, pins and wires the same pin gives made at reading size: a whole-file pin, from the card's More", on the day branch at `a503db4d9`: one card differed, the subject's own, `tests/e2e/still-picture.ts`, 78 lines each way. Nothing was changed. What was measured, on that commit:

**Only the order of the subject's rows differs.** The case's two pictures (the pin made at reading size; the pin made seven presses out under files only, then back) were read again, with each card's rows taken three ways: in order, as a set (name, height, pinned by name), and its ports as a set.

| | Rows in the layout's order (the default) | Rows in the order of appearance |
| --- | ---: | ---: |
| Cards | 79 | 79 |
| The same cards, the same wires | yes | yes |
| Cards standing elsewhere in the second picture | 48 | 46 |
| Cards of another size | 0 | 0 |
| Cards with other rows (name, height, pinned) | 0 | 0 |
| Cards with other ports | 0 | 0 |
| Cards pinned otherwise | 0 | 0 |
| Cards whose rows stand in another order | 1, the subject | 0 |

So which rows a card shows, which are pinned and which carry a port do not depend on where the pin was made. The 78 lines are 26 rows of one card in another order, each with its two ports.

**The order follows the cards' places, by the product's own rule.** Symbol Order's default is the layout's, whose help says it "Orders a card's symbols by where their wires lead". `orderRows` in `branch-order.ts` gives each row a key that is the mean of the places of the cards its wires lead to, and sorts the card's rows by it. The case's own comment says where the cards stand is not held, since 2026-11-17: a picture's order is chosen by its price as it is drawn when it is made, files only in one and rows in the other, and the search that would re-price it afterwards is turned off in this spec. Here 48 of 79 cards stand elsewhere. For the four rows at the head of the difference: `still-picture.spec.ts`, which all four lead to, stands at y 10,016 in the first picture and 9,295 in the second, and `local-map-path.spec.ts` at 11,420 and 11,219; `verify.ts`, `types.ts` and `local-map-branches.spec.ts` stand where they stood. With the rows in the order of appearance, which the layout does not move, no card's rows differ, though 46 cards still stand elsewhere: the difference is the layout's ordering of rows and nothing else.

The two pictures are in [`numbers/pin-near-and-far--layout-order.json`](numbers/pin-near-and-far--layout-order.json) and [`numbers/pin-near-and-far--order-of-appearance.json`](numbers/pin-near-and-far--order-of-appearance.json).

**Why it showed now.** The case holds each row's place inside its card, which holds the order; it has held it since the picture last changed only because the two orders agreed. The subject is this repository's own file, which changed that day, and the files that use it with it.

**The fork, for the root.** Whether a reader should get one order of a card's rows however they came is a question of what the product means.

- *The order is the picture's, like the cards' places.* The case holds what the claim is, the same cards, sizes, rows, pins, ports and wires, and not the order of rows inside a card, as it already does not hold where the cards stand. Nothing in the product changes. A reader who pins far out and comes back sees the same rows in an order that suits the picture they are in.
- *One order however the reader came.* The order would have to be chosen again when the rows are laid out again at reading size, as for a picture made there. That is the search the product runs after every picture and this spec turns off; whether it brings the two pictures to one order was not measured: with the search left on, the map did not come to its rest within the 30 s the instrument's own wait allows, in three runs on this picture of 79 cards. It moves cards under a reader who has just come back.
- *A subject that does not change.* The estate's sample would stop this repository's own edits from moving the case, but would not settle the question: the same disagreement can arise there.

**The ruling: the first.** "The order of a card's rows is the picture's, like the cards' places." The root's reason is in the record already: direction's line "A picture may rearrange once after it arrives" (2026-11-16) sets aside for the playtests "that a pin made while files only is showing is priced on compact cards and can stand a few cards in another order than the same pin made at reading size"; Symbol Order's default orders a card's rows by where their wires lead, so where the cards may stand elsewhere the rows follow; and the control run above is the proof that nothing else moves. The estate's sample was not taken (the claim is about this product on any picture), and one order however the reader came stays set aside for the playtests.

**The case, as it holds the claim now.** Both variants of `overview-files.spec.ts`'s case hold the same cards, each of the same size, with the same rows (name, height, pinned by name), the same ports (side and symbol) and whether it is pinned, and the same wires; a card's rows and ports are compared by name and not by place. A paragraph beside the one about the cards' places says why and names direction's line and this measure.

**Seen red, by four made faults** in the second picture's page before it is read, on the whole-file variant:

| The fault made | What the comparison said of the subject's card |
| --- | --- |
| A row taken out of the drawing | `consumersOf 66` missing with its two ports, the card 305 by 3,995 for 305 by 4,067 |
| The card's pin taken off | `pinned` false for true |
| A row marked pinned by name | `consumersOf 66 pinned by name` for `consumersOf 66` |
| A port taken out of the drawing | `offers *` missing |

Without a fault, `overview-files.spec.ts` passes whole, 10 of 10, with `still-picture-reference.spec.ts`, 5 of 5, in one hold (2.1 minutes).

## Fourteenth milestone, from 22:26 UTC: the press of 3D pays for making the 2D map inert

The case is `force-graph-focus.spec.ts`'s "the 2D and 3D presses return at once": the page opened in 3D on `packages/engine/src/live-docs/graph.ts`, 2D pressed, 3D pressed. The 2D map there holds 52 cards, 247 wires and 14,810 elements. Everything below is a recording in the page on the tip `b0f2253b9`, each in a hold of its own with nothing of this builder's beside it. **Nothing of the product was changed in this milestone**: the cause is found and a mend is measured, and the mend is a change to how a view is held and put away that was not built or verified in the thirty minutes.

**Which read pays.** `changePerspective`'s second read of the destination's box, `requireElement("view-graph").getBoundingClientRect()` after the views are switched and the destination rendered: 189.7 ms with Wire Answers on, 188.0 ms with it off, 172.8 ms in a third recording. The first read (before anything changes) is not among the reads over 4 ms; the subject's anchor (`getClientRects` of the card's title, after the hold's writes) is 11.4 to 13.7 ms. (`numbers/press-3d--reads--wire-answers-on.json`, `…-off.json`.)

**Which write makes it.** One: `container.inert = !active` in `setActiveView` (`packages/explorer/src/client/dom.ts`), on `#view-map`. It was named by asking, after every write of the press, what the costly read asks, so that the layout a write makes necessary is paid at that write: `inert = true on div#view-map` cost 194.1 ms; every other write of the press cost 2.4 to 23 ms, most about 10 ms, which is this page's price for any layout while the held map is drawn and is paid once in an ordinary press (`numbers/press-3d--each-write-asked.json`; that press took 1,177 ms because it was asked 80 times). It is not the hold's class, the cover, the hand's spot, the arrival or the bands: on a 2D map at rest, five times each, the next read after the write cost

| Write to `#view-map` | Next read, ms (first, then four more) |
| --- | --- |
| nothing | 0, 0, 0.1, 0, 0 |
| `inert = true` | 263.7, 85.0, 75.3, 78.3, 82.2 |
| `aria-hidden` | 0 five times |
| `active` off and `perspective-held` on | 0.4, 0.3, 0.4, 0.4, 0.5 |
| `visibility: hidden` | 194.6, 83.7, 76.1, 84.1, 86.5 |
| the body's `zoom-controls-active` off | 3.4, 3.1, 3.1, 3.2, 3.3 |

(`numbers/press-3d--what-each-write-costs--arrival-default.json`; the same with the arrival seeded at reading size beside it: 187.0 first for `inert`. The look is `reading` in both and the element count the same, so the arrival's default is not in it.) Making a subtree inert makes the browser work out the style of every element in it again; the first time after a render is the dearest, and a press is always a first time. With Wire Answers off the map has 233 fewer elements and the read costs the same.

**Whether it is today's.** The write is not: the line came in `708f0cfa3` (October 20), an ancestor of `76cd9914c`, and neither `dom.ts` nor `perspectiveTransition.ts` differs between `76cd9914c` and the tip; of `changePerspective`'s reads and writes only the two `placeReturnedSubject` lines differ, which are on the way to 2D. The press of `76cd9914c` itself was **not** measured: no second checkout was built in the time. So what was found is that this layout is older than yesterday by the code that makes it, and what makes today's press 70 to 110 ms longer than the 390 ms recorded yesterday is not separated here. One part of the press is not layout at all: timed as the case times it, five presses alone (load 0.7 before, 2.8 after) took

| | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| the handler, ms | 332.7 | 318.7 | 296.1 | 296.7 | 311.7 |
| with the microtasks it queued (the case's `returned`), ms | 485.1 | 473.4 | 451.8 | 451.1 | 467.5 |

About 155 ms of each press is after the handler returns, in the continuation that places the subject and captures the 3D scene; the reads of a box in it cost 9.8 and 9.5 ms (`numbers/press-3d--reads-through-the-microtasks.json`), so the rest is not a forced layout and was not attributed. If today's addition is anywhere other than load, that continuation is the unmeasured place to look. The first frame was not measured by this probe.

**The mend, measured but not built.** Moving the read before the write would not mend it: the destination's box is not the same before the switch (leaving 2D takes away the strip its zoom controls kept), and the styles would be worked out at the next frame instead, in the first frame's time. What does take the cost away is that a view not being drawn costs nothing to make inert. The first write to a fresh 2D map, twice each:

| First write | Next read, ms | Taken back, ms |
| --- | --- | --- |
| `inert` alone | 178.0, 187.8 | 154.8, 90.7 |
| `content-visibility: hidden`, then `inert` | 2.9 + 0.1, 3.2 + 0.2 | 0.1 + 2.6, 0 + 2.6 |
| `display: none`, then `inert` | 13.9 + 0.1, 15.3 + 0.1 | 0 + 184.6, 0 + 149.6 |

(`numbers/press-3d--first-inert-on-a-fresh-map.jsonl`.) A held view has to be drawn, so the shape of the mend is: while held, the source is kept from a reader by what already keeps it (the cover takes the pointer, `aria-hidden` hides it from assistive technology) and is made inert only when the hold lets go, at the moment it is also taken out of drawing. What that leaves to decide, and why it was not built in the time: a held view could take the keyboard's focus for the length of the hold unless something else prevents it; "an inactive view is laid out and drawn, only transparent" is a stated property of the hold (`perspectiveTransition.ts`) that other code may lean on, the 3D picture's canvas among it; and `setActiveView` serves every view, not these two.

## Fifteenth milestone, from 22:45 UTC: a view put away is taken out of drawing before it is made inert

The root's ruling on the fourteenth: build it. "A view that is put away is taken out of drawing before it is made inert, and a held view is not made inert until its hold lets go." One way for every view, in one place.

**The product change is built and not committed.** The ruling said to stop with the wall and commit no product code if the work proved larger than fifty minutes, and it did: the press is mended and measured, the new cases are green and were seen red, and five named files pass whole; but `force-graph-focus.spec.ts` is not green whole, its first case failed three runs of four with the change and one of four without, the way back by the sidebar is dearer, and the design audit and twenty-six files were not run. The change stands uncommitted in this builder's worktree (`worktree-agent-ad47c0821418d756a`) in `packages/explorer/src/client/dom.ts`, `index.ts`, `panels/spatial-legend.ts`, `views/perspectiveTransition.ts`, `styles/shell.css`, `styles/local.css`, `tests/e2e/force-graph-focus.spec.ts`, the design system's `interaction-and-accessibility.mdmd.md` and the mirror of `dom.ts`. This record and its measures are committed alone.

**What was built.**

- The stylesheet says when a view is drawn (`shell.css`): a view not shown is `content-visibility: hidden`, and stays drawn through its 0.4 s fade because the discrete transition holds `visible` to its end; a view shown is drawn at once (only its opacity takes time: the first build let the discrete transition run on the way in too, and the view shown read `hidden` while the press that showed it was still rendering in it, seen in the probe's first reading and mended before any number below); a held view is drawn (`local.css`).
- `settleViews` in `dom.ts` is the one place a view is made inert: hidden from assistive technology at once, inert only when its own style says it is no longer drawn. It runs at every switch (`setActiveView`), at the end of a view's fade, when a hold lets go (`holdPerspective`'s release) and when the modal reader opens or closes, which makes every view inert as before (`index.ts`, where the same line had made the views inert a second way).
- The keyboard (`dom.ts`, `index.ts`): focus offered to a view not shown is given back to where it came from; focus that stood in a view leaving goes to the sidebar's control of the view shown; and the control that began a change of perspective, which is disabled through the change and so cannot hold the focus, lends it to the sidebar's control and takes it back when the change is done unless the reader has moved it. Three more lines were written and taken out again because no case held them (a fallback when nothing could take the focus, a second place to give an offered focus, and a return of focus to a control the switch had moved). Before this the focus was lost to the page at every press of 2D or 3D, during the hold and after it (`body` in all ten presses of the measure before).
- The 2D key's row of kinds (`panels/spatial-legend.ts`) read the map's cells by whether they are drawn, which a map put away no longer is: it now stands as it was while the map is not shown and reads again when the map is shown.

**The times, before and after**, the same probe on both builds, each group in a hold of its own with nothing beside it.

Five presses each way as the case times them, on `packages/engine/src/live-docs/graph.ts` opened in 3D (load 0.24 before the five before and 2.92 after them; 2.09 and 2.41 around the five after), in milliseconds:

| | Before | After |
| --- | --- | --- |
| Press of 3D, the handler | 346.4, 327.0, 354.8, 340.5, 333.1 | 167.8, 165.4, 196.0, 177.5, 177.5 |
| Press of 3D, with its microtasks (the case's `returned`, against 500) | 505.4, 483.2, 524.2, 495.7, 487.6 | 309.8, 301.4, 339.4, 319.9, 316.0 |
| Press of 3D, the transition's first frame (against 400) | 390.9, 384.3, 397.3, 387.9, 437.7 | 405.9, 388.5, 359.1, 375.0, 375.5 |
| Press of 2D, the handler (the 2D map's render is in it) | 2226.2, 1778.9, 1938.0, 1949.3, 1979.8 | 1952.8, 1895.5, 1858.9, 1853.7, 1770.7 |
| Press of 2D, with its microtasks | 2601.1, 2089.1, 2267.7, 2264.5, 2284.6 | 2214.7, 2181.5, 2131.4, 2145.2, 2045.6 |
| Press of 2D, the transition's first frame | 403.0, 390.3, 382.2, 376.0, 353.0 | 348.7, 379.2, 354.5, 357.9, 354.3 |

The press of 3D is about 180 ms shorter, which is the layout the fourteenth milestone named. The first frame is not what this mends: one of five is still over 400 in this probe, as one of five was before.

A sidebar switch from the 2D map (14,534 elements) to Knowledge Sources and back, three times, from the press to the first frame after it, in milliseconds:

| | Before | After |
| --- | --- | --- |
| Away, the handler | 147.7, 145.5, 169.7 | 162.4, 125.8, 167.9 |
| Away, to the frame after | 482.5, 523.5, 534.9 | 267.0, 207.8, 291.7 |
| Back, the handler | 10.1, 9.4, 14.7 | 174.1, 182.9, 204.1 |
| Back, to the frame after | 169.2, 171.7, 213.5 | 323.3, 350.3, 375.6 |

**The way back is dearer, and this is the change's cost**: about 230 ms less on the way out and about 155 ms more on the way back to a map that was kept and not drawn, where before it was kept drawn and only made opaque again. The round trip is some 90 ms shorter. What the 155 ms is (the map painted again, or the styles and layout the browser put off while the map was not drawn, now asked for inside the handler) was not separated in the time. The readings are in `numbers/put-away--before--*.jsonl` and `numbers/put-away--after--*.jsonl`.

**What leans on a view not shown being laid out, and what became of each** (by search of the client and the cases):

| What | Where | What became of it |
| --- | --- | --- |
| The destination's own box, read before the switch while it is put away | `index.ts`, `changePerspective`'s first read | Stands: a view's own box is laid out whether or not its contents are drawn (absolute, the room's size). The transition still draws inside it; the press case passes. |
| The 2D key's kinds, read from the map's cells by `checkVisibility` | `panels/spatial-legend.ts` | Mended there: a map put away would have counted no cell, and a palette chosen in 3D would have emptied the row with nothing to fill it on the way back. It keeps its row while the map is not shown and reads again when the map's view changes. |
| The 3D canvas's size, kept by a `ResizeObserver` on its container | `views/forceGraphView.ts` | A size is not observed while the view is not drawn and is reported when it is drawn again if it differs; the first frame of 3D after a press is drawn at the room's size (the press case, and the search case that resizes its container). A window resized while 3D is put away was not tried by a case. |
| The 2D map's layer, its cards' boxes and rooms, the World Map's room, each by a `ResizeObserver` | `localView/controller.ts`, `localView/card-factory.ts`, `worldMap/controller.ts` | The same: nothing to answer while not drawn, the present size when drawn again. |
| The hidden 2D map's paused search | `localView/controller.ts`, `show()` | Does not read a box while paused; `local-map-hidden.spec.ts` in the runs below. |
| Reads of a box inside a view not shown (`getClientRects().length` as "is it on the page") | `index.ts` (the modal reader's Tab order, the return of focus), `localView/controller.ts` | The two in `index.ts` ask `closest("[hidden], [inert]")` first, and a view put away is inert; the map's own are asked only while the map is shown. A read inside a view not drawn still answers (the browser lays that subtree out to answer) and pays for it; none was found in a press. |
| Cases that ask whether a view is inert | `inspection.spec.ts` | Stands: the modal reader makes the map inert and its close leaves the 3D view inert; in the runs below. |
| Cases that ask Playwright whether something of a view not shown is visible | every spec | Changed in meaning and for the better: an element of a view put away now reads as hidden where it read as visible (opacity alone never hid it from that question). The runs below are the evidence that none leaned on the old answer. |

**The cases, each seen red.** In `force-graph-focus.spec.ts`:

- "a view leaving is not made inert while it is still drawn, and a view put away is not drawn and is inert": the 2D map while 3D is shown; the 3D picture as the press of 2D returns (held, covered, hidden from assistive technology, drawn, not inert) and once its hold lets go (not drawn, inert, its canvas not drawn); the 2D map as the sidebar's press returns (fading, drawn, not inert), its fade over, and shown again. Its red is the build before, recorded by the probe in the same words the case reads: `view-map: perspective-held, inert true, drawn visible` while held and `view-map: -, inert true, drawn visible` once put away (`numbers/put-away--before--presses.jsonl`).
- "the keyboard's focus is never left in a view being put away nor lost to the page by a switch, and focus offered to a held view is given back": Enter on 3D and on 2D, focus lent to the sidebar's control and back on the control that began the change; then Enter on 3D and two real Tabs from the last control before the held map. Red two ways: on the first build of this round, where the lending was missing, "focus, as the change begins … Received: the page"; and with the giving-back taken away by a made fault (the page's listener kept from hearing), "where focus stood after each offer" received `a view not shown` twice. Three of three without a fault.

**The eye.** Nine screenshots through each transition, both ways, on this repository's picture (`graph.ts`) and the estate's (`PaymentService.cs`), before and after, then the picture at rest; one run each, and a screenshot takes 100 to 250 ms, so these are stills at times from the press and not a recording. Ten were opened, four pairs kept here as `put-away--before--…` and `put-away--after--…`:

- Held, on the way to 2D (estate at 450 and 486 ms, repository at 3,323 and 3,459 ms): the 3D picture stands drawn and still under the 2D controls, the same picture to the eye in both builds. This is the frame the change could have blanked, a held view no longer inert and a view not shown no longer drawn, and it did not.
- Folding, on the way to 3D (estate at 534 and 541 ms, repository at 458 and 653 ms): the 2D cards and their wires drawn over the 3D spheres, the subject's card in the same place, the same in both.
- Mid-motion on the way to 2D on the estate (1,352 ms before, 1,372 ms after): the named sphere at the same place with its wires gathering, the transition's own layer in both. **Not the same instant of the motion**: the after still is earlier in it (more of the graph's wires still drawn, two more spheres) by something like a tenth of a second. One run each cannot say whether the motion begins later after the change or the screenshots fell differently; the press of 2D itself returns no later (the table above). It is owed a recording.
- At rest after each way, on the repository, after the change: the 2D map drawn with its subject's card where the sphere stood and nothing of the 3D picture behind it; the 3D picture drawn with its subject named and nothing of the map over it. The estate's and the stills of before were not opened.

The sidebar's fade was not looked at by eye; its states are held by the first case (drawn through the fade, put away at its end).

**Runs.** Each in a hold of its own, the lane this builder's alone, nothing heavy beside any.

- `force-graph-focus.spec.ts` whole: 15 passed, 2 failed, 3.3 minutes, load 2.57 at its start. On the build before the three unheld focus lines were taken out.
  - "a focused URL centers its node, direct clicks pin it, and More opens its details" failed in 8.4 s by the words the 3D client's builder gave it this evening: "the actions offered should be those of packages/engine/src/live-docs/graph.ts; they are: "Actions for the shell of packages/explorer" (shell:packages/explorer). A press at the pointer's place (777.2, 357.8) would take hold of: shell:packages/explorer. The map does not say it is building; aria-busy is true; its motion has run 390 substeps". This is the landing's failure, which that builder could not reproduce (`Probes/landing2-3d`, its second and fourth sections), caught here whole in a file's run; it changes no view. Alone on the final build it then failed 2 of 3 (once the same words in 6.6 s, once "locator.click: Test timeout of 30000ms exceeded"), and alone with every view forced drawn as before the change (a made condition in the page, added for the run and removed) it failed 1 of 4, the same words. So the case fails without the change too, here for the first time alone; three of four against one of four, four runs each, does not say whether a page that no longer draws the views behind the 3D picture lets that picture slide under a still pointer more often. **This is the wall the round stopped at.**
  - "the 2D and 3D presses return at once" failed on the transition's first frame, 406 ms on the way to 2D against 400 (and 522 ms on the way to 3D, which the case had not reached), the bound the landing failed at 417. Its presses: 3D 280.6 ms against 500, 2D 361.8 ms less its render. Alone five times on the final build (load 2.25 before, 2.52 after): **3 passed, 2 failed, both on the 2D transition's first frame** (402 and 414 ms). The press of 3D: 281.6, 276.9, 351.4, 260.0, 269.4 ms. The press of 2D less its render: 373.9, 339.4, 340.6, 314.7, 337.7 ms. The first frame on the way to 3D: 346, 372, 418, 348, 342 ms; on the way to 2D: 366, 380, 402, 414, 350 ms. So the press the case holds is some 200 ms inside its bound where it stood on it, and the case is not green: the first frame's bound fails about as often as before (the probe's five before: 353 to 403 on the way to 2D, 384 to 438 on the way to 3D), and nothing here was aimed at it.
- `local-map-hidden.spec.ts`, `labels-and-controls.spec.ts`, `inspection.spec.ts`, `perspective-zoom.spec.ts`, `spatial-legend.spec.ts` whole in one hold: 35 passed, 3.9 minutes, on the same build.
- The two new cases on the final build: 2 passed (30.7 s). The first had by then one more thing to hold, that focus standing in the 2D map when the sidebar leaves it goes to the sidebar's control of the view shown; with that control made to take no focus (a made fault in the page, added for the run and removed) it failed: "the 2D map, as the sidebar's press returns … focusNow: a view not shown".
- The client's unit cases (`vitest run --project unit packages/explorer`): 105 files, 1,342 cases passed. Lint over the five changed source and case files: clean, after one unnecessary assertion it found in `dom.ts` was taken out (a change of type only, made after the browser runs above). The Explorer's type-check: clean. Lint over the whole repository and `live-docs:generate` were not run: the generated mirrors are owed with the product's commit.
- **Not run:** the design audit (`design-audit.spec.ts`), and of the specs that press 2D, 3D or a sidebar item every one not named above: `bare-frame`, `backward-cue`, `camera-intent`, `card-reading`, `explorer-history`, `explorer-navigation`, `force-graph-directories`, `force-graph-exploration`, `force-graph-identity`, `force-graph-shells`, `history-2d`, `history-panel`, `history-scrubber`, `local-map-branches`, `local-map-framing`, `local-map-keyboard`, `local-map-learning`, `local-map-mirror`, `local-map-packing`, `no-network`, `overview-files`, `return-cost`, `returning-connections`, `way-down`, `webgl-refused`, `world-map`. The fifty minutes went to the build, the measures and the cases; the gate is where these are owed.

**Owed.** What the 155 ms after the handler of the press of 3D is (it is still there: 136 to 143 ms between the handler and `returned` in the five presses after); what makes today's press longer than yesterday's; what the way back by the sidebar now pays for; a recording of the motion; a window resized while 3D is put away; the legend's mend seen red (it rests on the browser's rule that an element of a view not drawn fails `checkVisibility`, and no case was made to fail without it).

## Sixteenth milestone, from 23:30 UTC: the mend committed unfinished, and what it was owed

The root's ruling: finish it. The product change of the fifteenth milestone was committed first, as it stood and said to be unfinished (`9e4be0929`), so that nothing lived uncommitted in a worktree.

**The first focus case** ("a focused URL centers its node, direct clicks pin it, and More opens its details"). The root's reading to be confirmed by one measure before anything was changed: the sphere pressed has drifted from under the still pointer. **It has not.** For the run only, the case said where graph.ts's sphere stood from the pointer and what a press there would take hold of, at the moment any actions were first offered. Alone, eight times on each build:

| Build | Passed | Failed | The sphere's centre from the pointer, px (its radius 11.0 to 11.6) | What a press at the pointer would take |
| --- | --- | --- | --- | --- |
| With the mend (load 2.4) | 2 | 6: four by the shell's actions, two by More's click timing out | 0.1, 8.3, 0.1, 8.3, 8.3, 5.6, 0.1, 5.6 | the shell of `packages/explorer` three times (at 0.1, 8.3, 8.3), graph.ts five |
| The build before the mend (load 5.5 to 7.4, another builder's build beside it) | 6 | 2: one by the shell's actions, one by the name not centred | 0, 0.1, 0, 0, 0.1, 5.5, 8.7, 0 | the shell once (at 8.7), graph.ts seven |

In every reading the pointer is inside the sphere, by 2.4 px at the least, and the picture is at the same 384 to 433 substeps of its motion, busy in all but the three that passed. Where the shell's actions were offered the pointer stood 8.3 to 8.7 px from the centre of an 11 px sphere, three times of four; once the centre itself was under the pointer and a press there would still have taken the shell. So by the root's own rule this is the product's picking and not the case: a shell wins a point that is on the pressed sphere while the picture settles. **Nothing was changed for it**, the measuring lines are out of the case again, and the case stands as it was. It fails on both builds; with the mend it failed six of eight where it failed two of eight before, and since the two were run under different loads that difference is a reading and not a measure. The point the case presses is chosen clear of the sphere's name, and stood off-centre in three of eight runs with the mend and one of eight without.

**Does the motion begin later?** No. The stills could not say, so the estate's transition was put on the page's own clock, every frame from the press until the transition's layer is gone, both ways, five times on each build. The earlier build was made in this worktree by putting the six client files of `87f4fb51f` in place, building, measuring and putting this build's files back. In milliseconds from the press:

| On the estate (`PaymentService.cs`) | The build before | With the mend |
| --- | --- | --- |
| To 2D, the motion begins | 922.7, 1087.4, 990.3 | 785.4, 821.5, 807.6, 811.0, 803.2 |
| To 2D, the motion ends | 2354.9, 2519.5, 2411.7 | 2209.4, 2239.8, 2239.7, 2236.4, 2226.0 |
| To 2D, frames drawn, and the longest gap between two | 76, 80, 82; 30.3, 29.5, 21.3 | 83, 82, 82, 83, 81; 17.8, 17.6, 20.9, 17.7, 21.5 |
| To 3D, the motion begins | 676.9, 639.0, 597.5 | 696.6, 688.4, 658.9, 637.6, 760.1 |
| To 3D, the motion ends | 2102.7, 2070.3, 2018.7 | 2120.7, 2106.5, 2089.5, 2068.2, 2181.1 |
| To 3D, frames drawn, and the longest gap | 77, 79, 80; 26.7, 24.4, 21.4 | 79, 80, 81, 80, 80; 22.7, 19.9, 19.6, 21.1, 20.9 |

The motion is the same length on both builds, 1.42 to 1.43 s each way in every reading. On the way to 2D it begins 100 to 300 ms sooner with the mend and drops no more frames; on the way to 3D it begins within the same band, some 40 ms later at the middle reading. The stills of the fifteenth milestone that stood a tenth of a second apart were the screenshots' own timing. Only three readings stand for the build before: its fourth and fifth were taken while another builder's build ran beside the hold (load 3.5 rising to 7.4; to 2D beginning at 2,919.9 and 1,239.4 ms, 40 and 71 frames) and are set aside, kept in `numbers/put-away-2--estate-motion--before.jsonl`.

**A window resized while 3D is put away.** Held by a new case in `force-graph-focus.spec.ts`, "a window resized while the 3D picture is put away is the picture's size when it is shown again": on the estate at 1,280 by 720 the canvas fills its room (1,019 by 670); 2D pressed and the 3D picture put away; the window made 1,000 by 640; 3D pressed; the room is 739 by 590 and the canvas, and what it draws, are that size. Seen red by a made fault in the page, no size ever reported (added for the run and removed): "canvasIsTheRoom: false, drawnAtTheRoom: false".

**The sidebar's way back: what the 155 ms is.** One read, and it is this change's own. Recorded on the committed mend with every read of a box or a style in the handler timed: the handler took 193.7 ms, and 181.9 of it is `settleViews` asking a view for its own `content-visibility`, which has the browser work out the returning map's styles there and then; after the handler 83.4 ms of layout was still owed, and the frame after came at 357.8 ms. The same probe on the build before: a handler of 19.9 and 23.7 ms with no read in it, and 225.7 and 339.6 ms owed after it (those two readings beside another builder's builds, load 3.5 to 7.4, so they say where the work falls and not how long it is). So the map's styles and layout come due on the way back on both builds; the mend moved them into the handler and, by the fifteenth milestone's clean readings, made the whole about 155 ms longer.

It was avoidable, and it is mended at its cause: the way back was the way out run backwards in the wrong order. The view was shown, and so drawn, while it was still inert, and then made not inert, so the browser worked out the map's styles as an inert map and then again as one that is not. `setActiveView` now makes the view not inert before it gives it the class that draws it, one line. The same probe on the final build, three times alone (load 1.8 to 2.0): the handler 41.6, 42.4, 39.8 ms (the same read in it now 26.5, 26.8, 25.4 ms); layout owed after it 22.4, 24.1, 24.2 ms; **the frame after at 136.8, 158.9, 146.7 ms**, where the committed mend's was 357.8 and the build before's, by the fifteenth milestone's clean readings, 169 to 214. So the way back is now no dearer than it was before any of this, and the way out keeps its 230 ms. (`numbers/put-away-2--sidebar-back--*.jsonl`.)

**The key's mend, seen red.** It is one line now where it was two. The line that kept the row from being drawn while the map was away was not needed and is out: the row may be drawn empty while nobody can see it, and one observer reads it again whenever the map's view is shown or put away. A new case in `spatial-legend.spec.ts` holds it, "the 2D key's kinds are read again when the map is shown again, after a palette chosen while it was put away": the closed `scripts` directory's map with its two kinds in the key, the sidebar to Knowledge Sources, the palette changed in Tuning, the sidebar back. On a build with the observer taken out (a made fault, built, run and put back) it failed: "the kinds the key shows, the map shown again … Expected: 2, Received: 0". On the final build it passes.

**Runs on the final build.** The four cases this change adds, in one hold: 4 passed (the two of the fifteenth milestone, the resize case, the key's case). The client's unit cases: 105 files, 1,342 passed. Lint over the whole repository: clean. The type-check of every package (`npm run build`): clean. `live-docs:generate`: run, three mirrors regenerated and committed with the code. **Not run on the final build:** the design audit, `force-graph-focus.spec.ts` whole and every other file named as not run in the fifteenth milestone; the final build differs from the one the fifteenth milestone's whole-file runs were made on by the one line of the way back and the key's one observer.

**The first frame, as read in this work and not aimed at**, in milliseconds after the transition's start. On the committed mend, the press case alone five times: to 3D 346, 372, 418, 348, 342; to 2D 366, 380, 402, 414, 350. In the whole file's run the same day: 522 to 3D and 406 to 2D. The probe's five on the mend's first build: to 3D 405.9, 388.5, 359.1, 375.0, 375.5; to 2D 348.7, 379.2, 354.5, 357.9, 354.3. None was read on the final build.

**The other builder's facts, noted.** The hold of 23:47 UTC ran beside three builds of the other builder's: the estate's fourth and fifth readings of the build before, both of its sidebar readings and all eight of its runs of the first focus case shared the machine with them, and are marked so above. Of that build's two failures of the first case, the one by the shell's actions is not a time limit and stands; the one by the name not centred in five seconds is a time limit and is set aside, which leaves one failure in seven. Of what makes today's press of 3D longer than yesterday's, in the five merges named (four of them this builder's): nothing known to this builder runs at the press that did not before. The arrival is cancelled by a return and not begun; Wire Answers' hand is hidden by one attribute; the names' wider buttons add no element. None of these was measured at the press, and none was looked for.

**The lane.** From 23:51 to 00:02 UTC no build could be started: the other builder's holds stood three deep without a gap, and the round's rule was to start no build while it held. The measures above are what fitted round that, and the wider runs did not.

## Not done

- The sweep: eight holds of twenty-five ran.
- The pause at rest traced to its parts (above).
- The estate's remaining stills (`1-lands`, `3-released`, the wire's `1`, `2` and `4`) were not opened one by one.
- Fifth milestone, on the build with the names' mend, each in a hold with nothing of this builder's beside it: the names' case passed; the search bar's two passed alone; the rule's four cases passed; `camera-intent.spec.ts` passed whole in three parts (8, 5 and 13 cases). Not run on that build: the still picture's three red cases, `history-2d.spec.ts` and the still picture's estate cases, the lane being taken until the milestone's time ran out.
- The look's own pass at three times November 21's was not attributed: the day's start was not built beside the tip and nothing was measured.
