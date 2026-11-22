# `tests/e2e/layout-lab.spec.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/layout-lab.spec.ts`
- Generated At: 2026-11-22T18:50:22.131Z

## Authored
### Purpose

Holds the layout lab's model to the page: on every deck scope, a capture laid out again at the page's own tuning gives the page's numbers.

### Notes

For each scope the test's own page shows the retained Local Map, `captureFromPage` reads it, and the lab's baseline must show no drift: every card's width, height and pin, every label's height, the placement measure and the picture's size; Pretext must have agreed with the page on every text. A failure here means the card model has fallen behind the stylesheet, or Pretext and the browser disagree on a text. A second test per scope (2026-10-06) reads the start the page drew and its price from the placed root, loads the scope again with no restarts (`orderStarts` 0 seeded into the Explorer's storage) and holds the chosen start no costlier than the ranking's order; the page may have drawn more than once before the reading, so the previous picture may be among the starts.
- The seeded run of the second test keeps the search off too (`searchStarts: 0`), so the page's choice among the starts before paint is what it reads (2026-10-07).

November 4 adds predictions from the original capture at a different width cap, over repository and estate data, and a controlled canonical-document fixture with mixed prose, indented code and a blank line. The code text is checked verbatim before the independent browser geometry comparison. See the [integration record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-04/2026-11-04.1.record.md#turn-2).

Since [Turn 11](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-11), when Card Text came to default to the fixed-slot composition, this spec pins the growing composition in its init script, since its journeys read that composition's recorded facts and in-place descriptions; the composition not chosen is to be deleted with its spec when the owner decides.

Since [Turn 12](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-12--november-6) the two deck cases run on the default composition, which the lab now models; the reading-text cases keep the growing one.

Since [Turn 12](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-05/2026-11-05.1.record.md#turn-12--november-6) the narrow-cap, phone and indented-code cases keep the growing composition on both of their loads, since Card Text defaults to fixed slots and a capture of slot cards cannot predict a page of growing ones; that mismatch was the whole of their drift.

Since 2026-11-16 ([Turn 5 of the November 15 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md#turn-5)) two cases hold the continuing search's cycle trials to the lab's walk of them (`cycleTrials`: the walk of a capture of the first draw, and the page's own record of its search with one seed). On `core.ts` every term of the page's prediction is the walk's: before the prediction stood each card's foot on returning connections as the trial dresses it, both trials were predicted a foot taller than they stand and 1,020 and 1,200 px from the walk's price (the case failed so on a build without it). On `branches.ts`, the picture on which the page once seemed to refuse a trial the walk adopted, the verdicts and every term but the vertical placement are the walk's; the two had been read from different graphs, and on one graph they agree, the vertical placement 22 px apart in 213,847 since the page predicts it from endpoints cached on the shown cards.

Since 2026-11-22 both of the repository's page cases run alone and the page case holds its arrival at reading size. Neither settles their time: alone that day the five files passed three times in four and the chain ran out three times in three, the lab's own layout of a growing picture filling the framework's default half minute ([what was measured, and what is open](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/gate-six-cases/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`local-storage.PERSISTED_UI_KEY`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_key)
- [`local-storage.PERSISTED_UI_VERSION`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-persisted_ui_version)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`StaticExplorerData`](../../packages/explorer/src/shared/staticExplorerData.ts.mdmd.md#symbol-staticexplorerdata) (type-only)
- [`capture.captureFromPage`](../../scripts/layout-lab/capture.ts.mdmd.md#symbol-capturefrompage)
- [`evaluate.CycleSearch`](../../scripts/layout-lab/evaluate.ts.mdmd.md#symbol-cyclesearch) (type-only)
- [`evaluate.CycleTerms`](../../scripts/layout-lab/evaluate.ts.mdmd.md#symbol-cycleterms) (type-only)
- [`evaluate.baselineConfig`](../../scripts/layout-lab/evaluate.ts.mdmd.md#symbol-baselineconfig)
- [`evaluate.driftOf`](../../scripts/layout-lab/evaluate.ts.mdmd.md#symbol-driftof)
- [`evaluate`](../../scripts/layout-lab/evaluate.ts.mdmd.md#symbol-evaluate)
- [`scopes.ScopeRun`](../../scripts/layout-lab/scopes.ts.mdmd.md#symbol-scoperun) (type-only)
- [`scopes.loadBundleGraph`](../../scripts/layout-lab/scopes.ts.mdmd.md#symbol-loadbundlegraph)
- [`scopes.DECK_SCOPES`](./scopes.ts.mdmd.md#symbol-deck_scopes)
- [`still-picture.AT_READING_SIZE`](./still-picture.ts.mdmd.md#symbol-at_reading_size)
- [`still-picture.arriveAtReadingSize`](./still-picture.ts.mdmd.md#symbol-arriveatreadingsize)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
