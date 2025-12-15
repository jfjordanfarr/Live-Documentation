# packages/server/src/features/dependencies/symbolNeighbors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/dependencies/symbolNeighbors.ts
- Live Doc ID: LD-implementation-packages-server-src-features-dependencies-symbolneighbors-ts
- Generated At: 2025-12-15T00:38:06.196Z

## Authored
### Purpose
Traverses the Live Documentation graph to assemble neighbor summaries for a requested artifact, powering the dependency quick pick delivered in [2025-10-23 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md) alongside the US4 diagnostics tooling push.

### Notes
- Uses bounded breadth-first traversal with depth and count guards so the `inspectSymbolNeighbors` CLI and extension command stay responsive even on dense workspaces.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.196Z","inputHash":"e287a9f86c073d66"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `InspectSymbolNeighborsOptions` {#symbol-inspectsymbolneighborsoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/dependencies/symbolNeighbors.ts#L14)

#### `inspectSymbolNeighbors` {#symbol-inspectsymbolneighbors}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/dependencies/symbolNeighbors.ts#L32)
- Returns: [`InspectSymbolNeighborsResult`](../../../../shared/src/contracts/symbols.ts.mdmd.md#symbol-inspectsymbolneighborsresult)
- Parameters: `options`: [`InspectSymbolNeighborsOptions`](#symbol-inspectsymbolneighborsoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.InspectSymbolNeighborsResult`](../../../../shared/src/index.ts.mdmd.md#symbol-inspectsymbolneighborsresult)
- [`index.InspectSymbolNeighborsSummary`](../../../../shared/src/index.ts.mdmd.md#symbol-inspectsymbolneighborssummary)
- [`index.KnowledgeArtifact`](../../../../shared/src/index.ts.mdmd.md#symbol-knowledgeartifact)
- [`index.LinkRelationshipKind`](../../../../shared/src/index.ts.mdmd.md#symbol-linkrelationshipkind)
- [`index.LinkedArtifactSummary`](../../../../shared/src/index.ts.mdmd.md#symbol-linkedartifactsummary)
- [`index.SymbolNeighborGroup`](../../../../shared/src/index.ts.mdmd.md#symbol-symbolneighborgroup)
- [`index.SymbolNeighborNode`](../../../../shared/src/index.ts.mdmd.md#symbol-symbolneighbornode)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [symbolNeighbors.test.ts](./symbolNeighbors.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
