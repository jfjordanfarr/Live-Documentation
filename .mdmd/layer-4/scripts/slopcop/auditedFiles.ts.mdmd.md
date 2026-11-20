# `scripts/slopcop/auditedFiles.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/slopcop/auditedFiles.ts`
- Generated At: 2026-11-20T07:52:52.569Z

## Authored
### Purpose
Collects the files each SlopCop audit reads: what its patterns match, less what git ignores, found without reading the folders git ignores whole, so that a checkout full of ignored worktrees, builds and caches is audited as fast as a clean one, and on the same files ([the probe of 2026-11-20](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).

### Notes
- Written on 2026-11-20, when the gate took 287 s in the main checkout and 193 s in a clean worktree, the difference all in the walks: each audit globbed every file of the 28 builders' worktrees under `.claude/worktrees/` (which git ignores) and then asked git to drop them. It replaced the three audits' identical copies of that walk; in the main checkout the markdown audit went from 16.9 s to 1.8 s and the symbol audit from 19.0 s to 1.9 s, on the same files with the same findings.
- Git is asked once (`git ls-files --others --ignored --exclude-standard --directory`) for the folders that are untracked and ignored as a whole, and glob is given a file system on which they read as empty, which leaves the audits' ignore patterns as they are and needs no escaping of names. The three rules that keep the files the same where git refuses a path (a submodule, a link to a folder, a name beginning with `:`) are in the module's own comment, and each case is held by `auditedFiles.test.ts`.
- Its git helpers live here, not beside `gitIgnored` in the engine, so that this change moved no key of the history's cache, which hashes the engine's and the generator's code (`generatorIdentity.ts`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `auditedFiles` {#symbol-auditedfiles}
- Type: function
- Source: [source](../../../../scripts/slopcop/auditedFiles.ts#L41)

##### `auditedFiles` — Summary
The files the patterns match under `workspaceRoot` and git does not ignore, as absolute paths, sorted; every file
they match when git cannot answer. Each pattern is matched by itself, with `ignoreGlobs` left out of the walk, as the
audits always matched them.

#### `foldersGitIgnoresWhole` {#symbol-foldersgitignoreswhole}
- Type: function
- Source: [source](../../../../scripts/slopcop/auditedFiles.ts#L63)

##### `foldersGitIgnoresWhole` — Summary
The folders under `workspaceRoot` that git ignores whole, untracked and named by an excludes pattern, as
workspace-relative paths with forward slashes and no trailing slash; none when git cannot answer. Git names such a
folder once and not its contents, and descends into an ignored folder that holds a tracked file, naming what is
ignored inside it. Neither the workspace itself (git's `./`, when the workspace lies in an ignored folder of an outer
repository) nor a folder whose path begins with `:` is among them: a path beginning with `:` may be refused, and the
audit's answer must not depend on whether such a path was walked.

#### `walksNoLinkToAFolder` {#symbol-walksnolinktoafolder}
- Type: function
- Source: [source](../../../../scripts/slopcop/auditedFiles.ts#L83)

##### `walksNoLinkToAFolder` — Summary
Whether glob, matching `pattern`, can never pass through a link to a folder: true for `**` and one name, a name with
no `/` or `\` and at most one `*`, so that no expansion of its braces makes a deeper part or a second `**`. Glob
follows no link under a leading `**`, and matches the name only against each folder's entries; under any other
pattern it may follow a link, and git refuses a path that passes through one.

#### `foldersReadAsEmpty` {#symbol-foldersreadasempty}
- Type: function
- Source: [source](../../../../scripts/slopcop/auditedFiles.ts#L95)
- Returns: `FSOption`
- Parameters: `folders`: `ReadonlySet`

##### `foldersReadAsEmpty` — Summary
A file system for glob in which each of `folders` (workspace-relative, forward slashes) reads as empty, and every
other folder as it is. Glob takes its ignore patterns or an object in their place, not both; reading the folders as
empty leaves its patterns as they are, and a glob that stopped calling these functions would walk the folders again,
never lose a file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `FSOption`, `globSync`
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- [`gitIgnored`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-gitignored)
- [`gitIgnored.withoutGitIgnored`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-withoutgitignored)
<!-- LIVE-DOC:END Dependencies -->
