# `tests/page-scan/stand-ins/fs.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/stand-ins/fs.mjs`
- Generated At: 2026-11-21T03:40:56.696Z

## Authored
### Purpose
Stands in for `node:fs` in the scanning page: a file system held in memory, answering each function the scan's path calls as Node does on Linux, failures included with Node's `code`, `syscall` and `path`, since the engine tells a file's absence from a failure of the machine by them.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- Started from the probe of November 19's stand-in, which threw errors without `syscall` and answered no `throwIfNoEntry`; `gitIgnored.ts` had since come to call `lstatSync` and `statSync` with `{ throwIfNoEntry: false }`, and to hand glob a callback `readdir` and `readdirSync` of its own.
- Its test holds it to exactly the members `node-needs.json` names; `tree` is the page's own uncounted hand on the files, and records how many times the scan read each.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `promises` {#symbol-promises}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs.mjs#L180)

##### `promises` — Summary
`node:fs/promises`, and `promises` of `node:fs`.

#### `readdir` {#symbol-readdir}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs.mjs#L197)

#### `readdirSync` {#symbol-readdirsync}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs.mjs#L206)

#### `statSync` {#symbol-statsync}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs.mjs#L217)

#### `lstatSync` {#symbol-lstatsync}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs.mjs#L218)

#### `readFileSync` {#symbol-readfilesync}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs.mjs#L219)

#### `tree` {#symbol-tree}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/fs.mjs#L222)

##### `tree` — Summary
The page's own hand on the tree, uncounted: to fill it, empty it, and read back what the scan wrote and read.

#### `default` {#symbol-default}
- Type: default (default)
- Source: [source](../../../../../tests/page-scan/stand-ins/fs.mjs#L243)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`calls.counted`](./calls.mjs.mdmd.md#symbol-counted)
- [`path.rules`](./path.mjs.mdmd.md#symbol-rules)
<!-- LIVE-DOC:END Dependencies -->
