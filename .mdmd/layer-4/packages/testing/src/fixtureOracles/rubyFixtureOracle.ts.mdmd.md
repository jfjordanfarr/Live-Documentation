# packages/testing/src/fixtureOracles/rubyFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/rubyFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-rubyfixtureoracle-ts
- Generated At: 2026-01-30T00:07:24.148Z

## Authored
### Purpose
Ruby fixture oracle. Generates ground-truth dependency edges by analyzing `require_relative` statements. Produces `expected.json` for Ruby benchmark fixtures.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Resolves relative require paths to actual files within the fixture root.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.148Z","inputHash":"b904f188379c51b8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RubyOracleEdgeRelation` {#symbol-rubyoracleedgerelation}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L4)

#### `RubyOracleProvenance` {#symbol-rubyoracleprovenance}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L6)

#### `RubyOracleEdge` {#symbol-rubyoracleedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L8)

#### `RubyOracleEdgeRecord` {#symbol-rubyoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L15)

#### `RubyFixtureOracleOptions` {#symbol-rubyfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L21)

#### `RubyOracleOverrideEntry` {#symbol-rubyoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L27)

#### `RubyOracleOverrideConfig` {#symbol-rubyoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L33)

#### `RubyOracleSegmentPartition` {#symbol-rubyoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L37)

#### `RubyOracleMergeResult` {#symbol-rubyoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L44)

#### `generateRubyFixtureGraph` {#symbol-generaterubyfixturegraph}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L61)
- Returns: [`RubyOracleEdge`](../../../shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleedge)[]
- Parameters: `options`: [`RubyFixtureOracleOptions`](../../../shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyfixtureoracleoptions)

#### `serializeRubyOracleEdges` {#symbol-serializerubyoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L80)
- Parameters: `edges`: [`RubyOracleEdge`](../../../shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleedge)[]

#### `partitionRubyOracleSegments` {#symbol-partitionrubyoraclesegments}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L85)
- Returns: [`RubyOracleSegmentPartition`](../../../shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoraclesegmentpartition)
- Parameters: `edges`: [`RubyOracleEdge`](../../../shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleedge)[]; `overrides`: [`RubyOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleoverrideconfig)

#### `mergeRubyOracleEdges` {#symbol-mergerubyoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rubyFixtureOracle.ts#L121)
- Returns: [`RubyOracleMergeResult`](../../../shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoraclemergeresult)
- Parameters: `edges`: [`RubyOracleEdge`](../../../shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleedge)[]; `overrides`: [`RubyOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleoverrideconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [rubyFixtureOracle.test.ts](./rubyFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
