# packages/server/src/features/diagnostics/listOutstandingDiagnostics.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/diagnostics/listOutstandingDiagnostics.ts
- Live Doc ID: LD-implementation-packages-server-src-features-diagnostics-listoutstandingdiagnostics-ts
- Generated At: 2025-12-05T15:37:23.524Z

## Authored
### Purpose
Transforms persisted diagnostic records into Explorer-friendly summaries for the diagnostics tree view, as implemented during the Oct 21 UI integration in [2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md).

### Notes
- Resolves trigger/target artifacts on demand so the tree view stays synchronized with the GraphStore even as acknowledgements arrive.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:23.524Z","inputHash":"a1028e26597af7af"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildOutstandingDiagnosticsResult` {#symbol-buildoutstandingdiagnosticsresult}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/listOutstandingDiagnostics.ts#L9)
- Returns: [`ListOutstandingDiagnosticsResult`](../../../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-listoutstandingdiagnosticsresult)
- Parameters: `records`: [`DiagnosticRecord`](../../../../shared/src/domain/artifacts.ts.mdmd.md#symbol-diagnosticrecord)[]; `store`: [`GraphStore`](../../../../shared/src/db/graphStore.ts.mdmd.md#symbol-graphstore)

#### `mapOutstandingDiagnostic` {#symbol-mapoutstandingdiagnostic}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/listOutstandingDiagnostics.ts#L22)
- Returns: [`OutstandingDiagnosticSummary`](../../../../shared/src/contracts/diagnostics.ts.mdmd.md#symbol-outstandingdiagnosticsummary)
- Parameters: `record`: [`DiagnosticRecord`](../../../../shared/src/domain/artifacts.ts.mdmd.md#symbol-diagnosticrecord); `store`: [`GraphStore`](../../../../shared/src/db/graphStore.ts.mdmd.md#symbol-graphstore)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `DiagnosticRecord`, `GraphStore`, `KnowledgeArtifact`, `ListOutstandingDiagnosticsResult`, `OutstandingDiagnosticSummary`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [listOutstandingDiagnostics.test.ts](./listOutstandingDiagnostics.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
