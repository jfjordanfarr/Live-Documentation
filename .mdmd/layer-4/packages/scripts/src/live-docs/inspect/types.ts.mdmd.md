# packages/scripts/src/live-docs/inspect/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/types.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-types-ts
- Generated At: 2026-02-03T21:55:37.430Z

## Authored
### Purpose
Defines shared type contracts for the `live-docs:inspect` CLI pathfinding functionality. Houses `Direction`, `FrontierEntry`, and other graph-traversal interfaces that enable symbol-aware dependency path searches across Live Documentation.

### Notes
Extracted from inspect.ts during Dev Day 50 (12/19) as part of the Phase 1 tech-debt reduction. These types are consumed by pathfind.ts, pathfind-symbol.ts, and the emit-result modules to maintain type safety across the modular inspect CLI.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.430Z","inputHash":"34f3b90f6c15c76a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Direction` {#symbol-direction}
- Type: type
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L10)

##### `Direction` — Summary
Traversal direction for graph searches.

#### `FrontierEntry` {#symbol-frontierentry}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L15)

##### `FrontierEntry` — Summary
Entry in the search frontier, representing a node that couldn't be explored further.

#### `PathSearchResult` {#symbol-pathsearchresult}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L25)

##### `PathSearchResult` — Summary
Result of a file-level path search.

#### `NodeDescriptor` {#symbol-nodedescriptor}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L34)

##### `NodeDescriptor` — Summary
Descriptor for a node in path output.

#### `HopDescriptor` {#symbol-hopdescriptor}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L43)

##### `HopDescriptor` — Summary
Descriptor for a hop (edge) in path output.

#### `SymbolDescriptor` {#symbol-symboldescriptor}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L51)

##### `SymbolDescriptor` — Summary
Descriptor for a public symbol.

#### `SymbolParameterDescriptor` {#symbol-symbolparameterdescriptor}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L61)

##### `SymbolParameterDescriptor` — Summary
Descriptor for a symbol parameter.

#### `FanoutPath` {#symbol-fanoutpath}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L69)

##### `FanoutPath` — Summary
A terminal path in fanout enumeration.

#### `SymbolReference` {#symbol-symbolreference}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L76)

##### `SymbolReference` — Summary
A reference that may include a symbol anchor (e.g., "file.ts#SymbolName").

#### `SymbolHop` {#symbol-symbolhop}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L84)

##### `SymbolHop` — Summary
A node in a symbol-aware path, tracking both file and symbol at each hop.

#### `SymbolPathSearchResult` {#symbol-symbolpathsearchresult}
- Type: interface
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/types.ts#L92)

##### `SymbolPathSearchResult` — Summary
Result of a symbol-aware path search.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
