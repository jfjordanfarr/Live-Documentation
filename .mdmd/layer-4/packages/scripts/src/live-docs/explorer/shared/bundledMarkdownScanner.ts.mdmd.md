# packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-bundledmarkdownscanner-ts
- Generated At: 2026-01-08T19:09:21.662Z

## Authored
### Purpose
Scans Live Documentation files for markdown links and bundles referenced files (READMEs, chat history, MDMD specs, etc.) for inclusion in the Explorer visualization. This enables the "Related Documentation" feature in the Knowledge Sources panel.

### Notes
- Extracted from `staticBuilder.ts` during Dev Day 53 (2026-01-07) to create a shared module usable by both static builder and server runtime
- Uses BFS traversal with configurable `maxDepth` (default 2) to discover linked markdown files
- Resolves relative paths from Live Doc locations to workspace-relative paths
- `buildMarkdownTree()` creates a hierarchical directory structure for the collapsible tree UI in Knowledge Sources
- File categorization simplified to generic "markdown" type — no workspace-specific icons

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-08T19:09:21.662Z","inputHash":"16a67ee10a6f329a"}]} -->
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
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L35)

##### `extractMarkdownLinks` — Summary
Scan markdown content for links to other markdown files.
Returns workspace-relative paths (without anchors).

#### `categorizeMarkdownPath` {#symbol-categorizemarkdownpath}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L80)
- Returns: [`BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode)

##### `categorizeMarkdownPath` — Summary
Categorize a markdown file path.
Currently returns 'markdown' for all files - no special categorization.

#### `buildMarkdownTree` {#symbol-buildmarkdowntree}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L87)
- Returns: [`BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode)

##### `buildMarkdownTree` — Summary
Build a directory tree from a flat list of file paths.

#### `ScanBundledMarkdownOptions` {#symbol-scanbundledmarkdownoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L147)

##### `ScanBundledMarkdownOptions` — Summary
Options for scanning bundled markdown.

#### `scanAndBundleMarkdown` {#symbol-scanandbundlemarkdown}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L164)
- Parameters: `options`: [`ScanBundledMarkdownOptions`](#symbol-scanbundledmarkdownoptions)

##### `scanAndBundleMarkdown` — Summary
Scan Live Docs for markdown links and bundle the referenced files.
Single-hop only: bundles files directly linked from Live Docs, no nested traversal.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises` - `fs`
- [`staticExplorerData.BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode) (type-only)
- [`staticExplorerData.RelatedDocLink`](./staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- `path` - `path`
<!-- LIVE-DOC:END Dependencies -->
