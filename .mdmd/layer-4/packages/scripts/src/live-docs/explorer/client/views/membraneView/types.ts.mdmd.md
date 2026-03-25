# packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-types-ts
- Generated At: 2026-03-25T17:08:30.206Z

## Authored
### Purpose

Shared type vocabulary for the Membrane Map layout engine, defining the recursive `MembraneNode` tree, `MembraneLayout` output, and configurable `MembraneLayoutConfig` with its `WeightFunction` strategy.

### Notes

- Created during [Dev Day 80 Step 1](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as the first rung of the 10-rung zipper implementation plan, establishing the pure-math foundation before any DOM code existed.
- `MembraneNode` carries both a `rect` (the outer bounding box including border) and a `contentRect` (the inner area where children are laid out), enabling recursive nesting with graduated membrane borders.
- `WeightFunction` is a strategy type (`'files'` | `'symbols'` | `'dependencies'`) that determines how much area each node occupies in the squarified treemap — defaulting to `'files'` for directory-proportional sizing.
- All coordinates in `MembraneNode.rect` are absolute (relative to the root viewport), not parent-relative, so DOM elements can be positioned directly without recursive offset computation.
- `MembraneLayout.index` provides O(1) lookup by node ID, avoiding tree traversal when the controller needs to map a click event or pin anchor to its layout position.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-25T17:08:30.206Z","inputHash":"2b11d60c0d0a3c03"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WeightFunction` {#symbol-weightfunction}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts#L7)

##### `WeightFunction` — Summary
The weight function used to determine how much area a node or
directory occupies in the membrane treemap.

#### `MembraneLayoutConfig` {#symbol-membranelayoutconfig}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts#L12)

##### `MembraneLayoutConfig` — Summary
Configuration for the membrane layout engine.

#### `DEFAULT_MEMBRANE_CONFIG` {#symbol-default_membrane_config}
- Type: const
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts#L24)
- Returns: [`MembraneLayoutConfig`](#symbol-membranelayoutconfig)

##### `DEFAULT_MEMBRANE_CONFIG` — Summary
Sensible defaults for the membrane layout.

#### `MembraneNode` {#symbol-membranenode}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts#L39)

##### `MembraneNode` — Summary
A node in the membrane layout tree.

- Leaf nodes represent individual files.
- Branch nodes represent directories (membranes) containing children.

All coordinates are absolute (relative to the root viewport).

#### `MembraneLayout` {#symbol-membranelayout}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/types.ts#L63)

##### `MembraneLayout` — Summary
The complete output of the membrane layout computation.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [detail-levels.test.ts](./detail-levels.test.ts.mdmd.md)
- [edge-bundling.test.ts](./edge-bundling.test.ts.mdmd.md)
- [layout.test.ts](./layout.test.ts.mdmd.md)
- [pin-state.test.ts](./pin-state.test.ts.mdmd.md)
- [svg-connections.test.ts](./svg-connections.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
