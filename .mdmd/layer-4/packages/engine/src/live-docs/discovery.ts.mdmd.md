# `packages/engine/src/live-docs/discovery.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/discovery.ts`
- Generated At: 2026-11-24T10:31:38.516Z

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
- After the reviewer's second look, the same day ([its record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#an-unreadable-folder-stops-the-scan-only-where-its-files-would-be-kept)): a folder the walk cannot read stops the scan only where its files would have been kept. The walk names each such folder, and the judging passes over one its own repository's git ignores or `exclude` names whole, a database's unreadable `pgdata/` beside a clone's code above all; any other stops the scan with an error that names the folder, the system's reason and the three ways past it, its cause the system's failure, so that a history worker still publishes nothing made with it. Until then such a folder stopped the scan even where nothing in it would have been documented.
- After the reviewer's third look, 2026-11-20 ([its record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#the-unreadable-folders-stopping-words-after-the-reviewers-third-look)): the stopping message no longer says the folder's files would be kept, which the scan cannot know (git cannot read the folder, so a `.gitignore` of `cache/*` never names it), and names the remedies that work: a rule for the folder itself (`cache/`), or `cache/**` in `exclude`, where `cache`, `cache/`, `cache/*` and `**/cache/**` all leave the scan stopped. Which folders stop the scan did not change.
- Since 2026-11-20 `createGitignoreFilter`, the fallback read of `.gitignore` where git cannot judge, throws a read that fails for a cause of the machine's (`throwIfMachineFailure`, [sourceText.ts](../tooling/sourceText.ts.mdmd.md)); before, it read it as no `.gitignore`, and what that file ignores was mapped. `discovery.test.ts` holds it, and `sourceText.boundary.test.ts` holds every catch round a read in this module to the same rule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildWorkspaceIndexes` {#symbol-buildworkspaceindexes}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L29)

#### `docsRootWithin` {#symbol-docsrootwithin}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L29)

#### `inWorkspaceOrder` {#symbol-inworkspaceorder}
- Type: unknown
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L29)

#### `DiscoveredTargets` {#symbol-discoveredtargets}
- Type: type (type-only)
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L29)

#### `DiscoverOptions` {#symbol-discoveroptions}
- Type: type (type-only)
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L29)

#### `WorkspaceIndexes` {#symbol-workspaceindexes}
- Type: type (type-only)
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L29)

#### `discoverWorkspaceTargetFiles` {#symbol-discoverworkspacetargetfiles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L44)
- Parameters: `options`: [`DiscoverOptions`](./discoveryCore.ts.mdmd.md#symbol-discoveroptions)

##### `discoverWorkspaceTargetFiles` — Summary
Locates workspace files that should receive Live Documentation generation, returning both the sorted absolute paths
and a predicate answering whether an unresolved path was deliberately left out by the scan's active rules.

#### `discoverTargetFiles` {#symbol-discovertargetfiles}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L57)
- Parameters: `options`: [`DiscoverOptions`](./discoveryCore.ts.mdmd.md#symbol-discoveroptions)

##### `discoverTargetFiles` — Summary
Locates workspace files that should receive Live Documentation generation, returning only the sorted absolute paths.

##### `discoverTargetFiles` — Links
- `discoverWorkspaceTargetFiles`

#### `discoverDocuments` {#symbol-discoverdocuments}
- Type: function
- Source: [source](../../../../../../packages/engine/src/live-docs/discovery.ts#L66)

##### `discoverDocuments` — Summary
Discovers the workspace's prose documents, held to the same leave-out, git, and configuration rules as source files.

##### `discoverDocuments` — Returns
Workspace-relative paths with forward slashes, sorted.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`discoveryCore.DiscoverOptions`](./discoveryCore.ts.mdmd.md#symbol-discoveroptions) (type-only)
- [`discoveryCore.DiscoveredTargets`](./discoveryCore.ts.mdmd.md#symbol-discoveredtargets) (type-only)
- [`discoveryCore.WorkspaceIndexes`](./discoveryCore.ts.mdmd.md#symbol-workspaceindexes) (type-only)
- [`discoveryCore.buildWorkspaceIndexes`](./discoveryCore.ts.mdmd.md#symbol-buildworkspaceindexes)
- [`discoveryCore.discoverDocumentsWithHost`](./discoveryCore.ts.mdmd.md#symbol-discoverdocumentswithhost)
- [`discoveryCore.discoverWorkspaceTargetFilesWithHost`](./discoveryCore.ts.mdmd.md#symbol-discoverworkspacetargetfileswithhost)
- [`discoveryCore.docsRootWithin`](./discoveryCore.ts.mdmd.md#symbol-docsrootwithin)
- [`discoveryCore.inWorkspaceOrder`](./discoveryCore.ts.mdmd.md#symbol-inworkspaceorder)
- [`nodeGitHost.NODE_GIT_HOST`](../tooling/nodeGitHost.ts.mdmd.md#symbol-node_git_host)
- [`nodeHost.NODE_FILE_HOST`](../tooling/nodeHost.ts.mdmd.md#symbol-node_file_host)
- [`nodeHost.registerNodeDiskFallback`](../tooling/nodeHost.ts.mdmd.md#symbol-registernodediskfallback)
- [`workspaceFiles.FileHost`](../tooling/workspaceFiles.ts.mdmd.md#symbol-filehost) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-pipeline.mdmd.md`](../../../../../layer-3/live-documentation-pipeline.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
