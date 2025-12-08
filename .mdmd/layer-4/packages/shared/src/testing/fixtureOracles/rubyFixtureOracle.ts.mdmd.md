# packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-rubyfixtureoracle-ts
- Generated At: 2025-12-07T21:41:19.555Z

## Authored
### Purpose
Parses Ruby fixtures with a lightweight AST walk to extract `require` and `include` relationships, giving our polyglot benchmarks compiler-grade edges without depending on MRI internals <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Keep the doc-comment scrubbing heuristics aligned with the Ruby fixtures; Nov 14 reviews flagged this module as the place to harden against documentation-induced false positives <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3008-L3040>.
- Verified in the Nov 16 unit sweep alongside the other fixture oracles, so rerun `npm run test:unit -- rubyFixtureOracle` after meaningful parser changes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:19.555Z","inputHash":"211c1bdfd6a40300"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RubyOracleEdgeRelation` {#symbol-rubyoracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L4)

#### `RubyOracleProvenance` {#symbol-rubyoracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L6)

#### `RubyOracleEdge` {#symbol-rubyoracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L8)

#### `RubyOracleEdgeRecord` {#symbol-rubyoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L15)

#### `RubyFixtureOracleOptions` {#symbol-rubyfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L21)

#### `RubyOracleOverrideEntry` {#symbol-rubyoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L27)

#### `RubyOracleOverrideConfig` {#symbol-rubyoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L33)

#### `RubyOracleSegmentPartition` {#symbol-rubyoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L37)

#### `RubyOracleMergeResult` {#symbol-rubyoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L44)

#### `generateRubyFixtureGraph` {#symbol-generaterubyfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L61)
- Returns: [`RubyOracleEdge`](#symbol-rubyoracleedge)[]
- Parameters: `options`: [`RubyFixtureOracleOptions`](#symbol-rubyfixtureoracleoptions)

#### `serializeRubyOracleEdges` {#symbol-serializerubyoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L80)
- Parameters: `edges`: [`RubyOracleEdge`](#symbol-rubyoracleedge)[]

#### `partitionRubyOracleSegments` {#symbol-partitionrubyoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L85)
- Returns: [`RubyOracleSegmentPartition`](#symbol-rubyoraclesegmentpartition)
- Parameters: `edges`: [`RubyOracleEdge`](#symbol-rubyoracleedge)[]; `overrides`: [`RubyOracleOverrideConfig`](#symbol-rubyoracleoverrideconfig)

#### `mergeRubyOracleEdges` {#symbol-mergerubyoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts#L121)
- Returns: [`RubyOracleMergeResult`](#symbol-rubyoraclemergeresult)
- Parameters: `edges`: [`RubyOracleEdge`](#symbol-rubyoracleedge)[]; `overrides`: [`RubyOracleOverrideConfig`](#symbol-rubyoracleoverrideconfig)
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
