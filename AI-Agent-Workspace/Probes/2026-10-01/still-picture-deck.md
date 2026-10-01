# The still-picture deck

_Design instrument, 2026-10-01. Root agent: Claude Fable 5.1. Answers the owner's question in [Turn 2](../../ChatHistory/2026/10/2026-10-01.1.record.md#turn-2), "what qualifications/tests/criteria we can make such that, even though each asks a simple question, it is effectively helping catch/prevent design mishaps?", under the go-ahead in [Turn 4](../../ChatHistory/2026/10/2026-10-01.1.record.md#turn-4). The predictions below were written before the instrument existed and are not edited afterwards; the measured scoreboard is appended under its own heading. This document decides nothing about which view is better. It gives the next probe a scoreboard and the existing views a floor they must not sink under._

## What makes a simple question catch a mishap

Six disciplines, applied to every test in the deck. A question that fails one of them is dropped.

1. **The answer exists outside the renderer.** Every count is measured against the graph the Live Docs derive, never against what the view chose to draw. A view cannot score by drawing less.
2. **It names a mishap we actually hit.** Each test is one recorded failure turned into a number, cited below. A test with no failure behind it is decoration.
3. **It discriminates, and the prediction is written first.** The expected number for each existing view is on paper before the instrument runs. If every view scores alike, the test teaches nothing. If a prediction is wrong, the model of the design is wrong, and that is the finding.
4. **It is invariant under what should not matter.** A pan, a zoom, a theme, the order of pins. The owner's rule from [September 30](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-36), that moving a card must not make the software appear more indebted, is a test, not a sentiment.
5. **It has a cost side.** Every abstraction hides facts. A view reports what it hid and what one step recovers, so a calm picture cannot win by silence.
6. **It is quantized at a fixed frame.** Counts, steps and pixels at a named viewport and pin set. No weighted score, no average across tests. Board-game numbers, as the owner [asked](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-35).

The deck cannot say whether a picture is good. The owner's eye stays the verdict; this is the floor under it.

## The six tests

A **fact** is one reference in the Explorer's graph payload: a consuming file, a providing file, the kind, and the symbols on each end when the docs know them. The **scope** of a run is a named set of files, and the facts in scope are those with both ends in the set, so every view faces the same denominator. What a view draws beyond the scope is context, reported but not scored.

