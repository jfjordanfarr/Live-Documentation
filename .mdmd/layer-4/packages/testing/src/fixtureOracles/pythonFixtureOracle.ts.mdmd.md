# packages/testing/src/fixtureOracles/pythonFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/pythonFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-pythonfixtureoracle-ts
- Generated At: 2026-01-30T00:07:24.144Z

## Authored
### Purpose
Python fixture oracle. Generates ground-truth dependency edges by delegating to a Python worker script that uses AST parsing to extract import relationships. Produces `expected.json` for Python benchmark fixtures.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Unlike other oracles, this spawns `python_oracle_worker.py` to leverage Python's native AST module for accurate import detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.144Z","inputHash":"279ed5ee4f1934ee"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PythonOracleEdgeRelation` {#symbol-pythonoracleedgerelation}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L5)

#### `PythonOracleProvenance` {#symbol-pythonoracleprovenance}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L6)

#### `PythonOracleEdge` {#symbol-pythonoracleedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L8)

#### `PythonOracleEdgeRecord` {#symbol-pythonoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L15)

#### `PythonFixtureOracleOptions` {#symbol-pythonfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L21)

#### `PythonOracleOverrideEntry` {#symbol-pythonoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L31)

#### `PythonOracleOverrideConfig` {#symbol-pythonoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L37)

#### `PythonOracleSegmentPartition` {#symbol-pythonoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L41)

#### `PythonOracleMergeResult` {#symbol-pythonoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L48)

#### `generatePythonFixtureGraph` {#symbol-generatepythonfixturegraph}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L71)
- Parameters: `options`: [`PythonFixtureOracleOptions`](../../../shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonfixtureoracleoptions)

#### `serializePythonOracleEdges` {#symbol-serializepythonoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L93)
- Parameters: `edges`: [`PythonOracleEdge`](../../../shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleedge)[]

#### `partitionPythonOracleSegments` {#symbol-partitionpythonoraclesegments}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L98)
- Returns: [`PythonOracleSegmentPartition`](../../../shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoraclesegmentpartition)
- Parameters: `edges`: [`PythonOracleEdge`](../../../shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleedge)[]; `overrides`: [`PythonOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleoverrideconfig)

#### `mergePythonOracleEdges` {#symbol-mergepythonoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/pythonFixtureOracle.ts#L134)
- Returns: [`PythonOracleMergeResult`](../../../shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoraclemergeresult)
- Parameters: `edges`: [`PythonOracleEdge`](../../../shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleedge)[]; `overrides`: [`PythonOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleoverrideconfig)
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
