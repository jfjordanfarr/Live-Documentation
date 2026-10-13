# packages/explorer/src/client/layout-presets.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/layout-presets.ts
- Generated At: 2026-10-13T19:38:15.671Z

## Authored
### Purpose
Defines the Local Map’s shared Compact and Relaxed packing profiles and the portable settings behind them.

### Notes
Each profile sets the 2D packing costs and 3D spacing together. Coupling, base sphere radius and symbol scaling remain independent of preset changes. The current label is derived from actual packing values; changed values read as Custom. Shared values are validated against the same ranges and increments as the controls before rendering, and omitted fields retain existing preferences.

Created for [the October 13 shared-preset implementation](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LayoutPreset` {#symbol-layoutpreset}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L4)

##### `LayoutPreset` — Summary
One packing preference interpreted by both Local Map representations.

#### `LayoutSettings` {#symbol-layoutsettings}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L10)

##### `LayoutSettings` — Summary
Portable numeric settings behind the presets and spatial encodings; older URLs may omit them.

#### `LAYOUT_RANGES` {#symbol-layout_ranges}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L16)

##### `LAYOUT_RANGES` — Summary
Public control minimum, maximum and step, also used when reading saved or shared values.

#### `LAYOUT_PRESETS` {#symbol-layout_presets}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L27)

##### `LAYOUT_PRESETS` — Summary
Packing defaults only: selecting a preset preserves coupling, symbol scaling and unrelated controls.

#### `applyLayoutPreset` {#symbol-applylayoutpreset}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L39)
- Returns: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig)
- Parameters: `tuning`: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig); `preset`: [`LayoutPreset`](#symbol-layoutpreset)

##### `applyLayoutPreset` — Summary
Return a fresh tuning record with both representations' packing set together.

#### `layoutPresetOf` {#symbol-layoutpresetof}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L45)
- Returns: [`LayoutPreset`](#symbol-layoutpreset)
- Parameters: `tuning`: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig)

##### `layoutPresetOf` — Summary
Derive the label from actual settings, so advanced edits never masquerade as a stock preset.

#### `readLayoutSettings` {#symbol-readlayoutsettings}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L55)
- Returns: [`LayoutSettings`](#symbol-layoutsettings)

##### `readLayoutSettings` — Summary
Read only known, finite settings and bound them to their public control ranges.

#### `layoutSettingsOf` {#symbol-layoutsettingsof}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L76)
- Returns: [`LayoutSettings`](#symbol-layoutsettings)
- Parameters: `tuning`: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig)

##### `layoutSettingsOf` — Summary
Snapshot the controls that affect packing and spatial encodings, independent of the current perspective.

#### `applyLayoutSettings` {#symbol-applylayoutsettings}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L81)
- Returns: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig)
- Parameters: `tuning`: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig); `settings`: [`LayoutSettings`](#symbol-layoutsettings)

##### `applyLayoutSettings` — Summary
Merge a validated partial snapshot over the current values, leaving unrelated preferences intact.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ForceGraphTuning`](./types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.LocalMapTuning`](./types.ts.mdmd.md#symbol-localmaptuning) (type-only)
- [`types.TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig) (type-only)
<!-- LIVE-DOC:END Dependencies -->
