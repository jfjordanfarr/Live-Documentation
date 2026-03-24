# packages/scripts/src/live-docs/explorer/client/views/membraneView/edge-bundling.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/edge-bundling.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-edge-bundling-ts
- Generated At: 2026-03-24T03:05:19.747Z

## Authored

### Purpose

Pure-function edge aggregation that collapses individual file-to-file dependency edges into membrane-level bundles based on which directories are currently collapsed, producing `BundledEdge` records for the SVG connection renderer.

### Notes

- Created during [Dev Day 80 Step 4](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as the fourth and final pure-math rung before DOM rendering began.
- `resolveEndpoint` walks the parent-pointer chain from a node toward the root, returning the shallowest collapsed ancestor — this is the key insight that maps individual edges to their membrane-level representatives.
- Direction is preserved: A→B and B→A are separate bundles, maintaining the inbound/outbound semantic that the pin model relies on.
- Internal edges (both endpoints resolve to the same collapsed membrane) and fully-visible edges (neither endpoint is inside a collapsed directory) are both excluded — the former are invisible, the latter are drawn as individual pin connections by the focal overlay.
- Bundle rendering is currently disabled in the controller (`index.ts`) for MVP: the thick SVG arcs overwhelmed the treemap layout; re-enable once hover-only or progressive-disclosure rendering is implemented.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:19.747Z","inputHash":"64c4d38e9a16daec"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `BundledEdge` {#symbol-bundlededge}

- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/edge-bundling.ts#L6)

##### `BundledEdge` — Summary

A bundled edge representing N individual edges between two visible membrane endpoints.

#### `aggregateEdges` {#symbol-aggregateedges}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/edge-bundling.ts#L61)
- Returns: [`BundledEdge`](#symbol-bundlededge)[]
- Parameters: `layout`: [`MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout); `edges`: `ReadonlyArray`

##### `aggregateEdges` — Summary

Aggregate individual edges into membrane-level bundles based on which
directories are currently collapsed.

- Edges whose both endpoints resolve to the same membrane (internal) are excluded.
- Edges whose both endpoints are visible (not inside any collapsed dir) are excluded
  (they remain individual connections, not bundled).
- Direction is preserved: A→B and B→A are separate bundles.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`types.MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout) (type-only)
- [`types.MembraneNode`](./types.ts.mdmd.md#symbol-membranenode) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->

### Observed Evidence

#### Vitest Unit Tests

- [edge-bundling.test.ts](./edge-bundling.test.ts.mdmd.md)
- [svg-connections.test.ts](./svg-connections.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
