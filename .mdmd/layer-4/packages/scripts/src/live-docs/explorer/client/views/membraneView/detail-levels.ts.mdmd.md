# packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-membraneview-detail-levels-ts
- Generated At: 2026-03-25T17:08:29.653Z

## Authored
### Purpose

Pure-function detail level resolution for the Membrane Map, classifying every node as `Full`, `Summary`, `Badge`, or `Hidden` based on focal node proximity and viewport culling — implementing the progressive disclosure model where pin count drives the rendering fidelity of each tile.

### Notes

- Created during [Dev Day 80 Step 3](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) as the third pure-math rung, immediately after the layout engine.
- `FocalSpec` unifies Browse (no focal), Explore (single focal), and Compare (dual focal) into a single data structure; the rendering detail is a continuous function of the spec rather than a discrete mode switch.
- `resolveDetailLevels` assigns `Full` to focal nodes, `Summary` to 1-hop edge neighbors of any focal, `Badge` to everything else in-viewport, and `Hidden` to off-screen nodes, enabling proportional rendering cost regardless of graph size.
- Although the continuous pin model (adopted later in the same dev day) means the renderer doesn't consume `DetailLevel` directly for DOM class assignment, the classification remains available for future performance optimization (e.g., culling Hidden nodes from the DOM entirely).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-25T17:08:29.653Z","inputHash":"64f432bae87f1ff2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DetailLevel` {#symbol-detaillevel}
- Type: enum
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.ts#L12)

##### `DetailLevel` — Summary
The rendering detail level assigned to each node in the membrane layout.

- **Full**: Expanded card with all symbols/pins visible (focal node)
- **Summary**: Compact card showing name + key metrics (direct neighbors)
- **Badge**: Collapsed to a small badge with aggregate count (distant nodes)
- **Hidden**: Off-screen or culled — not rendered at all

#### `FocalSpec` {#symbol-focalspec}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.ts#L26)

##### `FocalSpec` — Summary
Focal node specification for detail-level resolution.

- No focal: Browse mode — everything is Badge.
- Single focal: Explore mode — focal is Full, neighbors are Summary.
- Dual focal: Compare mode — both are Full, union of neighbors are Summary.

#### `resolveDetailLevels` {#symbol-resolvedetaillevels}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/membraneView/detail-levels.ts#L55)
- Parameters: `layout`: [`MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout); `edges`: `ReadonlyArray`; `focalSpec`: [`FocalSpec`](#symbol-focalspec); `cullingViewport`: [`LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect)

##### `resolveDetailLevels` — Summary
Resolves the detail level for every node in a membrane layout.

##### `resolveDetailLevels` — Parameters
- `cullingViewport`: Optional viewport for culling off-screen nodes.
Defaults to the layout's own viewport.
- `edges`: Array of [sourceId, targetId] connection pairs
- `focalSpec`: Which node(s) are focal (if any)
- `layout`: The membrane layout tree with flat index

##### `resolveDetailLevels` — Returns
A Map from node id to DetailLevel
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`layoutUtils.LayoutRect`](../layoutUtils.ts.mdmd.md#symbol-layoutrect) (type-only)
- [`types.MembraneLayout`](./types.ts.mdmd.md#symbol-membranelayout) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [detail-levels.test.ts](./detail-levels.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
