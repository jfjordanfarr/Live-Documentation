# packages/engine/src/live-docs/history/sampling.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/sampling.ts
- Generated At: 2026-10-18T00:39:19.051Z

## Authored
### Purpose
Which commits of the mainline the history command regenerates: every commit, every n-th, the last of each UTC day or week, every tagged commit, and only those since a date; the first and the last of the window always.

### Notes
- Written 2026-10-17 for the generation half of C14 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md), the owner's "there is no one right granularity, depending on the size of the history. You try to run this over the VS Code repo and it probably explodes. You try to run this over a 5-commit throwaway project repo and every commit is precious" ([Turn 3 of October 17](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-17.1.record.md#turn-3)). The rule is written into the sequence's head.
- The deltas between two sampled commits are exact whatever is skipped; what sampling loses is the states between them, until a finer run regenerates them.
- A day's last commit is the last of a run of one UTC day along the mainline, which is the day's last while the mainline's dates rise, as they do.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `sampleChanges` {#symbol-samplechanges}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/sampling.ts#L28)
- Parameters: `sampling`: [`Sampling`](./format.ts.mdmd.md#symbol-sampling); `tagged`: `ReadonlySet`

##### `sampleChanges` — Summary
The indices of the changes the rule samples, ascending.

##### `sampleChanges` — Parameters
- `changes`: The mainline, oldest first.
- `sampling`: The rule, and the date the window begins at, if any.
- `tagged`: The ids of the changes a tag names, for the `tags` rule.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.Sampling`](./format.ts.mdmd.md#symbol-sampling) (type-only)
- [`versionControl.MainlineChange`](./versionControl.ts.mdmd.md#symbol-mainlinechange) (type-only)
<!-- LIVE-DOC:END Dependencies -->
