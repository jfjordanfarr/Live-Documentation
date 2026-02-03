# packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-pythonfixtureoracle-ts
- Generated At: 2026-02-03T21:55:41.064Z

## Authored
### Purpose
Executes Python fixtures through the CPython interpreter to emit ground-truth dependency edges, letting our benchmarks validate analyzer output against real module imports without manual curation <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L2694-L2744>.

### Notes
- The Nov 4 benchmark sweep reported perfect precision/recall across python-basic, pipeline, and requests scenarios after wiring this oracle, so any future drift should trigger a regeneration and review <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L2848-L2884>.
- Continues to run under the full unit suite (Nov 16) to guard subprocess handling and override merging <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.064Z","inputHash":"6c28608b04c9824c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PythonOracleEdgeRelation` {#symbol-pythonoracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L9)

##### `PythonOracleEdgeRelation` — Summary
SCIP-grounded relation taxonomy.
All import relationships map to "references" in the canonical taxonomy.

#### `PythonOracleProvenance` {#symbol-pythonoracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L10)

#### `PythonOracleEdge` {#symbol-pythonoracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L12)

#### `PythonOracleEdgeRecord` {#symbol-pythonoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L19)

#### `PythonFixtureOracleOptions` {#symbol-pythonfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L25)

#### `PythonOracleOverrideEntry` {#symbol-pythonoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L35)

#### `PythonOracleOverrideConfig` {#symbol-pythonoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L41)

#### `PythonOracleSegmentPartition` {#symbol-pythonoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L45)

#### `PythonOracleMergeResult` {#symbol-pythonoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L52)

#### `generatePythonFixtureGraph` {#symbol-generatepythonfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L75)
- Parameters: `options`: [`PythonFixtureOracleOptions`](#symbol-pythonfixtureoracleoptions)

#### `serializePythonOracleEdges` {#symbol-serializepythonoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L97)
- Parameters: `edges`: [`PythonOracleEdge`](#symbol-pythonoracleedge)[]

#### `partitionPythonOracleSegments` {#symbol-partitionpythonoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L102)
- Returns: [`PythonOracleSegmentPartition`](#symbol-pythonoraclesegmentpartition)
- Parameters: `edges`: [`PythonOracleEdge`](#symbol-pythonoracleedge)[]; `overrides`: [`PythonOracleOverrideConfig`](#symbol-pythonoracleoverrideconfig)

#### `mergePythonOracleEdges` {#symbol-mergepythonoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L138)
- Returns: [`PythonOracleMergeResult`](#symbol-pythonoraclemergeresult)
- Parameters: `edges`: [`PythonOracleEdge`](#symbol-pythonoracleedge)[]; `overrides`: [`PythonOracleOverrideConfig`](#symbol-pythonoracleoverrideconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawn`, `spawnSync`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [pythonFixtureOracle.test.ts](./pythonFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
