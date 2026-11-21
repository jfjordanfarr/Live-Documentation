# `packages/engine/src/tooling/leaveOut.tfvc.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/tooling/leaveOut.tfvc.test.ts`
- Generated At: 2026-11-21T18:33:55.112Z

## Authored
### Purpose
Holds `fromTfignores` to Microsoft's own TFVC code, through the verdicts recorded in `__fixtures__/tfignore-oracle.json`: for every file of 52 trees (468 verdicts), the tree's `.tfignore` files are taken into one list, decided by `leaveOut` without regard to case, and the list must give the same verdict as TFVC's change scanner, its deciding line traced back to the same `.tfignore` and line. A file under a folder `tf add /recursive` does not enter is held to `tf add`'s verdict, left out whole, with a note naming the `!` line the scanner kept it by. The one deliberate difference, the case of a pattern's folder part, is stated in the test, and a line the translator says it cannot carry (TFVC's final `.`) has its verdicts set apart.

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
- [`leaveOut.fromTfignores`](./leaveOut.ts.mdmd.md#symbol-fromtfignores)
- [`leaveOut`](./leaveOut.ts.mdmd.md#symbol-leaveout-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
