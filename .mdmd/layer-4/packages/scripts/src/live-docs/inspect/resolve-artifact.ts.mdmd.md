# packages/scripts/src/live-docs/inspect/resolve-artifact.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/inspect/resolve-artifact.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-inspect-resolve-artifact-ts
- Generated At: 2026-02-03T21:55:37.395Z

## Authored
### Purpose
Resolves user-provided artifact paths to Live Doc graph nodes. Handles the ambiguity between code paths and doc paths, normalizing inputs to canonical graph node IDs for pathfinding operations.

### Notes
Extracted from inspect.ts during Dev Day 50 (12/19). Works in tandem with symbol-reference.ts to provide the full path resolution pipeline for the inspect CLI.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.395Z","inputHash":"8851440551c52eab"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `resolveArtifactIdentifier` {#symbol-resolveartifactidentifier}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/resolve-artifact.ts#L26)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig); `graph`: [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph)

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
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/resolve-artifact.ts#L61)

##### `normalizeInputIdentifier` — Summary
Normalizes a user-provided identifier to a workspace-relative path.

##### `normalizeInputIdentifier` — Parameters
- `input`: The raw user input
- `workspaceRoot`: Absolute path to workspace root

##### `normalizeInputIdentifier` — Returns
Normalized workspace-relative path

#### `stripLiveDocDecorations` {#symbol-striplivedocdecorations}
- Type: function
- Source: [source](../../../../../../../packages/scripts/src/live-docs/inspect/resolve-artifact.ts#L86)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `stripLiveDocDecorations` — Summary
Strips Live Doc path decorations (root, baseLayer, extension) from a path
to recover the original code path.

##### `stripLiveDocDecorations` — Parameters
- `config`: Live Documentation configuration
- `value`: The potentially decorated path

##### `stripLiveDocDecorations` — Returns
The stripped path
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`LiveDocGraph`](../graph/liveDocGraph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
