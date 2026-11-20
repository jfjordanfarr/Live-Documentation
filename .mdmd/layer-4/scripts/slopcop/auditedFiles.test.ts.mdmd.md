# `scripts/slopcop/auditedFiles.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/slopcop/auditedFiles.test.ts`
- Generated At: 2026-11-20T13:06:22.945Z

## Authored
### Purpose
Holds the audits' shortened walk to the files git keeps, written out case by case: every kind of excludes file, a tracked file inside an ignored folder, nested repositories and worktrees, odd names, git's case rule, names a tracked file's wildcard pattern would match, a submodule, links to a folder, names beginning with `:`, and a workspace inside an ignored folder ([the probe of 2026-11-20](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#the-cases-and-the-tests-that-hold-them)).

### Notes
- Every case names the files it expects. Until the review of the third form (2026-11-20) each was also held to an oracle, the old walk (each pattern globbed over the whole workspace, then `withoutGitIgnored`); since that judging came to read the very listing the audits read, the oracle graded the code by itself, and it was removed with `withoutGitIgnored` ([its review](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#the-review-of-the-third-form-mended)). Since the third form of 2026-11-20 the submodule's case expects the submodule's own git to judge its files, which the outer rules no longer reach ([the third form](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#reading-gits-own-listing-the-third-form)).
- The oracle would pass as well if nothing were shortened, and the speed would then be lost without a word, so one case counts the folders read through the file system the walk hands glob: a folder git ignores whole is never read, one that holds a tracked file is. With the pruning switched off it is red (the root's request, 2026-11-20).
- Each case was run red against a wrong shortening when written: no second walk after git refuses, the workspace or a folder beginning with `:` left unwalked, a pattern that may follow a link shortened, a folder holding a tracked file left unwalked. The same day git came to be asked about each path by its name, the second walk and the rule for links went, and the cases of the paths git refused were rewritten to git's answer by name; each was red against the code before ([the review's findings, mended](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/walk-prune/README.md#judging-every-path-by-its-name-the-reviews-findings-mended)). The oracle shares its judge, `withoutGitIgnored`, with the walk it holds: it tests the shortening, and `discovery.oracle.test.ts` holds the judge to git.
- The global excludes file is set for a case through `GIT_CONFIG_GLOBAL`, and git is taken off the path through `PATH`; both are restored one by one after each case, since the process's own environment is the one git is started with.
- The helpers' own cases (the file system that reads folders as empty) moved to `packages/engine/src/tooling/gitIgnored.test.ts` with the helpers, the commit after this file was written.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`gitIgnored.gitIgnores`](../../packages/engine/src/tooling/gitIgnored.ts.mdmd.md#symbol-gitignores-function)
- [`auditedFiles`](./auditedFiles.ts.mdmd.md#symbol-auditedfiles)
- `vitest` - `afterEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
