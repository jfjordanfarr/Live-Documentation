# `scripts/slopcop/auditedFiles.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/slopcop/auditedFiles.test.ts`
- Generated At: 2026-11-20T07:52:52.564Z

## Authored
### Purpose
Holds the audits' shortened walk to the walk they made before 2026-11-20, case by case: every kind of excludes file, a tracked file inside an ignored folder, nested repositories and worktrees, odd names, git's case rule, and each path git refuses ([the probe of 2026-11-20](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#the-cases-and-the-tests-that-hold-them)).

### Notes
- The oracle is the old walk itself, kept in the test: each pattern globbed over the whole workspace, then `withoutGitIgnored`. Every case asserts that the new list equals it, and names the files it expects.
- The oracle would pass as well if nothing were shortened, and the speed would then be lost without a word, so one case counts the folders read through the file system the walk hands glob: a folder git ignores whole is never read, one that holds a tracked file is. With the pruning switched off it is red (the root's request, 2026-11-20).
- Each case was run red against a wrong shortening when written: no second walk after git refuses, the workspace or a folder beginning with `:` left unwalked, a pattern that may follow a link shortened, a folder holding a tracked file left unwalked.
- The global excludes file is set for a case through `GIT_CONFIG_GLOBAL`, and git is taken off the path through `PATH`; both are restored one by one after each case, since the process's own environment is the one git is started with.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`gitIgnored.withoutGitIgnored`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-withoutgitignored)
- [`auditedFiles`](./auditedFiles.ts.mdmd.md#symbol-auditedfiles)
- [`auditedFiles.foldersGitIgnoresWhole`](./auditedFiles.ts.mdmd.md#symbol-foldersgitignoreswhole)
- [`auditedFiles.foldersReadAsEmpty`](./auditedFiles.ts.mdmd.md#symbol-foldersreadasempty)
- [`auditedFiles.walksNoLinkToAFolder`](./auditedFiles.ts.mdmd.md#symbol-walksnolinktoafolder)
- `vitest` - `afterEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
