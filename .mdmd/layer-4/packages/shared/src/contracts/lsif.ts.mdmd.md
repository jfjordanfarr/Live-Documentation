# packages/shared/src/contracts/lsif.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/lsif.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-lsif-ts
- Generated At: 2025-12-07T21:41:18.909Z

## Authored
### Purpose
Provides TypeScript typings for LSIF vertices, edges, and index metadata so the shared parser can hydrate code-intelligence feeds—created alongside the LSIF/SCIP ingestion work in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-04-option-b-kickoff--lsifscip-ingestion-lines-1181-1950](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-04-option-b-kickoff--lsifscip-ingestion-lines-1181-1950).

### Notes
The feed-format detector and `lsifParser.ts` rely on these labels staying in sync with the LSIF 0.6 spec; see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-05-integration-harness--workspace-index-overhaul-lines-1951-2800](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-05-integration-harness--workspace-index-overhaul-lines-1951-2800) for the follow-on parser hardening this contract supports.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:18.909Z","inputHash":"655840303067aa95"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LSIFVertexLabel` {#symbol-lsifvertexlabel}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L9)

##### `LSIFVertexLabel` — Summary
TypeScript interfaces for LSIF (Language Server Index Format) data structures.
LSIF is a graph-based index format for code intelligence that captures symbols,
definitions, references, and their relationships.

Spec: https://microsoft.github.io/language-server-protocol/specifications/lsif/0.6.0/specification/

#### `LSIFEdgeLabel` {#symbol-lsifedgelabel}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L20)

#### `LSIFElement` {#symbol-lsifelement}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L28)

#### `LSIFVertex` {#symbol-lsifvertex}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L34)
- Extends: [`LSIFElement`](#symbol-lsifelement)

#### `LSIFEdge` {#symbol-lsifedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L38)
- Extends: [`LSIFElement`](#symbol-lsifelement)

#### `LSIFMetaData` {#symbol-lsifmetadata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L44)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFProject` {#symbol-lsifproject}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L55)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFDocument` {#symbol-lsifdocument}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L62)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFRange` {#symbol-lsifrange}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L69)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFResultSet` {#symbol-lsifresultset}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L90)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFDefinitionResult` {#symbol-lsifdefinitionresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L94)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFReferenceResult` {#symbol-lsifreferenceresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L98)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFContainsEdge` {#symbol-lsifcontainsedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L102)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFItemEdge` {#symbol-lsifitemedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L107)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFNextEdge` {#symbol-lsifnextedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L113)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFDefinitionEdge` {#symbol-lsifdefinitionedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L117)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFReferencesEdge` {#symbol-lsifreferencesedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L121)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFEntry` {#symbol-lsifentry}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L128)
- Returns: [`LSIFMetaData`](#symbol-lsifmetadata), [`LSIFProject`](#symbol-lsifproject), [`LSIFDocument`](#symbol-lsifdocument), [`LSIFRange`](#symbol-lsifrange), [`LSIFResultSet`](#symbol-lsifresultset), [`LSIFDefinitionResult`](#symbol-lsifdefinitionresult), [`LSIFReferenceResult`](#symbol-lsifreferenceresult), [`LSIFContainsEdge`](#symbol-lsifcontainsedge), [`LSIFItemEdge`](#symbol-lsifitemedge), [`LSIFNextEdge`](#symbol-lsifnextedge), [`LSIFDefinitionEdge`](#symbol-lsifdefinitionedge), [`LSIFReferencesEdge`](#symbol-lsifreferencesedge), [`LSIFVertex`](#symbol-lsifvertex), [`LSIFEdge`](#symbol-lsifedge)

##### `LSIFEntry` — Summary
LSIF dump is a newline-delimited JSON stream where each line is a vertex or edge

#### `ParsedLSIFIndex` {#symbol-parsedlsifindex}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L143)
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
- [artifactWatcher.test.ts](../../../server/src/features/watchers/artifactWatcher.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [environment.test.ts](../../../server/src/runtime/environment.test.ts.mdmd.md)
- [settings.test.ts](../../../server/src/runtime/settings.test.ts.mdmd.md)
- [latencyTracker.test.ts](../../../server/src/telemetry/latencyTracker.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
