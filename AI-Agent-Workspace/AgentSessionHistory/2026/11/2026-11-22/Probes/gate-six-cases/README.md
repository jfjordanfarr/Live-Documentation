# Six cases the day's gate failed, and which was wrong in each: the page or what read it

**Historical evidence, 2026-11-22.** Measured by a builder between 18:20 and 18:50 UTC in its own worktree at the day branch's tip, `2d2f18f2b`, headless Chromium through the browser lane at one worker, the machine shared with two other builders (one-minute load 2 to 9). The probe is [`gate-probe.spec.ts.txt`](gate-probe.spec.ts.txt), a Playwright spec that ran as `tests/e2e/zz-gate-probe.spec.ts` and was not kept there; what it wrote is in [`numbers/`](numbers/).

That day the 2D arrival came to rest at reading size and then ease back to the neighbours' frame, in another look on a large picture, and every wire gained a band: an undrawn stroke along its route that takes the pointer. Four of the six failures are a reading taken across that easing; one is a control the mirror added; one is an audit reading boxes that are not drawn. One finding is new and not yet mended.

## The deck's retained routes "changed" under a pan (`still-picture.spec.ts`, the estate, five files)

Fails alone. The keys printed as `undefined|undefined|undefined|undefined#0` are bundle runs, wires that carry no ends of their own; they are wires, not bands, and have been read so since they were made. No pan changes any route: with the six pans begun while the arrival rested, 0 of 77 changed, after the tour and without it ([after the tour](numbers/pans-tour.json), [without](numbers/pans-plain.json)). **The easing alone changes 65 of 77, with no pan at all** ([the numbers](numbers/arrival.json)): at the look it eases to, a wire's ends stand elsewhere on their cards (a run that began at `M 2741 311` begins at `M 2741 321.4`). After the easing two pans changed none. The deck waited nine tenths of a second and read, so its first reading fell in the rest and its later ones after the easing. The deck's subject is the picture at reading size, where facts are legible and the tour pans; it now holds its arrival there (`arriveAtReadingSize`) and waits for rest by the page's own word.

## The lanes case's wire "over the top" (`local-map-branches.spec.ts`)

Fails alone. The case read the wires and, some calls later, the cards' top. [The probe](numbers/lanes.json) read the camera at each moment: scale 1 at the reading's start with the arrival easing, scale 0.33 in the connections look afterwards. Within the one reading the highest wire stood at −2,171.7 and the highest card at −2,286.7: 115 px under it, nothing over the top. The case now holds its arrival at reading size, which its samples every eight pixels and its comparison of two moments both need, and waits for rest.

## A code span "outside its card" (`card-ladder-boxes.spec.ts`, two cases)

Both fail alone. The page is right and the audit reads what is not drawn. The two spans stand in the description of `tests/e2e/local-map-path.spec.ts`, late in a long paragraph. Each wraps (`overflow-wrap: anywhere`), is one box, and lies within the card's width; each lies in a line the two-line slot does not show: the slot's prose is 34 px tall, clips (`overflow: clip`, a line clamp of 2) and holds 238 px of text ([the numbers](numbers/code.json)). The spans' boxes are where their lines would be, 20 to 50 px under the card's foot, and nothing is painted there: the page's topmost element at each span's centre is the ground behind the map ([the numbers](numbers/code-drawn.json)), and [the picture](code-card.png) shows the card's two lines ending in an ellipsis over empty ground. The audit's `shown` asks an element's visibility, display and opacity, not whether an ancestor clips it away, so any element in a slot's unshown lines is read at a box nothing is drawn in; it was first met here because this card is short. The spec is another builder's that day and was left as it was.

## The layout lab's page case ran out its half minute (`layout-lab.spec.ts`, the repository's five files)

Passed alone once (31.8 s as the runner counts it) and ran out alone once, with its sibling the chain, which already runs alone (45.8 and 57.3 s). The capture reads half a second after the wires stand, which is now during the arrival's rest, the easing to another look still to come under it. The case now holds its arrival at reading size, as the same file's other cases were given that day; what that does to its time is in the handback of this work, not here.

## The toolbar's first group (`labels-and-controls.spec.ts`)

The case was behind the page: in 2D the first group holds the fit and, since the mirror's first merge, the mirror beside it. It now names both.

## Found and not mended: a card across a wire is no longer seen

The instrument counts a wire's sample as covered where the page's topmost element there belongs to a card that is not one of its ends. Since the bands, the topmost element along a wire is its own band: at 5,914 of 5,976 samples of the estate's 56 drawn routes ([the numbers](numbers/hit-test.json)). With a card that is neither end of a wire stood across that wire's middle, the topmost element is still the band; the first element that is not a band is that card. So `occludedSamples` cannot rise above zero where a band runs, and "no wire crosses a card it does not end at" cannot fail, in the lanes case, the deck, the scenario suite and the path's and mirror's specs. The reference reading shares it. The mend is to ask for the topmost element that is not a wire's band, in both readings alike, held by a case that stands a card across a wire and is seen failing first.
