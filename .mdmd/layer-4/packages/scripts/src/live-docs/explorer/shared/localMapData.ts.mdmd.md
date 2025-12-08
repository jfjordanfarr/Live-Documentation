# packages/scripts/src/live-docs/explorer/shared/localMapData.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/localMapData.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-localmapdata-ts
- Generated At: 2025-12-07T21:41:17.246Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:17.246Z","inputHash":"7b2b5e71c11c2e38"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LocalMapColumn` {#symbol-localmapcolumn}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L37)

##### `LocalMapColumn` — Summary
Column role in the 3-column layout.
Uses semantic names for clarity and future multi-hop expansion.

#### `LocalMapNode` {#symbol-localmapnode}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L43)

##### `LocalMapNode` — Summary
A node card as it appears in the Local Map.
Simpler than full `ExplorerNodePayload` — contains only render-relevant fields.

#### `LocalMapEdge` {#symbol-localmapedge}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L83)

##### `LocalMapEdge` — Summary
An edge in the Local Map connecting two nodes.
Includes symbol-level anchoring for precise connection rendering.

#### `LocalMapSymbolAnchor` {#symbol-localmapsymbolanchor}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L114)

##### `LocalMapSymbolAnchor` — Summary
A symbol anchor point for edge connection routing.
In the DOM, this corresponds to a `.symbol-item` element's position.

#### `LocalMapData` {#symbol-localmapdata}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L160)

##### `LocalMapData` — Summary
Complete Local Map data for a focus node.

This is the JSON payload that:
- Powers the visual Local Map renderer
- Feeds LLM prompts for understanding node relationships
- Enables static site embedding
- Supports debugging without DOM inspection

##### `LocalMapData` — Examples
```json
{
  "focusNodeId": "packages/server/src/main.ts",
  "center": { ... },
  "upstream": [ ... ],
  "downstream": [ ... ],
  "edges": [ ... ],
  "symbolAnchors": [ ... ],
  "stats": { ... }
}
```

#### `LocalMapStats` {#symbol-localmapstats}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L208)

##### `LocalMapStats` — Summary
Statistics about the Local Map subgraph.

#### `LocalMapMetadata` {#symbol-localmapmetadata}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L234)

##### `LocalMapMetadata` — Summary
Metadata about when/how this Local Map was generated.

#### `LOCAL_MAP_SCHEMA_VERSION` {#symbol-local_map_schema_version}
- Type: const
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L252)

##### `LOCAL_MAP_SCHEMA_VERSION` — Summary
Current Local Map schema version.

#### `BuildLocalMapOptions` {#symbol-buildlocalmapoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L257)

##### `BuildLocalMapOptions` — Summary
Options for building a Local Map from the full graph.

#### `normalizeSymbolIdentifier` {#symbol-normalizesymbolidentifier}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L275)

##### `normalizeSymbolIdentifier` — Summary
Normalize a symbol identifier for anchor matching.
Mirrors the client-side `normalizeSymbolIdentifier` function.

#### `buildNormalizedAnchorKey` {#symbol-buildnormalizedanchorkey}
- Type: function
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/localMapData.ts#L287)
- Parameters: `column`: [`LocalMapColumn`](#symbol-localmapcolumn)

##### `buildNormalizedAnchorKey` — Summary
Build a normalized anchor key for symbol matching.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerLinkKind`](./types.ts.mdmd.md#symbol-explorerlinkkind) (type-only)
- [`types.ExplorerNodePayload`](./types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- [`types.ExplorerPublicSymbol`](./types.ts.mdmd.md#symbol-explorerpublicsymbol) (type-only)
<!-- LIVE-DOC:END Dependencies -->
