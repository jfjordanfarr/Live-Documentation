# `tests/page-scan/node-scan.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/node-scan.ts`
- Generated At: 2026-11-21T03:40:56.667Z

## Authored
### Purpose
Node's side of the check: the generator over a folder in a process of its own, as the command line runs it, with the page's clock; prints how long `generateLiveDocs` took and the files it could not map.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- The spec runs it with git's variables taken out of the environment, on a copy outside every repository, so that Node takes the way for no git that a page takes.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
<!-- LIVE-DOC:END Dependencies -->
