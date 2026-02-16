# packages/shared/src/inference/heuristics/directives.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/directives.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-directives-ts
- Generated At: 2026-02-16T18:46:23.976Z

## Authored
### Purpose
Scans documentation artifacts for `@link` directives so fallback inference can honour the authored cross-file hints we started embedding in specs and OpenAPI docs during the Oct 25 documentation traceability push <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-25.md#L1-L140>.

### Notes
- Part of the Nov 7 modular heuristic refactor; keep alignment with `resolveReference` and the directive taxonomy captured in that pass when expanding the syntax surface <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L972-L1240>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:23.976Z","inputHash":"680ab5ce4b45b753"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createDirectiveHeuristic` {#symbol-createdirectiveheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/directives.ts#L12)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)

##### `createDirectiveHeuristic` — Summary
Creates a heuristic that detects file-path references in preprocessor-style
directives: YAML/Docker `FROM`, `COPY`, Makefiles, and similar patterns
that reference workspace artifacts by relative path.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`referenceResolver.resolveReference`](./referenceResolver.ts.mdmd.md#symbol-resolvereference)
- [`shared.cleanupReference`](./shared.ts.mdmd.md#symbol-cleanupreference)
<!-- LIVE-DOC:END Dependencies -->
