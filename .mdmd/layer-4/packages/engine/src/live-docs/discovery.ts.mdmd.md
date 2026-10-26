# packages/engine/src/live-docs/discovery.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/discovery.ts
- Generated At: 2026-10-26T21:50:56.757Z

## Authored
### Purpose
File discovery and the workspace-wide indexes for Live Documentation. Locates workspace files matching configured globs for Live Doc generation and, in one pass over them, builds the symbol index that enables cross-file type reference linking and the entry index of the files manifests declare as entries.

### Notes
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `discoverTargetFiles()` supports `--changed` mode via git intersection for fast iterations; an empty git change set selects no files. The generator discovers the full source set separately for workspace-wide indexes before selecting changed files for rendering.
- `buildWorkspaceSymbolIndex()` performs a lightweight pre-scan of all targets to collect exported symbols
- `resolveTypeToLiveDoc()` in `compose.ts` looks up a type name in the index; each location records whether its file declares the symbol or only re-exports it
- The index is keyed by symbol name (case-sensitive) and supports multiple definitions with the same name
- `buildWorkspaceSymbolIndex()` became `buildWorkspaceIndexes()` on 2026-10-15 ([Turn 4](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-4)): the same pass also collects what each manifest declares (`declares` on the analysis result: the files its scripts run, its binaries, its main module) into the entry index, keyed by the declared file, from which the second pass writes each file's `Entry` lines.
- Discovery reads every file the shipped globs name, hidden folders included, in one `glob` call (since 2026-10-16, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#c-and-c-read-by-the-grammar-the-include-rule-chosen-by-measurement-and-discovery-that-reads-every-suffix-anywhere-recorded-2026-10-16); the per-pattern loop took 72 s over this repository where one call takes 1.3 s). Five product rules then remove what no project wants documented, `.git`, `node_modules`, the configured docs root (derived from `config.root` in any spelling), lock files by name, and documents (since 2026-10-22); git's own word removes what it ignores (`gitIgnored` in the engine's tooling asks `git check-ignore` once for every candidate, so a nested `.gitignore`, `.git/info/exclude` and the global excludes file count, and a tracked file is never ignored: a `.vscode/settings.json` committed under an ignored folder is read), the root `.gitignore` alone standing in when git cannot answer; and the configuration's `exclude` removes what the person names, by path or glob. Each rule has a case in `discovery.test.ts`. The git rule replaced a reading of the root `.gitignore` with `git ls-files` on 2026-10-16, when a regeneration documented 2,727 files of two agent worktrees nested under `.claude/worktrees/`, which `.git/info/exclude` names and the root `.gitignore` did not ([Turn 3 of the October 16 record](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)).
- Two latent faults found with the change: the first pass had read `.ts .tsx .js .jsx .mjs .cjs` by a hardcoded list, so `.mts` and `.cts` symbols were never indexed although the main pass read them (now `SUPPORTED_SCRIPT_EXTENSIONS`); and `inferScriptKind` was handed the path where it wanted the extension.
- When TS/JS source has bare star re-export syntax, the first pass uses the same current-workspace re-export resolver that renders its `Re-Exported Symbol Anchors` section. It indexes only anchors that section will publish, marked as re-exports, so imports can link to real barrel anchors and declaration links still prefer origins. Namespace re-exports are ordinary exported symbols under their namespace name and do not trigger peer expansion here.
- Since 2026-10-22 the shipped glob is every file, and documents are never documented: markdown, reStructuredText and AsciiDoc by suffix, and by name the plain-text readme, licence and its kin (`LICENSE-MIT`, `COPYING`, `NOTICE`), changelog, authors and contributing files with no extension or `.txt`, a name with another extension (`license.ts`) being code. A document reaches the map as linked documentation when a doc's authored words link to it. The owner: "I don't think we want to make a doc for a doc. I think we should aim for the "Linked Documentation" bundle to handle that.", and of licences, "they are docs and should be treated as such"; the markdown rule is absolute for now and expected to change for "prompts as programs", an agent's `SKILL.md` among them ([Turns 7 and 8 of the October 21 session](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-7)). The walk no longer enters `.git`, `node_modules` or the docs root at all (`glob`'s `ignore`), so every-file discovery walks this repository in under half a second.
- `discoverDocuments` (2026-10-22, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)): the workspace's documents for the generator's `Cited By` sections, found by the same walk as the files (now shared as `walk` and `keptByGitAndConfiguration`): every document anywhere, whatever the configured globs name, since a document anywhere may link to a file and a doc's words may link to a document anywhere; less what git ignores and what `exclude` names; never `.git`, `node_modules` or the generated docs' base layer, while the authored documents a repository keeps under its docs root beside that layer count. The configured globs still decide which files get docs.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L210)
- Parameters: `options`: `DiscoverOptions`

##### `discoverTargetFiles` — Summary
Locates workspace files that should receive Live Documentation generation.

##### `discoverTargetFiles` — Remarks
The configured globs, or the include set when one is given, are matched
over the whole workspace in one walk, hidden files and folders included, so
that `.devcontainer/devcontainer.json` or `.vscode/settings.json` is read
like any other file; the folders that are never documented are not walked.
Then, in this order, the matches are dropped that are never documented
({@link isNeverDocumented}: `.git`, `node_modules`, the docs root, lock
files, documents), that git ignores by its own word (a `.gitignore` at
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

#### `discoverDocuments` {#symbol-discoverdocuments}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L238)

##### `discoverDocuments` — Summary
The workspace's documents ({@link isDocument}), which never get a doc of
their own and reach the map as linked documentation instead: every one in
the workspace, whatever the configured globs name, since a doc's authored
words may link to a document anywhere and a document anywhere may link to a
file; held to the same rules as the files otherwise (what git ignores and
what the configuration's `exclude` names are left out), everywhere but
`.git`, `node_modules` and the generated docs themselves. The authored
documents a repository keeps beside its generated docs, under the docs root
but outside its base layer, are documents like any other. The generator
reads their links for the `Cited By` sections.

##### `discoverDocuments` — Returns
Workspace-relative paths with forward slashes, sorted.

#### `WorkspaceIndexes` {#symbol-workspaceindexes}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L300)

##### `WorkspaceIndexes` — Summary
The two indexes the first pass builds: the symbols every file publishes, and the files manifests declare as entries.

#### `buildWorkspaceIndexes` {#symbol-buildworkspaceindexes}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L324)

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
- [`coreTypes.ReExportedSymbolInfo`](./coreTypes.ts.mdmd.md#symbol-reexportedsymbolinfo) (type-only)
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceEntryIndex`](./coreTypes.ts.mdmd.md#symbol-workspaceentryindex) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`coreUtils.createSymbolSlug`](./coreUtils.ts.mdmd.md#symbol-createsymbolslug)
- [`dependencies.augmentWithReExportedSymbols`](./dependencies.ts.mdmd.md#symbol-augmentwithreexportedsymbols)
- [`dependencies.collectDependencies`](./dependencies.ts.mdmd.md#symbol-collectdependencies)
- [`gitUtils.detectChangedFiles`](./gitUtils.ts.mdmd.md#symbol-detectchangedfiles)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind)
- [`gitIgnored`](../tooling/gitIgnored.ts.mdmd.md#symbol-gitignored)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
