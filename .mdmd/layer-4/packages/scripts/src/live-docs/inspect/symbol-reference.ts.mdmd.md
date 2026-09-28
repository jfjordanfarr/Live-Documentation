# packages/scripts/src/live-docs/inspect/symbol-reference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/symbol-reference.ts
- Generated At: 2026-09-28T00:41:39.616Z

## Authored
### Purpose
Provides symbol reference parsing and resolution for the inspect CLI. Enables users to specify artifact paths with optional symbol anchors (e.g., `path/to/file.ts#MyFunction`) and resolves those references against the graph.

### Notes
- Extracted from inspect.ts on 2025-12-19. `resolveAnchorToSymbolName` matches an anchor against the file's symbols by slug first, then by name, so a disambiguated heading resolves to its real symbol.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `symbolToAnchor` {#symbol-symboltoanchor}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L21)

##### `symbolToAnchor` — Summary
Converts a symbol name (e.g., "GraphStore") to an anchor slug (e.g., "symbol-graphstore").
This matches the format used in Live Doc markdown links.

#### `normalizeAnchor` {#symbol-normalizeanchor}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L29)

##### `normalizeAnchor` — Summary
Converts an anchor slug (e.g., "symbol-graphstore") back to a normalized form for comparison.
Returns the lowercase version without the prefix.

#### `symbolMatchesAnchor` {#symbol-symbolmatchesanchor}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L41)

##### `symbolMatchesAnchor` — Summary
Checks if a symbol name matches an anchor slug.
Handles the symbol-prefix format used in Live Doc anchors.

#### `resolveAnchorToSymbolName` {#symbol-resolveanchortosymbolname}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L55)
- Parameters: `graph`: [`LiveDocGraph`](../../../../shared/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `resolveAnchorToSymbolName` — Summary
Resolves an anchor slug to the name of the symbol that carries it in the
file's doc: by its slug first, then by name.
Returns the matched symbol name or the original anchor if no match found.

#### `parseSymbolReference` {#symbol-parsesymbolreference}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L84)

##### `parseSymbolReference` — Summary
Parses an input string that may contain a symbol reference.
Supported formats:
- `path/to/file.ts` → { path: "path/to/file.ts", symbol: undefined }
- `path/to/file.ts#SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" }
- `path/to/file.ts:SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" } (Windows-safe alt)

#### `hasSymbolReference` {#symbol-hassymbolreference}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L113)

##### `hasSymbolReference` — Summary
Checks if an input string contains a symbol reference.

#### `resolveSymbolReference` {#symbol-resolvesymbolreference}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/symbol-reference.ts#L125)
- Returns: [`SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig); `graph`: [`LiveDocGraph`](../../../../shared/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `resolveSymbolReference` — Summary
Resolves a symbol reference to a validated SymbolReference.
Returns undefined if the code path cannot be resolved.

Note: Even if the symbol doesn't exist in publicSymbols, the reference is still
returned to allow partial matches during path search.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`resolve-artifact.resolveArtifactIdentifier`](./resolve-artifact.ts.mdmd.md#symbol-resolveartifactidentifier)
- [`types.SymbolReference`](./types.ts.mdmd.md#symbol-symbolreference) (type-only)
- [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`document.symbolName`](../../../../shared/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.LiveDocGraph`](../../../../shared/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
<!-- LIVE-DOC:END Dependencies -->
