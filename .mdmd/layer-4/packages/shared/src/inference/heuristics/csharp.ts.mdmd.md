# packages/shared/src/inference/heuristics/csharp.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/csharp.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-csharp-ts
- Generated At: 2026-02-16T19:57:19.144Z

## Authored
### Purpose
Analyzes `.cs` artifacts to link `using` directives, symbol usages, and partial type peers—work we tightened while integrating the Roslyn benchmarks and eliminating partial-class false positives on Nov 8 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md#L90-L135>.

### Notes
- Tailored to the WebForms + analyzer scenarios requested on Nov 6; keep the namespace/partial heuristics in sync with those fixtures whenever we extend legacy coverage <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L3298-L3340>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T19:57:19.144Z","inputHash":"e392b4713c80aafe"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createCSharpHeuristic` {#symbol-createcsharpheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/csharp.ts#L75)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)

##### `createCSharpHeuristic` — Summary
Creates a heuristic that detects C# `using` directives and namespace
references, mapping them to workspace `.cs` files by namespace convention.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`syntax.stripCStyleComments`](../../languages/syntax.ts.mdmd.md#symbol-stripcstylecomments)
<!-- LIVE-DOC:END Dependencies -->
