# tests/e2e/local-map-path.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-path.spec.ts
- Generated At: 2026-10-14T19:09:48.723Z

## Authored
### Purpose

Playwright over the estate sample's Local Map path mode, asked through the search bar: choosing the subject pins it and the destination field appears; asked with the dependent first, the map draws nothing and offers the reverse question as a link whose address pins the destination and asks the way back; taking it pins the destination, newest, and draws with every wire leaving a blue pin and entering a green one, left to right, which the still-picture instrument reads the same; clearing the destination returns to the exploration with both pins; a path asked in the map's direction, or given in the address, draws at once; a direct dependency asked the wrong way round is offered, two unconnected files get no path either way, and a directory is an end of a path; the subject field follows the newest pin and a new subject chosen in the bar asks again from it; and pinning a hop's symbol leaves the path and forgets the destination.

### Notes

Also checks direct links over this repository and the estate: directory-aware layout before any pin, and the same neighborhood after retaining the selected file. Paths from the bar and an address use the same placed scene, including their intermediate directories.

- Rewritten through the search bar on 2026-10-14 ([Turn 6](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)); the test that Clear returned the selected file to the pixel became a return to the exploration, since the reverse question now pins the destination and the picture after it holds both files.
- Written on [2026-10-01](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10), after the fix was played by eye on both bundles, as the rule says: the tests keep what the eye accepted. The estate's chain `GatewayClient.cs` to `PaymentsController.cs` to `HubProxy.cs` to `IPaymentHub.cs` runs from the file that depends to the file depended on, so asking it that way round is the case the owner's rule of 2025-12-18 refuses.
- Each wire's two ends are read in screen coordinates and matched to the nearest pin within 12 px, so the test checks the grammar on the picture, not on the data that drew it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`retained-state.describeRetained`](../../packages/explorer/src/client/views/retained-state.ts.mdmd.md#symbol-describeretained)
- [`retained-state.retainedItems`](../../packages/explorer/src/client/views/retained-state.ts.mdmd.md#symbol-retaineditems)
- [`retained-state.retainedKey`](../../packages/explorer/src/client/views/retained-state.ts.mdmd.md#symbol-retainedkey)
- [`search-bar.choose`](./search-bar.ts.mdmd.md#symbol-choose)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`search-bar.newestKey`](./search-bar.ts.mdmd.md#symbol-newestkey)
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.boxOf`](./still-picture.ts.mdmd.md#symbol-boxof)
- [`still-picture.centerDistance`](./still-picture.ts.mdmd.md#symbol-centerdistance)
- [`still-picture.displayNames`](./still-picture.ts.mdmd.md#symbol-displaynames)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.readPicture`](./still-picture.ts.mdmd.md#symbol-readpicture)
- [`still-picture.scoreExpanded`](./still-picture.ts.mdmd.md#symbol-scoreexpanded)
- [`still-picture.symbolCounts`](./still-picture.ts.mdmd.md#symbol-symbolcounts)
<!-- LIVE-DOC:END Dependencies -->
