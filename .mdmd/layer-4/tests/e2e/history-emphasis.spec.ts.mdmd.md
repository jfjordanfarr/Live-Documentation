# tests/e2e/history-emphasis.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/history-emphasis.spec.ts
- Generated At: 2026-11-18T22:28:23.389Z

## Authored
### Purpose
Shows in the browser that, at a step of the history, the files the step changed glow or the rest dim by Tuning's Changed Files, inside the wrappers too, that today's picture carries no emphasis, and that the speed control beside play is Tuning's Play Rate, remembered and never lying about a rate set elsewhere.

### Notes
Written on 2026-10-31 for the owner's ask in [Turn 8 of the October 31 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-31/2026-10-31.1.record.md#turn-8), over the scripted history sample's step "Retire the legacy helper", found by its subject in the bundle's own history file, where main.ts lost a wire and a document link and util.ts changed nothing. The colours are read from the instance buffer as the key's spec reads them; the emphasis mode is seeded through the persisted settings before the page loads.

Since 2026-11-11 ([Turn 6 of the November 10 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-10/2026-11-10.1.record.md#turn-6)) five cases read what the skins show within them over the same sample, from the uploaded unit buffers (`spatialOpacity`, `spatialLit`, the instance colour) and the skins' own `wrapperLit` and `wrapperAlpha`. In the Structure layout with nothing pinned, `src` is a bubble whose balloons `src/app` and `src/engine` hold two dots each: under Glow main.ts's dot is white at the spheres' alpha while util.ts's keeps its kind's colour, neither balloon nor the skin is lit, the next step moves the light, and closing the history restores every unit; at "Rewrite the big helper as a huge one" the deleted lib/big.ts, which has no dot, lights `lib`'s skin; under Dim an unchanged dot falls to 0.15, a balloon holding nothing to 0.2 and `lib`'s skin to 0.2 at a step that touches nothing in it; under None nothing within a skin is lit or dimmed; and in the Connections layout a changed file's dot inside the island wrapped about main.ts is white, while main.ts, the seed, glows as a sphere and is never a dot. Each case failed against the build before the change. Two more read veils over the veiling sample (`VEIL_SCRIPT`, `samples/history-veil`): a change inside a veiled bubble lights that balloon instance and none of its veiled siblings, and a body veiled whole lights for a change in it while the body beside it does not; both failed under a deliberate break that lit the skin instead ([the evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-10/Screenshots/history-bubbles/README.md)).

Since 2026-11-18, when marbles became the default ([Turn 13 of the November 17 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-13)), the cases run on that default and read each file's base colour as that file's own at the moment shown, from a second visitor at the same address with Changed Files at None (`ownColours`); until then an unchanged file of the same kind stood for it, which a marble's own veins no longer allow. They also read, from the veins' instance attribute, that Glow's white replaces the changed file's marble and the next step gives it back, and that Dim keeps every marble, for spheres and for the dots within the skins.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Browser`, `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`forceGraphBatches.SpatialDrawEntry`](../../packages/explorer/src/client/views/forceGraphBatches.ts.mdmd.md#symbol-spatialdrawentry) (type-only)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- `three` - `InstancedMesh`, `MeshLambertMaterial`, `Scene` (type-only)
<!-- LIVE-DOC:END Dependencies -->
