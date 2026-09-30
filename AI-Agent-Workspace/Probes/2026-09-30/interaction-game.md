# Play the interaction before drawing it

_Design exercise, 2026-09-30. Responds to the owner's [request to use history and falsifiable experiments](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-34) and [clarification of “board game rules”](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-35). Proposed by the root agent; no replacement rendering has been selected. This is a small interaction model, not a product specification or a claim of user testing._

The aim remains Local Map card legibility with World Map navigability. Before implementing another camera or layout, enact its rules with cards, envelopes and string. Use discrete moves to make consequences inspectable. The eventual camera may still move smoothly.

## Earlier attempts that matter

This was a targeted search, not a reread of every transcript. Reader reports supplied leads; these conclusions were checked against the original exchanges.

- On February 24 the owner defended the force graph because it exposes an emergent shape independent of directories, at a useful scale and speed. A replacement that makes containment easy while hiding that topology loses a valued capability. [Source](../../ChatHistory/2026/02/2026-02-24.1.md), owner turn beginning “I couldn't disagree more with this” (line 2509).
- On March 30 the owner asked how directory bundles would reach a destination outside the current view, and whether hover or click would cause surprise rearrangement or interfere with entering a directory. They allowed abandoning treemap geometry for relational exploration; fixed geometry was not an unconditional owner requirement. [Source](../../ChatHistory/2026/03/2026-03-30.1.md), owner turns at lines 842 and 990.
- On April 1 the owner found hover arcs unlike the agreed picture, asked whether their shortfalls had been discussed before, and requested a revert after the agent rediscovered the March discussion. This is a concrete repeat of an unresolved design, not evidence that every bundled connection must fail. [Source](../../ChatHistory/2026/04/2026-04-01.1.md), owner turns at lines 1786, 1847 and 1922.
- On September 29 the agent proposed separate still-picture and task measures; the owner welcomed the first and explicitly relaxed the demand that every intermediate change improve every number. Those measures were proposals in that exchange, not verified instruments. Today's clarification adds a method for thinking through the interaction itself before measuring a digital implementation. [Source](../../ChatHistory/2026/09/2026-09-29.2.md#owner--2026-09-29-2246-utc), and the immediately preceding agent response.

## A tiny deck

These four files and references are deliberately invented to isolate the problem; they are not claims about the repository. Each card has a path, one named symbol and separate offer/use pins. Blue offers and green uses. String joins an offered symbol to the file that uses it; it does not assert runtime data flow.

| Card | Path | Offers | Uses |
| --- | --- | --- | --- |
| A | app/view | view | B.total, C.rate |
| B | app/price | total | C.rate |
| C | shared/tax | rate | — |
| D | shared/invoice | invoice | C.rate |

Put A and B in an `app` envelope; C and D in a `shared` envelope. Start with `app` open and `shared` closed. There are four references in total. Keep their list available to check the picture, without treating an unseen reference as absent from the software.

A rectangular viewport is six units wide and three high. Each full readable card is two units wide and three high, including its labels and pins: three cards fit. For this initial paper exercise, a closed envelope occupies the same footprint. Names, stubs or other smaller representations must be drawn at their actual proposed size; they do not count as full readable cards. Space outside the viewport can exist, but its contents are not visible. The numbers are a deliberately small stress case, not final pixel sizes or an equal-size rule for real files.

Draw a selected marker and keep successive arrangements beside the board as a history stack. Mark which object each representation denotes. If a candidate uses two representations of C, that is still one file; neither edges nor totals may be doubled.

## Moves and obligations

Each candidate must specify the resulting arrangement for each move. “The camera handles it” and “the layout adapts” leave the rule unfinished. One paper move may require several gestures in the digital version; do not report paper moves as measured click counts.

