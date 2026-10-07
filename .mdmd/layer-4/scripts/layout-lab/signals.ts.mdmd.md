# scripts/layout-lab/signals.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/layout-lab/signals.ts
- Generated At: 2026-10-07T22:32:32.380Z

## Authored
### Purpose

The signals the lab scores a layout on, each a number the deck also reads from the page or that the scene knows outright.

### Notes

Length in its parts; crossings by the deck's own `crossings` over the sampled routes; samples inside a membrane that holds neither of a wire's ends (the sharp outline from `membrane-outline.ts`, where the page rounds the corners by the padding) and the wires with any; wires whose two ends one membrane holds and that leave it anywhere, the deepest drawn directory over both ends; samples inside lanes; lane runs and threaded wires; references read against the columns; the columns, lanes, picture size and the exact placement's measure. The point-in-polygon test is the even-odd rule.
- `fragments` (2026-10-07, the wall): for each of the files' real directories in each column, its runs of neighbouring cards beyond the first, summed (`fragmentsOf`), counted on the real directories whatever membranes the setting drew, so that the price of letting directories interleave is read in both directions: shorter wires on one side, broken-up directories on the other. Zero under the membrane rule.
- Two shape signals since 2026-10-07: `unevenness`, the steps of every membrane's outline between neighbouring columns, top and bottom; and `unlevel`, how far the k-th cards of a membrane's neighbouring columns stand from level, summed; both read from the scene exactly as the placement prices them under its evenness and levelness weights.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Signals` {#symbol-signals}
- Type: interface
- Source: [source](../../../../scripts/layout-lab/signals.ts#L19)

##### `Signals` — Summary
The signals of one layout.

#### `insidePolygon` {#symbol-insidepolygon}
- Type: function
- Source: [source](../../../../scripts/layout-lab/signals.ts#L67)
- Parameters: `points`: `ReadonlyArray`

##### `insidePolygon` — Summary
Whether a point lies inside a polygon, by the even-odd rule.

#### `fragmentsOf` {#symbol-fragmentsof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/signals.ts#L77)
- Parameters: `columns`: `ReadonlyArray`

##### `fragmentsOf` — Summary
The runs beyond the first that each directory's cards form in each column, summed: how far the directories interleave.

#### `unevennessOf` {#symbol-unevennessof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/signals.ts#L93)

##### `unevennessOf` — Summary
The steps of every membrane's outline between neighbouring columns, top and bottom, summed in pixels.

#### `unlevelOf` {#symbol-unlevelof}
- Type: function
- Source: [source](../../../../scripts/layout-lab/signals.ts#L109)
- Parameters: `columns`: `ReadonlyArray`; `tops`: `ReadonlyMap`

##### `unlevelOf` — Summary
How far the k-th cards of each membrane's neighbouring columns stand from level, summed over the pairs in pixels:
the cards directly in a membrane, by column in the column's order, the k-th of one column against the k-th of the
next, as the placement prices them under its levelness weight.

#### `measureScene` {#symbol-measurescene}
- Type: function
- Source: [source](../../../../scripts/layout-lab/signals.ts#L132)
- Returns: [`Signals`](#symbol-signals)
- Parameters: `scene`: [`Scene`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scene); `branches`: [`BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph)

##### `measureScene` — Summary
Every signal of a laid-out scene and its routes.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-scene.Scene`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scene) (type-only)
- [`branch-scene.SceneBox`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scenebox) (type-only)
- [`branches.BranchGraph`](../../packages/explorer/src/client/views/localView/branches.ts.mdmd.md#symbol-branchgraph) (type-only)
- [`membrane-outline.membraneOutline`](../../packages/explorer/src/client/views/localView/membrane-outline.ts.mdmd.md#symbol-membraneoutline)
- [`pin-layout.parentDirectory`](../../packages/explorer/src/client/views/membraneView/pin-layout.ts.mdmd.md#symbol-parentdirectory)
- [`routes.Route`](./routes.ts.mdmd.md#symbol-route) (type-only)
- [`still-picture-geometry.CrossingScore`](../../tests/e2e/still-picture-geometry.ts.mdmd.md#symbol-crossingscore)
- [`still-picture-geometry.Polyline`](../../tests/e2e/still-picture-geometry.ts.mdmd.md#symbol-polyline)
- [`still-picture-geometry.crossings`](../../tests/e2e/still-picture-geometry.ts.mdmd.md#symbol-crossings)
<!-- LIVE-DOC:END Dependencies -->
