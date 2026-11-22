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

Not settled. Alone on one worker, the machine shared with two other builders, the five files passed three times in four (31.8, 32.9 and 39.5 s as the runner counts them; 45.8 s the time it ran out) and its sibling the chain, which already runs alone and had passed the gate's alone pass in 36.7 s, ran out three times in three (57.3, 50.4, 42.7 s). Each time it ran out no call to the page was pending: the time is the lab's own layout of the picture, in the test's process, and the picture grows with the repository. The five files now carries the alone tag, which it earned by the rule (red at two workers, green alone), and the case holds its arrival at reading size, as the same file's other cases were given that day, because the capture reads half a second after the wires stand, during the arrival's rest; holding it was not seen to change the time (one pass in two before, two in two after, the chain red throughout). The tag gives the case the machine and does not shorten its work. Its limit is the framework's default half minute; whether this work is given a stated budget, as the same file's cases of 60 and 180 s have, or the lab's layout is made quicker, is open.

## The toolbar's first group (`labels-and-controls.spec.ts`)

The case was behind the page: in 2D the first group holds the fit and, since the mirror's first merge, the mirror beside it. It now names both.

## Found: a card across a wire was no longer seen (mended that evening, below)

The instrument counts a wire's sample as covered where the page's topmost element there belongs to a card that is not one of its ends. Since the bands, the topmost element along a wire is its own band: at 5,914 of 5,976 samples of the estate's 56 drawn routes ([the numbers](numbers/hit-test.json)). With a card that is neither end of a wire stood across that wire's middle, the topmost element is still the band; the first element that is not a band is that card. So `occludedSamples` cannot rise above zero where a band runs, and "no wire crosses a card it does not end at" cannot fail, in the lanes case, the deck, the scenario suite and the path's and mirror's specs. The reference reading shares it. The mend is to ask for the topmost element that is not a wire's band, in both readings alike, held by a case that stands a card across a wire and is seen failing first.

## The reading's sight, mended (19:00 to 19:45 UTC)

**The rule.** At a point, the reading takes the page's topmost element that is not in the wires' own drawing, a part of a card excepted (`drawnAt`, in `readPicture` and in the reference alike). It names what it looks past by where it stands: no caller's selector, and nothing about how the page stacks wires over cards. A band is in the wires' drawing; so is a returning connection's lace, a wire that takes the pointer itself.

**The case, seen failing first.** `still-picture-reference.spec.ts` stands a card that is neither end of a route across that route, at reading size, and both readings must count covered samples on it. On the reading as it was, with a band running there: "the instrument sees `Portal/Controllers/PaymentsController.cs` across the wire: expected more than 0, received 0". A second case does the same across a returning connection's lace.

**The laces, measured before the rule was extended to them.** The same probe, rewritten to walk every wire of a picture and ask the page's whole stack at each sample in the frame ([the first three pictures](numbers/laces-first-three.json), [the other six](numbers/laces.json); the first run was cut by the lane's five minutes and the second asks the whole stack only within a card that is neither end or within a lace's box). At reading size, 1,600 by 1,000:

| Picture | Cards | Wires read | Samples in the frame | On a band | Laces | Samples on a lace | Crossings: topmost, past bands, past the whole drawing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Repository, five files, Local Map | 52 | 210 | 12,676 | 10,866 | 0 | 0 | 0, 0, 0 |
| Repository, five files, retained | 114 | 518 | 11,321 | 8,550 | 0 | 0 | 0, 0, 0 |
| Repository, chain, Local Map | 52 | 154 | 7,710 | 7,267 | 0 | 0 | 0, 0, 0 |
| Repository, chain, retained | 132 | 521 | 7,837 | 7,202 | 0 | 0 | 0, 0, 0 |
| Estate, five files, Local Map | 9 | 15 | 560 | 539 | 2 | 15 | 0, 0, 0 |
| Estate, five files, retained | 20 | 58 | 2,923 | 2,681 | 2 | 0 | 0, 0, 0 |
| Estate, chain, Local Map | 5 | 10 | 467 | 418 | 0 | 0 | 0, 0, 0 |
| Estate, chain, retained | 14 | 39 | 470 | 332 | 0 | 0 | 0, 0, 0 |
| The lanes case's (the repository's five files retained, growing composition) | 114 | 518 | 9,628 | 7,086 | 0 | 0 | 0, 0, 0 |

