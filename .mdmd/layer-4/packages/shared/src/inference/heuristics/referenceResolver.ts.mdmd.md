# packages/shared/src/inference/heuristics/referenceResolver.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/referenceResolver.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-referenceresolver-ts
- Generated At: 2026-02-03T21:55:38.985Z

## Authored
### Purpose
Centralizes the artifact lookup logic for fallback heuristics, exposing shared helpers that translate raw include/import strings into scored targets once we split the monolith into modular language files on Nov 7 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L820-L900>.

### Notes
- `resolveIncludeReference` keeps the C benchmarks stable by treating quoted `#include` directives as same-directory lookups; we tightened that behaviour during the modular refactor after the libuv fixture started failing <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L1780-L1820>.
- If a future heuristic needs bespoke variant scoring, add it here so every language continues reusing the same normalization/weighting rules that we introduced alongside the Phase 8 polyglot heuristics on Nov 5 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L780-L860>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:38.985Z","inputHash":"efaa6fbedde89718"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ReferenceResolution` {#symbol-referenceresolution}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/referenceResolver.ts#L12)

#### `resolveReference` {#symbol-resolvereference}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/referenceResolver.ts#L18)
- Returns: [`ReferenceResolution`](#symbol-referenceresolution)
- Parameters: `source`: [`HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact)

#### `resolveIncludeReference` {#symbol-resolveincludereference}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/referenceResolver.ts#L59)
- Returns: [`ReferenceResolution`](#symbol-referenceresolution)
- Parameters: `source`: [`HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`shared.buildReferenceVariants`](./shared.ts.mdmd.md#symbol-buildreferencevariants)
- [`shared.cleanupReference`](./shared.ts.mdmd.md#symbol-cleanupreference)
- [`shared.evaluateVariantMatch`](./shared.ts.mdmd.md#symbol-evaluatevariantmatch)
- [`shared.isExternalLink`](./shared.ts.mdmd.md#symbol-isexternallink)
- [`shared.toComparablePath`](./shared.ts.mdmd.md#symbol-tocomparablepath)
<!-- LIVE-DOC:END Dependencies -->
