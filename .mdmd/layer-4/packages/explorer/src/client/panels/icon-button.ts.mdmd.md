# packages/explorer/src/client/panels/icon-button.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/icon-button.ts
- Generated At: 2026-10-14T02:49:17.682Z

## Authored
### Purpose
Creates named SVG action buttons for the Local Map’s compact controls.

### Notes
The caller supplies application-owned SVG drawing markup and a human-readable name; the helper supplies the button type, tooltip and accessible label. Action state and behavior remain with the caller. The shared glyphs keep release and directory actions recognizable across the tray and membrane controls.

Introduced for the owner’s [October 14 pin-management request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `iconButton` {#symbol-iconbutton}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/icon-button.ts#L2)
- Returns: `HTMLButtonElement`

##### `iconButton` — Summary
A named, keyboard-accessible icon action. SVG content is supplied by the application, never by graph data.

#### `CLOSE_ICON` {#symbol-close_icon}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/icon-button.ts#L12)

##### `CLOSE_ICON` — Summary
The shared release glyph.

#### `DIRECTORY_ICON` {#symbol-directory_icon}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/icon-button.ts#L15)

##### `DIRECTORY_ICON` — Summary
A directory has containment, rather than the exposed-symbol marker of a file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