| Move | What must be specified |
| --- | --- |
| Reveal one boundary | Which contents appear, where they fit, what recedes, and how their containing path stays identifiable. Reveal no additional level implicitly. |
| Follow one reference | The exact offered symbol and using file; where both readable endpoints will be; what happens to their containing boundaries and the previous subject. |
| Keep one card available | What the pin promises: fixed position, continued visibility, or a retrievable representation. State that promise before testing it. |
| Inspect one reference's evidence | How the evidence opens, what it obscures, and how dismissal restores the relationship being examined. |
| Return one step | Restore the preceding subject, camera/frame, disclosures and pins. Do not recompute a vaguely similar scene. |
| Move the viewport one unit | State what changes through projection or clipping. Camera movement alone does not change graph facts or rebuild cable routes. |

## Play one short journey

1. Read A and B beside the closed `shared` envelope. Identify A's use of B.total. An outside reference to C must remain discoverable, even though C's card is hidden.
2. Follow A's use of C.rate. Both A and C must now be readable, with their relationship identifiable. Show where C belongs. State whether the viewer travelled, a reading surface appeared, or the arrangement changed; track every displaced piece.
3. Keep A available under the candidate's declared pin rule. From C.rate, inspect its other consumer D. Show C and D's relationship while honoring that promise to A. Account explicitly for B, which now exceeds a three-full-card budget if all four must remain visible.
4. Open the evidence for D's use, dismiss it, then Return. Check the prior arrangement against the history stack, including which subject was selected.

This journey separates keeping context from insisting that every encountered file remain fully expanded forever. If the design promises all four full cards in this viewport without overlap or smaller text, it has already contradicted the arithmetic. It needs a stated disclosure, navigation or representation rule. Merely reducing the reference count to make the picture tidy changes the question instead of answering it.

## Counterexamples before implementation

- **A deeper other branch:** move C into `shared/internal/rates/tax` without changing any reference. Replay the A-to-C move. A tree-walking-only rule requires visiting more ancestors; direct relationship navigation might avoid that, but must still show where C belongs. A breadcrumb by itself does not draw the relationship.
- **The fourth important card:** require B to stay fully readable as well as A, C and D. The three-card viewport cannot meet that simultaneous requirement. Record the tradeoff openly; do not describe another view or a hidden card as simultaneously visible. Try the same problem with a shorter or narrower viewport.
- **Another viewpoint:** turn parallel fixed card fronts edge-on. The words and symbol identities disappear even if every string stays fixed. A candidate may constrain the camera or provide other reading surfaces, but must account for their area and connection identities. This rejects the earlier composition, not all quarter-turn designs.
- **A disappearing hover:** point to an outside-reference hint, then move toward its revealed destination. If that dismisses the only route to the destination, the interaction is not traversable. Repeat without hover for a touch interaction.
- **A prettier lie:** remove one string, merge distinct pins without recoverable membership, or hide the destination label. Fewer crossings have not improved the answer. Distinguish string/string crossings from strings obscuring a name or a clickable target.

These are logical deductions under the stated paper rules, not measurements of today's views. A proposed interaction that survives them still needs a real rendering, real graph data, motion inspection and owner judgment. A paper model cannot establish whether a transition feels orienting or whether labels are comfortable to read.

## The shared foundation is a different challenge

The owner's [next steering message](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-36) opens abstract space as well as literal geography. A highly reused dependency can matter everywhere without having a useful single visual address. Repeated contextual representations, grouped relations, and views composed around a question are candidate mechanisms, not selected designs. This is not a request to turn the Explorer into a menu of questions.

The existing deck already contains the small counterexample: A, B and D all use C.rate. No extra files are needed. Compare a single C placed somewhere on a fixed board with a contextual representation of the same C in each relevant view. The invariant is C's identity and the three actual references, not one exclusive position on screen.

| Context being examined | Required accounting for C.rate |
| --- | --- |
| A and B in app | Two local uses, by A and B; one additional consumer outside this context remains discoverable. |
| D in shared | One local use, by D; two additional consumers outside this context remain discoverable. |
| C itself | All three consumers can be identified, with each exact reference and its evidence reachable. |

