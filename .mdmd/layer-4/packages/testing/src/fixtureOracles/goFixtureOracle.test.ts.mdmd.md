# packages/testing/src/fixtureOracles/goFixtureOracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/testing/src/fixtureOracles/goFixtureOracle.test.ts
- Live Doc ID: LD-test-packages-testing-src-fixtureoracles-gofixtureoracle-test-ts
- Generated At: 2026-01-30T00:07:24.128Z

## Authored
### Purpose
Unit tests for the Go fixture oracle. Validates import detection (single and grouped), stdlib filtering, test file handling, edge serialization, and override merging.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). Uses temporary directories with synthetic Go modules to test import path resolution.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:07:24.128Z","inputHash":"ad53302cdcc4e2d6"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os`
- `node:path`
- [`goFixtureOracle.GoFixtureOracleOptions`](./goFixtureOracle.ts.mdmd.md#symbol-gofixtureoracleoptions)
- [`goFixtureOracle.generateGoFixtureGraph`](./goFixtureOracle.ts.mdmd.md#symbol-generategofixturegraph)
- [`goFixtureOracle.mergeGoOracleEdges`](./goFixtureOracle.ts.mdmd.md#symbol-mergegooracleedges)
- [`goFixtureOracle.serializeGoOracleEdges`](./goFixtureOracle.ts.mdmd.md#symbol-serializegooracleedges)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/testing/src/fixtureOracles: [goFixtureOracle.ts](./goFixtureOracle.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
