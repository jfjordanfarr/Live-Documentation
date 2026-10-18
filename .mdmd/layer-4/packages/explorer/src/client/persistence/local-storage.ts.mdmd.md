# packages/explorer/src/client/persistence/local-storage.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/local-storage.ts
- Generated At: 2026-10-18T05:36:02.007Z

## Authored
### Purpose

Persists Explorer filters, tuning preferences and the current navigation state across browser sessions.

### Notes

Retired density-nudge values in older stored settings are ignored; no automatic perspective suggestion is restored.

- Extracted from client/index.ts during Dev Day 50 (12/19). Uses debounced persistence via `schedulePersistUi()` and `schedulePersistNav()` to avoid excessive writes during rapid state changes.
- The Local Map's layout levers of 2026-10-06 are read like the other tuning values, each only when it is well formed: numbers by `readFiniteNumber`, the tie rule by its three names, and the two dials that may be off (`orderSeed`, `cardMaxWidth`) by `readNullableNumber`, which keeps a stored null as null. The restarts' dials of the same day (`orderStarts`, `crossingCost`, `heightCost`, `churnCost`) are numbers read the same way; their defaults are the costs the layout lab's tabulation set. So are the laces' three dials (`laceReach`, `laceCurl`, `laceWidth`), beside the taper; the inset dial of 2026-10-06 was retired on 2026-10-07, when the laces became cut by the card's edge, and a stored `laceInset` is ignored.
- Serialization simplified in [Dev Day 83](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md): `clickBehavior` and `visual` tuning defaults/deserialization removed alongside the corresponding type interfaces.
- `moveMs` is a number and `holdStill` one of two names (`readHoldStill`), read like the other dials (2026-10-07); their defaults are 450 ms and `click`.
- `searchStarts` and `searchPatience` are numbers read like the other dials (2026-10-07); their defaults are 32 and 8.
- `orderStarts` defaults to 2 since later on 2026-10-07: two seeded starts before the first picture where there were four, the search following it.
- `membraneDepth` is a nullable number read like `cardMaxWidth` (2026-10-07); its default is null, every level a membrane.
- The navigation store remembers the 3D layout beside the perspective (2026-10-14), read by `readSpatialLayout`; the two directory filters of that morning are gone from the filters.
- `membraneEvenness` initially defaulted to 1 and `rowLevelness` to 0 on 2026-10-07, each read like the other dials; the evenness default is the layout lab's reading that day, half the outline's steps on every scope for a tenth of a percent of wire and far fewer wires escaping their membrane.

The force graph's `gravity` defaults to 0.05 and `chargeRange` to 0, unbounded (2026-10-17): the layout lab's drift measure's reading, the smallest gravity that held every measured shape within a tenth over five membership changes ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-3d-picture-has-gravity-a-restoring-force-in-place-of-held-hubs-recorded-2026-10-17)); an older stored tuning without them takes the defaults.

The force graph's `updateEnergy` defaults to 0.1 (2026-10-18, ticket C2 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): a membership change reheats the simulation to a tenth of alpha, which the lab measured at about a quarter of the full reheat's stir of the unchanged spheres on this repository's bundles with the picture's extent held, settling in two hundred ticks instead of three hundred, and which the builder's eye read as the picture staying recognisably itself through a type toggle while the gaps the toggle left close, where the full reheat reshuffles the tree and placement alone never closes them ([the lab record](../../../../../../../AI-Agent-Workspace/Probes/2026-10-18/layout-lab/README.md)); the owner's choice among the pictured settings is open, and an older stored tuning without the value takes the default.

