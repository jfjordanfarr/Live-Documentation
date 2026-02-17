# packages/shared/src/contracts/diagnostics.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/diagnostics.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-diagnostics-ts
- Generated At: 2026-02-17T22:06:07.981Z

## Authored
### Purpose
Collects the Live Diagnostics LSP contracts—acknowledgement, outstanding diagnostics, assessments, export, and feed readiness—added while delivering the acknowledgement service in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-20-implement-t043-acknowledgement-service-lines-4101-4585-continued](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-20-implement-t043-acknowledgement-service-lines-4101-4585-continued).

### Notes
Feed readiness telemetry and export workflows extend these shapes; see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-06-better-sqlite3-rebuild-discipline--feed-readiness-lines-2801-3600](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-06-better-sqlite3-rebuild-discipline--feed-readiness-lines-2801-3600) for the readiness gating and [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-23-documentation-expansion-lines-2581-2700](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-23-documentation-expansion-lines-2581-2700) for the drift-history acknowledgement hardening that depends on this contract.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T22:06:07.981Z","inputHash":"480431dac460d258"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ACKNOWLEDGE_DIAGNOSTIC_REQUEST` {#symbol-acknowledge_diagnostic_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L23)

##### `ACKNOWLEDGE_DIAGNOSTIC_REQUEST` — Summary
LSP method for acknowledging (dismissing) a single diagnostic record.

#### `AcknowledgeDiagnosticParams` {#symbol-acknowledgediagnosticparams}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L26)

##### `AcknowledgeDiagnosticParams` — Summary
Parameters for {@link ACKNOWLEDGE_DIAGNOSTIC_REQUEST}.

#### `AcknowledgeDiagnosticStatus` {#symbol-acknowledgediagnosticstatus}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L33)

##### `AcknowledgeDiagnosticStatus` — Summary
Possible outcomes when acknowledging a diagnostic.

#### `AcknowledgeDiagnosticResult` {#symbol-acknowledgediagnosticresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L36)

##### `AcknowledgeDiagnosticResult` — Summary
Response payload for {@link ACKNOWLEDGE_DIAGNOSTIC_REQUEST}.

#### `DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION` {#symbol-diagnostic_acknowledged_notification}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L46)

##### `DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION` — Summary
Server → client notification sent after a diagnostic is acknowledged.

#### `DiagnosticAcknowledgedPayload` {#symbol-diagnosticacknowledgedpayload}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L49)

##### `DiagnosticAcknowledgedPayload` — Summary
Payload for {@link DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION}.

#### `RESET_DIAGNOSTIC_STATE_NOTIFICATION` {#symbol-reset_diagnostic_state_notification}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L63)

##### `RESET_DIAGNOSTIC_STATE_NOTIFICATION` — Summary
Server → client notification requesting a full diagnostic state reset
(e.g. after a feed reconnection or sqlite rebuild).

#### `LIST_OUTSTANDING_DIAGNOSTICS_REQUEST` {#symbol-list_outstanding_diagnostics_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L66)

##### `LIST_OUTSTANDING_DIAGNOSTICS_REQUEST` — Summary
LSP method for listing all outstanding (unresolved) diagnostics.

#### `DiagnosticArtifactSummary` {#symbol-diagnosticartifactsummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L69)

##### `DiagnosticArtifactSummary` — Summary
Lightweight artifact summary embedded in each outstanding diagnostic.

#### `OutstandingDiagnosticSummary` {#symbol-outstandingdiagnosticsummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L77)

##### `OutstandingDiagnosticSummary` — Summary
A single outstanding diagnostic record as returned by the list request.

#### `ListOutstandingDiagnosticsResult` {#symbol-listoutstandingdiagnosticsresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L92)

##### `ListOutstandingDiagnosticsResult` — Summary
Response payload for {@link LIST_OUTSTANDING_DIAGNOSTICS_REQUEST}.

#### `SET_DIAGNOSTIC_ASSESSMENT_REQUEST` {#symbol-set_diagnostic_assessment_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L102)

##### `SET_DIAGNOSTIC_ASSESSMENT_REQUEST` — Summary
LSP method for attaching an LLM assessment to a diagnostic record.

#### `SetDiagnosticAssessmentParams` {#symbol-setdiagnosticassessmentparams}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L105)

##### `SetDiagnosticAssessmentParams` — Summary
Parameters for {@link SET_DIAGNOSTIC_ASSESSMENT_REQUEST}.

#### `SetDiagnosticAssessmentResult` {#symbol-setdiagnosticassessmentresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L111)

##### `SetDiagnosticAssessmentResult` — Summary
Response payload for {@link SET_DIAGNOSTIC_ASSESSMENT_REQUEST}.

#### `EXPORT_DIAGNOSTICS_REQUEST` {#symbol-export_diagnostics_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L118)

##### `EXPORT_DIAGNOSTICS_REQUEST` — Summary
LSP method for exporting all diagnostics as markdown or JSON.

#### `ExportDiagnosticsResult` {#symbol-exportdiagnosticsresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L121)

##### `ExportDiagnosticsResult` — Summary
Response payload for {@link EXPORT_DIAGNOSTICS_REQUEST}.

#### `FEEDS_READY_REQUEST` {#symbol-feeds_ready_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L133)

##### `FEEDS_READY_REQUEST` — Summary
LSP method to query whether diagnostic feeds are ready.

#### `FeedsReadyResult` {#symbol-feedsreadyresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/diagnostics.ts#L136)

##### `FeedsReadyResult` — Summary
Response payload for {@link FEEDS_READY_REQUEST}.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.LlmAssessment`](../domain/artifacts.ts.mdmd.md#symbol-llmassessment) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [exportDiagnostics.test.ts](../../../extension/src/commands/exportDiagnostics.test.ts.mdmd.md)
- [docDiagnosticProvider.test.ts](../../../extension/src/diagnostics/docDiagnosticProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
