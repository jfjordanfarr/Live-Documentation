# packages/explorer/src/client/views/localView/card-factory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/card-factory.ts
- Generated At: 2026-10-19T17:42:50.608Z

## Authored
### Purpose
Creates individual node cards for the Local Map view. Each card displays artifact metadata, public symbols, and provides interaction targets for hover/click/pin behaviors.

### Notes

- Since 2026-10-05 the card draws its symbol rows alphabetically when that symbol order is chosen in Tuning, wherever a card is drawn; the layout order is applied afterwards by the branch renderer, for every scope, and the order of appearance is the Live Doc's.
Extracted from render.ts during Dev Day 50 (12/19). The `createNodeCard()` function builds the DOM structure for each artifact in the shared scene, including symbol sections and type badges. The factory now receives only card presentation values, anchor registration and named actions from the controller. Cards are rebuilt inside retained wrappers on each render: their initial pressed and selected appearance reflects that render, while events resolve pins and type targets through the live controller at the moment of interaction.

File bodies retain all interfaces; row buttons press individual symbols (narrow, add, release, fall back) and support keyboard use. The X releases the file's expansion while leaving any interfaces required by other pins visible, and stands on the subject's card whether or not it is pinned. The recentre control (2026-10-15, [Turns 8 to 10](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-8); [the decision](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#clicks-pin-what-they-name-and-the-subject-stays-where-it-is-recorded-2026-10-15)) on every card but the subject's makes the file the subject, the one visible way to go there: the double-click that did it reached the card's click twice first and pinned two files whole, as the night's click-only journey found ([the probe record](../../../../../../../../AI-Agent-Workspace/Probes/2026-10-14/pin-clicks/README.md)); one grammar for every input has no double-click. Type badges retain their source row and expose the referenced artifact's evidence.
- `createClosedDirectory` (2026-10-08, [the decisions log](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): a closed directory's box, a pseudo-node without symbols in the membrane's style, named and counted by `countsOf` ("81 files, 2 directories"), a button that opens the directory in place; it carries no pin, since a directory with a party file under it is at least encasing and no wire ever reaches a closed box. `countsOf` also words a label's count of what an encasing membrane hides.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CardPresentation` {#symbol-cardpresentation}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L18)

##### `CardPresentation` — Summary
The values a fresh card reads while it is built. The wrapper may survive a render, but its card is rebuilt.

#### `CardContext` {#symbol-cardcontext}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L30)

##### `CardContext` — Summary
Only the facts and actions a card needs; navigation targets are looked up when their event occurs.

#### `createNodeCard` {#symbol-createnodecard}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L50)
- Parameters: `context`: [`CardContext`](#symbol-cardcontext); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `createNodeCard` — Summary
Creates a node card element for the Local Map view.

##### `createNodeCard` — Parameters
- `columnRole`: The role of the column this card belongs to
- `context`: The card's presentation inputs and live actions
- `node`: The node data to render

##### `createNodeCard` — Returns
The created card element

#### `createClosedDirectory` {#symbol-createcloseddirectory}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L183)
- Parameters: `context`: [`CardContext`](#symbol-cardcontext); `closed`: [`ClosedDirectory`](./branches.ts.mdmd.md#symbol-closeddirectory)

##### `createClosedDirectory` — Summary
A closed directory's box: a pseudo-node with no symbols in the membrane's
style, named and counted, that opens in place on a click (the owner's
grammar, 2026-10-08). It carries no pin: a directory with a party file
under it is at least encasing, so no wire ever reaches a closed box.

#### `countsOf` {#symbol-countsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L206)

##### `countsOf` — Summary
"3 files, 2 directories", either part left out at zero; "empty" when both are.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.SymbolOrder`](../../types.ts.mdmd.md#symbol-symbolorder) (type-only)
- [`branches.ClosedDirectory`](./branches.ts.mdmd.md#symbol-closeddirectory)
- [`branches.compareSymbolNames`](./branches.ts.mdmd.md#symbol-comparesymbolnames)
- [`directory-bands.parentDirectory`](./directory-bands.ts.mdmd.md#symbol-parentdirectory)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../../../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](../../../shared/types.ts.mdmd.md#symbol-explorertypereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->
