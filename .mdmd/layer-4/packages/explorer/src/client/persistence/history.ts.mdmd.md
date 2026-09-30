# packages/explorer/src/client/persistence/history.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/persistence/history.ts
- Generated At: 2026-09-30T01:36:12.248Z

## Authored
### Purpose
The one place the Explorer writes its address: it decides whether a change is a new entry in the browser's history, which Back returns from, or a rewrite of the current one, and restores the page when Back or Forward lands on an entry.

### Notes
- Written on 2026-09-30 at the owner's ask for back and forward ("I am known to hop around navigating a lot"). Before it every write used `replaceState`, on purpose, so the browser's Back left the page.
- A move to another place is an entry; pins, expanded cards, pan and zoom rewrite the place's entry, so Back never walks through pin toggles (the owner: "we can split out the pinning history from the navigation history"). Which a write is comes from `place.ts`, from the parsed address.
- Writes before the first pointer, key or wheel input never add an entry, and every write in the same task as a new entry joins it, so one click that writes twice is one step back. Joining is by task rather than by time so that two quick clicks stay two steps.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HistoryEntry` {#symbol-historyentry}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/history.ts#L11)

##### `HistoryEntry` — Summary
What a write does to the history: a new entry, a rewrite of the current one, or nothing.

#### `HistoryWrite` {#symbol-historywrite}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/history.ts#L14)

##### `HistoryWrite` — Summary
Everything {@link entryFor} weighs.

#### `entryFor` {#symbol-entryfor}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/history.ts#L28)
- Returns: [`HistoryEntry`](#symbol-historyentry)
- Parameters: `write`: [`HistoryWrite`](#symbol-historywrite)

##### `entryFor` — Summary
Decides what one write to the address bar does to the history.

#### `startHistory` {#symbol-starthistory}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/history.ts#L75)

##### `startHistory` — Summary
Starts the history for this page: how to read a place from an address, and what to do when Back or Forward lands on
an entry. Returns a function that stops listening.

#### `commitUrl` {#symbol-commiturl}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/history.ts#L108)

##### `commitUrl` — Summary
Writes an address: a new entry when it names another place, a rewrite of the current entry when it does not.

#### `canGoBack` {#symbol-cangoback}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/history.ts#L133)

##### `canGoBack` — Summary
Whether Back would return to an earlier place on this page.

#### `canGoForward` {#symbol-cangoforward}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/history.ts#L138)

##### `canGoForward` — Summary
Whether Forward would return to a place this page left by Back.

#### `onHistoryChange` {#symbol-onhistorychange}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/persistence/history.ts#L143)

##### `onHistoryChange` — Summary
Calls `listener` whenever the current entry changes.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
