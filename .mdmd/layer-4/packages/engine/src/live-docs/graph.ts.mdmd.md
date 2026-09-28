# packages/engine/src/live-docs/graph.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/graph.ts
- Generated At: 2026-09-28T16:48:39.011Z

## Authored
### Purpose
The derived graph index: the model of a graph of Live Docs, `deriveLiveDocGraph`, which builds one from parsed docs, and `linkTarget`, which resolves a link written in a doc to the doc it names. Every consumer of the docs reads this shape.

### Notes
- Written 2026-09-28. A file of the graph is its parsed doc, exactly as the grammar returns it, plus what only the corpus can say: one edge per dependency line and per linked type reference, resolved to the file and symbol anchor the link lands on, and the inbound and outbound adjacency, which no doc stores. The decisions log records it under "The Derived Graph Index".
- The module has no file-system imports, so the Explorer client bundles it and reads a graph the way the CLI does. Reading docs from disk and writing `<root>/index.json` live in `graphFiles.ts`.
- A type reference to a symbol of the same file resolves to the file itself; `outbound` and `inbound` leave such self edges out. An edge keeps the link as written, so an external module (no link) and a link nothing answers to (link, no target) are told apart.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DocLocation` {#symbol-doclocation}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L23)

##### `DocLocation` — Summary
Where the docs are, relative to the workspace, and what they are named.

#### `LiveDocGraph` {#symbol-livedocgraph}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L30)
- Extends: [`DocLocation`](#symbol-doclocation)

##### `LiveDocGraph` — Summary
The graph of a workspace: every doc, with its links resolved.

#### `GraphFile` {#symbol-graphfile}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L36)
- Extends: [`LiveDoc`](./document.ts.mdmd.md#symbol-livedoc)

##### `GraphFile` — Summary
One doc of the graph: the parsed doc, and what the corpus adds to it.

#### `EdgeKind` {#symbol-edgekind}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L48)

##### `EdgeKind` — Summary
How an edge arose: a dependency line, or a type reference on a symbol.

#### `EdgeBasis` {#symbol-edgebasis}
- Type: type
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L51)

##### `EdgeBasis` — Summary
How an edge was observed when not from source: see `DependencyBasis`.

#### `GraphEdge` {#symbol-graphedge}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L54)

##### `GraphEdge` — Summary
One reference a doc makes, resolved against the corpus.

#### `GRAPH_INDEX_FILE` {#symbol-graph_index_file}
- Type: const
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L75)

##### `GRAPH_INDEX_FILE` — Summary
The name of the file the generator writes the graph to, under the docs root.

#### `deriveLiveDocGraph` {#symbol-derivelivedocgraph}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L87)
- Returns: [`LiveDocGraph`](#symbol-livedocgraph)
- Parameters: `docs`: `Iterable`; `location`: [`DocLocation`](#symbol-doclocation)

##### `deriveLiveDocGraph` — Summary
Derives the graph from parsed docs.

##### `deriveLiveDocGraph` — Parameters
- `docs`: Every doc of the workspace, each with its workspace-relative path.
- `location`: Where the docs are, so that links between them resolve.

#### `LinkTarget (interface)` {#symbol-linktarget-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L194)

##### `LinkTarget (interface)` — Summary
The Live Doc a link in a doc points at, and the source file that doc mirrors.

#### `linkTarget (function)` {#symbol-linktarget-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/graph.ts#L211)
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
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.LiveDoc`](./document.ts.mdmd.md#symbol-livedoc) (type-only)
- [`document.SymbolBlock`](./document.ts.mdmd.md#symbol-symbolblock) (type-only)
- [`document.TypeRef`](./document.ts.mdmd.md#symbol-typeref) (type-only)
<!-- LIVE-DOC:END Dependencies -->
