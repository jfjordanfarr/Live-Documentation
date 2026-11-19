# tests/e2e/others.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/others.spec.ts
- Generated At: 2026-11-19T06:20:01.084Z

## Authored
### Purpose
Exercises Fold others away and Unpin others as browser journeys: each offered in the menu of the thing kept (a 2D card, a symbol row, a 3D sphere, a pin tray entry's More) only when it would release something, what each leaves, one step of the browser history that Back takes back, the words said once in the page's status region, and the keyboard's focus staying on the control used. It also opens a popped 3D group's file menu and wraps the group again from there.

### Notes
Written on 2026-11-19 for the owner's ask, "I'd really like to have a "Unpin others" interaction", at [Turn 31 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-31), widened to two strengths and "Wrap this group again" at [Turn 33](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-33). What each strength releases is decided by `releaseOthers` and tested there case by case; these journeys check that the surfaces call it and that history, words, focus and the camera agree. The 2D cases use the rosetta fixture of the main bundle; the 3D cases the estate sample. The 3D menu is opened from the subject's own name, which always stands, since another file's name may give way in the label placement. The card case asserts that the card kept stays under the hand within 2 px: before the frame of a pin's change was used, the map centred its new subject and the card moved some 470 px.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Locator`, `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.UrlStateSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`retained-state.retainedKey`](../../packages/explorer/src/client/views/retained-state.ts.mdmd.md#symbol-retainedkey)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.panIntoView`](./still-picture.ts.mdmd.md#symbol-panintoview)
<!-- LIVE-DOC:END Dependencies -->
