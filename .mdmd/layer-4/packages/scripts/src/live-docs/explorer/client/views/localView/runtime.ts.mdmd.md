# packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-runtime-ts
- Generated At: 2026-02-16T18:24:59.838Z

## Authored
### Purpose
Runtime state management for the Local Map. Maintains the anchor registry, drag positions, and references to core DOM elements.[AI-Agent-Workspace/ChatHistory/2025/12/2025-12-04.md]

### Notes
- Created 2025-12-04 during the localView modularisation.
- `AnchorRegistry` maps composite keys (column:nodeId) to bounding rectangles.
- `LocalViewRuntime` bundles the registry, DOM refs, and drag state.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:24:59.838Z","inputHash":"5fa44cf3a6ed3491"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `AnchorRegistry` {#symbol-anchorregistry}
- Type: type
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L25)

##### `AnchorRegistry` — Summary
Two-level map used to store DOM anchor elements keyed by
`registryKey → symbolKey → HTMLElement`.

The outer key is produced by {@link buildRegistryKey} or
{@link buildRegistryKeyWithHop}; the inner key is a
direction-qualified symbol identifier (e.g. `"inbound:MyClass"`).

#### `buildRegistryKey` {#symbol-buildregistrykey}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L32)
- Parameters: `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `buildRegistryKey` — Summary
Builds the composite registry key for anchor storage.
Format: `{columnRole}:{nodeId}` to disambiguate nodes appearing in multiple columns.
For multi-hop, use {@link buildRegistryKeyWithHop} instead.

#### `buildRegistryKeyWithHop` {#symbol-buildregistrykeywithhop}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L41)
- Parameters: `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `buildRegistryKeyWithHop` — Summary
Builds a hop-aware registry key for multi-hop anchor storage.
Format: `{columnRole}:{hopIndex}:{nodeId}` to disambiguate the same node
appearing in multiple columns across different hops.

#### `DragPosition` {#symbol-dragposition}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L46)

##### `DragPosition` — Summary
Ephemeral pointer position captured during drag interactions.

#### `LocalViewRuntime` {#symbol-localviewruntime}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L57)

##### `LocalViewRuntime` — Summary
Mutable runtime bag for the Local Map view, holding references to
the viewport DOM nodes, pan/zoom transform, drag state, and the
current anchor registry. Created by {@link createRuntime}.

#### `createRuntime` {#symbol-createruntime}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L83)
- Returns: [`LocalViewRuntime`](#symbol-localviewruntime)
- Parameters: `viewport`: `HTMLDivElement`; `container`: `HTMLDivElement`; `overlay`: `HTMLDivElement`

##### `createRuntime` — Summary
Creates a fresh {@link LocalViewRuntime} with default values.
All transform/drag fields start at zero/null; the anchor registry
starts empty.

#### `registerAnchor` {#symbol-registeranchor}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L116)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `registerAnchor` — Summary
Registers a DOM element as an anchor point for connection drawing.

The element is stored under both its raw `key` and a normalised
variant (produced by `normalize`) so that callers can look up anchors
by either original or canonical symbol name.

#### `registerAnchorWithHop` {#symbol-registeranchorwithhop}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L141)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `registerAnchorWithHop` — Summary
Registers an anchor with hop-aware key for multi-hop visualisation.
Similar to {@link registerAnchor} but uses {@link buildRegistryKeyWithHop}
to scope the anchor to a specific hop index.

#### `getAnchor` {#symbol-getanchor}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L171)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `getAnchor` — Summary
Resolves the best-matching anchor element for a connection endpoint.

Look-up priority:
1. Exact `{direction}:{symbol}` match
2. Normalised symbol match (via `buildNormalizedKey`)
3. Wildcard fallback `{direction}:*`
4. Card-level fallback `"card"`

#### `getAnchorWithHop` {#symbol-getanchorwithhop}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L209)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry); `columnRole`: [`ColumnRole`](./layout-math.ts.mdmd.md#symbol-columnrole)

##### `getAnchorWithHop` — Summary
Hop-aware variant of {@link getAnchor} for multi-hop path mode.
Uses {@link buildRegistryKeyWithHop} to scope the look-up to a specific
hop index. Same priority cascade as `getAnchor`.

#### `clearAnchorRegistry` {#symbol-clearanchorregistry}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/runtime.ts#L244)
- Parameters: `registry`: [`AnchorRegistry`](#symbol-anchorregistry)

##### `clearAnchorRegistry` — Summary
Empties every entry in the given anchor registry.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`connections.MultiHopEntry`](./connections.ts.mdmd.md#symbol-multihopentry) (type-only)
- [`types.ColumnRole`](./types.ts.mdmd.md#symbol-columnrole) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.MapTransform`](./types.ts.mdmd.md#symbol-maptransform) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pan-zoom.test.ts](./pan-zoom.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
