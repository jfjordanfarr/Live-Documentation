# scripts/layout-lab/evaluate.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/evaluate.ts
- Generated At: 2026-10-07T15:18:08.016Z

## Authored
### Purpose

One configuration of the layout's levers, laid out and scored: the page's own ranking, order, scene and placement with the capture's card model in the page's place, then the routes and the signals.

### Notes

The levers are the Local Map tuning the layout reads (`LabConfig`), the baseline the page's defaults. Since the restarts of 2026-10-06 an evaluation runs the page's own starts and choice (`exploreBranches` once, then `orderExploration` from each start of `candidateStarts`, each measured by the capture's card model and placed, the cheapest by the configuration's `crossingCost` and `heightCost` kept by `layoutStarts`; the lab has no previous picture, so the churn is nothing), and reports which start it drew and every start's cheap signals and price beside the chosen picture's full signals. `orderStarts` at 0 is the ranking's order alone; `orderSeed` set is that one start alone. The exploration is the retained picture's: every file of the scope pinned whole, the first file the subject as `localRetainUrl` opens it, the page's default filters. `driftOf` holds a baseline evaluation to the capture's truth in every card's width, height and pin, the placement measure, the picture's size and every label's height: nothing, when the model is right, which `tests/e2e/layout-lab.spec.ts` asserts on every deck scope.
- `membraneDepth` (2026-10-07) is a lever like the others, passed to the exploration; `none` in a grid is every level.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LabConfig` {#symbol-labconfig}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L25)

##### `LabConfig` — Summary
The levers: the Local Map tuning the layout reads.

#### `LEVERS` {#symbol-levers}
- Type: const
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L44)
- Returns: `ReadonlyArray`

##### `LEVERS` — Summary
The levers in the order the reports name them.

#### `baselineConfig` {#symbol-baselineconfig}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L47)
- Returns: [`LabConfig`](#symbol-labconfig)

##### `baselineConfig` — Summary
The page's own tuning: the configuration the picture was designed at.

#### `Evaluation` {#symbol-evaluation}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L53)

##### `Evaluation` — Summary
A configuration laid out and scored, with the exploration, the scene and the routes behind the signals.

#### `scopePins` {#symbol-scopepins}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L68)
- Returns: [`PinSet`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-pinset)
- Parameters: `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun)

##### `scopePins` — Summary
The scope's pins, every file retained whole, and its subject.

#### `includeNode` {#symbol-includenode}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L73)
- Parameters: `pins`: [`PinSet`](../../packages/explorer/src/client/views/pin-state.ts.mdmd.md#symbol-pinset); `node`: [`ExplorerNodePayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorernodepayload)

##### `includeNode` — Summary
The page's default filters: tests shown, assets hidden, a pinned or selected file always kept.

#### `evaluate` {#symbol-evaluate}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L79)
- Returns: [`Evaluation`](#symbol-evaluation)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `config`: [`LabConfig`](#symbol-labconfig)

##### `evaluate` — Summary
Lays out and scores one configuration of the levers over a capture.

#### `driftOf` {#symbol-driftof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/evaluate.ts#L116)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `evaluation`: [`Evaluation`](#symbol-evaluation)

##### `driftOf` — Summary
Where the baseline evaluation differs from what the page showed at capture: nothing, when the model is right.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`local-storage.getDefaultTuning`](../../packages/explorer/src/client/persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.LocalMapTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-localmaptuning) (type-only)
- [`types.SymbolOrder`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-symbolorder) (type-only)
- [`branch-restarts.StartSignals`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startsignals)
- [`branch-restarts.candidateStarts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-candidatestarts)
- [`branch-restarts.layoutStarts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-layoutstarts)
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
