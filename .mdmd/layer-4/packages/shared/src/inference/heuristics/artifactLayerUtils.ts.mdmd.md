# packages/shared/src/inference/heuristics/artifactLayerUtils.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/inference/heuristics/artifactLayerUtils.ts
- Live Doc ID: LD-implementation-packages-shared-src-inference-heuristics-artifactlayerutils-ts
- Generated At: 2026-02-16T18:46:23.917Z

## Authored
### Purpose

Defines the layer guards (`isDocumentLayer`, `isImplementationLayer`) that the Nov 7 fallback inference refactor introduced so every heuristic can short-circuit outside its target strata and keep the orchestrator under 500 lines <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-07.md#L772-L1310>.

### Notes

- Shared by all language heuristics after the modularization commit that landed on Nov 8; keep these helpers stable unless roadmap updates redefine the layer taxonomy consumed by `FallbackHeuristic` ordering <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-08.md#L60-L140>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:23.917Z","inputHash":"f994fe7e724fbdd6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `isDocumentLayer` {#symbol-isdocumentlayer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/artifactLayerUtils.ts#L10)
- Parameters: `layer`: [`ArtifactLayer`](../../../../extension/src/shared/artifactSchemas.ts.mdmd.md#symbol-artifactlayer)

##### `isDocumentLayer` — Summary
Returns `true` when the artifact layer represents a documentation tier
(vision, requirements, architecture) rather than code.

Used by document-oriented heuristics (e.g. markdown) to restrict matching
to non-code artifacts.

#### `isImplementationLayer` {#symbol-isimplementationlayer}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/inference/heuristics/artifactLayerUtils.ts#L19)
- Parameters: `layer`: [`ArtifactLayer`](../../../../extension/src/shared/artifactSchemas.ts.mdmd.md#symbol-artifactlayer)

##### `isImplementationLayer` — Summary
Returns `true` when the artifact layer represents a code tier
(implementation or code). Used by language heuristics to restrict
matching to source files.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.ArtifactLayer`](../../domain/artifacts.ts.mdmd.md#symbol-artifactlayer) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [symbolBridge.test.ts](../../../../extension/src/services/symbolBridge.test.ts.mdmd.md)
- [noiseFilter.test.ts](../../../../server/src/features/diagnostics/noiseFilter.test.ts.mdmd.md)
- [pathReferenceDetector.test.ts](../../../../server/src/features/watchers/pathReferenceDetector.test.ts.mdmd.md)
- [fallbackInference.languages.test.ts](../fallbackInference.languages.test.ts.mdmd.md)
- [fallbackInference.test.ts](../fallbackInference.test.ts.mdmd.md)
- [linkInference.test.ts](../linkInference.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
