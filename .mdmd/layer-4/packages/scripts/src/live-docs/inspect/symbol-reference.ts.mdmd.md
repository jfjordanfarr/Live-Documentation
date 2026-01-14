# packages/scripts/src/live-docs/inspect/symbol-reference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/symbol-reference.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-symbol-reference-ts
- Generated At: 2026-01-14T15:17:48.525Z

## Authored
### Purpose
Provides symbol reference parsing and resolution for the inspect CLI. Enables users to specify artifact paths with optional symbol anchors (e.g., `path/to/file.ts#MyFunction`) and resolves those references against the Live Doc graph.

### Notes
Extracted from inspect.ts during Dev Day 50 (12/19). The module handles the `parseSymbolReference()` and `resolveSymbolReference()` logic that powers symbol-level pathfinding in `npm run live-docs:inspect -- --from <path>#<symbol> --to <path>#<symbol>`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T15:17:48.525Z","inputHash":"8e06bfa4e99d642f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `symbolToAnchor` {#symbol-symboltoanchor}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L20)

##### `symbolToAnchor` — Summary
Converts a symbol name (e.g., "GraphStore") to an anchor slug (e.g., "symbol-graphstore").
This matches the format used in Live Doc markdown links.

#### `normalizeAnchor` {#symbol-normalizeanchor}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L28)

##### `normalizeAnchor` — Summary
Converts an anchor slug (e.g., "symbol-graphstore") back to a normalized form for comparison.
Returns the lowercase version without the prefix.

#### `symbolMatchesAnchor` {#symbol-symbolmatchesanchor}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L40)

##### `symbolMatchesAnchor` — Summary
Checks if a symbol name matches an anchor slug.
Handles the symbol-prefix format used in Live Doc anchors.

#### `resolveAnchorToSymbolName` {#symbol-resolveanchortosymbolname}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L54)
- Parameters: `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)

##### `resolveAnchorToSymbolName` — Summary
Attempts to resolve an anchor slug to a proper symbol name by looking up
the target node's publicSymbols array.
Returns the matched symbol name or the original anchor if no match found.

#### `parseSymbolReference` {#symbol-parsesymbolreference}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L86)

##### `parseSymbolReference` — Summary
Parses an input string that may contain a symbol reference.
Supported formats:
- `path/to/file.ts` → { path: "path/to/file.ts", symbol: undefined }
- `path/to/file.ts#SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" }
- `path/to/file.ts:SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" } (Windows-safe alt)

#### `hasSymbolReference` {#symbol-hassymbolreference}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L115)

##### `hasSymbolReference` — Summary
Checks if an input string contains a symbol reference.

#### `resolveSymbolReference` {#symbol-resolvesymbolreference}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L127)
- Returns: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig); `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)

##### `resolveSymbolReference` — Summary
Resolves a symbol reference to a validated SymbolReference.
Returns undefined if the code path cannot be resolved.

Note: Even if the symbol doesn't exist in publicSymbols, the reference is still
returned to allow partial matches during path search.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`resolve-artifact.resolveArtifactIdentifier`](./resolve-artifact.ts.mdmd.md#symbol-resolveartifactidentifier)
- [`types.SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference) (type-only)
- [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
<!-- LIVE-DOC:END Dependencies -->
