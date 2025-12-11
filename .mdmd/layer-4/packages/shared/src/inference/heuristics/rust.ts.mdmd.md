# packages/shared/src/inference/heuristics/rust.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/rust.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-rust-ts
- Generated At: 2025-12-11T02:38:01.782Z

## Authored
### Purpose
Encodes the Rust module/use heuristics that recovered the AST benchmarks on Nov 5 by turning `mod`, `use`, and path references into `use` edges for the rust-basics, rust-analytics, and rust-log fixtures after we iterated with the recorder until the lingering false imports disappeared <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L1478-L1544> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.SUMMARIZED.md#L44-L76>.

### Notes
- The module lives inside the shared heuristic suite introduced on Nov 7; extend this file instead of reviving the pre-refactor monolith whenever new Rust patterns surface <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840>.
- Keep the fallback fixture recorder (`npm run fixtures:record-fallback -- --lang rust`) in the loop after edits so rust-log and friends stay aligned with the curated expected graphs <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L1478-L1544>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.782Z","inputHash":"2c7e039a7354ae8f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createRustHeuristic` {#symbol-createrustheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/rust.ts#L21)
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
