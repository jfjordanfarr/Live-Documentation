# `scripts/live-docs/inspect/resolve.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/inspect/resolve.ts
- Generated At: 2026-11-19T19:23:31.344Z

## Authored
### Purpose
What the inspect CLI accepts: a code path, a doc path, or either with a `#Symbol` suffix, resolved against the graph.

### Notes
- Gathered here on 2026-09-28 from the artifact and symbol-reference modules extracted from the inspect CLI on 2025-12-19.
- `resolveAnchorToSymbolName` matches an anchor against a file's symbols by slug first, then by name, so a disambiguated heading resolves to its real symbol.
- Since 2026-11-19 a path named in another case than the file's is that file, when only one file answers to it, since on Windows a path's case is not the person's to get right; [the cold run](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#the-strangers-steps-and-stumbles) found `--from PUBLIC/get-dbadbview.ps1` refused where `public/Get-DbaDbView.ps1` was answered. The name as written is tried first, so two files that differ only in case, as a repository made on Linux may hold, are each still found by their own spelling, and a name both answer to is refused with both. A history question, `--at` with `--from`, still takes the name as written ([the probe](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `resolveArtifactIdentifier` {#symbol-resolveartifactidentifier}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/resolve.ts#L28)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig); `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `resolveArtifactIdentifier` — Summary
Resolves an artifact identifier (code path, doc path, or relative path) to a
canonical code path in the graph.

##### `resolveArtifactIdentifier` — Parameters
- `config`: Live Documentation configuration
- `graph`: The Live Doc graph
- `input`: The user-provided identifier
- `workspaceRoot`: Absolute path to workspace root

##### `resolveArtifactIdentifier` — Returns
The resolved code path, or undefined if not found

#### `normalizeInputIdentifier` {#symbol-normalizeinputidentifier}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/resolve.ts#L67)

##### `normalizeInputIdentifier` — Summary
Normalizes a user-provided identifier to a workspace-relative path.

##### `normalizeInputIdentifier` — Parameters
- `input`: The raw user input
- `workspaceRoot`: Absolute path to workspace root

##### `normalizeInputIdentifier` — Returns
Normalized workspace-relative path

#### `stripLiveDocDecorations` {#symbol-striplivedocdecorations}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/resolve.ts#L92)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `stripLiveDocDecorations` — Summary
Strips Live Doc path decorations (root, baseLayer, extension) from a path
to recover the original code path.

##### `stripLiveDocDecorations` — Parameters
- `config`: Live Documentation configuration
- `value`: The potentially decorated path

##### `stripLiveDocDecorations` — Returns
The stripped path

#### `parseSymbolReference` {#symbol-parsesymbolreference}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/resolve.ts#L125)

##### `parseSymbolReference` — Summary
Parses an input string that may contain a symbol reference.
Supported formats:
- `path/to/file.ts` → { path: "path/to/file.ts", symbol: undefined }
- `path/to/file.ts#SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" }
- `path/to/file.ts:SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" } (Windows-safe alt)

#### `hasSymbolReference` {#symbol-hassymbolreference}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/resolve.ts#L154)

##### `hasSymbolReference` — Summary
Checks if an input string contains a symbol reference.

#### `resolveSymbolReference` {#symbol-resolvesymbolreference}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/resolve.ts#L165)
- Returns: [`SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig); `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `resolveSymbolReference` — Summary
Resolves a symbol reference to a validated SymbolReference.
Returns undefined if the code path cannot be resolved.

Note: Even if the symbol doesn't exist in the file's symbols, the reference is still
returned to allow partial matches during path search.

#### `resolveAnchorToSymbolName` {#symbol-resolveanchortosymbolname}
- Type: function
- Source: [source](../../../../../scripts/live-docs/inspect/resolve.ts#L186)
- Parameters: `graph`: [`LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph)

##### `resolveAnchorToSymbolName` — Summary
Resolves an anchor slug to the name of the symbol that carries it in the
file's doc: by its slug first, then by name.
Returns the matched symbol name or the original anchor if no match found.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`LiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`document.symbolName`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-symbolname)
- [`graph.LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`pathfind.SymbolReference`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolreference)
- [`pathfind.symbolMatchesAnchor`](../../../packages/engine/src/live-docs/pathfind.ts.mdmd.md#symbol-symbolmatchesanchor)
- [`pathUtils.normalizeWorkspacePath`](../../../packages/engine/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`cli.UsageError`](../cli.ts.mdmd.md#symbol-usageerror)
<!-- LIVE-DOC:END Dependencies -->
