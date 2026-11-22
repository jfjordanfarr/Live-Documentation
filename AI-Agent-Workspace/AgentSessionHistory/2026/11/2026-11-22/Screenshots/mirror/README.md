# The mirrored 2D Local Map: matched pairs at rest

Historical record, 2026-11-22. The first milestone of the mirror: the same subject as laid out (what offers on the left)
and mirrored (what uses on the left), at 1,280 by 800, the suite's stilled search (`searchStarts: 0`) and nothing else
remembered. Each mirrored picture was taken by pressing the toolbar's mirror button on the picture beside it, so the pair
also shows what the press holds still. The builder's eye, not the owner's.

Measured from the page on the last three pairs of the table (the run printed all five, and the first two pairs' numbers
were cut from what the builder read; their pictures were judged by eye): one upright axis fits every card (spread 0 px),
no card changed height, width or top (0 px), every wire's two ends are the reflections of its ends before (0 px off),
every use-dot stands in its card's right half and every offer-dot in its left, and the page reported no error. The
opened directory's mirrored picture was retaken after its line was mended, with the same numbers; the others were taken
before that mend, which changes nothing they show but a directory's line.

| Pair | Cards, wires | What the eye judges |
| --- | --- | --- |
| `pathfind-as-laid-out.png`, `pathfind-mirrored.png` | not read | The subject keeps its place to the pixel. The engine's pathfinder, which it uses, crosses from the left to the right; its users cross to the left. Every wire runs from a blue pin to a green one and none reaches back over a card. Every name reads; the card's own header (name, then controls) is as before, since a card faces the viewer. The key reads "Uses, green to blue, Offers". |
| `config-78-neighbours-as-laid-out.png`, `config-78-neighbours-mirrored.png` | not read | The subject holds; its many users fan out to the left from blue pins now on its left edge. Nothing is cut that was not cut before. Only the mirrored picture of this pair was looked at. |
| `branch-renderer-returning-as-laid-out.png`, `branch-renderer-returning-mirrored.png` | 28, 191 | The returning connections' stubs change sides with their pins and the foot still says "6 connections return in a cycle". The 3D button's cue stays lit. |
| `opened-directory-doc-tools-as-laid-out.png`, `opened-directory-doc-tools-mirrored.png` | 5, 4 | No card is focused, so the picture is reflected about the middle of the view and all of it stays on screen. The membrane is reflected; its line, "scripts/doc-tools" with its controls, stands at the membrane's first corner, now the top right, in its own reading order. The closed `__fixtures__` keeps its folder tab on its own left, as a card keeps its header. The fade that says more lies beyond an edge moved to the left edge with the content. |
| `estate-payment-hub-as-laid-out.png`, `estate-payment-hub-mirrored.png` | 8, 17 | The estate sample: the same, at a larger reading size. The wire that goes round the subject's card goes round it on the mirrored side. |

Not yet right, seen in these pictures:

- A row's two small type badges, a blue arrow pointing right for what a function returns and a green arrow pointing left
  for what it takes, still point as they did. They borrow the map's rule, so in a mirrored picture they point against it.
- The mirror counts as a changed Tuning setting (the summary's badge goes from 1 to 2), because that is where the choice
  is kept.

The pairs and their numbers come from [`stills.mjs`](stills.mjs), kept here; its head says how to run it. It was last
run whole before the directory line's mend, and for the opened directory alone after it; a third whole run was given up
while the browser was held by another job.

## The second round: away from reading size, the wire's answer, the type badges

Taken by [`looks.mjs`](looks.mjs) on the pathfinder, once as laid out and once after the button's press, with Wire
Answers on. The page reported no error in either run. The builder looked at the mirrored picture of each pair and at
both badge close-ups; the as-laid-out far looks and Fit were taken and not looked at.

| Pictures | What the eye judges of the mirrored one |
| --- | --- |
| `look-connections-as-laid-out.png`, `look-connections-mirrored.png` (three presses of Zoom Out) | A true mirror at the connections look: blue pins on each card's left, green on its right, every wire from blue to green. Each directory's line, held at its size, stands at its membrane's top right corner in its own reading order; no name is reversed or newly cut. |
| `look-overview-as-laid-out.png`, `look-overview-mirrored.png` (seven presses) | The overview's compact files: users to the left of the subject, what it uses to the right, the pair lines between them. Directory lines at the top right of their membranes. Nothing cut at an edge. |
| `fit-whole-as-laid-out.png`, `fit-whole-mirrored.png` | Fit frames the whole mirrored picture inside the view with its margins, nothing cut and no edge fade: the users at the left, what the subject uses at the right, every directory line at its top right corner. |
| `wire-answer-as-laid-out.png`, `wire-answer-mirrored.png` | A pointer resting on a wire of `Reach`: the wire lights from the blue pin, now on the subject's left, and the panel stands under the pointer inside the view, upright, saying "pathfind.ts is used by index.ts, search-bar.ts · Reach · 2 references", the same words as laid out (panel at x 273 mirrored, 967 as laid out, the same height). |
| `type-badges-as-laid-out.png`, `type-badges-mirrored.png` | One row's badge close up: the blue arrow points right as laid out and left mirrored. In the full mirrored pictures a row with both shows the green arrow first, pointing right, then the blue pointing left. |

Not looked at mirrored: the cut's signs at the edges (Tuning's Cut Counted), which need a step to show.

