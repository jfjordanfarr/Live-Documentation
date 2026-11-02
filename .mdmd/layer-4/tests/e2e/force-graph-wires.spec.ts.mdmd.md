# tests/e2e/force-graph-wires.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-wires.spec.ts
- Generated At: 2026-10-31T15:24:51.311Z

## Authored
### Purpose
Check the 3D Local Map's reference-weighted wires and independent size-resistance controls through real browser interaction and actual rendered pixels.

### Notes
Created after the [October 24 visual comparison](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-9) established that a world-space thickness looked acceptable at one zoom and wrong at another. The owner then requested [independent continuous resistance](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11). Interaction checks preserve camera, physical positions and idle layout while appearance changes. Raster checks isolate a real graph wire through its existing scene hooks and read WebGL pixels immediately after drawing, so a correct width accessor cannot disguise an incorrect shader. Explicit test settings distinguish ordinary perspective and compensation at the orbit-target plane from the visually tuned defaults. The November 2 correction verifies invariant world-space bodies and wire endpoints during orbit, while depth still changes their apparent size. Pixel profiles use a shared full-coverage ink reference: normalizing each thin stroke to its own antialiased peak incorrectly made a one-pixel stroke split across two rows measure two pixels wide.

The initial draft's 25-second wait was not a performance contract and failed before the sizing assertions. An actual original-renderer comparison also took 36.95 seconds on the software GPU. The functional journey therefore allows a minute to settle and two minutes overall, like the existing preset motion journey; the [October 24 performance investigation](../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/README.md#correctness-and-performance-findings) separately records rendering costs. No pixel, identity, position, camera or interaction assertion is relaxed.

Two checks joined on 2026-10-30 with the remediation's wires pass ([Turn 3 of the October 30 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)): one reads each reference wire's forward and backward counts against its total, its ends on the two spheres' drawn surfaces at node resistance 0, and hovers a stroke clear of every sphere to read the words that say which file uses which; the other reads a path's wires at full strength and double width and the key's Path row. The colour that ran along a wire by its directions was withdrawn on 2026-10-31 at the owner's eye ([Turn 1 of the October 31 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-1)), so the first check now reads every reference wire's uploaded colour as white and the key without a direction row, where before it read the shader's flow number.

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
- [`force-graph-observation.clearStroke`](./force-graph-observation.ts.mdmd.md#symbol-clearstroke)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.referenceWire`](./force-graph-observation.ts.mdmd.md#symbol-referencewire)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
- `three` - `Camera`, `InstancedMesh`, `PerspectiveCamera`, `Scene`, `Vector3`, `WebGLRenderer` (type-only)
<!-- LIVE-DOC:END Dependencies -->
