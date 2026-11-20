# `packages/engine/src/tooling/gitIgnored.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/gitIgnored.ts`
- Generated At: 2026-11-20T07:57:12.663Z

## Authored
### Purpose
What git ignores, asked of git itself: `gitIgnored` runs `git check-ignore` once over every candidate path and returns the ignored ones, `null` when git cannot answer; `withoutGitIgnored` keeps the files git does not ignore. Discovery and the three SlopCop audits use it so that they read the files the repository holds and nothing a checkout carries beside them.

### Notes
- Written on 2026-10-16 after a regeneration documented 2,727 files of two agent worktrees nested under `.claude/worktrees/` and the markdown audit reported their in-progress docs: discovery had read the root `.gitignore` alone (with `git ls-files` to keep tracked files), and the audits only their own globs, while `.git/info/exclude`, where the harness names the worktrees, counted for neither ([Turn 3 of the October 16 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3)).
- `git check-ignore --stdin -z` honours every excludes source git honours (a `.gitignore` at any level, `.git/info/exclude`, the global excludes file) and never reports a tracked file, so a file committed under an ignored folder (`.vscode/settings.json`, a probe's `journey.log`) stays in. Exit status 0 means some paths are ignored and 1 none; anything else is git missing, no repository, or one path git refuses (inside a submodule, through a link to a folder, or beginning with a `:` git reads as pathspec magic), and the caller falls back (discovery to the root `.gitignore`, an audit to every file). That a refusal of one path loses the answer for all is a defect left for a later round ([the reproductions](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#a-defect-found-and-left)).
- Paths are given and returned relative to the workspace root with forward slashes; the answer is matched by position, so the caller's list order is kept. Measured by `gitIgnored.test.ts` over a temporary repository.
- Since 2026-11-20 it also shortens the walks that come before it: `foldersGitIgnoresWhole` lists the folders git ignores whole (`git ls-files --others --ignored --exclude-standard --directory`), `walksNoLinkToAFolder` says which patterns may leave them unread, and `foldersReadAsEmpty` is a file system for glob on which they read as empty, so that discovery and the audits stop reading a checkout's ignored worktrees, builds and caches file by file. A file system rather than glob's `ignore` object, since glob takes patterns or the object, not both, and a glob that stopped calling it would walk the folders again and lose no file. The helpers were first written in `scripts/slopcop/auditedFiles.ts`, so that the audits' change moved no key of the history's cache, and came here with discovery's ([the probe of 2026-11-20](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `gitIgnored` {#symbol-gitignored}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L44)

##### `gitIgnored` — Summary
The paths among `relativePaths` (relative to `workspaceRoot`, forward
slashes) that git ignores: untracked and named by an excludes pattern. A
tracked file is never among them. `null` when git cannot answer, because it
is not installed or `workspaceRoot` is not inside a repository, or refuses
one of the paths: one inside a submodule, one that passes through a link to
a folder, or one that begins with a `:` git reads as pathspec magic.

#### `gitIgnoresCase` {#symbol-gitignorescase}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L62)

##### `gitIgnoresCase` — Summary
Whether git matches names without regard to case in the repository that
holds `workspaceRoot`: its `core.ignorecase`, which git sets true on a clone
made where the file system does not tell case apart, as on Windows. False
when the setting is false or absent, or git cannot answer.

#### `withoutGitIgnored` {#symbol-withoutgitignored}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L71)

##### `withoutGitIgnored` — Summary
The files among `files` (absolute or workspace-relative) that git does not
ignore; all of `files` when git cannot answer.

#### `foldersGitIgnoresWhole` {#symbol-foldersgitignoreswhole}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L95)

##### `foldersGitIgnoresWhole` — Summary
The folders under `workspaceRoot` that git ignores whole, untracked and
named by an excludes pattern, as workspace-relative paths with forward
slashes and no trailing slash; none when git cannot answer. `git ls-files
--others --ignored --exclude-standard --directory` names such a folder once,
with a trailing slash, and not its contents: a folder an excludes pattern
names, or one whose every entry is ignored. It descends into an ignored
folder that holds a tracked file and names what is ignored inside it, and it
never descends into a nested repository, whose folders are walked as before.

Two that git names are left out, so that no walk's answer depends on whether
they were read: the workspace itself (git's `./`, when the workspace lies in
an ignored folder of an outer repository), and a folder whose path begins
with a `:`. Git reads such a path as pathspec magic and may refuse it
({@link gitIgnored}), and a caller then keeps what it keeps when git cannot
answer, which may hold the folder's files.

#### `walksNoLinkToAFolder` {#symbol-walksnolinktoafolder}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L119)

##### `walksNoLinkToAFolder` — Summary
Whether glob, matching `pattern`, can never pass through a link to a
folder: true for `**` and one name, a name with no `/` or `\` and at most
one `*`, so that no expansion of its braces makes a deeper part or a second
`**`. Glob follows no link under a leading `**`, and matches the name only
against each folder's entries. Under any other pattern it may follow one,
and git refuses the path ({@link gitIgnored}): a walk that read a folder git
ignores whole as empty could then lose the one path that made git refuse,
and with it the answer the caller gives when git cannot answer.

#### `foldersReadAsEmpty` {#symbol-foldersreadasempty}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L133)
- Returns: `FSOption`
- Parameters: `folders`: `ReadonlySet`

##### `foldersReadAsEmpty` — Summary
A file system for glob (its `fs` option) in which each of `folders`
(workspace-relative, forward slashes) reads as empty, and every other folder
as it is. Glob takes ignore patterns or an object in their place, not both,
and its callers already pass patterns: reading the folders as empty leaves
those patterns as they are. A glob that stopped calling these functions
would walk the folders again, and lose no file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `FSOption` (type-only)
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->
