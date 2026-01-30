# packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-pythonfixtureoracle-ts
- Generated At: 2026-01-30T00:04:21.263Z

## Authored
### Purpose
Executes Python fixtures through the CPython interpreter to emit ground-truth dependency edges, letting our benchmarks validate analyzer output against real module imports without manual curation <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L2694-L2744>.

### Notes
- The Nov 4 benchmark sweep reported perfect precision/recall across python-basic, pipeline, and requests scenarios after wiring this oracle, so any future drift should trigger a regeneration and review <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L2848-L2884>.
- Continues to run under the full unit suite (Nov 16) to guard subprocess handling and override merging <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:04:21.263Z","inputHash":"ff8dca64da8aba99"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PythonOracleEdgeRelation` {#symbol-pythonoracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L5)

#### `PythonOracleProvenance` {#symbol-pythonoracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L6)

#### `PythonOracleEdge` {#symbol-pythonoracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L8)

#### `PythonOracleEdgeRecord` {#symbol-pythonoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L15)

#### `PythonFixtureOracleOptions` {#symbol-pythonfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L21)

#### `PythonOracleOverrideEntry` {#symbol-pythonoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L31)

#### `PythonOracleOverrideConfig` {#symbol-pythonoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L37)

#### `PythonOracleSegmentPartition` {#symbol-pythonoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L41)

#### `PythonOracleMergeResult` {#symbol-pythonoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L48)

#### `generatePythonFixtureGraph` {#symbol-generatepythonfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L71)
- Parameters: `options`: [`PythonFixtureOracleOptions`](../../../../testing/src/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonfixtureoracleoptions)

#### `serializePythonOracleEdges` {#symbol-serializepythonoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L93)
- Parameters: `edges`: [`PythonOracleEdge`](../../../../testing/src/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleedge)[]

#### `partitionPythonOracleSegments` {#symbol-partitionpythonoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L98)
- Returns: [`PythonOracleSegmentPartition`](../../../../testing/src/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoraclesegmentpartition)
- Parameters: `edges`: [`PythonOracleEdge`](../../../../testing/src/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleedge)[]; `overrides`: [`PythonOracleOverrideConfig`](../../../../testing/src/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleoverrideconfig)

#### `mergePythonOracleEdges` {#symbol-mergepythonoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts#L134)
- Returns: [`PythonOracleMergeResult`](../../../../testing/src/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoraclemergeresult)
- Parameters: `edges`: [`PythonOracleEdge`](../../../../testing/src/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleedge)[]; `overrides`: [`PythonOracleOverrideConfig`](../../../../testing/src/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleoverrideconfig)
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
