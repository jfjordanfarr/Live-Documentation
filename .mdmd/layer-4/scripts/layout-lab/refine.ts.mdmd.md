# scripts/layout-lab/refine.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/refine.ts
- Generated At: 2026-10-13T16:52:35.813Z

## Authored
### Purpose

Runs the Local Map's continuing competition from a page capture, exposing every ordering and membrane-alignment trial plus the initial and final picture as inspectable data.

### Notes

The page and lab share candidate generation, trial scheduling, signals and judges. Ordering seeds alternate with alignment candidates; an adopted picture supplies a fresh set of neighboring boundary joins. Ordering patience and seed limits do not discard remaining alignment trials. A forced seed or explicitly disabled search performs no continuing trials, and a zero simplicity price disables alignment candidates. Every candidate is priced against the shown picture, including its churn.

The capture's card model supplies measurements. `evaluateAlignment` preserves the shown branch order while making a fresh scene, and seed trials use the same configuration with one forced seed. The result retains unsuccessful trials as well as adoptions. Its JSON companion serializes costs, settings, signals, columns, card tops and membrane segments without the scene's cyclic ownership links; the markdown report makes the score tradeoffs readable.

Added during the [October 13 weighted competition work](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-2--recovered-owner-scope-reply) to keep the new alignment search available through the headless lab. The older [restarts report](./restarts.ts.mdmd.md) deliberately remains an ordering-only simulation; this module performs the interleaved refinement.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RefinementSettings` {#symbol-refinementsettings}
- Type: type
- Source: [source](../../../../scripts/layout-lab/refine.ts#L19)

##### `RefinementSettings` — Summary
The continuing search's settings, with the same names and meanings as the page's tuning.

#### `RefinementTrial` {#symbol-refinementtrial}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/refine.ts#L22)

##### `RefinementTrial` — Summary
One priced trial, including unsuccessful trials so the complete search can be inspected.

#### `Refinement` {#symbol-refinement}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/refine.ts#L36)

##### `Refinement` — Summary
The initial and final pictures and the complete competition between them.

#### `refine` {#symbol-refine}
- Type: function
- Source: [source](../../../../scripts/layout-lab/refine.ts#L48)
- Returns: [`Refinement`](#symbol-refinement)
- Parameters: `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture); `graph`: [`ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `config`: [`LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig); `settings`: [`RefinementSettings`](#symbol-refinementsettings)

##### `refine` — Summary
Runs the same finite seed budget and alignment neighborhoods as the page, using the capture's measurements.

#### `refinementJson` {#symbol-refinementjson}
- Type: function
- Source: [source](../../../../scripts/layout-lab/refine.ts#L97)
- Parameters: `result`: [`Refinement`](#symbol-refinement); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `refinementJson` — Summary
A complete command result without the internal maps and cyclic scene ownership links.

#### `renderRefinement` {#symbol-renderrefinement}
- Type: function
- Source: [source](../../../../scripts/layout-lab/refine.ts#L106)
- Parameters: `result`: [`Refinement`](#symbol-refinement); `run`: [`ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun); `capture`: [`Capture`](./capture.ts.mdmd.md#symbol-capture)

##### `renderRefinement` — Summary
A readable companion to the complete trial and geometry JSON.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalMapTuning`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-localmaptuning) (type-only)
- [`branch-alignments.alignmentCandidates`](../../packages/explorer/src/client/views/localView/branch-alignments.ts.mdmd.md#symbol-alignmentcandidates)
- [`branch-placement.BoundaryAlignment`](../../packages/explorer/src/client/views/localView/branch-placement.ts.mdmd.md#symbol-boundaryalignment) (type-only)
- [`branch-restarts.StartCosts`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startcosts)
- [`branch-restarts.StartSignals`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-startsignals)
- [`branch-restarts.scoreOf`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-scoreof)
- [`branch-restarts.signalsOf`](../../packages/explorer/src/client/views/localView/branch-restarts.ts.mdmd.md#symbol-signalsof)
- [`branch-search.SearchState`](../../packages/explorer/src/client/views/localView/branch-search.ts.mdmd.md#symbol-searchstate)
- [`branch-search.beginSearch`](../../packages/explorer/src/client/views/localView/branch-search.ts.mdmd.md#symbol-beginsearch)
- [`branch-search.judgeAlignment`](../../packages/explorer/src/client/views/localView/branch-search.ts.mdmd.md#symbol-judgealignment)
- [`branch-search.judgeStart`](../../packages/explorer/src/client/views/localView/branch-search.ts.mdmd.md#symbol-judgestart)
- [`branch-search.nextTrialKind`](../../packages/explorer/src/client/views/localView/branch-search.ts.mdmd.md#symbol-nexttrialkind)
- [`types.ExplorerGraphPayload`](../../packages/explorer/src/shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`Capture`](./capture.ts.mdmd.md#symbol-capture) (type-only)
- [`evaluate.Evaluation`](./evaluate.ts.mdmd.md#symbol-evaluation)
- [`evaluate.LabConfig`](./evaluate.ts.mdmd.md#symbol-labconfig)
- [`evaluate`](./evaluate.ts.mdmd.md#symbol-evaluate)
- [`evaluate.evaluateAlignment`](./evaluate.ts.mdmd.md#symbol-evaluatealignment)
- [`scopes.ScopeRun`](./scopes.ts.mdmd.md#symbol-scoperun) (type-only)
<!-- LIVE-DOC:END Dependencies -->
