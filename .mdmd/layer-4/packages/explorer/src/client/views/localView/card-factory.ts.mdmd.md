# packages/explorer/src/client/views/localView/card-factory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/card-factory.ts
- Generated At: 2026-10-08T01:58:14.145Z

## Authored
### Purpose
Creates individual node cards for the Local Map view. Each card displays artifact metadata, public symbols, and provides interaction targets for hover/click/pin behaviors.

### Notes

- Since 2026-10-05 the card draws its symbol rows alphabetically when that symbol order is chosen in Tuning, wherever a card is drawn; the layout order is applied afterwards by the branch renderer, where there is a layout, and the order of appearance is the Live Doc's.
Extracted from render.ts during Dev Day 50 (12/19). The `createNodeCard()` function builds the DOM structure for each artifact in the three-column layout, including symbol sections and type badges.

File bodies retain all interfaces; row buttons toggle individual symbols and support keyboard use. The X releases the file's expansion while leaving any interfaces required by other pins visible. Type badges retain their source row and expose the referenced artifact's evidence.
- `createClosedDirectory` (2026-10-08, [the decisions log](../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#directories-open-and-close-inside-the-local-map-three-states-on-one-scale-recorded-2026-10-08)): a closed directory's box, a pseudo-node without symbols in the membrane's style, named and counted by `countsOf` ("81 files, 2 directories"), a button that opens the directory in place; it carries no pin, since a directory with a party file under it is at least encasing and no wire ever reaches a closed box. `countsOf` also words a label's count of what an encasing membrane hides.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createNodeCard` {#symbol-createnodecard}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L26)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `createNodeCard` — Summary
Creates a node card element for the Local Map view.

##### `createNodeCard` — Parameters
- `columnRole`: The role of the column this card belongs to
- `controller`: The LocalViewController instance
- `hopIndex`: Optional hop index for multi-hop visualization
- `node`: The node data to render

##### `createNodeCard` — Returns
The created card element

#### `createClosedDirectory` {#symbol-createcloseddirectory}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L159)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `closed`: [`ClosedDirectory`](./branches.ts.mdmd.md#symbol-closeddirectory)

##### `createClosedDirectory` — Summary
A closed directory's box: a pseudo-node with no symbols in the membrane's
style, named and counted, that opens in place on a click (the owner's
grammar, 2026-10-08). It carries no pin: a directory with a party file
under it is at least encasing, so no wire ever reaches a closed box.

#### `countsOf` {#symbol-countsof}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L182)

##### `countsOf` — Summary
"3 files, 2 directories", either part left out at zero; "empty" when both are.

#### `createSymbolSection` {#symbol-createsymbolsection}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L199)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `createSymbolSection` — Summary
Creates the symbol section for a node card, including all public symbols
and the "Internals" pseudo-symbol.

##### `createSymbolSection` — Parameters
- `columnRole`: The role of the column
- `controller`: The LocalViewController instance
- `hopIndex`: Optional hop index for multi-hop visualization
- `node`: The node data

##### `createSymbolSection` — Returns
The symbol section element

#### `createTypeReferenceIndicator` {#symbol-createtypereferenceindicator}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L375)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `typeRefs`: [`ExplorerTypeReference`](../../../shared/types.ts.mdmd.md#symbol-explorertypereference)[]

##### `createTypeReferenceIndicator` — Summary
Creates a type reference indicator element showing what types a symbol references.

##### `createTypeReferenceIndicator` — Parameters
- `controller`: The LocalViewController instance
- `typeRefs`: The type references to display

##### `createTypeReferenceIndicator` — Returns
The indicator element

#### `createTypeBadge` {#symbol-createtypebadge}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/card-factory.ts#L426)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `refs`: [`ExplorerTypeReference`](../../../shared/types.ts.mdmd.md#symbol-explorertypereference)[]

##### `createTypeBadge` — Summary
Creates a single type badge element for a group of type references.

##### `createTypeBadge` — Parameters
- `controller`: The LocalViewController instance
- `icon`: The icon to display
- `kind`: The kind of reference (return, param, extends, implements)
- `refs`: The type references for this badge

##### `createTypeBadge` — Returns
The badge element
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layoutUtils.ROOT_KEY`](../layoutUtils.ts.mdmd.md#symbol-root_key)
- [`layoutUtils.getDirectoryKey`](../layoutUtils.ts.mdmd.md#symbol-getdirectorykey)
- [`branches.ClosedDirectory`](./branches.ts.mdmd.md#symbol-closeddirectory)
- [`branches.compareSymbolNames`](./branches.ts.mdmd.md#symbol-comparesymbolnames)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../../../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](../../../shared/types.ts.mdmd.md#symbol-explorertypereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->
