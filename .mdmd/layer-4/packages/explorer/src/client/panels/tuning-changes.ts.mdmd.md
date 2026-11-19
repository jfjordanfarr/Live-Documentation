# packages/explorer/src/client/panels/tuning-changes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/tuning-changes.ts
- Generated At: 2026-11-19T06:00:10.105Z

## Authored
### Purpose
The one answer to "which of my Tuning settings differ from the defaults?": the list behind the count beside Tuning's heading, the dot on each changed lever and whether Reset to defaults has anything to do. It also names the lever that shows each setting, and the words the count says to a screen reader.

### Notes
- Written on 2026-11-19 for the owner's request for a reset ("so that the links you send me are perceived by both of us in the same way"; [Turn 27 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-27)). The agent sends the owner links and changes defaults as designs are chosen, while the owner's browser keeps whatever levers they once moved; the count says at a glance whether the two see the same picture.
- It reads `changedTuningFromDefaults` in `local-storage.ts`, the comparison the saved settings are written by, rather than comparing again, so that what the panel calls changed is exactly what the browser keeps ([the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences), "Reset to defaults").
- A lever is found from its setting by the template's naming: the group's prefix (`tuning-force-` for the 3D map, `tuning-history-` for the history, `tuning-` for the rest) and the key in kebab case. The test checks that every lever in the template is named this way, so a lever added under another name fails it instead of silently never showing its dot. A few settings have no lever (the order search's sweeps and seed, among others); they count, and carry no dot.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ChangedSetting` {#symbol-changedsetting}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning-changes.ts#L15)

##### `ChangedSetting` — Summary
One setting that differs from its default: its group and its key in that group.

#### `changedSettings` {#symbol-changedsettings}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning-changes.ts#L21)
- Returns: [`ChangedSetting`](#symbol-changedsetting)[]
- Parameters: `tuning`: [`TuningConfig`](../types.ts.mdmd.md#symbol-tuningconfig); `defaults`: [`TuningConfig`](../types.ts.mdmd.md#symbol-tuningconfig)

##### `changedSettings` — Summary
Every Tuning setting that differs from `defaults`, group by group in the order the tuning holds them.

#### `tuningControlId` {#symbol-tuningcontrolid}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning-changes.ts#L43)
- Parameters: `setting`: [`ChangedSetting`](#symbol-changedsetting)

##### `tuningControlId` — Summary
The element id of the control that sets a setting, by the template's naming: the group's prefix and the key in
kebab case (`forceGraph.linkGap` is `tuning-force-link-gap`). A setting no lever shows has no such element.

#### `changedSettingsWords` {#symbol-changedsettingswords}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning-changes.ts#L48)

##### `changedSettingsWords` — Summary
What the count beside Tuning's heading says to a screen reader and on hover.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.changedTuningFromDefaults`](../persistence/local-storage.ts.mdmd.md#symbol-changedtuningfromdefaults)
- [`types.TuningConfig`](../types.ts.mdmd.md#symbol-tuningconfig) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
