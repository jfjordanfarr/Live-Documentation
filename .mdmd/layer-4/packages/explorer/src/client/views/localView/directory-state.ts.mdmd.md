# packages/explorer/src/client/views/localView/directory-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/directory-state.ts
- Generated At: 2026-10-14T02:49:20.160Z

## Authored
### Purpose
The directories a person has opened in the Local Map, and the state each directory of a picture is in: closed, encasing or open, three states on one scale.

### Notes
The opened set is the only state; `directoryState` derives the rest: open when opened, encasing when a party file or an opened directory stands under it, else closed. `closeDirectory` releases only the named opening, preserving independently opened descendants. A directory with a required file or opened child remains encasing. Explicit subtree clearing belongs to the shared retained-state operations. This distinction was approved in [the October 14 pin-management request](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs), superseding the original close-with-descendants behavior. `under` is the common path test, with the scan root holding everything. The three-state grammar originated in [Turn 6 of the October 7 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-07.1.record.md#turn-6) and [the decisions log](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OpenDirectories` {#symbol-opendirectories}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-state.ts#L20)
- Returns: `ReadonlySet`

##### `OpenDirectories` — Summary
The directories opened, by path relative to the scan root.

#### `NO_OPEN_DIRECTORIES` {#symbol-no_open_directories}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-state.ts#L23)
- Returns: [`OpenDirectories`](#symbol-opendirectories)

##### `NO_OPEN_DIRECTORIES` — Summary
No directory opened: the picture as the pins alone make it.

#### `DirectoryState (type)` {#symbol-directorystate-type}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-state.ts#L26)

##### `DirectoryState (type)` — Summary
Where a directory stands on the scale: a box, a membrane around its party files, or a membrane around everything it holds.

#### `under` {#symbol-under}
- Type: const
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-state.ts#L29)

##### `under` — Summary
Whether a path is the directory or stands under it; the scan root, "", holds everything.

#### `openDirectory` {#symbol-opendirectory}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-state.ts#L33)
- Returns: [`OpenDirectories`](#symbol-opendirectories)
- Parameters: `opened`: [`OpenDirectories`](#symbol-opendirectories)

##### `openDirectory` — Summary
The set with the directory opened; the same set when it already was.

#### `closeDirectory` {#symbol-closedirectory}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-state.ts#L39)
- Returns: [`OpenDirectories`](#symbol-opendirectories)
- Parameters: `opened`: [`OpenDirectories`](#symbol-opendirectories)

##### `closeDirectory` — Summary
Release this opening, preserving independently opened descendants. Bulk clearing is a separate action.

#### `directoryState (function)` {#symbol-directorystate-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-state.ts#L50)
- Returns: [`DirectoryState`](#symbol-directorystate-type)
- Parameters: `opened`: [`OpenDirectories`](#symbol-opendirectories); `party`: `Iterable`

##### `directoryState (function)` — Summary
A directory's state: open when it is opened; encasing when a party file,
or another opened directory, stands under it; else closed.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
