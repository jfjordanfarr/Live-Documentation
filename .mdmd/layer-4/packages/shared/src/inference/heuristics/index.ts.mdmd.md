# packages/shared/src/inference/heuristics/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/index.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-index-ts
- Generated At: 2026-01-15T16:26:53.824Z

## Authored
### Purpose
Turns the per-language builders into the default heuristic suite that replaced the monolithic fallbackInference orchestrator on Nov 7, giving the pipeline a single place to register ordering and hydration logic <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.SUMMARIZED.md#L50-L70>.

### Notes
- Maintain the evaluation order here—directive/docs first, then language heuristics—so we preserve the confidence balancing discussed during the modular refactor; shuffle only with a benchmark-backed justification <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L1290-L1485>.
- When adding a new heuristic module, export it through this registry and update `fallbackInference.languages.test.ts` so the regression suite exercises the new behavior <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L600-L676>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T16:26:53.824Z","inputHash":"79d0e2af93232397"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createDefaultHeuristics` {#symbol-createdefaultheuristics}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/index.ts#L15)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)[]
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`cFunctions.createCFunctionHeuristic`](./cFunctions.ts.mdmd.md#symbol-createcfunctionheuristic)
- [`csharp.createCSharpHeuristic`](./csharp.ts.mdmd.md#symbol-createcsharpheuristic)
- [`directives.createDirectiveHeuristic`](./directives.ts.mdmd.md#symbol-createdirectiveheuristic)
- [`go.createGoHeuristic`](./go.ts.mdmd.md#symbol-creategoheuristic)
- [`imports.createImportHeuristic`](./imports.ts.mdmd.md#symbol-createimportheuristic)
- [`includes.createIncludeHeuristic`](./includes.ts.mdmd.md#symbol-createincludeheuristic)
- [`java.createJavaHeuristic`](./java.ts.mdmd.md#symbol-createjavaheuristic)
- [`markdown.createMarkdownHeuristic`](./markdown.ts.mdmd.md#symbol-createmarkdownheuristic)
- [`powershell.createPowerShellHeuristic`](./powershell.ts.mdmd.md#symbol-createpowershellheuristic)
- [`ruby.createRubyHeuristic`](./ruby.ts.mdmd.md#symbol-createrubyheuristic)
- [`rust.createRustHeuristic`](./rust.ts.mdmd.md#symbol-createrustheuristic)
- [`webforms.createWebFormsHeuristic`](./webforms.ts.mdmd.md#symbol-createwebformsheuristic)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [fallbackInference.languages.test.ts](../fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](../fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](../linkInference.test.ts.mdmd.md)
- [relationshipRuleProvider.test.ts](../../rules/relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
