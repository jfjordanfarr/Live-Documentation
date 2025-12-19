# packages/scripts/src/live-docs/inspect/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-index-ts
- Generated At: 2025-12-19T21:19:50.878Z

## Authored
### Purpose
Barrel file that re-exports the public API of the inspect module. Provides a clean import surface for consumers who need pathfinding, symbol resolution, or result emission functions.

### Notes
Created during Dev Day 50 (12/19) as part of Phase 1 tech-debt reduction. The module exports functions from pathfind.ts, pathfind-symbol.ts, emit-result.ts, and related modules.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:19:50.878Z","inputHash":"057603124a55cf9e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Direction` {#symbol-direction}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L12)

#### `FrontierEntry` {#symbol-frontierentry}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L13)

#### `PathSearchResult` {#symbol-pathsearchresult}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L14)

#### `NodeDescriptor` {#symbol-nodedescriptor}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L15)

#### `HopDescriptor` {#symbol-hopdescriptor}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L16)

#### `SymbolDescriptor` {#symbol-symboldescriptor}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L17)

#### `SymbolParameterDescriptor` {#symbol-symbolparameterdescriptor}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L18)

#### `FanoutPath` {#symbol-fanoutpath}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L19)

#### `SymbolReference` {#symbol-symbolreference}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L20)

#### `SymbolHop` {#symbol-symbolhop}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L21)

#### `SymbolPathSearchResult` {#symbol-symbolpathsearchresult}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L22)

#### `symbolToAnchor` {#symbol-symboltoanchor}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L27)

#### `normalizeAnchor` {#symbol-normalizeanchor}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L28)

#### `symbolMatchesAnchor` {#symbol-symbolmatchesanchor}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L29)

#### `resolveAnchorToSymbolName` {#symbol-resolveanchortosymbolname}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L30)

#### `parseSymbolReference` {#symbol-parsesymbolreference}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L31)

#### `hasSymbolReference` {#symbol-hassymbolreference}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L32)

#### `resolveSymbolReference` {#symbol-resolvesymbolreference}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L33)

#### `resolveArtifactIdentifier` {#symbol-resolveartifactidentifier}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L38)

#### `normalizeInputIdentifier` {#symbol-normalizeinputidentifier}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L39)

#### `stripLiveDocDecorations` {#symbol-striplivedocdecorations}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L40)

#### `searchGraph` {#symbol-searchgraph}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L45)

#### `getNeighbors` {#symbol-getneighbors}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L46)

#### `reconstructPath` {#symbol-reconstructpath}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L47)

#### `searchSymbolPath` {#symbol-searchsymbolpath}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L52)

#### `getSymbolNeighbors` {#symbol-getsymbolneighbors}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L53)

#### `MAX_ENUMERATED_PATHS` {#symbol-max_enumerated_paths}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L58)

#### `enumerateTerminalPaths` {#symbol-enumerateterminalpaths}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L59)

#### `describeNode` {#symbol-describenode}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L64)

#### `buildSymbolDescriptors` {#symbol-buildsymboldescriptors}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L65)

#### `emitPathResult` {#symbol-emitpathresult}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L70)

#### `emitNotFound` {#symbol-emitnotfound}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L71)

#### `emitFanoutResult` {#symbol-emitfanoutresult}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L72)

#### `emitSymbolPathResult` {#symbol-emitsymbolpathresult}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L77)

#### `emitSymbolPathNotFound` {#symbol-emitsymbolpathnotfound}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L78)

#### `emitDualDirectionResult` {#symbol-emitdualdirectionresult}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L83)

#### `emitDualDirectionSymbolResult` {#symbol-emitdualdirectionsymbolresult}
- Type: unknown
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/index.ts#L84)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`describe-node.buildSymbolDescriptors`](./describe-node.ts.mdmd.md#symbol-buildsymboldescriptors) (re-export)
- [`describe-node.describeNode`](./describe-node.ts.mdmd.md#symbol-describenode) (re-export)
- [`emit-result-dual.emitDualDirectionResult`](./emit-result-dual.ts.mdmd.md#symbol-emitdualdirectionresult) (re-export)
- [`emit-result-dual.emitDualDirectionSymbolResult`](./emit-result-dual.ts.mdmd.md#symbol-emitdualdirectionsymbolresult) (re-export)
- [`emit-result-symbol.emitSymbolPathNotFound`](./emit-result-symbol.ts.mdmd.md#symbol-emitsymbolpathnotfound) (re-export)
- [`emit-result-symbol.emitSymbolPathResult`](./emit-result-symbol.ts.mdmd.md#symbol-emitsymbolpathresult) (re-export)
- [`emit-result.emitFanoutResult`](./emit-result.ts.mdmd.md#symbol-emitfanoutresult) (re-export)
- [`emit-result.emitNotFound`](./emit-result.ts.mdmd.md#symbol-emitnotfound) (re-export)
- [`emit-result.emitPathResult`](./emit-result.ts.mdmd.md#symbol-emitpathresult) (re-export)
- [`pathfind-fanout.MAX_ENUMERATED_PATHS`](./pathfind-fanout.ts.mdmd.md#symbol-max_enumerated_paths) (re-export)
- [`pathfind-fanout.enumerateTerminalPaths`](./pathfind-fanout.ts.mdmd.md#symbol-enumerateterminalpaths) (re-export)
- [`pathfind-symbol.getSymbolNeighbors`](./pathfind-symbol.ts.mdmd.md#symbol-getsymbolneighbors) (re-export)
- [`pathfind-symbol.searchSymbolPath`](./pathfind-symbol.ts.mdmd.md#symbol-searchsymbolpath) (re-export)
- [`pathfind.getNeighbors`](./pathfind.ts.mdmd.md#symbol-getneighbors) (re-export)
- [`pathfind.reconstructPath`](./pathfind.ts.mdmd.md#symbol-reconstructpath) (re-export)
- [`pathfind.searchGraph`](./pathfind.ts.mdmd.md#symbol-searchgraph) (re-export)
- [`resolve-artifact.normalizeInputIdentifier`](./resolve-artifact.ts.mdmd.md#symbol-normalizeinputidentifier) (re-export)
- [`resolve-artifact.resolveArtifactIdentifier`](./resolve-artifact.ts.mdmd.md#symbol-resolveartifactidentifier) (re-export)
- [`resolve-artifact.stripLiveDocDecorations`](./resolve-artifact.ts.mdmd.md#symbol-striplivedocdecorations) (re-export)
- [`symbol-reference.hasSymbolReference`](./symbol-reference.ts.mdmd.md#symbol-hassymbolreference) (re-export)
- [`symbol-reference.normalizeAnchor`](./symbol-reference.ts.mdmd.md#symbol-normalizeanchor) (re-export)
- [`symbol-reference.parseSymbolReference`](./symbol-reference.ts.mdmd.md#symbol-parsesymbolreference) (re-export)
- [`symbol-reference.resolveAnchorToSymbolName`](./symbol-reference.ts.mdmd.md#symbol-resolveanchortosymbolname) (re-export)
- [`symbol-reference.resolveSymbolReference`](./symbol-reference.ts.mdmd.md#symbol-resolvesymbolreference) (re-export)
- [`symbol-reference.symbolMatchesAnchor`](./symbol-reference.ts.mdmd.md#symbol-symbolmatchesanchor) (re-export)
- [`symbol-reference.symbolToAnchor`](./symbol-reference.ts.mdmd.md#symbol-symboltoanchor) (re-export)
- [`types.Direction`](./types.ts.mdmd.md#symbol-direction) (re-export, type-only)
- [`types.FanoutPath`](./types.ts.mdmd.md#symbol-fanoutpath) (re-export, type-only)
- [`types.FrontierEntry`](./types.ts.mdmd.md#symbol-frontierentry) (re-export, type-only)
- [`types.HopDescriptor`](./types.ts.mdmd.md#symbol-hopdescriptor) (re-export, type-only)
- [`types.NodeDescriptor`](./types.ts.mdmd.md#symbol-nodedescriptor) (re-export, type-only)
- [`types.PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult) (re-export, type-only)
- [`types.SymbolDescriptor`](./types.ts.mdmd.md#symbol-symboldescriptor) (re-export, type-only)
- [`types.SymbolHop`](./types.ts.mdmd.md#symbol-symbolhop) (re-export, type-only)
- [`types.SymbolParameterDescriptor`](./types.ts.mdmd.md#symbol-symbolparameterdescriptor) (re-export, type-only)
- [`types.SymbolPathSearchResult`](./types.ts.mdmd.md#symbol-symbolpathsearchresult) (re-export, type-only)
- [`types.SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference) (re-export, type-only)
<!-- LIVE-DOC:END Dependencies -->
