# `tests/e2e/return-cost.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/return-cost.spec.ts`
- Generated At: 2026-11-19T21:10:23.710Z

## Authored
### Purpose
Holds the continuing search's cycle trials to their promise in the page: a picture with a cycle arrives in the greedy order and, with the search on, moves once to the cheaper order, the 3D button's cue and the cards' feet following; with the search off it stays as first drawn; and a link that names a Return Cost reopens the picture the search makes at it, Tuning showing the cost.

### Notes
Written on 2026-11-16 with the lever and rewritten the same day when the choice moved to the search ([Turn 5 of the November 15 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-5)). `adapters/manifest.ts` opened alone is the subject: its greedy order draws one returning connection, and returning fewer stands every adapter in one column and draws none, which the search adopts from a Return Cost of about 1,175 px on real card sizes (the lab's measurement), so at the default of 1500 and not at 500. A recorder in the page keeps every count the overlay shows, so the arrival in the greedy order and the one move are read from the counts themselves. The cases failed on `main`'s page, which tries no cycle's order. The same day the first two cases came to read which endpoints the search's cached rows hold: the first draw measures only the endpoints of the wires it draws, and the search measures a returning reference's when it first tries a cycle's order, so that a first draw does not pay for what only the search needs.

Since 2026-11-20 the manifest's returnless order is the cheaper picture at any Return Cost, nought included: the manifest and its adapters came to read their source through `tooling/sourceText.ts`, and that card changed the wires. The first two cases still read the move and the first draw there; the link's case reads the cost on the Rosetta C# program's `Models/ModelFactory.cs` and `Models/Record.cs`, whose other order returns one reference where the greedy order returns two and spends some 1,800 px more wire, so that a link naming 500 keeps the greedy order and one naming 4,000 moves. It goes red when the search is made to ignore the link's cost ([the measurements](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/landing-reds/README.md#return-cost-on-adaptersmanifestts)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`cycle-order.DEFAULT_RETURN_COST`](../../packages/explorer/src/client/views/localView/cycle-order.ts.mdmd.md#symbol-default_return_cost)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->
