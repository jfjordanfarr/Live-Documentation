# packages/extension/src/commands/inspectSymbolNeighbors.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/commands/inspectSymbolNeighbors.ts
- Live Doc ID: LD-implementation-packages-extension-src-commands-inspectsymbolneighbors-ts
- Generated At: 2025-12-05T04:16:16.943Z

## Authored
### Purpose
Provides the US4 “Inspect Symbol Neighbors” palette command that calls `INSPECT_SYMBOL_NEIGHBORS_REQUEST`, groups inbound/outbound edges, and lets maintainers pivot from the active symbol to related artifacts inside VS Code, as delivered on Oct 23 in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-24-lsp--command-implementation-kickoff-lines-2701-3000](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-24-lsp--command-implementation-kickoff-lines-2701-3000).

### Notes
- Integration stability required dedicated test hooks so the quick pick could be automated; the harness swaps in stubbed `showQuickPick`/`showInformationMessage` calls per [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L5240-L5264](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-23.md#L5240-L5264).
- Once the stubs landed, `npm run verify` completed end to end and the command shipped as part of commit 558781b (`feat: ship symbol neighbor explorer and harden graph persistence`), confirmed in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L2880-L2944](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L2880-L2944).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:16.943Z","inputHash":"11c6160bbcde27dc"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `registerInspectSymbolNeighborsCommand` {#symbol-registerinspectsymbolneighborscommand}
- Type: function
- Source: [source](../../../../../../packages/extension/src/commands/inspectSymbolNeighbors.ts#L28)
- Returns: `vscode.Disposable`
- Parameters: `client`: `LanguageClient`

#### `SymbolNeighborQuickPickController` {#symbol-symbolneighborquickpickcontroller}
- Type: class
- Source: [source](../../../../../../packages/extension/src/commands/inspectSymbolNeighbors.ts#L39)

#### `ParsedInspectSymbolNeighborsResult` {#symbol-parsedinspectsymbolneighborsresult}
- Type: type
- Source: [source](../../../../../../packages/extension/src/commands/inspectSymbolNeighbors.ts#L251)
- Returns: `z.infer`

#### `ParsedNeighborNode` {#symbol-parsedneighbornode}
- Type: type
- Source: [source](../../../../../../packages/extension/src/commands/inspectSymbolNeighbors.ts#L254)
- Returns: `z.infer`

#### `InspectSymbolNeighborsResultValidator` {#symbol-inspectsymbolneighborsresultvalidator}
- Type: const
- Source: [source](../../../../../../packages/extension/src/commands/inspectSymbolNeighbors.ts#L256)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `INSPECT_SYMBOL_NEIGHBORS_REQUEST`, `InspectSymbolNeighborsParams`
- [`artifactSchemas.KnowledgeArtifactSchema`](../shared/artifactSchemas.ts.mdmd.md#symbol-knowledgeartifactschema)
- [`artifactSchemas.LinkRelationshipKindSchema`](../shared/artifactSchemas.ts.mdmd.md#symbol-linkrelationshipkindschema)
- [`testHooks.resolveWindowApis`](../testing/testHooks.ts.mdmd.md#symbol-resolvewindowapis)
- `vscode` - `vscode`
- `vscode-languageclient/node` - `LanguageClient`
- `zod` - `z`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [inspectSymbolNeighbors.test.ts](./inspectSymbolNeighbors.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
