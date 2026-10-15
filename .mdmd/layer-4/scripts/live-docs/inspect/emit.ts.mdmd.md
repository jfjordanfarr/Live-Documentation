# scripts/live-docs/inspect/emit.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect/emit.ts
- Generated At: 2026-10-15T15:49:42.322Z

## Authored
### Purpose
What the inspect CLI prints: node descriptors, and the text or JSON of a path, a symbol path, a fan-out, the files a path reaches, a dual-direction search, or a miss.

### Notes
- Gathered here on 2026-09-28 from the four description and emission modules extracted from the inspect CLI on 2025-12-19; the JSON payload shapes are unchanged.
- A frontier entry stopped by a reference with no target in the graph says "(X is outside the scan)" since 2026-10-14, the Explorer's words for the same fact; it had said "missing".
- `emitReachableResult` (2026-10-14, [Turn 7](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-7)) prints the files a path reaches, nearest first with their hops, one list per direction, and the JSON kind `reachable`; it is the headless twin of the Explorer's destination field.
- With `--verbose`, a node descriptor carries one entry per public symbol with the Summary, Remarks and Parameters sections of its doc; the Parameters bullets are read here from the section text, the one place inspect interprets a documentation section.
- `emitReachableFromEntries` (2026-10-15) prints the entries walk: in text the entry points with `entryWords` of their lines and `test` for a test, then the reached, the unreachable with their archetypes and the tests-only; in JSON the engine's `Reachability` object with the kind and the depth.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NodeDescriptor` {#symbol-nodedescriptor}
- Type: interface
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L28)

##### `NodeDescriptor` — Summary
Descriptor for a node in path output.

#### `HopDescriptor` {#symbol-hopdescriptor}
- Type: interface
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L35)

##### `HopDescriptor` — Summary
Descriptor for a hop (edge) in path output.

#### `SymbolDescriptor` {#symbol-symboldescriptor}
- Type: interface
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L41)

##### `SymbolDescriptor` — Summary
Descriptor for a public symbol.

#### `SymbolParameterDescriptor` {#symbol-symbolparameterdescriptor}
- Type: interface
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L49)

##### `SymbolParameterDescriptor` — Summary
Descriptor for a symbol parameter.

#### `describeNode` {#symbol-describenode}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L66)
- Returns: [`NodeDescriptor`](#symbol-nodedescriptor)
- Parameters: `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `describeNode` — Summary
Creates a descriptor for a node in the graph.

##### `describeNode` — Parameters
- `codePath`: The code path of the node
- `graph`: The Live Doc graph
- `verbose`: If true, includes full symbol lists

##### `describeNode` — Returns
Node descriptor with optional symbol information

#### `buildSymbolDescriptors` {#symbol-buildsymboldescriptors}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L88)
- Returns: [`SymbolDescriptor`](#symbol-symboldescriptor)[]
- Parameters: `file`: [`GraphFile`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile)

##### `buildSymbolDescriptors` — Summary
Builds symbol descriptors from a file's public symbols: one per name, with the
Summary, Remarks and Parameters sections of the first symbol that carries it.

##### `buildSymbolDescriptors` — Parameters
- `file`: The file of the graph

##### `buildSymbolDescriptors` — Returns
Array of symbol descriptors with documentation

#### `emitPathResult` {#symbol-emitpathresult}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L146)
- Parameters: `direction`: [`Direction`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-direction); `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `emitPathResult` — Summary
Emits a successful path result.

##### `emitPathResult` — Parameters
- `direction`: Traversal direction used
- `graph`: The Live Doc graph
- `json`: If true, emit JSON format
- `pathNodes`: Array of node IDs in the path
- `verbose`: If true, include symbol details

#### `emitNotFound` {#symbol-emitnotfound}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L196)
- Parameters: `direction`: [`Direction`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-direction); `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph); `result`: [`PathSearchResult`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-pathsearchresult)

##### `emitNotFound` — Summary
Emits a "path not found" result with frontier information.

##### `emitNotFound` — Parameters
- `direction`: Traversal direction used
- `from`: Source node code path
- `graph`: The Live Doc graph
- `json`: If true, emit JSON format
- `result`: The search result with frontier information
- `to`: Target node code path
- `verbose`: If true, include symbol details

#### `emitFanoutResult` {#symbol-emitfanoutresult}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L245)
- Parameters: `direction`: [`Direction`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-direction); `fanout`: [`FanoutPath`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-fanoutpath)[]; `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `emitFanoutResult` — Summary
Emits fanout (terminal paths) result.

##### `emitFanoutResult` — Parameters
- `direction`: Traversal direction used
- `fanout`: Array of terminal paths
- `from`: Source node code path
- `graph`: The Live Doc graph
- `json`: If true, emit JSON format
- `maxDepth`: Maximum depth used
- `verbose`: If true, include symbol details

#### `ReachedFiles` {#symbol-reachedfiles}
- Type: interface
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L285)

