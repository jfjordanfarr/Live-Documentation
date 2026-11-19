# packages/explorer/src/client/panels/tuning-changes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/tuning-changes.ts

## Authored
### Purpose
The one answer to "which of my Tuning settings differ from the defaults?": the list behind the count beside Tuning's heading, the dot on each changed lever and whether Reset to defaults has anything to do. It also names the lever that shows each setting, and the words the count says to a screen reader.

### Notes
- Written on 2026-11-19 for the owner's request for a reset ("so that the links you send me are perceived by both of us in the same way"; [the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md), the turn after Turn 26). The agent sends the owner links and changes defaults as designs are chosen, while the owner's browser keeps whatever levers they once moved; the count says at a glance whether the two see the same picture.
- It reads `changedTuningFromDefaults` in `local-storage.ts`, the comparison the saved settings are written by, rather than comparing again, so that what the panel calls changed is exactly what the browser keeps ([the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences), "Reset to defaults").
- A lever is found from its setting by the template's naming: the group's prefix (`tuning-force-` for the 3D map, `tuning-history-` for the history, `tuning-` for the rest) and the key in kebab case. The test checks that every lever in the template is named this way, so a lever added under another name fails it instead of silently never showing its dot. A few settings have no lever (the order search's sweeps and seed, among others); they count, and carry no dot.
