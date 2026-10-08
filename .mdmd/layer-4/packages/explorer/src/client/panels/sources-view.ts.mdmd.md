# packages/explorer/src/client/panels/sources-view.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/sources-view.ts
- Generated At: 2026-10-08T17:03:51.685Z

## Authored
### Purpose
Renders the Knowledge Sources panel from `sources-facts.ts`: the bundle's shape, the files most used and most using, the files and public symbols that nothing references or only tests reference, the tree of bundled related markdown, and the export controls. Every file named is a button that puts it in the detail panel; every directory counted is a link to the Local Map's directory door.

### Notes
- Extracted from client/index.ts on 2025-12-19. The data-source and viewer-configuration rows that described a server mode went on 2026-09-28.
- Rewritten on 2026-10-08 from [the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md), which found what the panel should say: the fixed thresholds that called a file a "potential barrel" or "heavily depended-upon" went (a bare count had crowned a barrel more than half unused through itself), with the cut list of "disconnected nodes", the tagline, the "How to Improve" text that named this repository's npm scripts, and the export's prose and dead "server mode" note. The lists are whole, since a cut list hides what a person came to see, and grouped in native `details` elements. What the docs cannot tell apart, an entry point from a true orphan and a symbol its own file uses from a dead one, the panel says in one sentence each rather than guesses.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DownloadBundleType` {#symbol-downloadbundletype}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L23)

##### `DownloadBundleType` — Summary
Which documents the export takes: the Live Docs, the related markdown, or both.

#### `DownloadFormat` {#symbol-downloadformat}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L26)

##### `DownloadFormat` — Summary
One flattened markdown file, or a ZIP that keeps the folders.

#### `SourcesViewConfig` {#symbol-sourcesviewconfig}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L29)

##### `SourcesViewConfig` — Summary
What the panel needs from the client.

#### `renderSourcesView` {#symbol-rendersourcesview}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-view.ts#L220)
- Parameters: `config`: [`SourcesViewConfig`](#symbol-sourcesviewconfig)

##### `renderSourcesView` — Summary
Render the panel into its container and wire its buttons.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dom.requireElement`](../dom.ts.mdmd.md#symbol-requireelement)
- [`graph-helpers.escapeHtml`](../graph-helpers.ts.mdmd.md#symbol-escapehtml)
- [`sources-facts.SourcesFacts`](./sources-facts.ts.mdmd.md#symbol-sourcesfacts-interface)
- [`sources-facts.SymbolsOfFile`](./sources-facts.ts.mdmd.md#symbol-symbolsoffile)
- [`sources-facts.UnreferencedFile`](./sources-facts.ts.mdmd.md#symbol-unreferencedfile)
- [`sources-facts.symbolCount`](./sources-facts.ts.mdmd.md#symbol-symbolcount)
- [`staticExplorerData.BundledMarkdownTreeNode`](../../shared/staticExplorerData.ts.mdmd.md#symbol-bundledmarkdowntreenode) (type-only)
<!-- LIVE-DOC:END Dependencies -->
