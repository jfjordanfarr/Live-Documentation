# packages/explorer/src/client/persistence/local-storage.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/persistence/local-storage.test.ts
- Generated At: 2026-10-22T02:20:01.918Z

## Authored
### Purpose

Protects saved layout and history preferences, and remembered navigation that keeps the map subject separate from open evidence. Exercises older and malformed stored values without replacing valid preferences or exploration context.

### Notes

An older saved configuration receives the current simplicity default without losing its independent evenness and row-alignment settings. Explicit zero and endpoint values survive restoration; nonnumeric and nonfinite JSON values fall back to defaults. The tests exercise the storage reader and application of persisted state together, without a DOM simulation.

History tuning cases preserve valid axis, granularity and play-rate choices while supplying defaults only for absent or invalid fields. Navigation cases exercise the real debounce scheduler with controlled storage and timers: inspecting B preserves subject A, closing stores null, old entries leave the reader closed, and a bundled section or scan-root target survives restoration. Membership checks use the production snapshot scrubber so a removed target cannot displace a surviving subject.

Created for the owner’s October 13, 2026 request to tune aesthetic preferences within the existing competition: [the originating discussion](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

The navigation cases support the [October 20 inspection-state implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). They complement the original tuning suites; browser motion and focus are verified separately.

Since 2026-10-22 ([Turn 10 of the October 21 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-10)) the history's default axis is by date, and three cases hold the saving rule: nothing to save at the defaults and only the differing settings otherwise; the scheduler writing only the changes, so that a later default reaches what was never touched; and a version 1 entry removed unread.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compressed-url-state.DEFAULT_SNAPSHOT`](./compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.scrubSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-scrubsnapshot)
- [`local-storage.PERSISTED_NAV_KEY`](./local-storage.ts.mdmd.md#symbol-persisted_nav_key)
- [`local-storage.PERSISTED_UI_KEY`](./local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](./local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`local-storage.applyPersistedUi`](./local-storage.ts.mdmd.md#symbol-applypersistedui)
- [`local-storage.changedFromDefaults`](./local-storage.ts.mdmd.md#symbol-changedfromdefaults)
- [`local-storage.createPersistNavScheduler`](./local-storage.ts.mdmd.md#symbol-createpersistnavscheduler)
- [`local-storage.createPersistUiScheduler`](./local-storage.ts.mdmd.md#symbol-createpersistuischeduler)
- [`local-storage.getDefaultFilters`](./local-storage.ts.mdmd.md#symbol-getdefaultfilters)
- [`local-storage.getDefaultTuning`](./local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`local-storage.readPersistedNav`](./local-storage.ts.mdmd.md#symbol-readpersistednav)
- [`local-storage.readPersistedUi`](./local-storage.ts.mdmd.md#symbol-readpersistedui)
- [`types.InspectionTarget`](../types.ts.mdmd.md#symbol-inspectiontarget) (type-only)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
