# `packages/explorer/src/client/layout-presets.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/layout-presets.test.ts`
- Generated At: 2026-11-19T21:10:13.603Z

## Authored
### Purpose
Verifies that shared packing presets preserve independent visual encodings and survive portable-state round trips.

### Notes
Cases distinguish packing edits from coupling/size edits, verify both representations change together without mutating prior settings, and exercise malformed values, slider increments, legacy links and the related-documentation filter.

Created for [the October 13 shared-preset implementation](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-13/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

Since 2026-11-15 ([Turn 1 of the November 15 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) a case holds that a link carries Descriptions Zoomed Out only when it is not Hidden, and that a link without it opens Hidden.

Since 2026-11-18 a case holds Beyond the Hops: carried only at the next step, dropped when unknown, and read as everything from a link that carries the 3D settings without it ([Turn 10 of the November 18 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-10)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-presets.applyLayoutPreset`](./layout-presets.ts.mdmd.md#symbol-applylayoutpreset)
- [`layout-presets.applyLayoutSettings`](./layout-presets.ts.mdmd.md#symbol-applylayoutsettings)
- [`layout-presets.layoutSettingsOf`](./layout-presets.ts.mdmd.md#symbol-layoutsettingsof)
- [`layout-presets.readLayoutSettings`](./layout-presets.ts.mdmd.md#symbol-readlayoutsettings)
- [`compressed-url-state.DEFAULT_SNAPSHOT`](./persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](./persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](./persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.getDefaultTuning`](./persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
