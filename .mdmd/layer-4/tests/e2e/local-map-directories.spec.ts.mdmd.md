# tests/e2e/local-map-directories.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-directories.spec.ts
- Generated At: 2026-10-08T01:58:15.857Z

## Authored
### Purpose
Checks directory disclosure in the Local Map: entry by directory, explicit Open/Close controls, animated box-to-membrane changes, independent child openings, keyboard access and closed boxes without wires.

### Notes
Written for the [October 8 directory disclosure design](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08). The tests cover an unpinned directory's compact cards and closed boxes, its share-link round trip, a membrane growing from its box while the label stays near the original position, unchanged wires when more contents are disclosed, and pins preserving their required enclosure when a directory closes. Keyboard Open/Close must preserve an independently opened child.

The tests activate Open and Pin controls explicitly: names now inspect under the grammar accepted in [October 19, Turn 24](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24) and implemented in the [October 20 continuation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). The text audit of `design-audit.ts` checks the opened pictures. Controls outside the frame in the wide geometry case receive dispatched element clicks; that case measures disclosure geometry, while the in-frame and keyboard cases exercise normal activation.
- The box-opening test also asserts the reveal's count (2026-10-16): `graph.ts` reads "+N symbols" with N its public rows only, and `graph.test.ts`, which has no public symbol, shows no reveal.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
