# scripts/layout-lab/lab.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/lab.ts
- Generated At: 2026-10-07T14:15:48.003Z

## Authored
### Purpose

The layout lab's command line: capture a deck scope from the built page, sweep the layout's levers headlessly, tabulate the order step's starts, verify a configuration in the page.

### Notes

`npm run layout:lab -- capture|sweep|restarts|widen|verify <bundle/scope> [options]`. Capture writes the scope's capture under the day's probe folder and runs the drift check at once; sweep evaluates the baseline, each lever alone and the sampled grid, and writes a markdown and a JSON report; restarts (2026-10-06) lays out every start of the order step alone (`--starts`, eight by default) and tries a grid of the page's costs (`--costs crossing=a,b;height=c,d`), saying at each which start the page would keep and which the full weighted score prefers; verify compares the lab's numbers for a configuration with the deck's reading of the page rendered with it, and says which start each drew and how long the page's layout took. The bundles must be built first. Reports go to `AI-Agent-Workspace/Probes/<date>/layout-lab/` unless `--out` says otherwise, the owner's choice of 2026-10-06 ([Turn 9](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-9)).
- `restarts` also simulates the page's continuing search over the tabulated starts (`--churn 0,50,100,200,400` by default, `--first` the starts before paint, `--patience` the search's), printing each churn cost's moves and final picture (2026-10-07).
- `widen` (2026-10-07) tabulates the starts at every setting of the ranking's and the order's levers (`--grid`, by default `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSweeps=2,4,8`; `--starts`, 16 by default) and simulates the page's search at each (`--churn` one cost, `--first` and `--patience` the page's defaults), writing `<scope>-wide.md` and its JSON under the day's probe folder; 36 settings of 33 starts take about nine minutes on this repository's scopes and under a minute on the estate's.

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
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
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
- [`restarts.DEFAULT_WIDE_GRID`](./restarts.ts.mdmd.md#symbol-default_wide_grid)
- [`restarts.parseCosts`](./restarts.ts.mdmd.md#symbol-parsecosts)
- [`restarts.renderRestarts`](./restarts.ts.mdmd.md#symbol-renderrestarts)
- [`restarts.renderWide`](./restarts.ts.mdmd.md#symbol-renderwide)
- [`restarts.simulateSearch`](./restarts.ts.mdmd.md#symbol-simulatesearch)
- [`restarts.tabulateStarts`](./restarts.ts.mdmd.md#symbol-tabulatestarts)
- [`restarts.trialCosts`](./restarts.ts.mdmd.md#symbol-trialcosts)
- [`restarts.widenStarts`](./restarts.ts.mdmd.md#symbol-widenstarts)
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
