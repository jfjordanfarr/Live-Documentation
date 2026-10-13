# packages/explorer/src/client/persistence/local-storage.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/persistence/local-storage.test.ts
- Generated At: 2026-10-13T16:52:34.336Z

## Authored
### Purpose

Protects saved layout preferences as new tuning fields are introduced and malformed stored values are encountered.

### Notes

An older saved configuration receives the current simplicity default without losing its independent evenness and row-alignment settings. Explicit zero and endpoint values survive restoration; nonnumeric and nonfinite JSON values fall back to defaults. The tests exercise the storage reader and application of persisted state together, without a DOM simulation.

Created for the owner’s October 13, 2026 request to tune aesthetic preferences within the existing competition: [the originating discussion](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.PERSISTED_UI_KEY`](./local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.applyPersistedUi`](./local-storage.ts.mdmd.md#symbol-applypersistedui)
- [`local-storage.getDefaultFilters`](./local-storage.ts.mdmd.md#symbol-getdefaultfilters)
- [`local-storage.getDefaultTuning`](./local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`local-storage.readPersistedUi`](./local-storage.ts.mdmd.md#symbol-readpersistedui)
- `vitest` - `afterEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
