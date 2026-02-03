# packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-csharpfixtureoracle-ts
- Generated At: 2026-02-03T21:55:40.964Z

## Authored
### Purpose
Uses Roslyn-style parsing via regex and include analysis to map `using` directives and project references in our C# fixtures, giving the benchmark suite language-native edges without invoking MSBuild <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L3220-L3270>.

### Notes
- The Nov 6 regression where type-usage edges miscounted references drove additional assertions in its unit suite; keep the fix in mind when adjusting namespace heuristics <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L3588-L3776>.
- Continues to pass under the Nov 16 unit sweep, so re-run `npm run test:unit -- csharpFixtureOracle` after parser updates <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.964Z","inputHash":"d3f35419016f1d5f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CSharpOracleEdgeRelation` {#symbol-csharporacleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L9)

##### `CSharpOracleEdgeRelation` — Summary
SCIP-grounded relation taxonomy.
All type usage relationships map to "references" in the canonical taxonomy.

#### `CSharpOracleProvenance` {#symbol-csharporacleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L11)

#### `CSharpOracleEdge` {#symbol-csharporacleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L13)

#### `CSharpOracleEdgeRecord` {#symbol-csharporacleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L20)

#### `CSharpFixtureOracleOptions` {#symbol-csharpfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L26)

#### `CSharpOracleOverrideEntry` {#symbol-csharporacleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L32)

#### `CSharpOracleOverrideConfig` {#symbol-csharporacleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L38)

#### `CSharpOracleSegmentPartition` {#symbol-csharporaclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L42)

#### `CSharpOracleMergeResult` {#symbol-csharporaclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L49)

#### `generateCSharpFixtureGraph` {#symbol-generatecsharpfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L124)
- Returns: [`CSharpOracleEdge`](#symbol-csharporacleedge)[]
- Parameters: `options`: [`CSharpFixtureOracleOptions`](#symbol-csharpfixtureoracleoptions)

#### `serializeCSharpOracleEdges` {#symbol-serializecsharporacleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L155)
- Parameters: `edges`: [`CSharpOracleEdge`](#symbol-csharporacleedge)[]

#### `partitionCSharpOracleSegments` {#symbol-partitioncsharporaclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L160)
- Returns: [`CSharpOracleSegmentPartition`](#symbol-csharporaclesegmentpartition)
- Parameters: `edges`: [`CSharpOracleEdge`](#symbol-csharporacleedge)[]; `overrides`: [`CSharpOracleOverrideConfig`](#symbol-csharporacleoverrideconfig)

#### `mergeCSharpOracleEdges` {#symbol-mergecsharporacleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts#L196)
- Returns: [`CSharpOracleMergeResult`](#symbol-csharporaclemergeresult)
- Parameters: `edges`: [`CSharpOracleEdge`](#symbol-csharporacleedge)[]; `overrides`: [`CSharpOracleOverrideConfig`](#symbol-csharporacleoverrideconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `minimatch` - `minimatch`
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [csharpFixtureOracle.test.ts](./csharpFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
