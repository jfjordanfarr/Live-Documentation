# packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-typescriptfixtureoracle-ts
- Generated At: 2026-01-30T23:50:04.306Z

## Authored
### Purpose
Builds compiler-derived dependency edges for TypeScript benchmark fixtures so regeneration tooling can compare analyzer output against ground truth without hand-maintained graphs <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-32-begin-oracle-implementation-lines-3661-3800>.

### Notes
- Integrated with the regeneration CLI (`scripts/fixture-tools/regenerate-ts-benchmarks.ts`) and oracle overrides during the same initiative, ensuring regenerated fixtures and expected graphs stay in lockstep <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.
- Regularly re-run via `npm run test:unit -- typeScriptFixtureOracle` and the broader unit sweep (latest on Nov 16) to guard the classification logic and serialization contract <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T23:50:04.306Z","inputHash":"9c66f2f3f9af8084"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OracleEdgeRelation` {#symbol-oracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L17)

##### `OracleEdgeRelation` — Summary
SCIP-grounded relation taxonomy.
All import/export relationships map to "references" in the canonical taxonomy.

#### `OracleEdgeProvenance` {#symbol-oracleedgeprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L19)

#### `OracleEdge` {#symbol-oracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L21)

#### `OracleEdgeRecord` {#symbol-oracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L28)

#### `TypeScriptFixtureOracleOptions` {#symbol-typescriptfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L34)

#### `OracleOverrideEntry` {#symbol-oracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L40)

#### `OracleOverrideConfig` {#symbol-oracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L46)

#### `OracleSegmentPartition` {#symbol-oraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L50)

#### `OracleMergeResult` {#symbol-oraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L57)

#### `generateTypeScriptFixtureGraph` {#symbol-generatetypescriptfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L79)
- Returns: [`OracleEdge`](#symbol-oracleedge)[]
- Parameters: `options`: [`TypeScriptFixtureOracleOptions`](#symbol-typescriptfixtureoracleoptions)

#### `serializeOracleEdges` {#symbol-serializeoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L190)
- Parameters: `edges`: [`OracleEdge`](#symbol-oracleedge)[]

#### `partitionOracleSegments` {#symbol-partitionoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L195)
- Returns: [`OracleSegmentPartition`](#symbol-oraclesegmentpartition)
- Parameters: `edges`: [`OracleEdge`](#symbol-oracleedge)[]; `overrides`: [`OracleOverrideConfig`](#symbol-oracleoverrideconfig)

#### `mergeOracleEdges` {#symbol-mergeoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts#L231)
- Returns: [`OracleMergeResult`](#symbol-oraclemergeresult)
- Parameters: `edges`: [`OracleEdge`](#symbol-oracleedge)[]; `overrides`: [`OracleOverrideConfig`](#symbol-oracleoverrideconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`typeScriptAstUtils.collectIdentifierUsage`](../../language/typeScriptAstUtils.ts.mdmd.md#symbol-collectidentifierusage)
- [`typeScriptAstUtils.extractLocalImportNames`](../../language/typeScriptAstUtils.ts.mdmd.md#symbol-extractlocalimportnames)
- [`typeScriptAstUtils.hasRuntimeUsage`](../../language/typeScriptAstUtils.ts.mdmd.md#symbol-hasruntimeusage)
- [`typeScriptAstUtils.hasTypeUsage`](../../language/typeScriptAstUtils.ts.mdmd.md#symbol-hastypeusage)
- [`typeScriptAstUtils.isLikelyTypeDefinitionSpecifier`](../../language/typeScriptAstUtils.ts.mdmd.md#symbol-islikelytypedefinitionspecifier)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [typeScriptFixtureOracle.test.ts](./typeScriptFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
