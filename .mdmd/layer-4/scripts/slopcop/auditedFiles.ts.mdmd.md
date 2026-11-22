# `scripts/slopcop/auditedFiles.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/slopcop/auditedFiles.ts`
- Generated At: 2026-11-22T07:12:58.118Z

## Authored
### Purpose
Collects the files each SlopCop audit reads: what its patterns match, less what git ignores, found without reading the folders git ignores whole, so that a checkout full of ignored worktrees, builds and caches is audited as fast as a clean one, and on the same files ([the probe of 2026-11-20](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).

### Notes
- Written on 2026-11-20, when the gate took 287 s in the main checkout and 193 s in a clean worktree, the difference all in the walks: each audit globbed every file of the 28 builders' worktrees under `.claude/worktrees/` (which git ignores) and then asked git to drop them. It replaced the three audits' identical copies of that walk; in the main checkout the markdown audit went from 16.9 s to 1.8 s and the symbol audit from 19.0 s to 1.9 s, on the same files with the same findings.
- Git is asked once (`git ls-files --others --ignored --exclude-standard --directory`, through the engine's `gitIgnores`), and glob is given a file system on which the folders it ignores whole read as empty, which leaves the audits' ignore patterns as they are and needs no escaping of names; the same listing then judges the files found, and where it fails the walk is whole and every file found is read. The first version kept three rules for the paths git refused (a submodule, a link to a folder, a name beginning with `:`), and the second asked `git check-ignore` about each path by its name; the third reads the listing alone, which is git's own classification, a submodule's files judged by the submodule's own git ([the third form](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#reading-gits-own-listing-the-third-form)). A second listing, taken after the walk, judges it; where that fails the walk is made again whole. Since the fourth form (2026-11-20) a whole walk where git could not be asked in a repository, and files git cannot judge, are told to `warn` (stderr by default), never in silence. Each case is held by `auditedFiles.test.ts`, by its written lists alone since its oracle, which graded the code by itself, was removed.
- Since the seventh round, the same day ([its record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#several-clones-in-one-scan-and-the-machines-failures-the-seventh-round)), as discovery: a folder left unread that the second listing does not ignore whole makes the walk run again by it; a folder read that fails for a cause of the machine's stops the audit; and in a workspace that lies in no repository each repository within it judges its own files, the rest are read, and nothing is warned of. A case now holds the warning of files git cannot judge, which no case had held. After the reviewer's second look, an unreadable folder stops the audit only where its own repository's git does not ignore it, with a message that names the folder and the ways past it ([its record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#an-unreadable-folder-stops-the-scan-only-where-its-files-would-be-kept)). After the reviewer's third look, the same day, the message offers git as a way past only where the folder lies in a repository, since the audits read no `.gitignore` of their own and a workspace's root `.gitignore` in no repository passes the scan over such a folder but not the audit ([its record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#the-unreadable-folders-stopping-words-after-the-reviewers-third-look)).
- Its git helpers were first written here, not beside `gitIgnored` in the engine, so that the audits' change moved no key of the history's cache, which hashes the engine's and the generator's code (`generatorIdentity.ts`). They moved to the engine's `tooling/gitIgnored.ts` with discovery's own shortening, the commit after, and this module now only matches the audits' patterns with them.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `auditedFiles` {#symbol-auditedfiles}
- Type: function
- Source: [source](../../../../scripts/slopcop/auditedFiles.ts#L37)

##### `auditedFiles` — Summary
The files the patterns match under `workspaceRoot` and git does not ignore, as absolute paths, sorted; every file
they match when git cannot answer. Each pattern is matched by itself, with `ignoreGlobs` left out of the walk, as the
audits always matched them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:path` - `path`
- [`processMark.machineFailure`](../../packages/engine/src/live-docs/processMark.ts.mdmd.md#symbol-machinefailure)
- [`gitIgnored.GitUnanswered`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-gitunanswered) (type-only)
- [`gitIgnored.foldersReadAsEmpty`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-foldersreadasempty)
- [`gitIgnored.gitIgnores`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-gitignores-function)
<!-- LIVE-DOC:END Dependencies -->
