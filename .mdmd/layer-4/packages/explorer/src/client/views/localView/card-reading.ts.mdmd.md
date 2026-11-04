# packages/explorer/src/client/views/localView/card-reading.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/card-reading.ts
- Generated At: 2026-11-04T18:23:38.819Z

## Authored
### Purpose
Current on-map reading surface built from canonical file Purpose, exact symbol sections and recorded type references.

### Notes
The application owns deliberate reading choices; this module owns their controls and one temporary pointer or keyboard target. Only real pointer movement changes hover intent, so geometry-induced boundary events cannot oscillate disclosure. The controller measures and animates the stable card DOM, and restores the original scene after a preview visit. Full descriptions use the shared reader and link resolver. Missing prose is not fabricated.

Introduced during the [November 4 portrait integration](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

Keep-open intent is exposed with aria-pressed, while aria-expanded describes the content actually shown, including transient attention and semantic zoom. Preview intent ends when leaving the map; Escape yields to inspection and popovers, and inactive 2D does not consume keys. Empty Summary-only records do not create a blank reading control. A file-level overflow action remains reachable when Purpose is folded. See the [integration record](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-2).

A structural redraw retains physical pointer coordinates and deliberate dismissal. It is not new pointer input, and restoring focus after Fold must not reopen the text. The keyboard-fold browser case protects both the held choice and native focus.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReadingTarget` {#symbol-readingtarget}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L13)

##### `ReadingTarget` — Summary
The file Purpose or exact symbol temporarily being read; never a new retained neighborhood.

#### `CardReadingOptions` {#symbol-cardreadingoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L16)

##### `CardReadingOptions` — Summary
Canonical text, application-owned choices and the native layout's geometry transaction.

#### `CardReading` {#symbol-cardreading}
- Type: class
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-reading.ts#L51)

##### `CardReading` — Summary
Builds on-card explanations from the same bundled docs as the full reader. Pointer intent is delegated to the
stable map container: layout-generated boundary events cannot start another preview. Geometry changes belong
to the controller, which measures and animates the existing card elements without rebuilding them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.TypeRef`](../../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-typeref) (type-only)
- [`graph.GraphFile`](../../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph-helpers.escapeHtml`](../../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`markdown.renderMarkdown`](../../markdown.ts.mdmd.md#symbol-rendermarkdown)
- [`reader-links.ReaderLinkContext`](../../reader-links.ts.mdmd.md#symbol-readerlinkcontext)
- [`reader-links.createReaderLinkHandler`](../../reader-links.ts.mdmd.md#symbol-createreaderlinkhandler)
- [`reader-sections.authoredSections`](../../reader-sections.ts.mdmd.md#symbol-authoredsections)
- [`reading-state.ReadingChoice`](../../reading-state.ts.mdmd.md#symbol-readingchoice)
- [`reading-state.descriptionIsOpen`](../../reading-state.ts.mdmd.md#symbol-descriptionisopen)
- [`types.InspectionTarget`](../../types.ts.mdmd.md#symbol-inspectiontarget) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
