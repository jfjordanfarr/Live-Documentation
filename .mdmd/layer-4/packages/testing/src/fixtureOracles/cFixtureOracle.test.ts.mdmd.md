# packages/testing/src/fixtureOracles/cFixtureOracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/testing/src/fixtureOracles/cFixtureOracle.test.ts
- Live Doc ID: LD-test-packages-testing-src-fixtureoracles-cfixtureoracle-test-ts
- Generated At: 2026-01-30T00:07:24.118Z

## Authored
### Purpose
Unit tests for the C fixture oracle. Validates include detection, function call extraction, edge serialization, and manual override merging against the C benchmark fixtures.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Tests run against `tests/integration/benchmarks/fixtures/c/basics` and `c/modular`.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.118Z","inputHash":"e09e2aae6f97741f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`cFixtureOracle.CFixtureOracleOptions`](./cFixtureOracle.ts.mdmd.md#symbol-cfixtureoracleoptions)
- [`cFixtureOracle.COracleEdge`](./cFixtureOracle.ts.mdmd.md#symbol-coracleedge)
- [`cFixtureOracle.COracleEdgeRecord`](./cFixtureOracle.ts.mdmd.md#symbol-coracleedgerecord)
- [`cFixtureOracle.COracleOverrideConfig`](./cFixtureOracle.ts.mdmd.md#symbol-coracleoverrideconfig)
- [`cFixtureOracle.generateCFixtureGraph`](./cFixtureOracle.ts.mdmd.md#symbol-generatecfixturegraph)
- [`cFixtureOracle.mergeCOracleEdges`](./cFixtureOracle.ts.mdmd.md#symbol-mergecoracleedges)
- [`cFixtureOracle.partitionCOracleSegments`](./cFixtureOracle.ts.mdmd.md#symbol-partitioncoraclesegments)
- [`cFixtureOracle.serializeCOracleEdges`](./cFixtureOracle.ts.mdmd.md#symbol-serializecoracleedges)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/testing/src/fixtureOracles: [cFixtureOracle.ts](./cFixtureOracle.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
