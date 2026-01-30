# packages/testing/src/fixtureOracles/javaFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/javaFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-javafixtureoracle-ts
- Generated At: 2026-01-30T00:07:24.140Z

## Authored
### Purpose
Java fixture oracle. Generates ground-truth dependency edges by analyzing import statements and same-package type references. Produces `expected.json` for Java benchmark fixtures.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Builds a package index from `package` declarations and maps fully-qualified imports to source files. Also detects unqualified same-package references.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.140Z","inputHash":"19a618c7de1db230"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `JavaOracleEdgeRelation` {#symbol-javaoracleedgerelation}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L4)

#### `JavaOracleProvenance` {#symbol-javaoracleprovenance}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L6)

#### `JavaOracleEdge` {#symbol-javaoracleedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L8)

#### `JavaOracleEdgeRecord` {#symbol-javaoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L15)

#### `JavaFixtureOracleOptions` {#symbol-javafixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L21)

#### `JavaOracleOverrideEntry` {#symbol-javaoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L27)

#### `JavaOracleOverrideConfig` {#symbol-javaoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L33)

#### `JavaOracleSegmentPartition` {#symbol-javaoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L37)

#### `JavaOracleMergeResult` {#symbol-javaoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L44)

#### `generateJavaFixtureGraph` {#symbol-generatejavafixturegraph}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L67)
- Returns: [`JavaOracleEdge`](../../../shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoracleedge)[]
- Parameters: `options`: [`JavaFixtureOracleOptions`](../../../shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javafixtureoracleoptions)

#### `serializeJavaOracleEdges` {#symbol-serializejavaoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L93)
- Parameters: `edges`: [`JavaOracleEdge`](../../../shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoracleedge)[]

#### `partitionJavaOracleSegments` {#symbol-partitionjavaoraclesegments}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L98)
- Returns: [`JavaOracleSegmentPartition`](../../../shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoraclesegmentpartition)
- Parameters: `edges`: [`JavaOracleEdge`](../../../shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoracleedge)[]; `overrides`: [`JavaOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoracleoverrideconfig)

#### `mergeJavaOracleEdges` {#symbol-mergejavaoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/javaFixtureOracle.ts#L134)
- Returns: [`JavaOracleMergeResult`](../../../shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoraclemergeresult)
- Parameters: `edges`: [`JavaOracleEdge`](../../../shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoracleedge)[]; `overrides`: [`JavaOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoracleoverrideconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [javaFixtureOracle.test.ts](./javaFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
