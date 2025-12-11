# packages/shared/src/inference/heuristics/ruby.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/ruby.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-ruby-ts
- Generated At: 2025-12-11T02:38:01.775Z

## Authored
### Purpose
Detects `require_relative` relationships so Ruby fixtures (cli, analytics, support) emit the `requires` edges Phase 8 called for; we added this heuristic on Nov 5 alongside the other polyglot updates after benchmarks showed those dependencies missing entirely <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L2860-L2960> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L780-L860>.

### Notes
- Regression coverage for this module lives in `fallbackInference.languages.test.ts`, which we wrote on Nov 7 to lock the Ruby chain behavior—keep that suite green when extending the heuristic <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L600-L676>.
- Path resolution continues to lean on `normalizePath`; if future fixtures add `require_relative` calls that walk outside the workspace, capture that as technical debt rather than broadening this function to chase absolute filesystem paths blindly <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L780-L860>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.775Z","inputHash":"98fe8df7f1fe9abf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createRubyHeuristic` {#symbol-createrubyheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/ruby.ts#L9)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`shared.normalizePath`](./shared.ts.mdmd.md#symbol-normalizepath)
<!-- LIVE-DOC:END Dependencies -->
