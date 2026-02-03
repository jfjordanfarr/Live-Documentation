# scripts/live-docs/lib/inspect.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/lib/inspect.ts
- Live Doc ID: LD-implementation-scripts-live-docs-lib-inspect-ts
- Generated At: 2026-02-03T21:55:41.873Z

## Authored
### Purpose
Re-export shim that exposes the inspect module's public API from the `scripts/live-docs/lib/` location. Follows the same pattern as `lib/liveDocGraph.ts` for CLI discoverability.

### Notes
Created during Dev Day 50 (12/19) to maintain the lib convention while the actual implementation lives in `packages/scripts/src/live-docs/inspect/`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.873Z","inputHash":"7f019e8cb7dfb7d2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md) (re-export)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Re-Exported Symbol Anchors -->
### Re-Exported Symbol Anchors
#### `buildSymbolDescriptors` {#symbol-buildsymboldescriptors}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-buildsymboldescriptors)

#### `describeNode` {#symbol-describenode}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-describenode)

#### `Direction` {#symbol-direction}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-direction)

#### `emitDualDirectionResult` {#symbol-emitdualdirectionresult}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitdualdirectionresult)

#### `emitDualDirectionSymbolResult` {#symbol-emitdualdirectionsymbolresult}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitdualdirectionsymbolresult)

#### `emitFanoutResult` {#symbol-emitfanoutresult}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitfanoutresult)

#### `emitNotFound` {#symbol-emitnotfound}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitnotfound)

#### `emitPathResult` {#symbol-emitpathresult}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitpathresult)

#### `emitSymbolPathNotFound` {#symbol-emitsymbolpathnotfound}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitsymbolpathnotfound)

#### `emitSymbolPathResult` {#symbol-emitsymbolpathresult}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-emitsymbolpathresult)

#### `enumerateTerminalPaths` {#symbol-enumerateterminalpaths}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-enumerateterminalpaths)

#### `FanoutPath` {#symbol-fanoutpath}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-fanoutpath)

#### `FrontierEntry` {#symbol-frontierentry}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-frontierentry)

#### `getNeighbors` {#symbol-getneighbors}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-getneighbors)

#### `getSymbolNeighbors` {#symbol-getsymbolneighbors}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-getsymbolneighbors)

#### `hasSymbolReference` {#symbol-hassymbolreference}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-hassymbolreference)

#### `HopDescriptor` {#symbol-hopdescriptor}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-hopdescriptor)

#### `MAX_ENUMERATED_PATHS` {#symbol-max_enumerated_paths}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-max_enumerated_paths)

#### `NodeDescriptor` {#symbol-nodedescriptor}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-nodedescriptor)

#### `normalizeAnchor` {#symbol-normalizeanchor}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-normalizeanchor)

#### `normalizeInputIdentifier` {#symbol-normalizeinputidentifier}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-normalizeinputidentifier)

#### `parseSymbolReference` {#symbol-parsesymbolreference}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-parsesymbolreference)

#### `PathSearchResult` {#symbol-pathsearchresult}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-pathsearchresult)

#### `reconstructPath` {#symbol-reconstructpath}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-reconstructpath)

#### `resolveAnchorToSymbolName` {#symbol-resolveanchortosymbolname}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-resolveanchortosymbolname)

#### `resolveArtifactIdentifier` {#symbol-resolveartifactidentifier}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-resolveartifactidentifier)

#### `resolveSymbolReference` {#symbol-resolvesymbolreference}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-resolvesymbolreference)

#### `searchGraph` {#symbol-searchgraph}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-searchgraph)

#### `searchSymbolPath` {#symbol-searchsymbolpath}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-searchsymbolpath)

#### `stripLiveDocDecorations` {#symbol-striplivedocdecorations}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-striplivedocdecorations)

#### `SymbolDescriptor` {#symbol-symboldescriptor}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-symboldescriptor)

#### `SymbolHop` {#symbol-symbolhop}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-symbolhop)

#### `symbolMatchesAnchor` {#symbol-symbolmatchesanchor}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-symbolmatchesanchor)

#### `SymbolParameterDescriptor` {#symbol-symbolparameterdescriptor}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-symbolparameterdescriptor)

#### `SymbolPathSearchResult` {#symbol-symbolpathsearchresult}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-symbolpathsearchresult)

#### `SymbolReference` {#symbol-symbolreference}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-symbolreference)

#### `symbolToAnchor` {#symbol-symboltoanchor}
- Re-exported from [`index`](../../../packages/scripts/src/live-docs/inspect/index.ts.mdmd.md#symbol-symboltoanchor)
<!-- LIVE-DOC:END Re-Exported Symbol Anchors -->
