# packages/shared/src/rules/relationshipRuleTypes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/relationshipRuleTypes.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-relationshipruletypes-ts
- Generated At: 2026-02-03T21:55:40.866Z

## Authored
### Purpose
Defines the configuration and compiled contract types that power relationship rules, symbol-correctness profiles, and diagnosis of missing links across the workspace graph.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

### Notes
- Shared by both the profile compiler and the relationship rule engine so audits and the language server evaluate identical structures.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-27-harden-relationship-rule-provider-tests-lines-6121-6420]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.866Z","inputHash":"c4b21c48618d0dbd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolProfileRequirementDirection` {#symbol-symbolprofilerequirementdirection}
- Type: type
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L4)

#### `RelationshipRuleStepConfig` {#symbol-relationshiprulestepconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L6)

#### `RelationshipRulePropagationConfig` {#symbol-relationshiprulepropagationconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L16)

#### `RelationshipRuleConfig` {#symbol-relationshipruleconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L23)

#### `RelationshipRulesConfig` {#symbol-relationshiprulesconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L31)

#### `RelationshipRuleConfigLoadResult` {#symbol-relationshipruleconfigloadresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L39)

#### `RelationshipRuleWarning` {#symbol-relationshiprulewarning}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L45)

#### `RelationshipResolverResult` {#symbol-relationshipresolverresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L51)

#### `RelationshipResolverOptions` {#symbol-relationshipresolveroptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L56)

#### `RelationshipResolver` {#symbol-relationshipresolver}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L64)

#### `CompiledRelationshipRuleStep` {#symbol-compiledrelationshiprulestep}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L69)

#### `CompiledRelationshipRulePropagation` {#symbol-compiledrelationshiprulepropagation}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L80)

#### `CompiledRelationshipRule` {#symbol-compiledrelationshiprule}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L87)

#### `CompiledRelationshipRules` {#symbol-compiledrelationshiprules}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L95)

#### `RelationshipRuleChain` {#symbol-relationshiprulechain}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L101)

#### `RelationshipRuleChainStep` {#symbol-relationshiprulechainstep}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L106)

#### `SymbolProfileSourceConfig` {#symbol-symbolprofilesourceconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L112)

#### `SymbolProfileTargetConfig` {#symbol-symbolprofiletargetconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L120)

#### `SymbolProfileEnforcementMode` {#symbol-symbolprofileenforcementmode}
- Type: type
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L126)

#### `SymbolProfileOverrideConfig` {#symbol-symbolprofileoverrideconfig}
- Type: type
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L128)
- Returns: [`SymbolProfileEnforcementMode`](#symbol-symbolprofileenforcementmode)

#### `SymbolProfileRequirementConfig` {#symbol-symbolprofilerequirementconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L136)

#### `SymbolCorrectnessProfileConfig` {#symbol-symbolcorrectnessprofileconfig}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L147)

#### `CompiledSymbolProfileTarget` {#symbol-compiledsymbolprofiletarget}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L158)

#### `CompiledSymbolProfileRequirement` {#symbol-compiledsymbolprofilerequirement}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L165)

#### `CompiledSymbolProfileSource` {#symbol-compiledsymbolprofilesource}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L176)

#### `CompiledSymbolProfile` {#symbol-compiledsymbolprofile}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L184)

#### `SymbolProfileLookup` {#symbol-symbolprofilelookup}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleTypes.ts#L194)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.ArtifactLayer`](../domain/artifacts.ts.mdmd.md#symbol-artifactlayer) (type-only)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
- [`fallbackInference.ArtifactSeed`](../inference/fallbackInference.ts.mdmd.md#symbol-artifactseed) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [relationshipRuleProvider.test.ts](./relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
