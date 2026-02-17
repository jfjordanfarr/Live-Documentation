# tests/integration/benchmarks/utils/benchmarkRecorder.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/benchmarks/utils/benchmarkRecorder.ts
- Live Doc ID: LD-test-tests-integration-benchmarks-utils-benchmarkrecorder-ts
- Generated At: 2026-02-17T21:51:03.724Z

## Authored
### Purpose
Serialises benchmark runs into tmp and versioned JSON outputs so rebuild and accuracy suites publish auditable metrics for every mode ([per-mode recorder rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L680-L720)).

### Notes
- Writes both `AI-Agent-Workspace/tmp/benchmarks` scratch files and `reports/benchmarks/<mode>/` snapshots so reviewers can diff local experiments against committed history ([per-mode recorder rollout](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L680-L720)).
- Emits fixture-specific diff bundles with precision/recall tallies to speed up triaging false positives/negatives when the AST suite regresses ([fixture diff bundles](../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L680-L720)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:51:03.724Z","inputHash":"92235e8f9f685769"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `EdgeRecord` {#symbol-edgerecord}
- Type: interface
- Source: [source](../../../../../../tests/integration/benchmarks/utils/benchmarkRecorder.ts#L9)

#### `FixtureTotalsSummary` {#symbol-fixturetotalssummary}
- Type: interface
- Source: [source](../../../../../../tests/integration/benchmarks/utils/benchmarkRecorder.ts#L15)

#### `FixtureDiffReport` {#symbol-fixturediffreport}
- Type: interface
- Source: [source](../../../../../../tests/integration/benchmarks/utils/benchmarkRecorder.ts#L24)

#### `writeBenchmarkResult` {#symbol-writebenchmarkresult}
- Type: function
- Source: [source](../../../../../../tests/integration/benchmarks/utils/benchmarkRecorder.ts#L43)
- Parameters: `options`: `BenchmarkResultOptions`

#### `writeBenchmarkFixtureReport` {#symbol-writebenchmarkfixturereport}
- Type: function
- Source: [source](../../../../../../tests/integration/benchmarks/utils/benchmarkRecorder.ts#L77)
- Parameters: `fixtures`: [`FixtureDiffReport`](#symbol-fixturediffreport)[]; `options`: `FixtureReportOptions`
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path`
- [`repoPaths.resolveRepoPath`](./repoPaths.ts.mdmd.md#symbol-resolverepopath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
