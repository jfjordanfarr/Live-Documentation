# packages/shared/src/inference/heuristics/java.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/java.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-java-ts
- Generated At: 2026-02-16T18:46:24.123Z

## Authored
### Purpose
Recovers `imports`/`uses` edges for the Phase 8 Java fixtures by mapping import statements to package-class pairs and classifying whether the symbol is instantiated or referenced—work we landed on Nov 5 while chasing the java-service benchmark regression <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L780-L860> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L1340-L1420>.

### Notes
- Extend this module (rather than the orchestrator) when handling new `import static` or wildcard patterns; the modular heuristic layout from Nov 7 expects language-specific parsing to live here <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L760-L840>.
- After adjustments, regenerate the Java fallback fixtures (`npm run fixtures:record-fallback -- --lang java`) so java-service and java-basic stay aligned with the oracle edges <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L1340-L1420>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:24.123Z","inputHash":"d51e843d4b5ed90a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `createJavaHeuristic` {#symbol-createjavaheuristic}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/java.ts#L22)
- Returns: [`FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic)

##### `createJavaHeuristic` — Summary
Creates a heuristic that detects Java `import` statements and maps
fully-qualified class names to workspace `.java` files by package path.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`fallbackHeuristicTypes.FallbackHeuristic`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-fallbackheuristic) (type-only)
- [`fallbackHeuristicTypes.HeuristicArtifact`](../fallbackHeuristicTypes.ts.mdmd.md#symbol-heuristicartifact) (type-only)
- [`artifactLayerUtils.isImplementationLayer`](./artifactLayerUtils.ts.mdmd.md#symbol-isimplementationlayer)
<!-- LIVE-DOC:END Dependencies -->
