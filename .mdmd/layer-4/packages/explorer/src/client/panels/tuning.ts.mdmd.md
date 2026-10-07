# packages/explorer/src/client/panels/tuning.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/tuning.ts
- Generated At: 2026-10-07T13:20:46.967Z

## Authored
### Purpose

Initializes and manages the Tuning Panel UI in the Explorer sidebar. Wires up sliders that adjust visualization parameters like zoom sensitivity, bezier curve tension, and column gap spacing across both Local Map and Membrane Map views.

### Notes

- Extracted from client/index.ts during Dev Day 50 (12/19). The `initTuningPanel()` function binds DOM controls to state mutations, and `syncTuningControlsFromState()` ensures UI reflects persisted preferences.
- Click Behavior and Visual checkbox sections removed in [Dev Day 83](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md) as dead code after the Membrane Map replaced those interactions.
- CSS variable `--local-column-gap` is set on `document.documentElement` (not `.local-layout`) so it cascades to both Local Map and Membrane Map grid containers.
- `TuningPanelConfig.drawMembraneConnections` callback triggers lightweight SVG connection redraw when column gap or bezier sliders change in membrane view, avoiding full DOM reconstruction.
- The Symbol Order select (2026-10-05) holds the owner's three strategies for a card's rows, layout, alphabetical and order of appearance; like the dense-picture nudge it changes the layout rather than a drawing, so the Local Map re-renders on change and the choice persists with the rest of the tuning.
- The laces' dials (2026-10-06: Lace Reach, Lace Curl, Lace Width, beside the taper; a Lace Inset dial of the same day was retired on 2026-10-07, when the laces became cut by the card's edge) change a drawing, not the layout, so each redraws the Local Map's wires as it moves through `wireSlider`; the owner asked for the self-references' shape to be tuned by eye in the panel until it is distinct from a connector wire and reads as a wire pulled taut ([Turn 13](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-13)).
- The Move slider and the Hold Still select (2026-10-07) set `moveMs` and `holdStill` and persist them; neither redraws anything, since both take effect at the next change of picture. As with every slider, syncing the panel from state writes the slider's value back, so a stored `moveMs` beyond the slider's 1,200 ms comes back as 1,200.
- The Order Starts, Search Starts and Search Patience sliders (2026-10-07) each re-render the view, since they change which picture is drawn and searched.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TuningChangeCallback` {#symbol-tuningchangecallback}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning.ts#L11)

##### `TuningChangeCallback` — Summary
Callback for when tuning values change

#### `RenderCallback` {#symbol-rendercallback}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning.ts#L14)

##### `RenderCallback` — Summary
Callback for when the current view needs to re-render

#### `TuningPanelConfig` {#symbol-tuningpanelconfig}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning.ts#L17)

##### `TuningPanelConfig` — Summary
Tuning panel configuration

#### `initTuningPanel` {#symbol-inittuningpanel}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning.ts#L28)
- Parameters: `config`: [`TuningPanelConfig`](#symbol-tuningpanelconfig)

##### `initTuningPanel` — Summary
Initialize the tuning panel with all slider and checkbox controls.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`template.tuning-column-gap`](../../shared/template.html.mdmd.md#symbol-tuning-column-gap)
- [`template.tuning-hold-still`](../../shared/template.html.mdmd.md#symbol-tuning-hold-still)
- [`template.tuning-hover-dim-connections`](../../shared/template.html.mdmd.md#symbol-tuning-hover-dim-connections)
- [`template.tuning-hover-dim-symbols`](../../shared/template.html.mdmd.md#symbol-tuning-hover-dim-symbols)
- [`template.tuning-lace-curl`](../../shared/template.html.mdmd.md#symbol-tuning-lace-curl)
- [`template.tuning-lace-reach`](../../shared/template.html.mdmd.md#symbol-tuning-lace-reach)
- [`template.tuning-lace-width`](../../shared/template.html.mdmd.md#symbol-tuning-lace-width)
- [`template.tuning-move-ms`](../../shared/template.html.mdmd.md#symbol-tuning-move-ms)
- [`template.tuning-move-ms-value`](../../shared/template.html.mdmd.md#symbol-tuning-move-ms-value)
- [`template.tuning-order-starts`](../../shared/template.html.mdmd.md#symbol-tuning-order-starts)
- [`template.tuning-search-patience`](../../shared/template.html.mdmd.md#symbol-tuning-search-patience)
- [`template.tuning-search-starts`](../../shared/template.html.mdmd.md#symbol-tuning-search-starts)
- [`template.tuning-self-loop-taper`](../../shared/template.html.mdmd.md#symbol-tuning-self-loop-taper)
- [`template.tuning-strain-nudge`](../../shared/template.html.mdmd.md#symbol-tuning-strain-nudge)
- [`template.tuning-strain-nudge-value`](../../shared/template.html.mdmd.md#symbol-tuning-strain-nudge-value)
- [`template.tuning-stub-factor`](../../shared/template.html.mdmd.md#symbol-tuning-stub-factor)
- [`template.tuning-stub-max-offset`](../../shared/template.html.mdmd.md#symbol-tuning-stub-max-offset)
- [`template.tuning-stub-min`](../../shared/template.html.mdmd.md#symbol-tuning-stub-min)
- [`template.tuning-symbol-order`](../../shared/template.html.mdmd.md#symbol-tuning-symbol-order)
- [`template.tuning-vertical-offset`](../../shared/template.html.mdmd.md#symbol-tuning-vertical-offset)
<!-- LIVE-DOC:END Dependencies -->
