# tests/e2e/local-map-path.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-path.spec.ts
- Generated At: 2026-10-01T20:59:22.106Z

## Authored
### Purpose

Playwright over the estate sample's Local Map path mode: asked with the dependent first, the map draws nothing and offers the reverse question as a link; the reverse draws with every wire leaving a blue pin and entering a green one, left to right, and the still-picture instrument reads none backward; Clear returns to the selected file to the pixel, with its wires and its address; a path asked in the map's direction, or given in the address, draws at once; a direct dependency asked the wrong way round is offered, and two unconnected files get no path either way.

### Notes

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
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.boxOf`](./still-picture.ts.mdmd.md#symbol-boxof)
- [`still-picture.centerDistance`](./still-picture.ts.mdmd.md#symbol-centerdistance)
- [`still-picture.displayNames`](./still-picture.ts.mdmd.md#symbol-displaynames)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.readPicture`](./still-picture.ts.mdmd.md#symbol-readpicture)
- [`still-picture.scoreExpanded`](./still-picture.ts.mdmd.md#symbol-scoreexpanded)
- [`still-picture.symbolCounts`](./still-picture.ts.mdmd.md#symbol-symbolcounts)
<!-- LIVE-DOC:END Dependencies -->
