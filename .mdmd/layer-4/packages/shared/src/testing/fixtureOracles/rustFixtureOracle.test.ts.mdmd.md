# packages/shared/src/testing/fixtureOracles/rustFixtureOracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/testing/fixtureOracles/rustFixtureOracle.test.ts
- Live Doc ID: LD-test-packages-shared-src-testing-fixtureoracles-rustfixtureoracle-test-ts
- Generated At: 2026-02-03T21:55:41.112Z

## Authored
### Purpose
Confirms the Rust oracle captures module `use` edges, honors manual overrides, and serializes deterministically so regenerated fixtures stay aligned with the curated benchmarks <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Includes assertions covering the Nov 14 doc-comment regression fix and remains part of the Nov 16 unit run; re-execute this suite if parser heuristics are tweaked <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2922-L2952> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.112Z","inputHash":"ce86ba177958d9d8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`rustFixtureOracle.RustFixtureOracleOptions`](./rustFixtureOracle.ts.mdmd.md#symbol-rustfixtureoracleoptions)
- [`rustFixtureOracle.RustOracleEdge`](./rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedge)
- [`rustFixtureOracle.RustOracleEdgeRecord`](./rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedgerecord)
- [`rustFixtureOracle.RustOracleOverrideConfig`](./rustFixtureOracle.ts.mdmd.md#symbol-rustoracleoverrideconfig)
- [`rustFixtureOracle.generateRustFixtureGraph`](./rustFixtureOracle.ts.mdmd.md#symbol-generaterustfixturegraph)
- [`rustFixtureOracle.mergeRustOracleEdges`](./rustFixtureOracle.ts.mdmd.md#symbol-mergerustoracleedges)
- [`rustFixtureOracle.partitionRustOracleSegments`](./rustFixtureOracle.ts.mdmd.md#symbol-partitionrustoraclesegments)
- [`rustFixtureOracle.serializeRustOracleEdges`](./rustFixtureOracle.ts.mdmd.md#symbol-serializerustoracleedges)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/testing/fixtureOracles: [rustFixtureOracle.ts](./rustFixtureOracle.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
