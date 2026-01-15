# packages/shared/src/inference/heuristics/go.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/go.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-go-ts
- Generated At: 2026-01-15T16:26:53.817Z

## Authored
### Purpose
Go heuristic for fallback inference. Enables text-based dependency detection for Go source files when generating `inferred.json` in benchmark fixtures, complementing the language adapter.

### Notes
- Created during [2026-01-15 dev session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) as part of Go Rosetta fixture implementation
- Follows the pattern established by `rust.ts`, `java.ts`, and other language-specific heuristics
- Resolves imports via `go.mod` module name and maps import paths to package directories
- Uses "imports" relation for `main.go` and "uses" relation for other source files (matching other Rosetta fixtures)
- Registered in [heuristics/index.ts](./index.ts.mdmd.md) alongside other language heuristics

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T16:26:53.817Z","inputHash":"eb051a7e6866725a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createGoHeuristic` {#symbol-creategoheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/go.ts#L52)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`fallbackHeuristicTypes.MatchContext`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-matchcontext) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`shared.isWithinComment`](./shared.ts.mdmd.md#symbol-iswithincomment)
<!-- LIVE-DOC:END Dependencies -->
