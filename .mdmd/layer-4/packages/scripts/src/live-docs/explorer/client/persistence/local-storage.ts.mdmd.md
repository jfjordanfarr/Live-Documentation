# packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-persistence-local-storage-ts
- Generated At: 2025-12-19T21:55:44.446Z

## Authored
### Purpose
Manages localStorage-based persistence for Explorer UI preferences and navigation history. Saves tuning panel settings, sidebar state, and recently visited nodes across browser sessions.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19). Uses debounced persistence via `schedulePersistUi()` and `schedulePersistNav()` to avoid excessive writes during rapid state changes.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:55:44.446Z","inputHash":"09f45cc6333bf3fe"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PERSISTED_UI_KEY` {#symbol-persisted_ui_key}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L14)

#### `PERSISTED_UI_VERSION` {#symbol-persisted_ui_version}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L15)

#### `PersistedUiV1` {#symbol-persisteduiv1}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L17)

#### `getDefaultFilters` {#symbol-getdefaultfilters}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L23)

#### `getDefaultTuning` {#symbol-getdefaulttuning}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L28)

#### `readPersistedUi` {#symbol-readpersistedui}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L70)

#### `applyPersistedUi` {#symbol-applypersistedui}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L170)

#### `PERSISTED_NAV_KEY` {#symbol-persisted_nav_key}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L213)

#### `PERSISTED_NAV_VERSION` {#symbol-persisted_nav_version}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L214)

#### `PersistedNavV1` {#symbol-persistednavv1}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L216)

#### `readPersistedNav` {#symbol-readpersistednav}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L222)

#### `PersistUiScheduler` {#symbol-persistuischeduler}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L263)

##### `PersistUiScheduler` — Summary
Timer handle for debounced UI persistence

#### `PersistNavScheduler` {#symbol-persistnavscheduler}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L268)

##### `PersistNavScheduler` — Summary
Timer handle for debounced nav persistence

#### `createPersistUiScheduler` {#symbol-createpersistuischeduler}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L276)

##### `createPersistUiScheduler` — Summary
Create a debounced UI persistence scheduler.
Writes filters and tuning to localStorage after a 150ms debounce.

#### `createPersistNavScheduler` {#symbol-createpersistnavscheduler}
- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L308)

##### `createPersistNavScheduler` — Summary
Create a debounced navigation persistence scheduler.
Writes view and focused node to localStorage after a 150ms debounce.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerFilters`](../types.ts.mdmd.md#symbol-explorerfilters) (type-only)
- [`types.TuningConfig`](../types.ts.mdmd.md#symbol-tuningconfig) (type-only)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname) (type-only)
<!-- LIVE-DOC:END Dependencies -->
