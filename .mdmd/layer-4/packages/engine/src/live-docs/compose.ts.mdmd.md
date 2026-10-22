# packages/engine/src/live-docs/compose.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/compose.ts
- Generated At: 2026-10-22T16:47:52.666Z

## Authored
### Purpose
Turns a source file's analysis into the document model: headings with unique anchors, links from type references and dependencies to the docs that declare them, and the documentation sections. The renderer in `document.ts` then writes the model out.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` as `rendering.ts`, which produced markdown lines directly; on 2026-09-27 it was recast to produce the model instead, and the line formatting moved into the grammar module.
- `computePublicSymbolHeadingInfo` disambiguates symbols that share a name (`Widget (interface)`, `draw (function overload 2)`) and keeps every anchor unique within a doc.
- A type reference resolves through the workspace symbol index. A type the file itself declares links within the doc, whatever other files declare under that name. Otherwise, among files of the same language, a declaration wins over a barrel that only re-exports the name, then the nearest file. A name never resolves into a file of another language (decided 2026-09-28 after the Local Map drew a wire no code justified).
- Dependencies are grouped by resolved file: an imported symbol links to an anchor only when the current workspace index records that anchor in its target doc, including a named or star re-export; otherwise the line keeps the known file link and imported name without inventing a fragment. A barrel's own re-export anchor keeps its name, but its link to the provider uses that provider's indexed heading, including a disambiguated same-name type/value heading; an index miss leaves the provider file link. An alias looks up the original name, and an external module keeps its specifier and the symbols taken from it. Standalone composition without an index retains its best-effort slug.
- `composeEntries` (2026-10-15, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) writes the `Entry` lines in a fixed order so that a doc is written the same way every run: `program` from the file's analysis, the heading at the declaration's line so that a namesake overload is not linked (found on Java's rosetta `Main.java`); the commands by name and the module from the entry index, each linking the manifest's doc; one `opening` per route, address, procedure, table, view or function served; `tooling` for a file a tool reads, by its name or place (`isToolingFile`), a manifest included by its name since 2026-10-16, when a Cargo workspace's root manifest, which publishes no package, showed the earlier rule by the manifest symbol's kind incomplete; and, from the evening of that day, by what it publishes as well, a package or a project, so that a manifest known only by its content, a PowerShell module's `.psd1`, is one while a data `.psd1` is not ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16)); `declared` for a configuration pattern matched by the archetype overrides' rule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `computePublicSymbolHeadingInfo` {#symbol-computepublicsymbolheadinginfo}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L60)
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
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L195)
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
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L526)
- Returns: [`Dependency`](./document.ts.mdmd.md#symbol-dependency)[]

##### `composeDependencies` — Summary
Composes the `Dependencies` section of a Live Doc.

##### `composeDependencies` — Remarks
A dependency that resolves inside the workspace becomes one line per imported
symbol, linking to a target anchor when the workspace index knows it and to
the file otherwise, or one line for the whole module when no symbol is named. An external dependency keeps
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

#### `composeCitedBy` {#symbol-composecitedby}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L727)
- Returns: [`CitedBy`](./document.ts.mdmd.md#symbol-citedby)[]

##### `composeCitedBy` — Summary
Composes the `Cited By` section: one line per document whose markdown links
name the file or its doc, the document's workspace-relative path as the
label and a link to it relative to the doc, in path order, so that a doc is
written the same way every run. Which documents cite the file is the
engine's rule, `citingDocuments`.

##### `composeCitedBy` — Parameters
- `args.docDir`: Absolute directory of the Live Doc being written; links are relative to it.
- `args.documents`: The citing documents' workspace-relative paths.
- `args.workspaceRoot`: Absolute path of the workspace, where the documents' paths start.

#### `composeEntries` {#symbol-composeentries}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L762)
- Returns: [`Entry`](./document.ts.mdmd.md#symbol-entry)[]

##### `composeEntries` — Summary
Composes the `Entry` lines of a doc: why something outside the code starts
the file, in a fixed order so that a doc is written the same way every run.

##### `composeEntries` — Remarks
`program` comes from the file's own analysis, its symbol linked when the doc
has it. `command` and `module` come from the manifests that declare the file,
as the workspace entry index recorded them. `opening` is one line per route,
address, procedure, table, view or function the file serves. A file is
`tooling` by its name or place ({@link isToolingFile}) or by what it
publishes, a package or a project, which makes a manifest known only by its
content, a PowerShell module's `.psd1`, one. `declared` is the
configuration's `entryPoints`. A test is an entry by its archetype and gets
no line here.

##### `composeEntries` — Parameters
- `args.analysis`: The file's analysis, for the program entry point.
- `args.config`: The configuration, for the declared entry points.
- `args.declaredBy`: What manifests declare about the file.
- `args.docDir`: Absolute directory of the Live Doc being written; links are relative to it.
- `args.docExtension`: File extension for Live Docs.
- `args.headings`: The symbols with their anchors, for the program's symbol, the openings and a manifest's package.
- `args.liveDocsRootAbsolute`: Absolute path to the Live Docs root.
- `args.sourceRelativePath`: Workspace-relative source path, for the rules by name.

#### `composeReExports` {#symbol-composereexports}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/compose.ts#L827)
- Returns: [`ReExport`](./document.ts.mdmd.md#symbol-reexport)[]

##### `composeReExports` — Summary
Composes the `Re-Exported Symbol Anchors` section: one anchor per symbol a
barrel re-exports. Its own heading uses the exported name; the provider link
uses that provider's actual indexed heading when the workspace index is present.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`index.getSyntaxByPath`](../languages/index.ts.mdmd.md#symbol-getsyntaxbypath)
- [`archetype.matchesPathPattern`](./archetype.ts.mdmd.md#symbol-matchespathpattern)
- [`coreConstants.RESERVED_HEADING_NAMES`](./coreConstants.ts.mdmd.md#symbol-reserved_heading_names)
- [`coreTypes.DeclaredBy`](./coreTypes.ts.mdmd.md#symbol-declaredby) (type-only)
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
- [`document.CitedBy`](./document.ts.mdmd.md#symbol-citedby) (type-only)
- [`document.Dependency`](./document.ts.mdmd.md#symbol-dependency) (type-only)
- [`document.DocSection`](./document.ts.mdmd.md#symbol-docsection) (type-only)
- [`document.Entry`](./document.ts.mdmd.md#symbol-entry) (type-only)
- [`document.ReExport`](./document.ts.mdmd.md#symbol-reexport) (type-only)
- [`document.ReferenceLine`](./document.ts.mdmd.md#symbol-referenceline) (type-only)
- [`document.SymbolBlock`](./document.ts.mdmd.md#symbol-symbolblock) (type-only)
- [`document.TypeRef`](./document.ts.mdmd.md#symbol-typeref) (type-only)
- [`openings.MANIFEST_KINDS`](./openings.ts.mdmd.md#symbol-manifest_kinds)
- [`openings.OPENING_KINDS`](./openings.ts.mdmd.md#symbol-opening_kinds)
- [`openings.isToolingFile`](./openings.ts.mdmd.md#symbol-istoolingfile)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-engine.mdmd.md`](../../../../../layer-3/live-documentation-engine.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../../layer-3/live-documentation-pipeline.mdmd.md)
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../../layer-3/openings.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
