# packages/explorer/src/client/panels/tuning.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/tuning.ts
- Generated At: 2026-10-30T16:33:48.060Z

## Authored
### Purpose

Connects the Local Map’s shared packing presets and advanced geometry controls to state, persistence, sharing and the appropriate renderer.

### Notes

- Extracted from client/index.ts during Dev Day 50 (12/19). The `initTuningPanel()` function binds DOM controls to state mutations, and `syncTuningControlsFromState()` ensures UI reflects persisted preferences.
- Click Behavior and Visual checkbox sections removed in [Dev Day 83](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-27.1.md) as dead code after the Membrane Map replaced those interactions.
- CSS variable `--local-column-gap` is set on `document.documentElement` (not `.local-layout`) so it cascades to the Local Map container.
- The Symbol Order select (2026-10-05) holds the owner's three strategies for a card's rows, layout, alphabetical and order of appearance; it changes the layout rather than only the wires, so the Local Map re-renders on change and the choice persists with the rest of the tuning.
- The laces' dials (2026-10-06: Lace Reach, Lace Curl, Lace Width, beside the taper; a Lace Inset dial of the same day was retired on 2026-10-07, when the laces became cut by the card's edge) change a drawing, not the layout, so each redraws the Local Map's wires as it moves through `wireSlider`; the owner asked for the self-references' shape to be tuned by eye in the panel until it is distinct from a connector wire and reads as a wire pulled taut ([Turn 13](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-13)).
- The Move slider and the Hold Still select (2026-10-07) set `moveMs` and `holdStill` and persist them; neither redraws anything, since both take effect at the next change of picture. As with every slider, syncing the panel from state writes the slider's value back, so a stored `moveMs` beyond the slider's 1,200 ms comes back as 1,200.
- The Order Starts, Search Starts and Search Patience sliders (2026-10-07) each re-render the view, since they change which picture is drawn and searched.
- The Churn Cost slider (2026-10-07, later in the day) sets `churnCost` and re-renders the view like the search's other dials, so the owner can price a swapped pair at nothing and watch; Order Starts' default fell to 2 the same day.
- Two sliders since 2026-10-07, Membrane Evenness and Row Levelness, wired like Churn Cost: the picture re-renders as they move.
- Gravity and Repulsion Reach (2026-10-17) join the 3D packing sliders, persisted and shared like them; a change reconfigures the forces and reheats the picture as the other 3D sliders do ([the October 17 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-5)).
- Approximation (2026-10-28) joins the 3D sliders as `tuning-force-approximation`, persisted and shared like them: how far the repulsion may be approximated, zero the exact sum. Like the other force sliders it is in the settings that rebuild the field, so a change unfolds the picture at full strength.
- Update Energy (2026-10-18, ticket C2 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions)) is wired like the other 3D sliders and re-renders the view as they do, but it changes no force: the 3D view leaves it out of the settings that reheat the picture, so moving it stirs nothing, and the value takes effect at the next change of what is shown.
- Every control's help (2026-10-30) comes from the table in [tuning-levers.ts](tuning-levers.ts.mdmd.md): `describeTuningControls` writes each sentence into the control's and its label's `title` and into a visually hidden element after the label that the control names by `aria-describedby`. The element stands outside the label so that the sentence does not join the control's accessible name, which the browser computes from the label's text.

The shared Compact/Relaxed selector applies both representations’ packing values. Manual packing changes read as Custom; coupling and size controls survive preset selection. The active perspective’s advanced group opens on a perspective change while either group remains available manually. The returned sync callback keeps controls accurate after navigation. Layout settings can be exported as JSON; the application persists and shares changes and takes over any unfinished camera fit before re-layout. This supports [the shared-preset design](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

The History group (2026-10-18, ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) and its C14): the axis and the ticks as selects and the play rate as a slider, under the 3D controls, since the history is the 3D Local Map's; a change of the axis or the ticks redraws the scrubber through the view's render, and the picture itself does not change.
- Spring Strength (`tuning-force-link-strength`, 2026-10-18) is wired like the other 3D sliders and reheats the picture as a change of the forces, since it is one: the owner's ask to tune the pull between connected neighbours by eye ([Turn 7](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-7)).

- Tether (`tuning-force-tether`, 2026-10-21) is wired like the other 3D sliders and, being a force, builds the field again and unfolds the picture; the owner asked to tune it by eye ([Turn 5](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-5)). Since that day a change of the forces unfolds the picture at full strength where it reheated it, and Update Energy is a constant strength.

