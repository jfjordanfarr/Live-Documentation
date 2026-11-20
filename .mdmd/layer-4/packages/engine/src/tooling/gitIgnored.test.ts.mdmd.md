# `packages/engine/src/tooling/gitIgnored.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/gitIgnored.test.ts`
- Generated At: 2026-11-20T07:57:12.660Z

## Authored
### Purpose
Tests of the git-ignore filter over a temporary repository: a `.gitignore` pattern and an `info/exclude` pattern both drop their files, a tracked file stays whatever ignores it, and outside a repository every file is kept. And of the helpers that shorten a walk: the folders git names whole, from the workspace, from a folder inside it and from an ignored folder, with none outside a repository or without git; which patterns a walk may shorten; and the file system on which named folders read as empty.

### Notes
- Written on 2026-10-16 with the module. The repository is made with `git init` in a temporary folder and the tracked file added with `git add -f`; no commit is needed, since `check-ignore` reads the index.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:child_process` - `spawnSync`
- `node:fs` - `appendFileSync`, `mkdirSync`, `mkdtempSync`, `rmSync`, `writeFileSync`
- `node:os` - `tmpdir`
- `node:path` - `path`
- [`gitIgnored.foldersGitIgnoresWhole`](./gitIgnored.ts.mdmd.md#symbol-foldersgitignoreswhole)
- [`gitIgnored.foldersReadAsEmpty`](./gitIgnored.ts.mdmd.md#symbol-foldersreadasempty)
- [`gitIgnored.walksNoLinkToAFolder`](./gitIgnored.ts.mdmd.md#symbol-walksnolinktoafolder)
- [`gitIgnored.withoutGitIgnored`](./gitIgnored.ts.mdmd.md#symbol-withoutgitignored)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
