# `packages/engine/src/tooling/__fixtures__/tfignore-oracle.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/tooling/__fixtures__/tfignore-oracle.json`
- Generated At: 2026-11-21T05:14:49.815Z

## Authored
### Purpose
What Microsoft's TFVC code decided for 52 trees with `.tfignore` files: the trees' files and ignore texts, and each file's verdict with the deciding file and line. It was recorded by running Team Explorer Everywhere's matcher, compiled unchanged, with no global exclusion list; twelve trees probe a question each, and forty are made at random from a fixed seed.

### Notes
- Written on 2026-11-21 at the owner's ask ([Turn 3](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)) for "a good solid way to create ignore patterns on what they scan, before they scan it", as the one function [the design of one engine with two hosts](../../../../../../../.mdmd/layer-3/engine-and-hosts.mdmd.md) names; built standalone and not yet wired into discovery. What it was measured against is [the leave-out probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md).
- Recorded by the probe's `record-tfvc-oracle.mjs`, which needs Java and Microsoft's sources; the test that reads it needs neither.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `oracle` {#symbol-oracle}
- Type: key

#### `trees` {#symbol-trees}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
