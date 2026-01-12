# packages/shared/src/inference/linkInference.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/inference/linkInference.test.ts
- Live Doc ID: LD-test-packages-shared-src-inference-linkinference-test-ts
- Generated At: 2026-01-12T21:47:40.677Z

## Authored
### Purpose
Validates that the link inference orchestrator fuses fallback heuristics, workspace providers, and external knowledge feeds into coherent artifacts, links, and provenance—the coverage added when T028 shipped in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-11-build-link-inference-orchestrator-lines-515-657](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-11-build-link-inference-orchestrator-lines-515-657).

### Notes
Keeps the orchestrator’s provider/feed summaries and trace outputs aligned with the pipeline expectations that the markdown watcher and diagnostics publisher consume—codified across the US1 plumbing captured in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-12-stand-up-markdown-watcher-lines-658-824](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-12-stand-up-markdown-watcher-lines-658-824).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:47:40.677Z","inputHash":"6fa99a8d8ba1ccd6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackInference.ArtifactSeed`](./fallbackInference.ts.mdmd.md#symbol-artifactseed) (type-only)
- [`linkInference.KnowledgeFeed`](./linkInference.ts.mdmd.md#symbol-knowledgefeed)
- [`linkInference.LinkInferenceOrchestrator`](./linkInference.ts.mdmd.md#symbol-linkinferenceorchestrator)
- [`linkInference.WorkspaceLinkProvider`](./linkInference.ts.mdmd.md#symbol-workspacelinkprovider)
- [`externalTypes.ExternalSnapshot`](../knowledge/externalTypes.ts.mdmd.md#symbol-externalsnapshot) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/domain: [artifacts.ts](../domain/artifacts.ts.mdmd.md)
- packages/shared/src/inference: [fallbackHeuristicTypes.ts](./fallbackHeuristicTypes.ts.mdmd.md), [fallbackInference.ts](./fallbackInference.ts.mdmd.md), [linkInference.ts](./linkInference.ts.mdmd.md)
- packages/shared/src/inference/heuristics: [artifactLayerUtils.ts](./heuristics/artifactLayerUtils.ts.mdmd.md), [heuristics/index.ts](./heuristics/index.ts.mdmd.md), [shared.ts](./heuristics/shared.ts.mdmd.md)
- packages/shared/src/knowledge: [externalTypes.ts](../knowledge/externalTypes.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
