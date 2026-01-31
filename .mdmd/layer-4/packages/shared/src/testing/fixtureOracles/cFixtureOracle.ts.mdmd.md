# packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-cfixtureoracle-ts
- Generated At: 2026-01-30T23:50:04.274Z

## Authored
### Purpose
Parses the C benchmark fixtures to infer `#include` and function-call edges so our analyzer’s C pipeline can be diffed against compiler-grounded expectations <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Early Nov 5 failures around multi-target call graphs led to tightened edge classification; keep the regression suite handy if new macros or includes expand the surface <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L4240-L4320>.
- Still validated in the Nov 16 unit run, so rerun `npm run test:unit -- cFixtureOracle` after parser or glob changes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T23:50:04.274Z","inputHash":"d00cfa8edf98b43a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `COracleEdgeRelation` {#symbol-coracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L9)

##### `COracleEdgeRelation` — Summary
SCIP-grounded relation taxonomy.
Both includes and function calls map to "references" in the canonical taxonomy.

#### `COracleProvenance` {#symbol-coracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L11)

#### `COracleEdge` {#symbol-coracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L13)

#### `COracleEdgeRecord` {#symbol-coracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L20)

#### `CFixtureOracleOptions` {#symbol-cfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L26)

#### `COracleOverrideEntry` {#symbol-coracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L32)

#### `COracleOverrideConfig` {#symbol-coracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L38)

#### `COracleSegmentPartition` {#symbol-coraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L42)

#### `COracleMergeResult` {#symbol-coraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L49)

#### `generateCFixtureGraph` {#symbol-generatecfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L85)
- Returns: [`COracleEdge`](#symbol-coracleedge)[]
- Parameters: `options`: [`CFixtureOracleOptions`](#symbol-cfixtureoracleoptions)

#### `serializeCOracleEdges` {#symbol-serializecoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L155)
- Parameters: `edges`: [`COracleEdge`](#symbol-coracleedge)[]

#### `partitionCOracleSegments` {#symbol-partitioncoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L160)
- Returns: [`COracleSegmentPartition`](#symbol-coraclesegmentpartition)
- Parameters: `edges`: [`COracleEdge`](#symbol-coracleedge)[]; `overrides`: [`COracleOverrideConfig`](#symbol-coracleoverrideconfig)

#### `mergeCOracleEdges` {#symbol-mergecoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts#L196)
- Returns: [`COracleMergeResult`](#symbol-coraclemergeresult)
- Parameters: `edges`: [`COracleEdge`](#symbol-coracleedge)[]; `overrides`: [`COracleOverrideConfig`](#symbol-coracleoverrideconfig)
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
