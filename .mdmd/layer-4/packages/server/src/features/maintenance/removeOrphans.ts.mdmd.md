# packages/server/src/features/maintenance/removeOrphans.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/maintenance/removeOrphans.ts
- Live Doc ID: LD-implementation-packages-server-src-features-maintenance-removeorphans-ts
- Generated At: 2025-12-15T00:38:06.573Z

## Authored
### Purpose
Emits maintenance diagnostics and rebind notifications when tracked artifacts are deleted or renamed so downstream documentation can repair links and the graph store drops stale nodes.

### Notes
- Implemented during the initial maintenance pass that delivered delete/rename recovery (spec tasks T020–T021) documented in [2025-10-16 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md).
- Layer-4 coverage extended as part of the diagnostics pipeline brief noted in [2025-10-21 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.573Z","inputHash":"50a8c49bd2d5388d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `handleArtifactDeleted` {#symbol-handleartifactdeleted}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/maintenance/removeOrphans.ts#L16)
- Parameters: `connection`: `Connection`; `store`: [`GraphStore`](../../../../shared/src/db/graphStore.ts.mdmd.md#symbol-graphstore); `diagnostics`: [`DiagnosticSender`](../diagnostics/diagnosticUtils.ts.mdmd.md#symbol-diagnosticsender)

#### `handleArtifactRenamed` {#symbol-handleartifactrenamed}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/maintenance/removeOrphans.ts#L25)
- Parameters: `connection`: `Connection`; `store`: [`GraphStore`](../../../../shared/src/db/graphStore.ts.mdmd.md#symbol-graphstore); `diagnostics`: [`DiagnosticSender`](../diagnostics/diagnosticUtils.ts.mdmd.md#symbol-diagnosticsender)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`diagnosticUtils.DiagnosticSender`](../diagnostics/diagnosticUtils.ts.mdmd.md#symbol-diagnosticsender)
- [`diagnosticUtils.normaliseDisplayPath`](../diagnostics/diagnosticUtils.ts.mdmd.md#symbol-normalisedisplaypath)
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
- [`index.GraphStore`](../../../../shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.LinkedArtifactSummary`](../../../../shared/src/index.ts.mdmd.md#symbol-linkedartifactsummary)
- [`index.RebindImpactedArtifact`](../../../../shared/src/index.ts.mdmd.md#symbol-rebindimpactedartifact)
- [`index.RebindReason`](../../../../shared/src/index.ts.mdmd.md#symbol-rebindreason)
- [`index.RebindRequiredPayload`](../../../../shared/src/index.ts.mdmd.md#symbol-rebindrequiredpayload)
- `vscode-languageserver/node` - `Connection`, `Diagnostic`, `DiagnosticSeverity`
<!-- LIVE-DOC:END Dependencies -->
