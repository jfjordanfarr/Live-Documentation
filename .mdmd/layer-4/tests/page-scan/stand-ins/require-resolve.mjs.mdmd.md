# `tests/page-scan/stand-ins/require-resolve.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/stand-ins/require-resolve.mjs`
- Generated At: 2026-11-21T03:40:56.718Z

## Authored
### Purpose
Stands in for CommonJS's `require.resolve`, which the build injects in its place: a package's file named where the repository keeps it, under the page's engine root.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- `adapters/treeSitter.ts` is its one caller, as it loads, so its call shows in the page's `callsOnLoading`, not in a scan's tally.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `requireResolve` {#symbol-requireresolve}
- Type: const
- Source: [source](../../../../../tests/page-scan/stand-ins/require-resolve.mjs#L7)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`calls.counted`](./calls.mjs.mdmd.md#symbol-counted)
- [`engine-root.ENGINE_ROOT`](./engine-root.mjs.mdmd.md#symbol-engine_root)
<!-- LIVE-DOC:END Dependencies -->
