# packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-javafixtureoracle-ts
- Generated At: 2026-01-30T23:50:04.288Z

## Authored
### Purpose
Analyzes Java fixtures to emit import and inheritance edges, giving our polyglot benchmarks JVM-accurate relationships without invoking `javac` <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Documented on Nov 9 as the canonical surface backing the Java benchmark expectations; lean on that MDMD guidance when expanding fixtures <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-09.md#L4688-L4710>.
- Verified within the Nov 16 unit sweep; rerun `npm run test:unit -- javaFixtureOracle` after parser or override changes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T23:50:04.288Z","inputHash":"2cb92ac8d5dc876f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `JavaOracleEdgeRelation` {#symbol-javaoracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L8)

##### `JavaOracleEdgeRelation` — Summary
SCIP-grounded relation taxonomy.
All import relationships map to "references" in the canonical taxonomy.

#### `JavaOracleProvenance` {#symbol-javaoracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L10)

#### `JavaOracleEdge` {#symbol-javaoracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L12)

#### `JavaOracleEdgeRecord` {#symbol-javaoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L19)

#### `JavaFixtureOracleOptions` {#symbol-javafixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L25)

#### `JavaOracleOverrideEntry` {#symbol-javaoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L31)

#### `JavaOracleOverrideConfig` {#symbol-javaoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L37)

#### `JavaOracleSegmentPartition` {#symbol-javaoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L41)

#### `JavaOracleMergeResult` {#symbol-javaoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L48)

#### `generateJavaFixtureGraph` {#symbol-generatejavafixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L66)
- Returns: [`JavaOracleEdge`](#symbol-javaoracleedge)[]
- Parameters: `options`: [`JavaFixtureOracleOptions`](#symbol-javafixtureoracleoptions)

#### `serializeJavaOracleEdges` {#symbol-serializejavaoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L92)
- Parameters: `edges`: [`JavaOracleEdge`](#symbol-javaoracleedge)[]

#### `partitionJavaOracleSegments` {#symbol-partitionjavaoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L97)
- Returns: [`JavaOracleSegmentPartition`](#symbol-javaoraclesegmentpartition)
- Parameters: `edges`: [`JavaOracleEdge`](#symbol-javaoracleedge)[]; `overrides`: [`JavaOracleOverrideConfig`](#symbol-javaoracleoverrideconfig)

#### `mergeJavaOracleEdges` {#symbol-mergejavaoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts#L133)
- Returns: [`JavaOracleMergeResult`](#symbol-javaoraclemergeresult)
- Parameters: `edges`: [`JavaOracleEdge`](#symbol-javaoracleedge)[]; `overrides`: [`JavaOracleOverrideConfig`](#symbol-javaoracleoverrideconfig)
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