## The third round: the motion (Tuning's Mirror Turn)

Taken by [`turn-strips.mjs`](turn-strips.mjs). For a strip the page's clock is taken by hand, the mirror button pressed
and the motion stepped to 10, 25, 40, 50 (edge-on), 60, 75 and 90 % of its 620 ms, a picture at each, left to right and
then the second row. Thirteen strips were taken: Turn and Slide on six pictures, Cut once. The builder looked at five,
named below; the other eight were taken and not looked at. The first strip of the turn, before the fade was added,
showed the fault the fade answers and was replaced by the one kept here.

| Strip | What the eye judges |
| --- | --- |
| `strip-turn-estate-hub-focused.png` | The hub's card never moves and never dims. Its neighbours swing: the right-hand ones recede and shrink a little, the left-hand ones come toward the viewer and pass in front of it as faint ghosts. Edge-on, the hub stands alone at full strength with its pins already exchanged, a faint pile on its line. By 75 % the mirrored picture is recognisable and its wires are back. **A person keeps their place.** For about the middle third nothing but the held card can be read. |
| `strip-turn-config-heavy-focused.png` | The heavy subject fills most of the view and holds through every frame; its 78 neighbours are ghosts crossing its right half and then gone to the other side. Place kept. Frame by frame it is right; at speed it is not smooth (the cost below). |
| `strip-turn-doc-tools-none-focused.png` | Nothing holds, so the axis is the middle of the view. The directory's membrane is seen as a tilted sheet at 25 % and 75 %, which says plainly that the picture is turning; from 40 % to 60 % the whole picture is faint ghosts on one line and at edge-on there is almost nothing on screen. **Nobody keeps a place, because there is none to keep**: it reads as a fade with a hint of travel. Not trash, and not better than the cut here. |
| `strip-slide-pathfind-focused.png` | Flat: the cards keep their size, slide to the axis, pass through one another as a faint pile over the subject and come out on the other side. The subject holds. It explains less than the turn (cards passing through cards is no real movement) and is as unreadable in the middle. |
| `strip-turn-pathfind-focused.png` (first take, before the fade; replaced) | At edge-on the engine's `pathfind.ts`, swinging nearest the viewer and grown by its nearness, covered the subject whole. This is why everything but the held card is now faded as the plane stands edge-on. |

The wires in every form read only in the first and last quarter: the cards face the viewer while the wires' plane
turns, so a wire leaves its pin as soon as the motion starts and meets it again as it ends. Redrawing the wires at each
frame would hold them to their pins and is the cost the arrival's record found too high; it was not tried.

### Cost, on the heavy subject

`liveDocumentationConfig.ts`, 84 cards and 218 wires, 1,280 by 800, headless Chromium with the page composited on the
processor, the lane held alone; frames the page drew from the press until the picture rested, the time that took, and
the longest gap between two frames. The numbers as printed are in [`turn-cost.txt`](turn-cost.txt).

| Form | Speed | To mirrored: frames, ms, longest | Back: frames, ms, longest |
| --- | --- | --- | --- |
| Turn | full | 5, 1,217, 500 | 6, 1,467, 500 |
| Slide | full | 6, 1,500, 450 | 6, 1,317, 467 |
| Cut | full | 25, 1,017, 350 | 27, 733, 183 |
| Turn | slowed 4× | 4, 5,950, 3,200 | 5, 5,300, 2,500 |
| Slide | slowed 4× | 4, 3,183, 2,417 | 5, 4,950, 2,567 |
| Cut | slowed 4× | 22, 3,300, 2,183 | 21, 2,883, 1,867 |

