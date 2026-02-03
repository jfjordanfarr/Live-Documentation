# packages/extension/src/services/symbolBridge.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/extension/src/services/symbolBridge.test.ts
- Live Doc ID: LD-test-packages-extension-src-services-symbolbridge-test-ts
- Generated At: 2026-02-03T21:55:35.446Z

## Authored
### Purpose
Exercised `SymbolBridgeAnalyzer` with mocked VS Code symbol and reference providers to lock down the workspace-symbol ingestion behaviour delivered in Turn 05 of the Oct 20 cycle in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-05-add-symbol-bridge-unit-coverage-lines-942-1185](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-20.SUMMARIZED.md#turn-05-add-symbol-bridge-unit-coverage-lines-942-1185).

### Notes
- Mocks the VS Code command APIs so we can verify seed deduplication, unsupported-language filtering, and evidence counts without spinning up the extension host, per the actions log in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L920-L949](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-20.md#L920-L949).
- Coverage reports must stay above the ~80 percent threshold captured that day; if analyzer behaviour changes, extend these tests before relying on integration harness updates to catch regressions.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:35.446Z","inputHash":"fb7773940b1f7a1a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`symbolBridge.SymbolBridgeAnalyzer`](./symbolBridge.ts.mdmd.md#symbol-symbolbridgeanalyzer)
- [`fallbackInference.ArtifactSeed`](../../../shared/src/inference/fallbackInference.ts.mdmd.md#symbol-artifactseed) (type-only)
- `vitest` - `Mock`, `beforeEach`, `describe`, `expect`, `it`, `vi`
- `vscode` - `DocumentSymbol`, `Location`, `Position`, `Range`, `SymbolKind`, `Uri`, `commands`, `workspace`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/extension/src/services: [symbolBridge.ts](./symbolBridge.ts.mdmd.md)
- packages/shared/src/contracts: [symbols.ts](../../../shared/src/contracts/symbols.ts.mdmd.md)
- packages/shared/src/domain: [artifacts.ts](../../../shared/src/domain/artifacts.ts.mdmd.md)
- packages/shared/src/inference: [fallbackHeuristicTypes.ts](../../../shared/src/inference/fallbackHeuristicTypes.ts.mdmd.md), [fallbackInference.ts](../../../shared/src/inference/fallbackInference.ts.mdmd.md), [linkInference.ts](../../../shared/src/inference/linkInference.ts.mdmd.md)
- packages/shared/src/inference/heuristics: [artifactLayerUtils.ts](../../../shared/src/inference/heuristics/artifactLayerUtils.ts.mdmd.md), [heuristics/index.ts](../../../shared/src/inference/heuristics/index.ts.mdmd.md), [shared.ts](../../../shared/src/inference/heuristics/shared.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
