# packages/engine/src/live-docs/discovery.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/discovery.ts
- Generated At: 2026-10-16T17:10:16.258Z

## Authored
### Purpose
File discovery and the workspace-wide indexes for Live Documentation. Locates workspace files matching configured globs for Live Doc generation and, in one pass over them, builds the symbol index that enables cross-file type reference linking and the entry index of the files manifests declare as entries.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `discoverTargetFiles()` supports `--changed` mode via git intersection for fast iterations
- `buildWorkspaceSymbolIndex()` performs a lightweight pre-scan of all targets to collect exported symbols
- `resolveTypeToLiveDoc()` in `compose.ts` looks up a type name in the index; each location records whether its file declares the symbol or only re-exports it
- The index is keyed by symbol name (case-sensitive) and supports multiple definitions with the same name
- `buildWorkspaceSymbolIndex()` became `buildWorkspaceIndexes()` on 2026-10-15 ([Turn 4](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4)): the same pass also collects what each manifest declares (`declares` on the analysis result: the files its scripts run, its binaries, its main module) into the entry index, keyed by the declared file, from which the second pass writes each file's `Entry` lines.
- Discovery reads every file the shipped globs name, hidden folders included, in one `glob` call (since 2026-10-16, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#c-and-c-read-by-the-grammar-the-include-rule-chosen-by-measurement-and-discovery-that-reads-every-suffix-anywhere-recorded-2026-10-16); the per-pattern loop took 72 s over this repository where one call takes 1.3 s). Four product rules then remove what no project wants documented, `.git`, `node_modules`, the configured docs root (derived from `config.root` in any spelling) and lock files by name; git's own word removes what it ignores (`gitIgnored` in the engine's tooling asks `git check-ignore` once for every candidate, so a nested `.gitignore`, `.git/info/exclude` and the global excludes file count, and a tracked file is never ignored: a `.vscode/settings.json` committed under an ignored folder is read), the root `.gitignore` alone standing in when git cannot answer; and the configuration's `exclude` removes what the person names, by path or glob. Each rule has a case in `discovery.test.ts`. The git rule replaced a reading of the root `.gitignore` with `git ls-files` on 2026-10-16, when a regeneration documented 2,727 files of two agent worktrees nested under `.claude/worktrees/`, which `.git/info/exclude` names and the root `.gitignore` did not ([Turn 3 of the October 16 record](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)).
- Two latent faults found with the change: the first pass had read `.ts .tsx .js .jsx .mjs .cjs` by a hardcoded list, so `.mts` and `.cts` symbols were never indexed although the main pass read them (now `SUPPORTED_SCRIPT_EXTENSIONS`); and `inferScriptKind` was handed the path where it wanted the extension.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L175)
- Parameters: `options`: `DiscoverOptions`

##### `discoverTargetFiles` — Summary
Locates workspace files that should receive Live Documentation generation.

##### `discoverTargetFiles` — Remarks
The configured globs, or the include set when one is given, are matched
over the whole workspace in one walk, hidden files and folders included, so
that `.devcontainer/devcontainer.json` or `.vscode/settings.json` is read
like any other file. Then, in this order, the matches are dropped that are
never documented ({@link isNeverDocumented}: `.git`, `node_modules`, the
docs root, lock files), that git ignores by its own word (a `.gitignore` at
any level, `.git/info/exclude` and the global excludes file, with a tracked
file never ignored: a file committed under an ignored folder is part of the
repository, as git itself holds; without git, the workspace's `.gitignore`
alone), and that the configuration's `exclude` names by path or glob. When
`options.changedOnly` is `true`, the result is intersected with the files
git marks as changed, for quick iterations over touched files.

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

#### `WorkspaceIndexes` {#symbol-workspaceindexes}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L222)

##### `WorkspaceIndexes` — Summary
The two indexes the first pass builds: the symbols every file publishes, and the files manifests declare as entries.

#### `buildWorkspaceIndexes` {#symbol-buildworkspaceindexes}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L246)

##### `buildWorkspaceIndexes` — Summary
Builds the workspace-wide indexes for cross-Live-Doc resolution in one pass
over the target files.

##### `buildWorkspaceIndexes` — Remarks
The symbol index maps each exported symbol's name (case-sensitive) to its
locations, so that a type reference in one Live Doc links to the type's
definition in another; several files may publish one name. The entry index
maps each file a manifest declares as an entry (a script it runs, a binary,
its main module) to what declares it, so that the file's doc carries the
`Entry` line. TypeScript and JavaScript files are read with the built-in
parser; every other file is read by its language adapter.

##### `buildWorkspaceIndexes` — Parameters
- `options.docExtension`: File extension for Live Docs (e.g., ".md").
- `options.fileIndex`: The workspace file index, for the adapters that resolve string references.
- `options.liveDocsRoot`: Workspace-relative path to the Live Docs root (e.g., ".live-documentation/source").
- `options.targetFiles`: Absolute paths to all files being processed.
- `options.workspaceRoot`: Absolute path to the workspace root.
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
- [`archetype.matchesPathPattern`](./archetype.ts.mdmd.md#symbol-matchespathpattern)
- [`compose.computePublicSymbolHeadingInfo`](./compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`coreConstants.SUPPORTED_SCRIPT_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-supported_script_extensions)
- [`coreTypes.DeclaredEntry`](./coreTypes.ts.mdmd.md#symbol-declaredentry) (type-only)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceEntryIndex`](./coreTypes.ts.mdmd.md#symbol-workspaceentryindex) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`gitUtils.detectChangedFiles`](./gitUtils.ts.mdmd.md#symbol-detectchangedfiles)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind)
- [`gitIgnored`](../tooling/gitIgnored.ts.mdmd.md#symbol-gitignored)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
