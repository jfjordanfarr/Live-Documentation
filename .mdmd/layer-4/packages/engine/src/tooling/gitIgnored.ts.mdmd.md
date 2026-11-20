# `packages/engine/src/tooling/gitIgnored.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/gitIgnored.ts`
- Generated At: 2026-11-20T17:18:44.558Z

## Authored
### Purpose
What git ignores, read from git itself: `gitIgnores` asks git once for its listing of what it ignores (`git ls-files --others --ignored --exclude-standard --directory`), `null` when git cannot answer, and from that listing gives a walk the folders to leave unread and says of each path found whether git ignores it or cannot judge it (a walk asks once before it, to prune, and once after it, to judge); `gitIgnored` returns the ignored ones, for the generator's and the command line's questions. Discovery and the three SlopCop audits use it so that they read the files the repository holds and nothing a checkout carries beside them.

### Notes
- Written on 2026-10-16 after a regeneration documented 2,727 files of two agent worktrees nested under `.claude/worktrees/` and the markdown audit reported their in-progress docs: discovery had read the root `.gitignore` alone (with `git ls-files` to keep tracked files), and the audits only their own globs, while `.git/info/exclude`, where the harness names the worktrees, counted for neither ([Turn 3 of the October 16 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3)).
- Until 2026-11-20 git was asked with `git check-ignore`, which re-makes git's classification from the excludes patterns, about every path found. Asked plainly it read each path as a wildcard pattern (an untracked `a[1].log` beside a tracked `a1.log` was kept though `*.log` ignores it) and refused the whole call for one path in a submodule or beginning with `:(` or `:!`; mended that day with `--no-index`, a `./` prefix and the tracked paths taken out, it still differed from git where a `.gitignore` is kept off the disk by sparse checkout or skip-worktree, where `core.ignorecase` folds the case of a tracked folder, and where a file took a tracked folder's place ([the review's findings, mended](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)).
- The third form, the same day, reads git's classification instead of re-making it: the listing the walk was already shortened by is git's own word on what it ignores. A path is ignored when it, or a folder above it, is in the listing; a tracked path never is, so a file committed under an ignored folder (`.vscode/settings.json`, a probe's `journey.log`) stays in. Git does not descend into a nested repository, a submodule or not, so a path in one is judged by that repository's own listing, and the outer repository decides only whether its folder is ignored. Whether a folder holding a `.git` is such a repository is asked of the repository around it, by its listing of what it does not ignore limited to that folder (`--stage --others --exclude-standard -- <folder> .git`): git prints the folder whole, or a gitlink at it, for another repository, and enters a folder it takes for its own (a `.git` that names no repository, a tracked or intent-to-add entry below it in whatever case); a nested repository whose git then refuses (an owner it does not trust, a configuration it cannot read, a work tree elsewhere) is unjudged. Before that, the same day, the code read the whole index and asked `git rev-parse` in the folder, and kept such a repository's files whole in silence, and took a tracked folder renamed in case alone for another repository ([the fourth form](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#gits-own-view-of-a-folder-the-fourth-form)). A nested repository is asked with the variables that tie git to a repository (`git rev-parse --local-env-vars`) taken out but the command line's configuration (`GIT_CONFIG_PARAMETERS`, `GIT_CONFIG_COUNT`), as git does when it enters a submodule. Git follows no link, so a path beyond a link to a folder is ignored when the link or a folder above it is, judged by the linked repository when the link leads to a folder holding a `.git` (asked there directly, since to the repository around a link is a file), and otherwise unjudged, a link into the middle of a repository among them; so too a folder holding a `.git` of which git's question prints nothing (a submodule whose folder's case differs from its gitlink where git folds case looks so), though what the listing around names inside it is ignored. Since the fifth round, the same day, "no repository" is read from the folder's own structure (no `.git` in it or above, no `GIT_DIR`), not from git's message, which stays in the person's language, and a workspace whose repository's work tree is elsewhere is not judged by a listing of that other folder ([the fifth round](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#links-to-repositories-and-what-no-repository-means-the-fifth-round)). For every unjudged path, as for one in a nested repository whose git cannot answer, the caller falls back for those alone (discovery to the root `.gitignore`, with a warning from both its walks; an audit reading it). From a workspace inside a folder git ignores whole, git fails, and the listing is asked again from the repository's top. Where the listing fails in any way the caller walks the whole workspace by its rule for no git, so that a failed answer is never applied to a shortened walk, and is told why, to warn but where git says there is no repository; the listing that judges is taken after the walk, so that a folder a build makes meanwhile is judged as git judges it ([the third form](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#reading-gits-own-listing-the-third-form), and [its review](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#the-review-of-the-third-form-mended)).
- The walk is shortened by `foldersReadAsEmpty`, a file system for glob on which the folders git ignores whole read as empty, so that discovery and the audits stop reading a checkout's ignored worktrees, builds and caches file by file. A file system rather than glob's `ignore` object, since glob takes patterns or the object, not both, and a glob that stopped calling it would walk the folders again and lose no file. The helpers were first written in `scripts/slopcop/auditedFiles.ts`, so that the audits' change moved no key of the history's cache, and came here with discovery's ([the probe of 2026-11-20](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md)).
- Since the seventh round, the same day: a workspace that lies in no repository (`liesInNoRepository`, now exported, the command line's one answer to that question as well as discovery's) has no listing of its own and nothing is left unread, but each folder in it holding a `.git` is asked directly, as a link to a repository's top is, and the paths outside every repository come back as `outside`, for the caller's rule for no git with nothing to warn of. Until then `gitIgnores` was `null` there, and the root `.gitignore` judged a whole folder of clones: a clone's build output documented, a file it tracks left out, in silence. A folder asked directly, a link or one met where no repository is around, is judged by its listing only where git there says it is its repository's top, so a link into the middle of a repository whose folder holds an empty `.git/`, which git climbs past, is unjudged. `foldersReadAsEmpty` tells its caller of each failed folder read, for the walk to stop at a failure of the machine's; `GitIgnores.unread` and `GitUnanswered.noRepository` are gone ([the seventh round](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#several-clones-in-one-scan-and-the-machines-failures-the-seventh-round)). After the reviewer's second look, where no repository is around, a folder whose git does not answer no longer ends the descent: a working clone below a broken one is asked of its own files, and only what lies outside every clone that answers stays unjudged ([its record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#an-unreadable-folder-stops-the-scan-only-where-its-files-would-be-kept)). Whether the broken one would have ignored that clone is not known and not guessed, a choice the root recorded after the reviewer's third look and a case pins ([its record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#the-unreadable-folders-stopping-words-after-the-reviewers-third-look)).
- Since 2026-11-20 the probe of a folder's `.git` in `kindOf` is `statSync` with `throwIfNoEntry: false`: a `.git` that is not there, or a dangling link, is no repository, and any other failure is thrown; before, `existsSync` read such a failure as no repository, and that folder's ignored files were judged by the repository around or by none. `gitIgnored.test.ts` holds it, and `sourceText.boundary.test.ts` names any call of `existsSync` in the engine or the generator.
- Paths are given and returned relative to the workspace root with forward slashes. Held by `gitIgnored.test.ts` over temporary repositories, and by `discovery.oracle.test.ts`, which compares discovery with `git status` over random repositories.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GitIgnoreAnswer` {#symbol-gitignoreanswer}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L46)

##### `GitIgnoreAnswer` — Summary
What git says of a list of paths: which it ignores, which it cannot judge, and which lie in no repository.

#### `GitIgnores (interface)` {#symbol-gitignores-interface}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L64)

##### `GitIgnores (interface)` — Summary
Git's word on what it ignores in a workspace, from one listing.

#### `GitUnanswered` {#symbol-gitunanswered}
- Type: interface
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L72)

##### `GitUnanswered` — Summary
Why git gave no listing of what it ignores in a folder that lies in a repository.

#### `gitIgnores (function)` {#symbol-gitignores-function}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L127)
- Returns: [`GitIgnores`](#symbol-gitignores-interface)
- Parameters: `why`: [`GitUnanswered`](#symbol-gitunanswered)

##### `gitIgnores (function)` — Summary
Git's word on what it ignores in the workspace at `workspaceRoot`, or `null`
when git cannot answer in the repository that holds it: it is not installed,
does not trust the owner, or its listing fails in any other way, which
`unanswered` is told of. A caller that gets `null` walks the whole workspace
and uses its rule for no git, so that a failed answer is never applied to a
shortened walk. Where the workspace lies in no repository
({@link liesInNoRepository}) there is no listing of its own and no folder is
left unread, but each folder in it that holds a `.git` is asked directly, as
a link to a repository's top is, and the paths outside every repository are
{@link GitIgnoreAnswer.outside}.

##### `gitIgnores (function)` — Remarks
The listing names each untracked path git ignores: a folder it ignores whole
once, with a trailing slash and none of its contents, and an ignored file in
a folder that is not ignored whole by itself. It never names a tracked path,
and it is git's own classification, so it reads a `.gitignore` that sparse
checkout or skip-worktree keeps off the disk from the index, folds case
where `core.ignorecase` says so (a tracked `Build/a.ts` is the file
`build/a.ts` on the disk), and names a file that took the place of a
tracked folder. Asked from the very folder git ignores whole, git prints it
as `./`; asked from a folder anywhere inside one, git fails ("directory
entry not superset of prefix", and so too from the repository's top limited
to the workspace's folder). It is then asked from the top with no limit,
and the folder above the workspace that it names means that the workspace
is ignored whole.

Git does not descend into a nested repository, a submodule or not, nor
follow a link. Whether a folder below the workspace that holds a `.git` is
another repository is git's own word, asked of the repository around it
({@link anotherRepository}); the code re-made that judgment twice, and was
wrong each time. A path in another repository is judged by that
repository's own listing, asked with the variables that tie git to a
repository taken out of the environment but the command line's
configuration ({@link gitEnvironment}); the outer repository decides only
whether that folder is ignored, and a path in a repository whose git cannot
answer (an owner it does not trust, a configuration it cannot read) is
unjudged. A path beyond a link to a folder is ignored when the link or a
folder above it is, judged by the linked repository when git, asked in the
linked folder, says it is that repository's top, and is otherwise unjudged,
a link into the middle of a repository among them, whether its folder holds
no `.git` or one git climbs past (2026-11-20). The cases, tried on git
2.56.1, are the tests beside this module and discovery's.

#### `gitIgnored` {#symbol-gitignored}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L207)

##### `gitIgnored` — Summary
The paths among `relativePaths` (relative to `workspaceRoot`, forward
slashes) that git ignores ({@link gitIgnores}); `null` when git cannot
answer in the repository that holds the workspace. A path git cannot judge,
or one that lies in no repository, is not among them.

#### `gitIgnoresCase` {#symbol-gitignorescase}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L217)

##### `gitIgnoresCase` — Summary
Whether git matches names without regard to case in the repository that
holds `workspaceRoot`: its `core.ignorecase`, which git sets true on a clone
made where the file system does not tell case apart, as on Windows. False
when the setting is false or absent, or git cannot answer.

#### `foldersReadAsEmpty` {#symbol-foldersreadasempty}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L237)
- Returns: `FSOption`
- Parameters: `folders`: `ReadonlySet`; `error`: `NodeJS.ErrnoException`

##### `foldersReadAsEmpty` — Summary
A file system for glob (its `fs` option) in which each of `folders`
(workspace-relative, forward slashes) reads as empty, and every other folder
as it is. Glob takes ignore patterns or an object in their place, not both,
and its callers already pass patterns: reading the folders as empty leaves
those patterns as they are. Glob 14 walks with `readdir` and `readdirSync`
alone; a glob that stopped calling these would walk the folders again, and
lose no file.

Glob reads a folder whose read fails as empty, whatever the failure, so each
failed read of another folder is also told to `failed`, for the walk to judge
once glob is done: a folder that could not be read for a cause of the
machine's (too many open files) must stop the walk, not lose its files in
silence (2026-11-20).

#### `liesInNoRepository` {#symbol-liesinnorepository}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L337)

##### `liesInNoRepository` — Summary
Whether `folder` lies in no repository by its own structure: no `.git` in it or in any folder above it, and none
named to git by `GIT_DIR`. Only there is the rule for no git the rule, and no fall-back from git's word; a stale
`GIT_DIR`, a `GIT_CEILING_DIRECTORIES` that hides the top, a file system's boundary and a `.git` above that names no
repository all make git say "not a git repository" too, where a repository is meant. The one answer to the question
for discovery, the audits and the command line's note (2026-11-20; until then the command line kept a copy of its
own that followed links and read no `GIT_DIR`, and with a stale one said both that the folder lay in no repository
and that git could not be asked).
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `FSOption` (type-only)
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->
