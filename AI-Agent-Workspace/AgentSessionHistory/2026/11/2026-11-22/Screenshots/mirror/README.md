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
