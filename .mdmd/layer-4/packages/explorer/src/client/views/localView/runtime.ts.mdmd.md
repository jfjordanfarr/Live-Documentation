# packages/explorer/src/client/views/localView/runtime.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/runtime.ts
- Generated At: 2026-11-06T20:08:41.825Z

## Authored
### Purpose

Runtime state management for the Local Map. Maintains the anchor registry, drag positions, the camera transform and the target of a running camera animation, and references to core DOM elements.

### Notes

One card represents each file in the shared scene, including a path. No hop-specific duplicate anchor registry is needed.

- Created 2025-12-04 during the localView modularisation.
- `AnchorRegistry` maps composite keys (column:nodeId) to the live DOM anchor elements.
- `LocalViewRuntime` bundles the registry, DOM refs, drag state, the transform and `mapAnimationTarget`, where a running animation is heading (null when none runs), so that a shift applied while it runs is not lost.
- `WireLayer` and `wires` (2026-10-16): the overlay's one SVG with the wires' elements by key and their gradients, kept across drawings so that `connections.ts` writes geometry in place; null until the first drawing and again after `clearConnections`.

Since the far bands' second milestone (2026-11-06) the runtime carries `zoomFloor`, the farthest scale the camera may take, which the controller derives from the map whenever it measures it and every zoom in `pan-zoom.ts` reads; null until the map is measured.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AnchorRegistry` {#symbol-anchorregistry}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/runtime.ts#L23)

##### `AnchorRegistry` — Summary
Two-level map used to store DOM anchor elements keyed by
`registryKey → symbolKey → HTMLElement`.

The outer key is produced by {@link buildRegistryKey}; the inner key is a
direction-qualified symbol identifier (e.g. `"inbound:MyClass"`).

#### `buildRegistryKey` {#symbol-buildregistrykey}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/runtime.ts#L29)
- Parameters: `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `buildRegistryKey` — Summary
Builds the composite registry key for anchor storage.
Format: `{columnRole}:{nodeId}` to disambiguate nodes appearing in multiple columns.

#### `WireLayer` {#symbol-wirelayer}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/runtime.ts#L38)

##### `WireLayer` — Summary
The wires' elements kept across drawings, by the key each wire, lace and bundle run is drawn under, with each wire's
gradient, so that a drawing writes geometry in place; null until the first drawing, and again when the overlay is
cleared (2026-10-16).

#### `DragPosition` {#symbol-dragposition}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/runtime.ts#L48)

##### `DragPosition` — Summary
Ephemeral pointer position captured during drag interactions.

#### `LocalViewRuntime` {#symbol-localviewruntime}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/runtime.ts#L59)

##### `LocalViewRuntime` — Summary
Mutable runtime bag for the Local Map view, holding references to
the viewport DOM nodes, pan/zoom transform, drag state, and the
current anchor registry. Created by {@link createRuntime}.

#### `createRuntime` {#symbol-createruntime}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/runtime.ts#L91)
- Returns: [`LocalViewRuntime`](#symbol-localviewruntime)
- Parameters: `viewport`: `HTMLDivElement`; `container`: `HTMLDivElement`; `overlay`: `HTMLDivElement`

##### `createRuntime` — Summary
Creates a fresh {@link LocalViewRuntime} with default values.
All transform/drag fields start at zero/null; the anchor registry
starts empty.

#### `registerAnchor` {#symbol-registeranchor}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/runtime.ts#L126)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `registerAnchor` — Summary
Registers a DOM element as an anchor point for connection drawing.

The element is stored under both its raw `key` and a normalised
variant (produced by `normalize`) so that callers can look up anchors
by either original or canonical symbol name.

#### `getAnchor` {#symbol-getanchor}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/runtime.ts#L155)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./types.ts.mdmd.md#symbol-columnrole)

##### `getAnchor` — Summary
Resolves the best-matching anchor element for a connection endpoint.

Look-up priority:
1. Exact `{direction}:{symbol}` match
2. Normalised symbol match (via `buildNormalizedKey`)
3. Wildcard fallback `{direction}:*`
4. Card-level fallback `"card"`

#### `clearAnchorRegistry` {#symbol-clearanchorregistry}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/runtime.ts#L189)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry)

##### `clearAnchorRegistry` — Summary
Empties every entry in the given anchor registry.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
