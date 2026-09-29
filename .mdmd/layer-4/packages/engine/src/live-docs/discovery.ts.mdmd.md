# packages/engine/src/live-docs/discovery.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/discovery.ts
- Generated At: 2026-09-29T19:54:52.675Z

## Authored
### Purpose
File discovery and symbol indexing for Live Documentation. Locates workspace files matching configured globs for Live Doc generation and builds the workspace-wide symbol index that enables cross-file type reference linking.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `discoverTargetFiles()` supports `--changed` mode via git intersection for fast iterations
- `buildWorkspaceSymbolIndex()` performs a lightweight pre-scan of all targets to collect exported symbols
- `resolveTypeToLiveDoc()` in `compose.ts` looks up a type name in the index; each location records whether its file declares the symbol or only re-exports it
- The index is keyed by symbol name (case-sensitive) and supports multiple definitions with the same name

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L94)
- Parameters: `options`: `DiscoverOptions`

##### `discoverTargetFiles` — Summary
Locates workspace files that should receive Live Documentation generation.

##### `discoverTargetFiles` — Remarks
When `options.changedOnly` is `true`, the discovery set is intersected with
files currently marked as changed in git, allowing quick iterations that only
regenerate touched artifacts.

##### `discoverTargetFiles` — Parameters
- `options.changedOnly`: When `true`, restricts results to files with local modifications.
- `options.config`: Live Documentation configuration describing default globs and overrides.
- `options.include`: Optional override set limiting discovery to pre-selected relative paths.
- `options.workspaceRoot`: Absolute path to the repository root the CLI is operating in.

##### `discoverTargetFiles` — Returns
A sorted array of absolute, workspace-resolved file paths ready for analysis.

##### `discoverTargetFiles` — Examples
```ts
const files = await discoverTargetFiles({
  workspaceRoot,
  config,
  include: new Set(["packages/generator/src/generator.ts"]),
  changedOnly: false
});
```

##### `discoverTargetFiles` — Links
- `detectChangedFiles` — *

#### `buildWorkspaceSymbolIndex` {#symbol-buildworkspacesymbolindex}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L177)

##### `buildWorkspaceSymbolIndex` — Summary
Builds a workspace-wide symbol index for cross-Live-Doc type reference resolution.

##### `buildWorkspaceSymbolIndex` — Remarks
This function performs a lightweight pre-scan of all target files to collect
exported symbols and their locations. The resulting index enables type references
in one Live Doc to link to type definitions in other Live Docs.

The index is keyed by symbol name (case-sensitive) and maps to an array of
locations, allowing for multiple symbols with the same name from different files.

##### `buildWorkspaceSymbolIndex` — Parameters
- `options`: Configuration for the index build.
- `options.docExtension`: File extension for Live Docs (e.g., ".md").
- `options.liveDocsRoot`: Workspace-relative path to the Live Docs root (e.g., ".live-documentation/source").
- `options.targetFiles`: Absolute paths to all files being processed.
- `options.workspaceRoot`: Absolute path to the workspace root.

##### `buildWorkspaceSymbolIndex` — Returns
A map from symbol names to their resolved Live Doc locations.

##### `buildWorkspaceSymbolIndex` — Examples
```typescript
const index = await buildWorkspaceSymbolIndex({
  targetFiles: ["/workspace/src/types.ts", "/workspace/src/core.ts"],
  workspaceRoot: "/workspace",
  liveDocsRoot: ".live-documentation/source",
  docExtension: ".md"
});
// index.get("Widget") => [{ liveDocPath: ".live-documentation/source/src/types.ts.md", ... }]
```

##### `buildWorkspaceSymbolIndex` — Links
- `ResolvedSymbolLocation`
- `WorkspaceSymbolIndex` — *
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `ignore` - `Ignore`, `ignore`
- `node:fs/promises`
- `node:path` - `path`
- [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`index.WorkspaceFileIndex`](./adapters/index.ts.mdmd.md#symbol-workspacefileindex)
- [`index.analyzeWithLanguageAdapters`](./adapters/index.ts.mdmd.md#symbol-analyzewithlanguageadapters)
- [`compose.computePublicSymbolHeadingInfo`](./compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`gitUtils.detectChangedFiles`](./gitUtils.ts.mdmd.md#symbol-detectchangedfiles)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
