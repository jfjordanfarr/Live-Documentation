# `packages/explorer/src/client/layout-presets.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/layout-presets.ts`
- Generated At: 2026-11-23T14:55:15.222Z

## Authored
### Purpose
Defines the Local Map’s shared Compact and Relaxed packing profiles and the portable settings behind them.

### Notes
Each profile sets the 2D packing costs and 3D spacing together. Coupling, base sphere radius and symbol scaling remain independent of preset changes. The current label is derived from actual packing values; changed values read as Custom. Shared values are validated against the same ranges and increments as the controls before rendering, and omitted fields retain existing preferences.

Created for [the October 13 shared-preset implementation](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-13/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

Both packing profiles value card-top alignment. Relaxed gives it greater weight so that extra connector length can buy clearer composition, following the owner's [review of the initial defaults](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-13/2026-10-13.1.record.md#turn-8--relaxed-should-spend-wire-length-on-composition). These remain weighted preferences rather than mandatory rows or a forced routing pattern.

`LAYOUT_RANGES.forceGraph` gained `gravity` (0 to 0.3 by 0.005) and `chargeRange` (0 to 1,000 by 10) on 2026-10-17, so that the two restoring levers ride in saved and shared settings bounded like the others; neither belongs to a packing profile, as coupling and size do not ([the October 17 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-5)). `updateEnergy` (0 to 1 by 0.01) joined them on 2026-10-18 for ticket C2 of [the change-over-time plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions): the energy a membership change puts into the simulation rides in the saved and the shared settings the same way, and is no part of a packing profile either.

- `linkStrength` (0 to 2 by 0.05) joined the 3D ranges on 2026-10-18, the springs' strength as a multiple of D3's rule, so that it persists and rides share links like gravity ([Turn 7](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-17/2026-10-17.1.record.md#turn-7)).

`approximation` (0 to 1.5 by 0.05) joined the force graph's ranges on 2026-10-28, the repulsion's approximation riding in saved and shared settings like the other levers and no part of a packing profile; a link written before it keeps the viewer's own setting.

`tether` (0 to 0.1 by 0.001) joined the force graph's ranges on 2026-10-21, riding in the saved and the shared settings like the other levers and no part of a packing profile ([Turn 5](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-5)).

Wire Thickness (`linkWidth`, 0.1 to 4 by 0.1) and Node/Wire Zoom Resistance (`nodeZoomResistance` and `wireZoomResistance`, 0 to 1 by 0.05) are appearance settings independent of the packing profiles. They are carried and validated by the same saved/shared settings as the other 3D controls, with omitted values retaining the default or current preference. The owner asked for thickness in the [October 24 visual pass](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-24/2026-10-24.1.record.md#turn-7), then [separate resistance controls](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-24/2026-10-24.1.record.md#turn-11).

Since 2026-11-05 `shellDepth` is one of the numeric 3D settings, read and bounded from 1 to 6 like the hops.

Since November 6 (the directory shells merged, experiment 2 of [Turn 11](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-11)) `readLayoutSettings` also carries `groupWrappers` when it is one of the four choices, so that a shared link's layout payload, a saved tuning and the 3D view's `data-layout-settings` attribute all carry the wrappers' look with the numbers, and a link shows the group wrappers and the directory shells without a switch; an unknown look is dropped, and the storage's own reading of the choice is gone.

Since 2026-11-12 the settings carry how an opened directory stands, so that the directory flow trial is compared by link, but only when it is not the grid: a link made with the trial off is the link it was before the trial. Because the grid is never written, `applyLayoutSettings` reads a snapshot that carries the 2D map's settings without it as the grid, so that such a link shows the grid in a browser whose own tuning last held the trial; an address that carries no layout leaves the browser's choice alone.

Since 2026-11-13 ([Turn 3 of that day's record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-3): the owner judges what the build shows without a switch) the three looks are Zoom Looks' default, first in `ZOOM_LOOKS`, and the settings carry Zoom Looks only when it is the stepped ladder, as they carry the opened directory only when it is not the grid. `applyLayoutSettings` reads a snapshot that carries the 2D map's settings without it as the three looks, so that a link made before the trial, or since with the default, opens in them even in a browser whose own tuning holds the ladder, while a link that says the ladder opens in it. A link of November 10 to 13 always says one or the other, the default of its day included, since the value was written then whatever it was.

A link carries Closed Directory (2026-11-13) only when it is one of the trial's looks; its absence reads as the box ([Turn 7 of the November 13 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-13/2026-11-13.1.record.md#turn-7)).

Since 2026-11-15 ([November 15, Turn 1](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) a link carries Closed Directory only when it is not the skin with cells, and the skin's shape and its cells' colour only when they are not the folder's tab and the kinds' colours.

Files only is the default of Zoomed Out Fully since 2026-11-15, by the owner's eye and a comparison with the cards' rows drawn as bars ([Turn 1 of that day's record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)): a link now writes the cards' size when it is chosen and says nothing for files only, where for the trial's two days it was the other way about; a link of those days that says files only is read as saying nothing, which is the same picture.

Since 2026-11-15 ([Turn 1 of the November 15 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-1)) a link carries Descriptions Zoomed Out when it is not Hidden, and a link that carries the 2D map's settings without it opens Hidden, as with the other choices whose default is not written.

`returnCost` (0 to 5000 px of wire by 25) joined the 2D ranges on 2026-11-16, the continuing search's price of a reference read backward through a cycle, so that a shared link reopens the picture it was made from and a saved tuning keeps it; it belongs to no packing profile, and a link written before it keeps the viewer's own setting ([Turn 5 of the November 15 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-5)).

`beyondHops`, the 3D trial of what stands beyond the hops (2026-11-18, [Turn 10 of the November 18 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-10)), is carried only at the next step, and a link that carries the 3D settings without it opens at everything, as the 2D trials' choices are.

Since 2026-11-18 Hidden Files' default is Cells under name ([Turn 13 of the November 17 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-17/2026-11-17.1.record.md#turn-13)), first in `HIDDEN_FILES_LOOKS`, so a link carries Cells beside name or the count and nothing for the default. The rule did not change, only the list's order: a link of November 17 or 18 that carries the 2D map's settings and says nothing of Hidden Files was made with the count and now opens with the cells under the name; one that says "cells" opens as it did, and one that said "under" is read as silence, which is the same picture.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LayoutPreset` {#symbol-layoutpreset}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L5)

##### `LayoutPreset` — Summary
One packing preference interpreted by both Local Map representations.

#### `LayoutSettings` {#symbol-layoutsettings}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L11)

##### `LayoutSettings` — Summary
Portable numeric settings behind the presets and spatial encodings; older URLs may omit them.

#### `LAYOUT_RANGES` {#symbol-layout_ranges}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L17)

##### `LAYOUT_RANGES` — Summary
Public control minimum, maximum and step, also used when reading saved or shared values.

#### `LAYOUT_PRESETS` {#symbol-layout_presets}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L32)

##### `LAYOUT_PRESETS` — Summary
Packing defaults only: selecting a preset preserves coupling, symbol scaling and unrelated controls.

#### `applyLayoutPreset` {#symbol-applylayoutpreset}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L44)
- Returns: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig)
- Parameters: `tuning`: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig); `preset`: [`LayoutPreset`](#symbol-layoutpreset)

##### `applyLayoutPreset` — Summary
Return a fresh tuning record with both representations' packing set together.

#### `readLayoutSettings` {#symbol-readlayoutsettings}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L76)
- Returns: [`LayoutSettings`](#symbol-layoutsettings)

##### `readLayoutSettings` — Summary
Read only known settings: the finite numbers, bound to their public control ranges, and the named settings a link or a
saved tuning carries beside them: the 3D wrappers' look (2026-11-06, so that a shared link shows the group wrappers and
the directory shells without a switch), the 2D Zoom Looks (2026-11-10, so that a link shows the trial's three looks)
and how an opened directory stands (2026-11-12, so that the owner and the test agents compare that trial by link). Each
of the last two is carried only when it is not its default, and {@link applyLayoutSettings} reads its absence as the
default, so that a link shows what the build shows without a switch while a link that names the other choice still
opens in it. Zoom Looks: only the stepped ladder is carried since the three looks became the default (2026-11-13); a
link made between November 10 and 13 says either, since the default was written. Opened Directory: only the grid is
carried since Flow became the default (2026-11-13); a link made on November 12 or 13 says "flow" when Flow was chosen
and nothing when the grid was, so such a link now opens in Flow either way, and a link that says "grid" exists only
from now on. Closed Directory (2026-11-13): only a trial's look is carried, and its absence reads as today's box;
Descriptions Zoomed Out (2026-11-13) likewise: only the first line is carried, and its absence reads as hidden; and Hidden
Files (2026-11-17): only a choice other than the default is carried, and its absence reads as the default, which was
the count until 2026-11-18 and is Cells under name since; so a link of November 17 or 18 that carries Local Map
settings and says nothing of Hidden Files, made with the count, now opens with the cells under the name. Beyond the Hops (2026-11-18, a
trial of the 3D map): only the next step is carried, and its absence reads as everything. Arrival (2026-11-19) likewise:
only a choice other than the default is carried, and its absence reads as the default, which was reading size until
2026-11-22 and is the pull-back with its look changed after it since; so a link made before then that carries Local
Map settings and says nothing of Arrival, made at reading size, now opens with the pull-back, and one that says
"reading" exists only from now on. Arrival Waits and Wire Answers changed their defaults the same day, to waiting while
attended and to on, and read the same way. And Framing (2026-11-19), only Follows Pins, its absence reading as By Hand.
Scan Growth and Scan Pace (2026-11-22, a trial of the 3D map): only an order of arrival and the slower pace are
carried, their absence reading as off and as measured; and Drag (the same day), only Swings, its absence reading as
holding its ground. Unconnected (2026-11-23, a trial of the 2D map) likewise: only Dimmed or Folded is carried, and its
absence reads as Shown.

#### `layoutSettingsOf` {#symbol-layoutsettingsof}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L136)
- Returns: [`LayoutSettings`](#symbol-layoutsettings)
- Parameters: `tuning`: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig)

##### `layoutSettingsOf` — Summary
Snapshot the controls that affect packing and spatial encodings, independent of the current perspective.

#### `applyLayoutSettings` {#symbol-applylayoutsettings}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/layout-presets.ts#L151)
- Returns: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig)
- Parameters: `tuning`: [`TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig); `settings`: [`LayoutSettings`](#symbol-layoutsettings)

##### `applyLayoutSettings` — Summary
Merge a validated partial snapshot over the current values, leaving unrelated preferences intact. A snapshot that
carries the 2D map's settings without saying how an opened directory stands says Flow, the default, since only the
grid is written (2026-11-13); one that does not say its Zoom Looks says the three looks, since only the ladder is
written (2026-11-13); one that does not say its Closed Directory, its shape or its cells' colour says the skin with
cells, the folder's tab and the kinds' colours, the defaults since 2026-11-15 and 16, since only the other choices
are written; and one that does not say what the overview look draws says files only, since only cards at their size
is written (files only is the default since 2026-11-15; until then the link wrote files only and said nothing for
the cards' size, so a link of the trial's two days that says files only is read as saying nothing, which is the same
picture). So a link made with the defaults shows them in a browser whose own tuning holds the other choices.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ARRIVALS`](./types.ts.mdmd.md#symbol-arrivals)
- [`types.ARRIVAL_WAITS`](./types.ts.mdmd.md#symbol-arrival_waits)
- [`types.BEYOND_HOPS`](./types.ts.mdmd.md#symbol-beyond_hops)
- [`types.CLOSED_CELL_COLOURS`](./types.ts.mdmd.md#symbol-closed_cell_colours)
- [`types.CLOSED_DIRECTORY_LOOKS`](./types.ts.mdmd.md#symbol-closed_directory_looks)
- [`types.CLOSED_DIRECTORY_SHAPES`](./types.ts.mdmd.md#symbol-closed_directory_shapes)
- [`types.CUT_COUNTED`](./types.ts.mdmd.md#symbol-cut_counted)
- [`types.DESCRIPTIONS_ZOOMED_OUT`](./types.ts.mdmd.md#symbol-descriptions_zoomed_out)
- [`types.DIRECTION_MARKS`](./types.ts.mdmd.md#symbol-direction_marks)
- [`types.DIRECTORY_LAYOUTS`](./types.ts.mdmd.md#symbol-directory_layouts)
- [`types.DRAGS`](./types.ts.mdmd.md#symbol-drags)
- [`types.FRAMINGS`](./types.ts.mdmd.md#symbol-framings)
- [`types.ForceGraphTuning`](./types.ts.mdmd.md#symbol-forcegraphtuning) (type-only)
- [`types.GROUP_WRAPPERS`](./types.ts.mdmd.md#symbol-group_wrappers)
- [`types.HIDDEN_FILES_LOOKS`](./types.ts.mdmd.md#symbol-hidden_files_looks)
- [`types.LocalMapTuning`](./types.ts.mdmd.md#symbol-localmaptuning) (type-only)
- [`types.MIRROR_TURNS`](./types.ts.mdmd.md#symbol-mirror_turns)
- [`types.OVERVIEW_FILES`](./types.ts.mdmd.md#symbol-overview_files)
- [`types.SCAN_GROWTHS`](./types.ts.mdmd.md#symbol-scan_growths)
- [`types.SCAN_PACES`](./types.ts.mdmd.md#symbol-scan_paces)
- [`types.STEPS`](./types.ts.mdmd.md#symbol-steps)
- [`types.TuningConfig`](./types.ts.mdmd.md#symbol-tuningconfig) (type-only)
- [`types.UNCONNECTED_ROWS`](./types.ts.mdmd.md#symbol-unconnected_rows)
- [`types.WAY_DOWNS`](./types.ts.mdmd.md#symbol-way_downs)
- [`types.WIRE_ANSWERS`](./types.ts.mdmd.md#symbol-wire_answers)
- [`types.ZOOM_LOOKS`](./types.ts.mdmd.md#symbol-zoom_looks)
- [`camera-intent.ARRIVAL_REST_S`](./views/localView/camera-intent.ts.mdmd.md#symbol-arrival_rest_s)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
