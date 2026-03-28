# packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-persistence-local-storage-ts
- Generated At: 2026-03-28T04:28:14.319Z

## Authored

### Purpose

Manages localStorage-based persistence for Explorer UI preferences and navigation history. Saves tuning panel settings, sidebar state, and recently visited nodes across browser sessions.

### Notes

- Extracted from client/index.ts during Dev Day 50 (12/19). Uses debounced persistence via `schedulePersistUi()` and `schedulePersistNav()` to avoid excessive writes during rapid state changes.
- Serialization simplified in [Dev Day 83](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md): `clickBehavior` and `visual` tuning defaults/deserialization removed alongside the corresponding type interfaces.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-28T04:28:14.319Z","inputHash":"c0a088d6e244b1fe"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `PERSISTED_UI_KEY` {#symbol-persisted_ui_key}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L15)

##### `PERSISTED_UI_KEY` — Summary

localStorage key for persisted UI state (filters + tuning). Version-suffixed to allow future migration.

#### `PERSISTED_UI_VERSION` {#symbol-persisted_ui_version}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L17)

##### `PERSISTED_UI_VERSION` — Summary

Schema version tag embedded in persisted UI payloads for forward-compatible deserialisation.

#### `PersistedUiV1` {#symbol-persisteduiv1}

- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L20)

##### `PersistedUiV1` — Summary

Shape of the versioned UI state written to localStorage under {@link PERSISTED_UI_KEY}.

#### `getDefaultFilters` {#symbol-getdefaultfilters}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L27)

##### `getDefaultFilters` — Summary

Returns the factory-default filter set (tests visible, assets/docs hidden).

#### `getDefaultTuning` {#symbol-getdefaulttuning}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L34)

##### `getDefaultTuning` — Summary

Returns the factory-default tuning configuration for bezier curves and the local-map layout.

#### `readPersistedUi` {#symbol-readpersistedui}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L74)

##### `readPersistedUi` — Summary

Reads and validates persisted UI state from localStorage.

Returns `null` when no entry exists or the stored version does not match
{@link PERSISTED_UI_VERSION}. Stale/corrupt entries are removed.

#### `applyPersistedUi` {#symbol-applypersistedui}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L163)

##### `applyPersistedUi` — Summary

Merges persisted UI state onto factory defaults, producing a complete
filters + tuning pair suitable for initialising the Explorer.

Each tuning sub-object is spread independently so that a partially-
persisted bezier config inherits missing keys from the defaults.

#### `PERSISTED_NAV_KEY` {#symbol-persisted_nav_key}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L199)

##### `PERSISTED_NAV_KEY` — Summary

localStorage key for persisted navigation state (active view + focused node).

#### `PERSISTED_NAV_VERSION` {#symbol-persisted_nav_version}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L201)

##### `PERSISTED_NAV_VERSION` — Summary

Schema version tag embedded in persisted navigation payloads.

#### `PersistedNavV1` {#symbol-persistednavv1}

- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L204)

##### `PersistedNavV1` — Summary

Shape of the versioned navigation state written to localStorage under {@link PERSISTED_NAV_KEY}.

#### `readPersistedNav` {#symbol-readpersistednav}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L217)

##### `readPersistedNav` — Summary

Reads and validates persisted navigation state from localStorage.

Returns `null` when no entry exists or the stored version does not match
{@link PERSISTED_NAV_VERSION}. Only known view names are accepted; unknown
values are silently discarded.

#### `PersistUiScheduler` {#symbol-persistuischeduler}

- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L258)

##### `PersistUiScheduler` — Summary

Timer handle for debounced UI persistence

#### `PersistNavScheduler` {#symbol-persistnavscheduler}

- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L263)

##### `PersistNavScheduler` — Summary

Timer handle for debounced nav persistence

#### `createPersistUiScheduler` {#symbol-createpersistuischeduler}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L271)

##### `createPersistUiScheduler` — Summary

Create a debounced UI persistence scheduler.
Writes filters and tuning to localStorage after a 150ms debounce.

#### `createPersistNavScheduler` {#symbol-createpersistnavscheduler}

- Type: const
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/persistence/local-storage.ts#L303)

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
