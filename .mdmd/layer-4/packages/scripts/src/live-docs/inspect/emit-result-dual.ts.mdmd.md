# packages/scripts/src/live-docs/inspect/emit-result-dual.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/emit-result-dual.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-emit-result-dual-ts
- Generated At: 2026-01-14T15:17:48.506Z

## Authored
### Purpose
Formats and outputs bidirectional pathfinding results when users specify `--direction both`. Combines inbound and outbound path results into a unified output showing all connections to/from an artifact.

### Notes
Extracted from inspect.ts during Dev Day 50 (12/19). Bidirectional mode is useful for understanding both "what does this depend on" and "what depends on this" in a single query.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T15:17:48.506Z","inputHash":"198e0926150669e5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `emitDualDirectionResult` {#symbol-emitdualdirectionresult}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/emit-result-dual.ts#L30)
- Parameters: `outboundResult`: [`PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult); `inboundResult`: [`PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult); `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)

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

#### `emitDualDirectionSymbolResult` {#symbol-emitdualdirectionsymbolresult}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/emit-result-dual.ts#L127)
- Parameters: `from`: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference); `to`: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference); `outboundResult`: [`SymbolPathSearchResult`](./types.ts.mdmd.md#symbol-symbolpathsearchresult); `inboundResult`: [`SymbolPathSearchResult`](./types.ts.mdmd.md#symbol-symbolpathsearchresult); `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)

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
- [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`describe-node.describeNode`](./describe-node.ts.mdmd.md#symbol-describenode)
- [`symbol-reference.resolveAnchorToSymbolName`](./symbol-reference.ts.mdmd.md#symbol-resolveanchortosymbolname)
- [`types.PathSearchResult`](./types.ts.mdmd.md#symbol-pathsearchresult) (type-only)
- [`types.SymbolHop`](./types.ts.mdmd.md#symbol-symbolhop) (type-only)
- [`types.SymbolPathSearchResult`](./types.ts.mdmd.md#symbol-symbolpathsearchresult) (type-only)
- [`types.SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference) (type-only)
<!-- LIVE-DOC:END Dependencies -->
