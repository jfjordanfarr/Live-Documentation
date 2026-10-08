# packages/explorer/src/client/persistence/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/index.ts
- Generated At: 2026-10-08T16:03:27.946Z

## Authored
### Purpose
Barrel that re-exports the nine persistence functions the client imports through it: the URL state's parse and update, and the localStorage defaults, readers, applier and schedulers. The storage keys, versions and record types are imported from `url-state.ts` and `local-storage.ts` directly.

### Notes
Created during Dev Day 50 (12/19) as part of Phase 2 tech-debt reduction. Groups the `url-state.ts` and `local-storage.ts` exports under a single import path. Trimmed on 2026-10-08 from 20 names to the 9 imported through it, in [the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `parseInitialState` {#symbol-parseinitialstate}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/index.ts#L10)

#### `updateUrlState` {#symbol-updateurlstate}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/index.ts#L11)

#### `getDefaultFilters` {#symbol-getdefaultfilters}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/index.ts#L15)

#### `getDefaultTuning` {#symbol-getdefaulttuning}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/index.ts#L16)

#### `readPersistedUi` {#symbol-readpersistedui}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/index.ts#L17)

#### `applyPersistedUi` {#symbol-applypersistedui}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/index.ts#L18)

#### `createPersistUiScheduler` {#symbol-createpersistuischeduler}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/index.ts#L19)

#### `readPersistedNav` {#symbol-readpersistednav}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/index.ts#L20)

#### `createPersistNavScheduler` {#symbol-createpersistnavscheduler}
- Type: unknown
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/index.ts#L21)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.applyPersistedUi`](./local-storage.ts.mdmd.md#symbol-applypersistedui) (re-export)
- [`local-storage.createPersistNavScheduler`](./local-storage.ts.mdmd.md#symbol-createpersistnavscheduler) (re-export)
- [`local-storage.createPersistUiScheduler`](./local-storage.ts.mdmd.md#symbol-createpersistuischeduler) (re-export)
- [`local-storage.getDefaultFilters`](./local-storage.ts.mdmd.md#symbol-getdefaultfilters) (re-export)
- [`local-storage.getDefaultTuning`](./local-storage.ts.mdmd.md#symbol-getdefaulttuning) (re-export)
- [`local-storage.readPersistedNav`](./local-storage.ts.mdmd.md#symbol-readpersistednav) (re-export)
- [`local-storage.readPersistedUi`](./local-storage.ts.mdmd.md#symbol-readpersistedui) (re-export)
- [`url-state.parseInitialState`](./url-state.ts.mdmd.md#symbol-parseinitialstate) (re-export)
- [`url-state.updateUrlState`](./url-state.ts.mdmd.md#symbol-updateurlstate) (re-export)
<!-- LIVE-DOC:END Dependencies -->
