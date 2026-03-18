# packages/scripts/src/live-docs/explorer/shared/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/types.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-types-ts
- Generated At: 2026-03-17T19:15:49.364Z

## Authored
### Purpose
Shared type definitions used by both the Explorer server and client. Defines the shape of graph payloads, node payloads, link payloads, and detail responses exchanged over the HTTP API.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was split into client/server/shared modules.
- Extended in December 2025 with `ExplorerTypeReference` and `ExplorerPublicSymbol` to support type-reference rendering in the Local Map.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-17T19:15:49.364Z","inputHash":"999efe4ec6f87c33"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExplorerLinkKind` {#symbol-explorerlinkkind}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L16)

##### `ExplorerLinkKind` — Summary
Discriminant for the relationship kind carried on explorer graph edges.

The core values (`"dependency"`, `"extends"`, `"implements"`) correspond to
the relationship kinds the Live Doc parser extracts from markdown dependency
bullets and symbol documentation. The branded `string &` intersection allows
future link kinds to flow through without breaking existing switch statements.

##### `ExplorerLinkKind` — Remarks
Created 2025-11-21 as a plain `string` in the original monolithic explorer
script; narrowed to a branded union on 2025-11-25 when symbol-level edge
metadata was threaded through the pipeline to honour the headless/UI parity
principle. Was the subject of a barrel-file resolution bug (2025-12-18)
where the symbol index resolved it to `index.ts` instead of this file.

#### `ExplorerDependencyReference` {#symbol-explorerdependencyreference}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L37)

##### `ExplorerDependencyReference` — Summary
A single dependency edge from the perspective of the owning node.

Replaces the original bare `string[]` dependency representation that existed
prior to 2025-11-25. The user's assertion of headless/UI parity on 2025-11-24
drove the refactor: the UI must surface everything the Live Doc encodes,
including the target symbol anchor, originating source symbol, link kind,
and whether the target could be resolved to a known graph node.

##### `ExplorerDependencyReference` — Remarks
`raw` preserves the verbatim markdown link source text,
while `label` is the human-readable display name. `resolved` is `false` when
the target path could not be matched to any node in the graph — these edges
populate `missingDependencies` on the node payload.

#### `ExplorerTypeReference` {#symbol-explorertypereference}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L57)

##### `ExplorerTypeReference` — Summary
Represents a type reference for a public symbol, enabling type-aware navigation.

##### `ExplorerTypeReference` — Remarks
When a symbol's return type, parameter type, or inheritance clause references
a type defined in another Live Doc, we capture this information to enable
click-to-navigate in the Local Map view.

#### `ExplorerPublicSymbol` {#symbol-explorerpublicsymbol}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L75)

##### `ExplorerPublicSymbol` — Summary
Extended symbol information including type references.

#### `ExplorerNodePayload` {#symbol-explorernodepayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L97)

##### `ExplorerNodePayload` — Summary
The full payload for a single node in the explorer graph.

Serialised to JSON by the explorer HTTP server and consumed by the client
to render the Circuit Board treemap, Force Graph, and Local Map views.
Each node maps 1:1 to a tracked workspace artifact and its corresponding
Live Doc.

##### `ExplorerNodePayload` — Remarks
Originally defined inline in the monolithic `visualize-explorer.ts` on
2025-11-21 with `dependencies: string[]`. Extended on 2025-11-25 with
structured `ExplorerDependencyReference` and `missingDependencies` to
honour headless/UI parity. `publicSymbolsExtended` was added 2025-12-05
for type-reference navigation in the Local Map.

#### `ExplorerLinkPayload` {#symbol-explorerlinkpayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L128)

##### `ExplorerLinkPayload` — Summary
A directed edge in the explorer graph, connecting two node IDs.

`source` and `target` are node IDs (code paths) or objects carrying an `id`
property — the dual representation accommodates both raw JSON and D3's
force-simulation node references which replace string IDs with object refs.

##### `ExplorerLinkPayload` — Remarks
Originally `source: string; target: string; kind: string;` on 2025-11-21.
`sourceSymbol`/`targetSymbol` were added on 2025-11-25 to carry symbol-level
anchor information, enabling the Local Map to highlight individual symbols
in the dependency columns rather than just file-level cards.

#### `ExplorerGraphStats` {#symbol-explorergraphstats}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L140)

##### `ExplorerGraphStats` — Summary
Summary statistics for the explorer graph, rendered in the Circuit Board
header and used by the static builder to emit a quick-access overview.

#### `ExplorerGraphPayload` {#symbol-explorergraphpayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L153)

##### `ExplorerGraphPayload` — Summary
Top-level payload returned by the explorer server's `/graph` endpoint.

Contains the complete graph (all nodes and edges) plus summary statistics.
Also serialised to `dist/explorer/explorer-data.json` by the static builder
for offline/GitHub Pages deployment.

#### `ExplorerDetailPayload` {#symbol-explorerdetailpayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L172)

##### `ExplorerDetailPayload` — Summary
Payload returned by the explorer server's `/detail?nodeId=<path>` endpoint.

Provides the full detail for a single node — intended for the right-panel
detail view in the Local Map. Includes the authored markdown (Purpose,
Notes, etc.) and all structured metadata the Live Doc encodes.

##### `ExplorerDetailPayload` — Remarks
Added on 2026-01-03 as part of the "Full Authored rendering, archetype
badges, markdown download" feature. The `purpose` field is deprecated in
favour of the richer `authored` field which preserves the full authored
section markdown.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [aggregation.test.ts](../client/views/circuitView/aggregation.test.ts.mdmd.md)
- [squarify.test.ts](../client/views/circuitView/squarify.test.ts.mdmd.md)
- [state.test.ts](../client/views/circuitView/state.test.ts.mdmd.md)
- [layout-measure.test.ts](../client/views/localView/layout-measure.test.ts.mdmd.md)
- [pan-zoom.test.ts](../client/views/localView/pan-zoom.test.ts.mdmd.md)
- [subgraph-builder.test.ts](../client/views/localView/subgraph-builder.test.ts.mdmd.md)
- [symbol-highlight.test.ts](../client/views/localView/symbol-highlight.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
