# tests/e2e/spatial-legend.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/spatial-legend.spec.ts
- Generated At: 2026-11-16T20:47:29.221Z

## Authored
### Purpose
Checks that the Local Map's legend describes the rendered representation and actual filtered graph, including explicit retention that overrides a general filter. The spatial key's colour samples are compared with the rendered node materials; the 2D key keeps its offer/use meanings, and neither key appears in other views.

### Notes
Written after the root's visual acceptance of the compact key during the [October 24 Connections review](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-24/2026-10-24.1.record.md#turn-12). The small history sample provides a real test file and document citations: hiding tests must retain the Test key while a test is pinned, releasing it must remove both node and key, and an enabled document filter with no matching data must not invent a key. The estate exercises representation and view changes without a repository-sized simulation.

The colour comparison reads CSS pseudo-element paint and Three's native node material independently, rather than asserting against the same shared palette that produces both. The scene observer supplies evidence that the retained test and citation wires actually exist or leave; checking labels alone could accept a legend that described an undrawn graph.

Since 2026-10-31 (discovery, [Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-4)) pins fade nothing, since the picture holds only what they reach, so the history sample's rows carry no Faded row; the estate's subject ends in a frontier, so its rows carry the Dimmed row.

Since the far bands' round (2026-11-07, the root's fourth review) the 2D legend holds a sixth row, "Width: references", which it displays only at the overview band, whose gathered wires it explains; the case reads the rows shown at the 2D map's arrival, the five as before, and that the sixth is hidden there. `local-map-overview.spec.ts` holds the row at the overview band.

Since 2026-11-16 ([Turn 10 of the November 15 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-10)) the rows are read by their words, `.legend-word`, and the cases above read the new ones, a change of wording and nothing else: the 2D arrival shows *Offers*, *Uses*, *Test-backed*; the 3D rows are the kinds, *Symbols*, *References*, *Beyond*, *More connected*, *Wrapped group*, *Directory shell*, and *Cites* and *Cited by* for the documents. Three cases are new. The rule, read from the page at each of the 2D map's three looks and over the 3D rows: every word a row draws stands beside a sample, they are two at most (one for each kind in the kinds' row), and the row's `title` is a sentence that is also its description; the 2D kinds' row is compared with the colours of the cells the picture draws at that look. That row's absence where the cells are one grey or a closed directory is a plain box. And the design audit over the key's words in both maps, at the sidebar's one width in a wide and a narrow window, which ends by squeezing the panel to show that the audit sees those words. On the bundle of `d54755f1` all five cases fail.

Since 2026-11-17 ([the third run of the gate, November 16 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#the-third-run-of-the-gate)) the audit of the key's words at the overview look opens the client's directories and not `scripts`: the key lists the kinds only where cells are drawn in their colours, and `scripts` draws none zoomed out since `scripts/contact-sheet` joined it (its name takes two lines, and the row of cells is drawn in every sibling or in none). The floor of five words fails the case if the client's directories lose their cells too.

Since 2026-11-18 the estate's 3D key under Skin has no More connected row, since no sphere wears a ring while a wrapper is on; the row and its description are checked with the wrappers Off, where the ring remains the picture's only sign of more, and the key's words are audited over six rows ([Turn 12 of the November 16 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-16/2026-11-16.1.record.md#turn-12)).

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
- [`forceGraphAppearance.spatialNodeStyles`](../../packages/explorer/src/client/views/forceGraphAppearance.ts.mdmd.md#symbol-spatialnodestyles)
- [`forceGraphBatches.SpatialDrawEntry`](../../packages/explorer/src/client/views/forceGraphBatches.ts.mdmd.md#symbol-spatialdrawentry) (type-only)
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- `three` - `InstancedMesh`, `MeshLambertMaterial`, `Scene` (type-only)
<!-- LIVE-DOC:END Dependencies -->
