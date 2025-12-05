# packages/server/src/features/knowledge/rippleAnalyzer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/rippleAnalyzer.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-rippleanalyzer-ts
- Generated At: 2025-12-05T15:37:23.940Z

## Authored
### Purpose
Traverses the knowledge graph to produce ripple hints, scoring downstream artifacts by depth and relationship kind so diagnostics and planners can prioritize follow-up work.

### Notes
- Integrated into the diagnostics pipeline during the Oct 20 ripple rollout (see [2025-10-20 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md)), powering impact calculations.
- Subsequent ingestion updates on Oct 22 (see [2025-10-22 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md)) kept the analyzer aligned with feed-derived artifacts.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T15:37:23.940Z","inputHash":"8345023cdb0c55d9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RippleAnalyzerLogger` {#symbol-rippleanalyzerlogger}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/rippleAnalyzer.ts#L11)

#### `RippleAnalyzerOptions` {#symbol-rippleanalyzeroptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/rippleAnalyzer.ts#L18)

#### `RippleAnalysisRequest` {#symbol-rippleanalysisrequest}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/rippleAnalyzer.ts#L26)

#### `RippleHint` {#symbol-ripplehint}
- Type: type
- Source: [source](../../../../../../../packages/server/src/features/knowledge/rippleAnalyzer.ts#L34)
- Returns: [`RelationshipHint`](../../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-relationshiphint)

#### `RippleAnalyzer` {#symbol-rippleanalyzer}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/knowledge/rippleAnalyzer.ts#L72)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`, `KnowledgeArtifact`, `LinkRelationshipKind`, `LinkedArtifactSummary`, `RelationshipHint`
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [rippleAnalyzer.test.ts](./rippleAnalyzer.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
