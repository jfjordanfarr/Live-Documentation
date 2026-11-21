# `packages/engine/src/tooling/leaveOut.oracle.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/leaveOut.oracle.test.ts`
- Generated At: 2026-11-21T05:14:49.977Z

## Authored
### Purpose
Holds the `.gitignore` half of `leaveOut` to git's own answer, rule for rule: each tree is made in a fresh repository, git is asked with `git check-ignore -v -n --no-index`, and the function must name the same verdict and the same file and line for every file and folder. Named cases cover nested files, negation, anchoring, trailing slashes, double stars, classes, escapes, a `!` beneath an ignored folder, a `.gitignore` inside one, carriage returns and case; a generator with a fixed seed adds 60 trees.

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
- [`leaveOut`](./leaveOut.ts.mdmd.md#symbol-leaveout-function)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
