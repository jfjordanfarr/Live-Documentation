# packages/shared/src/rules/relationshipRuleProvider.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/rules/relationshipRuleProvider.test.ts
- Live Doc ID: LD-test-packages-shared-src-rules-relationshipruleprovider-test-ts
- Generated At: 2026-01-15T02:41:18.781Z

## Authored
### Purpose
Validates the relationship rule provider end-to-end—loading configs, compiling rules, and emitting workspace link contributions—so inference diagnostics stay deterministic.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-27-harden-relationship-rule-provider-tests-lines-6121-6420]

### Notes
- Exercises graph-store integration, heuristic lookups, and rule warnings the day the provider was hardened, catching regressions before they impact graph audits.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-27-harden-relationship-rule-provider-tests-lines-6121-6420]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.781Z","inputHash":"67c1309dd427efc5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os` - `tmpdir`
- `node:path`
- `node:url` - `pathToFileURL`
- [`fallbackInference.ArtifactSeed`](../inference/fallbackInference.ts.mdmd.md#symbol-artifactseed) (type-only)
- [`relationshipRuleEngine.compileRelationshipRules`](./relationshipRuleEngine.ts.mdmd.md#symbol-compilerelationshiprules)
- [`relationshipRuleEngine.generateRelationshipEvidences`](./relationshipRuleEngine.ts.mdmd.md#symbol-generaterelationshipevidences)
- [`relationshipRuleEngine.loadRelationshipRuleConfig`](./relationshipRuleEngine.ts.mdmd.md#symbol-loadrelationshipruleconfig)
- [`relationshipRuleProvider.createRelationshipRuleProvider`](./relationshipRuleProvider.ts.mdmd.md#symbol-createrelationshipruleprovider)
- [`pathUtils.toWorkspaceRelativePath`](../tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/domain: [artifacts.ts](../domain/artifacts.ts.mdmd.md)
- packages/shared/src/inference: [fallbackHeuristicTypes.ts](../inference/fallbackHeuristicTypes.ts.mdmd.md), [fallbackInference.ts](../inference/fallbackInference.ts.mdmd.md), [linkInference.ts](../inference/linkInference.ts.mdmd.md)
- packages/shared/src/inference/heuristics: [artifactLayerUtils.ts](../inference/heuristics/artifactLayerUtils.ts.mdmd.md), [heuristics/index.ts](../inference/heuristics/index.ts.mdmd.md), [shared.ts](../inference/heuristics/shared.ts.mdmd.md)
- packages/shared/src/rules: [relationshipResolvers.ts](./relationshipResolvers.ts.mdmd.md), [relationshipRuleEngine.ts](./relationshipRuleEngine.ts.mdmd.md), [relationshipRuleProvider.ts](./relationshipRuleProvider.ts.mdmd.md), [relationshipRuleTypes.ts](./relationshipRuleTypes.ts.mdmd.md)
- packages/shared/src/tooling: [markdownShared.ts](../tooling/markdownShared.ts.mdmd.md), [pathUtils.ts](../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
