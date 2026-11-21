# `tests/page-scan/stand-ins/calls.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/stand-ins/calls.mjs`
- Generated At: 2026-11-21T03:40:56.675Z

## Authored
### Purpose
The tally of calls every stand-in keeps, by function name, which the page empties before each scan and reports after it.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- The stand-ins' own work (the path rules the stand-in for `fs` uses, the walk of the stand-in for `glob`) goes through uncounted functions, so that the tally holds the scan's calls alone.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `counted` {#symbol-counted}
- Type: function
- Source: [source](../../../../../tests/page-scan/stand-ins/calls.mjs#L9)

##### `counted` — Summary
The function `body`, counting each call under `name` before it runs.

#### `callCounts` {#symbol-callcounts}
- Type: function
- Source: [source](../../../../../tests/page-scan/stand-ins/calls.mjs#L17)

##### `callCounts` — Summary
Each stand-in function called since the last `resetCalls`, with its count, sorted by name.

#### `resetCalls` {#symbol-resetcalls}
- Type: function
- Source: [source](../../../../../tests/page-scan/stand-ins/calls.mjs#L21)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