**The turn and the slide stutter on this picture, at full speed as well as slowed**: a 620 ms motion drew five or six
frames, none of them close to a sixtieth of a second, so what a person would see here is three or four jumps, not a
turn. The cut's own long frame (183 to 350 ms at full speed) is the picture coming to rest: the pins restyled, the
picture measured and 218 wires drawn again, which every form pays once. Where the rest of the turn's time goes was not
taken apart: the suspects are each card becoming a layer of its own in the third dimension and being drawn again at
every frame as its nearness changes its size. Not measured: a light picture, and a browser compositing on a card.

## The fourth round: the cut's signs, and where the turn's time goes

### The cut's signs at the edges, mirrored

Taken by [`cut-signs.mjs`](cut-signs.mjs) on the product as merged that morning (reduced motion, so the change is the
cut): from the engine's `pathfind.ts`, `live-docs/history` is opened, a directory too large for the view, with Tuning's
Cut Counted on, and what the signs say is read beside the directory's cards that really lie past each edge.

| State | The cards past each edge | What the signs say | Judgment |
| --- | --- | --- | --- |
| as laid out (`cut-signs-as-laid-out.png`) | right 26, top 1, bottom 4 | right 26, top 1, bottom 4 | Right. |
| mirrored, then opened (`cut-signs-mirrored-then-opened.png`) | left 26, top 1, bottom 4 | left 26, top 1, bottom 4 | Right: the sign stands at the left edge, its arrow and its words ("past the view's left edge") the mirrored reader's. A step taken under a mirrored picture is counted truly. |
| **opened, then mirrored** (`cut-signs-opened-then-mirrored.png`) | left 21, top 6, bottom 4 | **right 32** | **Wrong.** The signs keep the places measured before the press: one sign at the right edge counting 32, while the directory now goes on to the left. The mirror's rest does not measure the step's cards again. |
| that state put back | right 26, top 1, bottom 4 | right 26, top 1, bottom 4 | Right again, by the old measurement. |

The builder looked at the two mirrored pictures. Mirrored and then opened: the sign with 26 stands at the left edge
with its arrow pointing left, 1 above and 4 below, and the directory's own line at its top right corner; it reads
rightly, the left sign lying over the edge of the first card as the right one does as laid out. Opened and then
mirrored: the directory now starts at the right edge of the view, its line at its top right corner, and goes on to the
left and down, while one sign at the right edge says 32 lie further right, where nothing of it lies. The as-laid-out
picture was not looked at. The fault is the mirror's and is not mended in the commit this record goes with.

### Where the first turn's time went

The same cost run as the third round's, with the browser's own counters of its main thread read before and after each
motion ([`turn-cost-first-form.txt`](turn-cost-first-form.txt)); the heavy subject, 84 cards and 218 wires, headless,
composited on the processor, the lane held alone on a machine quieter than the third round's (which is why the frames
are a little better than that table's).

| Form, full speed, to mirrored | Frames, ms, longest | Main thread: style, layout, script, all | Style recalculations |
| --- | --- | --- | --- |
| Turn | 7, 900, 217 | **720**, 11, 38, 931 ms | 18 |
| Slide | 7, 1,000, 250 | **813**, 13, 39, 1,076 ms | 17 |
| Cut | 30, 667, 133 | 99, 8, 35, 244 ms | 35 |

**Three quarters of the turn is the page restyling itself**: 720 of 931 ms in 18 recalculations, about 40 ms each on
average. The first form writes one angle as a custom property on the map's layer each frame; a custom property is
inherited, so every element under the layer, every row of all 84 cards, is styled again at each frame so that the
cards can turn back from it. Layout and script are nothing beside it. The cut's 99 ms of style in the same counters is
what the picture's rest costs every form once (the pins restyled as the reading changes). Slowed four times the same
share holds (2,052 of 2,787 ms).

## The fifth round: the turn mended, the cut holding the held card, the default decided

### What the turn costs now

The turn's first form wrote an angle on the map's layer each frame. It is now written once: an animation on the
content root, on the wires' layer and on every card and directory line, which the browser runs between frames by
itself, with what the turn needs of the boxes (the third dimension kept, the resting reflection set aside) written on
those boxes. Two steps got there, and the second is the one that counted:

| Form of the turn, heavy subject, to mirrored, on the processor | Frames the page drew, ms, longest | Main thread: style, all (ms) | Machine's load |
| --- | --- | --- | --- |
| an angle written each frame (fourth round) | 7, 900, 217 | 720, 931 | quiet |
| animations, started under an attribute of the layer that the stylesheet's rules hung on | 6 to 8, 1,333 to 1,900, 483 to 683 | 961 to 1,519, 1,547 to 2,519 | 5 to 10 |
| **animations, with the turn's needs written on the boxes and no rule in the stylesheet** | **13, 817, 250** | **143, 413** | 3 to 7 |

