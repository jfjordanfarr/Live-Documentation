# packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-typescriptfixtureoracle-ts
- Generated At: 2026-01-30T00:07:24.158Z

## Authored
### Purpose
TypeScript fixture oracle. Generates ground-truth dependency edges using the TypeScript compiler API for module resolution and import classification. Distinguishes runtime vs type-only imports. Produces `expected.json` for TypeScript benchmark fixtures.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Uses `ts.resolveModuleName` for accurate module resolution and `collectIdentifierUsage` to classify whether imports are used at runtime or only as types.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.158Z","inputHash":"48594eb3ea7e5a84"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `OracleEdgeRelation` {#symbol-oracleedgerelation}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L13)

#### `OracleEdgeProvenance` {#symbol-oracleedgeprovenance}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L15)

#### `OracleEdge` {#symbol-oracleedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L17)

#### `OracleEdgeRecord` {#symbol-oracleedgerecord}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L24)

#### `TypeScriptFixtureOracleOptions` {#symbol-typescriptfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L30)

#### `OracleOverrideEntry` {#symbol-oracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L36)

#### `OracleOverrideConfig` {#symbol-oracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L42)

#### `OracleSegmentPartition` {#symbol-oraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L46)

#### `OracleMergeResult` {#symbol-oraclemergeresult}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L53)

#### `generateTypeScriptFixtureGraph` {#symbol-generatetypescriptfixturegraph}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L75)
- Returns: [`OracleEdge`](../../../shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleedge)[]
- Parameters: `options`: [`TypeScriptFixtureOracleOptions`](../../../shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-typescriptfixtureoracleoptions)

#### `serializeOracleEdges` {#symbol-serializeoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L188)
- Parameters: `edges`: [`OracleEdge`](../../../shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleedge)[]

#### `partitionOracleSegments` {#symbol-partitionoraclesegments}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L193)
- Returns: [`OracleSegmentPartition`](../../../shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oraclesegmentpartition)
- Parameters: `edges`: [`OracleEdge`](../../../shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleedge)[]; `overrides`: [`OracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleoverrideconfig)

#### `mergeOracleEdges` {#symbol-mergeoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/typeScriptFixtureOracle.ts#L229)
- Returns: [`OracleMergeResult`](../../../shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oraclemergeresult)
- Parameters: `edges`: [`OracleEdge`](../../../shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleedge)[]; `overrides`: [`OracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleoverrideconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
- [`typeScriptAstUtils.collectIdentifierUsage`](../../../shared/src/language/typeScriptAstUtils.ts.mdmd.md#symbol-collectidentifierusage)
- [`typeScriptAstUtils.extractLocalImportNames`](../../../shared/src/language/typeScriptAstUtils.ts.mdmd.md#symbol-extractlocalimportnames)
- [`typeScriptAstUtils.hasRuntimeUsage`](../../../shared/src/language/typeScriptAstUtils.ts.mdmd.md#symbol-hasruntimeusage)
- [`typeScriptAstUtils.hasTypeUsage`](../../../shared/src/language/typeScriptAstUtils.ts.mdmd.md#symbol-hastypeusage)
- [`typeScriptAstUtils.isLikelyTypeDefinitionSpecifier`](../../../shared/src/language/typeScriptAstUtils.ts.mdmd.md#symbol-islikelytypedefinitionspecifier)
- `typescript` - `ts`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [typeScriptFixtureOracle.test.ts](./typeScriptFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