Wire Thickness and the independent Node/Wire Zoom Resistance sliders are persisted and shared 3D appearance controls. Width scales every connector while keeping reference-count weighting and the citation/containment distinctions. Resistance spans perspective at zero, constant screen size at one and softened perspective between. The renderer excludes these controls from force settings, so adjustment redraws without disturbing the standing picture. The owner requested the thickness dial after the [October 24 visual comparison](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-7), then [continuous resistance](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-24.1.record.md#turn-11) after judging the invariant endpoints.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TuningChangeCallback` {#symbol-tuningchangecallback}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning.ts#L13)

##### `TuningChangeCallback` — Summary
Callback for when tuning values change

#### `RenderCallback` {#symbol-rendercallback}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning.ts#L16)

##### `RenderCallback` — Summary
Callback for when the current view needs to re-render

#### `TuningPanelConfig` {#symbol-tuningpanelconfig}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning.ts#L19)

##### `TuningPanelConfig` — Summary
Tuning panel configuration

#### `initTuningPanel` {#symbol-inittuningpanel}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning.ts#L29)
- Parameters: `config`: [`TuningPanelConfig`](#symbol-tuningpanelconfig)

##### `initTuningPanel` — Summary
Initialize the tuning panel with all slider and checkbox controls.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-presets.applyLayoutPreset`](../layout-presets.ts.mdmd.md#symbol-applylayoutpreset)
- [`layout-presets.layoutPresetOf`](../layout-presets.ts.mdmd.md#symbol-layoutpresetof)
- [`layout-presets.layoutSettingsOf`](../layout-presets.ts.mdmd.md#symbol-layoutsettingsof)
- [`tuning-levers.TUNING_HELP`](./tuning-levers.ts.mdmd.md#symbol-tuning_help)
- [`tuning-levers.tuningHelpId`](./tuning-levers.ts.mdmd.md#symbol-tuninghelpid)
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`template.export-layout-settings`](../../shared/template.html.mdmd.md#symbol-export-layout-settings)
- [`template.tuning-churn-cost`](../../shared/template.html.mdmd.md#symbol-tuning-churn-cost)
- [`template.tuning-column-gap`](../../shared/template.html.mdmd.md#symbol-tuning-column-gap)
- [`template.tuning-history-axis`](../../shared/template.html.mdmd.md#symbol-tuning-history-axis)
- [`template.tuning-history-granularity`](../../shared/template.html.mdmd.md#symbol-tuning-history-granularity)
- [`template.tuning-history-play-rate`](../../shared/template.html.mdmd.md#symbol-tuning-history-play-rate)
- [`template.tuning-history-play-rate-value`](../../shared/template.html.mdmd.md#symbol-tuning-history-play-rate-value)
- [`template.tuning-hold-still`](../../shared/template.html.mdmd.md#symbol-tuning-hold-still)
- [`template.tuning-hover-dim-connections`](../../shared/template.html.mdmd.md#symbol-tuning-hover-dim-connections)
- [`template.tuning-hover-dim-symbols`](../../shared/template.html.mdmd.md#symbol-tuning-hover-dim-symbols)
- [`template.tuning-lace-curl`](../../shared/template.html.mdmd.md#symbol-tuning-lace-curl)
- [`template.tuning-lace-reach`](../../shared/template.html.mdmd.md#symbol-tuning-lace-reach)
- [`template.tuning-lace-width`](../../shared/template.html.mdmd.md#symbol-tuning-lace-width)
- [`template.tuning-membrane-evenness`](../../shared/template.html.mdmd.md#symbol-tuning-membrane-evenness)
- [`template.tuning-membrane-simplicity`](../../shared/template.html.mdmd.md#symbol-tuning-membrane-simplicity)
- [`template.tuning-move-ms`](../../shared/template.html.mdmd.md#symbol-tuning-move-ms)
- [`template.tuning-move-ms-value`](../../shared/template.html.mdmd.md#symbol-tuning-move-ms-value)
- [`template.tuning-order-starts`](../../shared/template.html.mdmd.md#symbol-tuning-order-starts)
- [`template.tuning-row-levelness`](../../shared/template.html.mdmd.md#symbol-tuning-row-levelness)
- [`template.tuning-search-patience`](../../shared/template.html.mdmd.md#symbol-tuning-search-patience)
- [`template.tuning-search-starts`](../../shared/template.html.mdmd.md#symbol-tuning-search-starts)
- [`template.tuning-self-loop-taper`](../../shared/template.html.mdmd.md#symbol-tuning-self-loop-taper)
- [`template.tuning-stub-factor`](../../shared/template.html.mdmd.md#symbol-tuning-stub-factor)
- [`template.tuning-stub-max-offset`](../../shared/template.html.mdmd.md#symbol-tuning-stub-max-offset)
- [`template.tuning-stub-min`](../../shared/template.html.mdmd.md#symbol-tuning-stub-min)
- [`template.tuning-symbol-order`](../../shared/template.html.mdmd.md#symbol-tuning-symbol-order)
- [`template.tuning-vertical-offset`](../../shared/template.html.mdmd.md#symbol-tuning-vertical-offset)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
