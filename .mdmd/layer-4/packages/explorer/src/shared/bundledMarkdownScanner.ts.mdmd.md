# packages/explorer/src/shared/bundledMarkdownScanner.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/bundledMarkdownScanner.ts
- Generated At: 2026-10-20T21:28:56.217Z

## Authored
### Purpose
Bundles the documents the Live Docs link to (READMEs, design notes, specs, chat summaries) for the Explorer's reader and its Related Docs, and builds the tree Knowledge Sources lists them in. Which documents a doc links to is the engine's `relatedDocsOf`, read from the graph.

### Notes
- Extracted from `staticBuilder.ts` in January 2026 so the static builder and the (since retired) server runtime could share it
- Single hop only: bundles files linked directly from Live Docs and does not follow links inside them
- Since 2026-10-20 ([Turn 9](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9)) it no longer finds the links: `bundleRelatedDocs` takes them from `relatedDocsOf`, the rule the history also reads at every past commit, and the scan of each doc's rendered text, the path resolution and the `bundleExclude` patterns (added 2026-09-27 to keep the chat archive out of the public bundle) went to the engine with it. A link to a document that cannot be read is dropped with it, so the Related Docs name only what the bundle carries. The module keeps the name of its scanning days.
- `buildMarkdownTree()` creates a hierarchical directory structure for the collapsible tree UI in Knowledge Sources
- File categorization simplified to generic "markdown" type — no workspace-specific icons

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `BundledMarkdownTreeNode` {#symbol-bundledmarkdowntreenode}
- Type: unknown
- Source: [source](../../../../../../packages/explorer/src/shared/bundledMarkdownScanner.ts#L17)

#### `BundledMarkdownResult` {#symbol-bundledmarkdownresult}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/bundledMarkdownScanner.ts#L22)

##### `BundledMarkdownResult` — Summary
The bundled documents, their tree, and the links to them.

#### `categorizeMarkdownPath` {#symbol-categorizemarkdownpath}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/shared/bundledMarkdownScanner.ts#L33)
- Returns: [`BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode)

##### `categorizeMarkdownPath` — Summary
Categorize a markdown file path.
Currently returns 'markdown' for all files - no special categorization.

#### `buildMarkdownTree` {#symbol-buildmarkdowntree}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/shared/bundledMarkdownScanner.ts#L40)
- Returns: [`BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode)

##### `buildMarkdownTree` — Summary
Build a directory tree from a flat list of file paths.

#### `BundleRelatedDocsOptions` {#symbol-bundlerelateddocsoptions}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/bundledMarkdownScanner.ts#L100)

##### `BundleRelatedDocsOptions` — Summary
Options for bundling the documents the Live Docs link to.

#### `bundleRelatedDocs` {#symbol-bundlerelateddocs}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/shared/bundledMarkdownScanner.ts#L113)
- Parameters: `options`: [`BundleRelatedDocsOptions`](#symbol-bundlerelateddocsoptions)

##### `bundleRelatedDocs` — Summary
Bundle every linked document once, single hop: a document's own links are not followed. A link to a document
that cannot be read is dropped with it, so that the Related Docs name only what the bundle carries.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `fs/promises`
- [`staticExplorerData.BundledMarkdownTreeNode`](./staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode) (type-only)
- [`staticExplorerData.RelatedDocLink`](./staticExplorerData.ts.mdmd.md#symbol-relateddoclink) (type-only)
- `path`
<!-- LIVE-DOC:END Dependencies -->
