# packages/explorer/src/client/history/step-panel.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/step-panel.ts
- Generated At: 2026-11-11T07:33:49.673Z

## Authored
### Purpose
The step panel beside the 3D picture and the dialog that shows the whole step. The panel is compact: the commit's subject in at most two lines, the hash, date, by the toggle the author, and the step, then one line counting what the step changed. Its "…" button opens a modal dialog with the whole subject and every group the step changed, each group folded with its count and open when short, each file a button that retains it at the moment it exists, with "gone since" naming a later removal, each document a button that reads today's version.

### Notes
- Built 2026-10-18 for ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions), from `step-summary.ts`. At the base it says the shape is the beginning of what is known, and why, when the history is cut there; while the thumb drags only the header is drawn. A file's row carries its archetype and symbol count at the step, since the docs of that day are not in the bundle; the hash is text a person can copy, with the full id on hover, and links no forge (the plan's fog). Groups of up to eight rows open; longer ones fold behind their count, whole, since a cut list hides what a person came to see. The panel stands on the left of the picture, the right being the detail panel's and the tray's; where it lives after the consolidation pass the owner expects is open.
- Since 2026-10-20 ([Turn 9](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) the panel lists the documents linked and unlinked; a document is a button that reads today's version of it where the bundle carries it, and says "not in this bundle" where it does not.

- Since 2026-10-30 ([Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)) the panel has its own button, "Hide step details", at its top right, outside the words each step redraws; the scrubber's toggle brings it back. It is as tall as what the step says (`history.css`).

The [November 1 repairs](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-2) made every historical file actionable, including Deleted, whose action opens the preceding moment. The `at` field travels with each row; a disclosure chevron makes folded groups recognizable.

- Since 2026-11-11 ([Turn 6 of the November 10 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-6)) the panel is compact and the whole step is in a dialog. The owner: "that rather large and annoying text blob that blocks nearly half the usable screen real estate by default during the history mode ... I think the big commit texts should be relegated to "..." as we've done with descriptions, with a click engaging some kind of modal to render the full text." At this repository's step 695 the old panel was 390 by 801 px over a picture of 1,179 by 910 and ran under the control strip. The panel now holds the subject in a two-line slot cut with an ellipsis (the whole subject is its `title`, and the dialog's heading), the meta line, and one line of counts from `countWords` (files once each, wires, document links, whole-directory renames, the nonzero ones only), or the base's note, or the sentence for a commit the docs saw nothing of; while the thumb drags, the subject and the meta alone. The history file carries a commit's subject, id, date and author and no message body, so "the full text" is the whole subject and everything the step changed. The quick actions on a commit's changed files the owner mused about in the same message are an idea put back to the owner, not built.
- The "…" button ("Show the whole step", `aria-haspopup="dialog"`) and the hide button stand in the header outside the words each step redraws, so they keep their place as steps go by. The dialog is a native `<dialog>` opened with `showModal()`, labelled by its heading, its listeners attached in code since the page's policy forbids inline handlers. The page behind is inert. Escape, its close button and a press and release on the backdrop close it, and the focus returns to the "…" button. Choosing a file or a document closes it first, so that the pinned file or the reader is seen. While it is open no key reaches the page's own listeners: they are stopped on the document's capture, wherever the focus is, so Escape closes the dialog alone. Before this, the reader's Escape listener on the document could close the reader and cancel the dialog's own closing whenever the focus had left the dialog's buttons; a review of the diff found it, and a browser case holds it. The dialog itself is focusable, so a click on its words or a redraw under the focus leaves the focus in it. Opening it pauses a playing history and closing it does not play on: the root's choice, since reading a step means stopping on it. If the step shown changes while it is open (by Back or Forward), it shows the step shown. Hiding the panel closes it. The dialog's body is drawn only while it is open, so playback draws the compact panel alone.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StepPanelView` {#symbol-steppanelview}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-panel.ts#L37)

##### `StepPanelView` — Summary
The header, and the whole when the thumb rests.

#### `StepPanelOptions` {#symbol-steppaneloptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-panel.ts#L51)

##### `StepPanelOptions` — Summary
What the panel is made with.

#### `StepPanel` {#symbol-steppanel}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-panel.ts#L66)

##### `StepPanel` — Summary
The panel as the control drives it.

#### `createStepPanel` {#symbol-createsteppanel}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/history/step-panel.ts#L153)
- Returns: [`StepPanel`](#symbol-steppanel)
- Parameters: `options`: [`StepPanelOptions`](#symbol-steppaneloptions)

##### `createStepPanel` — Summary
Make the panel and its dialog under their parent, hidden until synced.
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
- [`step-summary.countWords`](./step-summary.ts.mdmd.md#symbol-countwords)
- [`step-summary.stepCounts`](./step-summary.ts.mdmd.md#symbol-stepcounts-function)
- [`icon-button.CLOSE_ICON`](../panels/icon-button.ts.mdmd.md#symbol-close_icon)
- [`icon-button.MORE_ICON`](../panels/icon-button.ts.mdmd.md#symbol-more_icon)
- [`icon-button.iconButton`](../panels/icon-button.ts.mdmd.md#symbol-iconbutton)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
