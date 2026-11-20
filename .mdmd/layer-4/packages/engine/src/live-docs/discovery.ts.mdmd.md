# `packages/engine/src/live-docs/discovery.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/discovery.ts`
- Generated At: 2026-11-20T16:58:04.583Z

## Authored
### Purpose
File discovery and the workspace-wide indexes for Live Documentation. Locates workspace files matching configured globs for Live Doc generation and, in one pass over them, builds the symbol index that enables cross-file type reference linking and the entry index of the files manifests declare as entries.

### Notes
- Current index provenance (2026-11-08): named re-exports retain the resolved provider and original export name from dependency analysis; star re-exports retain the provider already established by their resolver. Named default declarations are indexed under their declared name and `default`. Imported-type resolution follows only this supplied provenance; it does not infer a declaration from a nearby namesake.
- The walk classifies symlink targets without recursively following directory links: links to files remain discoverable, while directory links and dangling links have no file content to analyze. T3 Code's `.claude/skills` directory link exposed that `glob`'s `nodir` alone does not make this distinction ([the external-project investigation](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-27/2026-10-27.1.record.md#turn-3)).
- Extracted 2025-12-06 from the monolithic `core.ts` during the "break up core.ts" refactoring
- `discoverTargetFiles()` supports `--changed` mode via git intersection for fast iterations; an empty git change set selects no files. The generator discovers the full source set separately for workspace-wide indexes before selecting changed files for rendering.
- `resolveTypeToLiveDoc()` in `compose.ts` looks up a type name in the index; each location records whether its file declares the symbol or only re-exports it
- The index is keyed by symbol name (case-sensitive) and supports multiple definitions with the same name
- `buildWorkspaceSymbolIndex()` became `buildWorkspaceIndexes()` on 2026-10-15 ([Turn 4](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-15/2026-10-15.1.record.md#turn-4)): the same pass also collects what each manifest declares (`declares` on the analysis result: the files its scripts run, its binaries, its main module) into the entry index, keyed by the declared file, from which the second pass writes each file's `Entry` lines.
- Discovery reads every file the shipped globs name, hidden folders included, in one `glob` call (since 2026-10-16, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#c-and-c-read-by-the-grammar-the-include-rule-chosen-by-measurement-and-discovery-that-reads-every-suffix-anywhere-recorded-2026-10-16); the per-pattern loop took 72 s over this repository where one call takes 1.3 s). Five product rules then remove what no project wants documented, `.git`, `node_modules`, the configured docs root (derived from `config.root` in any spelling), lock files by name, and documents (since 2026-10-22); git's own word removes what it ignores (`gitIgnores` in the engine's tooling reads git's listing of what it ignores, so a nested `.gitignore`, `.git/info/exclude` and the global excludes file count, and a tracked file is never ignored: a `.vscode/settings.json` committed under an ignored folder is read; until 2026-11-20 it asked `git check-ignore` about every candidate), the root `.gitignore` alone standing in when git cannot answer; and the configuration's `exclude` removes what the person names, by path or glob. Each rule has a case in `discovery.test.ts`. The git rule replaced a reading of the root `.gitignore` with `git ls-files` on 2026-10-16, when a regeneration documented 2,727 files of two agent worktrees nested under `.claude/worktrees/`, which `.git/info/exclude` names and the root `.gitignore` did not ([Turn 3 of the October 16 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3)).
- Two latent faults found with the change: the first pass had read `.ts .tsx .js .jsx .mjs .cjs` by a hardcoded list, so `.mts` and `.cts` symbols were never indexed although the main pass read them (now `SUPPORTED_SCRIPT_EXTENSIONS`); and `inferScriptKind` was handed the path where it wanted the extension.
- Since 2026-11-19 a re-export's anchor in the index is the one its doc writes, from `compose.ts`'s `anchorReExports`, so that two re-exports one anchor would name, `Foo` and `foo`, are told apart in both alike.
- When TS/JS source has bare star re-export syntax, the first pass uses the same current-workspace re-export resolver that renders its `Re-Exported Symbol Anchors` section. It indexes only anchors that section will publish, marked as re-exports, so imports can link to real barrel anchors and declaration links still prefer origins. Namespace re-exports are ordinary exported symbols under their namespace name and do not trigger peer expansion here.
- Since 2026-10-22 the shipped glob is every file, and documents are never documented: markdown, reStructuredText and AsciiDoc by suffix, and by name the plain-text readme, licence and its kin (`LICENSE-MIT`, `COPYING`, `NOTICE`), changelog, authors and contributing files with no extension or `.txt`, a name with another extension (`license.ts`) being code. A document reaches the map as linked documentation when a doc's authored words link to it. The owner: "I don't think we want to make a doc for a doc. I think we should aim for the "Linked Documentation" bundle to handle that.", and of licences, "they are docs and should be treated as such"; the markdown rule is absolute for now and expected to change for "prompts as programs", an agent's `SKILL.md` among them ([Turns 7 and 8 of the October 21 session](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-21/2026-10-21.1.record.md#turn-7)). The walk no longer enters `.git`, `node_modules` or the docs root at all (`glob`'s `ignore`), so every-file discovery walks this repository in under half a second.
- `discoverDocuments` (2026-10-22, [the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#related-documents-run-both-ways-a-docs-cited-by-section-is-generated-from-the-documents-own-links-recorded-2026-10-22)): the workspace's documents for the generator's `Cited By` sections, found by the same walk as the files (now shared as `walk` and `keptByGitAndConfiguration`): every document anywhere, whatever the configured globs name, since a document anywhere may link to a file and a doc's words may link to a document anywhere; less what git ignores and what `exclude` names; never `.git`, `node_modules` or the generated docs' base layer, while the authored documents a repository keeps under its docs root beside that layer count. The configured globs still decide which files get docs.
- Since 2026-11-19 discovery orders the files it finds by their workspace-relative paths with forward slashes, by code unit (`inWorkspaceOrder`), not by their absolute paths as the platform spells them: on Windows a backslash sorts after the digits and the capitals, so `Shop.Data2\` came before `Shop.Data\`, the reverse of Linux, and since the order is the one in which files register their symbols, a type two files declare alike could resolve to another file on each. The generator's `--include` list is ordered the same way. On Linux the order is the one it always was, so no doc moved. Found by imitating Windows that day.
- Since 2026-11-20 the two walks do not read the folders git ignores whole (`walkedAndKept`): git is asked first (`gitIgnores` in the engine's tooling) and glob reads those folders as empty. In the main checkout, with 28 builders' worktrees under `.claude/worktrees/`, the files' walk had taken 63.6 s and the documents' 19.6 s, where a clean worktree took 1.4 s and 0.4 s. The first version also walked again in full where git refused a path, and the second asked `git check-ignore` about each path by its name; since the third form, the same day, the one listing that shortens the walk also judges what it found, so what is left unread is exactly what is judged ignored, a nested repository's files are judged by its own git, and where the listing fails the walk is whole and the root `.gitignore` alone judges. A file git cannot judge, reached through a link to a folder git does not ignore or in a nested repository git cannot be asked about, is judged by the root `.gitignore` alone, and the generator warns of it from both walks; and since the fourth form, the same day, a walk made whole because git could not be asked is never silent either, but where git says there is no repository ([the fourth form](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#gits-own-view-of-a-folder-the-fourth-form)). Each case, and one that counts the folders read, is in `discovery.test.ts`; `discovery.oracle.test.ts` holds discovery to `git status` over random repositories ([the probe of 2026-11-20](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md), and [the third form](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#reading-gits-own-listing-the-third-form)).
- Since the seventh round, the same day ([its record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#several-clones-in-one-scan-and-the-machines-failures-the-seventh-round)): a folder the first listing left unread that the second does not ignore whole (a file tracked in it during the walk) makes the walk run again by the second listing, so that no file is lost because its folder was left unwalked; a folder read that fails for a cause of the machine's stops the walk, naming the folder, where glob read it as empty and its files' docs would have been pruned as stale; a link that loops or passes through a file leads to nothing to document, where it stopped the walk; a workspace that lies in no repository, a folder of clones, is judged repository by repository, the files outside every one by the root `.gitignore` with no warning; and the warnings say both things the root `.gitignore` can do in git's place, document what the repository ignores and leave out what it tracks. The index pass hands each file that threw to the generator with its error (`unmapped`), which names it as a file it could not map, as it does a throw of its own per-file pass, so that a person's run names it and goes on and the history publishes no summary made with a failure of the machine's; until then every throw was swallowed, and a symbol whose file failed there was linked to the barrel that re-exports it, with no mark and no warning.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `docsRootWithin` {#symbol-docsrootwithin}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L176)
- Parameters: `config`: [`LiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `docsRootWithin` — Summary
The configured docs root as a workspace-relative path, however the
configuration spells it (`.mdmd`, `./.mdmd/`, an absolute path), or
`undefined` when it is not a folder within the workspace: the workspace
itself, or somewhere outside it.

#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L223)
- Parameters: `options`: `DiscoverOptions`

##### `discoverTargetFiles` — Summary
Locates workspace files that should receive Live Documentation generation.

##### `discoverTargetFiles` — Remarks
The configured globs, or the include set when one is given, are matched
over the whole workspace in one walk, hidden files and folders included, so
that `.devcontainer/devcontainer.json` or `.vscode/settings.json` is read
like any other file; the folders that are never documented are not walked,
nor, where git can say so, the folders git ignores whole ({@link walkedAndKept}).
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
- `options.warn`: Told when git cannot judge some of the files found ({@link keptByGitAndConfiguration}).
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
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L250)

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

#### `inWorkspaceOrder` {#symbol-inworkspaceorder}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L362)
- Returns: `T`[]
- Parameters: `files`: `T`[]

##### `inWorkspaceOrder` — Summary
Files in the order of their workspace-relative paths with forward slashes, by UTF-16 code unit, whatever the platform
spells their absolute paths with: on Windows a backslash sorts after the digits and the capitals, where a slash sorts
before them, so an order of absolute paths put `Shop.Data2\` before `Shop.Data\`, the reverse of Linux. The order is
the one in which files register their symbols, so it must not depend on the platform.

#### `WorkspaceIndexes` {#symbol-workspaceindexes}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L412)

##### `WorkspaceIndexes` — Summary
The two indexes the first pass builds: the symbols every file publishes, and the files manifests declare as entries.

#### `buildWorkspaceIndexes` {#symbol-buildworkspaceindexes}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L451)

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

Whatever a file throws while it is read, a failure of the machine's (too
many open files) or a stack run short, leaves its symbols out and names it in
`unmapped` with the error, which the generator carries to its list of files
it could not map, as it does a throw of its own per-file pass: there a
person's run names the file and goes on, and the history publishes no summary
made with a failure of the machine's. Until 2026-11-20 every throw was
swallowed, and a symbol whose file failed here was linked to the barrel that
re-exports it, with no mark and no warning.

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
- [`compose.anchorReExports`](./compose.ts.mdmd.md#symbol-anchorreexports)
- [`compose.computePublicSymbolHeadingInfo`](./compose.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`coreConstants.SUPPORTED_SCRIPT_EXTENSIONS`](./coreConstants.ts.mdmd.md#symbol-supported_script_extensions)
- [`coreTypes.DeclaredEntry`](./coreTypes.ts.mdmd.md#symbol-declaredentry) (type-only)
- [`coreTypes.DependencyEntry`](./coreTypes.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`coreTypes.PublicSymbolEntry`](./coreTypes.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`coreTypes.ReExportedSymbolInfo`](./coreTypes.ts.mdmd.md#symbol-reexportedsymbolinfo) (type-only)
- [`coreTypes.ResolvedSymbolLocation`](./coreTypes.ts.mdmd.md#symbol-resolvedsymbollocation) (type-only)
- [`coreTypes.WorkspaceEntryIndex`](./coreTypes.ts.mdmd.md#symbol-workspaceentryindex) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](./coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`dependencies.augmentWithReExportedSymbols`](./dependencies.ts.mdmd.md#symbol-augmentwithreexportedsymbols)
- [`dependencies.collectDependencies`](./dependencies.ts.mdmd.md#symbol-collectdependencies)
- [`gitUtils.detectChangedFiles`](./gitUtils.ts.mdmd.md#symbol-detectchangedfiles)
- [`symbolExtraction.collectExportedSymbols`](./symbolExtraction.ts.mdmd.md#symbol-collectexportedsymbols)
- [`symbolExtraction.inferScriptKind`](./symbolExtraction.ts.mdmd.md#symbol-inferscriptkind)
- [`gitIgnored.GitIgnores`](../tooling/gitIgnored.ts.mdmd.md#symbol-gitignores-interface)
- [`gitIgnored.GitUnanswered`](../tooling/gitIgnored.ts.mdmd.md#symbol-gitunanswered)
- [`gitIgnored.foldersReadAsEmpty`](../tooling/gitIgnored.ts.mdmd.md#symbol-foldersreadasempty)
- [`gitIgnored.gitIgnores`](../tooling/gitIgnored.ts.mdmd.md#symbol-gitignores-function)
- [`gitIgnored.gitIgnoresCase`](../tooling/gitIgnored.ts.mdmd.md#symbol-gitignorescase)
- [`pathUtils.normalizeWorkspacePath`](../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`sourceText.readSourceText`](../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`sourceText.throwIfMachineFailure`](../tooling/sourceText.ts.mdmd.md#symbol-throwifmachinefailure)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
