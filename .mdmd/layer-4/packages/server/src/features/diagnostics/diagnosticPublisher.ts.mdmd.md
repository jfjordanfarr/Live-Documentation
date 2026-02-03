# packages/server/src/features/diagnostics/diagnosticPublisher.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/diagnostics/diagnosticPublisher.ts
- Live Doc ID: LD-implementation-packages-server-src-features-diagnostics-diagnosticpublisher-ts
- Generated At: 2026-02-03T21:55:37.460Z

## Authored
### Purpose
Caches and republishes diagnostics over the LSP connection, enabling incremental document reports for the pipeline launched in [2025-10-17 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md).

### Notes
- Tracks result IDs per URI so acknowledgement removals and re-queries stay consistent with VS Code’s diagnostic pull protocol.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:37.460Z","inputHash":"b708af188f6b196f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DiagnosticPublisher` {#symbol-diagnosticpublisher}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/diagnostics/diagnosticPublisher.ts#L17)
- Implements: [`DiagnosticSender`](./diagnosticUtils.ts.mdmd.md#symbol-diagnosticsender)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`diagnosticUtils.DiagnosticSender`](./diagnosticUtils.ts.mdmd.md#symbol-diagnosticsender) (type-only)
- `vscode-languageserver/node` - `Connection`, `Diagnostic`, `DocumentDiagnosticReport`, `DocumentDiagnosticReportKind`, `PublishDiagnosticsParams`
<!-- LIVE-DOC:END Dependencies -->
