# packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-bundledmarkdownscanner-ts
- Generated At: 2026-09-27T02:03:41.348Z

## Authored
### Purpose
Scans Live Documentation files for markdown links and bundles the referenced files (READMEs, design notes, specs) for inclusion in the Explorer. This is what makes the "Related Documentation" tree and the Force Graph's related-doc nodes possible.

### Notes
- Extracted from `staticBuilder.ts` in January 2026 so the static builder and the (since retired) server runtime could share it
- Single hop only: bundles files linked directly from Live Docs and does not follow links inside them
- `exclude` patterns (the `bundleExclude` config field) drop matching links before anything is recorded, so excluded files never appear as related-document nodes either. Added 2026-09-27 to keep the chat archive out of the public Explorer bundle
- Resolves relative paths from Live Doc locations to workspace-relative paths
- `buildMarkdownTree()` creates a hierarchical directory structure for the collapsible tree UI in Knowledge Sources
- File categorization simplified to generic "markdown" type — no workspace-specific icons

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T02:03:41.348Z","inputHash":"01aded0c5cb23bcb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BundledMarkdownTreeNode` {#symbol-bundledmarkdowntreenode}
- Type: unknown
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L16)

#### `BundledMarkdownResult` {#symbol-bundledmarkdownresult}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L21)

##### `BundledMarkdownResult` — Summary
Result from scanning and bundling markdown files.

#### `extractMarkdownLinks` {#symbol-extractmarkdownlinks}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L38)

##### `extractMarkdownLinks` — Summary
Scan markdown content for links to other markdown files.
Returns workspace-relative paths (without anchors).

#### `categorizeMarkdownPath` {#symbol-categorizemarkdownpath}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L83)
- Returns: [`BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode)

##### `categorizeMarkdownPath` — Summary
Categorize a markdown file path.
Currently returns 'markdown' for all files - no special categorization.

#### `buildMarkdownTree` {#symbol-buildmarkdowntree}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L90)
- Returns: [`BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode)

##### `buildMarkdownTree` — Summary
Build a directory tree from a flat list of file paths.

#### `ScanBundledMarkdownOptions` {#symbol-scanbundledmarkdownoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L150)

##### `ScanBundledMarkdownOptions` — Summary
Options for scanning bundled markdown.

#### `scanAndBundleMarkdown` {#symbol-scanandbundlemarkdown}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/bundledMarkdownScanner.ts#L167)
- Parameters: `options`: [`ScanBundledMarkdownOptions`](#symbol-scanbundledmarkdownoptions)

##### `scanAndBundleMarkdown` — Summary
Scan Live Docs for markdown links and bundle the referenced files.
Single-hop only: bundles files directly linked from Live Docs, no nested traversal.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises`
- `minimatch` - `minimatch`
- [`staticExplorerData.BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode) (type-only)
- [`staticExplorerData.RelatedDocLink`](./staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- `path`
<!-- LIVE-DOC:END Dependencies -->
