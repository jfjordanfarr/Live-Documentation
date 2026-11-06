# tests/e2e/perspective-zoom.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/perspective-zoom.spec.ts
- Generated At: 2026-10-31T22:13:32.928Z

## Authored
### Purpose
Exercises layered file/symbol pins, explicit perspective changes with scrolling confined to the active view and a long route across the two native file perspectives.

### Notes
Browser journeys verify transient hover under whole-file pins, narrowing to one symbol with its explicit Pin control, restoration of the whole-file pin when its last symbol is released, a populated intermediate projection, and the ordered thirteen-file estate path through a round trip. Row highlighting records retention by either the file or symbol, while the symbol button's pressed state identifies a direct symbol pin.
- The thirteen-file path is opened by an address that pins its start and names its end (2026-10-14).
- At 1280×800 the same long route must expose its result in 3D, truthfully qualify omitted opposing references as a 2D distinction, and reveal every focused file button and its outline through horizontal scrolling. Enter on the last hop reads it without changing the subject, pins or destination, and returning to 2D retains the ordered route and constrained symbol rows. The full-button visibility assertion catches intermediate hops that native Tab leaves partially clipped, even when later Tab stops eventually reveal the final endpoint; a separate geometric assertion keeps the focus outline inside the strip's clipping edges.
- This long journey allows one minute overall. In the October 24 software-rendered run with trace snapshots, it reached the thirteenth button as the original thirty-second budget expired; all preceding focus and outline assertions had passed. Every stop remains checked while the full graph unfolds, without skipping the last inspection or return journey.
- Waits for the picture to rest (`localMapSettled`) after the clicks it measures after, since a change of pins moves the branch picture from one arrangement to the next (2026-10-07).
- A transition copy must retain every computed SVG declaration while removing live identifiers and inline hooks. The check includes a custom property containing quoted punctuation and uses the browser's original per-property CSSOM normalization as its reference, so aliases that change spelling when assigned do not require exclusions. The copied layer remains inert and hidden from the accessibility tree.

Since 2026-10-31 (discovery, [Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)) the bridge into 3D carries the picture's first piece, the subject with its first hop, which the check computes with the shared scope; before, the whole picture's first three hundred spheres.

Since [2026-11-05](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-8) the gathering case installs its frame sampler before the click and records from the layer's first frame to its last, reading the wire and pair counts from the first: installed after four round trips to a page busy drawing the transition, it had missed the fold window entirely once in a full run. It now sees every frame the page draws, and passed five runs in a row at 7.7 s.

Since [Turn 12](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-12--november-6) the SVG-copy case compares declarations without the map's zoom state (the ladder's custom properties), which every element inherits and which changes between a live reading and the copy's moment.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `expect`, `test`
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`forceGraphData.spatialGraphOf`](../../packages/explorer/src/client/views/forceGraphData.ts.mdmd.md#symbol-spatialgraphof)
- [`forceGraphLayout.linkPulls`](../../packages/explorer/src/client/views/forceGraphLayout.ts.mdmd.md#symbol-linkpulls)
- [`forceGraphScope.spatialScope`](../../packages/explorer/src/client/views/forceGraphScope.ts.mdmd.md#symbol-spatialscope-function)
- [`retained-state.retainedKey`](../../packages/explorer/src/client/views/retained-state.ts.mdmd.md#symbol-retainedkey)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`search-bar.newestKey`](./search-bar.ts.mdmd.md#symbol-newestkey)
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
- [`still-picture.loadGraph`](./still-picture.ts.mdmd.md#symbol-loadgraph)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
