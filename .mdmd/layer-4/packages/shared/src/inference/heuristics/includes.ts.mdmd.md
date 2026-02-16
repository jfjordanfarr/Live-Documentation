# packages/shared/src/inference/heuristics/includes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/includes.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-includes-ts
- Generated At: 2026-02-16T18:46:24.056Z

## Authored
### Purpose
Follows `#include` directives so the C fixtures (libuv, modular, basics) keep emitting accurate `include` edges—part of the Nov 5 push that aligned fallback inference with the oracle captures before we re-expanded the curated ground truth <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L3098-L3130> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L3498-L3520>.

### Notes
- We tightened `resolveIncludeReference` on Nov 7 after modularizing the suite so quoted includes default to same-directory lookups; keep any future adjustments in that shared resolver to avoid regressions <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L1780-L1820>.
- After editing this heuristic, rerun `npm run fixtures:record-fallback -- --lang c` and the AST benchmarks to confirm c-libuv and c-modular stay in sync with their expected include sets <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L3098-L3130>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:24.056Z","inputHash":"fca00490e96326ef"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createIncludeHeuristic` {#symbol-createincludeheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/includes.ts#L12)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)

##### `createIncludeHeuristic` — Summary
Creates a heuristic that detects C/C++ `#include` directives and resolves
them against the workspace file tree, supporting both quoted and angle-bracket forms.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`referenceResolver.resolveIncludeReference`](./referenceResolver.ts.mdmd.md#symbol-resolveincludereference)
- [`shared.computeReferenceStart`](./shared.ts.mdmd.md#symbol-computereferencestart)
- [`shared.isWithinComment`](./shared.ts.mdmd.md#symbol-iswithincomment)
<!-- LIVE-DOC:END Dependencies -->
