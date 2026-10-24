# packages/explorer/src/client/persistence/local-storage.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/local-storage.ts
- Generated At: 2026-10-22T17:22:32.866Z

## Authored
### Purpose

Persists Explorer preferences and remembered navigation across browser sessions. Validates stored values, merges partial tuning over current defaults, and saves the map subject separately from the evidence left open in the reader.

### Notes

Retired density-nudge values in older stored settings are ignored; no automatic perspective suggestion is restored.

- Introduced during the December 19, 2025 extraction from `client/index.ts`; the first extraction also retained inline copies, as the [source-history correction](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/12/Summarized/2025-12-19.2.SUMMARIZED.md#corrections-2026-10-16) records. The application now consumes this module's readers and debounced persistence schedulers.
- UI preferences and navigation have separate versioned storage entries. Navigation remembers the view, perspective, 3D layout, opened directories, map subject and independent inspection target. Closing evidence writes null; older entries without it restore a closed reader. Stored target syntax is validated here, while the application checks whether its file, directory or bundled document still exists through `scrubSnapshot`.
- Inspecting another item never substitutes it for the remembered subject. The same evidence identity is used by remembered navigation, shared links and Back, following the [accepted inspection-state design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-24) and [October 20 continuation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2).
- The Local Map's layout levers of 2026-10-06 are read like the other tuning values, each only when it is well formed: numbers by `readFiniteNumber`, the tie rule by its three names, and the two dials that may be off (`orderSeed`, `cardMaxWidth`) by `readNullableNumber`, which keeps a stored null as null. The restarts' dials of the same day (`orderStarts`, `crossingCost`, `heightCost`, `churnCost`) are numbers read the same way; their defaults are the costs the layout lab's tabulation set. So are the laces' three dials (`laceReach`, `laceCurl`, `laceWidth`), beside the taper; the inset dial of 2026-10-06 was retired on 2026-10-07, when the laces became cut by the card's edge, and a stored `laceInset` is ignored.
- Serialization simplified in [Dev Day 83](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md): `clickBehavior` and `visual` tuning defaults/deserialization removed alongside the corresponding type interfaces.
- `moveMs` is a number and `holdStill` one of two names (`readHoldStill`), read like the other dials (2026-10-07); their defaults are 450 ms and `click`.
- `searchStarts` and `searchPatience` are numbers read like the other dials (2026-10-07); their defaults are 32 and 8.
- `orderStarts` defaults to 2 since later on 2026-10-07: two seeded starts before the first picture where there were four, the search following it.
- `membraneDepth` is a nullable number read like `cardMaxWidth` (2026-10-07); its default is null, every level a membrane.
- The navigation store remembers the 3D layout beside the perspective (2026-10-14), read by `readSpatialLayout`; the two directory filters of that morning are gone from the filters.
- `membraneEvenness` initially defaulted to 1 and `rowLevelness` to 0 on 2026-10-07, each read like the other dials; the evenness default is the layout lab's reading that day, half the outline's steps on every scope for a tenth of a percent of wire and far fewer wires escaping their membrane.

On 2026-10-17 the force graph's initial `gravity` default was 0.05 and `chargeRange` was 0, unbounded: the layout lab's drift measure's reading, the smallest gravity that held every measured shape within a tenth over five membership changes ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#the-3d-picture-has-gravity-a-restoring-force-in-place-of-held-hubs-recorded-2026-10-17)). The owner's later gravity choice is recorded below; older stored tuning takes today's defaults for missing values.

The force graph's `updateEnergy` initially defaulted to 0.1 on 2026-10-18 (ticket C2 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)): a membership change reheated the simulation to a tenth of alpha, which the lab measured at about a quarter of the full reheat's stir of the unchanged spheres on this repository's bundles with the picture's extent held, settling in two hundred ticks instead of three hundred. The builder's eye read this as the picture staying recognisably itself through a type toggle while the gaps the toggle left closed ([the lab record](../../../../../../../AI-Agent-Workspace/Probes/2026-10-18/layout-lab/README.md)). The constant-strength motion introduced October 21 superseded that alpha-based default, as recorded below.

Cold defaults use the shared Relaxed profile. The forceGraph tuning group is merged independently for older stored settings; explicit older numeric preferences remain overrides. Portable packing and spatial values are normalized to the public control ranges and increments before use, so a slider and the layout cannot disagree about the active number. This supports [the shared-preset design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

The history tuning (2026-10-18, the plan's C4 and C14) is read with the rest: an axis of `steps` or `time`, a granularity among the six, a play rate finite and positive, each falling back to its default alone.

The force graph's `linkStrength` initially defaulted to 1 on 2026-10-18, keeping D3's spring rule unchanged while the owner tried the numbers they asked to tune by hand ([Turn 7](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-7)). Their later selection is recorded below.

From the evening of 2026-10-18 until October 24, gravity 0.01 and the springs' strength 0.25 were the defaults, the owner's own settings by eye after a day with the levers ("a bit of room to breathe so users can better explore it", [Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-9)), measured by the lab at a 4 to 6 percent growth of the extent over five toggle cycles on this repository's bundles with the reach unbounded ([the lab record](../../../../../../../AI-Agent-Workspace/Probes/2026-10-18/layout-lab/README.md)).

On 2026-10-21 `updateEnergy` changed to 1 and `tether` to 0.01. Under the motion the energy is a constant strength, and every strength reaches much the same rest, so a tenth would only ease each change for longer; what keeps the picture recognisably itself through a change is now the tether ([Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)). The October 24 visual pass retained energy 1 and selected tether .02.

The owner's [October 24 Connections tuning request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-12) led to gravity .025, spring strength .5, tether .02, node zoom resistance .45, wire resistance .9 and wire thickness .9. These keep the Relaxed packing profile; appearance values are independent of packing. The [comparison record](../../../../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/README.md) explains the visual selection. Version 2's sparse overrides let changed defaults reach ordinary returning viewers while preserving explicit saved preferences.

Since 2026-10-22 ([Turn 10 of the October 21 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-10)) the history's axis defaults to `time`, linear time, the owner's preference: "one month is no more prescient than any other"; the axis by step remains in Tuning. The same day the saved settings became version 2 under a new key, holding only what differs from the defaults (`changedFromDefaults`). Version 1 had saved every setting as it stood on any change, a filter's toggle included, so a default changed later, this axis or the motion's energy of the day before, never reached a returning viewer, and an entry of it cannot tell a choice from an old default; it is removed unread.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PERSISTED_UI_KEY` {#symbol-persisted_ui_key}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L25)

##### `PERSISTED_UI_KEY` — Summary
localStorage key for persisted UI state (filters + tuning). Version-suffixed to allow future migration. Version 2
(2026-10-22) holds only what differs from the defaults; version 1 held every setting as it stood, so that a changed
default never reached a returning viewer, and a version 1 entry cannot tell a choice from an old default. It is
removed unread ({@link RETIRED_UI_KEYS}).

#### `PERSISTED_UI_VERSION` {#symbol-persisted_ui_version}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L27)

##### `PERSISTED_UI_VERSION` — Summary
Schema version tag embedded in persisted UI payloads for forward-compatible deserialisation.

#### `PersistedUi` {#symbol-persistedui}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L32)

##### `PersistedUi` — Summary
Shape of the versioned UI state written to localStorage under {@link PERSISTED_UI_KEY}.

#### `getDefaultFilters` {#symbol-getdefaultfilters}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L39)

##### `getDefaultFilters` — Summary
Returns the factory-default filter set (tests visible; assets and documents, cited and citing, hidden).

#### `getDefaultTuning` {#symbol-getdefaulttuning}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L47)

##### `getDefaultTuning` — Summary
Returns the factory-default tuning configuration for bezier curves and the local-map layout.

#### `readPersistedUi` {#symbol-readpersistedui}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L134)

##### `readPersistedUi` — Summary
Reads and validates persisted UI state from localStorage.

Returns `null` when no entry exists or the stored version does not match
{@link PERSISTED_UI_VERSION}. Stale/corrupt entries are removed, and so are
the entries of earlier versions.

#### `applyPersistedUi` {#symbol-applypersistedui}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L292)

##### `applyPersistedUi` — Summary
Merges persisted UI state onto factory defaults, producing a complete
filters + tuning pair suitable for initialising the Explorer.

Each tuning sub-object is spread independently so that a partially-
persisted bezier config inherits missing keys from the defaults.

#### `PERSISTED_NAV_KEY` {#symbol-persisted_nav_key}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L336)

##### `PERSISTED_NAV_KEY` — Summary
localStorage key for persisted navigation state (active view + map subject).

#### `PERSISTED_NAV_VERSION` {#symbol-persisted_nav_version}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L338)

##### `PERSISTED_NAV_VERSION` — Summary
Schema version tag embedded in persisted navigation payloads.

#### `PersistedNavV1` {#symbol-persistednavv1}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L341)

##### `PersistedNavV1` — Summary
Shape of the versioned navigation state written to localStorage under {@link PERSISTED_NAV_KEY}.

#### `readPersistedNav` {#symbol-readpersistednav}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L383)

##### `readPersistedNav` — Summary
Reads and validates persisted navigation state from localStorage.

Returns `null` when no entry exists or the stored version does not match
{@link PERSISTED_NAV_VERSION}. Only known view names are accepted; unknown
values are silently discarded.

#### `PersistUiScheduler` {#symbol-persistuischeduler}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L431)

##### `PersistUiScheduler` — Summary
Timer handle for debounced UI persistence

#### `PersistNavScheduler` {#symbol-persistnavscheduler}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L436)

##### `PersistNavScheduler` — Summary
Timer handle for debounced nav persistence

#### `changedFromDefaults` {#symbol-changedfromdefaults}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L459)

##### `changedFromDefaults` — Summary
What of the filters and the tuning a person has changed: every setting that differs from the defaults, and nothing
else, so that a default changed later reaches every setting they never touched.

#### `createPersistUiScheduler` {#symbol-createpersistuischeduler}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L476)

##### `createPersistUiScheduler` — Summary
Create a debounced UI persistence scheduler.
Writes what of the filters and tuning differs from the defaults to localStorage after a 150ms debounce.

#### `createPersistNavScheduler` {#symbol-createpersistnavscheduler}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/local-storage.ts#L507)

##### `createPersistNavScheduler` — Summary
Create a debounced navigation persistence scheduler.
Writes view, map subject and independently open evidence to localStorage after a 150ms debounce.
Inspecting a different file never replaces the remembered subject.
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
- [`types.InspectionTarget`](../types.ts.mdmd.md#symbol-inspectiontarget)
- [`types.LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective)
- [`types.SpatialLayout`](../types.ts.mdmd.md#symbol-spatiallayout)
- [`types.SymbolOrder`](../types.ts.mdmd.md#symbol-symbolorder)
- [`types.TuningConfig`](../types.ts.mdmd.md#symbol-tuningconfig)
- [`types.ViewName`](../types.ts.mdmd.md#symbol-viewname)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
