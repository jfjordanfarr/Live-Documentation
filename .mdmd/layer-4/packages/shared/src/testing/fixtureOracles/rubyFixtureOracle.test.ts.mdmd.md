# packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.test.ts
- Live Doc ID: LD-test-packages-shared-src-testing-fixtureoracles-rubyfixtureoracle-test-ts
- Generated At: 2026-02-03T21:55:41.081Z

## Authored
### Purpose
Asserts the Ruby oracle’s ability to recover `require`/`include` edges and honor manual overrides so regenerated graphs stay deterministic across the polyglot benchmark suites <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-04.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260>.

### Notes
- Guards against the doc-comment regression called out on Nov 14 and was revalidated in the Nov 16 unit run; rerun this suite whenever the parser or fixture fixtures shift <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3008-L3040> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2928-L2960>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.081Z","inputHash":"1f6b0ca980007435"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`rubyFixtureOracle.RubyFixtureOracleOptions`](./rubyFixtureOracle.ts.mdmd.md#symbol-rubyfixtureoracleoptions)
- [`rubyFixtureOracle.RubyOracleEdge`](./rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleedge)
- [`rubyFixtureOracle.RubyOracleEdgeRecord`](./rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleedgerecord)
- [`rubyFixtureOracle.RubyOracleOverrideConfig`](./rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleoverrideconfig)
- [`rubyFixtureOracle.generateRubyFixtureGraph`](./rubyFixtureOracle.ts.mdmd.md#symbol-generaterubyfixturegraph)
- [`rubyFixtureOracle.mergeRubyOracleEdges`](./rubyFixtureOracle.ts.mdmd.md#symbol-mergerubyoracleedges)
- [`rubyFixtureOracle.partitionRubyOracleSegments`](./rubyFixtureOracle.ts.mdmd.md#symbol-partitionrubyoraclesegments)
- [`rubyFixtureOracle.serializeRubyOracleEdges`](./rubyFixtureOracle.ts.mdmd.md#symbol-serializerubyoracleedges)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/testing/fixtureOracles: [rubyFixtureOracle.ts](./rubyFixtureOracle.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
