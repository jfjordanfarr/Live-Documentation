# packages/shared/src/rules/relationshipRuleEngine.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/relationshipRuleEngine.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-relationshipruleengine-ts
- Generated At: 2026-02-03T21:55:40.808Z

## Authored
### Purpose
Loads, compiles, and executes relationship rules to produce link evidence that seeds diagnostics, Live Docs, and knowledge ingestion pipelines.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

### Notes
- Introduced alongside symbol correctness work so graph audits could reason about rule provenance and warn on malformed configs before they reach the provider.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-27-harden-relationship-rule-provider-tests-lines-6121-6420]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.808Z","inputHash":"306bebfa6e8123f5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `loadRelationshipRuleConfig` {#symbol-loadrelationshipruleconfig}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L30)
- Returns: [`RelationshipRuleConfigLoadResult`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipruleconfigloadresult)

#### `compileRelationshipRules` {#symbol-compilerelationshiprules}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L105)
- Returns: [`CompiledRelationshipRules`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprules)
- Parameters: `config`: [`RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig)

#### `GenerateRelationshipEvidencesOptions` {#symbol-generaterelationshipevidencesoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L128)

#### `RelationshipEvidenceGenerationResult` {#symbol-relationshipevidencegenerationresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L135)

#### `generateRelationshipEvidences` {#symbol-generaterelationshipevidences}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleEngine.ts#L140)
- Returns: [`RelationshipEvidenceGenerationResult`](#symbol-relationshipevidencegenerationresult)
- Parameters: `options`: [`GenerateRelationshipEvidencesOptions`](#symbol-generaterelationshipevidencesoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `minimatch` - `Minimatch`
- `node:fs`
- `node:path`
- [`fallbackInference.ArtifactSeed`](../inference/fallbackInference.ts.mdmd.md#symbol-artifactseed) (type-only)
- [`linkInference.LinkEvidence`](../inference/linkInference.ts.mdmd.md#symbol-linkevidence) (type-only)
- [`relationshipResolvers.createBuiltInResolvers`](./relationshipResolvers.ts.mdmd.md#symbol-createbuiltinresolvers)
- [`relationshipRuleTypes.CompiledRelationshipRule`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprule) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRulePropagation`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprulepropagation) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRuleStep`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprulestep) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRules`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprules) (type-only)
- [`relationshipRuleTypes.RelationshipResolver`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipresolver) (type-only)
- [`relationshipRuleTypes.RelationshipRuleChain`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulechain) (type-only)
- [`relationshipRuleTypes.RelationshipRuleConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipruleconfig) (type-only)
- [`relationshipRuleTypes.RelationshipRuleConfigLoadResult`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshipruleconfigloadresult) (type-only)
- [`relationshipRuleTypes.RelationshipRulePropagationConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulepropagationconfig) (type-only)
- [`relationshipRuleTypes.RelationshipRuleStepConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulestepconfig) (type-only)
- [`relationshipRuleTypes.RelationshipRuleWarning`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulewarning) (type-only)
- [`relationshipRuleTypes.RelationshipRulesConfig`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulesconfig) (type-only)
- [`pathUtils.toWorkspaceRelativePath`](../tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [relationshipRuleProvider.test.ts](./relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
