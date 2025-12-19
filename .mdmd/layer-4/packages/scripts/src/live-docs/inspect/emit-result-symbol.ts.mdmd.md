# packages/scripts/src/live-docs/inspect/emit-result-symbol.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/emit-result-symbol.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-emit-result-symbol-ts
- Generated At: 2025-12-19T21:55:44.616Z

## Authored
### Purpose
Formats and outputs symbol-level pathfinding results for the inspect CLI. When paths traverse specific symbols (e.g., `#loadConfig` → `#query`), this module renders the symbol chain with proper anchor formatting.

### Notes
Extracted from inspect.ts during Dev Day 50 (12/19). Symbol paths include both the file hops and the specific exported symbols at each hop, providing granular impact visibility.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:55:44.616Z","inputHash":"c50e857a33f67a6f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `emitSymbolPathResult` {#symbol-emitsymbolpathresult}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/emit-result-symbol.ts#L32)
- Parameters: `symbolPath`: [`SymbolHop`](./types.ts.mdmd.md#symbol-symbolhop)[]; `from`: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference); `to`: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference); `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction); `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)

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
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/emit-result-symbol.ts#L90)
- Parameters: `from`: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference); `to`: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference); `direction`: [`Direction`](./types.ts.mdmd.md#symbol-direction)

##### `emitSymbolPathNotFound` — Summary
Emits a "symbol path not found" result.

##### `emitSymbolPathNotFound` — Parameters
- `direction`: Traversal direction used
- `from`: Source symbol reference
- `json`: If true, emit JSON format
- `to`: Target symbol reference
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocGraph.LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`symbol-reference.resolveAnchorToSymbolName`](./symbol-reference.ts.mdmd.md#symbol-resolveanchortosymbolname)
- [`types.Direction`](./types.ts.mdmd.md#symbol-direction) (type-only)
- [`types.SymbolHop`](./types.ts.mdmd.md#symbol-symbolhop) (type-only)
- [`types.SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference) (type-only)
<!-- LIVE-DOC:END Dependencies -->
