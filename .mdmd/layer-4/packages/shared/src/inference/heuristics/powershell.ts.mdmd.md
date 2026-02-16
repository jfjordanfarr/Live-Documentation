# packages/shared/src/inference/heuristics/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/powershell.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-powershell-ts
- Generated At: 2026-02-16T18:46:24.173Z

## Authored
### Purpose
Describe the fallback heuristic that teaches the inference pipeline how to recognise PowerShell dependencies discovered outside the adapter runtime.

### Notes
- Emits `depends_on` edges for dot-sources, `Import-Module`, `using module`, and `#requires -Modules` directives so inspect and fallback graphs can traverse scripts without AST support.
- Normalises `$PSScriptRoot`, de-duplicates specifiers, and delegates matching to the shared `resolveReference` helper to stay consistent with other language heuristics.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:24.173Z","inputHash":"d7739c10640ecb57"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createPowerShellHeuristic` {#symbol-createpowershellheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/powershell.ts#L26)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)

##### `createPowerShellHeuristic` — Summary
Creates a heuristic that detects PowerShell dot-sourced scripts
(`. .\path.ps1`) and `Import-Module` references, resolving them
to workspace `.ps1`/`.psm1` files.
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
