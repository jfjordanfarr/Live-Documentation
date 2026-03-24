# packages/scripts/src/live-docs/explorer/client/views/membraneView/layout.ts

## Metadata

- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/layout.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-layout-ts
- Generated At: 2026-03-24T03:05:19.953Z

## Authored

### Purpose

Recursive membrane layout engine that maps a `DirectoryNode` tree onto a `MembraneLayout` of nested squarified treemap tiles, with configurable border sizing, weight functions, and focus-path-aware allocation.

### Notes

- Created during [Dev Day 80 Step 1](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) alongside `types.ts` as the core pure-math rung.
- `computeWeight` recursively sums leaf weights based on the configured `WeightFunction` strategy; `FOCUS_ANCESTOR_CONFIG` overrides border sizes when a focus path is active to give more visual area to the drilled-down directory.
- `layoutDirectory` is the recursive workhorse: it computes each directory's border inset, calls `computeSquarifiedLayout` from the shared `squarify.ts` for child positioning, then recurses into subdirectories.
- `buildIndex` flattens the recursive `MembraneNode` tree into a `Map<string, MembraneNode>` for O(1) lookups used throughout the controller, browse renderer, and focal overlay.
- The layout is pure-functional (no DOM dependency), enabling comprehensive Vitest coverage of spatial invariants like non-overlap, containment within parent bounds, and area proportionality.

## Generated

<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-24T03:05:19.953Z","inputHash":"b8d3051f3e920a89"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->

### Public Symbols

#### `computeMembraneLayout` {#symbol-computemembranelayout}

- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/layout.ts#L209)
- Returns: [`MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout)
- Parameters: `root`: [`DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode); `viewport`: [`LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect); `config`: [`MembraneLayoutConfig`](./types.ts.mdmd.md#symbol-membranelayoutconfig)

##### `computeMembraneLayout` — Summary

Computes a recursive membrane layout for an entire directory tree.

Each directory becomes a nested membrane container. Files inside
a directory are laid out as sibling leaf tiles. The squarified
treemap algorithm ensures that tiles have aspect ratios close to 1:1.

##### `computeMembraneLayout` — Parameters

- `config`: Layout tuning parameters (optional; uses defaults)
- `root`: The root DirectoryNode (from `buildHierarchy()`)
- `viewport`: The bounding rectangle to fill

##### `computeMembraneLayout` — Returns

A fully-positioned MembraneLayout

<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->

### Dependencies

- [`types.DirectoryNode`](../../types.ts.mdmd.md#symbol-directorynode) (type-only)
- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect) (type-only)
- [`types.DEFAULT_MEMBRANE_CONFIG`](./types.ts.mdmd.md#symbol-default_membrane_config) (type-only)
- [`types.MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout) (type-only)
- [`types.MembraneLayoutConfig`](./types.ts.mdmd.md#symbol-membranelayoutconfig) (type-only)
- [`types.MembraneNode`](./types.ts.mdmd.md#symbol-membranenode) (type-only)
- [`squarify.SquarifyItem`](../squarify.ts.mdmd.md#symbol-squarifyitem) (type-only)
- [`squarify.computeSquarifiedLayout`](../squarify.ts.mdmd.md#symbol-computesquarifiedlayout) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->

### Observed Evidence

#### Vitest Unit Tests

- [layout.test.ts](./layout.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
