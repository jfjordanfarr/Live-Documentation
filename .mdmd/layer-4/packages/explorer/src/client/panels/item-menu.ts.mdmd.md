# packages/explorer/src/client/panels/item-menu.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/item-menu.ts
- Generated At: 2026-10-20T14:51:18.212Z

## Authored
### Purpose
Presents a transient, keyboard-accessible menu of application commands for a map entity, shared by More controls and contextual pointer gestures.

### Notes
Introduced for the owner's [inspection and direct-Pin interaction choice](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-24), completed during [the October 20 continuation](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2). The menu knows commands and their labels, not map state or retention rules. Its native buttons support arrow keys, Home, End, Escape and Tab; outside presses, resizing and history navigation close it.

Closing returns focus before notifying the caller. This order lets a 3D action strip keep its opener visible while focus is in the menu, then release that temporary target after focus returns. The explicit lifetime fixes the keyboard-only case found in visual playtesting, where pointer hover no longer held the strip open.

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
- Source: [source](../../../../../../../packages/explorer/src/client/panels/item-menu.ts#L8)

##### `createItemMenu` — Summary
A transient command menu. Application callbacks own every change it offers.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
