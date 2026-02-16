# packages/shared/src/inference/heuristics/markdown.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/markdown.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-markdown-ts
- Generated At: 2026-02-16T18:57:52.512Z

## Authored
### Purpose
Translates Markdown links and wiki-link syntax in Layer‑4 docs into fallback graph edges so documentation ripples stay observable—a requirement we spelled out during the October doc-link standardisation work and implemented once the heuristics suite moved into modular files on Nov 7 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L4518-L4725> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L860-L940>.

### Notes
- Keep this heuristic aligned with the doc link enforcement tooling (`slopcop:markdown`) and the falsifiability integration tests that watch for doc/code drift; rerun those checks after tweaking link parsing so the bidirectional diagnostics remain trustworthy <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.SUMMARIZED.md#L60-L110>.
- When we add new link dialects (for example reference-style links or images), extend the shared `resolveReference` path so every documentation heuristic continues sharing the same normalization rules <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L820-L900>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:57:52.512Z","inputHash":"44010fb536111acf"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createMarkdownHeuristic` {#symbol-createmarkdownheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/markdown.ts#L14)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)

##### `createMarkdownHeuristic` — Summary
Creates a heuristic that detects relative markdown links and wiki-links,
resolving them to workspace artifacts. Ignores external HTTP(S) URLs
and anchor-only fragments.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`fallbackHeuristicTypes.MatchEmitter`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-matchemitter) (type-only)
- [`artifactLayerUtils.isDocumentLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isdocumentlayer)
- [`referenceResolver.resolveReference`](./referenceResolver.ts.mdmd.md#symbol-resolvereference)
- [`shared.cleanupReference`](./shared.ts.mdmd.md#symbol-cleanupreference)
<!-- LIVE-DOC:END Dependencies -->
