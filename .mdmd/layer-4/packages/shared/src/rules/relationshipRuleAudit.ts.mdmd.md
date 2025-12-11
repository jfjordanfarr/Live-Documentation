# packages/shared/src/rules/relationshipRuleAudit.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/rules/relationshipRuleAudit.ts
- Live Doc ID: LD-implementation-packages-shared-src-rules-relationshipruleaudit-ts
- Generated At: 2025-12-11T02:38:02.234Z

## Authored
### Purpose
Evaluates compiled relationship rules against the graph to surface coverage diagnostics and human-readable gaps, feeding both CLI audits and Live Doc evidence.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

### Notes
- Formats JSON and text diagnostics used by `graph-tools/audit-doc-coverage.ts` after symbol-correctness profiles landed, ensuring missing relationships can be triaged quickly.[AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-30.SUMMARIZED.md#turn-26-add-symbol-correctness-profiles--wire-them-into-audits-lines-5711-6120]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.234Z","inputHash":"ebe2d1978bcf89a1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RelationshipCoverageChain` {#symbol-relationshipcoveragechain}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L11)

#### `RelationshipCoverageIssueKind` {#symbol-relationshipcoverageissuekind}
- Type: type
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L17)

#### `RelationshipCoverageIssue` {#symbol-relationshipcoverageissue}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L19)

#### `RelationshipCoverageRuleResult` {#symbol-relationshipcoverageruleresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L31)

#### `RelationshipCoverageResult` {#symbol-relationshipcoverageresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L38)

#### `EvaluateRelationshipCoverageOptions` {#symbol-evaluaterelationshipcoverageoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L42)

#### `evaluateRelationshipCoverage` {#symbol-evaluaterelationshipcoverage}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L48)
- Returns: [`RelationshipCoverageResult`](#symbol-relationshipcoverageresult)
- Parameters: `options`: [`EvaluateRelationshipCoverageOptions`](#symbol-evaluaterelationshipcoverageoptions)

#### `RelationshipCoverageDiagnostic` {#symbol-relationshipcoveragediagnostic}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L345)

#### `formatRelationshipDiagnostics` {#symbol-formatrelationshipdiagnostics}
- Type: function
- Source: [source](../../../../../../packages/shared/src/rules/relationshipRuleAudit.ts#L354)
- Returns: [`RelationshipCoverageDiagnostic`](#symbol-relationshipcoveragediagnostic)[]
- Parameters: `result`: [`RelationshipCoverageResult`](#symbol-relationshipcoverageresult)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graphStore.GraphStore`](../db/graphStore.ts.mdmd.md#symbol-graphstore) (type-only)
- [`artifacts.KnowledgeArtifact`](../domain/artifacts.ts.mdmd.md#symbol-knowledgeartifact) (type-only)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRule`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprule) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRuleStep`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprulestep) (type-only)
- [`relationshipRuleTypes.CompiledRelationshipRules`](./relationshipRuleTypes.ts.mdmd.md#symbol-compiledrelationshiprules) (type-only)
- [`relationshipRuleTypes.RelationshipRuleWarning`](./relationshipRuleTypes.ts.mdmd.md#symbol-relationshiprulewarning) (type-only)
- [`pathUtils.toWorkspaceRelativePath`](../tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
<!-- LIVE-DOC:END Dependencies -->
