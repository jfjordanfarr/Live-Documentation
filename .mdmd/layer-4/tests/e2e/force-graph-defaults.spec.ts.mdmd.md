# tests/e2e/force-graph-defaults.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-defaults.spec.ts
- Generated At: 2026-11-08T18:31:07.887Z

## Authored
### Purpose

Protects the Explorer's fresh Skin and one-hop defaults in both 3D layouts, while preserving sparse saved tuning, explicit Off/two-hop preferences and shared-link precedence.

### Notes

Current browser regressions, introduced November 8, 2026 to deliver the owner's [November 7 choice, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/Summarized/2026-11-07.1.SUMMARIZED.md#turn-2). The suite begins without the usual saved search preference. Fresh arrivals check the actual skin mesh and contained file instances alongside the controls; saved values are seeded once so reload reads the application's subsequent write. Shared links override opposing saved choices in both directions, and a link without layout settings retains explicit saved Off and two hops. Unit tests cover malformed values and sparse merging independently.

The directory-only Portal round trip verifies all six travelling directory identities in both directions, mapping four to their canonical sole files and two to cell hubs. Its compositor reads the uploaded hull vertices, instance matrices and kind colors independently of the production projector: Models must carry its true contour and colored file marks. Once fold and the 3D background are gone, this fixture has no source 2D wire pairs and the transition canvas must be transparent; graph-only wires must not linger over the returning cards.

Since 2026-11-18 the round trip stops the page's clock before it presses 3D or 2D and steps it a frame at a time until the transition's layer stands. Before, it stopped the clock only once the layer had been seen, and whatever real time the machine spent between the transition's start and that pause was already spent of the transition: the return's first phase is inspected at 0.2 of 1,400 ms, 280 ms, and the case's own guard ("the measured transition has not already passed the phase being inspected") refused at 0.20 to 0.31 in each of that day's three whole runs. Under one load, the case eight times at two workers: 4 failed before, none after ([the notes](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-evenings-gate-and-the-transition-cases-mend)).

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
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedBodyCarriers`](./force-graph-observation.ts.mdmd.md#symbol-renderedbodycarriers)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- `three` - `Scene` (type-only)
<!-- LIVE-DOC:END Dependencies -->
