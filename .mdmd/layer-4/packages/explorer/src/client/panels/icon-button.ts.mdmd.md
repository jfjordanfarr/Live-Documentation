# packages/explorer/src/client/panels/icon-button.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/icon-button.ts
- Generated At: 2026-10-20T14:51:18.193Z

## Authored
### Purpose
Creates named SVG action buttons for the Local Map’s compact controls.

### Notes
The caller supplies application-owned SVG drawing markup and a human-readable name; the helper supplies the button type, tooltip and accessible label. Action state and behavior remain with the caller. Shared glyphs cover release, directories, Pin, Centre and More, keeping the tray, membrane and projected 3D controls recognizable. A caller that changes an action's label or pressed state keeps the button itself, preserving keyboard focus.

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

#### `PIN_ICON` {#symbol-pin_icon}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/icon-button.ts#L18)

##### `PIN_ICON` — Summary
Retain the file or symbol's connections.

#### `CENTRE_ICON` {#symbol-centre_icon}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/icon-button.ts#L21)

##### `CENTRE_ICON` — Summary
Bring the named item to the centre of the map.

#### `MORE_ICON` {#symbol-more_icon}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/icon-button.ts#L24)

##### `MORE_ICON` — Summary
The item's additional commands.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
