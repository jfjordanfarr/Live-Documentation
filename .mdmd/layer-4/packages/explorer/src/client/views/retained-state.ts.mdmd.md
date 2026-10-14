# packages/explorer/src/client/views/retained-state.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/retained-state.ts
- Generated At: 2026-10-14T18:27:59.376Z

## Authored
### Purpose
Defines independent selection release, explicit directory bulk clearing, a common presentation order for the Local Map’s retained working set, the newest retained item, and the words for one.

### Notes
The file/symbol pin set and opened-directory set remain the sources of retention. Ordered identities are presentation metadata: surviving entries keep their position, new selections append and stale or duplicate identities are discarded. A directory release removes only that opening; bulk clearing removes selections throughout its subtree. References required by outside pins remain the responsibility of the shared graph-disclosure functions. Older links without a common chronology receive a deterministic fallback order.

Card actions and tray actions share the subject-release rule. An independent direct-file inspection survives releasing a directory or closing another card's optional symbol disclosure. A selected file whose own pin is released yields to a remaining pinned file; an explicit close or Clear all can also release the direct selection. This prevents an unpinned subject from silently retaining an unwanted branch or an unrelated close action from clearing the current inspection.

`newestRetained` and `describeRetained` (2026-10-14, [Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)): the newest item is where a path asked through the search bar starts, and the words for an item, its name, where it stands and a description, are shared by the pin tray and the bar's fields so that the two say the same thing.

Introduced for the owner’s [October 14 pin-management request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RetainedItem` {#symbol-retaineditem}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L5)

##### `RetainedItem` — Summary
One deliberate selection, independent of the neighbors it brings into view.

#### `RetainedState` {#symbol-retainedstate}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L10)

##### `RetainedState` — Summary
Retention and its oldest-first presentation order, shared by both Local Map representations.

#### `retainedKey` {#symbol-retainedkey}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L17)
- Parameters: `item`: [`RetainedItem`](#symbol-retaineditem)

##### `retainedKey` — Summary
Stable identity; a directory and a file with similar names cannot collide.

#### `retainedItems` {#symbol-retaineditems}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L24)
- Returns: [`RetainedItem`](#symbol-retaineditem)[]
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate)

##### `retainedItems` — Summary
Keep surviving selections in order and append newly retained items. Old links have a deterministic fallback.

#### `reconcileRetained` {#symbol-reconcileretained}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L44)
- Returns: [`RetainedState`](#symbol-retainedstate)
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate)

##### `reconcileRetained` — Summary
Normalize presentation metadata without changing what is retained.

#### `releaseRetained` {#symbol-releaseretained}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L49)
- Returns: [`RetainedState`](#symbol-retainedstate)
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate); `item`: [`RetainedItem`](#symbol-retaineditem)

##### `releaseRetained` — Summary
Release precisely this selection. Other selections, including opened descendants, survive.

#### `clearRetainedDirectory` {#symbol-clearretaineddirectory}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L63)
- Returns: [`RetainedState`](#symbol-retainedstate)
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate)

##### `clearRetainedDirectory` — Summary
Explicit bulk operation: release this directory and every deliberate selection within it.

#### `subjectAfterRelease` {#symbol-subjectafterrelease}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L72)
- Parameters: `previous`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset); `next`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset)

##### `subjectAfterRelease` — Summary
Keep an independent inspected file; replace it only when its own pin or explicit direct selection is released.

#### `newestRetained` {#symbol-newestretained}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L79)
- Returns: [`RetainedItem`](#symbol-retaineditem)
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate)

##### `newestRetained` — Summary
The most recently retained item, or null; a path a person asks for starts here.

#### `RetainedWords` {#symbol-retainedwords}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L84)

##### `RetainedWords` — Summary
The words for a retained item, shared by the tray and the search bar.

#### `describeRetained` {#symbol-describeretained}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L98)
- Returns: [`RetainedWords`](#symbol-retainedwords)
- Parameters: `item`: [`RetainedItem`](#symbol-retaineditem)

##### `describeRetained` — Summary
The words for an item; `nameOf` gives a file's name from its id.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`directory-state.under`](./localView/directory-state.ts.mdmd.md#symbol-under)
- [`pin-state.PinEntry`](./pin-state.ts.mdmd.md#symbol-pinentry)
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.removePin`](./pin-state.ts.mdmd.md#symbol-removepin)
<!-- LIVE-DOC:END Dependencies -->
