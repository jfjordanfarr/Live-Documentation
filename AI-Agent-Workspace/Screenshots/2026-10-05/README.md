# October 5, 2026 — the Local Map and the Membrane Map in one multi-file state

Evidence for the state of the Local Map's many-file layout, taken by the root Claude Code agent (Fable 5.1) in [the October 5 session](../../ChatHistory/2026/10/2026-10-05.1.record.md#turn-2) when the owner asked for a check on where that work stands. Nothing in the Explorer changed; these are the shipped views at `cb06f8ce`, built fresh, in Chromium at 1600 × 1000 with tests shown and assets hidden. Each pair puts the two views in the same state by URL: the Local Map with every file of the scope retained whole (the first file the subject, the camera where the view's own fit leaves it), and the Membrane Map with every symbol of every file pinned at its default camera, which is the still-picture deck's state for it. The scopes are the deck's: the five files around `graph.ts` and the four-file chain from `index.ts` on this repository, and the five files around `PaymentService.cs` on the estate sample.

| Capture | State |
| --- | --- |
| [Five files, Local Map](repository-five-local-map-retained.png) | 44 cards in 7 columns. The fit lands on the subject at scale 1 with most of the picture off frame; the vertical trunks in the gutters are 162 of the 204 wires, every skipped-rank or cyclic reference routed over the top of the whole picture in its own lane. |
| [Five files, Membrane Map](repository-five-membrane-map-all-pinned.png) | The same 44 files in 5 hop columns inside nested ancestor membranes. Long references run straight across intermediate cards; 55 backward references are French Corset stubs with no path; 110 of 209 drawn wires run against the reading direction, the standing hop-depth defect. |
| [Chain, Local Map](repository-chain-local-map-retained.png) | 46 cards, 7 columns, 171 detours over the top. The consumers of `index.ts` stand in one column wired to its Internals row. |
| [Chain, Membrane Map](repository-chain-membrane-map-all-pinned.png) | The same files in 4 hop columns; the pinned cards show every symbol with the unconnected ones greyed. |
| [Estate five, Local Map](estate-five-local-map-retained.png) | 20 cards in 9 columns with the Contracts and Hub bands; 42 detours over the top; cards at reading size. |
| [Estate five, Membrane Map](estate-five-membrane-map-all-pinned.png) | 3 columns with Gateway, Portal and Contracts as nested membranes, the clearest picture of what the owner means by directory parentage; 4 wires backward, 2 stubs. |

[The scoreboard](scoreboard.md) holds the deck's measures for all six pictures, taken with the instrument in `tests/e2e/still-picture.ts` through a disposable spec that was deleted after the run. The headline rows, this repository's five files:

| View | Legible facts | Wires | Over the top or hidden | Crossing points | Backward wires | Folders legible | Symbols shown | Occluded wires |
| --- | ---: | ---: | --- | ---: | ---: | --- | --- | ---: |
| Local Map, retained | 0 of 15 | 204 | 162 detours | 14,112 | 0 | 2 of 2 | 12 of 51 | 0 |
| Membrane Map, all pinned | 2 of 15 | 209 | 55 stubs | 275 | 110 | 7 of 7 | 60 of 60 | 3 |

What the pictures and numbers establish, by the agent's reading: the Local Map keeps every reference, its direction and its gutters, and pays with a wall of detour lanes and a camera that frames almost none of it; the Membrane Map keeps the folders and the symbols legible and pays by drawing half its wires backward, hiding fifty-five and crossing three cards. Neither is the owner's verdict; the owner's eye on these pictures is what decides.

## After the layout pass, the same day

