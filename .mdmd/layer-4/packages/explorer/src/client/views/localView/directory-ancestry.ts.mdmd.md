# packages/explorer/src/client/views/localView/directory-ancestry.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/directory-ancestry.ts
- Generated At: 2026-10-14T02:49:20.088Z

## Authored
### Purpose
Provides ancestor navigation attached to a directory membrane without adding a permanent row of breadcrumb labels to the map.

### Notes
The disclosure opens in the browser’s top layer at viewport text size, so it stays usable when the diagram is zoomed out. A short stack of ancestor buttons opens the selected directory through the ordinary retention operation. Hover/focus previews an enclosure around currently drawn members only; it makes no claim to show every file in that ancestor. Escape and outside clicks dismiss the disclosure and remove the preview.

Introduced for the owner’s [October 14 pin-management request](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ancestryButton` {#symbol-ancestrybutton}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-ancestry.ts#L7)
- Returns: `HTMLButtonElement`
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)

##### `ancestryButton` — Summary
A compact entrance into a directory's ancestors; names unfold at viewport text size.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`icon-button.iconButton`](../../panels/icon-button.ts.mdmd.md#symbol-iconbutton)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`directory-bands.parentDirectory`](./directory-bands.ts.mdmd.md#symbol-parentdirectory)
- [`directory-state.under`](./directory-state.ts.mdmd.md#symbol-under)
- [`template.main`](../../../shared/template.html.mdmd.md#symbol-main)
<!-- LIVE-DOC:END Dependencies -->
