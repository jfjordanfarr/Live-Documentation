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
