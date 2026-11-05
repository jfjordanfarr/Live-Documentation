# packages/explorer/src/client/panels/item-menu.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/item-menu.ts
- Generated At: 2026-11-04T23:30:35.462Z

## Authored
### Purpose
Presents a transient, keyboard-accessible menu of application commands for a map entity, shared by More controls and contextual pointer gestures.

### Notes
Introduced for the owner's [inspection and direct-Pin interaction choice](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24), completed during [the October 20 continuation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). The menu knows commands and their labels, not map state or retention rules. Its native buttons support arrow keys, Home, End, Escape and Tab; outside presses, resizing and history navigation close it.

Closing returns focus before notifying the caller. This order lets a 3D action strip keep its opener visible while focus is in the menu, then release that temporary target after focus returns. The explicit lifetime fixes the keyboard-only case found in visual playtesting, where pointer hover no longer held the strip open.

The [November 4 learning-journey pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-04.1.record.md#turn-8) adds optional headings and secondary command details for connected-file lists. File paths distinguish identically named targets; all labels remain text. The menu still owns no graph or navigation policy. Its dispose operation removes the element and aborts its external listeners when a view-owned menu is released.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ItemCommand` {#symbol-itemcommand}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/item-menu.ts#L2)

##### `ItemCommand` — Summary
Contextual commands for a map entity, reached by More or the platform context-menu gesture.

#### `createItemMenu` {#symbol-createitemmenu}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/item-menu.ts#L9)

##### `createItemMenu` — Summary
A transient command menu. Application callbacks own every change it offers.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
