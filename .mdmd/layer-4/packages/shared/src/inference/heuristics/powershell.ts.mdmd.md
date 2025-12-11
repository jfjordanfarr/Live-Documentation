# packages/shared/src/inference/heuristics/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/powershell.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-powershell-ts
- Generated At: 2025-12-11T02:38:01.766Z

## Authored
### Purpose
Describe the fallback heuristic that teaches the inference pipeline how to recognise PowerShell dependencies discovered outside the adapter runtime.

### Notes
- Emits `depends_on` edges for dot-sources, `Import-Module`, `using module`, and `#requires -Modules` directives so inspect and fallback graphs can traverse scripts without AST support.
- Normalises `$PSScriptRoot`, de-duplicates specifiers, and delegates matching to the shared `resolveReference` helper to stay consistent with other language heuristics.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.766Z","inputHash":"cc5d2baf8b511314"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createPowerShellHeuristic` {#symbol-createpowershellheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/powershell.ts#L21)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`fallbackHeuristicTypes.MatchEmitter`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-matchemitter) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
- [`referenceResolver.resolveReference`](./referenceResolver.ts.mdmd.md#symbol-resolvereference)
<!-- LIVE-DOC:END Dependencies -->
