# `packages/engine/src/tooling/gitIgnored.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/gitIgnored.test.ts`
- Generated At: 2026-11-20T16:58:05.066Z

## Authored
### Purpose
Tests of the git-ignore filter over a temporary repository: a `.gitignore` pattern and an `info/exclude` pattern both drop their files, a tracked file stays whatever ignores it, and outside a repository every file is kept; each path judged by its name, a wildcard name beside a tracked file it matches as a pattern, a name beginning with `:` and a folder holding a tracked file among them; a path in a submodule or a nested repository judged by that repository's own git, also with git tied to the outer repository by its variables, and one in a nested repository whose git cannot answer left unjudged; a path through a link to a folder, ignored with its link or else unjudged; and git's own classification where re-making it failed: a `.gitignore` kept off the disk by sparse checkout or skip-worktree, a tracked folder whose case differs on the disk, a file in a tracked folder's place, a workspace inside an ignored folder that holds a tracked file and one two folders deep; a folder holding a `.git` that names no repository, or below which the outer index holds a tracked or intent-to-add entry, judged by the outer listing; a nested repository whose `.git` is a file, asked by its own store and index with git tied to the outer repository, and with the person's command-line configuration. And of the helpers that shorten a walk: the folders git names whole, from the workspace, from a folder inside it and from an ignored folder, with none outside a repository or without git; and the file system on which named folders read as empty, two folders differing in case alone told apart where the disk tells them apart.

### Notes
- Written on 2026-10-16 with the module. The repository is made with `git init` in a temporary folder and the tracked file added with `git add -f`; no commit is needed, since `ls-files` reads the index. The cases of names, submodules and links came on 2026-11-20, each red against the code before ([the review's findings, mended](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)); the same day the nested repositories' case was rewritten to each repository's own git, and the cases of git's own classification came, each red against the second form ([the third form](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#reading-gits-own-listing-the-third-form)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:child_process` - `spawnSync`
- `node:fs` - `appendFileSync`, `existsSync`, `mkdirSync`, `mkdtempSync`, `nodeFs`, `realpathSync`, `renameSync`, `rmSync`, `symlinkSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`gitIgnored.GitIgnoreAnswer`](./gitIgnored.ts.mdmd.md#symbol-gitignoreanswer)
- [`gitIgnored.foldersReadAsEmpty`](./gitIgnored.ts.mdmd.md#symbol-foldersreadasempty)
- [`gitIgnored`](./gitIgnored.ts.mdmd.md#symbol-gitignored)
- [`gitIgnored.gitIgnores`](./gitIgnored.ts.mdmd.md#symbol-gitignores-function)
- [`gitIgnored.liesInNoRepository`](./gitIgnored.ts.mdmd.md#symbol-liesinnorepository)
- `vitest` - `afterEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
