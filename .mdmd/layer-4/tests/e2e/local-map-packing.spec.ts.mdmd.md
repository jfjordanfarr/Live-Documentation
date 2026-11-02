# tests/e2e/local-map-packing.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/local-map-packing.spec.ts
- Generated At: 2026-11-02T18:46:08.818Z

## Authored
### Purpose
Keeps the packing journeys coherent through advanced edits, sharing, exports and motion in both representations: a packing change through its levers preserves every file, symbol and reference of the picture, keeps the selected file in place through the motion it causes, and survives export and a fresh page.

### Notes
Runs the same interactions on the repository and estate, preserves visible file/symbol/reference identities, checks coupling and size survive packing changes, and reloads exported/shared settings into a fresh browser context. Motion samples enforce the existing subject-anchor tolerance. A zero-duration estate layout checks actual SVG endpoints against their current pins, guarding the stale-wire defect found during visual tuning.

Until 2026-11-02 this was `local-map-presets.spec.ts` and the packing change it exercised was the Compact and Relaxed buttons of the toolbar; the owner found that toggle "surprisingly unuseful" and gave its place to the Whole toggle ([Turn 4 of the November 2 record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-02.1.record.md#turn-4)), so the spec moves the same packing levers (the 2D item and column gaps, the 3D gap between connected spheres) by their input events, to the values the presets held, and checks the same contracts. The preset values remain the levers' defaults and the layout lab's `--preset`.

The October 24 journey also changes wire thickness and independent node/wire zoom resistance, then checks those appearance choices survive packing changes, export and sharing, following the owner's [resistance request](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11).

The publisher page closes after its export and share URL are captured. The recipient must stand alone, and an unneeded source WebGL simulation should not compete with its work. Both pages contribute browser errors to the same assertion; no sharing, export or round-trip check is skipped.

Created for [the October 13 shared-preset implementation](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

The journey over this repository takes about 27 seconds on one worker and ran to 32 once, so since 2026-10-19 it declares a minute; the motion test, 48 to 53 seconds of the minute it had declared, with the 3D settle at 20 of its 25-second wait, declares two minutes and a minute's wait. A test at nine tenths of its budget fails whenever the box is used beside it ([Turn 12 of the October 17 session](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-12)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- `node:fs/promises`
- [`layout-presets.LAYOUT_PRESETS`](../../packages/explorer/src/client/layout-presets.ts.mdmd.md#symbol-layout_presets)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`design-audit.describeFaults`](./design-audit.ts.mdmd.md#symbol-describefaults)
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`scopes.DECK_SCOPES`](./scopes.ts.mdmd.md#symbol-deck_scopes)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
