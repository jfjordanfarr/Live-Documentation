# tests/e2e/history-panel.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/history-panel.spec.ts
- Generated At: 2026-10-30T15:34:02.437Z

## Authored
### Purpose
Holds the history's step panel over the scripted sample's bundle and, for a long subject and a step of many changes, over this repository's own: the compact panel as tall as its few lines with no list in it, clear of the control strip and the scrubber, its buttons in one place across steps, at a laptop size and a short one; a long subject in two lines cut with an ellipsis, whole in its title, the step's changes counted as the history file's own delta counts them; the "…" button opening a modal dialog with the whole subject and the groups over an inert page, by keyboard and pointer, Escape, its close button and the backdrop closing it with the focus back on the button; with the reader open beside the picture, Escape closing the dialog alone, the next Escape the reader's; opening it while playing pausing on the step shown, and closing it not playing on; a file chosen in it pinned at its moment, the dialog closed; the dialog fitting 900 by 700 and 480 by 800 without horizontal scroll, scrolling inside itself; the groups headed Created and Deleted, the owner's words of 2026-10-26, and never Born and Dead; the panel hidden by its own button and shown again by the scrubber's toggle, by pointer and keyboard, the scrubber staying, the choice holding across a step and forgotten when the history closes; a file pinned today and not yet created at a commit said so on its search chip, in the path report and in the reader's note; a path asked at a moment, by the address and by the destination field, running over that moment's wires, its report naming the commit and its hops named as the moment names them; and the destination field offering what a path reaches at the moment shown.

### Notes
- Written 2026-10-30 for the remediation item "History leaves the map intelligible" of [the Explorer's design](../../../layer-3/live-documentation-explorer.mdmd.md#remediation-work), planned in [Turn 2](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-2) of that day's record and accepted in [Turn 3](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3). Before it the panel's style pinned both its top and its bottom, so a one-line step got a panel the height of the picture. The bundle is `samples/history/`, built by `npm run live-docs:visualize:history-sample`; the commits are read from its own history file. The scripted repository changes no wire between two files that stand both today and at an earlier commit, so the moment's wires are told from today's by the names the path takes there (the core before it became the engine, the view before it became the screen), by the report's commit and by what the destination offers; the 3D view's drawing of the path at a moment is checked, though in this sample it would look the same had the view still followed the path's names to the moment itself.

Since 2026-10-31 (discovery, [Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)) the entries ask four hops from the start, which shows the whole scripted sample with nothing pinned, and the path check's file off the path is util.ts, in the model's folder, since the legacy helper stands four containment hops away in Structure and is not in the path's picture.

Since 2026-11-11 ([Turn 6 of the November 10 record](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-6)) the panel is compact and the whole step is in a dialog, by the owner's decision. Two cases of the old panel's promises were rewritten. "As tall as what the step says" at 1400 by 900 and 1280 by 800, and "a step longer than the room scrolls inside a panel that ends above the scrubber" at 1280 by 420, became "the compact panel is as tall as its few lines, holds no list and stands clear of the control strip and the scrubber, its buttons in one place at every step" at 1400 by 900 and 1280 by 420: the panel no longer lists the groups, so it neither grows with the step nor scrolls, and its edge is now measured against the control strip as well as the scrubber. The Created and Deleted case reads the dialog's groups and chooses a file there. The hide-and-show case holds as it was. The cases over this repository's bundle need its history (`npm run live-docs:history`) before the bundle is built, and find their commits by id, `85ba619f` for a subject of about a hundred characters and `e99d592d` for 45 files, 36 wires and 3 document links. Each new case was seen to fail with its defence broken in the built bundle: the subject's clamp removed, `show()` in place of `showModal()`, the backdrop's listener removed, the pause on opening removed, a choice that did not close the dialog, a fixed 720 px width, and the document's capture of keys removed (the reader then closed and the dialog stayed open).

Since 2026-11-06 (the breakpoint round's gate, [the closing work notes after Turn 26](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-26--november-6)) the path check reads each sphere once it has entered the moment's picture: the picture reveals its spheres over frames, the path's files first and util.ts, a hop beyond, after them, and that gate had read the picture one frame before util.ts was there.

The root added two cases the same day, with the camera's rule for a panel in the corner (`cornerPanelInsets` in `forceGraphCamera.ts`). "The camera frames the picture beside the compact panel" measures the spheres drawn at 1400 by 900: every one stands to the right of the panel and above the control strip, as beside the tall panel. "The compact panel stays when a reader opens" holds the reader's side: at 1400 px the panel stays; at 1000 px, where the reader leaves the picture a column with less than 320 px beside the panel, the panel stays and every sphere stands below it, inside the column; at 900 px, where the column itself is narrower than 320 px, the panel gives way. The tall panel was hidden at 1000 px, since nothing was left beside it; the case failed there with the old arithmetic restored in `index.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.choose`](./search-bar.ts.mdmd.md#symbol-choose)
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
<!-- LIVE-DOC:END Dependencies -->
