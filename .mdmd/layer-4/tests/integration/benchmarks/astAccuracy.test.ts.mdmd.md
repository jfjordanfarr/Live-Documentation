# tests/integration/benchmarks/astAccuracy.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/benchmarks/astAccuracy.test.ts
- Live Doc ID: LD-test-tests-integration-benchmarks-astaccuracy-test-ts
- Generated At: 2026-02-03T21:55:42.118Z

## Authored
### Purpose
Executes the AST accuracy benchmark by materialising repo fixtures on disk, running the Live Docs analyzer, and comparing inferred edges against oracle data so precision/recall regressions fail fast ([dynamic fixture harness](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-01.SUMMARIZED.md#turn-38-wire-benchmark-harness-to-materialized-fixtures-lines-5901-6180)).

### Notes
- Relies on the regeneration CLI and oracle pipeline to refresh expected graphs before asserting results, keeping the test aligned with compiler-derived ground truth and producing benchmark reports via `benchmarkRecorder` ([oracle regeneration workflow](../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-34-build-regeneration-cli--overrides-lines-3961-4260)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.118Z","inputHash":"e775254db195134f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:assert` - `strict`
- `node:fs` - `existsSync`, `promises`
- `node:module` - `createRequire`
- `node:path`
- [`benchmarkRecorder.EdgeRecord`](./utils/benchmarkRecorder.ts.mdmd.md#symbol-edgerecord)
- [`benchmarkRecorder.FixtureDiffReport`](./utils/benchmarkRecorder.ts.mdmd.md#symbol-fixturediffreport)
- [`benchmarkRecorder.FixtureTotalsSummary`](./utils/benchmarkRecorder.ts.mdmd.md#symbol-fixturetotalssummary)
- [`benchmarkRecorder.writeBenchmarkFixtureReport`](./utils/benchmarkRecorder.ts.mdmd.md#symbol-writebenchmarkfixturereport)
- [`benchmarkRecorder.writeBenchmarkResult`](./utils/benchmarkRecorder.ts.mdmd.md#symbol-writebenchmarkresult)
- [`repoPaths.getRepoRoot`](./utils/repoPaths.ts.mdmd.md#symbol-getreporoot)
- [`repoPaths.resolveRepoPath`](./utils/repoPaths.ts.mdmd.md#symbol-resolverepopath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
