# `tests/page-scan/stand-ins/path.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/stand-ins/path.mjs`
- Generated At: 2026-11-21T03:40:56.710Z

## Authored
### Purpose
Stands in for `node:path`: Node's own POSIX rules, as `lib/path.js` writes them, for the functions the scan calls; `posix` is the module itself, as on Linux.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- Written out rather than borrowed from `pathe`, which the probe of November 19 used: `pathe` turns backslashes into slashes where Node's POSIX rules keep them, and it reached this repository only as a dependency of a dependency.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rules` {#symbol-rules}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L256)

##### `rules` — Summary
The rules uncounted, for the other stand-ins' own use, so that the tally holds only the scan's calls.

#### `resolve` {#symbol-resolve}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L261)

#### `normalize` {#symbol-normalize}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L262)

#### `isAbsolute` {#symbol-isabsolute}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L263)

#### `join` {#symbol-join}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L264)

#### `relative` {#symbol-relative}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L265)

#### `dirname` {#symbol-dirname}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L266)

#### `basename` {#symbol-basename}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L267)

#### `extname` {#symbol-extname}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L268)

#### `sep` {#symbol-sep}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L269)

#### `posix` {#symbol-posix}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L274)

#### `path` {#symbol-path}
- Type: default (default)
- Source: [source](../../../../../tests/page-scan/stand-ins/path.mjs#L275)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`calls.counted`](./calls.mjs.mdmd.md#symbol-counted)
<!-- LIVE-DOC:END Dependencies -->
