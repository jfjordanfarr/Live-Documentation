# `tests/page-scan/differences.json`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/differences.json`
- Generated At: 2026-11-22T02:30:00.425Z

## Authored
### Purpose
The ledger of the ways the page's output differs from Node's today, each with its fixture, file, what differs and its cause as far as reading the engine establishes it. The check fails on a difference not listed and on a listed one that no longer occurs, so the ledger can only shrink truthfully.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- On 2026-11-21 it holds six entries, in two fixtures (`fixtures/entry-points`, `typescript/tidepool`), all of one cause in the engine: the reader of `package.json` reads `ts.sys.useCaseSensitiveFileNames` (compilerPaths in `adapters/json.ts`), which is undefined in a page, so the manifest is not mapped, its doc and index node are missing and the docs of the files it names as entries lose their Entry lines. Mending it is the engine's, not a stand-in's.
- Later on 2026-11-21 the engine was mended (`compilerPaths` reads names as written, the setting the constant `true`), the six entries no longer occurred, the spec failed on each until they were taken out, and the ledger is empty: all 45 folders map in the page as under Node.
- Since 2026-11-22 it also lists, under `readMoreThanOnce`, the files the page's scan reads more than once, held by the same rule: one not listed fails the case, and so does a listed one no longer read so. The engine reads each source file once in a run ([the road's third step](../../../layer-3/engine-and-hosts.mdmd.md#6-the-road)), so a reader that forgets to hand the run's reads to `readSourceText` shows here as a second read. Its only entries are the docs two samples keep (five in `typescript/tidepool`, one in `fixtures/link-targets`), each read for its authored words and read back for the index: the sink's business, step 6.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `differences` {#symbol-differences}
- Type: key

#### `readMoreThanOnce` {#symbol-readmorethanonce}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
