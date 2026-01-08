# packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-bundledmarkdownscanner-ts
- Generated At: 2026-01-08T04:27:40.954Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-08T04:27:40.954Z","inputHash":"84103a9cb704082f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BundledMarkdownTreeNode` {#symbol-bundledmarkdowntreenode}
- Type: unknown
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L13)

#### `BundledMarkdownResult` {#symbol-bundledmarkdownresult}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L18)

##### `BundledMarkdownResult` — Summary
Result from scanning and bundling markdown files.

#### `extractMarkdownLinks` {#symbol-extractmarkdownlinks}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L33)

##### `extractMarkdownLinks` — Summary
Scan markdown content for links to other markdown files.
Returns workspace-relative paths (without anchors).

#### `categorizeMarkdownPath` {#symbol-categorizemarkdownpath}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L78)
- Returns: [`BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode)

##### `categorizeMarkdownPath` — Summary
Categorize a markdown file path.
Currently returns 'markdown' for all files - no special categorization.

#### `buildMarkdownTree` {#symbol-buildmarkdowntree}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L85)
- Returns: [`BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode)

##### `buildMarkdownTree` — Summary
Build a directory tree from a flat list of file paths.

#### `ScanBundledMarkdownOptions` {#symbol-scanbundledmarkdownoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L145)

##### `ScanBundledMarkdownOptions` — Summary
Options for scanning bundled markdown.

#### `scanAndBundleMarkdown` {#symbol-scanandbundlemarkdown}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L162)
- Parameters: `options`: [`ScanBundledMarkdownOptions`](#symbol-scanbundledmarkdownoptions)

##### `scanAndBundleMarkdown` — Summary
Scan Live Docs for markdown links and bundle the referenced files.
Uses breadth-first traversal with depth limit to avoid infinite recursion.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises` - `fs`
- [`staticExplorerData.BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode) (type-only)
- `path` - `path`
<!-- LIVE-DOC:END Dependencies -->
