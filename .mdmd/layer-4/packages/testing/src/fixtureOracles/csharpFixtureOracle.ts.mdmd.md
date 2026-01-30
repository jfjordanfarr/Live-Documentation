# packages/testing/src/fixtureOracles/csharpFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/csharpFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-csharpfixtureoracle-ts
- Generated At: 2026-01-30T00:07:24.126Z

## Authored
### Purpose
C# fixture oracle. Generates ground-truth dependency edges by analyzing using directives and type usage across C# source files. Produces `expected.json` for C# benchmark fixtures.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Builds a type index from namespace/class definitions and detects cross-file references via regex-based type usage analysis. Comments are stripped to avoid false positives.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.126Z","inputHash":"b313cd72354aedbb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CSharpOracleEdgeRelation` {#symbol-csharporacleedgerelation}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L5)

#### `CSharpOracleProvenance` {#symbol-csharporacleprovenance}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L7)

#### `CSharpOracleEdge` {#symbol-csharporacleedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L9)

#### `CSharpOracleEdgeRecord` {#symbol-csharporacleedgerecord}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L16)

#### `CSharpFixtureOracleOptions` {#symbol-csharpfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L22)

#### `CSharpOracleOverrideEntry` {#symbol-csharporacleoverrideentry}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L28)

#### `CSharpOracleOverrideConfig` {#symbol-csharporacleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L34)

#### `CSharpOracleSegmentPartition` {#symbol-csharporaclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L38)

#### `CSharpOracleMergeResult` {#symbol-csharporaclemergeresult}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L45)

#### `generateCSharpFixtureGraph` {#symbol-generatecsharpfixturegraph}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L125)
- Returns: [`CSharpOracleEdge`](../../../shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleedge)[]
- Parameters: `options`: [`CSharpFixtureOracleOptions`](../../../shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharpfixtureoracleoptions)

#### `serializeCSharpOracleEdges` {#symbol-serializecsharporacleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L156)
- Parameters: `edges`: [`CSharpOracleEdge`](../../../shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleedge)[]

#### `partitionCSharpOracleSegments` {#symbol-partitioncsharporaclesegments}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L161)
- Returns: [`CSharpOracleSegmentPartition`](../../../shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporaclesegmentpartition)
- Parameters: `edges`: [`CSharpOracleEdge`](../../../shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleedge)[]; `overrides`: [`CSharpOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleoverrideconfig)

#### `mergeCSharpOracleEdges` {#symbol-mergecsharporacleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/csharpFixtureOracle.ts#L197)
- Returns: [`CSharpOracleMergeResult`](../../../shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporaclemergeresult)
- Parameters: `edges`: [`CSharpOracleEdge`](../../../shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleedge)[]; `overrides`: [`CSharpOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleoverrideconfig)
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
