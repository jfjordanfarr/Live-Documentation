# `packages/engine/src/tooling/gitIgnored.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/gitIgnored.ts`
- Generated At: 2026-11-20T11:09:12.084Z

## Authored
### Purpose
What git ignores, asked of git itself: `gitIgnoreAnswer` asks git once about every candidate path, each judged by its name, and says which it ignores and which it cannot judge, `null` when git cannot answer; `gitIgnored` returns the ignored ones, and `withoutGitIgnored` keeps the files git does not ignore. Discovery and the three SlopCop audits use it so that they read the files the repository holds and nothing a checkout carries beside them.

### Notes
- Written on 2026-10-16 after a regeneration documented 2,727 files of two agent worktrees nested under `.claude/worktrees/` and the markdown audit reported their in-progress docs: discovery had read the root `.gitignore` alone (with `git ls-files` to keep tracked files), and the audits only their own globs, while `.git/info/exclude`, where the harness names the worktrees, counted for neither ([Turn 3 of the October 16 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3)).
- `git check-ignore` honours every excludes source git honours (a `.gitignore` at any level, `.git/info/exclude`, the global excludes file). Until 2026-11-20 it was asked plainly, and read each path as a wildcard pattern: an untracked `a[1].log` beside a tracked `a1.log` was kept though `*.log` ignores it, and one path in a submodule, or beginning with `:(` or `:!`, made git refuse the whole call, so that discovery read the root `.gitignore` alone for every file. Now it is asked with `--no-index`, each path given as `./path` so that a leading `:` is a name, and the paths `git ls-files` shows tracked, or that are a folder holding a tracked file, are taken out, since a tracked file is never ignored: a file committed under an ignored folder (`.vscode/settings.json`, a probe's `journey.log`) stays in. A path in a submodule or a nested repository is judged as one in a plain folder (the inner repository's `.gitignore` files count, its `.git/info/exclude` does not). Git judges no path through a link to a folder, so such a path is asked as its link: ignored when git ignores the link, else unjudged, and the caller falls back for it alone (discovery to the root `.gitignore`, an audit reading it). Exit status 0 means some paths are ignored and 1 none; anything else is git missing, no repository, or an owner git does not trust, and the caller falls back for every file ([the review's findings, mended](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)).
- Paths are given and returned relative to the workspace root with forward slashes, and the caller's list order is kept. Held by `gitIgnored.test.ts` over temporary repositories, and by `discovery.oracle.test.ts`, which compares discovery with `git ls-files` over random repositories.
- Since 2026-11-20 it also shortens the walks that come before it: `foldersGitIgnoresWhole` lists the folders git ignores whole (`git ls-files --others --ignored --exclude-standard --directory`), and `foldersReadAsEmpty` is a file system for glob on which they read as empty, so that discovery and the audits stop reading a checkout's ignored worktrees, builds and caches file by file. Every walk is shortened: git judges every path under such a folder ignored, one through a link included. A file system rather than glob's `ignore` object, since glob takes patterns or the object, not both, and a glob that stopped calling it would walk the folders again and lose no file. The helpers were first written in `scripts/slopcop/auditedFiles.ts`, so that the audits' change moved no key of the history's cache, and came here with discovery's ([the probe of 2026-11-20](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GitIgnoreAnswer (interface)` {#symbol-gitignoreanswer-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L38)

##### `GitIgnoreAnswer (interface)` — Summary
What git says of a list of paths: which it ignores, and which it cannot judge.

#### `gitIgnoreAnswer (function)` {#symbol-gitignoreanswer-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L79)
- Returns: [`GitIgnoreAnswer`](#symbol-gitignoreanswer-interface)

##### `gitIgnoreAnswer (function)` — Summary
What git says of each of `relativePaths` (relative to `workspaceRoot`,
forward slashes): whether it ignores it, judged by the path's own name,
and which paths it cannot judge. `null` when git cannot answer at all,
because it is not installed, `workspaceRoot` is not inside a repository, or
git does not trust its owner.

##### `gitIgnoreAnswer (function)` — Remarks
Plain `git check-ignore` reads each path as a pathspec, a pattern, and does
not report a path whose pattern matches a tracked file: an untracked
`a[1].log` beside a tracked `a1.log` was kept though `*.log` ignores it, and
`a\b/out/x.ts` beside a tracked `ab/out/x.ts`. It also refuses the whole
call for one path inside a submodule or beginning with `:(` or `:!`, and
reads a leading `:abc.ts` as `abc.ts`. So git is asked with `--no-index`,
which judges each path by the excludes patterns alone, and each path is
given as `./path`, which git reads as the name itself however it begins;
the paths that are tracked, or are a folder holding a tracked file (the
paths plain `check-ignore` takes for tracked when read literally), are then
taken out, from `git ls-files`, since a tracked file is never ignored.

Two kinds of path git still answers in its own way. Inside a submodule or a
nested repository, a path is judged as one in a plain folder: by the outer
repository's excludes and every `.gitignore` on its way, the inner
repository's own included, but not the inner repository's
`.git/info/exclude`, and a file the inner repository tracks may be judged
ignored. And git refuses any path that passes through a link to a folder:
such a path is asked as its link, so that what lies under a link git
ignores, or under a folder git ignores, is ignored, and is otherwise
unjudged. The cases, tried on git 2.56.1: the probe named in the module's
remarks.

#### `gitIgnored` {#symbol-gitignored}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L106)

##### `gitIgnored` — Summary
The paths among `relativePaths` (relative to `workspaceRoot`, forward
slashes) that git ignores ({@link gitIgnoreAnswer}); `null` when git cannot
answer. A path git cannot judge is not among them.

#### `gitIgnoresCase` {#symbol-gitignorescase}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L116)

##### `gitIgnoresCase` — Summary
Whether git matches names without regard to case in the repository that
holds `workspaceRoot`: its `core.ignorecase`, which git sets true on a clone
made where the file system does not tell case apart, as on Windows. False
when the setting is false or absent, or git cannot answer.

#### `withoutGitIgnored` {#symbol-withoutgitignored}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L126)

##### `withoutGitIgnored` — Summary
The files among `files` (absolute or workspace-relative) that git does not
ignore, a file git cannot judge among them; all of `files` when git cannot
answer.

#### `foldersGitIgnoresWhole` {#symbol-foldersgitignoreswhole}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L146)

##### `foldersGitIgnoresWhole` — Summary
The folders under `workspaceRoot` that git ignores whole, untracked and
named by an excludes pattern, as workspace-relative paths with forward
slashes and no trailing slash; none when git cannot answer. `git ls-files
--others --ignored --exclude-standard --directory` names such a folder once,
with a trailing slash, and not its contents: a folder an excludes pattern
names, or one whose every entry is ignored, whose ignored files and folders
it then names as well. It descends into an ignored folder that holds a
tracked file and names what is ignored inside it, and it never descends
into a nested repository, whose folders are walked as before. When the
workspace itself lies in a folder an outer repository ignores, git names it
(`./`), and it is the workspace's own path, `""`.

#### `foldersReadAsEmpty` {#symbol-foldersreadasempty}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L160)
- Returns: `FSOption`
- Parameters: `folders`: `ReadonlySet`

##### `foldersReadAsEmpty` — Summary
A file system for glob (its `fs` option) in which each of `folders`
(workspace-relative, forward slashes) reads as empty, and every other folder
as it is. Glob takes ignore patterns or an object in their place, not both,
and its callers already pass patterns: reading the folders as empty leaves
those patterns as they are. Glob 14 walks with `readdir` and `readdirSync`
alone; a glob that stopped calling these would walk the folders again, and
lose no file.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `FSOption` (type-only)
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->
