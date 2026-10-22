# packages/explorer/src/client/panels/sources-facts.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/sources-facts.ts
- Generated At: 2026-10-22T00:54:18.129Z

## Authored
### Purpose
Computes everything the Knowledge Sources panel says from the graph index alone: the bundle's shape (files by archetype, first directory and extension, references between files, the generation span), the files most used and most using, the entry points with their reasons and what a walk from them reaches, what nothing reaches and what only a test reaches, and the public symbols of non-test files that no other file names or only tests name, by file. Pure functions over `LiveDocGraph`; the renderer draws what they return and the JSON export writes it out.

### Notes
- Written on 2026-10-08 as the software's side of [the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md): these are the classes the sweep found computable from the docs. The split the sweep made by hand, a dead symbol from one its own file uses, is not here, since the docs carry no uses within a file; nor are entry points, which the docs cannot yet tell from orphans. Both are said on the panel.
- A file's `users` are its `inbound` list; its `symbolsUsed` are the distinct `toSymbol` slugs of edges from other files, so "used by 116 files, 24 of 58 symbols" reads a barrel honestly where a bare count did not.
- `symbolCount` sums a class's symbols for the panel's headings. Tested in `sources-facts.test.ts` on a seven-file graph whose inbound and outbound lists are derived from its edges as the generator derives them.
- Rewritten on 2026-10-15 ([Turn 4](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) around the engine's `reachability`: the one-hop lists of what nothing references went, since the docs now tell an entry from an orphan, and `reach` carries the starts (each with the words of its `Entry` lines, `test` for a test, and the sample root it lies under), the files reached with their hops, the unreachable and the tests-only, each with its archetype for grouping. `from` walks from the files the person chose instead of the entries; `sampleRoots` come from the bundle.
- Since 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)) `reach.unread` carries the files no start reaches whose kind no reader handles, with their archetypes, apart from `unreachable`; the test's graph holds a deploy script for it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Count` {#symbol-count}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L21)

##### `Count` — Summary
A name and how many of something it has.

#### `BundleShape` {#symbol-bundleshape}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L27)

##### `BundleShape` — Summary
The bundle's shape: where its docs are, how many files by kind, directory and extension, and when they were generated.

#### `FileUse` {#symbol-fileuse}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L44)

##### `FileUse` — Summary
A file and the files that reference it.

#### `FileUsing` {#symbol-fileusing}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L56)

##### `FileUsing` — Summary
A file and the files it references.

#### `FileByArchetype` {#symbol-filebyarchetype}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L63)

##### `FileByArchetype` — Summary
A file named in a class of the walk, with its archetype for grouping.

#### `StartFile` {#symbol-startfile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L69)
- Extends: [`FileByArchetype`](#symbol-filebyarchetype)

##### `StartFile` — Summary
A file the walk starts from: an entry point of the docs, or a file the person asked about.

#### `Reach` {#symbol-reach}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L80)

##### `Reach` — Summary
What a walk along dependencies reaches from the entry points, or from the files asked about.

#### `SymbolsOfFile` {#symbol-symbolsoffile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L95)

##### `SymbolsOfFile` — Summary
A file's public symbols in one class.

#### `SourcesFacts (interface)` {#symbol-sourcesfacts-interface}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L102)

##### `SourcesFacts (interface)` — Summary
Everything the panel shows that the graph alone can say.

#### `SourcesFactsOptions` {#symbol-sourcesfactsoptions}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L115)

##### `SourcesFactsOptions` — Summary
What the facts are computed for.

#### `sourcesFacts (function)` {#symbol-sourcesfacts-function}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L148)
- Returns: [`SourcesFacts`](#symbol-sourcesfacts-interface)
- Parameters: `graph`: [`LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph); `options`: [`SourcesFactsOptions`](#symbol-sourcesfactsoptions)

##### `sourcesFacts (function)` — Summary
The facts of a graph. The most-used and most-using lists are capped; the
other lists are whole, since a cut list hides exactly what a person came to
see.

#### `symbolCount` {#symbol-symbolcount}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/panels/sources-facts.ts#L245)

##### `symbolCount` — Summary
How many symbols a list of files' classes holds in all.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.Entry`](../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-entry)
- [`document.entryWords`](../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-entrywords)
- [`graph.GraphFile`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`pathfind.reachability`](../../../../engine/src/live-docs/pathfind.ts.mdmd.md#symbol-reachability-function)
<!-- LIVE-DOC:END Dependencies -->
