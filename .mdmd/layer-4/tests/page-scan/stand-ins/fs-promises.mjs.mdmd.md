# `tests/page-scan/stand-ins/fs-promises.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/stand-ins/fs-promises.mjs`
- Generated At: 2026-11-21T03:40:56.687Z

## Authored
### Purpose
Stands in for `node:fs/promises`: the same functions as `promises` of the stand-in for `node:fs`, over the same tree, counted under the same names.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `mkdir` {#symbol-mkdir}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs-promises.mjs#L5)

#### `open` {#symbol-open}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs-promises.mjs#L5)

#### `readdir` {#symbol-readdir}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs-promises.mjs#L5)

#### `readFile` {#symbol-readfile}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs-promises.mjs#L5)

#### `rm` {#symbol-rm}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs-promises.mjs#L5)

#### `rmdir` {#symbol-rmdir}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs-promises.mjs#L5)

#### `stat` {#symbol-stat}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs-promises.mjs#L5)

#### `writeFile` {#symbol-writefile}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs-promises.mjs#L5)

#### `promises` {#symbol-promises}
- Type: default (default)
- Source: [source](../../../../../tests/page-scan/stand-ins/fs-promises.mjs#L6)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fs.promises`](./fs.mjs.mdmd.md#symbol-promises)
<!-- LIVE-DOC:END Dependencies -->
