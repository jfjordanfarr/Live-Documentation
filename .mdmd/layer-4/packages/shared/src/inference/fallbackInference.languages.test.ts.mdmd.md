# packages/shared/src/inference/fallbackInference.languages.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/inference/fallbackInference.languages.test.ts
- Live Doc ID: LD-test-packages-shared-src-inference-fallbackinference-languages-test-ts
- Generated At: 2025-12-11T02:38:01.699Z

## Authored
### Purpose
Regression suite covering the per-language fallback heuristics (C, Rust, Java, Ruby, and beyond) added during the modularization effort in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-7-add-regression-tests--okhttp-docs-lines-1421-1720](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-7-add-regression-tests--okhttp-docs-lines-1421-1720).

### Notes
Pairs with the heuristic refactor and shared contract wiring finalized in [AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-12-rebuild-fallback-orchestrator-lines-2381-2740](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-07.SUMMARIZED.md#turn-12-rebuild-fallback-orchestrator-lines-2381-2740), providing a guardrail while additional languages (for example, WebForms from [2025-11-06](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-06.SUMMARIZED.md#turn-26-benchmarks-fail-on-new-c-fixtures-lines-4121-4520)) plug into the shared heuristics registry.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.699Z","inputHash":"56bd7a2a35de2d32"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
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
