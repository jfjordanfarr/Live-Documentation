# packages/scripts/src/live-docs/explorer/client/views/localView/card-factory.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/card-factory.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-card-factory-ts
- Generated At: 2026-02-03T21:55:36.216Z

## Authored
### Purpose
Creates individual node cards for the Local Map view. Each card displays artifact metadata, public symbols, and provides interaction targets for hover/click/pin behaviors.

### Notes
Extracted from render.ts during Dev Day 50 (12/19). The `createNodeCard()` function builds the DOM structure for each artifact in the three-column layout, including symbol sections and type badges.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.216Z","inputHash":"ee5e3ea3dde6bc65"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createNodeCard` {#symbol-createnodecard}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/card-factory.ts#L25)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `createNodeCard` — Summary
Creates a node card element for the Local Map view.

##### `createNodeCard` — Parameters
- `columnRole`: The role of the column this card belongs to
- `controller`: The LocalViewController instance
- `hopIndex`: Optional hop index for multi-hop visualization
- `node`: The node data to render

##### `createNodeCard` — Returns
The created card element

#### `createSymbolSection` {#symbol-createsymbolsection}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/card-factory.ts#L151)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller); `node`: [`ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

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
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/card-factory.ts#L318)
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
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/card-factory.ts#L369)
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
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](../../../shared/types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
- [`types.ExplorerTypeReference`](../../../shared/types.ts.mdmd.md#symbol-explorertypereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->
