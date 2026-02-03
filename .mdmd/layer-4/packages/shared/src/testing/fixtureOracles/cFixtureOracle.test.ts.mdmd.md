# packages/shared/src/testing/fixtureOracles/cFixtureOracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/testing/fixtureOracles/cFixtureOracle.test.ts
- Live Doc ID: LD-test-packages-shared-src-testing-fixtureoracles-cfixtureoracle-test-ts
- Generated At: 2026-02-03T21:55:40.914Z

## Authored
### Purpose
Exercises the C oracle against layered fixtures and override scenarios so regenerated graphs capture `#include` chains and cross-module calls exactly before benchmarks assert on them <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Protects against the Nov 5 regression where multi-target edges diverged from expected graphs, and continues to pass in the Nov 16 unit sweep <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L4240-L4320> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.914Z","inputHash":"964efcabbb665240"}]} -->
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
- packages/shared/src/testing/fixtureOracles: [cFixtureOracle.ts](./cFixtureOracle.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
