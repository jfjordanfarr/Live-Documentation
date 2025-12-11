# packages/shared/src/contracts/symbols.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/symbols.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-symbols-ts
- Generated At: 2025-12-11T02:38:01.556Z

## Authored
### Purpose
Defines the shared LSP contracts (`collectWorkspaceSymbols`, `inspectSymbolNeighbors`) that power the symbol-ingestion pipeline delivered in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-03-hydrate-for-t035-symbol-ingestion-lines-361-686](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-03-hydrate-for-t035-symbol-ingestion-lines-361-686), giving the server and extension a common vocabulary for symbol queries.

### Notes
Later symbol-neighbor work (server provider + quick pick) depends on these shapes—see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-24-lsp--command-implementation-kickoff-lines-2701-3000](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-24-lsp--command-implementation-kickoff-lines-2701-3000)—so any schema changes must ripple through both the server handlers and extension consumers in lockstep.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.556Z","inputHash":"6fde1f6f0e360794"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `COLLECT_WORKSPACE_SYMBOLS_REQUEST` {#symbol-collect_workspace_symbols_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L5)

#### `CollectWorkspaceSymbolsParams` {#symbol-collectworkspacesymbolsparams}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L7)

#### `CollectWorkspaceSymbolsResultSummary` {#symbol-collectworkspacesymbolsresultsummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L16)

#### `CollectWorkspaceSymbolsResult` {#symbol-collectworkspacesymbolsresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L23)

#### `INSPECT_SYMBOL_NEIGHBORS_REQUEST` {#symbol-inspect_symbol_neighbors_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L28)

#### `InspectSymbolNeighborsParams` {#symbol-inspectsymbolneighborsparams}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L30)

#### `SymbolNeighborPath` {#symbol-symbolneighborpath}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L43)

#### `SymbolNeighborNode` {#symbol-symbolneighbornode}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L47)

#### `SymbolNeighborGroup` {#symbol-symbolneighborgroup}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L57)

#### `InspectSymbolNeighborsSummary` {#symbol-inspectsymbolneighborssummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L62)

#### `InspectSymbolNeighborsResult` {#symbol-inspectsymbolneighborsresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/symbols.ts#L67)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact) (type-only)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
- [`fallbackInference.ArtifactSeed`](../inference/fallbackInference.ts.mdmd.md#symbol-artifactseed) (type-only)
- [`linkInference.WorkspaceLinkContribution`](../inference/linkInference.ts.mdmd.md#symbol-workspacelinkcontribution) (type-only)
<!-- LIVE-DOC:END Dependencies -->
