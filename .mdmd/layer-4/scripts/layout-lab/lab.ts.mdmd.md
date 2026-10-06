# scripts/layout-lab/lab.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/lab.ts
- Generated At: 2026-10-06T20:39:25.878Z

## Authored
### Purpose

The layout lab's command line: capture a deck scope from the built page, sweep the layout's levers headlessly, verify a configuration in the page.

### Notes

`npm run layout:lab -- capture|sweep|verify <bundle/scope> [options]`. Capture writes the scope's capture under the day's probe folder and runs the drift check at once; sweep evaluates the baseline, each lever alone and the sampled grid, and writes a markdown and a JSON report; verify compares the lab's numbers for a configuration with the deck's reading of the page rendered with it. The bundles must be built first. Reports go to `AI-Agent-Workspace/Probes/<date>/layout-lab/` unless `--out` says otherwise, the owner's choice of 2026-10-06 ([Turn 9](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:path` - `path`
- `node:process` - `process`
- [`Capture`](./capture.ts.mdmd.md#symbol-capture)
- [`capture.captureScope`](./capture.ts.mdmd.md#symbol-capturescope)
- [`capture.readCaptureFile`](./capture.ts.mdmd.md#symbol-readcapturefile)
- [`capture.writeCapture`](./capture.ts.mdmd.md#symbol-writecapture)
- [`evaluate.LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)
- [`evaluate.baselineConfig`](./evaluate.ts.mdmd.md#symbol-baselineconfig)
- [`evaluate.driftOf`](./evaluate.ts.mdmd.md#symbol-driftof)
- [`evaluate`](./evaluate.ts.mdmd.md#symbol-evaluate)
- [`report.ReportRow`](./report.ts.mdmd.md#symbol-reportrow)
- [`report.RunReport`](./report.ts.mdmd.md#symbol-runreport)
- [`report.differences`](./report.ts.mdmd.md#symbol-differences)
- [`report.renderMarkdown`](./report.ts.mdmd.md#symbol-rendermarkdown)
- [`report.toJson`](./report.ts.mdmd.md#symbol-tojson)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)
- [`scopes.findScope`](./scopes.ts.mdmd.md#symbol-findscope)
- [`scopes.loadBundleGraph`](./scopes.ts.mdmd.md#symbol-loadbundlegraph)
- [`scopes.scopeSlug`](./scopes.ts.mdmd.md#symbol-scopeslug)
- [`sweep.DEFAULT_GRID`](./sweep.ts.mdmd.md#symbol-default_grid)
- [`sweep.configurations`](./sweep.ts.mdmd.md#symbol-configurations)
- [`sweep.oneAtATime`](./sweep.ts.mdmd.md#symbol-oneatatime)
- [`sweep.parseGrid`](./sweep.ts.mdmd.md#symbol-parsegrid)
- [`sweep.parseWeights`](./sweep.ts.mdmd.md#symbol-parseweights)
- [`verify.compareTable`](./verify.ts.mdmd.md#symbol-comparetable)
- [`verify.verifyConfig`](./verify.ts.mdmd.md#symbol-verifyconfig)
<!-- LIVE-DOC:END Dependencies -->
