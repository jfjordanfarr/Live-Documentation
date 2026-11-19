# `tests/e2e/tuning-reset.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/tuning-reset.spec.ts`
- Generated At: 2026-11-19T21:10:24.490Z

## Authored
### Purpose
Checks Tuning's Reset to defaults in the built page: the count beside the heading with the section folded, the dot on each changed lever and its groups, the reset through every path a lever's change takes, the second press that puts the settings back, and what a reload and a shared link show afterwards.

### Notes
- Written on 2026-11-19 with the reset, for the owner's request that the links the agent sends be "perceived by both of us in the same way" ([Turn 27 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-27); [the Explorer design](../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences), "Reset to defaults").
- Each case seeds the viewer's saved settings once per tab, in place of the suite's (which turns the continuing search off), so that a reload reads what the page itself saved. The first case's four changes are that search and three levers in three groups.
- The third case reads the address after the reset: a link always carries the layout's settings, so the check is that they are the defaults, not that they are absent. A link that names a choice then still opens in it, counted while shown, and the viewer's saved settings stay empty.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`layout-presets.layoutSettingsOf`](../../packages/explorer/src/client/layout-presets.ts.mdmd.md#symbol-layoutsettingsof)
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
<!-- LIVE-DOC:END Dependencies -->
