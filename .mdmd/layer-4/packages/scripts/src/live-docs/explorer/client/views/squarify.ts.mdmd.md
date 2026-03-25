# packages/scripts/src/live-docs/explorer/client/views/squarify.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/squarify.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-squarify-ts
- Generated At: 2026-03-25T17:08:30.254Z

## Authored
### Purpose

Implements the Bruls, Huizing, and van Wijk "Squarified Treemaps" algorithm (2000) for laying out directory tiles in the Circuit Board. Produces tiles with aspect ratios as close to 1:1 as possible, making the treemap visually coherent compared to naive slice-and-dice approaches.

### Notes

- Extracted during the Circuit Board progressive disclosure refactoring on [Dev Day 78](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-17.1.md). Designed as a pure function with zero DOM dependencies so it can be tested in vitest's Node environment.
- The algorithm sorts items by descending weight, then greedily assigns items to rows/columns along the shorter side of the remaining viewport, breaking when adding another item would worsen the worst aspect ratio in the current row.
- Only directory aggregates are squarified; individual files render in a separate uniform CSS flex-wrap grid (the "two-zone layout" from Option C of the progressive disclosure design).
- Filters zero-weight items before layout and handles degenerate cases (empty input, single item fills entire viewport).
- Promoted from `circuitView/squarify.ts` to `views/squarify.ts` during Step 0 of the Membrane Map implementation (Dev Day 81).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-25T17:08:30.254Z","inputHash":"f15b554208198ba1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SquarifyItem` {#symbol-squarifyitem}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/squarify.ts#L7)

##### `SquarifyItem` — Summary
An item to be laid out with the squarified treemap algorithm.
The `weight` determines the relative area of the tile.

#### `SquarifyTile` {#symbol-squarifytile}
- Type: interface
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/squarify.ts#L17)

##### `SquarifyTile` — Summary
A positioned tile output from the squarified treemap algorithm.

#### `computeSquarifiedLayout` {#symbol-computesquarifiedlayout}
- Type: function
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/squarify.ts#L36)
- Returns: [`SquarifyTile`](#symbol-squarifytile)[]
- Parameters: `items`: `ReadonlyArray`; `viewport`: [`LayoutRect`](./layoutUtils.ts.mdmd.md#symbol-layoutrect)

##### `computeSquarifiedLayout` — Summary
Computes a squarified treemap layout for the given items within a viewport.

This is an implementation of Bruls, Huizing, and van Wijk's
"Squarified Treemaps" algorithm (2000), which produces tiles with
aspect ratios as close to 1:1 as possible — visually far superior
to naive slice-and-dice layouts.

##### `computeSquarifiedLayout` — Parameters
- `items`: Items to lay out, each with a weight > 0
- `viewport`: The bounding rectangle to fill

##### `computeSquarifiedLayout` — Returns
Positioned tiles, one per item
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layoutUtils.LayoutRect`](./layoutUtils.ts.mdmd.md#symbol-layoutrect) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [layout.test.ts](./membraneView/layout.test.ts.mdmd.md)
- [squarify.test.ts](./squarify.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
