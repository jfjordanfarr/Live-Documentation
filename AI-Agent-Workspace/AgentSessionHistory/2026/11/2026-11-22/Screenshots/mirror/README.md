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
