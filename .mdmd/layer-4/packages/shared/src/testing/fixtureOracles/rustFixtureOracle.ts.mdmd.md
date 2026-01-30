# packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts
- Live Doc ID: LD-implementation-packages-shared-src-testing-fixtureoracles-rustfixtureoracle-ts
- Generated At: 2026-01-30T00:04:21.271Z

## Authored
### Purpose
Scans Rust fixture crates to emit `use` and module edges so benchmarks can compare analyzer output against the language’s module semantics without invoking `rustc` <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Hardened on Nov 14 to strip doc comments and avoid false-positive edges; keep those guards intact when adding new comment styles <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2922-L2952>.
- Covered by the Nov 16 unit suite alongside the other oracles; rerun `npm run test:unit -- rustFixtureOracle` after structural changes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:04:21.271Z","inputHash":"948f61b78beaa552"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RustOracleEdgeRelation` {#symbol-rustoracleedgerelation}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L4)

#### `RustOracleProvenance` {#symbol-rustoracleprovenance}
- Type: type
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L6)

#### `RustOracleEdge` {#symbol-rustoracleedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L8)

#### `RustOracleEdgeRecord` {#symbol-rustoracleedgerecord}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L15)

#### `RustFixtureOracleOptions` {#symbol-rustfixtureoracleoptions}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L21)

#### `RustOracleOverrideEntry` {#symbol-rustoracleoverrideentry}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L27)

#### `RustOracleOverrideConfig` {#symbol-rustoracleoverrideconfig}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L33)

#### `RustOracleSegmentPartition` {#symbol-rustoraclesegmentpartition}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L37)

#### `RustOracleMergeResult` {#symbol-rustoraclemergeresult}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L44)

#### `generateRustFixtureGraph` {#symbol-generaterustfixturegraph}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L67)
- Returns: [`RustOracleEdge`](../../../../testing/src/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedge)[]
- Parameters: `options`: [`RustFixtureOracleOptions`](../../../../testing/src/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustfixtureoracleoptions)

#### `serializeRustOracleEdges` {#symbol-serializerustoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L92)
- Parameters: `edges`: [`RustOracleEdge`](../../../../testing/src/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedge)[]

#### `partitionRustOracleSegments` {#symbol-partitionrustoraclesegments}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L97)
- Returns: [`RustOracleSegmentPartition`](../../../../testing/src/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoraclesegmentpartition)
- Parameters: `edges`: [`RustOracleEdge`](../../../../testing/src/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedge)[]; `overrides`: [`RustOracleOverrideConfig`](../../../../testing/src/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleoverrideconfig)

#### `mergeRustOracleEdges` {#symbol-mergerustoracleedges}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts#L133)
- Returns: [`RustOracleMergeResult`](../../../../testing/src/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoraclemergeresult)
- Parameters: `edges`: [`RustOracleEdge`](../../../../testing/src/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedge)[]; `overrides`: [`RustOracleOverrideConfig`](../../../../testing/src/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleoverrideconfig)
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
