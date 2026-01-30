# packages/testing/src/fixtureOracles/rustFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/rustFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-rustfixtureoracle-ts
- Generated At: 2026-01-30T00:07:24.152Z

## Authored
### Purpose
Rust fixture oracle. Generates ground-truth dependency edges by analyzing `use` statements and `mod` declarations. Produces `expected.json` for Rust benchmark fixtures.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Builds a module index from file paths and resolves `crate::`, `self::`, and `super::` path prefixes. Rustdoc comments are stripped to avoid false positives.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.152Z","inputHash":"b9fa3a52cb4b2eb8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RustOracleEdgeRelation` {#symbol-rustoracleedgerelation}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L4)

#### `RustOracleProvenance` {#symbol-rustoracleprovenance}
- Type: type
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L6)

#### `RustOracleEdge` {#symbol-rustoracleedge}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L8)

#### `RustOracleEdgeRecord` {#symbol-rustoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L15)

#### `RustFixtureOracleOptions` {#symbol-rustfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L21)

#### `RustOracleOverrideEntry` {#symbol-rustoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L27)

#### `RustOracleOverrideConfig` {#symbol-rustoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L33)

#### `RustOracleSegmentPartition` {#symbol-rustoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L37)

#### `RustOracleMergeResult` {#symbol-rustoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L44)

#### `generateRustFixtureGraph` {#symbol-generaterustfixturegraph}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L67)
- Returns: [`RustOracleEdge`](../../../shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedge)[]
- Parameters: `options`: [`RustFixtureOracleOptions`](../../../shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustfixtureoracleoptions)

#### `serializeRustOracleEdges` {#symbol-serializerustoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L92)
- Parameters: `edges`: [`RustOracleEdge`](../../../shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedge)[]

#### `partitionRustOracleSegments` {#symbol-partitionrustoraclesegments}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L97)
- Returns: [`RustOracleSegmentPartition`](../../../shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoraclesegmentpartition)
- Parameters: `edges`: [`RustOracleEdge`](../../../shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedge)[]; `overrides`: [`RustOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleoverrideconfig)

#### `mergeRustOracleEdges` {#symbol-mergerustoracleedges}
- Type: function
- Source: [source](../../../../../../packages/testing/src/fixtureOracles/rustFixtureOracle.ts#L133)
- Returns: [`RustOracleMergeResult`](../../../shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoraclemergeresult)
- Parameters: `edges`: [`RustOracleEdge`](../../../shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedge)[]; `overrides`: [`RustOracleOverrideConfig`](../../../shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleoverrideconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [rustFixtureOracle.test.ts](./rustFixtureOracle.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
