# packages/scripts/src/live-docs/explorer/client/persistence/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/persistence/index.ts
- Generated At: 2026-09-28T00:41:38.148Z

## Authored
### Purpose
Barrel file that re-exports the persistence module's public API. Provides unified access to URL state and localStorage utilities for Explorer state management.

### Notes
Created during Dev Day 50 (12/19) as part of Phase 2 tech-debt reduction. Groups the `url-state.ts` and `local-storage.ts` exports under a single import path.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `viewNameToInternal` {#symbol-viewnametointernal}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L8)

#### `viewNameToUrl` {#symbol-viewnametourl}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L9)

#### `parseInitialState` {#symbol-parseinitialstate}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L10)

#### `updateUrlState` {#symbol-updateurlstate}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L11)

#### `InitialUrlState` {#symbol-initialurlstate}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L12)

#### `PERSISTED_UI_KEY` {#symbol-persisted_ui_key}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L17)

#### `PERSISTED_UI_VERSION` {#symbol-persisted_ui_version}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L18)

#### `PersistedUiV1` {#symbol-persisteduiv1}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L19)

#### `getDefaultFilters` {#symbol-getdefaultfilters}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L20)

#### `getDefaultTuning` {#symbol-getdefaulttuning}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L21)

#### `readPersistedUi` {#symbol-readpersistedui}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L22)

#### `applyPersistedUi` {#symbol-applypersistedui}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L23)

#### `createPersistUiScheduler` {#symbol-createpersistuischeduler}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L24)

#### `PersistUiScheduler` {#symbol-persistuischeduler}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L25)

#### `PERSISTED_NAV_KEY` {#symbol-persisted_nav_key}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L28)

#### `PERSISTED_NAV_VERSION` {#symbol-persisted_nav_version}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L29)

#### `PersistedNavV1` {#symbol-persistednavv1}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L30)

#### `readPersistedNav` {#symbol-readpersistednav}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L31)

#### `createPersistNavScheduler` {#symbol-createpersistnavscheduler}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L32)

#### `PersistNavScheduler` {#symbol-persistnavscheduler}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/index.ts#L33)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.PERSISTED_NAV_KEY`](./local-storage.ts.mdmd.md#symbol-persisted_nav_key) (re-export)
- [`local-storage.PERSISTED_NAV_VERSION`](./local-storage.ts.mdmd.md#symbol-persisted_nav_version) (re-export)
- [`local-storage.PERSISTED_UI_KEY`](./local-storage.ts.mdmd.md#symbol-persisted_ui_key) (re-export)
- [`local-storage.PERSISTED_UI_VERSION`](./local-storage.ts.mdmd.md#symbol-persisted_ui_version) (re-export)
- [`local-storage.PersistNavScheduler`](./local-storage.ts.mdmd.md#symbol-persistnavscheduler) (re-export)
- [`local-storage.PersistUiScheduler`](./local-storage.ts.mdmd.md#symbol-persistuischeduler) (re-export)
- [`local-storage.PersistedNavV1`](./local-storage.ts.mdmd.md#symbol-persistednavv1) (re-export)
- [`local-storage.PersistedUiV1`](./local-storage.ts.mdmd.md#symbol-persisteduiv1) (re-export)
- [`local-storage.applyPersistedUi`](./local-storage.ts.mdmd.md#symbol-applypersistedui) (re-export)
- [`local-storage.createPersistNavScheduler`](./local-storage.ts.mdmd.md#symbol-createpersistnavscheduler) (re-export)
- [`local-storage.createPersistUiScheduler`](./local-storage.ts.mdmd.md#symbol-createpersistuischeduler) (re-export)
- [`local-storage.getDefaultFilters`](./local-storage.ts.mdmd.md#symbol-getdefaultfilters) (re-export)
- [`local-storage.getDefaultTuning`](./local-storage.ts.mdmd.md#symbol-getdefaulttuning) (re-export)
- [`local-storage.readPersistedNav`](./local-storage.ts.mdmd.md#symbol-readpersistednav) (re-export)
- [`local-storage.readPersistedUi`](./local-storage.ts.mdmd.md#symbol-readpersistedui) (re-export)
- [`url-state.InitialUrlState`](./url-state.ts.mdmd.md#symbol-initialurlstate) (re-export)
- [`url-state.parseInitialState`](./url-state.ts.mdmd.md#symbol-parseinitialstate) (re-export)
- [`url-state.updateUrlState`](./url-state.ts.mdmd.md#symbol-updateurlstate) (re-export)
- [`url-state.viewNameToInternal`](./url-state.ts.mdmd.md#symbol-viewnametointernal) (re-export)
- [`url-state.viewNameToUrl`](./url-state.ts.mdmd.md#symbol-viewnametourl) (re-export)
<!-- LIVE-DOC:END Dependencies -->
