# packages/extension/src/services/symbolBridge.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/services/symbolBridge.ts
- Live Doc ID: LD-implementation-packages-extension-src-services-symbolbridge-ts
- Generated At: 2026-01-15T02:41:18.285Z

## Authored
### Purpose
Implements the T035 workspace-symbol bridge so the extension can satisfy `COLLECT_WORKSPACE_SYMBOLS_REQUEST` by harvesting VS Code symbol references into ripple hints/seeds for the language server, as shipped in Turn 04 of the Oct 20 build push in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-04-implement-symbol-bridge--commit-lines-687-941](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-04-implement-symbol-bridge--commit-lines-687-941).

### Notes
- Exported `SymbolBridgeAnalyzer` for direct unit coverage while preserving activation behaviour, and documented the harness follow-ups in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L920-L949](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L920-L949); keep the analyzer API stable so the tests and integration plan remain valid.
- Maintain the MAX_* limits and workspace-symbols provenance to stay aligned with the ripple diagnostics gating discussed there - future tuning should coordinate with the server's symbolBridgeProvider before widening caps.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.285Z","inputHash":"0d3e17cd3095cfa2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `registerSymbolBridge` {#symbol-registersymbolbridge}
- Type: function
- Source: [source](../../../../../../packages/extension/src/services/symbolBridge.ts#L69)
- Returns: `vscode.Disposable`
- Parameters: `client`: `LanguageClient`

#### `SymbolBridgeAnalyzer` {#symbol-symbolbridgeanalyzer}
- Type: class
- Source: [source](../../../../../../packages/extension/src/services/symbolBridge.ts#L80)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.ArtifactSeed`](../../../shared/src/index.ts.mdmd.md#symbol-artifactseed)
- [`index.COLLECT_WORKSPACE_SYMBOLS_REQUEST`](../../../shared/src/index.ts.mdmd.md#symbol-collect_workspace_symbols_request)
- [`index.LinkEvidence`](../../../shared/src/index.ts.mdmd.md#symbol-linkevidence)
- [`index.RelationshipHint`](../../../shared/src/index.ts.mdmd.md#symbol-relationshiphint)
- [`index.WorkspaceLinkContribution`](../../../shared/src/index.ts.mdmd.md#symbol-workspacelinkcontribution)
- `vscode`
- `vscode-languageclient/node` - `LanguageClient`
- `zod` - `z`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [symbolBridge.test.ts](./symbolBridge.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
