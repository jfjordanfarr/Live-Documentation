# packages/explorer/src/client/history/step-panel.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/step-panel.ts
- Generated At: 2026-10-20T21:28:54.136Z

## Authored
### Purpose
The step panel beside the 3D picture: the commit's subject, hash, date and, by the toggle, its author; then what the step changed, each group folded with its count and open when short, each file a button that pins it where it still exists today and words with "gone since" where it does not.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), from `step-summary.ts`. At the base it says the shape is the beginning of what is known, and why, when the history is cut there; while the thumb drags only the header is drawn. A file's row carries its archetype and symbol count at the step, since the docs of that day are not in the bundle; the hash is text a person can copy, with the full id on hover, and links no forge (the plan's fog). Groups of up to eight rows open; longer ones fold behind their count, whole, since a cut list hides what a person came to see. The panel stands on the left of the picture, the right being the detail panel's and the tray's; where it lives after the consolidation pass the owner expects is open.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the panel lists the documents linked and unlinked; a document is a button that reads today's version of it where the bundle carries it, and says "not in this bundle" where it does not.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StepPanelView` {#symbol-steppanelview}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-panel.ts#L24)

##### `StepPanelView` — Summary
The header, and the whole when the thumb rests.

#### `StepPanelOptions` {#symbol-steppaneloptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-panel.ts#L38)

##### `StepPanelOptions` — Summary
What the panel is made with.

#### `StepPanel` {#symbol-steppanel}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-panel.ts#L49)

##### `StepPanel` — Summary
The panel as the control drives it.

#### `createStepPanel` {#symbol-createsteppanel}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-panel.ts#L112)
- Returns: [`StepPanel`](#symbol-steppanel)
- Parameters: `options`: [`StepPanelOptions`](#symbol-steppaneloptions)

##### `createStepPanel` — Summary
Make the panel under its parent, hidden until synced.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`format.CommitInfo`](../../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-commitinfo) (type-only)
- [`graph-helpers.escapeHtml`](../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`step-summary.StepSummary`](./step-summary.ts.mdmd.md#symbol-stepsummary-interface)
- [`step-summary.SummaryDocLink`](./step-summary.ts.mdmd.md#symbol-summarydoclink)
- [`step-summary.SummaryEdge`](./step-summary.ts.mdmd.md#symbol-summaryedge)
- [`step-summary.SummaryFile`](./step-summary.ts.mdmd.md#symbol-summaryfile)
- [`step-summary.changeCount`](./step-summary.ts.mdmd.md#symbol-changecount)
<!-- LIVE-DOC:END Dependencies -->
