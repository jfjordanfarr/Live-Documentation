# scripts/layout-lab/lab.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/lab.ts
- Entry: command `layout:lab` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-10-18T00:31:16.371Z

## Authored
### Purpose

The layout lab's command line: capture a retained scope, sweep and compare layout settings, run the continuing competition headlessly, and verify a configuration in the page.

### Notes

`npm run layout:lab -- capture|sweep|restarts|widen|refine|verify <bundle/scope> [options]`. Capture writes the scope's capture under the day's probe folder and runs the drift check at once; sweep evaluates the baseline, each lever alone and the sampled grid, and writes a markdown and a JSON report; restarts (2026-10-06) lays out every start of the order step alone (`--starts`, eight by default) and tries a grid of the page's costs (`--costs crossing=a,b;height=c,d`), saying at each which start the page would keep and which the full weighted score prefers; verify compares the lab's numbers for a configuration with the deck's reading of the page rendered with it, and says which start each drew and how long the page's layout took. The bundles must be built first. Reports go to `AI-Agent-Workspace/Probes/<date>/layout-lab/` unless `--out` says otherwise, the owner's choice of 2026-10-06 ([Turn 9](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-06.1.record.md#turn-9)).
- `restarts` also simulates the ordering-seed part of the search over the tabulated starts (`--churn 0,50,100,200,400` by default, `--first` the starts before paint, `--patience` the search's), printing each churn cost's moves and final picture (2026-10-07).
- `widen` (2026-10-07) tabulates the starts at every setting of the ranking's and the order's levers (`--grid`, by default `rankingPull=0,1,2,5;rankingTie=fewest,right,left;orderSweeps=2,4,8`; `--starts`, 16 by default) and simulates the ordering-seed search at each (`--churn` one cost, `--first` and `--patience` the page's defaults), writing `<scope>-wide.md` and its JSON under the day's probe folder; the October 7 run reported about nine minutes for 36 settings of 33 starts on the repository scopes and under a minute on the estate; those are historical measurements, not a runtime guarantee.

`drift` (2026-10-17) toggles one file type out of the full 3D picture and back in for a number of cycles (`--cycles`, five by default; `--ticks`, three hundred), each change a full reheat from the carried positions as the page does it, at every setting of `--gravity` and `--range` named, in either or both layouts, and writes the table of extents and unchanged spheres' moves under the day's probe folder; the measure is `drift.ts`, made for ticket C5 of [the change-over-time plan](../../../layer-3/change-over-time.mdmd.md#open-questions).

`refine` runs the same interleaved ordering and membrane-alignment competition as the page, from the captured measurements, and writes first/final metrics, all trial decisions and final geometry. `--starts`, `--patience` and `--churn` set the continuing search; `--config` accepts JSON or `@file`; `--label` and `--out` name the reports. The first-paint sweep and the ordering-only `restarts`/`widen` reports remain distinct tools. Shape-cost grids can vary `evenness`, `levelness` and `steps` while retaining the configured values for terms not varied. This command was added for the [October 13 weighted shape work](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply).

Every command accepts --preset compact|relaxed. The spatial command runs the shared D3 forces and graph projection, including optional --tests, --assets and --related-docs filters and `--layout connections|structure` (2026-10-14), then writes Markdown and complete JSON with coordinates, counts and diagnostics. The named scope identifies attention; all filtered files participate in the forces. Refinement, verification and spatial layout accept the page’s exported settings as --config @file. This supports [the shared-preset design](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

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
- [`layout-presets.applyLayoutPreset`](../../packages/explorer/src/client/layout-presets.ts.mdmd.md#symbol-applylayoutpreset)
- [`layout-presets.applyLayoutSettings`](../../packages/explorer/src/client/layout-presets.ts.mdmd.md#symbol-applylayoutsettings)
- [`layout-presets.readLayoutSettings`](../../packages/explorer/src/client/layout-presets.ts.mdmd.md#symbol-readlayoutsettings)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture)
- [`capture.captureScope`](./capture.ts.mdmd.md#symbol-capturescope)
- [`capture.readCaptureFile`](./capture.ts.mdmd.md#symbol-readcapturefile)
- [`capture.writeCapture`](./capture.ts.mdmd.md#symbol-writecapture)
- [`drift.DriftReport`](./drift.ts.mdmd.md#symbol-driftreport)
- [`drift.measureDrift`](./drift.ts.mdmd.md#symbol-measuredrift)
- [`drift.renderDriftReports`](./drift.ts.mdmd.md#symbol-renderdriftreports)
- [`drift.toggledArchetype`](./drift.ts.mdmd.md#symbol-toggledarchetype)
- [`evaluate.LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)
- [`evaluate.baselineConfig`](./evaluate.ts.mdmd.md#symbol-baselineconfig)
- [`evaluate.driftOf`](./evaluate.ts.mdmd.md#symbol-driftof)
- [`evaluate`](./evaluate.ts.mdmd.md#symbol-evaluate)
- [`refine`](./refine.ts.mdmd.md#symbol-refine)
- [`refine.refinementJson`](./refine.ts.mdmd.md#symbol-refinementjson)
- [`refine.renderRefinement`](./refine.ts.mdmd.md#symbol-renderrefinement)
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
- [`scopes.loadBundleData`](./scopes.ts.mdmd.md#symbol-loadbundledata)
- [`scopes.loadBundleGraph`](./scopes.ts.mdmd.md#symbol-loadbundlegraph)
- [`scopes.scopeSlug`](./scopes.ts.mdmd.md#symbol-scopeslug)
- [`spatial.renderSpatialReport`](./spatial.ts.mdmd.md#symbol-renderspatialreport)
- [`spatial.spatialReport`](./spatial.ts.mdmd.md#symbol-spatialreport)
- [`sweep.DEFAULT_GRID`](./sweep.ts.mdmd.md#symbol-default_grid)
- [`sweep.configurations`](./sweep.ts.mdmd.md#symbol-configurations)
- [`sweep.oneAtATime`](./sweep.ts.mdmd.md#symbol-oneatatime)
- [`sweep.parseGrid`](./sweep.ts.mdmd.md#symbol-parsegrid)
- [`sweep.parseWeights`](./sweep.ts.mdmd.md#symbol-parseweights)
- [`verify.compareTable`](./verify.ts.mdmd.md#symbol-comparetable)
- [`verify.verifyConfig`](./verify.ts.mdmd.md#symbol-verifyconfig)
<!-- LIVE-DOC:END Dependencies -->
