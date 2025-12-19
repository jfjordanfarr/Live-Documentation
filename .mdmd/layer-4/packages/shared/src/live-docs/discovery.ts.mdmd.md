# packages/shared/src/live-docs/discovery.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/discovery.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-discovery-ts
- Generated At: 2025-12-19T04:50:48.237Z

## Authored
### Purpose
File discovery and symbol indexing for Live Documentation. Locates workspace files matching configured globs for Live Doc generation and builds the workspace-wide symbol index that enables cross-file type reference linking.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `discoverTargetFiles()` supports `--changed` mode via git intersection for fast iterations
- `buildWorkspaceSymbolIndex()` performs a lightweight pre-scan of all targets to collect exported symbols
- `resolveTypeToLiveDoc()` looks up a type name in the index and returns its Live Doc path/anchor
- The index is keyed by symbol name (case-sensitive) and supports multiple definitions with the same name

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T04:50:48.237Z","inputHash":"370d920a840e1f15"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/discovery.ts#L95)
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
  include: new Set(["packages/server/src/index.ts"]),
  changedOnly: false
});
```

##### `discoverTargetFiles` — Links
- `detectChangedFiles` — *

#### `buildWorkspaceSymbolIndex` {#symbol-buildworkspacesymbolindex}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/discovery.ts#L178)

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
- `options.docExtension`: File extension for Live Docs (e.g., ".mdmd.md").
- `options.liveDocsRoot`: Workspace-relative path to the Live Docs root (e.g., ".mdmd/layer-4").
- `options.targetFiles`: Absolute paths to all files being processed.
- `options.workspaceRoot`: Absolute path to the workspace root.

##### `buildWorkspaceSymbolIndex` — Returns
A map from symbol names to their resolved Live Doc locations.

##### `buildWorkspaceSymbolIndex` — Examples
```typescript
const index = await buildWorkspaceSymbolIndex({
  targetFiles: ["/workspace/src/types.ts", "/workspace/src/core.ts"],
  workspaceRoot: "/workspace",
  liveDocsRoot: ".mdmd/layer-4",
  docExtension: ".mdmd.md"
});
// index.get("Widget") => [{ liveDocPath: ".mdmd/layer-4/src/types.ts.mdmd.md", ... }]
```

##### `buildWorkspaceSymbolIndex` — Links
- `ResolvedSymbolLocation`
- `WorkspaceSymbolIndex` — *

#### `resolveTypeToLiveDoc` {#symbol-resolvetypetolivedoc}
- Type: function
- Source: [source](../../../../../../packages/shared/src/live-docs/discovery.ts#L276)
- Returns: [`ResolvedSymbolLocation`](./core.ts.mdmd.md#symbol-resolvedsymbollocation)
- Parameters: `index`: [`WorkspaceSymbolIndex`](./core.ts.mdmd.md#symbol-workspacesymbolindex)

##### `resolveTypeToLiveDoc` — Summary
Resolves a type name to its Live Doc location using the workspace symbol index.

##### `resolveTypeToLiveDoc` — Remarks
Returns undefined if the type is not found in the index. When multiple
symbols with the same name exist, returns the first match (future enhancement:
could use import context to disambiguate).

##### `resolveTypeToLiveDoc` — Parameters
- `currentSourcePath`: The source path of the file being rendered (to avoid self-links).
- `index`: The workspace-wide symbol index.
- `typeName`: The type name to resolve (e.g., "Widget", "Foo.Bar").

##### `resolveTypeToLiveDoc` — Returns
The resolved location, or undefined if not found.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `ignore` - `Ignore`, `ignore`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`liveDocumentationConfig.LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`index.analyzeWithLanguageAdapters`](./adapters/index.ts.mdmd.md#symbol-analyzewithlanguageadapters)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`coreUtils.compareSymbolLocationsPreferOrigin`](./coreUtils.ts.mdmd.md#symbol-comparesymbollocationspreferorigin)
- [`gitUtils.detectChangedFiles`](./gitUtils.ts.mdmd.md#symbol-detectchangedfiles)
- [`rendering.computePublicSymbolHeadingInfo`](./rendering.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
