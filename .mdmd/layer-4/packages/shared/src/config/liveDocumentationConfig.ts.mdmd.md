# packages/shared/src/config/liveDocumentationConfig.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/config/liveDocumentationConfig.ts
- Live Doc ID: LD-implementation-packages-shared-src-config-livedocumentationconfig-ts
- Generated At: 2025-12-05T15:37:24.908Z

## Authored
### Purpose
Centralizes Live Documentation defaults—root, base layer, slug dialect, evidence strictness—so the generator, lint, and CLI flows share one configuration contract, as hardened during the Live Docs pipeline work in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md#turn-19-config--schema-hardening-lines-3561-3760).

### Notes
Default globs now cover scripts and cross-language test fixtures so Live Docs remain authoritative for integration workspaces (e.g., the LD-402 queue-worker Hangfire scenario). Keep the follow-up plan in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L3310) handy—the same switches will power future `.mdmd` mirroring and CLI overrides.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:24.908Z","inputHash":"1af8425710ad6eaa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocumentationSlugDialect` {#symbol-livedocumentationslugdialect}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L3)

#### `LiveDocumentationArchetype` {#symbol-livedocumentationarchetype}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L5)

#### `LiveDocumentationEvidenceStrictMode` {#symbol-livedocumentationevidencestrictmode}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L17)

#### `LiveDocumentationEvidenceConfig` {#symbol-livedocumentationevidenceconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L19)

#### `LiveDocumentationConfig` {#symbol-livedocumentationconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L23)

#### `LiveDocumentationConfigInput` {#symbol-livedocumentationconfiginput}
- Type: type
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L44)

#### `LIVE_DOCUMENTATION_DEFAULT_ROOT` {#symbol-live_documentation_default_root}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L48)

#### `LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER` {#symbol-live_documentation_default_base_layer}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L49)

#### `LIVE_DOCUMENTATION_FILE_EXTENSION` {#symbol-live_documentation_file_extension}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L50)

#### `LIVE_DOCUMENTATION_DEFAULT_GLOBS` {#symbol-live_documentation_default_globs}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L51)

#### `DEFAULT_LIVE_DOCUMENTATION_CONFIG` {#symbol-default_live_documentation_config}
- Type: const
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L104)
- Returns: [`LiveDocumentationConfig`](./liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationconfig)

#### `normalizeLiveDocumentationConfig` {#symbol-normalizelivedocumentationconfig}
- Type: function
- Source: [source](../../../../../../packages/shared/src/config/liveDocumentationConfig.ts#L118)
- Returns: [`LiveDocumentationConfig`](./liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationconfig)
- Parameters: `input`: [`LiveDocumentationConfigInput`](./liveDocumentationConfig.d.ts.mdmd.md#symbol-livedocumentationconfiginput)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [analyzeWithAI.test.ts](../../../extension/src/commands/analyzeWithAI.test.ts.mdmd.md)
- [exportDiagnostics.test.ts](../../../extension/src/commands/exportDiagnostics.test.ts.mdmd.md)
- [inspectSymbolNeighbors.test.ts](../../../extension/src/commands/inspectSymbolNeighbors.test.ts.mdmd.md)
- [dependencyQuickPick.test.ts](../../../extension/src/diagnostics/dependencyQuickPick.test.ts.mdmd.md)
- [docDiagnosticProvider.test.ts](../../../extension/src/diagnostics/docDiagnosticProvider.test.ts.mdmd.md)
- [localOllamaBridge.test.ts](../../../extension/src/services/localOllamaBridge.test.ts.mdmd.md)
- [symbolBridge.test.ts](../../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [saveCodeChange.test.ts](../../../server/src/features/changeEvents/saveCodeChange.test.ts.mdmd.md)
- [saveDocumentChange.test.ts](../../../server/src/features/changeEvents/saveDocumentChange.test.ts.mdmd.md)
- [inspectDependencies.test.ts](../../../server/src/features/dependencies/inspectDependencies.test.ts.mdmd.md)
- [symbolNeighbors.test.ts](../../../server/src/features/dependencies/symbolNeighbors.test.ts.mdmd.md)
- [acknowledgementService.test.ts](../../../server/src/features/diagnostics/acknowledgementService.test.ts.mdmd.md)
- [listOutstandingDiagnostics.test.ts](../../../server/src/features/diagnostics/listOutstandingDiagnostics.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [publishDocDiagnostics.test.ts](../../../server/src/features/diagnostics/publishDocDiagnostics.test.ts.mdmd.md)
- [feedFormatDetector.test.ts](../../../server/src/features/knowledge/feedFormatDetector.test.ts.mdmd.md)
- [knowledgeFeedManager.test.ts](../../../server/src/features/knowledge/knowledgeFeedManager.test.ts.mdmd.md)
- [knowledgeGraphBridge.test.ts](../../../server/src/features/knowledge/knowledgeGraphBridge.test.ts.mdmd.md)
- [knowledgeGraphIngestor.test.ts](../../../server/src/features/knowledge/knowledgeGraphIngestor.test.ts.mdmd.md)
- [llmIngestionOrchestrator.test.ts](../../../server/src/features/knowledge/llmIngestionOrchestrator.test.ts.mdmd.md)
- [lsifParser.test.ts](../../../server/src/features/knowledge/lsifParser.test.ts.mdmd.md)
- [rippleAnalyzer.test.ts](../../../server/src/features/knowledge/rippleAnalyzer.test.ts.mdmd.md)
- [scipParser.test.ts](../../../server/src/features/knowledge/scipParser.test.ts.mdmd.md)
- [workspaceIndexProvider.test.ts](../../../server/src/features/knowledge/workspaceIndexProvider.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [artifactWatcher.test.ts](../../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [environment.test.ts](../../../server/src/runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../../server/src/runtime/settings.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
- [liveDocumentationConfig.test.ts](./liveDocumentationConfig.test.ts.mdmd.md)
- [aspnet.test.ts](../live-docs/adapters/aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](../live-docs/adapters/c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](../live-docs/adapters/csharp.hangfire.test.ts.mdmd.md)
- [powershell.test.ts](../live-docs/adapters/powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](../live-docs/adapters/python.docstring.test.ts.mdmd.md)
- [ruby.docstring.test.ts](../live-docs/adapters/ruby.docstring.test.ts.mdmd.md)
- [rust.docstring.test.ts](../live-docs/adapters/rust.docstring.test.ts.mdmd.md)
- [coActivation.test.ts](../live-docs/analysis/coActivation.test.ts.mdmd.md)
- [core.docstring.test.ts](../live-docs/core.docstring.test.ts.mdmd.md)
- [generator.test.ts](../live-docs/generator.test.ts.mdmd.md)
- [schema.test.ts](../live-docs/schema.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