| Test | Question, as a number | The mishap it names | Must not change under | Cost side it reports |
| --- | --- | --- | --- | --- |
| 1 Legible facts | Of the facts in scope, how many are drawn with both endpoint rows and both file names inside the frame, uncovered, and at a rendered font of at least 9 px | The five-pin Membrane neighborhood that grew to 42 cards with 14 in frame ([October 1](analysis-surface.md#matched-comparisons)); the handoff strip whose long wires kept endpoints off screen | Theme, pin order | Facts in scope, facts drawn, the view's scale, the smallest font on screen |
| 2 Occlusion | How many drawn wires pass over or under a card they do not end at, sampled every 8 px along the path | Wires beneath destination cards in the analytical workspace ([handoff](handoff.md)); cables crossing intervening cards in multi-column layouts | Pan, zoom | Wires drawn |
| 3 Text faults | How many pairs of visible labels collide, and how many labels are cut off, by the audit that already exists in `tests/e2e/design-audit.ts` | World Map labels landing on each other ([September 29](../../ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md)) | Pan, zoom | Labels audited |
| 4 Route invariance | Across six pans, how many wires change shape once translation is removed | The second Codex probe, whose routes changed under a pan, and the rule that followed ([September 30](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-36)) | This test is the invariance | Wires compared |
| 5 Hidden facts | Of the facts in scope not legible, how many are drawn but outside the frame (one pan recovers them) and how many are not drawn at all (a change of state recovers them) | Abstraction by silence: the atmosphere file that any single placement lies about ([September 30](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-36)) | Theme, pin order | The step that recovers each class |
| 6 The journey | For the question "which files use symbol S of file F?", whose answer the graph knows: the gestures used, the short side of the smallest target clicked in px, how far the subject F moved on screen between frames in px, how many answer names are legible at the end, and how far F sits from its starting place after the view's own return move | Instant movement that left the owner disoriented ([March 26](../../ChatHistory/2026/03/2026-03-26.1.md)); the phone's small piece targets ([handoff](handoff.md)); a return that recomputes a vaguely similar scene ([interaction game](../2026-09-30/interaction-game.md#moves-and-obligations)) | Theme | Whether the move was a history entry at all |

Two words are fixed. **Frame**: the view's own container at 1600 by 1000 CSS pixels, the size of every matched capture so far. **Legible**: inside the frame, not covered by another element at the label's center, and at least 9 px tall as rendered. The 9 px line is a parameter of the deck, not a law; what matters is that every view meets the same line.

What the deck does not measure, said plainly: whether a transition reads as continuous in motion, whether a layout is pleasant, and anything about the Force Graph's drawn edges, which live in WebGL with no DOM to inspect. The Force Graph rows below are played by its rules (names appear on hover only) rather than by pixels, and that limitation is itself a finding about the view.

## The paper play, four cards

The deck is played first on the [four-card exercise](../2026-09-30/interaction-game.md#a-tiny-deck): A `app/view` offers `view` and uses `B.total` and `C.rate`; B `app/price` offers `total` and uses `C.rate`; C `shared/tax` offers `rate`; D `shared/invoice` offers `invoice` and uses `C.rate`. Four facts. The paper frame is six units wide and three high; a full card is two by three; three cards fit at reading size, and anything drawn smaller does not count as readable, as the exercise's rules say. Where a view's own rule shrinks or fits, the paper play follows that rule.

The scope is all four cards, so facts in scope is 4 for every view. The subject state is "A is the subject": A selected in the Local Map, all of A's symbols pinned in the Membrane Map, A focused in the Force Graph.

### How each view draws the state, from its code

**Local Map** (`views/localView`): three columns, dependencies left, A center, dependents right. A uses B and C, so B and C stack in the left column, grouped by folder (`app`, `shared`) with a group label each; the right column is the words "No dependents". The fit rule (`computeFitTransform`) centers the subject and scales to show it with a buffer above and below, never below 0.6. In the paper frame the content is about 4.6 units wide and 6.5 tall; the fit lands near 0.73, so all three cards are in frame and every label is at 73 percent of reading size. Wires: two, from B's and C's blue pins into A's green pins, drawn in the gutter between the columns.

**Membrane Map, pin-active** (`views/membraneView/pin-layout.ts`, `pin-active-renderer.ts`): the pinned file is column 1 and its dependencies column 0, each column 320 px, cards grouped into folder bands that span the columns they occupy. Folder `app` holds B (column 0) and A (column 1) and takes the first band row; `shared` holds C (column 0) and, since it overlaps column 0, takes the second row. Pin-active mode does not fit to the viewport; the camera stays at scale 1. The paper frame shows the column labels and the first band row: B and A. C sits below the fold. Wires: the two visible connections caused by A's pins, B.total to A and C.rate to A. B's own use of C.rate is not caused by any pin and is not drawn.

**Force Graph** (`views/forceGraphView.ts`): four spheres and four lines in a cooling simulation, names on hover only, no symbol anywhere, no arrowheads, and no camera move on focus.

### Predictions, written before measurement

| Test | Local Map, A selected | Membrane Map, A pinned | Force Graph, A focused |
| --- | --- | --- | --- |
| 1 Legible facts (of 4) | 0 at reading size: both of A's facts are in frame and uncovered, at scale 0.73, which puts an 11 px label at 8 px. If the person resets zoom to 1, 1 (B.total to A; C falls out of frame) | 1 (B.total to A). C.rate to A is drawn with C out of frame | 0. No fact is named in a still picture |
| 2 Occlusion | 0. Wires live in the column gutter | 0. The one long wire climbs the gutter from C's row to A's | Not measurable; lines pass through spheres by construction |
| 3 Text faults | 0 collisions, 0 cut-offs | 0 collisions, 0 cut-offs | 0; the view has no text |
| 4 Route invariance (of wires drawn) | 0 of 2 change. Wires are drawn in content coordinates and a pan is a CSS transform | 0 of 2 change, same reason | Not applicable; a perspective camera changes every projected shape |
| 5 Hidden facts | 2 drawn but under reading size (one zoom recovers both); 2 not drawn, B.rate and D.rate (one recenter on C recovers both) | 1 drawn out of frame (one pan); 2 not drawn (one pin on C.rate, after that pan) | 4 not drawn as facts; file names recoverable one hover each, symbols not recoverable in this view |
| 6 Journey: which files use C.rate? (answer A, B, D) | Recenter on C: 1 gesture (double-click), target a whole card. C center, dependents A, B, D stacked right at a fit near 0.6: 3 of 3 names in frame, under reading size. Subject A moves from the center to the right column, about two units. Return by Back: a recenter is a place, Back restores A as the subject; the fit is deterministic, so the error is 0 | Pan to C (1), click the `rate` label or pin (1, smallest target a 12 px dot or a 16 px tall label). C becomes column 0 pinned; A, B, D column 1, with `shared` (C, D) in row one and `app` (A, B) in row two. 1 of 3 answer names in frame (D); A and B need one more pan: 3 gestures. Subject A moves one band row down, about three units. Return: Back does not undo a pin, by design (a pin rewrites the place); unpinning C.rate restores the previous layout, and the FLIP animation returns A to within a few px | Find C by hovering up to 4 spheres, click it: the detail panel lists A, B, D as text. 3 of 3 names legible, in the sidebar rather than the picture. Target a sphere of about 8 px. Subject displacement 0 by camera, nonzero by simulation drift. Return: focus writes no address, so Back leaves the view |

What the paper play already shows, if the predictions hold: the Local Map trades reading size for context and never hides a card; the Membrane keeps reading size and hides by the fold; both are honest about half the facts and silent about the other half until a second move; the Force Graph is a shape, not a statement. The two directions proposed in the Turn 2 reply, a subject-fixed concentric layout and force-positioned full cards, would be scored on the same six rows before any code.

## The real-data runs the instrument will take

Same frame, the shipped bundles, three states each. The scope sets and journeys are fixed here so that the numbers mean the same thing on every run.

| Bundle | Scope set | Membrane state | Local Map state | Force Graph state | Journey |
| --- | --- | --- | --- | --- | --- |
| This repository | `graph.ts`, `document.ts`, `graphFiles.ts` (engine, live-docs), `staticExplorerData.ts`, `staticBuilder.ts` (explorer, shared); the five files that broke both views on October 1 | All symbols of all five pinned, default camera | `graph.ts` selected | `graph.ts` as the node in the address | Which files use `GraphFile` of `graph.ts` |
| The estate sample | `Contracts/IPaymentService.cs`, `PaymentService/PaymentService.cs`, `Gateway/Wcf/HubProxy.cs`, `Hub/PaymentHub.cs`, `Portal/Services/GatewayClient.cs` | All symbols of all five pinned, default camera | `PaymentService/PaymentService.cs` selected | `PaymentService/PaymentService.cs` as the node | Which files use `IPaymentService` of `Contracts/IPaymentService.cs` |

Predictions for the repository run, from the probe's counts and the code above:

| Test | Local Map | Membrane Map | Force Graph |
| --- | --- | --- | --- |
| 1 Legible facts | 0 at reading size: 19 cards force the fit to its floor of 0.6, and 11 px becomes 6.6 px. In frame and uncovered: the facts touching `graph.ts` only, about a third of the scope | 4 of the facts in scope; 42 cards at scale 1 and a frame that holds perhaps 8 | 0 |
| 2 Occlusion | 0 | At least 2 wires cross a card they do not end at, because bands span three or more columns | Not measurable |
| 3 Text faults | 0 and 0; names wrap rather than clip | 0 collisions; 0 cut-offs | 0 |
| 4 Route invariance | 0 change | 0 change | Not applicable |
| 5 Hidden facts | Most of the scope not drawn at all; the rest drawn under reading size | Most of the scope drawn but outside the frame; a pan recovers each | All |
| 6 Journey | Click the `GraphFile` row: 1 gesture, the row is about 16 px tall; the consumers light up in the right column; F does not move; the row is not a history entry, and unpinning returns the exact layout, error 0 | Click `GraphFile`'s pin from the browse view: 1 gesture, a 12 px dot; the layout changes mode and F's card travels far; the consumers appear in column 1 with wires; unpinning returns to browse with F near its tile, error within a few px | Not scriptable: the view has no way to locate a file, which is the standing defect the owner confirmed |

The same table for the estate is expected to be kinder to every view (35 files, short names), and the Membrane's occlusion count is expected to be 0 there.

## How the instrument reads a view

The instrument is a Playwright spec, `tests/e2e/still-picture.spec.ts`, over a measurement module, `tests/e2e/still-picture.ts`. It opens each state by address, waits for the view to settle, and reads the DOM: the wires by their data attributes (`data-source-id`, `data-target-id`, `data-source-symbol`, `data-target-symbol`, which both the Local Map and the Membrane Map stamp on every path and stub), the endpoint rows by `data-node-id` and `data-symbol`, the cards by `data-id`, and the frame by the view container. Facts in scope come from the bundle's graph through the same projection the client runs, so the denominator is the one the views were given. Pan invariance drags the viewport with the mouse and re-reads the path data. The journey is scripted per view as the table says, and every number it reports is one the deck defines. The scoreboard is written as a table under `reports/still-picture/` and copied here by hand, with the predictions above left as they were.

The spec asserts only what the workspace already holds as a rule: no label collisions, no cut-off text, no wire that changes shape under a pan. Everything else is reported, not gated, until the owner reads the first scoreboard.

## The first scoreboard, measured

Measured on 2026-10-01 at 1600 by 1000 CSS pixels by `tests/e2e/still-picture.spec.ts` over bundles built from the working tree, after the two fixes described below; where the first run differed, its numbers are quoted. The columns are the deck's tests in order: test 1 is Legible through Small, with Scale and Smallest label as its cost side; Cards and Wires describe the picture; Occluded is test 2; Collisions and Cut-offs test 3; Routes test 4; the hidden classes of test 5 are Off frame, Covered, Small and Not drawn; Gestures through Return error are test 6. Pictures of every state and journey sit beside the table in `reports/still-picture/`, and the ones worth keeping are in [the day's screenshots](../../Screenshots/2026-10-01/README.md#the-still-picture-instrument-the-same-afternoon).

### This repository

| View | State | Facts in scope | Legible | In frame | Drawn | Not drawn | Off frame | Covered | Small | Scale | Smallest label px | Cards (in frame / partly / all) | Wires | Occluded wires | Occluded samples / samples | Collisions | Cut-offs | Routes changed / compared | Gestures | Smallest target px | Subject moved px | Answer legible / answer | History entry | Return error px |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- | ---: | ---: | --- | ---: | ---: | ---: | --- | --- | ---: |
| Local Map | graph.ts selected | 15 | 4 | 4 | 10 | 5 | 6 | 0 | 0 | 1.00 | 11.0 | 5 / 2 / 19 | 70 | 0 | 0 / 3808 | 0 | 0 | 0 / 80 | 1 | 13 | 0 | 2 / 5 | no | 0 |
| Membrane Map | all symbols of 5 files pinned, default camera | 15 | 2 | 2 | 15 | 0 | 13 | 0 | 0 | 1.00 | 10.0 | 7 / 1 / 42 | 207 | 3 | 162 / 6388 | 0 | 0 | 0 / 207 | 2 | 7 | 742 | 0 / 5 | no | 0 |
| Force Graph | graph.ts in the address | 15 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | n/a | n/a | n/a | n/a | n/a | n/a | 0 | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

The journey asks which files use `GraphFile` of `graph.ts`; the graph's answer is `boardGraph.ts`, `detailPanel.ts`, `download.ts`, the Explorer's `shared/graph.ts` and `inspect/emit.ts`.

### The estate sample

| View | State | Facts in scope | Legible | In frame | Drawn | Not drawn | Off frame | Covered | Small | Scale | Smallest label px | Cards (in frame / partly / all) | Wires | Occluded wires | Occluded samples / samples | Collisions | Cut-offs | Routes changed / compared | Gestures | Smallest target px | Subject moved px | Answer legible / answer | History entry | Return error px |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- | ---: | ---: | --- | ---: | ---: | ---: | --- | --- | ---: |
| Local Map | PaymentService.cs selected | 3 | 0 | 0 | 2 | 1 | 2 | 0 | 0 | 1.00 | 11.0 | 6 / 2 / 9 | 17 | 0 | 0 / 857 | 0 | 0 | 0 / 17 | 1 | 13 | 0 | 4 / 4 | no | 0 |
| Membrane Map | all symbols of 5 files pinned, default camera | 3 | 0 | 0 | 3 | 0 | 3 | 0 | 0 | 1.00 | 10.0 | 10 / 1 / 20 | 71 | 2 | 22 / 2332 | 0 | 0 | 0 / 71 | 2 | 10 | 72 | 0 / 4 | no | 0 |
| Force Graph | PaymentService.cs in the address | 3 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | n/a | n/a | n/a | n/a | n/a | n/a | 0 | 0 | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

The journey asks which files use `IPaymentService` of `Contracts/IPaymentService.cs`; the answer is `Hub/App.config`, `Hub/PaymentHub.cs`, `PaymentService/App.config` and `PaymentService/PaymentService.cs`.

### Predictions against measurements

- **The Local Map's fit was misread.** The deck predicted the 0.6 floor and nothing at reading size. Measured: scale 1.00, labels at 11 px, 4 of 15 facts legible. The fit centers on the subject with a buffer above and below and lets the rest of the columns run off the frame; it does not shrink to show them. On this run the Local Map is the only view with facts at reading size. The prediction was wrong because the model of the design was wrong, which is what the deck is for.
- **The Membrane's counts were close, its occlusion worse than predicted.** 42 cards, as the probe had counted; 7 in frame against "perhaps 8"; 2 facts legible against 4; 13 of 15 drawn but off frame, so a pan recovers each. Occluded wires 3 of 207 on the repository, as the deck said at least 2; on the estate 2 of 71, where the deck said 0. Routes did not change under six pans in any view, and no label collided.
- **The Force Graph row is the statement predicted:** nothing legible, nothing measurable, no journey scriptable. It is a shape, and the file-focus method is the first thing that would let the instrument ask it a question.
- **The journeys.** The Local Map answers in 1 gesture on a 13 px target, with 2 of 5 consumers lit in frame on the repository and 4 of 4 on the estate, and neither pin nor unpin writes a history entry. The Membrane needs 2 gestures because a closed card shows no symbol rows; its smallest target was 7 px on the repository, the symbol label at the folder view's fitted scale; the subject travels 742 px into the pin-active layout; the answer came out legible 0 of 5 and 0 of 4, for two different reasons given below.

### What the instrument found, and what was done

1. **A clipped symbol name in the Membrane Map.** The estate's `PaymentService/App.config` carries the address `net.tcp://payments.onprem.example:8732/PaymentService`, cut off by 39 px in a 320 px card. Fixed in `membrane.css`: symbol labels wrap as the Local Map's do, instead of hiding their ends behind an ellipsis. [Picture](../../Screenshots/2026-10-01/membrane-symbol-names-wrap.png).
2. **The Local Map's subject jumped 862 px when a symbol was pinned.** Pinning collapses the neighbors' unrelated rows, the columns re-center on the new heights, and the selected card moved off the top of the frame; unpinning left it 692 px from where it had started. Fixed in `localView/controller.ts`: when the columns re-center, the camera moves by the subject's displacement so the subject keeps its place on screen. After the fix both numbers are 0. [Picture](../../Screenshots/2026-10-01/local-map-pin-subject-stays-put.png). This is the orientation rule of September 30 and the March 26 antecedent as a number, and it is the row the deck predicted wrongly as "F does not move".
3. **The instrument's own first fault.** The Local Map's symbol rows are `display: contents` and have no box, so the first journey could not click one; the label is the thing a pointer hits, and a gesture now pans the view into position rather than scrolling a clipped container, which Playwright would otherwise do silently and which corrupted the picture on the first attempt.

Open, for the owner, because each is a design choice rather than a defect with one right answer:

- **Pinning from a folder keeps the folder's camera.** On the repository the folder view fits at about half scale; pinning `GraphFile` builds the pin-active layout at that scale, with names at 5 px, so none of the five consumers is legible. Whether entering pin-active should re-fit, or keep the camera and the subject fixed, is the transition question of the Turn 2 reply.
- **The detail panel covers the answer.** On the estate the click that opened the subject's card also selected it, the panel opened over the dependents column, and all four consumers sit under it. The panel's place, or the card click's double duty, is the question.
- **A pinned file labeled a dependent.** With five files pinned at different depths, `graph.ts` sits in the column headed "Dependents" because the pin layout gives pinned files at depth one the dependents' column. A labeling rule, small, but it says the wrong thing about a pinned file.
- **The Force Graph** has no focus, no DOM and no scriptable journey; every row it gets is a statement of that until the focus method lands.

The floor for the next probe is these two tables. A new rendering of the five-file set must show more than 4 facts at reading size, cross no card with a wire it does not end at, keep its routes under a pan, and answer the `GraphFile` question in one gesture with the subject unmoved; and it must say how many facts it hid and what recovers them.
