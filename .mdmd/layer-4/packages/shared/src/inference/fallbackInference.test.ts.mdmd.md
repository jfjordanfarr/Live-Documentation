# packages/shared/src/inference/fallbackInference.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/inference/fallbackInference.test.ts
- Live Doc ID: LD-test-packages-shared-src-inference-fallbackinference-test-ts
- Generated At: 2025-12-11T02:38:01.705Z

## Authored
### Purpose
Locks in the fallback inference contract from T054–T056—heuristic markdown/code pairing, LLM suggestion merging, and TypeScript module handling—introduced in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-6-resume-speckitimplement-lines-164-286](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-17.SUMMARIZED.md#turn-6-resume-speckitimplement-lines-164-286).

### Notes
Later assertions track the TypeScript runtime/type split and regression fixes from [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-17-shareable-typescript-ast-utilities-lines-1461-1620](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-17-shareable-typescript-ast-utilities-lines-1461-1620) while leaving room for the language-specific suites captured in `fallbackInference.languages.test.ts`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.705Z","inputHash":"a7f27157ee9c9e54"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`fallbackInference.FallbackLLMBridge`](./fallbackInference.ts.mdmd.md#symbol-fallbackllmbridge)
- [`fallbackInference.LLMRelationshipRequest`](./fallbackInference.ts.mdmd.md#symbol-llmrelationshiprequest)
- [`fallbackInference.LLMRelationshipSuggestion`](./fallbackInference.ts.mdmd.md#symbol-llmrelationshipsuggestion)
- [`fallbackInference.inferFallbackGraph`](./fallbackInference.ts.mdmd.md#symbol-inferfallbackgraph)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/domain: [artifacts.ts](../domain/artifacts.ts.mdmd.md)
- packages/shared/src/inference: [fallbackHeuristicTypes.ts](./fallbackHeuristicTypes.ts.mdmd.md), [fallbackInference.ts](./fallbackInference.ts.mdmd.md)
- packages/shared/src/inference/heuristics: [artifactLayerUtils.ts](./heuristics/artifactLayerUtils.ts.mdmd.md), [heuristics/index.ts](./heuristics/index.ts.mdmd.md), [shared.ts](./heuristics/shared.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
