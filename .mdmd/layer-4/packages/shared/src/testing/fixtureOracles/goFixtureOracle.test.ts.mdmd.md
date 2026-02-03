# packages/shared/src/testing/fixtureOracles/goFixtureOracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/testing/fixtureOracles/goFixtureOracle.test.ts
- Live Doc ID: LD-test-packages-shared-src-testing-fixtureoracles-gofixtureoracle-test-ts
- Generated At: 2026-02-03T21:55:40.981Z

## Authored
### Purpose
Unit tests for the Go fixture oracle. Validates edge generation, grouped import handling, stdlib filtering, test file skipping, JSON serialization, and manual edge merging.

### Notes
- Created during [2026-01-15 dev session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) as part of Go Rosetta fixture implementation
- 6 test cases covering the core oracle functionality
- Uses temporary directories to isolate test fixtures from the real filesystem
- Follows the pattern established by [rustFixtureOracle.test.ts](./rustFixtureOracle.test.ts.mdmd.md) and other oracle test suites

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.981Z","inputHash":"300f7b8a4a4f4920"}]} -->
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
- packages/shared/src/testing/fixtureOracles: [goFixtureOracle.ts](./goFixtureOracle.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
