# packages/server/src/features/dependencies/inspectDependencies.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/dependencies/inspectDependencies.ts
- Live Doc ID: LD-implementation-packages-server-src-features-dependencies-inspectdependencies-ts
- Generated At: 2025-11-24T15:19:58.491Z

## Authored
### Purpose
Builds dependency fan-out reports for a given artifact, forming the server half of the dependency quick pick shipped in [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md) under task T039.

### Notes
- Normalizes URIs and routes through `buildCodeImpactGraph` so CLI and extension surfaces share consistent traversal limits, filtering, and summary math.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.491Z","inputHash":"bc7d29cfd5489839"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `InspectDependenciesOptions` {#symbol-inspectdependenciesoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/dependencies/inspectDependencies.ts#L13)

#### `inspectDependencies` {#symbol-inspectdependencies}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/dependencies/inspectDependencies.ts#L20)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `DependencyGraphEdge`, `GraphStore`, `InspectDependenciesResult`, `InspectDependenciesSummary`, `KnowledgeArtifact`, `LinkRelationshipKind`
- [`buildCodeGraph.CodeImpactEdge`](./buildCodeGraph.ts.mdmd.md#symbol-codeimpactedge)
- [`buildCodeGraph.buildCodeImpactGraph`](./buildCodeGraph.ts.mdmd.md#symbol-buildcodeimpactgraph)
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [inspectDependencies.test.ts](./inspectDependencies.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