The owner agreed the plan in [Turn 3](../../ChatHistory/2026/10/2026-10-05.1.record.md#turn-3) and answered its forks in [Turn 4](../../ChatHistory/2026/10/2026-10-05.1.record.md#turn-4), and the pass landed that afternoon: cycles broken at their feedback references and drawn as stubs with a count and a hover route, band rows and files ordered by a barycenter sweep, references that skip columns threaded through lanes between cards, the picture framed at reading size, and a nudge toward the Force Graph when the layout strains. These pictures are the deck's new "Local Map, retained" rows, taken by `tests/e2e/still-picture.spec.ts` on the shipped bundle at the same frame as the pictures above; the Membrane pictures above are their comparison.

| Capture | State |
| --- | --- |
| [Five files, after](repository-five-local-map-retained-after.png) | The same 44 cards and 204 wires. No wire over the top, none across a card, every route forward. The skipped references run as lane bundles above and below the subject's card; the "Dense picture" nudge shows at the bottom right, since 162 references skip columns. |
| [Chain, after](repository-chain-local-map-retained-after.png) | The same 46 cards and 227 wires. The consumers of `index.ts` stand beside it; the wires that converge on its Internals pin from far above and below make the steep bundle at its left, which is the shape of a hub. |
| [Estate five, after](estate-five-local-map-retained-after.png) | 20 cards, 78 wires. The three Contracts providers feed one lane bundle above IPaymentHub and one below IPaymentService; App.config says "1 reference reads back". |
| [Estate chain, after](estate-chain-local-map-retained-after.png) | The four-file chain scope, 14 cards and 52 wires, the deck's fourth scope, which the morning pictures did not take. |
| [A back reference on hover](estate-back-reference-hover.png) | App.config's Internals row hovered: the one reference that reads against the columns, from PaymentService.cs, draws its full route while the others dim; before the hover it is two stubs at its pins. |

[The scoreboard after](scoreboard-after.md) holds the measures. The before-and-after on the repository's five files:

| Measure | Before | After |
| --- | ---: | ---: |
| Wires over the top | 162 | 0 |
| Wires across a card | 0 | 0 |
| Routes backward | 0 | 0 |
| Crossing points | 14,112 | 3,276 |
| Legible facts at the fit | 0 of 15 | 0 of 15 |

The chain went from 11,029 crossing points to 1,469 and the estate's five from 1,291 to 224. The legible count did not move: the fit is the subject at reading size, and a five-file exploration's facts have ends further apart than the frame, which the tour measures. Vertical placement that aligns pins with partners, and what to do when a lane bundle grows thick, are left for after the owner has looked. The nudge's default threshold of 48 makes the estate's five-file scope dense as well; the owner's eye sets it, in Tuning.

## After the owner's review, the same evening

The owner looked at the afternoon's pictures in [Turn 8](../../ChatHistory/2026/10/2026-10-05.1.record.md#turn-8) and asked three things: whether the "guitar strings" of parallel wires from one symbol could stay bunched until the separation is needed; whether the two wires through the Portal/Services box could be seen as passing behind it; and why the cards overflowed their directory boxes. The answers, measured before they were given and accepted in [Turn 9](../../ChatHistory/2026/10/2026-10-05.1.record.md#turn-9), became the evening's pass: the wires of one offering pin bundle through the columns they pass together and part in the gutter before each consumer's column, with the shared run drawn beneath them as wide as its member count; a lane lies inside the deepest directory that holds an end of every wire in it, never inside one that holds neither; and the card is a border box, so it fills the room its content asked for instead of overflowing it by its padding. The box labelled "/" around everything went with it. The pictures are the same states as above, on the shipped bundles at `1600 × 1000`.

| Capture | State |
| --- | --- |
| [Five files, bundled](repository-five-local-map-bundled.png) | The same 44 cards and 204 wires. Each of document.ts's pins now sends one cable rather than a string per consumer; the lanes above graph.ts hold one slot per pin. |
| [Where the bundles part](repository-five-bundles-part.png) | The same state panned right: the cables from document.ts run past graphFiles.ts and pathfind.ts, and a member leaves each one only in the gutter before its consumer. |
| [Chain, bundled](repository-chain-local-map-bundled.png) | The same 46 cards and 227 wires; the cables converge on index.ts from the consumers' column at its left. |
| [Estate five, bundled](estate-five-local-map-bundled.png) | The three Contracts providers each send one cable where twenty strings ran above IPaymentHub and fifteen below IPaymentService in the afternoon picture. |
| [Estate five, where the bundles part](estate-five-bundles-part.png) | Panned right to the Gateway and Portal consumers: the cables split at HubProxy's and PaymentsController's pins. |
| [A bundle on hover](estate-five-bundle-hover.png) | PaymentRequest's row hovered: every member of its cable lights to its consumer while the rest dim. |
| [Estate chain, bundled](estate-chain-local-map-bundled.png) | The two wires from Portal/Models to Portal/Controllers now run inside Portal above the Portal/Services box, which stands in a row of its own below them, and every card ends inside its directory's box. |
| [The classic Local Map](repository-local-map-classic-border-box.png) | graph.ts selected with no pins, after the card's sizing changed: the cards fill their columns. |
| [The Circuit Board](repository-circuit-board-border-box.png) | packages/engine/src/live-docs, whose file cards share the card style; unchanged to the eye. |

[The scoreboard](scoreboard-bundled.md) is the gate's full run with the deck's new column, wires through a foreign directory, and its corrected crossing counter: the first measurement of the bundles read thousands of crossings between members of one bundle, because two wires drawn along one path touch at every sample and the counter took each bend sample for a crossing; it now counts a meeting at a sample point only when the wires' directions alternate around it, and reports crossing spots, the distinct places within 4 px, beside the points, one per pair of wires. Measured like for like, the previous commit built in a worktree against this tree, both under the corrected counter:

| Scope | Crossing spots, before | after | Crossing points, before | after | Lane samples in a foreign directory, before | after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Repository, five files | 1,324 | 498 | 3,276 | 3,778 | 9,243 | 0 |
| Estate, five files | 122 | 48 | 224 | 390 | 3,029 | 0 |
| Estate, chain | 39 | 17 | 57 | 50 | 1,020 | 0 |

The spots fall because a cable crossed once is one place; the points rise where a cable of many members crosses a wire, since each member is a pair, which is what that count means. The deck now holds foreign lane samples at zero on every retained row. What remains for the owner's eye: the curves in a gutter still cross a directory that spans the gutter and holds neither of their ends (on the repository's five files, 24,886 samples of 83 wires, up from 18,835 of 133, since lanes outside a foreign box mean longer climbs into them), which is the residual case for the glass they asked about; the width scale of the shared run; and the Portal/Services box moved to its own row, the price of the lane above it.

