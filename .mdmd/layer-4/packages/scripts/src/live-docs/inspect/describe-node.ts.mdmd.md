# packages/scripts/src/live-docs/inspect/describe-node.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/describe-node.ts
- Generated At: 2026-09-28T01:00:43.204Z

## Authored
### Purpose
Builds the node descriptors of inspect output: code path, doc path and, with `--verbose`, one descriptor per public symbol with the Summary, Remarks and Parameters sections of its doc.

### Notes
- Extracted from inspect.ts on 2025-12-19. The Parameters bullets are read here from the doc's section text, the one place inspect interprets a documentation section.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `describeNode` {#symbol-describenode}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/describe-node.ts#L23)
- Returns: [`NodeDescriptor`](./types.ts.mdmd.md#symbol-nodedescriptor)
- Parameters: `graph`: [`LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

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
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/describe-node.ts#L56)
- Returns: [`SymbolDescriptor`](./types.ts.mdmd.md#symbol-symboldescriptor)[]
- Parameters: `file`: [`GraphFile`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile)

##### `buildSymbolDescriptors` — Summary
Builds symbol descriptors from a file's public symbols: one per name, with the
Summary, Remarks and Parameters sections of the first symbol that carries it.

##### `buildSymbolDescriptors` — Parameters
- `file`: The file of the graph

##### `buildSymbolDescriptors` — Returns
Array of symbol descriptors with documentation
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`document.symbolName`](../../../../engine/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.GraphFile`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-graphfile) (type-only)
- [`graph.LiveDocGraph`](../../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`types.NodeDescriptor`](./types.ts.mdmd.md#symbol-nodedescriptor) (type-only)
- [`types.SymbolDescriptor`](./types.ts.mdmd.md#symbol-symboldescriptor) (type-only)
- [`types.SymbolParameterDescriptor`](./types.ts.mdmd.md#symbol-symbolparameterdescriptor) (type-only)
<!-- LIVE-DOC:END Dependencies -->
