# `packages/engine/src/tooling/gitIgnored.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/gitIgnored.ts`
- Generated At: 2026-11-20T11:55:30.191Z

## Authored
### Purpose
What git ignores, read from git itself: `gitIgnores` asks git once for its listing of what it ignores (`git ls-files --others --ignored --exclude-standard --directory`), `null` when git cannot answer, and from that one listing gives a walk the folders to leave unread and says of each path found whether git ignores it or cannot judge it; `gitIgnored` returns the ignored ones, and `withoutGitIgnored` keeps the files git does not ignore. Discovery and the three SlopCop audits use it so that they read the files the repository holds and nothing a checkout carries beside them.

### Notes
- Written on 2026-10-16 after a regeneration documented 2,727 files of two agent worktrees nested under `.claude/worktrees/` and the markdown audit reported their in-progress docs: discovery had read the root `.gitignore` alone (with `git ls-files` to keep tracked files), and the audits only their own globs, while `.git/info/exclude`, where the harness names the worktrees, counted for neither ([Turn 3 of the October 16 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3)).
- Until 2026-11-20 git was asked with `git check-ignore`, which re-makes git's classification from the excludes patterns, about every path found. Asked plainly it read each path as a wildcard pattern (an untracked `a[1].log` beside a tracked `a1.log` was kept though `*.log` ignores it) and refused the whole call for one path in a submodule or beginning with `:(` or `:!`; mended that day with `--no-index`, a `./` prefix and the tracked paths taken out, it still differed from git where a `.gitignore` is kept off the disk by sparse checkout or skip-worktree, where `core.ignorecase` folds the case of a tracked folder, and where a file took a tracked folder's place ([the review's findings, mended](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)).
- The third form, the same day, reads git's classification instead of re-making it: the listing the walk was already shortened by is git's own word on what it ignores. A path is ignored when it, or a folder above it, is in the listing; a tracked path never is, so a file committed under an ignored folder (`.vscode/settings.json`, a probe's `journey.log`) stays in. Git does not descend into a nested repository, a submodule or not, so a path below a folder holding a `.git` is judged by that repository's own listing, asked with the variables that tie git to a repository (`git rev-parse --local-env-vars`) taken out, and the outer repository decides only whether that folder is ignored. Git follows no link, so a path beyond a link to a folder is ignored when the link or a folder above it is, and is otherwise unjudged, as is a path in a nested repository whose git cannot answer: the caller falls back for those alone (discovery to the root `.gitignore`, an audit reading it). From a workspace two or more folders inside a folder git ignores whole, git fails, and the listing is asked again from the repository's top. The `GIT_*_PATHSPECS` variables are kept out of every call, and where the listing fails in any way the caller walks the whole workspace by its rule for no git, so that a failed answer is never applied to a shortened walk ([the third form](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#reading-gits-own-listing-the-third-form)).
- The walk is shortened by `foldersReadAsEmpty`, a file system for glob on which the folders git ignores whole read as empty, so that discovery and the audits stop reading a checkout's ignored worktrees, builds and caches file by file. A file system rather than glob's `ignore` object, since glob takes patterns or the object, not both, and a glob that stopped calling it would walk the folders again and lose no file. The helpers were first written in `scripts/slopcop/auditedFiles.ts`, so that the audits' change moved no key of the history's cache, and came here with discovery's ([the probe of 2026-11-20](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).
- Paths are given and returned relative to the workspace root with forward slashes. Held by `gitIgnored.test.ts` over temporary repositories, and by `discovery.oracle.test.ts`, which compares discovery with `git status` over random repositories.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GitIgnoreAnswer` {#symbol-gitignoreanswer}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L40)

##### `GitIgnoreAnswer` — Summary
What git says of a list of paths: which it ignores, and which it cannot judge.

#### `GitIgnores (interface)` {#symbol-gitignores-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L51)

##### `GitIgnores (interface)` — Summary
Git's word on what it ignores in a workspace, from one listing.

#### `gitIgnores (function)` {#symbol-gitignores-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L93)
- Returns: [`GitIgnores`](#symbol-gitignores-interface)

##### `gitIgnores (function)` — Summary
Git's word on what it ignores in the workspace at `workspaceRoot`, or `null`
when git cannot answer: it is not installed, `workspaceRoot` lies in no
repository, git does not trust its owner, or its listing fails in any other
way. A caller that gets `null` walks the whole workspace and uses its rule
for no git, so that a failed answer is never applied to a shortened walk.

##### `gitIgnores (function)` — Remarks
The listing names each untracked path git ignores: a folder it ignores whole
once, with a trailing slash and none of its contents, and an ignored file in
a folder that is not ignored whole by itself. It never names a tracked path,
and it is git's own classification, so it reads a `.gitignore` that sparse
checkout or skip-worktree keeps off the disk from the index, folds case
where `core.ignorecase` says so (a tracked `Build/a.ts` is the file
`build/a.ts` on the disk), and names a file that took the place of a
tracked folder. Asked from a workspace two or more folders inside a folder
git ignores whole, git fails ("directory entry not superset of prefix", and
so too from the repository's top limited to the workspace's folder); it is
then asked from the top with no limit, and the folder above the workspace
that it names means that the workspace is ignored whole. The person's
`GIT_*_PATHSPECS` variables, which can make git refuse its question, are
not passed on to any call.

Git does not descend into a nested repository, a submodule or not, nor
follow a link. So each repository judges its own paths: a path below a
folder that holds a `.git` is judged by that repository's own listing,
asked with the variables that tie git to a repository taken out of the
environment (`git rev-parse --local-env-vars`, as git does when it enters a
submodule), and the outer repository decides only whether that folder is
ignored. A path beyond a link to a folder is ignored when the link or a
folder above it is, and is otherwise unjudged. The cases, tried on git
2.56.1, are the tests beside this module and discovery's.

#### `gitIgnored` {#symbol-gitignored}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L150)

##### `gitIgnored` — Summary
The paths among `relativePaths` (relative to `workspaceRoot`, forward
slashes) that git ignores ({@link gitIgnores}); `null` when git cannot
answer. A path git cannot judge is not among them.

#### `foldersGitIgnoresWhole` {#symbol-foldersgitignoreswhole}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L158)
- Returns: `ReadonlySet`

##### `foldersGitIgnoresWhole` — Summary
The folders under `workspaceRoot` that git ignores whole ({@link gitIgnores}), as workspace-relative paths with
forward slashes and no trailing slash, `""` for the workspace itself; none when git cannot answer.

#### `gitIgnoresCase` {#symbol-gitignorescase}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L168)

##### `gitIgnoresCase` — Summary
Whether git matches names without regard to case in the repository that
holds `workspaceRoot`: its `core.ignorecase`, which git sets true on a clone
made where the file system does not tell case apart, as on Windows. False
when the setting is false or absent, or git cannot answer.

#### `withoutGitIgnored` {#symbol-withoutgitignored}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L178)

##### `withoutGitIgnored` — Summary
The files among `files` (absolute or workspace-relative) that git does not
ignore, a file git cannot judge among them; all of `files` when git cannot
answer.

#### `foldersReadAsEmpty` {#symbol-foldersreadasempty}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L194)
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
