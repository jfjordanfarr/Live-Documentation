# packages/server/src/features/dependencies/symbolNeighbors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/dependencies/symbolNeighbors.ts
- Live Doc ID: LD-implementation-packages-server-src-features-dependencies-symbolneighbors-ts
- Generated At: 2025-11-24T15:19:58.504Z

## Authored
### Purpose
Traverses the Live Documentation graph to assemble neighbor summaries for a requested artifact, powering the dependency quick pick delivered in [2025-10-23 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md) alongside the US4 diagnostics tooling push.

### Notes
- Uses bounded breadth-first traversal with depth and count guards so the `inspectSymbolNeighbors` CLI and extension command stay responsive even on dense workspaces.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.504Z","inputHash":"845db613c7941bd2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `InspectSymbolNeighborsOptions` {#symbol-inspectsymbolneighborsoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/dependencies/symbolNeighbors.ts#L14)

#### `inspectSymbolNeighbors` {#symbol-inspectsymbolneighbors}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/dependencies/symbolNeighbors.ts#L32)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`, `InspectSymbolNeighborsResult`, `InspectSymbolNeighborsSummary`, `KnowledgeArtifact`, `LinkRelationshipKind`, `LinkedArtifactSummary`, `SymbolNeighborGroup`, `SymbolNeighborNode`
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [symbolNeighbors.test.ts](./symbolNeighbors.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
