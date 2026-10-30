# tests/e2e/force-graph-wires.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-wires.spec.ts
- Generated At: 2026-10-30T15:43:50.711Z

## Authored
### Purpose
Check the 3D Local Map's reference-weighted wires and independent size-resistance controls through real browser interaction and actual rendered pixels.

### Notes
Created after the [October 24 visual comparison](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-9) established that a world-space thickness looked acceptable at one zoom and wrong at another. The owner then requested [independent continuous resistance](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11). Interaction checks preserve camera, physical positions and idle layout while appearance changes. Raster checks isolate a real graph wire through its existing scene hooks and read WebGL pixels immediately after drawing, so a correct width accessor cannot disguise an incorrect shader. Explicit test settings distinguish the perspective/invariant contracts from the visually tuned defaults.

The initial draft's 25-second wait was not a performance contract and failed before the sizing assertions. An actual original-renderer comparison also took 36.95 seconds on the software GPU. The functional journey therefore allows a minute to settle and two minutes overall, like the existing preset motion journey; the [October 24 performance investigation](../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/README.md#correctness-and-performance-findings) separately records rendering costs. No pixel, identity, position, camera or interaction assertion is relaxed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Locator`, `Page`, `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
- `three` - `Camera`, `InstancedMesh`, `PerspectiveCamera`, `Scene`, `Vector3`, `WebGLRenderer` (type-only)
<!-- LIVE-DOC:END Dependencies -->
