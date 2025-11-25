# packages/extension/src/views/diagnosticsTree.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/views/diagnosticsTree.ts
- Live Doc ID: LD-implementation-packages-extension-src-views-diagnosticstree-ts
- Generated At: 2025-11-24T15:19:58.388Z

## Authored
### Purpose
Hosts the Link-Aware Diagnostics tree view, listing outstanding issues and acknowledgement actions via the `DiagnosticsTreeDataProvider` introduced alongside the acknowledgement service in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-06-acknowledgement-hysteresis--diagnostic-replay-lines-601-1220](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-06-acknowledgement-hysteresis--diagnostic-replay-lines-601-1220).

### Notes
AI summaries and confidence ribbons were threaded into this tree during the Analyze-with-AI rollout—see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1728-L1774](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-26.md#L1728-L1774)—so updates to the data model must stay aligned with `LlmInvoker` payloads and `exportDiagnostics.ts` to keep UI parity.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.388Z","inputHash":"286e3e2fbc213d28"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `TreeNode` {#symbol-treenode}
- Type: type
- Source: [source](../../../../../../packages/extension/src/views/diagnosticsTree.ts#L12)

#### `DiagnosticsTreeDataProvider` {#symbol-diagnosticstreedataprovider}
- Type: class
- Source: [source](../../../../../../packages/extension/src/views/diagnosticsTree.ts#L27)

#### `isDiagnosticNode` {#symbol-isdiagnosticnode}
- Type: function
- Source: [source](../../../../../../packages/extension/src/views/diagnosticsTree.ts#L248)

#### `buildTreeAcknowledgementArgs` {#symbol-buildtreeacknowledgementargs}
- Type: function
- Source: [source](../../../../../../packages/extension/src/views/diagnosticsTree.ts#L252)

#### `DiagnosticsTreeRegistration` {#symbol-diagnosticstreeregistration}
- Type: interface
- Source: [source](../../../../../../packages/extension/src/views/diagnosticsTree.ts#L267)

#### `registerDiagnosticsTreeView` {#symbol-registerdiagnosticstreeview}
- Type: function
- Source: [source](../../../../../../packages/extension/src/views/diagnosticsTree.ts#L271)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `LIST_OUTSTANDING_DIAGNOSTICS_REQUEST`, `ListOutstandingDiagnosticsResult`, `OutstandingDiagnosticSummary`
- [`acknowledgeDiagnostic.ACKNOWLEDGE_DIAGNOSTIC_COMMAND`](../commands/acknowledgeDiagnostic.ts.mdmd.md#symbol-acknowledge_diagnostic_command)
- `vscode` - `vscode`
- `vscode-languageclient/node` - `LanguageClient`
<!-- LIVE-DOC:END Dependencies -->
