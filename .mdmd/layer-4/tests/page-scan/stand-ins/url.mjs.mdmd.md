# `tests/page-scan/stand-ins/url.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/stand-ins/url.mjs`
- Generated At: 2026-11-21T03:40:56.722Z

## Authored
### Purpose
Stands in for `node:url`: `pathToFileURL` and `fileURLToPath` for POSIX paths, by Node's rules over the browser's own `URL`.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `pathToFileURL` {#symbol-pathtofileurl}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/url.mjs#L6)

#### `fileURLToPath` {#symbol-fileurltopath}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/url.mjs#L16)

#### `default` {#symbol-default}
- Type: default (default)
- Source: [source](../../../../../tests/page-scan/stand-ins/url.mjs#L24)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`calls.counted`](./calls.mjs.mdmd.md#symbol-counted)
- [`path.rules`](./path.mjs.mdmd.md#symbol-rules)
<!-- LIVE-DOC:END Dependencies -->
