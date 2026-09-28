# packages/engine/src/live-docs/compose.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/compose.ts
- Generated At: 2026-09-28T17:01:35.415Z

## Authored
### Purpose
Turns a source file's analysis into the document model: headings with unique anchors, links from type references and dependencies to the docs that declare them, and the documentation sections. The renderer in `document.ts` then writes the model out.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` as `rendering.ts`, which produced markdown lines directly; on 2026-09-27 it was recast to produce the model instead, and the line formatting moved into the grammar module.
- `computePublicSymbolHeadingInfo` disambiguates symbols that share a name (`Widget (interface)`, `draw (function overload 2)`) and keeps every anchor unique within a doc.
- A type reference resolves through the workspace symbol index. A type the file itself declares links within the doc, whatever other files declare under that name. Otherwise, among files of the same language, a declaration wins over a barrel that only re-exports the name, then the nearest file. A name never resolves into a file of another language (decided 2026-09-28 after the Local Map drew a wire no code justified).
- Dependencies are grouped by resolved file: an imported symbol links to its anchor, an alias links to the original name, and an external module keeps its specifier and the symbols taken from it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `computePublicSymbolHeadingInfo` {#symbol-computepublicsymbolheadinginfo}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L56)
- Returns: [`PublicSymbolHeadingInfo`](./coreTypes.ts.mdmd.md#symbol-publicsymbolheadinginfo)[]
- Parameters: `symbols`: [`PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry)[]

##### `computePublicSymbolHeadingInfo` — Summary
Computes display names and slugs for public symbol headings.

##### `computePublicSymbolHeadingInfo` — Remarks
Handles disambiguation when multiple symbols share the same name,
and ensures slugs are unique within the document.

##### `computePublicSymbolHeadingInfo` — Parameters
- `symbols`: Array of public symbol entries to process

##### `computePublicSymbolHeadingInfo` — Returns
Array of heading info with display names and slugs

#### `composeSymbolBlocks` {#symbol-composesymbolblocks}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L191)
- Returns: [`SymbolBlock`](./document.ts.mdmd.md#symbol-symbolblock)[]

##### `composeSymbolBlocks` — Summary
Composes the `Public Symbols` section of a Live Doc.

##### `composeSymbolBlocks` — Parameters
- `args.docDir`: Absolute directory of the Live Doc being written; links are relative to it.
- `args.headings`: The symbols with their display names and anchors, from {@link computePublicSymbolHeadingInfo}.
- `args.liveDocsRootAbsolute`: Absolute path of the Live Docs root.
- `args.sourceAbsolute`: Absolute path of the source file, for the `Source:` links.
- `args.sourceRelativePath`: Workspace-relative source path, so a type declared in this file links within the doc.
- `args.symbolIndex`: The workspace symbol index that resolves a type name to the doc that declares it.

#### `composeDependencies` {#symbol-composedependencies}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L522)
- Returns: [`Dependency`](./document.ts.mdmd.md#symbol-dependency)[]

##### `composeDependencies` — Summary
Composes the `Dependencies` section of a Live Doc.

##### `composeDependencies` — Remarks
A dependency that resolves inside the workspace becomes one line per imported
symbol, each linking to the symbol's anchor in the target doc, or one line
for the whole module when no symbol is named. An external dependency keeps
its specifier and the symbols taken from it. A dependency observed from a
contract or from configuration carries its basis as a qualifier, on lines of
its own even when a source-observed dependency names the same file.

##### `composeDependencies` — Parameters
- `args.analysis`: Analyzer output describing imported and re-exported modules.
- `args.docDir`: Directory containing the Live Doc being written.
- `args.docExtension`: File extension for Live Docs (e.g., ".mdmd.md").
- `args.headings`: Symbol heading info for anchor resolution within the current file.
- `args.liveDocsRootAbsolute`: Absolute path to the Live Docs mirror root.
- `args.symbolIndex`: The workspace symbol index, for anchors in other files.

#### `composeReExports` {#symbol-composereexports}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L711)
- Returns: [`ReExport`](./document.ts.mdmd.md#symbol-reexport)[]

##### `composeReExports` — Summary
Composes the `Re-Exported Symbol Anchors` section: one anchor per symbol a
barrel re-exports, linking to the module it comes from.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`index.getSyntaxByPath`](../languages/index.ts.mdmd.md#symbol-getsyntaxbypath)
- [`coreConstants.RESERVED_HEADING_NAMES`](./coreConstants.ts.mdmd.md#symbol-reserved_heading_names)
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.PublicSymbolHeadingInfo`](./coreTypes.ts.mdmd.md#symbol-publicsymbolheadinginfo) (type-only)
- [`coreTypes.ReExportedSymbolInfo`](./coreTypes.ts.mdmd.md#symbol-reexportedsymbolinfo) (type-only)
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.SourceAnalysisResult`](./coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`coreTypes.TypeReference`](./coreTypes.ts.mdmd.md#symbol-typereference) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`coreUtils.createProximityAwareComparator`](./coreUtils.ts.mdmd.md#symbol-createproximityawarecomparator)
- [`coreUtils.createSymbolSlug`](./coreUtils.ts.mdmd.md#symbol-createsymbolslug)
- [`coreUtils.displayDependencyKey`](./coreUtils.ts.mdmd.md#symbol-displaydependencykey)
- [`coreUtils.formatInlineCode`](./coreUtils.ts.mdmd.md#symbol-formatinlinecode)
- [`coreUtils.formatRelativePathFromDoc`](./coreUtils.ts.mdmd.md#symbol-formatrelativepathfromdoc)
- [`coreUtils.toModuleLabel`](./coreUtils.ts.mdmd.md#symbol-tomodulelabel)
- [`document.Dependency`](./document.ts.mdmd.md#symbol-dependency) (type-only)
- [`document.DocSection`](./document.ts.mdmd.md#symbol-docsection) (type-only)
- [`document.ReExport`](./document.ts.mdmd.md#symbol-reexport) (type-only)
- [`document.ReferenceLine`](./document.ts.mdmd.md#symbol-referenceline) (type-only)
- [`document.SymbolBlock`](./document.ts.mdmd.md#symbol-symbolblock) (type-only)
- [`document.TypeRef`](./document.ts.mdmd.md#symbol-typeref) (type-only)
<!-- LIVE-DOC:END Dependencies -->
