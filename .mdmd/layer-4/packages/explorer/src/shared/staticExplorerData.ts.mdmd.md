# packages/explorer/src/shared/staticExplorerData.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/staticExplorerData.ts
- Generated At: 2026-10-22T17:22:34.509Z

## Authored
### Purpose
What `explorer-data.json` holds: the graph index and the related markdown that Live Docs link to, with its directory tree and the links that name it.

### Notes
- Created 2025-12-07. On 2026-09-28 the provenance stamp, the symbol index, the treemap layout, the viewer configuration and the schema version went: nothing produced or read them.
- The client loads the bundle from `explorer-data.json` beside the page, or from the URL named by `?data=`.
- `sampleRoots` (2026-10-15): the configuration's sample roots, so that the Knowledge Sources panel groups a sample program's entries apart and the landing leaves them out.
- `history` (2026-10-17, C1 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md)): the name of the history file beside the data and its sequence's head (the lens, the source, the window, and the first and last commits), so that the client knows what rides before it fetches it. The client's reading of it is another ticket.
- `RelatedDocLink.direction` (2026-10-22, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)): `cites` for a link from a file's authored words to a document, `cited-by` for a document's own link to the file, as its doc's `Cited By` section records it. The two are kept apart wherever a person sees them.

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

#### `RelatedDocDirection` {#symbol-relateddocdirection}
- Type: type
- Source: [source](../../../../../../packages/explorer/src/shared/staticExplorerData.ts#L85)

##### `RelatedDocDirection` — Summary
Which way a file and a document are related: the file's doc cites the
document in its authored words, or the document cites the file in its own
links, which the doc's `Cited By` section records (2026-10-22). The two are
kept apart everywhere a person sees them, since the direction is a fact.

#### `RelatedDocLink` {#symbol-relateddoclink}
- Type: interface
- Source: [source](../../../../../../packages/explorer/src/shared/staticExplorerData.ts#L94)

##### `RelatedDocLink` — Summary
A link between a file and a bundled markdown document, one way or the other.
Used to render Related Documentation edges in the Force Graph view.

##### `RelatedDocLink` — Remarks
The `related:` prefix on target IDs distinguishes bundled docs from Live Doc nodes.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`format.HistoryHead`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-historyhead) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
