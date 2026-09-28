# scripts/live-docs/inspect/emit.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect/emit.ts
- Generated At: 2026-09-28T01:11:44.709Z

## Authored
### Purpose
What the inspect CLI prints: node descriptors, and the text or JSON of a path, a symbol path, a fan-out, a dual-direction search, or a miss.

### Notes
- Gathered here on 2026-09-28 from the four description and emission modules extracted from the inspect CLI on 2025-12-19; the JSON payload shapes are unchanged.
- With `--verbose`, a node descriptor carries one entry per public symbol with the Summary, Remarks and Parameters sections of its doc; the Parameters bullets are read here from the section text, the one place inspect interprets a documentation section.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `NodeDescriptor` {#symbol-nodedescriptor}
- Type: interface
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L25)

##### `NodeDescriptor` — Summary
Descriptor for a node in path output.

#### `HopDescriptor` {#symbol-hopdescriptor}
- Type: interface
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L32)

##### `HopDescriptor` — Summary
Descriptor for a hop (edge) in path output.

#### `SymbolDescriptor` {#symbol-symboldescriptor}
- Type: interface
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L38)

##### `SymbolDescriptor` — Summary
Descriptor for a public symbol.

#### `SymbolParameterDescriptor` {#symbol-symbolparameterdescriptor}
- Type: interface
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L46)

##### `SymbolParameterDescriptor` — Summary
Descriptor for a symbol parameter.

#### `describeNode` {#symbol-describenode}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L63)
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
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L85)
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
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L143)
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
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L193)
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
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L242)
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

#### `emitDualDirectionResult` {#symbol-emitdualdirectionresult}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L293)
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
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L396)
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
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L439)
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
- Source: [source](../../../../../scripts/live-docs/inspect/emit.ts#L469)
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
- [`document.symbolName`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.GraphFile`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`pathfind.Direction`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-direction)
- [`pathfind.FanoutPath`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-fanoutpath)
- [`pathfind.MAX_ENUMERATED_PATHS`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-max_enumerated_paths)
- [`pathfind.PathSearchResult`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-pathsearchresult)
- [`pathfind.SymbolHop`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolhop)
- [`pathfind.SymbolPathSearchResult`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolpathsearchresult)
- [`pathfind.SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference)
- [`resolve.resolveAnchorToSymbolName`](./resolve.ts.mdmd.md#symbol-resolveanchortosymbolname)
<!-- LIVE-DOC:END Dependencies -->
