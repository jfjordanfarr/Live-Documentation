# packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-rustfixtureoracle-ts
- Generated At: 2026-01-30T23:50:04.300Z

## Authored
### Purpose
Scans Rust fixture crates to emit `use` and module edges so benchmarks can compare analyzer output against the language’s module semantics without invoking `rustc` <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Hardened on Nov 14 to strip doc comments and avoid false-positive edges; keep those guards intact when adding new comment styles <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2922-L2952>.
- Covered by the Nov 16 unit suite alongside the other oracles; rerun `npm run test:unit -- rustFixtureOracle` after structural changes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T23:50:04.300Z","inputHash":"66bfaf5648d00c2e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RustOracleEdgeRelation` {#symbol-rustoracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L8)

##### `RustOracleEdgeRelation` — Summary
SCIP-grounded relation taxonomy.
All module/use relationships map to "references" in the canonical taxonomy.

#### `RustOracleProvenance` {#symbol-rustoracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L10)

#### `RustOracleEdge` {#symbol-rustoracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L12)

#### `RustOracleEdgeRecord` {#symbol-rustoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L19)

#### `RustFixtureOracleOptions` {#symbol-rustfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L25)

#### `RustOracleOverrideEntry` {#symbol-rustoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L31)

#### `RustOracleOverrideConfig` {#symbol-rustoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L37)

#### `RustOracleSegmentPartition` {#symbol-rustoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L41)

#### `RustOracleMergeResult` {#symbol-rustoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L48)

#### `generateRustFixtureGraph` {#symbol-generaterustfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L66)
- Returns: [`RustOracleEdge`](#symbol-rustoracleedge)[]
- Parameters: `options`: [`RustFixtureOracleOptions`](#symbol-rustfixtureoracleoptions)

#### `serializeRustOracleEdges` {#symbol-serializerustoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L97)
- Parameters: `edges`: [`RustOracleEdge`](#symbol-rustoracleedge)[]

#### `partitionRustOracleSegments` {#symbol-partitionrustoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L102)
- Returns: [`RustOracleSegmentPartition`](#symbol-rustoraclesegmentpartition)
- Parameters: `edges`: [`RustOracleEdge`](#symbol-rustoracleedge)[]; `overrides`: [`RustOracleOverrideConfig`](#symbol-rustoracleoverrideconfig)

#### `mergeRustOracleEdges` {#symbol-mergerustoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L138)
- Returns: [`RustOracleMergeResult`](#symbol-rustoraclemergeresult)
- Parameters: `edges`: [`RustOracleEdge`](#symbol-rustoracleedge)[]; `overrides`: [`RustOracleOverrideConfig`](#symbol-rustoracleoverrideconfig)
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
