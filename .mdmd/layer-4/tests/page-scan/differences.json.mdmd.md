# `tests/page-scan/differences.json`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/differences.json`
- Generated At: 2026-11-21T03:40:56.635Z

## Authored
### Purpose
The ledger of the ways the page's output differs from Node's today, each with its fixture, file, what differs and its cause as far as reading the engine establishes it. The check fails on a difference not listed and on a listed one that no longer occurs, so the ledger can only shrink truthfully.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- On 2026-11-21 it holds six entries, in two fixtures (`fixtures/entry-points`, `typescript/tidepool`), all of one cause in the engine: the reader of `package.json` reads `ts.sys.useCaseSensitiveFileNames` (compilerPaths in `adapters/json.ts`), which is undefined in a page, so the manifest is not mapped, its doc and index node are missing and the docs of the files it names as entries lose their Entry lines. Mending it is the engine's, not a stand-in's.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `differences` {#symbol-differences}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
