# packages/shared/src/rules/relationshipRuleProvider.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/relationshipRuleProvider.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-relationshipruleprovider-ts
- Generated At: 2025-12-11T02:38:02.256Z

## Authored
### Purpose
Loads relationship-rule configs, compiles them, and exposes a workspace link provider so relationship evidence flows into diagnostics and knowledge ingestion.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-27-harden-relationship-rule-provider-tests-lines-6121-6420]

### Notes
- Returns structured warnings and contributions consumed by the language server’s graph builders and symbol-correctness checks introduced alongside the profile compiler.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.256Z","inputHash":"113da85c9def0953"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RelationshipRuleProviderLogger` {#symbol-relationshipruleproviderlogger}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleProvider.ts#L5)

#### `RelationshipRuleProviderOptions` {#symbol-relationshipruleprovideroptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleProvider.ts#L10)

#### `createRelationshipRuleProvider` {#symbol-createrelationshipruleprovider}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleProvider.ts#L22)
- Returns: [`WorkspaceLinkProvider`](../inference/linkInference.ts.mdmd.md#symbol-workspacelinkprovider)
- Parameters: `options`: [`RelationshipRuleProviderOptions`](#symbol-relationshipruleprovideroptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`linkInference.WorkspaceLinkContribution`](../inference/linkInference.ts.mdmd.md#symbol-workspacelinkcontribution) (type-only)
- [`linkInference.WorkspaceLinkProvider`](../inference/linkInference.ts.mdmd.md#symbol-workspacelinkprovider) (type-only)
- [`relationshipRuleEngine.compileRelationshipRules`](./relationshipRuleEngine.ts.mdmd.md#symbol-compilerelationshiprules)
- [`relationshipRuleEngine.generateRelationshipEvidences`](./relationshipRuleEngine.ts.mdmd.md#symbol-generaterelationshipevidences)
- [`relationshipRuleEngine.loadRelationshipRuleConfig`](./relationshipRuleEngine.ts.mdmd.md#symbol-loadrelationshipruleconfig)
- [`relationshipRuleTypes.RelationshipRuleWarning`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulewarning) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [relationshipRuleProvider.test.ts](./relationshipRuleProvider.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
