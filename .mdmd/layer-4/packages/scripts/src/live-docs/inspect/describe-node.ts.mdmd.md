# packages/scripts/src/live-docs/inspect/describe-node.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/describe-node.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-describe-node-ts
- Generated At: 2025-12-19T21:19:50.867Z

## Authored
### Purpose
Generates human-readable descriptions of Live Doc graph nodes for CLI output. Formats node metadata including archetype, symbol list, and path information for display in inspect results.

### Notes
Extracted from inspect.ts during Dev Day 50 (12/19). The `describeNode()` function is called during result emission to provide context about each hop in a path.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:19:50.867Z","inputHash":"903536e66a862327"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `describeNode` {#symbol-describenode}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/describe-node.ts#L22)
- Returns: [`NodeDescriptor`](./types.ts.mdmd.md#symbol-nodedescriptor)
- Parameters: `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)

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
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/describe-node.ts#L54)
- Returns: [`SymbolDescriptor`](./types.ts.mdmd.md#symbol-symboldescriptor)[]
- Parameters: `node`: [`LiveDocGraphNode`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraphnode)

##### `buildSymbolDescriptors` — Summary
Builds symbol descriptors from a node's public symbols.

##### `buildSymbolDescriptors` — Parameters
- `node`: The Live Doc graph node

##### `buildSymbolDescriptors` — Returns
Array of symbol descriptors with documentation
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocGraph.LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`liveDocGraph.LiveDocGraphNode`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraphnode) (type-only)
- [`types.NodeDescriptor`](./types.ts.mdmd.md#symbol-nodedescriptor) (type-only)
- [`types.SymbolDescriptor`](./types.ts.mdmd.md#symbol-symboldescriptor) (type-only)
- [`types.SymbolParameterDescriptor`](./types.ts.mdmd.md#symbol-symbolparameterdescriptor) (type-only)
<!-- LIVE-DOC:END Dependencies -->