##### `ReachedFiles` — Summary
The files a path reaches one way from a file, nearest first, each with the hops to it.

#### `emitReachableResult` {#symbol-emitreachableresult}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L302)
- Parameters: `reached`: [`ReachedFiles`](#symbol-reachedfiles)[]; `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `emitReachableResult` — Summary
Emits every file a path reaches from a file, one list per direction asked:
the headless form of the Explorer's destination field, which offers the
same files with the same distances.

##### `emitReachableResult` — Parameters
- `from`: Source node code path
- `graph`: The Live Doc graph
- `json`: If true, emit JSON format
- `maxDepth`: Maximum depth used
- `reached`: The files reached, per direction, nearest first
- `verbose`: If true, include symbol details

#### `emitReachableFromEntries` {#symbol-emitreachablefromentries}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L348)
- Parameters: `result`: [`Reachability`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-reachability-interface); `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `emitReachableFromEntries` — Summary
Emits what the entry points reach: the headless form of the Knowledge Sources
panel, whose JSON export carries the same object. The text names every entry
with its reasons, then the files reached nearest first, the files no entry
reaches with their archetypes, and the files only a test reaches.

##### `emitReachableFromEntries` — Parameters
- `graph`: The Live Doc graph
- `json`: If true, emit JSON format
- `maxDepth`: Maximum depth used
- `result`: The engine's reachability from the graph's entry points

#### `emitDualDirectionResult` {#symbol-emitdualdirectionresult}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L392)
- Parameters: `outboundResult`: [`PathSearchResult`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-pathsearchresult); `inboundResult`: [`PathSearchResult`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-pathsearchresult); `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `emitDualDirectionResult` — Summary
Emits results for a dual-direction (both forward and reverse) file-level search.
Reports both paths if found, clearly labeling the direction of each.

##### `emitDualDirectionResult` — Parameters
- `from`: Source node code path
- `graph`: The Live Doc graph
- `inboundResult`: Result of inbound search
- `json`: If true, emit JSON format
- `outboundResult`: Result of outbound search
- `to`: Target node code path
- `verbose`: If true, include symbol details

#### `emitSymbolPathResult` {#symbol-emitsymbolpathresult}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L495)
- Parameters: `symbolPath`: [`SymbolHop`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolhop)[]; `from`: [`SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference); `to`: [`SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference); `direction`: [`Direction`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-direction); `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `emitSymbolPathResult` — Summary
Emits a successful symbol-aware path result.

##### `emitSymbolPathResult` — Parameters
- `direction`: Traversal direction used
- `from`: Source symbol reference
- `graph`: The Live Doc graph
- `json`: If true, emit JSON format
- `symbolPath`: Array of symbol hops in the path
- `to`: Target symbol reference

#### `emitSymbolPathNotFound` {#symbol-emitsymbolpathnotfound}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L538)
- Parameters: `from`: [`SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference); `to`: [`SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference); `direction`: [`Direction`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-direction)

##### `emitSymbolPathNotFound` — Summary
Emits a "symbol path not found" result.

##### `emitSymbolPathNotFound` — Parameters
- `direction`: Traversal direction used
- `from`: Source symbol reference
- `json`: If true, emit JSON format
- `to`: Target symbol reference

#### `emitDualDirectionSymbolResult` {#symbol-emitdualdirectionsymbolresult}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L568)
- Parameters: `from`: [`SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference); `to`: [`SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference); `outboundResult`: [`SymbolPathSearchResult`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolpathsearchresult); `inboundResult`: [`SymbolPathSearchResult`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolpathsearchresult); `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `emitDualDirectionSymbolResult` — Summary
Emits results for a dual-direction symbol path search.

##### `emitDualDirectionSymbolResult` — Parameters
- `from`: Source symbol reference
- `graph`: The Live Doc graph
- `inboundResult`: Result of inbound symbol search
- `json`: If true, emit JSON format
- `outboundResult`: Result of outbound symbol search
- `to`: Target symbol reference
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`document.entryWords`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-entrywords)
- [`document.symbolName`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.GraphFile`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`pathfind.Direction`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-direction)
- [`pathfind.FanoutPath`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-fanoutpath)
- [`pathfind.MAX_ENUMERATED_PATHS`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-max_enumerated_paths)
- [`pathfind.OneWay`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-oneway)
- [`pathfind.PathSearchResult`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-pathsearchresult)
- [`pathfind.Reachability`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-reachability-interface)
- [`pathfind.SymbolHop`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolhop)
- [`pathfind.SymbolPathSearchResult`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolpathsearchresult)
- [`pathfind.SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference)
- [`resolve.resolveAnchorToSymbolName`](./resolve.ts.mdmd.md#symbol-resolveanchortosymbolname)
<!-- LIVE-DOC:END Dependencies -->
