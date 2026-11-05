# packages/explorer/src/client/views/localView/card-reading.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/card-reading.ts
- Generated At: 2026-11-05T15:19:44.516Z

## Authored
### Purpose
Current on-map reading surface built from canonical file Purpose, exact symbol sections and recorded type references, opened and folded by a tap on a name or on the book beside it.

### Notes
The application owns deliberate reading choices; this module owns their controls, the names that share them and the text itself. A description opens and folds only by a deliberate act: `toggle` serves the book beside a description and, through the card context, the name it belongs to. A symbol's name opens its own description; the file's name opens its Purpose and every described symbol, or folds them when all are kept visible. Hover draws no text and moves nothing, the owner's verdict of [November 5](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-05.1.record.md#turn-1): expansion on hover was "too difficult and finicky to actually work as a human end user with a computer mouse". The controller holds the card's name still while the layout grows, and focus returns to the control used. Full descriptions use the shared reader and link resolver. Missing prose is not fabricated; a card with nothing to open returns false from `toggle` so that its name can inspect instead.

Introduced during the [November 4 portrait integration](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2) with hover and keyboard-focus previews, an intent timer, dismissals and Escape; the [November 5 repair](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-9) scoped requested presentation to a file or exact symbol so that overview folding could not veto a direct request. That scoping stays: the book offers Fold only when its descriptions are being kept visible, a suppressed description offers Read, an outward scale change clears scoped requests, and pans and inward zoom retain them. The previews and their machinery were removed on November 5 rather than repaired further. Keep-open intent is exposed with aria-pressed on the books; aria-expanded on books and names describes the content actually shown, including semantic zoom. Empty Summary-only records do not create a blank reading control. A file-level overflow action remains reachable when Purpose is folded.

The [November 4 learning-journey pass](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8) turns canonical outbound/inbound file counts into accessible menus near the card introduction. Choosing a file invokes ordinary subject navigation, without pinning it. The branch renderer supplies the displayed ranking's return references separately, so cycle annotations cannot be mistaken for additional graph facts. Their menu names both endpoints and navigates to the other file. A witness path from the engine’s existing breadth-first walk explains the complete file dependency cycle, including intermediate files; duplicate basenames use their paths. The transient menu closes on a structural redraw and is disposed with the reading surface.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReadingTarget` {#symbol-readingtarget}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L16)

##### `ReadingTarget` — Summary
A file's Purpose or one exact symbol's description, named by the card it is read on.

#### `CardReadingOptions` {#symbol-cardreadingoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L19)

##### `CardReadingOptions` — Summary
Canonical text, application-owned choices and the actions a card's text can lead to.

#### `CardReading` {#symbol-cardreading}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L57)

##### `CardReading` — Summary
Builds on-card explanations from the same bundled docs as the full reader. A description opens and folds only
by a deliberate action, a tap on the name it belongs to or on the book beside it; hover draws no text and moves
nothing (the owner's verdict of 2026-11-05: expansion on hover was "too difficult and finicky to actually work
as a human end user with a computer mouse"). The application saves every choice, so what a person opened is
what a shared link shows. Geometry changes belong to the controller and the renderer, which hold the acted-on
name still while the card grows or shrinks around it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.TypeRef`](../../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-typeref) (type-only)
- [`graph.GraphFile`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`pathfind.pathTo`](../../../../../engine/src/live-docs/pathfind.ts.mdmd.md#symbol-pathto)
- [`pathfind.walk`](../../../../../engine/src/live-docs/pathfind.ts.mdmd.md#symbol-walk-function)
- [`graph-helpers.escapeHtml`](../../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`markdown.renderMarkdown`](../../markdown.ts.mdmd.md#symbol-rendermarkdown)
- [`item-menu.createItemMenu`](../../panels/item-menu.ts.mdmd.md#symbol-createitemmenu)
- [`reader-links.ReaderLinkContext`](../../reader-links.ts.mdmd.md#symbol-readerlinkcontext)
- [`reader-links.createReaderLinkHandler`](../../reader-links.ts.mdmd.md#symbol-createreaderlinkhandler)
- [`reader-sections.authoredSections`](../../reader-sections.ts.mdmd.md#symbol-authoredsections)
- [`reading-state.ReadingChoice`](../../reading-state.ts.mdmd.md#symbol-readingchoice)
- [`reading-state.descriptionIsOpen`](../../reading-state.ts.mdmd.md#symbol-descriptionisopen)
- [`types.InspectionTarget`](../../types.ts.mdmd.md#symbol-inspectiontarget) (type-only)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`types.ReadingControl`](./types.ts.mdmd.md#symbol-readingcontrol) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
