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

## Not done

- The sweep: eight holds of twenty-five ran.
- The pause at rest traced to its parts (above).
- The estate's remaining stills (`1-lands`, `3-released`, the wire's `1`, `2` and `4`) were not opened one by one.
- Fifth milestone, on the build with the names' mend, each in a hold with nothing of this builder's beside it: the names' case passed; the search bar's two passed alone; the rule's four cases passed; `camera-intent.spec.ts` passed whole in three parts (8, 5 and 13 cases). Not run on that build: the still picture's three red cases, `history-2d.spec.ts` and the still picture's estate cases, the lane being taken until the milestone's time ran out.
- The look's own pass at three times November 21's was not attributed: the day's start was not built beside the tip and nothing was measured.
