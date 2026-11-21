# `packages/engine/src/tooling/leaveOut.oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/leaveOut.oracle.test.ts`
- Generated At: 2026-11-21T18:33:55.103Z

## Authored
### Purpose
Holds the one list to git's own answer with the files in place: each tree is made in a fresh repository, its `.gitignore` files are taken into one list by `fromGitignores` and decided by `leaveOut`, git is asked with `git check-ignore -v -n --no-index`, and the list must give the same verdict for every file and folder, its deciding line traced back to the same file and line. Named cases cover nested files, negation, anchoring, trailing slashes, double stars, classes, escapes, a `!` beneath an ignored folder, a `.gitignore` inside one, carriage returns and case; a generator with a fixed seed adds 60 trees, every tree asked with `core.ignorecase` false and true. The one difference a list cannot remove, a folder spelled otherwise than one holding a nested file when names match without case, is set apart and must be said by the translator.

### Notes
- Written on 2026-11-21 at the owner's ask ([Turn 3](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)) for "a good solid way to create ignore patterns on what they scan, before they scan it", as the one function [the design of one engine with two hosts](../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) names; built standalone and not yet wired into discovery. What it was measured against is [the leave-out probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md).
- Shown red on 2026-11-21 with `?` allowed to match a slash in an anchored pattern: `s/t/u` was ignored where git keeps it.

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
- [`leaveOut.IgnoreFileText`](./leaveOut.ts.mdmd.md#symbol-ignorefiletext)
- [`leaveOut.fromGitignores`](./leaveOut.ts.mdmd.md#symbol-fromgitignores)
- [`leaveOut`](./leaveOut.ts.mdmd.md#symbol-leaveout-function)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
