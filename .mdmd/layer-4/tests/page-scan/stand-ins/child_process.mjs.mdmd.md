# `tests/page-scan/stand-ins/child_process.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/stand-ins/child_process.mjs`
- Generated At: 2026-11-21T03:40:56.680Z

## Authored
### Purpose
Stands in for `node:child_process`: no process can be started in a page, so each call fails as Node's does for a program not there (`ENOENT`), and the commands asked for are kept.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- On the check's folders, which lie in no repository, nothing asked for a process on 2026-11-21: the engine asks git only where a `.git` stands.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `asked` {#symbol-asked}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/child_process.mjs#L7)

##### `asked` — Summary
Each command line the scan asked to run, in order.

#### `spawnSync` {#symbol-spawnsync}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/child_process.mjs#L14)

#### `execFile` {#symbol-execfile}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/child_process.mjs#L19)

#### `default` {#symbol-default}
- Type: default (default)
- Source: [source](../../../../../tests/page-scan/stand-ins/child_process.mjs#L25)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`calls.counted`](./calls.mjs.mdmd.md#symbol-counted)
<!-- LIVE-DOC:END Dependencies -->
