# scripts/layout-lab/evaluate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/evaluate.ts
- Generated At: 2026-10-13T19:38:17.386Z

## Authored
### Purpose

One configuration of the layout's levers, laid out and scored: the page's own ranking, order, scene and placement with the capture's card model in the page's place, then the routes and the signals.

### Notes

The levers are the Local Map tuning the layout reads (`LabConfig`), the baseline the page's defaults. Since the restarts of 2026-10-06 an evaluation runs the page's own starts and choice (`exploreBranches` once, then `orderExploration` from each start of `candidateStarts`, each measured by the capture's card model and placed, the cheapest by the shared wire, crossing, height and shape score kept by `layoutStarts`; the lab has no previous picture, so the churn is nothing), and reports which start it drew and every start's cheap signals and price beside the chosen picture's full signals. `orderStarts` at 0 is the ranking's order alone; `orderSeed` set is that one start alone. The exploration is the retained picture's: every file of the scope pinned whole, the first file the subject as `localRetainUrl` opens it, the captured filters (the retained URL's defaults for older captures). `driftOf` holds a baseline evaluation to the capture's truth in every card's width, height and pin, the placement measure, the picture's size and every label's height: nothing, when the model is right, which `tests/e2e/layout-lab.spec.ts` asserts on every deck scope.
- `membraneDepth` (2026-10-07) is a lever like the others, passed to the exploration; `none` in a grid is every level.
- `membraneEvenness` and `rowLevelness` are levers since 2026-10-07, passed to the scene as its evenness and levelness and included in the competition score.

`membraneSimplicity` prices each nonzero top or bottom boundary step. Shape signals come from the same pure measurement as the page; `evaluateAlignment` re-solves the current branches on a fresh scene under explicit boundary equalities and records those equalities with the result. These additions implement the [October 13 preference for weighted competition](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply). An ordinary evaluation remains first paint; [refine](./refine.ts.mdmd.md) runs the continuing search.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LabConfig` {#symbol-labconfig}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L28)

##### `LabConfig` — Summary
The levers: the Local Map tuning the layout reads.

#### `LEVERS` {#symbol-levers}
- Type: const
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L50)
- Returns: `ReadonlyArray`

##### `LEVERS` — Summary
The levers in the order the reports name them.

#### `baselineConfig` {#symbol-baselineconfig}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L53)
- Returns: [`LabConfig`](#symbol-labconfig)
- Parameters: `preset`: [`LayoutPreset`](../../packages/explorer/src/client/layout-presets.ts.mdmd.md#symbol-layoutpreset)

##### `baselineConfig` — Summary
The page's own tuning: the configuration the picture was designed at.

#### `Evaluation` {#symbol-evaluation}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L59)

##### `Evaluation` — Summary
A configuration laid out and scored, with the exploration, the scene and the routes behind the signals.

#### `scopePins` {#symbol-scopepins}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L76)
- Returns: [`PinSet`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-pinset)
- Parameters: `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)

##### `scopePins` — Summary
The scope's pins, every file retained whole, and its subject.

#### `includeNode` {#symbol-includenode}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L81)
- Parameters: `pins`: [`PinSet`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-pinset); `node`: [`ExplorerNodePayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `includeNode` — Summary
The captured filters, or the retained URL's defaults for older captures; a pinned or selected file is always kept.

#### `evaluate` {#symbol-evaluate}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L102)
- Returns: [`Evaluation`](#symbol-evaluation)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `config`: [`LabConfig`](#symbol-labconfig)

##### `evaluate` — Summary
Lays out and scores one configuration of the levers over a capture.

#### `evaluateAlignment` {#symbol-evaluatealignment}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L135)
- Returns: [`Evaluation`](#symbol-evaluation)
- Parameters: `previous`: [`Evaluation`](#symbol-evaluation); `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)

##### `evaluateAlignment` — Summary
Re-solves a shown order with explicit alignment constraints, preserving its source scene and reporting the same shape price as the page.

#### `driftOf` {#symbol-driftof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L149)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `evaluation`: [`Evaluation`](#symbol-evaluation)

##### `driftOf` — Summary
Where the baseline evaluation differs from what the page showed at capture: nothing, when the model is right.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layout-presets.LayoutPreset`](../../packages/explorer/src/client/layout-presets.ts.mdmd.md#symbol-layoutpreset)
- [`layout-presets.applyLayoutPreset`](../../packages/explorer/src/client/layout-presets.ts.mdmd.md#symbol-applylayoutpreset)
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.LocalMapTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-localmaptuning) (type-only)
- [`types.SymbolOrder`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-symbolorder) (type-only)
- [`branch-placement.BoundaryAlignment`](../../packages/explorer/src/client/views/localView/branch-placement.ts.mdmd.md#symbol-boundaryalignment) (type-only)
- [`branch-restarts.StartSignals`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startsignals)
- [`branch-restarts.candidateStarts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-candidatestarts)
- [`branch-restarts.layoutStarts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-layoutstarts)
- [`branch-restarts.scoreOf`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-scoreof)
- [`branch-restarts.signalsOf`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-signalsof)
- [`branch-restarts.startName`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startname)
- [`branch-restarts.startOrder`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startorder)
- [`branch-scene.Scene`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scene)
- [`branch-scene.layoutScene`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-layoutscene)
- [`branch-scene.planBranches`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-planbranches)
- [`branches.BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph)
- [`branches.exploreBranches`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-explorebranches)
- [`branches.orderExploration`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-orderexploration)
- [`pin-state.EMPTY_PIN_SET`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.PinSet`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.addPin`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-addpin)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerNodePayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`card-model.CardMetrics`](./card-model.ts.mdmd.md#symbol-cardmetrics-interface) (type-only)
- [`measurer.capturedMeasurer`](./measurer.ts.mdmd.md#symbol-capturedmeasurer)
- [`routes.Route`](./routes.ts.mdmd.md#symbol-route)
- [`routes.routeScene`](./routes.ts.mdmd.md#symbol-routescene)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)
- [`scopes.retainedSubject`](./scopes.ts.mdmd.md#symbol-retainedsubject)
- [`Signals`](./signals.ts.mdmd.md#symbol-signals)
- [`signals.measureScene`](./signals.ts.mdmd.md#symbol-measurescene)
<!-- LIVE-DOC:END Dependencies -->
