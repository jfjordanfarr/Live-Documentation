# `tests/page-scan/stand-ins/glob.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/stand-ins/glob.mjs`
- Generated At: 2026-11-21T03:40:56.702Z

## Authored
### Purpose
Stands in for the `glob` package: a walk of the stand-in file system matched with minimatch by glob's own rules for patterns, `ignore`, `dot`, `nodir`, `absolute` and `withFileTypes`, walking through a caller's own `fs` when one is given.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- The probe's stand-in ignored the `fs` that discovery hands glob (`foldersReadAsEmpty`, `tooling/gitIgnored.ts`), so the folders git ignores whole would have been walked in the page; this one walks through it, as glob does, and the scan's calls of that callback `readdir` show in the tally. It also returns folders where a pattern matches one and `nodir` is not set, as glob does and the probe's did not.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `glob` {#symbol-glob}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/glob.mjs#L41)

#### `default` {#symbol-default}
- Type: default (default)
- Source: [source](../../../../../tests/page-scan/stand-ins/glob.mjs#L65)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `minimatch` - `Minimatch`
- [`calls.counted`](./calls.mjs.mdmd.md#symbol-counted)
- [`fs.tree`](./fs.mjs.mdmd.md#symbol-tree)
- [`path.rules`](./path.mjs.mdmd.md#symbol-rules)
<!-- LIVE-DOC:END Dependencies -->
