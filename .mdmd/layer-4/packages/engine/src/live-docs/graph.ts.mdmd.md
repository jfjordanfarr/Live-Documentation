# `packages/engine/src/live-docs/graph.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/graph.ts`
- Generated At: 2026-11-19T22:40:10.463Z

## Authored
### Purpose
The derived graph index: the model of a graph of Live Docs, `deriveLiveDocGraph`, which builds one from parsed docs, and `linkTarget`, which resolves a link written in a doc to the doc it names. Every consumer of the docs reads this shape.

### Notes
- Written 2026-09-28. A file of the graph is its parsed doc, exactly as the grammar returns it, plus what only the corpus can say: one edge per dependency line and per linked type reference, resolved to the file and symbol anchor the link lands on, and the inbound and outbound adjacency, which no doc stores. The decisions log records it under "The Derived Graph Index".
- The module has no file-system imports, so the Explorer client bundles it and reads a graph the way the CLI does. Reading docs from disk and writing `<root>/index.json` live in `graphFiles.ts`.
- A type reference to a symbol of the same file resolves to the file itself; `outbound` and `inbound` leave such self edges out. An edge keeps the link as written, so an external module (no link) and a link nothing answers to (link, no target) are told apart.
- `resolveDocLink` (2026-10-20, [Turn 9](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-20/2026-10-20.1.record.md#turn-9)) is the doc-relative resolution `linkTarget` always did, given its own name so that `relatedDocs.ts` resolves a link to a document by the same rule as a link to a Live Doc.
- Since 2026-11-19 it reads a link as a browser does: the first `#` begins the fragment and the path before it is percent-decoded (`decodeLinkPath` in `document.ts`), since the generator writes a path's spaces, parentheses, `#` and the like encoded so that its links open in a markdown viewer. A document named `notes/plan (draft).md` had made the generator write a `Cited By` line its own reader refused, and a file whose name holds a `#` had resolved to nothing. `relatedDocs.ts` had decoded a whole link before resolving it, fragment included, so an encoded `#` in a path was taken for the fragment; it now hands the link over as written.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DocLocation` {#symbol-doclocation}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L24)

##### `DocLocation` — Summary
Where the docs are, relative to the workspace, and what they are named.

#### `LiveDocGraph` {#symbol-livedocgraph}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L31)
- Extends: [`DocLocation`](#symbol-doclocation)

##### `LiveDocGraph` — Summary
The graph of a workspace: every doc, with its links resolved.

#### `GraphFile` {#symbol-graphfile}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L37)
- Extends: [`LiveDoc`](./document.ts.mdmd.md#symbol-livedoc)

##### `GraphFile` — Summary
One doc of the graph: the parsed doc, and what the corpus adds to it.

#### `EdgeKind` {#symbol-edgekind}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L49)

##### `EdgeKind` — Summary
How an edge arose: a dependency line, or a type reference on a symbol.

#### `EdgeBasis` {#symbol-edgebasis}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L52)

##### `EdgeBasis` — Summary
How an edge was observed when not from source: see `DependencyBasis`.

#### `GraphEdge` {#symbol-graphedge}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L55)

##### `GraphEdge` — Summary
One reference a doc makes, resolved against the corpus.

#### `GRAPH_INDEX_FILE` {#symbol-graph_index_file}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L76)

##### `GRAPH_INDEX_FILE` — Summary
The name of the file the generator writes the graph to, under the docs root.

#### `deriveLiveDocGraph` {#symbol-derivelivedocgraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L88)
- Returns: [`LiveDocGraph`](#symbol-livedocgraph)
- Parameters: `docs`: `Iterable`; `location`: [`DocLocation`](#symbol-doclocation)

##### `deriveLiveDocGraph` — Summary
Derives the graph from parsed docs.

##### `deriveLiveDocGraph` — Parameters
- `docs`: Every doc of the workspace, each with its workspace-relative path.
- `location`: Where the docs are, so that links between them resolve.

#### `LinkTarget (interface)` {#symbol-linktarget-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L197)

##### `LinkTarget (interface)` — Summary
The Live Doc a link in a doc points at, and the source file that doc mirrors.

#### `linkTarget (function)` {#symbol-linktarget-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L214)
- Returns: [`LinkTarget`](#symbol-linktarget-interface)
- Parameters: `location`: [`DocLocation`](#symbol-doclocation)

##### `linkTarget (function)` — Summary
Resolves a doc-relative link to the Live Doc it names.

##### `linkTarget (function)` — Parameters
- `docPath`: Workspace-relative path of the doc holding the link, with forward slashes.
- `link`: The link as written, relative to the doc, with an optional `#fragment`. A bare fragment names the doc itself.
- `location`: Where the docs are.

##### `linkTarget (function)` — Returns
The target, or undefined when the link leaves the docs or does not name a Live Doc.

#### `resolveDocLink` {#symbol-resolvedoclink}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L238)

##### `resolveDocLink` — Summary
Resolves a doc-relative link to the workspace-relative path it names, without its fragment: undefined for an
external URL or a path that leaves the workspace. A bare fragment names the doc itself. The link is read as a
browser reads it, by the markdown link rule's `linkPath`: its first `#` begins the fragment and its first `?`
before that the query, and the path before them is percent-decoded, so that `plan%20%28draft%29.md` names
`plan (draft).md`, `a%23b.ts.md` a file whose name holds a `#` and `R%26D.md` one whose name holds a `&`.

##### `resolveDocLink` — Parameters
- `docPath`: Workspace-relative path of the doc holding the link, with forward slashes.
- `link`: The link's destination, relative to the doc.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.LiveDoc`](./document.ts.mdmd.md#symbol-livedoc)
- [`document.SymbolBlock`](./document.ts.mdmd.md#symbol-symbolblock)
- [`document.TypeRef`](./document.ts.mdmd.md#symbol-typeref)
- [`markdownLinks.linkPath`](../tooling/markdownLinks.ts.mdmd.md#symbol-linkpath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
- [`.mdmd/layer-3/live-documentation-engine.mdmd.md`](../../../../../layer-3/live-documentation-engine.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../../layer-3/live-documentation-pipeline.mdmd.md)
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../../layer-3/openings.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
