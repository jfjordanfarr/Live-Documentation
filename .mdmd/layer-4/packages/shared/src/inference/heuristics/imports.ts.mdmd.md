# packages/shared/src/inference/heuristics/imports.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/imports.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-imports-ts
- Generated At: 2026-02-16T18:46:24.034Z

## Authored
### Purpose
Keeps fallback inference aligned with curated JS/TS and Python fixtures by mapping import statements onto workspace artifacts while filtering commented or type-only specifiers so dependency edges stay accurate without regressing benchmark precision <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L2108-L2126> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L2345-L2390> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L1858-L1920>.

### Notes
- When onboarding new JS-like fixtures, extend the module extension allowlist so the Java false positives we identified during the OkHttp import sweep stay closed <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L3046-L3070>.
- Python module resolution relies on the curated helper introduced while reconciling the basics fixture, so re-run the AST benchmarks after any normalization tweaks to ensure the inferred edges still match the oracle <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L1860-L1920>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:24.034Z","inputHash":"bf7cd4c9b06c1d58"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createImportHeuristic` {#symbol-createimportheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/imports.ts#L28)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)

##### `createImportHeuristic` — Summary
Creates a heuristic that detects TypeScript/JavaScript `import` and
`require` statements, resolving module specifiers to workspace files
with `.ts`/`.tsx`/`.js` extension fallback.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`fallbackHeuristicTypes.MatchEmitter`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-matchemitter) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`referenceResolver.resolveReference`](./referenceResolver.ts.mdmd.md#symbol-resolvereference)
- [`shared.cleanupReference`](./shared.ts.mdmd.md#symbol-cleanupreference)
- [`shared.computeReferenceStart`](./shared.ts.mdmd.md#symbol-computereferencestart)
- [`shared.isWithinComment`](./shared.ts.mdmd.md#symbol-iswithincomment)
- [`typeScriptAstUtils.collectIdentifierUsage`](../../language/typeScriptAstUtils.ts.mdmd.md#symbol-collectidentifierusage)
- [`typeScriptAstUtils.extractLocalImportNames`](../../language/typeScriptAstUtils.ts.mdmd.md#symbol-extractlocalimportnames)
- [`typeScriptAstUtils.hasRuntimeUsage`](../../language/typeScriptAstUtils.ts.mdmd.md#symbol-hasruntimeusage)
- [`typeScriptAstUtils.isLikelyTypeDefinitionSpecifier`](../../language/typeScriptAstUtils.ts.mdmd.md#symbol-islikelytypedefinitionspecifier)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->
