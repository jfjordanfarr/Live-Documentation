# packages/server/src/runtime/changeProcessor.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/runtime/changeProcessor.ts
- Live Doc ID: LD-implementation-packages-server-src-runtime-changeprocessor-ts
- Generated At: 2025-12-05T04:16:19.064Z

## Authored
### Purpose
Coordinates the runtime pipeline that drains `changeQueue`, persists document/code edits, and republishes diagnostics—work extracted from `main.ts` during the runtime modularisation in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-10-option-review--runtime-modularization-commit-lines-2526-3070](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-10-option-review--runtime-modularization-commit-lines-2526-3070) and extended with ripple analysis in Turn 11 of that same log.

### Notes
Acknowledgement gating, hysteresis, and ripple-aware publishing were added the following day—see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-06-acknowledgement-hysteresis--diagnostic-replay-lines-601-1220](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-21.SUMMARIZED.md#turn-06-acknowledgement-hysteresis--diagnostic-replay-lines-601-1220)—so any refactor must keep the sequencing between acknowledgement service, hysteresis controller, and ripple analyzer intact to avoid “stale diagnostic” regressions.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.064Z","inputHash":"c3ba25c705a6cd0a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ChangeProcessorContext` {#symbol-changeprocessorcontext}
- Type: interface
- Source: [source](../../../../../../packages/server/src/runtime/changeProcessor.ts#L28)

#### `ChangeProcessor` {#symbol-changeprocessor}
- Type: interface
- Source: [source](../../../../../../packages/server/src/runtime/changeProcessor.ts#L37)

#### `ChangeProcessorOptions` {#symbol-changeprocessoroptions}
- Type: interface
- Source: [source](../../../../../../packages/server/src/runtime/changeProcessor.ts#L42)

#### `createChangeProcessor` {#symbol-createchangeprocessor}
- Type: function
- Source: [source](../../../../../../packages/server/src/runtime/changeProcessor.ts#L51)
- Returns: `ChangeProcessor`
- Parameters: `_unnamed_`: `ChangeProcessorOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`, `KnowledgeArtifact` (type-only)
- [`changeQueue.QueuedChange`](../features/changeEvents/changeQueue.ts.mdmd.md#symbol-queuedchange) (type-only)
- [`saveCodeChange.saveCodeChange`](../features/changeEvents/saveCodeChange.ts.mdmd.md#symbol-savecodechange)
- [`saveDocumentChange.persistInferenceResult`](../features/changeEvents/saveDocumentChange.ts.mdmd.md#symbol-persistinferenceresult)
- [`saveDocumentChange.saveDocumentChange`](../features/changeEvents/saveDocumentChange.ts.mdmd.md#symbol-savedocumentchange)
- [`acknowledgementService.AcknowledgementService`](../features/diagnostics/acknowledgementService.ts.mdmd.md#symbol-acknowledgementservice) (type-only)
- [`diagnosticUtils.DiagnosticSender`](../features/diagnostics/diagnosticUtils.ts.mdmd.md#symbol-diagnosticsender) (type-only)
- [`hysteresisController.HysteresisController`](../features/diagnostics/hysteresisController.ts.mdmd.md#symbol-hysteresiscontroller) (type-only)
- [`publishCodeDiagnostics.CodeChangeContext`](../features/diagnostics/publishCodeDiagnostics.ts.mdmd.md#symbol-codechangecontext)
- [`publishCodeDiagnostics.publishCodeDiagnostics`](../features/diagnostics/publishCodeDiagnostics.ts.mdmd.md#symbol-publishcodediagnostics)
- [`publishDocDiagnostics.DocumentChangeContext`](../features/diagnostics/publishDocDiagnostics.ts.mdmd.md#symbol-documentchangecontext)
- [`publishDocDiagnostics.publishDocDiagnostics`](../features/diagnostics/publishDocDiagnostics.ts.mdmd.md#symbol-publishdocdiagnostics)
- [`rippleTypes.RippleImpact`](../features/diagnostics/rippleTypes.ts.mdmd.md#symbol-rippleimpact) (type-only)
- [`rippleAnalyzer.RippleAnalyzer`](../features/knowledge/rippleAnalyzer.ts.mdmd.md#symbol-rippleanalyzer)
- [`providerGuard.ProviderGuard`](../features/settings/providerGuard.ts.mdmd.md#symbol-providerguard) (type-only)
- [`settingsBridge.RuntimeSettings`](../features/settings/settingsBridge.ts.mdmd.md#symbol-runtimesettings) (type-only)
- [`uri.normalizeFileUri`](../features/utils/uri.ts.mdmd.md#symbol-normalizefileuri)
- [`artifactWatcher.ArtifactWatcher`](../features/watchers/artifactWatcher.ts.mdmd.md#symbol-artifactwatcher)
- [`artifactWatcher.CodeTrackedArtifactChange`](../features/watchers/artifactWatcher.ts.mdmd.md#symbol-codetrackedartifactchange)
- [`artifactWatcher.DocumentTrackedArtifactChange`](../features/watchers/artifactWatcher.ts.mdmd.md#symbol-documenttrackedartifactchange)
- [`environment.describeError`](./environment.ts.mdmd.md#symbol-describeerror)
- [`llmIngestion.LlmIngestionManager`](./llmIngestion.ts.mdmd.md#symbol-llmingestionmanager) (type-only)
- [`latencyTracker.LatencyTracker`](../telemetry/latencyTracker.ts.mdmd.md#symbol-latencytracker) (type-only)
- `vscode-languageserver/node` - `Connection` (type-only)
<!-- LIVE-DOC:END Dependencies -->
