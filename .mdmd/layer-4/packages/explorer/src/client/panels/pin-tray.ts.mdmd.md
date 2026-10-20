# packages/explorer/src/client/panels/pin-tray.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/pin-tray.ts
- Generated At: 2026-10-20T14:51:18.239Z

## Authored
### Purpose
Presents the retained working set in either Local Map representation, with stable rows for showing and releasing files, symbols and directories. Delegates changes to the application and preserves keyboard access as rows or the tray disappear.

### Notes
Rows use stable selection identities and appear newest first. Updating the list preserves surviving elements and transfers keyboard focus when the selected row disappears. Closing the tray while a row holds focus returns it to the toggle. A whole-file selection is one entry; directory bulk clearing is a separately named action. Its order comes from the shared exploration snapshot, rather than from the arrangement of cards on screen. The words of a row come from `describeRetained` (2026-10-14), shared with the search bar.

Opening calls the application's `onOpen` hook; the application coordinates the reader and tray through that callback and the tray's `close` operation. Neither a synthetic click on the reader's Close button nor a mutation observer decides shared state. This preserves the explicit ownership required by the [inspect-first implementation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). Showing a retained item and changing retention remain separate application operations.

Introduced for the owner’s [October 14 pin-management request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

At a moment of the history (2026-10-18, ticket C4 of [the change-over-time plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) and its scenario 9) a pin whose thing does not stand there is said so on its row, "not yet born" for a file and "nothing under it at this commit" for a directory, faint beneath its words, and never dropped; the client gives `sync` the words through `absent`.

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
- Source: [source](../../../../../../../packages/explorer/src/client/panels/pin-tray.ts#L22)
- Parameters: `options`: [`PinTrayOptions`](#symbol-pintrayoptions)

##### `createPinTray` — Summary
A newest-first working set with stable row elements and a persistent collapse handle. At a moment of the history a
pin whose thing does not stand there is said so on its row, never dropped (the plan's scenario 9, 2026-10-18); `absent`
gives the words, or null when the pin stands.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`icon-button.CLOSE_ICON`](./icon-button.ts.mdmd.md#symbol-close_icon)
- [`icon-button.DIRECTORY_ICON`](./icon-button.ts.mdmd.md#symbol-directory_icon)
- [`icon-button.iconButton`](./icon-button.ts.mdmd.md#symbol-iconbutton)
- [`retained-state.RetainedItem`](../views/retained-state.ts.mdmd.md#symbol-retaineditem)
- [`retained-state.RetainedState`](../views/retained-state.ts.mdmd.md#symbol-retainedstate)
- [`retained-state.describeRetained`](../views/retained-state.ts.mdmd.md#symbol-describeretained)
- [`retained-state.retainedItems`](../views/retained-state.ts.mdmd.md#symbol-retaineditems)
- [`retained-state.retainedKey`](../views/retained-state.ts.mdmd.md#symbol-retainedkey)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
