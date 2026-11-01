# tests/e2e/history-emphasis.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/history-emphasis.spec.ts
- Generated At: 2026-10-31T20:07:06.884Z

## Authored
### Purpose
Shows in the browser that, at a step of the history, the files the step changed glow or the rest dim by Tuning's Changed Files, that today's picture carries no emphasis, and that the speed control beside play is Tuning's Play Rate, remembered and never lying about a rate set elsewhere.

### Notes
Written on 2026-10-31 for the owner's ask in [Turn 8 of the October 31 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-8), over the scripted history sample's step "Retire the legacy helper", found by its subject in the bundle's own history file, where main.ts lost a wire and a document link and util.ts changed nothing. The colours are read from the instance buffer as the key's spec reads them; the emphasis mode is seeded through the persisted settings before the page loads.

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
- [`forceGraphBatches.SpatialDrawEntry`](../../packages/explorer/src/client/views/forceGraphBatches.ts.mdmd.md#symbol-spatialdrawentry) (type-only)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- `three` - `InstancedMesh`, `MeshLambertMaterial`, `Scene` (type-only)
<!-- LIVE-DOC:END Dependencies -->