The middle row is [`turn-cost-animated-under-a-rule.txt`](turn-cost-animated-under-a-rule.txt) and a run before it. The animations alone changed nothing: the attribute's coming, the pins' exchange and the attribute's going each
restyled every row of every card, as the angle had at every frame. With no rule hanging on the layer the page's own
work in the motion is the cut's (style 143 ms beside the cut's 156; all 413 beside 359).

The last form measured once on the processor and once composited on the graphics card, at full speed, with the
browser's own screencast counting the frames put on screen as well as the page's count of its own frames
([`turn-cost-animated-processor.txt`](turn-cost-animated-processor.txt),
[`turn-cost-animated-card.txt`](turn-cost-animated-card.txt)). 86 cards, 220 wires. One run each, with other builders'
work on the machine (its one-minute load 7 falling to 3 for the processor's run, 3 falling to 1.7 for the card's), and
the screencast costs frames itself.

| Form | Where composited | To mirrored: frames on screen, longest gap | Back: frames on screen, longest gap | Main thread, to mirrored: style, all |
| --- | --- | --- | --- | --- |
| Turn | processor | 11, 183 ms | 10, 221 ms | 143, 413 ms |
| Slide | processor | 9, 226 ms | 11, 160 ms | 170, 462 ms |
| Cut | processor | 20, 171 ms | 18, 137 ms | 156, 359 ms |
| Turn | card | **3, 784 ms** | 12, 413 ms | 168, 397 ms |
| Slide | card | 13, 166 ms | 16, 134 ms | 135, 366 ms |
| Cut | card | 20, 173 ms | 26, 155 ms | 132, 329 ms |

**What a person sees now.** On the processor: a turn of about a dozen frames in some eight tenths of a second, with one
hitch of about a fifth of a second; it can be followed, and it is not smooth. On the card, which is what the owner has:
the slide is that or a little better, and the turn with depth stalled once in each run, for three quarters of a second
the first time (three frames reached the screen) and four tenths the second. So on a heavy picture the turn is still a
few jumps where it matters, and **the lever's default is the cut**; the turn and the slide stay choices.

Left to try, in the order of likelihood: holding each card's drawing at one size while it turns (`will-change`), since
only the form with depth stalls on the card and depth is what changes a card's drawn size at every frame; leaving the
pins' exchange until rest, which is the one restyle left inside the motion. Not worth trying again: anything that
writes to the layer or hangs a rule on it while the picture moves. Not measured: a light picture, a second run of each
on a quiet machine, and the processor slowed four times in the last form.

### The strips, retaken on the last form

`turn-strips.mjs` now holds the animations and sets them by hand to each share of their length, with a picture at rest
last. Retaken and looked at: the turn and the cut on the estate's hub and on the heavy subject.

| Strip | What the eye judges |
| --- | --- |
| `strip-turn-estate-hub-focused.png` | Frame for frame what the first form drew: the hub never moves or dims, the neighbours cross it as faint ghosts, it stands alone edge-on with its pins exchanged, and the last frame is the mirrored picture at rest. |
| `strip-turn-config-heavy-focused.png` | The same on the heavy subject: its card holds through all eight frames. |
| `strip-cut-estate-hub-focused.png` | The hub stays at full strength in every frame. The others fade in two steps and are gone in the third, when the hub stands alone, its pins still as laid out; in the next its pins have changed sides and the others return faintly at their mirrored places. Looked at in its first take, where the directories' outlines stood through the fade and then jumped; they fade with the rest since, and the file kept is the retake after that mend, which was not looked at again. |
| `strip-cut-config-heavy-focused.png` | Taken after that mend: the subject alone in the third frame, outlines gone with the neighbours; its pins exchanged in the fourth; the mirrored picture by the sixth. The held card never leaves. |

### The cut's signs, mended

`cut-signs.mjs` again, on the mended product: opened and then mirrored, the signs say left 21, top 6, bottom 4, which is
where the cards lie, and put back they say right 25, top 2, bottom 4 again. The builder looked at
`cut-signs-as-laid-out.png` this time (the directory at the right of the view with its line at its top left, a sign
with 25 at the right edge, 2 above, 4 below: right) and at the retaken `cut-signs-opened-then-mirrored.png` (the sign
with 21 at the left edge, 6 above, 4 below, where the fourth round's picture had one sign at the right saying 32).