Cold defaults use the shared Relaxed profile. The forceGraph tuning group is merged independently for older stored settings; explicit older numeric preferences remain overrides. Portable packing and spatial values are normalized to the public control ranges and increments before use, so a slider and the layout cannot disagree about the active number. This supports [the shared-preset design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

The history tuning (2026-10-18, the plan's C4 and C14) is read with the rest: an axis of `steps` or `time`, a granularity among the six, a play rate finite and positive, each falling back to its default alone.

The force graph's `linkStrength` defaults to 1 (2026-10-18), D3's own spring rule unchanged, until the owner's eye picks the numbers they asked to tune by hand ([Turn 7](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-7)); an older stored tuning without the value takes the default.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PERSISTED_UI_KEY` {#symbol-persisted_ui_key}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L20)

##### `PERSISTED_UI_KEY` — Summary
localStorage key for persisted UI state (filters + tuning). Version-suffixed to allow future migration.

#### `PERSISTED_UI_VERSION` {#symbol-persisted_ui_version}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L22)

##### `PERSISTED_UI_VERSION` — Summary
Schema version tag embedded in persisted UI payloads for forward-compatible deserialisation.

#### `PersistedUiV1` {#symbol-persisteduiv1}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L25)

##### `PersistedUiV1` — Summary
Shape of the versioned UI state written to localStorage under {@link PERSISTED_UI_KEY}.

#### `getDefaultFilters` {#symbol-getdefaultfilters}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L32)

##### `getDefaultFilters` — Summary
Returns the factory-default filter set (tests visible, assets/docs hidden).

#### `getDefaultTuning` {#symbol-getdefaulttuning}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L39)

##### `getDefaultTuning` — Summary
Returns the factory-default tuning configuration for bezier curves and the local-map layout.

#### `readPersistedUi` {#symbol-readpersistedui}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L124)

##### `readPersistedUi` — Summary
Reads and validates persisted UI state from localStorage.

Returns `null` when no entry exists or the stored version does not match
{@link PERSISTED_UI_VERSION}. Stale/corrupt entries are removed.

#### `applyPersistedUi` {#symbol-applypersistedui}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L279)

##### `applyPersistedUi` — Summary
Merges persisted UI state onto factory defaults, producing a complete
filters + tuning pair suitable for initialising the Explorer.

Each tuning sub-object is spread independently so that a partially-
persisted bezier config inherits missing keys from the defaults.

#### `PERSISTED_NAV_KEY` {#symbol-persisted_nav_key}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L323)

##### `PERSISTED_NAV_KEY` — Summary
localStorage key for persisted navigation state (active view + focused node).

#### `PERSISTED_NAV_VERSION` {#symbol-persisted_nav_version}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L325)

##### `PERSISTED_NAV_VERSION` — Summary
Schema version tag embedded in persisted navigation payloads.

#### `PersistedNavV1` {#symbol-persistednavv1}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L328)

##### `PersistedNavV1` — Summary
Shape of the versioned navigation state written to localStorage under {@link PERSISTED_NAV_KEY}.

#### `readPersistedNav` {#symbol-readpersistednav}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L345)

##### `readPersistedNav` — Summary
Reads and validates persisted navigation state from localStorage.

Returns `null` when no entry exists or the stored version does not match
{@link PERSISTED_NAV_VERSION}. Only known view names are accepted; unknown
values are silently discarded.

#### `PersistUiScheduler` {#symbol-persistuischeduler}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L392)

##### `PersistUiScheduler` — Summary
Timer handle for debounced UI persistence

#### `PersistNavScheduler` {#symbol-persistnavscheduler}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L397)

##### `PersistNavScheduler` — Summary
Timer handle for debounced nav persistence

#### `createPersistUiScheduler` {#symbol-createpersistuischeduler}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L405)

##### `createPersistUiScheduler` — Summary
Create a debounced UI persistence scheduler.
Writes filters and tuning to localStorage after a 150ms debounce.

#### `createPersistNavScheduler` {#symbol-createpersistnavscheduler}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L437)

##### `createPersistNavScheduler` — Summary
Create a debounced navigation persistence scheduler.
Writes view and focused node to localStorage after a 150ms debounce.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-presets.LAYOUT_PRESETS`](../layout-presets.ts.mdmd.md#symbol-layout_presets)
- [`layout-presets.readLayoutSettings`](../layout-presets.ts.mdmd.md#symbol-readlayoutsettings)
- [`navigation.readPerspective`](./navigation.ts.mdmd.md#symbol-readperspective)
- [`navigation.readSpatialLayout`](./navigation.ts.mdmd.md#symbol-readspatiallayout)
- [`navigation.readView`](./navigation.ts.mdmd.md#symbol-readview)
- [`types.ExplorerFilters`](../types.ts.mdmd.md#symbol-explorerfilters)
- [`types.HISTORY_GRANULARITIES`](../types.ts.mdmd.md#symbol-history_granularities)
- [`types.HistoryAxis`](../types.ts.mdmd.md#symbol-historyaxis)
- [`types.HistoryGranularity`](../types.ts.mdmd.md#symbol-historygranularity)
- [`types.LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective)
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)
- [`types.SymbolOrder`](../types.ts.mdmd.md#symbol-symbolorder)
- [`types.TuningConfig`](../types.ts.mdmd.md#symbol-tuningconfig)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname)
<!-- LIVE-DOC:END Dependencies -->
