# packages/explorer/src/client/views/localView/directory-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/directory-state.ts
- Generated At: 2026-10-08T02:07:21.441Z

## Authored
### Purpose
The directories a person has opened in the Local Map, and the state each directory of a picture is in: closed, encasing or open, three states on one scale.

### Notes
The opened set is the only state; `directoryState` derives the rest: open when opened, encasing when a party file or an opened directory stands under it, else closed. `closeDirectory` takes a directory and everything opened under it, so closing a directory closes what it holds; a directory with a party file under it then reads as encasing, never closed, which is the owner's analogy of a pinned file's provider that cannot be unpinned below what the pins need. `under` is the one path test, with the scan root holding everything. The owner's grammar of [Turn 6 of the October 7 session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-07.1.record.md#turn-6) is recorded in [the decisions log](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08).

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
The set without the directory and everything opened under it: closing a directory closes what it holds.

#### `directoryState (function)` {#symbol-directorystate-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/directory-state.ts#L48)
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
