# packages/testing/src/fixtureOracles/cFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/cFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-cfixtureoracle-ts
- Generated At: 2026-01-30T00:07:24.121Z

## Authored
### Purpose
C language fixture oracle. Generates ground-truth dependency edges for C codebases by analyzing `#include` directives and function call sites. Produces `expected.json` for C benchmark fixtures.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Extracts include relationships from header references and cross-file function calls from translation units.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.121Z","inputHash":"05f4254e12b9a2d3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `COracleEdgeRelation` {#symbol-coracleedgerelation}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L5)

#### `COracleProvenance` {#symbol-coracleprovenance}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L7)

#### `COracleEdge` {#symbol-coracleedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L9)

#### `COracleEdgeRecord` {#symbol-coracleedgerecord}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L16)

#### `CFixtureOracleOptions` {#symbol-cfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L22)

#### `COracleOverrideEntry` {#symbol-coracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L29)

#### `COracleOverrideConfig` {#symbol-coracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L35)

#### `COracleSegmentPartition` {#symbol-coraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L39)

#### `COracleMergeResult` {#symbol-coraclemergeresult}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L46)

#### `generateCFixtureGraph` {#symbol-generatecfixturegraph}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L82)
- Returns: [`COracleEdge`](../../../shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coracleedge)[]
- Parameters: `options`: [`CFixtureOracleOptions`](../../../shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-cfixtureoracleoptions)

#### `serializeCOracleEdges` {#symbol-serializecoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L155)
- Parameters: `edges`: [`COracleEdge`](../../../shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coracleedge)[]

#### `partitionCOracleSegments` {#symbol-partitioncoraclesegments}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L160)
- Returns: [`COracleSegmentPartition`](../../../shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coraclesegmentpartition)
- Parameters: `edges`: [`COracleEdge`](../../../shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coracleedge)[]; `overrides`: [`COracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coracleoverrideconfig)

#### `mergeCOracleEdges` {#symbol-mergecoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/cFixtureOracle.ts#L196)
- Returns: [`COracleMergeResult`](../../../shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coraclemergeresult)
- Parameters: `edges`: [`COracleEdge`](../../../shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coracleedge)[]; `overrides`: [`COracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coracleoverrideconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `globSync`
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [cFixtureOracle.test.ts](./cFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
