# packages/scripts/src/live-docs/explorer/client/panels/tuning.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/panels/tuning.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-panels-tuning-ts
- Generated At: 2026-03-28T04:28:14.206Z

## Authored

### Purpose

Initializes and manages the Tuning Panel UI in the Explorer sidebar. Wires up sliders that adjust visualization parameters like zoom sensitivity, bezier curve tension, and column gap spacing across both Local Map and Membrane Map views.

### Notes

- Extracted from client/index.ts during Dev Day 50 (12/19). The `initTuningPanel()` function binds DOM controls to state mutations, and `syncTuningControlsFromState()` ensures UI reflects persisted preferences.
- Click Behavior and Visual checkbox sections removed in [Dev Day 83](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md) as dead code after the Membrane Map replaced those interactions.
- CSS variable `--local-column-gap` is set on `document.documentElement` (not `.local-layout`) so it cascades to both Local Map and Membrane Map grid containers.
- `TuningPanelConfig.drawMembraneConnections` callback triggers lightweight SVG connection redraw when column gap or bezier sliders change in membrane view, avoiding full DOM reconstruction.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-28T04:28:14.206Z","inputHash":"6860fc3310894dc8"}]} -->
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
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/panels/tuning.ts#L28)
- Parameters: `config`: [`TuningPanelConfig`](./index.ts.mdmd.md#symbol-tuningpanelconfig)

##### `initTuningPanel` — Summary

Initialize the tuning panel with all slider and checkbox controls.

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`template.tuning-column-gap`](../../shared/template.html.mdmd.md#symbol-tuningcolumngap)
- [`template.tuning-hover-dim-connections`](../../shared/template.html.mdmd.md#symbol-tuninghoverdimconnections)
- [`template.tuning-hover-dim-symbols`](../../shared/template.html.mdmd.md#symbol-tuninghoverdimsymbols)
- [`template.tuning-self-loop-taper`](../../shared/template.html.mdmd.md#symbol-tuningselflooptaper)
- [`template.tuning-stub-factor`](../../shared/template.html.mdmd.md#symbol-tuningstubfactor)
- [`template.tuning-stub-max-offset`](../../shared/template.html.mdmd.md#symbol-tuningstubmaxoffset)
- [`template.tuning-stub-min`](../../shared/template.html.mdmd.md#symbol-tuningstubmin)
- [`template.tuning-vertical-offset`](../../shared/template.html.mdmd.md#symbol-tuningverticaloffset)
<!-- LIVE-DOC:END Dependencies -->
