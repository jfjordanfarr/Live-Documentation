# packages/shared/src/contracts/dependencies.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/dependencies.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-dependencies-ts
- Generated At: 2025-12-11T02:38:01.532Z

## Authored
### Purpose
Defines the shared request/response contract that powers dependency traversal over LSP—introduced while delivering the dependency quick pick in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-06-deliver-t039-dependency-quick-pick-lines-1186-1548](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-06-deliver-t039-dependency-quick-pick-lines-1186-1548).

### Notes
Server handlers (`packages/server/src/features/dependencies/inspectDependencies.ts`) and the VS Code dependency quick pick share these shapes; later wiring and integration hardening are captured in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-24-lsp--command-implementation-kickoff-lines-2701-3000](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-24-lsp--command-implementation-kickoff-lines-2701-3000), so any schema change requires coordinated updates across those surfaces and their tests.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.532Z","inputHash":"176dce59cd9be8d3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `INSPECT_DEPENDENCIES_REQUEST` {#symbol-inspect_dependencies_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/dependencies.ts#L3)

#### `InspectDependenciesParams` {#symbol-inspectdependenciesparams}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/dependencies.ts#L5)

#### `DependencyGraphEdge` {#symbol-dependencygraphedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/dependencies.ts#L16)

#### `InspectDependenciesSummary` {#symbol-inspectdependenciessummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/dependencies.ts#L28)

#### `InspectDependenciesResult` {#symbol-inspectdependenciesresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/dependencies.ts#L33)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact) (type-only)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
<!-- LIVE-DOC:END Dependencies -->
