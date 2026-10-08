# packages/explorer/src/client/panels/sources-facts.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/sources-facts.ts
- Generated At: 2026-10-08T16:40:17.653Z

## Authored
### Purpose
Computes everything the Knowledge Sources panel says from the graph index alone: the bundle's shape (files by archetype, first directory and extension, references between files, the generation span), the files most used and most using, the files nothing references or only tests reference, and the public symbols of non-test files that no other file names or only tests name, by file. Pure functions over `LiveDocGraph`; the renderer draws what they return and the JSON export writes it out.

### Notes
- Written on 2026-10-08 as the software's side of [the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md): these are the classes the sweep found computable from the docs. The split the sweep made by hand, a dead symbol from one its own file uses, is not here, since the docs carry no uses within a file; nor are entry points, which the docs cannot yet tell from orphans. Both are said on the panel.
- A file's `users` are its `inbound` list; its `symbolsUsed` are the distinct `toSymbol` slugs of edges from other files, so "used by 116 files, 24 of 58 symbols" reads a barrel honestly where a bare count did not.
- `symbolCount` sums a class's symbols for the panel's headings. Tested in `sources-facts.test.ts` on a seven-file graph whose inbound and outbound lists are derived from its edges as the generator derives them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Count` {#symbol-count}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L18)

##### `Count` — Summary
A name and how many of something it has.

#### `BundleShape` {#symbol-bundleshape}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L24)

##### `BundleShape` — Summary
The bundle's shape: where its docs are, how many files by kind, directory and extension, and when they were generated.

#### `FileUse` {#symbol-fileuse}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L41)

##### `FileUse` — Summary
A file and the files that reference it.

#### `FileUsing` {#symbol-fileusing}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L53)

##### `FileUsing` — Summary
A file and the files it references.

#### `UnreferencedFile` {#symbol-unreferencedfile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L60)

##### `UnreferencedFile` — Summary
A file that nothing references, or that only test files reference.

#### `SymbolsOfFile` {#symbol-symbolsoffile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L66)

##### `SymbolsOfFile` — Summary
A file's public symbols in one class.

#### `SourcesFacts (interface)` {#symbol-sourcesfacts-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L73)

##### `SourcesFacts (interface)` — Summary
Everything the panel shows that the graph alone can say.

#### `sourcesFacts (function)` {#symbol-sourcesfacts-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L111)
- Returns: [`SourcesFacts`](#symbol-sourcesfacts-interface)
- Parameters: `graph`: [`LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `sourcesFacts (function)` — Summary
The facts of a graph. `limit` caps the most-used and most-using lists; the
other lists are whole, since a cut list hides exactly what a person came to
see.

#### `symbolCount` {#symbol-symbolcount}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L185)

##### `symbolCount` — Summary
How many symbols a list of files' classes holds in all.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph.GraphFile`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
<!-- LIVE-DOC:END Dependencies -->
