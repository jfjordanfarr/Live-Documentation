# packages/explorer/src/client/panels/pin-tray.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/pin-tray.ts
- Generated At: 2026-10-14T02:49:17.813Z

## Authored
### Purpose
Makes retained directories, files and symbols individually reachable and releasable in either Local Map representation.

### Notes
Rows use stable selection identities and appear newest first. Updating the list preserves surviving elements and transfers keyboard focus when the selected row disappears. A whole-file selection is one entry; directory bulk clearing is a separately named action. The tray delegates all selection changes to the application, collapses when Details opens and keeps its handle available. Its order comes from the shared exploration snapshot, rather than from the arrangement of cards on screen.

Introduced for the owner’s [October 14 pin-management request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PinTrayOptions` {#symbol-pintrayoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/pin-tray.ts#L6)

##### `PinTrayOptions` — Summary
Actions operate on the shared selection; opening the tray or focusing a row does not retain anything.

#### `createPinTray` {#symbol-createpintray}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/pin-tray.ts#L16)
- Parameters: `options`: [`PinTrayOptions`](#symbol-pintrayoptions)

##### `createPinTray` — Summary
A newest-first working set with stable row elements and a persistent collapse handle.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`icon-button.CLOSE_ICON`](./icon-button.ts.mdmd.md#symbol-close_icon)
- [`icon-button.DIRECTORY_ICON`](./icon-button.ts.mdmd.md#symbol-directory_icon)
- [`icon-button.iconButton`](./icon-button.ts.mdmd.md#symbol-iconbutton)
- [`retained-state.RetainedItem`](../views/retained-state.ts.mdmd.md#symbol-retaineditem)
- [`retained-state.RetainedState`](../views/retained-state.ts.mdmd.md#symbol-retainedstate)
- [`retained-state.retainedItems`](../views/retained-state.ts.mdmd.md#symbol-retaineditems)
- [`retained-state.retainedKey`](../views/retained-state.ts.mdmd.md#symbol-retainedkey)
- [`template.detail-close`](../../shared/template.html.mdmd.md#symbol-detail-close)
- [`template.detail-panel`](../../shared/template.html.mdmd.md#symbol-detail-panel)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
