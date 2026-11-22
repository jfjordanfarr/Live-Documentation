# `packages/explorer/src/client/views/retained-state.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/retained-state.ts`
- Generated At: 2026-11-22T07:12:56.577Z

## Authored
### Purpose
Defines independent selection release, explicit directory bulk clearing, a common presentation order for the Local Map’s retained working set, the newest retained item, and the words for one.

### Notes
The file/symbol pin set and opened-directory set remain the sources of retention. Ordered identities are presentation metadata: surviving entries keep their position, new selections append and stale or duplicate identities are discarded. A directory release removes only that opening; bulk clearing removes selections throughout its subtree. References required by outside pins remain the responsibility of the shared graph-disclosure functions. Older links without a common chronology receive a deterministic fallback order.

Card actions and tray actions share the subject-release rule. An independent direct-file inspection survives releasing a directory or closing another card's optional symbol disclosure. A selected file whose own pin is released yields to a remaining pinned file; an explicit close or Clear all can also release the direct selection. This prevents an unpinned subject from silently retaining an unwanted branch or an unrelated close action from clearing the current inspection.

`newestRetained` and `describeRetained` (2026-10-14, [Turn 6](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-14/2026-10-14.1.record.md#turn-6)): the newest item is where a path asked through the search bar starts, and the words for an item, its name, where it stands and a description, are shared by the pin tray and the bar's fields so that the two say the same thing.

Introduced for the owner’s [October 14 pin-management request](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-13/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RetainedItem` {#symbol-retaineditem}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L6)

##### `RetainedItem` — Summary
One deliberate selection, independent of the neighbors it brings into view.

#### `RetainedState` {#symbol-retainedstate}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L11)

##### `RetainedState` — Summary
Retention and its oldest-first presentation order, shared by both Local Map representations.

#### `retainedKey` {#symbol-retainedkey}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L18)
- Parameters: `item`: [`RetainedItem`](#symbol-retaineditem)

##### `retainedKey` — Summary
Stable identity; a directory and a file with similar names cannot collide.

#### `retainedItems` {#symbol-retaineditems}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L25)
- Returns: [`RetainedItem`](#symbol-retaineditem)[]
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate)

##### `retainedItems` — Summary
Keep surviving selections in order and append newly retained items. Old links have a deterministic fallback.

#### `reconcileRetained` {#symbol-reconcileretained}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L45)
- Returns: [`RetainedState`](#symbol-retainedstate)
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate)

##### `reconcileRetained` — Summary
Normalize presentation metadata without changing what is retained.

#### `releaseRetained` {#symbol-releaseretained}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L50)
- Returns: [`RetainedState`](#symbol-retainedstate)
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate); `item`: [`RetainedItem`](#symbol-retaineditem)

##### `releaseRetained` — Summary
Release precisely this selection. Other selections, including opened descendants, survive.

#### `clearRetainedDirectory` {#symbol-clearretaineddirectory}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L64)
- Returns: [`RetainedState`](#symbol-retainedstate)
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate); `item`: [`RetainedItem`](#symbol-retaineditem)

##### `clearRetainedDirectory` — Summary
Explicit bulk operation: release this directory and every deliberate selection within it.

#### `OthersStrength` {#symbol-othersstrength}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L78)

##### `OthersStrength` — Summary
How far "the others" go (the owner's approval of 2026-11-19 of one gesture at two strengths, chosen in the menu of the
thing kept): `fold` closes what is merely open elsewhere and keeps every pin; `unpin` does the same and releases every
other pin too.

#### `OthersContext` {#symbol-otherscontext}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L81)

##### `OthersContext` — Summary
What, beside the retained selections, decides what goes and what stays.

#### `OthersReleased` {#symbol-othersreleased}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L93)

##### `OthersReleased` — Summary
The selections after the others go, and what went, counted for the words the page says.

#### `releaseOthers` {#symbol-releaseothers}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L122)
- Returns: [`OthersReleased`](#symbol-othersreleased)
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate); `kept`: [`RetainedItem`](#symbol-retaineditem); `strength`: [`OthersStrength`](#symbol-othersstrength); `context`: [`OthersContext`](#symbol-otherscontext)

##### `releaseOthers` — Summary
"Fold others away" and "Unpin others" (the owner's ask of 2026-11-19, "release everything _except_ what I'm interacting
with now"): in one step, everything open elsewhere goes, and at the `unpin` strength every other pin too, as an
editor's Close Others keeps the tab whose menu it was chosen from. What is kept stays as it is where that keeps it in
the picture:
- a file (`kept` is its whole-file pin, symbol `*`) keeps every pin it holds, whole or narrowed to its symbols;
- a symbol keeps exactly its own pin, the file's other symbols released, or, its file pinned whole, that whole pin,
  which already holds it;
- a directory stays open, or popped;
- the discovery stays when it is the thing's own.
A file that holds no pin and is neither the subject nor the discovery is drawn only because something else shows it.
At the `unpin` strength that something goes, so the file is pinned instead, as the file or the symbol named, and
becomes the one pin. At the `fold` strength no pin changes, so the opened or popped directories that hold the file
stay open, since it may be drawn only inside them. A pinned file needs no directory: a pin is drawn wherever it stands,
and so is whatever any remaining pin shows. A pin whose file does not stand at a moment of the history shown is
released like any other. Nothing to release returns the input unchanged, with zero counts.

#### `othersReleasedWords` {#symbol-othersreleasedwords}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L164)

##### `othersReleasedWords` — Summary
The plain words that say once what went: "Unpinned 4 others, folded 2 directories away".

#### `subjectAfterRelease` {#symbol-subjectafterrelease}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L176)
- Parameters: `previous`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset); `next`: [`PinSet`](./pin-state.ts.mdmd.md#symbol-pinset)

##### `subjectAfterRelease` — Summary
Keep an independent inspected file; replace it only when its own pin or explicit direct selection is released.

#### `newestRetained` {#symbol-newestretained}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L183)
- Returns: [`RetainedItem`](#symbol-retaineditem)
- Parameters: `state`: [`RetainedState`](#symbol-retainedstate)

##### `newestRetained` — Summary
The most recently retained item, or null; a path a person asks for starts here.

#### `RetainedWords` {#symbol-retainedwords}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L188)

##### `RetainedWords` — Summary
The words for a retained item, shared by the tray and the search bar.

#### `describeRetained` {#symbol-describeretained}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/retained-state.ts#L202)
- Returns: [`RetainedWords`](#symbol-retainedwords)
- Parameters: `item`: [`RetainedItem`](#symbol-retaineditem)

##### `describeRetained` — Summary
The words for an item; `nameOf` gives a file's name from its id.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.DiscoveryTarget`](../types.ts.mdmd.md#symbol-discoverytarget) (type-only)
- [`directory-state.under`](./localView/directory-state.ts.mdmd.md#symbol-under)
- [`pin-state.EMPTY_PIN_SET`](./pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.PinEntry`](./pin-state.ts.mdmd.md#symbol-pinentry) (type-only)
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.addPin`](./pin-state.ts.mdmd.md#symbol-addpin)
- [`pin-state.isSymbolPinned`](./pin-state.ts.mdmd.md#symbol-issymbolpinned)
- [`pin-state.removePin`](./pin-state.ts.mdmd.md#symbol-removepin)
<!-- LIVE-DOC:END Dependencies -->
