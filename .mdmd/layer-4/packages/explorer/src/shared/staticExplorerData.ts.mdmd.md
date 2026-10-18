# packages/explorer/src/shared/staticExplorerData.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/staticExplorerData.ts
- Generated At: 2026-10-18T00:39:23.614Z

## Authored
### Purpose
What `explorer-data.json` holds: the graph index and the related markdown that Live Docs link to, with its directory tree and the links that name it.

### Notes
- Created 2025-12-07. On 2026-09-28 the provenance stamp, the symbol index, the treemap layout, the viewer configuration and the schema version went: nothing produced or read them.
- The client loads the bundle from `explorer-data.json` beside the page, or from the URL named by `?data=`.
- `sampleRoots` (2026-10-15): the configuration's sample roots, so that the Knowledge Sources panel groups a sample program's entries apart and the landing leaves them out.
- `history` (2026-10-17, C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md)): the name of the history file beside the data and its sequence's head (the lens, the source, the window, and the first and last commits), so that the client knows what rides before it fetches it. The client's reading of it is another ticket.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StaticExplorerData` {#symbol-staticexplorerdata}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticExplorerData.ts#L10)

##### `StaticExplorerData` — Summary
The bundle.

#### `BundledHistory` {#symbol-bundledhistory}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticExplorerData.ts#L48)

##### `BundledHistory` — Summary
The history a bundle carries: the file beside `explorer-data.json` and its sequence's head.

#### `BundledBoard` {#symbol-bundledboard}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticExplorerData.ts#L54)

##### `BundledBoard` — Summary
A board's text, verbatim, and where it sits in the workspace.

#### `BundledMarkdownTreeNode` {#symbol-bundledmarkdowntreenode}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticExplorerData.ts#L62)

##### `BundledMarkdownTreeNode` — Summary
A node in the bundled markdown directory tree.

#### `RelatedDocLink` {#symbol-relateddoclink}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticExplorerData.ts#L88)

##### `RelatedDocLink` — Summary
A link from a Live Doc to a bundled markdown file.
Used to render Related Documentation edges in the Force Graph view.

##### `RelatedDocLink` — Remarks
These links are directional: a Live Doc references a bundled document.
However, the Force Graph renders them as undirected edges for visual clarity.
The `related:` prefix on target IDs distinguishes bundled docs from Live Doc nodes.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`format.HistoryHead`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historyhead) (type-only)
<!-- LIVE-DOC:END Dependencies -->
