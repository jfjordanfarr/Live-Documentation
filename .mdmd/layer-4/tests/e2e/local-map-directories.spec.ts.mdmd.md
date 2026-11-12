# tests/e2e/local-map-directories.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-directories.spec.ts
- Generated At: 2026-11-12T22:02:54.114Z

## Authored
### Purpose
Checks directory disclosure in the Local Map: entry by directory, explicit Open/Close controls, animated box-to-membrane changes, independent child openings, keyboard access and closed boxes without wires.

### Notes
Written for the [October 8 directory disclosure design](../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08). The tests cover an unpinned directory's compact cards and closed boxes, its share-link round trip, a membrane growing from its box while the label stays near the original position, unchanged wires when more contents are disclosed, and pins preserving their required enclosure when a directory closes. Keyboard Open/Close must preserve an independently opened child.

The tests activate Open and Pin controls explicitly: names now inspect under the grammar accepted in [October 19, Turn 24](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24) and implemented in the [October 20 continuation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). The text audit of `design-audit.ts` checks the opened pictures. Controls outside the frame in the wide geometry case receive dispatched element clicks; that case measures disclosure geometry, while the in-frame and keyboard cases exercise normal activation.
- The box-opening test also asserts the reveal's count (2026-10-16): `graph.ts` reads "+N symbols" with N its public rows only, and `graph.test.ts`, which has no public symbol, shows no reveal.

Three cases were added on 2026-11-12 for the directory flow trial (Tuning's Opened Directory, a trial beside the grid): with Flow, a directory's files stand in the order of use with one line for each pair, its boxes level above its files, its line-less files after the last joined one, and each card's count and lines adding up to what the grid's card counted; a card's hover or focus lights its lines and fades the rest with nothing moved or added; and the choice travels in the page's link while a link made with it off carries nothing of it. Each fails on the build before the trial: no line is drawn there and Tuning has no such control. The trial's pictures and numbers are in [its evidence](../../../../AI-Agent-Workspace/Screenshots/2026-11-12/directory-flow-trial/README.md).

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
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`still-picture.LOCAL_MAP`](./still-picture.ts.mdmd.md#symbol-local_map)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
