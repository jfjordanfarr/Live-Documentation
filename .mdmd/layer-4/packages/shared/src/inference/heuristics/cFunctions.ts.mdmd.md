# packages/shared/src/inference/heuristics/cFunctions.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/cFunctions.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-cfunctions-ts
- Generated At: 2025-12-11T02:38:01.722Z

## Authored
### Purpose
Resolves C call sites back to their declaring headers so fallback inference can recover the `calls` edges that Phase 8 demanded when the C fixtures started exposing ground-truth relationships <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L583-L590> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L5010-L5032>.

### Notes
- Became part of the modular heuristic suite shipped on Nov 8; any scoring or ordering tweaks need to stay benchmark-neutral as captured in that commit summary <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md#L60-L140>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.722Z","inputHash":"d21f3308f80576fa"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createCFunctionHeuristic` {#symbol-createcfunctionheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/cFunctions.ts#L23)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
<!-- LIVE-DOC:END Dependencies -->
