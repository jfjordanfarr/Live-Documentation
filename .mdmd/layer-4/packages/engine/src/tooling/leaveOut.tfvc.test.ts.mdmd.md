# `packages/engine/src/tooling/leaveOut.tfvc.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/leaveOut.tfvc.test.ts`
- Generated At: 2026-11-21T05:14:49.986Z

## Authored
### Purpose
Holds the `.tfignore` half of `leaveOut` to Microsoft's own TFVC code, through the verdicts recorded in `__fixtures__/tfignore-oracle.json`: for every file of 52 trees, whether TFVC's change scanner leaves it out and which `.tfignore` and line decided. The one deliberate difference, the case of a pattern's folder part, is stated in the test.

### Notes
- Written on 2026-11-21 at the owner's ask ([Turn 3](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)) for "a good solid way to create ignore patterns on what they scan, before they scan it", as the one function [the design of one engine with two hosts](../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) names; built standalone and not yet wired into discovery. What it was measured against is [the leave-out probe](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md).
- Shown red on 2026-11-21 with an inclusion allowed to match any part of a path rather than its last: three trees differed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`leaveOut`](./leaveOut.ts.mdmd.md#symbol-leaveout-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
