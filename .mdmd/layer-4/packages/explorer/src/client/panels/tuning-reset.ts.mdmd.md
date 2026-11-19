# packages/explorer/src/client/panels/tuning-reset.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/tuning-reset.ts
- Generated At: 2026-11-19T04:53:49.592Z

## Authored
### Purpose
Tuning's Reset to defaults and its undo, and the signs that a viewer's settings differ from the defaults: the count beside Tuning's heading, which shows with the section folded, and a dot on each changed lever and on the heading of each group that holds one.

### Notes
- Written on 2026-11-19 for the owner's request: "can you give me a button in Live Documentation Explorer to reset my stylings to the defaults? … so that the links you send me are perceived by both of us in the same way" ([Turn 27 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-27)).
- The reset follows the World Map's Reset layout, built the same night, so that the two resets are one idea: a toggle whose name stays "Reset to defaults" and whose pressed state says a second press will put the settings back as they were; its tooltip says which of the two it will do. A lever moved, or the page left, lets go of what it kept ([the design system's reversibility rule](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md#22-the-rules-of-the-grammar)).
- The settings it puts back go through the panel's own path for a lever's change (`apply`, given by `tuning.ts`): the palette and marbles the page wears, every control, the save and the address, and the picture drawn again. It writes into the tuning record the views hold, group by group, rather than replacing it.
- Whether the reset can still be taken back is decided at each refresh, which the panel runs after every change and every render: once anything differs from the defaults, it cannot. So a change made outside the panel, the 3D map's Hops or the history's play rate, lets go of it too.
- The reset is said once in the page's status region, as is its undo (`announce.ts`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TuningResetConfig` {#symbol-tuningresetconfig}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning-reset.ts#L20)

##### `TuningResetConfig` — Summary
What the reset needs of the Tuning panel.

#### `initTuningReset` {#symbol-inittuningreset}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/tuning-reset.ts#L34)
- Parameters: `config`: [`TuningResetConfig`](#symbol-tuningresetconfig)

##### `initTuningReset` — Summary
Wire Reset to defaults and the signs of a change. Returns `refresh`, which the panel calls after anything that may
have moved a setting: it counts the changed settings again, marks their levers, and, once something differs, lets go
of a reset that stood to be taken back.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`announce`](../announce.ts.mdmd.md#symbol-announce)
- [`tuning-changes.changedSettings`](./tuning-changes.ts.mdmd.md#symbol-changedsettings)
- [`tuning-changes.changedSettingsWords`](./tuning-changes.ts.mdmd.md#symbol-changedsettingswords)
- [`tuning-changes.tuningControlId`](./tuning-changes.ts.mdmd.md#symbol-tuningcontrolid)
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.ExplorerState`](../types.ts.mdmd.md#symbol-explorerstate) (type-only)
- [`types.TuningConfig`](../types.ts.mdmd.md#symbol-tuningconfig) (type-only)
- [`template.tuning-changed`](../../shared/template.html.mdmd.md#symbol-tuning-changed)
- [`template.tuning-changed-count`](../../shared/template.html.mdmd.md#symbol-tuning-changed-count)
- [`template.tuning-changed-words`](../../shared/template.html.mdmd.md#symbol-tuning-changed-words)
- [`template.tuning-reset`](../../shared/template.html.mdmd.md#symbol-tuning-reset)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
