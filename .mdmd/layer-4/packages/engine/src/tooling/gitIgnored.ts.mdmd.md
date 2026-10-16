# packages/engine/src/tooling/gitIgnored.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/tooling/gitIgnored.ts
- Generated At: 2026-10-16T17:10:16.855Z

## Authored
### Purpose
What git ignores, asked of git itself: `gitIgnored` runs `git check-ignore` once over every candidate path and returns the ignored ones, `null` when git cannot answer; `withoutGitIgnored` keeps the files git does not ignore. Discovery and the three SlopCop audits use it so that they read the files the repository holds and nothing a checkout carries beside them.

### Notes
- Written on 2026-10-16 after a regeneration documented 2,727 files of two agent worktrees nested under `.claude/worktrees/` and the markdown audit reported their in-progress docs: discovery had read the root `.gitignore` alone (with `git ls-files` to keep tracked files), and the audits only their own globs, while `.git/info/exclude`, where the harness names the worktrees, counted for neither ([Turn 3 of the October 16 record](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)).
- `git check-ignore --stdin -z` honours every excludes source git honours (a `.gitignore` at any level, `.git/info/exclude`, the global excludes file) and never reports a tracked file, so a file committed under an ignored folder (`.vscode/settings.json`, a probe's `journey.log`) stays in. Exit status 0 means some paths are ignored and 1 none; anything else is git missing or no repository, and the caller falls back (discovery to the root `.gitignore`, an audit to every file).
- Paths are given and returned relative to the workspace root with forward slashes; the answer is matched by position, so the caller's list order is kept. Measured by `gitIgnored.test.ts` over a temporary repository.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `gitIgnored` {#symbol-gitignored}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L28)

##### `gitIgnored` — Summary
The paths among `relativePaths` (relative to `workspaceRoot`, forward
slashes) that git ignores: untracked and named by an excludes pattern. A
tracked file is never among them. `null` when git cannot answer, because it
is not installed or `workspaceRoot` is not inside a repository.

#### `withoutGitIgnored` {#symbol-withoutgitignored}
- Type: function
- Source: [source](../../../../../../packages/engine/src/tooling/gitIgnored.ts#L44)

##### `withoutGitIgnored` — Summary
The files among `files` (absolute or workspace-relative) that git does not
ignore; all of `files` when git cannot answer.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
