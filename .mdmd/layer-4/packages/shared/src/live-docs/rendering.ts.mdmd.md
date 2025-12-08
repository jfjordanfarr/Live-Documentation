# packages/shared/src/live-docs/rendering.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/rendering.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-rendering-ts
- Generated At: 2025-12-07T21:41:19.426Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:19.426Z","inputHash":"1ffb795efc6e1406"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `computePublicSymbolHeadingInfo` {#symbol-computepublicsymbolheadinginfo}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/rendering.ts#L52)
- Returns: [`PublicSymbolHeadingInfo`](./core.ts.mdmd.md#symbol-publicsymbolheadinginfo)[]
- Parameters: `symbols`: [`PublicSymbolEntry`](./core.ts.mdmd.md#symbol-publicsymbolentry)[]

##### `computePublicSymbolHeadingInfo` — Summary
Computes display names and slugs for public symbol headings.

##### `computePublicSymbolHeadingInfo` — Remarks
Handles disambiguation when multiple symbols share the same name,
and ensures slugs are unique within the document.

##### `computePublicSymbolHeadingInfo` — Parameters
- `symbols`: Array of public symbol entries to process

##### `computePublicSymbolHeadingInfo` — Returns
Array of heading info with display names and slugs

#### `renderPublicSymbolLines` {#symbol-renderpublicsymbollines}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/rendering.ts#L199)

##### `renderPublicSymbolLines` — Summary
Renders the markdown lines that populate the `Public Symbols` section for a Live Doc.

##### `renderPublicSymbolLines` — Remarks
The output includes symbol metadata (type, location, qualifiers) followed by
deterministic `#####` subsections per documented field (summary, remarks,
parameters, returns, etc.). This structure keeps docstring bridges stable and
individually addressable across languages.

##### `renderPublicSymbolLines` — Parameters
- `args.analysis`: Analyzer output describing exported symbols and dependencies.
- `args.docDir`: Absolute directory path of the Live Doc being written.
- `args.headings`: Pre-computed heading info for symbols.
- `args.liveDocsRootAbsolute`: Absolute path to the Live Docs root.
- `args.sourceAbsolute`: Absolute path to the source file backing this Live Doc.
- `args.sourceRelativePath`: Workspace-relative source path.
- `args.symbolIndex`: Optional workspace-wide symbol index for resolving type references.
- `args.workspaceRoot`: Workspace root, used to resolve relative links.

##### `renderPublicSymbolLines` — Returns
An array of markdown lines ready to insert beneath the `Public Symbols` heading.

##### `renderPublicSymbolLines` — Links
- `renderDependencyLines`

#### `renderDependencyLines` {#symbol-renderdependencylines}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/rendering.ts#L657)

##### `renderDependencyLines` — Summary
Renders the markdown bullet list for a Live Doc's `Dependencies` section.

##### `renderDependencyLines` — Remarks
Module specifiers that resolve inside the workspace are linked directly to
their Live Doc counterparts, while external dependencies are emitted as inline
code with optional symbol suffixes.

##### `renderDependencyLines` — Parameters
- `args.analysis`: Analyzer output describing imported and re-exported modules.
- `args.docDir`: Directory containing the Live Doc being written.
- `args.docExtension`: File extension for Live Docs (e.g., ".mdmd.md").
- `args.headings`: Symbol heading info for anchor resolution.
- `args.liveDocsRootAbsolute`: Absolute path to the Live Docs mirror root.
- `args.workspaceRoot`: Workspace root used to compute relative links.

##### `renderDependencyLines` — Returns
Markdown lines suitable for the `Dependencies` section, or an empty array when none exist.

##### `renderDependencyLines` — Links
- `renderPublicSymbolLines` — *

#### `renderReExportedAnchorLines` {#symbol-renderreexportedanchorlines}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/rendering.ts#L806)

##### `renderReExportedAnchorLines` — Summary
Renders the markdown for the Re-Exported Symbol Anchors section.

##### `renderReExportedAnchorLines` — Parameters
- `args.docDir`: Directory containing the Live Doc being written
- `args.docExtension`: File extension for Live Docs
- `args.liveDocsRootAbsolute`: Absolute path to the Live Docs mirror root
- `args.reExports`: Array of re-exported symbol info

##### `renderReExportedAnchorLines` — Returns
Markdown lines for re-exported anchors, or empty array if none
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`coreConstants.RESERVED_HEADING_NAMES`](./coreConstants.ts.mdmd.md#symbol-reserved_heading_names)
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.PublicSymbolHeadingInfo`](./coreTypes.ts.mdmd.md#symbol-publicsymbolheadinginfo) (type-only)
- [`coreTypes.ReExportedSymbolInfo`](./coreTypes.ts.mdmd.md#symbol-reexportedsymbolinfo) (type-only)
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.SourceAnalysisResult`](./coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`coreTypes.TypeReference`](./coreTypes.ts.mdmd.md#symbol-typereference) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`coreUtils.createSymbolSlug`](./coreUtils.ts.mdmd.md#symbol-createsymbolslug)
- [`coreUtils.displayDependencyKey`](./coreUtils.ts.mdmd.md#symbol-displaydependencykey)
- [`coreUtils.formatDependencyQualifier`](./coreUtils.ts.mdmd.md#symbol-formatdependencyqualifier)
- [`coreUtils.formatInlineCode`](./coreUtils.ts.mdmd.md#symbol-formatinlinecode)
- [`coreUtils.formatRelativePathFromDoc`](./coreUtils.ts.mdmd.md#symbol-formatrelativepathfromdoc)
- [`coreUtils.formatSourceLink`](./coreUtils.ts.mdmd.md#symbol-formatsourcelink)
- [`coreUtils.toModuleLabel`](./coreUtils.ts.mdmd.md#symbol-tomodulelabel)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](./adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./adapters/csharp.hangfire.test.ts.mdmd.md)
- [powershell.test.ts](./adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./adapters/python.docstring.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./adapters/ruby.docstring.test.ts.mdmd.md)
- [rust.docstring.test.ts](./adapters/rust.docstring.test.ts.mdmd.md)
- [core.docstring.test.ts](./core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
