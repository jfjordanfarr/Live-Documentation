# packages/scripts/src/live-docs/explorer/client/panels/tuning.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/panels/tuning.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-panels-tuning-ts
- Generated At: 2025-12-19T21:55:44.432Z

## Authored
### Purpose
Initializes and manages the Tuning Panel UI in the Explorer sidebar. Wires up sliders, checkboxes, and other controls that adjust visualization parameters like zoom sensitivity, collapse behavior, and layout spacing.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19). The `initTuningPanel()` function binds DOM controls to state mutations, and `syncTuningControlsFromState()` ensures UI reflects persisted preferences.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:55:44.432Z","inputHash":"30355eb3d04bf5a2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TuningChangeCallback` {#symbol-tuningchangecallback}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/tuning.ts#L11)

##### `TuningChangeCallback` — Summary
Callback for when tuning values change

#### `RenderCallback` {#symbol-rendercallback}
- Type: type
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/tuning.ts#L14)

##### `RenderCallback` — Summary
Callback for when the current view needs to re-render

#### `TuningPanelConfig` {#symbol-tuningpanelconfig}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/tuning.ts#L17)

##### `TuningPanelConfig` — Summary
Tuning panel configuration

#### `initTuningPanel` {#symbol-inittuningpanel}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/tuning.ts#L27)
- Parameters: `config`: [`TuningPanelConfig`](./index.ts.mdmd.md#symbol-tuningpanelconfig)

##### `initTuningPanel` — Summary
Initialize the tuning panel with all slider and checkbox controls.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
<!-- LIVE-DOC:END Dependencies -->
