# packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.test.ts
- Live Doc ID: LD-test-packages-shared-src-testing-fixtureoracles-typescriptfixtureoracle-test-ts
- Generated At: 2026-02-03T21:55:41.161Z

## Authored
### Purpose
Validates the TypeScript fixture oracle against curated fixture samples and manual override scenarios so benchmark regeneration can trust the compiler-derived edges it emits <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-33-rehydrate--add-oracle-tests-lines-3801-3960>.

### Notes
- Exercises runtime vs. type-only classifications, override merging, and deterministic serialization, and continues to run green in the Nov 16 unit sweep <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.161Z","inputHash":"56746806e9d4dfc0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`typeScriptFixtureOracle.OracleEdge`](./typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleedge)
- [`typeScriptFixtureOracle.OracleEdgeRecord`](./typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleedgerecord)
- [`typeScriptFixtureOracle.OracleOverrideConfig`](./typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleoverrideconfig)
- [`typeScriptFixtureOracle.generateTypeScriptFixtureGraph`](./typeScriptFixtureOracle.ts.mdmd.md#symbol-generatetypescriptfixturegraph)
- [`typeScriptFixtureOracle.mergeOracleEdges`](./typeScriptFixtureOracle.ts.mdmd.md#symbol-mergeoracleedges)
- [`typeScriptFixtureOracle.partitionOracleSegments`](./typeScriptFixtureOracle.ts.mdmd.md#symbol-partitionoraclesegments)
- [`typeScriptFixtureOracle.serializeOracleEdges`](./typeScriptFixtureOracle.ts.mdmd.md#symbol-serializeoracleedges)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/language: [typeScriptAstUtils.ts](../../language/typeScriptAstUtils.ts.mdmd.md)
- packages/shared/src/testing/fixtureOracles: [typeScriptFixtureOracle.ts](./typeScriptFixtureOracle.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