Only the estate's five files draw laces, and 15 samples of one picture lie on one. A reading that sees through laces reports no crossing in any of the nine, and neither does one that sees through bands only: the seeing reading finds no wire across a card in these pictures. So the rule was extended to laces in the same piece.

## The ladder audit's `shown`, mended

`card-ladder-boxes.spec.ts` sets against a card what is drawn of each part: its box within every ancestor that clips, up to its card; a part with nothing left is not drawn (`drawn`). Its own case stands three made parts in one card of the estate's picture: one far below the lines a description's slot shows, one out of the card's side, and one inside a clipping box that itself stands out of the card. On the audit as it was the first was reported ("`made-unseen` 213.5 px outside its card"); now it is not, and the other two and the clipping box still are.

`zoom-looks.spec.ts` holds a twin of the check for the parts of a row's head at the other looks, with a `shown` of its own that also does not ask about clipping. It reads five named parts, none of which stands in a slot's prose, and was left as it is; the two do not yet share one helper.

## The lab's half minute, stretch by stretch

[`lab-time-probe.spec.ts.txt`](lab-time-probe.spec.ts.txt) does what the page case does for each of the deck's four scopes, timing each stretch in the test's own process ([the numbers](numbers/lab-time.json)); one worker, the arrival held at reading size, the machine shared (one-minute load about 3):

| Scope | Cards | The page's own layout | Open the address | The capture | Load the bundle's graph | `evaluate` | `evaluate` a second time | Compare |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Repository, five files | 114 | 3.8 s | 0.3 s | 22.6 s | 0.2 s | 8.5 s | 7.2 s | 1 ms |
| Repository, chain | 132 | 3.5 s | 0.3 s | 26.6 s | 0.2 s | 9.6 s | 9.1 s | 1 ms |
| Estate, five files | 20 | 0.5 s | 0.4 s | 2.1 s | 2 ms | 0.1 s | 0.1 s | 0 |
| Estate, chain | 14 | 0.3 s | 0.1 s | 1.5 s | 2 ms | 0.05 s | 0.05 s | 0 |

The capture here includes the wait for the page to draw its picture. A second run parted the two ([the numbers](numbers/lab-time-split.json)):

| Scope | The page draws its picture | The capture, the picture drawn | `evaluate` | The three together |
| --- | --- | --- | --- | --- |
| Repository, five files | 5.0 s | 15.0 s | 7.3 s | 27.6 s |
| Repository, chain | 5.6 s | 20.5 s | 9.2 s | 35.6 s |
| Estate, five files | 0.9 s | 1.3 s | 0.1 s | 2.3 s |
| Estate, chain | 0.5 s | 0.9 s | 0.05 s | 1.5 s |

The repository's two scopes are not small pictures: the five files retained whole stand among 114 cards and the chain among 132, and the page itself takes three to four seconds to lay each out. Their cases' work is 28 to 32 s and 36 to 37 s by these stretches, which is the half minute and over it: the chain's three run-outs alone are its own work, not the machine's load. Loading and deriving the graph and the comparison cost nothing. Two stretches are the time:

- **The capture's reading of the drawn page, more than half.** It costs 0.065 s a card on the estate's 20 cards and 0.13 to 0.16 s a card on the repository's 114 and 132: it grows faster than the picture. `readCapture` (`scripts/layout-lab/capture.ts`) reads the page's texts in turn in one call, and where it calibrates a font's line it writes into the page and reads a box back before going on; a write followed by a read makes the browser lay the whole page out again, and this page holds some 25,000 elements. Whether that, or reads of that kind, is the one thing done again and again was not confirmed under a profiler, and nothing was mended.
- **The lab's layout in the test's process, a quarter.** It costs two to three times the page's own layout of the same picture and is no quicker the second time, so it is not a cache missed. Not looked into.