As a paper enactment, use two tokens bearing the same C identity, one beside each context, and attach the corresponding strings. There are still four files and four references in the whole deck, of which three use C.rate. Moving between contexts changes which relationships are exposed; it must not manufacture another C or lose the distinction between local and total counts. Every token occupies space. Rejoin the tokens to inspect C: the same three consumer strings must be recoverable. This establishes that contextual representations can preserve the small graph, not that they will be legible or orienting in the UI.

A candidate may instead represent the common dependence once for a group of consumers. Its disclosure must recover exactly A, B and D and their symbol-level evidence. High degree alone does not justify hiding a node or labelling it harmless infrastructure: an accidental bottleneck can be just as connected. The default prominence and disclosure rules remain questions to try.

This also changes the return test: recognizable identity, preserved selections and recoverable context matter even when a view deliberately gives up global geometric placement. The authored World Map can retain useful stable placement while an interpretive view uses a different composition. No unified coordinate system is required by this exercise.

## Can the shape distinguish a foundation from coupling?

The owner [asks for this distinction at a glance](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-37). The proposed grammar should expose shared dependence and mutual dependence differently; it cannot certify that one is appropriate without intent.

In the small deck, C.rate has three consumers and no dependency back into them. A common offered interface with three identifiable branches can read as a shared foundation. Add just one documented reference from C to B.total: C still has the same three consumers, but B and C now form a dependency cycle. A closed-loop mark or enclosure derived from that actual cycle could make the change immediate. It must persist when cards move and must not be inferred from screen-space line crossings. These are two paper states to compare before deciding how the loop should be drawn.

Consumer overlap supplies another visible fact: are many consumers using the same small set of offered symbols, or different sets across a broad interface? Give shared ports and distinct port groups different shapes, while preserving exact membership. Neither a broad interface nor a cycle automatically means debt; an intentional coordinator may be highly connected, and a graph without cycles can still have poor boundaries.

The [current graph model](../../../packages/engine/src/live-docs/graph.ts) supports file-level inbound/outbound sets, target symbol anchors when resolved, reference kinds, type-only flags where known, and contract/configuration bases. Dependency cycles and symbol-consumer overlap can be derived from these facts. It does not establish runtime call frequency, coordinated-change history, conceptual cohesion, or the legitimacy of a dependency. Unresolved or file-level references must remain visibly less precise than known symbol references. A type-reference cycle must not be presented as a runtime execution loop.

This leaves a concrete visual hypothesis: repeated use should read as commonality; actual feedback should read as a return connection; interface spread should be visible without an invented health score. The hypothesis still needs rendering and comparison with the existing views.

## What the next digital experiment must add

The owner's [further steering](../../ChatHistory/2026/09/2026-09-30.2.record.md#turn-38) invites a small, distinct set of useful views. A provisional division is **arrange systems** (authored placement and connections), **survey structure** (emergent relationships and shared dependencies), and **trace a relationship** (readable interfaces and exact evidence). These are candidate jobs, not a selected count of renderers or a renaming of the current views. A view switch is another paper move: carry the subject and relevant selection, disclose changes in scope, and retain the prior view's return state. Stable identity does not require identical coordinates across views.

An extra view earns its place by answering a consequential question more clearly than the others can while retaining their useful properties. Another camera angle or cosmetic variation alone does not establish that need. Conversely, a merged view must demonstrate that it preserves each job; fewer view buttons are not sufficient evidence of simplification.

Replay the same small journey against the relevant existing views and one explicitly different candidate. Record visible facts and hidden-but-reachable facts separately; record actual gestures, the smallest unobscured target used, and any loss of the subject. Keep the observations separate rather than weighting them into an invented overall score. A wire crossing is a cost to inspect, not automatically a correctness failure.

Only implement a candidate after its paper trace explains a concrete improvement and its cost. A new implementation of the Membrane Map's existing interaction is not a new hypothesis. Then substitute native Local Map cards of their actual, unequal sizes and references from the repository or estate sample. Passing the toy case is an early filter, not evidence of general scale or permission to replace a shipped view.
