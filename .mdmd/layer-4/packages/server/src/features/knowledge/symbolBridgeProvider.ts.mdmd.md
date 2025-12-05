# packages/server/src/features/knowledge/symbolBridgeProvider.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/symbolBridgeProvider.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-symbolbridgeprovider-ts
- Generated At: 2025-12-05T15:37:24.036Z

## Authored
### Purpose
Connects the language server to client-side symbol analysis by forwarding queued seeds over `COLLECT_WORKSPACE_SYMBOLS_REQUEST` and validating the response before merging contributions into the knowledge graph.

### Notes
- Introduced with the Oct 20 knowledge ingestion spike (see [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md)) to bridge workspace symbol data back into the server.
- Layer-4 rationale refreshed during the Oct 30 metadata audit (see [2025-10-30 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md)), reinforcing logging and schema validation expectations.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:24.036Z","inputHash":"19f655b331804b62"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createSymbolBridgeProvider` {#symbol-createsymbolbridgeprovider}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/symbolBridgeProvider.ts#L19)
- Returns: [`WorkspaceLinkProvider`](../../../../shared/src/inference/linkInference.ts.mdmd.md#symbol-workspacelinkprovider)
- Parameters: `options`: `SymbolBridgeProviderOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `COLLECT_WORKSPACE_SYMBOLS_REQUEST`, `CollectWorkspaceSymbolsParams`, `WorkspaceLinkProvider`
- `vscode-languageserver/node` - `Connection`
- `zod` - `z`
<!-- LIVE-DOC:END Dependencies -->
