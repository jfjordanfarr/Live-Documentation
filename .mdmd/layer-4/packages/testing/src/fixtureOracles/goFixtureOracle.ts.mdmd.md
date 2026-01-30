# packages/testing/src/fixtureOracles/goFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/goFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-gofixtureoracle-ts
- Generated At: 2026-01-30T00:07:24.131Z

## Authored
### Purpose
Go fixture oracle. Generates ground-truth dependency edges by parsing `import` statements against `go.mod` module paths. Maps import paths to local package files and produces `expected.json` for Go benchmark fixtures.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Go packages can span multiple files; this oracle picks one representative file per package (preferring the one named after the package directory).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.131Z","inputHash":"8f22410c4268ac3a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GoOracleEdgeRelation` {#symbol-gooracleedgerelation}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L4)

#### `GoOracleProvenance` {#symbol-gooracleprovenance}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L6)

#### `GoOracleEdge` {#symbol-gooracleedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L8)

#### `GoOracleEdgeRecord` {#symbol-gooracleedgerecord}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L15)

#### `GoFixtureOracleOptions` {#symbol-gofixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L21)

#### `GoOracleOverrideEntry` {#symbol-gooracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L27)

#### `GoOracleOverrideConfig` {#symbol-gooracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L33)

#### `GoOracleSegmentPartition` {#symbol-gooraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L37)

#### `GoOracleMergeResult` {#symbol-gooraclemergeresult}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L44)

#### `generateGoFixtureGraph` {#symbol-generategofixturegraph}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L77)
- Returns: [`GoOracleEdge`](../../../shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleedge)[]
- Parameters: `options`: [`GoFixtureOracleOptions`](../../../shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gofixtureoracleoptions)

##### `generateGoFixtureGraph` — Summary
Generates the fixture graph by analyzing Go source files.

##### `generateGoFixtureGraph` — Remarks
Go packages can span multiple files. This oracle:
1. Finds all .go files in the fixture
2. Reads go.mod for module name
3. Maps import paths to local package files
4. Produces edges from each source file to its imported packages

#### `serializeGoOracleEdges` {#symbol-serializegooracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L98)
- Parameters: `edges`: [`GoOracleEdge`](../../../shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleedge)[]

#### `partitionGoOracleSegments` {#symbol-partitiongooraclesegments}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L103)
- Returns: [`GoOracleSegmentPartition`](../../../shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooraclesegmentpartition)
- Parameters: `edges`: [`GoOracleEdge`](../../../shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleedge)[]; `overrides`: [`GoOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleoverrideconfig)

#### `mergeGoOracleEdges` {#symbol-mergegooracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/goFixtureOracle.ts#L139)
- Returns: [`GoOracleMergeResult`](../../../shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooraclemergeresult)
- Parameters: `edges`: [`GoOracleEdge`](../../../shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleedge)[]; `overrides`: [`GoOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleoverrideconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [goFixtureOracle.test.ts](./goFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