## The rows of a card where their wires lead, later the same evening

The owner's verdict on the pictures above ([Turn 10](../../ChatHistory/2026/10/2026-10-05.1.record.md#turn-10)): the estate chain "looks phenomenal", the bundle on hover "really great", and the repository's five files still showed "guitar strings", which they read rightly as one cable per pin of document.ts. They asked whether those symbols could stand higher on the card so their cables need not cross the wires bound for graph.ts, board.ts and boardGraph.ts, and chose, of the fork offered, that a card's rows be ordered by where their wires lead, with fixed orders on offer for anyone who wants them ([Turn 11](../../ChatHistory/2026/10/2026-10-05.1.record.md#turn-11)). The pass: the port-ordering step of layered drawing, each card's rows sorted by the mean height of their wires' far ends after the columns are ordered and before one more sweep, kept only if it crosses no more than before; Internals keeps the foot of the card; and a Symbol Order choice in Tuning with "Layout" as the default, "Alphabetical" wherever a card is drawn, and "Order of appearance", the Live Doc's own. The same states as above, same frame.

| Capture | State |
| --- | --- |
| [Five files, rows ordered](repository-five-local-map-ordered-rows.png) | document.ts's rows whose cables climb to the lane above graph.ts now stand at the top of its card, and graph.ts's rows stand in the order their wires arrive, LinkTarget and linkTarget first. |
| [Where the bundles part, rows ordered](repository-five-bundles-part-ordered-rows.png) | The same state panned right. |
| [Chain, rows ordered](repository-chain-local-map-ordered-rows.png) | The consumers' rows wired to index.ts stand by the height of its pin. |
| [Estate five, rows ordered](estate-five-local-map-ordered-rows.png) | IPaymentService's rows are Post, Get, IPaymentService: the two the Contracts providers feed on top, the one whose cable leaves for the Hub below. |
| [Estate chain, rows ordered](estate-chain-local-map-ordered-rows.png) | PaymentsController's rows stand by their wires to GatewayClient and HubProxy; the picture the owner called phenomenal is otherwise unchanged. |
| [Alphabetical, from Tuning](repository-five-symbol-order-alphabetical.png) | The five files with Symbol Order set to Alphabetical in the open Tuning panel: every card's rows in name order, Internals last, and the cables crossing again. |

The order is kept by the ordering's tests and by a Playwright test that reads all three orders from the page and holds the layout order closer to the wires than the file's own. [The scoreboard](scoreboard-rows.md) is the gate's run. The ordering's own count, crossings between straight segments in its index space, fell on every scope; the deck's count of the drawn curves fell on the five-file scopes and rose on the chain scopes, where every consumer's rows lead to one pin of index.ts or GatewayClient and the row order changes little a reader would see:

| Scope | Ordering's crossings, file's order | by wires | Drawn spots, before | after | Drawn points, before | after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Repository, five files | 5,689 | 5,553 | 498 | 438 | 3,778 | 2,727 |
| Repository, chain | 9,531 | 9,383 | 483 | 736 | 1,540 | 3,025 |
| Estate, five files | 165 | 164 | 48 | 39 | 390 | 360 |
| Estate, chain | 91 | 79 | 17 | 24 | 50 | 86 |

The ordering counts straight segments between places in its own index space, where every card is one unit tall; the deck counts the drawn curves, lanes and cables in pixels, where a card of twenty rows is ten times taller than one of two. An ordering that measures heights in rows rather than cards is the next step the chain numbers ask for, if the owner's eye agrees that the chain pictures lost something.
