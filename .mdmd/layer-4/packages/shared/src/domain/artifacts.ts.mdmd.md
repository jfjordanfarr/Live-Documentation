# packages/shared/src/domain/artifacts.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/domain/artifacts.ts
- Live Doc ID: LD-implementation-packages-shared-src-domain-artifacts-ts
- Generated At: 2025-12-11T02:38:01.585Z

## Authored
### Purpose
Defines the cross-layer knowledge-graph domain model—artifacts, links, diagnostics, acknowledgements, drift history—that the GraphStore, server features, and extension commands rely on, originally scaffolded during the implementation bootstrap captured in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523).

### Notes
Confidence tiers and drift-history additions arrived alongside the October 23–24 persistence and LLM-ingestion passes, keeping telemetry and ingestion schemas aligned; see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-14-graphstore-enhancements--status-check-lines-1531-1620](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-14-graphstore-enhancements--status-check-lines-1531-1620) and [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-24.SUMMARIZED.md#turn-10-prompt--shared-inference-modules-lines-3721-4460](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-24.SUMMARIZED.md#turn-10-prompt--shared-inference-modules-lines-3721-4460).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.585Z","inputHash":"0716ab01f7ce6f70"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ArtifactLayer` {#symbol-artifactlayer}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L1)

#### `KnowledgeArtifact` {#symbol-knowledgeartifact}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L8)

#### `LinkRelationshipKind` {#symbol-linkrelationshipkind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L19)

#### `LinkRelationship` {#symbol-linkrelationship}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L26)

#### `LlmConfidenceTier` {#symbol-llmconfidencetier}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L36)

#### `LlmEdgeProvenance` {#symbol-llmedgeprovenance}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L38)

#### `ChangeEventType` {#symbol-changeeventtype}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L56)

#### `ChangeEventProvenance` {#symbol-changeeventprovenance}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L58)

#### `ChangeEventRange` {#symbol-changeeventrange}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L60)

#### `ChangeEvent` {#symbol-changeevent}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L65)

#### `DiagnosticSeverity` {#symbol-diagnosticseverity}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L75)

#### `DiagnosticStatus` {#symbol-diagnosticstatus}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L77)

#### `LlmModelMetadata` {#symbol-llmmodelmetadata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L79)

#### `LlmAssessment` {#symbol-llmassessment}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L87)

#### `DiagnosticRecord` {#symbol-diagnosticrecord}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L98)

#### `KnowledgeSnapshot` {#symbol-knowledgesnapshot}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L113)

#### `AcknowledgementActionType` {#symbol-acknowledgementactiontype}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L123)

#### `AcknowledgementAction` {#symbol-acknowledgementaction}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L125)

#### `DriftHistoryStatus` {#symbol-drifthistorystatus}
- Type: type
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L134)

#### `DriftHistoryEntry` {#symbol-drifthistoryentry}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/domain/artifacts.ts#L136)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [graphStore.test.ts](../db/graphStore.test.ts.mdmd.md)
- [fallbackInference.languages.test.ts](../inference/fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](../inference/fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](../inference/linkInference.test.ts.mdmd.md)
- [confidenceCalibrator.test.ts](../inference/llm/confidenceCalibrator.test.ts.mdmd.md)
- [relationshipExtractor.test.ts](../inference/llm/relationshipExtractor.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
