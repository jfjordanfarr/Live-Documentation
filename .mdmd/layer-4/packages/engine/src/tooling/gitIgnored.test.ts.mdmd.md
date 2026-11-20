# `packages/engine/src/tooling/gitIgnored.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/gitIgnored.test.ts`
- Generated At: 2026-11-20T11:09:12.080Z

## Authored
### Purpose
Tests of the git-ignore filter over a temporary repository: a `.gitignore` pattern and an `info/exclude` pattern both drop their files, a tracked file stays whatever ignores it, and outside a repository every file is kept; each path judged by its name, a wildcard name beside a tracked file it matches as a pattern, a name beginning with `:` and a folder holding a tracked file among them; a path in a submodule or a nested repository, and one through a link to a folder, ignored with its link or else unjudged. And of the helpers that shorten a walk: the folders git names whole, from the workspace, from a folder inside it and from an ignored folder, with none outside a repository or without git; and the file system on which named folders read as empty, two folders differing in case alone told apart.

### Notes
- Written on 2026-10-16 with the module. The repository is made with `git init` in a temporary folder and the tracked file added with `git add -f`; no commit is needed, since `ls-files` reads the index. The cases of names, submodules and links came on 2026-11-20, each red against the code before ([the review's findings, mended](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:child_process` - `spawnSync`
- `node:fs` - `appendFileSync`, `mkdirSync`, `mkdtempSync`, `rmSync`, `symlinkSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`gitIgnored.foldersGitIgnoresWhole`](./gitIgnored.ts.mdmd.md#symbol-foldersgitignoreswhole)
- [`gitIgnored.foldersReadAsEmpty`](./gitIgnored.ts.mdmd.md#symbol-foldersreadasempty)
- [`gitIgnored.gitIgnoreAnswer`](./gitIgnored.ts.mdmd.md#symbol-gitignoreanswer-function)
- [`gitIgnored.withoutGitIgnored`](./gitIgnored.ts.mdmd.md#symbol-withoutgitignored)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
