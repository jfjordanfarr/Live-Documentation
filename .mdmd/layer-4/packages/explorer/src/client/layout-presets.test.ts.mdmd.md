# packages/explorer/src/client/layout-presets.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/layout-presets.test.ts
- Generated At: 2026-10-13T19:38:15.656Z

## Authored
### Purpose
Verifies that shared packing presets preserve independent visual encodings and survive portable-state round trips.

### Notes
Cases distinguish packing edits from coupling/size edits, verify both representations change together without mutating prior settings, and exercise malformed values, slider increments, legacy links and the related-documentation filter.

Created for [the October 13 shared-preset implementation](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-presets.applyLayoutPreset`](./layout-presets.ts.mdmd.md#symbol-applylayoutpreset)
- [`layout-presets.applyLayoutSettings`](./layout-presets.ts.mdmd.md#symbol-applylayoutsettings)
- [`layout-presets.layoutPresetOf`](./layout-presets.ts.mdmd.md#symbol-layoutpresetof)
- [`layout-presets.layoutSettingsOf`](./layout-presets.ts.mdmd.md#symbol-layoutsettingsof)
- [`layout-presets.readLayoutSettings`](./layout-presets.ts.mdmd.md#symbol-readlayoutsettings)
- [`compressed-url-state.DEFAULT_SNAPSHOT`](./persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](./persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](./persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.getDefaultTuning`](./persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
