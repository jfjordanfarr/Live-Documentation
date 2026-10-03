# packages/explorer/src/client/views/localView/branch-renderer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/branch-renderer.ts
- Generated At: 2026-10-03T02:21:29.115Z

## Authored
### Purpose

Renders independently retained branches using the Local Map’s existing cards, symbol pins and interface colors.

### Notes

Wraps native cards in the Membrane Map’s cross-column directory bands while preserving dependency ranks. Keeps explicit pins and the selected file legible, mutes unrelated rows, and shows counts for symbols or connections outside the current disclosure.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderBranches` {#symbol-renderbranches}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/branch-renderer.ts#L8)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)

##### `renderBranches` — Summary
Extend the native card grammar to the independently retained branches.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branches.buildBranches`](./branches.ts.mdmd.md#symbol-buildbranches)
- [`column-factory.createHierarchicalColumn`](./column-factory.ts.mdmd.md#symbol-createhierarchicalcolumn)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
- [`pin-layout.DirectoryBand`](../membraneView/pin-layout.ts.mdmd.md#symbol-directoryband)
- [`pin-layout.FlowNode`](../membraneView/pin-layout.ts.mdmd.md#symbol-flownode)
- [`pin-layout.computeDirectoryBands`](../membraneView/pin-layout.ts.mdmd.md#symbol-computedirectorybands)
- [`pin-layout.computeLCA`](../membraneView/pin-layout.ts.mdmd.md#symbol-computelca)
- [`pin-layout.parentDirectory`](../membraneView/pin-layout.ts.mdmd.md#symbol-parentdirectory)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->
