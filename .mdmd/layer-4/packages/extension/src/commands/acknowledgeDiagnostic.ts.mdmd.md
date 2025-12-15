# packages/extension/src/commands/acknowledgeDiagnostic.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/extension/src/commands/acknowledgeDiagnostic.ts
- Live Doc ID: LD-implementation-packages-extension-src-commands-acknowledgediagnostic-ts
- Generated At: 2025-12-15T00:38:05.825Z

## Authored
### Purpose
Registers `linkDiagnostics.acknowledgeDiagnostic` so leads can clear acknowledged ripple/doc diagnostics directly from VS Code, completing the T042/T043 workflow described in Turn 21 of [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-21-extension-acknowledgement-command-lines-4101-4585](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-21-extension-acknowledgement-command-lines-4101-4585).

### Notes
- The Oct 21 log captures the quick-fix wiring, record/target/trigger metadata plumbing, and centralized command identifier for this workflow; see [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L3560-L3645](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md#L3560-L3645).
- Keep the command signature aligned with the acknowledgement service contract so integration tests continue to assert end-to-end pruning, per [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-22-integration-test-for-acknowledgement-flow-lines-4101-4585](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-22-integration-test-for-acknowledgement-flow-lines-4101-4585).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:05.825Z","inputHash":"4a95e5fbf2b94031"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ACKNOWLEDGE_DIAGNOSTIC_COMMAND` {#symbol-acknowledge_diagnostic_command}
- Type: const
- Source: [source](../../../../../../packages/extension/src/commands/acknowledgeDiagnostic.ts#L12)

#### `AcknowledgementWorkflowOptions` {#symbol-acknowledgementworkflowoptions}
- Type: interface
- Source: [source](../../../../../../packages/extension/src/commands/acknowledgeDiagnostic.ts#L20)

#### `registerAcknowledgementWorkflow` {#symbol-registeracknowledgementworkflow}
- Type: function
- Source: [source](../../../../../../packages/extension/src/commands/acknowledgeDiagnostic.ts#L24)
- Returns: `vscode.Disposable`
- Parameters: `client`: `LanguageClient`; `options`: [`AcknowledgementWorkflowOptions`](#symbol-acknowledgementworkflowoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`index.ACKNOWLEDGE_DIAGNOSTIC_REQUEST`](../../../shared/src/index.ts.mdmd.md#symbol-acknowledge_diagnostic_request)
- [`index.AcknowledgeDiagnosticParams`](../../../shared/src/index.ts.mdmd.md#symbol-acknowledgediagnosticparams)
- [`index.AcknowledgeDiagnosticResult`](../../../shared/src/index.ts.mdmd.md#symbol-acknowledgediagnosticresult)
- [`index.DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION`](../../../shared/src/index.ts.mdmd.md#symbol-diagnostic_acknowledged_notification)
- [`index.DiagnosticAcknowledgedPayload`](../../../shared/src/index.ts.mdmd.md#symbol-diagnosticacknowledgedpayload)
- `vscode` - `vscode`
- `vscode-languageclient/node` - `LanguageClient`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [docDiagnosticProvider.test.ts](../diagnostics/docDiagnosticProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
