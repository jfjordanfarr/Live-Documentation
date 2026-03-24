# packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-svg-connections-ts
- Generated At: 2026-03-24T03:05:20.109Z

## Authored

### Purpose

SVG rendering of membrane-to-membrane bundled edge connections, drawing logarithmically-scaled curved paths between collapsed directory tiles with count badges — the macro-level complement to the focal overlay's per-symbol pin connections.

### Notes

- Created during [Dev Day 80 Step 8](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as the SVG Edge Bundling Rendering rung.
- Pure functions (`bundleStrokeWidth`, `computeEdgeExitPoint`, `computeBundleCurvePath`, `computeBundleMidpoint`) are fully testable without a DOM; `renderBundledEdges` is the sole DOM function, creating an SVG overlay positioned absolutely over the membrane container.
- `computeEdgeExitPoint` uses parametric line–rectangle intersection to find where a ray from a rect's center exits its border, ensuring connection endpoints sit on membrane edges rather than centers.
- Bundle stroke width scales logarithmically (`2 + log₂(count) × 1.5`, clamped to 10px), giving visual weight to high-connection-count bundles without overwhelming thinner ones.
- Currently disabled in the controller for MVP (the thick arcs created visual noise over the treemap layout); the pure functions remain tested and ready for re-enablement with progressive-disclosure or hover-only rendering.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:20.109Z","inputHash":"a9daa7dc31ee3cfe"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `bundleStrokeWidth` {#symbol-bundlestrokewidth}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts#L21)

##### `bundleStrokeWidth` — Summary

Compute stroke width for a bundled edge based on connection count.
Logarithmic scaling, clamped between 2px and 10px.

#### `computeEdgeExitPoint` {#symbol-computeedgeexitpoint}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts#L33)
- Parameters: `rect`: [`LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect)

##### `computeEdgeExitPoint` — Summary

Find where a ray from the center of `rect` toward `(towardX, towardY)`
exits the rect border.

Uses parametric line–rectangle intersection: cast a ray from center
in the direction of the target, pick the smallest positive t that
lands on the border.

#### `computeBundleCurvePath` {#symbol-computebundlecurvepath}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts#L87)

##### `computeBundleCurvePath` — Summary

Compute a quadratic Bézier SVG path between two points.
The control point is offset perpendicular to the source–target line,
giving a gentle arc.

#### `computeBundleMidpoint` {#symbol-computebundlemidpoint}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts#L114)

##### `computeBundleMidpoint` — Summary

Compute the midpoint between source and target (for badge placement).

#### `renderBundledEdges` {#symbol-renderbundlededges}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/svg-connections.ts#L137)
- Returns: `SVGSVGElement`
- Parameters: `layout`: [`MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout)

##### `renderBundledEdges` — Summary

Render bundled edges as thick SVG paths with count badges.

Creates an SVG overlay element positioned over the membrane container.
Each bundle gets a curved path (stroke-width ∝ count) and a text badge
showing the number of aggregated connections.

##### `renderBundledEdges` — Parameters

- `bundles`: Aggregated bundles from `aggregateEdges()`
- `layout`: Current membrane layout (for node rect lookup)

##### `renderBundledEdges` — Returns

SVG overlay element, or null if no bundles to render

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect) (type-only)
- [`edge-bundling.BundledEdge`](./edge-bundling.ts.mdmd.md#symbol-bundlededge) (type-only)
- [`types.MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->

### Observed Evidence

#### Vitest Unit Tests

- [svg-connections.test.ts](./svg-connections.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
