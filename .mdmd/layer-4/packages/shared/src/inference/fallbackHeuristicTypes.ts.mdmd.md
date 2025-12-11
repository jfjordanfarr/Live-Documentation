# packages/shared/src/inference/fallbackHeuristicTypes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/fallbackHeuristicTypes.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-fallbackheuristictypes-ts
- Generated At: 2025-12-11T02:38:01.694Z

## Authored
### Purpose
Defines the shared `FallbackHeuristic` contract—match contexts, emitters, and artifact adapters—introduced when we split the monolithic fallback inference into modular language plugins in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-10-document-the-refactor-plan-lines-2001-2220](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-10-document-the-refactor-plan-lines-2001-2220).

### Notes
Serves as the hub each language module implements post-refactor (see [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-12-rebuild-fallback-orchestrator-lines-2381-2740](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-12-rebuild-fallback-orchestrator-lines-2381-2740)), keeping new heuristics—like the WebForms signals from [2025-11-06](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-06.SUMMARIZED.md#turn-26-benchmarks-fail-on-new-c-fixtures-lines-4121-4520)—consistent.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.694Z","inputHash":"45d196bfa8ee3de7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MatchContext` {#symbol-matchcontext}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L3)

#### `HeuristicArtifact` {#symbol-heuristicartifact}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L13)

#### `MatchCandidate` {#symbol-matchcandidate}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L21)

#### `MatchEmitter` {#symbol-matchemitter}
- Type: type
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L28)
- Parameters: `candidate`: [`MatchCandidate`](#symbol-matchcandidate)

#### `FallbackHeuristic` {#symbol-fallbackheuristic}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/inference/fallbackHeuristicTypes.ts#L30)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [fallbackInference.languages.test.ts](./fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](./fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](./linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
