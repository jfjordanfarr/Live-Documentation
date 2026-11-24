# `tests/page-scan/page-entry.mjs`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/page-scan/page-entry.mjs`
- Generated At: 2026-11-24T10:31:43.738Z

## Authored
### Purpose
The scanning page's own script: it inflates the grammars into the stand-in file system, and when a folder is chosen through the page's `<input webkitdirectory>` it puts the files at `/ws`, runs `generateLiveDocs` there and keeps, as `window.pageScan`, what the scan wrote, read and asked of the stand-ins.

### Notes
- Written on 2026-11-21 for the standing check that the engine runs in a browser page ([the November 21 record, Turn 2](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-2)), where the owner asked for the tool as one HTML page that scans a folder and as a command line, both from one engine. It makes permanent the probe of 2026-11-19 ([its README](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/execution-surface/README.md)), whose page had stopped building two days later with nothing to say so; what the check found on its first runs is [the page check's evidence](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/page-check/README.md).
- The page leaves `.git` and `node_modules` out of a folder it is handed, as discovery leaves them out; a folder holding `.git` is therefore scanned here as one in no repository, which differs from Node's scan of a real repository. The check's fixtures hold neither.
- Calls the engine's modules make as they load (treeSitter's grammar paths) are kept apart as `callsOnLoading`; the tally of a scan starts at the scan.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`enginePath`](../../packages/engine/src/tooling/enginePath.ts.mdmd.md#symbol-enginepath)
- [`generatorCore.runLiveDocs`](../../packages/generator/src/generatorCore.ts.mdmd.md#symbol-runlivedocs)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/engine-and-hosts.mdmd.md`](../../../layer-3/engine-and-hosts.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
