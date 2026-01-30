# packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-gofixtureoracle-ts
- Generated At: 2026-01-30T00:04:21.255Z

## Authored
### Purpose
Ground-truth edge generator for Go benchmark fixtures. Analyzes Go source files to produce canonical dependency edges (`expected.json`) that serve as the oracle against which inference accuracy is measured.

### Notes
- Created during [2026-01-15 dev session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) as part of Go Rosetta fixture implementation
- Follows the pattern established by [rustFixtureOracle.ts](./rustFixtureOracle.ts.mdmd.md) and other language oracles
- Handles Go's package-per-directory structure by building a package index from `go.mod`
- Supports manual edge overrides via `oracle.overrides.json` for edges that static analysis cannot detect
- Uses "imports" for main.go and "uses" for library files to match heuristic behavior

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:04:21.255Z","inputHash":"78878d53de479bf7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GoOracleEdgeRelation` {#symbol-gooracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L4)

#### `GoOracleProvenance` {#symbol-gooracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L6)

#### `GoOracleEdge` {#symbol-gooracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L8)

#### `GoOracleEdgeRecord` {#symbol-gooracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L15)

#### `GoFixtureOracleOptions` {#symbol-gofixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L21)

#### `GoOracleOverrideEntry` {#symbol-gooracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L27)

#### `GoOracleOverrideConfig` {#symbol-gooracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L33)

#### `GoOracleSegmentPartition` {#symbol-gooraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L37)

#### `GoOracleMergeResult` {#symbol-gooraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L44)

#### `generateGoFixtureGraph` {#symbol-generategofixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L77)
- Returns: [`GoOracleEdge`](../../../../testing/src/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleedge)[]
- Parameters: `options`: [`GoFixtureOracleOptions`](../../../../testing/src/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gofixtureoracleoptions)

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
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L98)
- Parameters: `edges`: [`GoOracleEdge`](../../../../testing/src/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleedge)[]

#### `partitionGoOracleSegments` {#symbol-partitiongooraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L103)
- Returns: [`GoOracleSegmentPartition`](../../../../testing/src/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooraclesegmentpartition)
- Parameters: `edges`: [`GoOracleEdge`](../../../../testing/src/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleedge)[]; `overrides`: [`GoOracleOverrideConfig`](../../../../testing/src/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleoverrideconfig)

#### `mergeGoOracleEdges` {#symbol-mergegooracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts#L139)
- Returns: [`GoOracleMergeResult`](../../../../testing/src/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooraclemergeresult)
- Parameters: `edges`: [`GoOracleEdge`](../../../../testing/src/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleedge)[]; `overrides`: [`GoOracleOverrideConfig`](../../../../testing/src/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleoverrideconfig)
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
