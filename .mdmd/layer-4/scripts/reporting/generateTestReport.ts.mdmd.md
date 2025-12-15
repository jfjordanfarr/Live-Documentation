# scripts/reporting/generateTestReport.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/reporting/generateTestReport.ts
- Live Doc ID: LD-implementation-scripts-reporting-generatetestreport-ts
- Generated At: 2025-12-15T00:38:07.511Z

## Authored
### Purpose
Builds the human-readable benchmark report (`reports/test-report*.md`) by combining the latest JSON artifacts under `AI-Agent-Workspace/tmp/benchmarks/<mode>/` with git metadata, keeping maintainers informed about precision/recall and rebuild latency results after `safe-to-commit` or targeted CLI runs.

### Notes
- Authored 2025-10-31 while delivering reporting Tasks T051/T062 so benchmark evidence could land beside commits; wired into `safe-to-commit.mjs`/`verify.mjs` as documented in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-31.md lines 752-812](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-31.md#L752-L812).
- Enhanced 2025-11-03 to support per-mode filtering and dual outputs (self-similarity vs. AST) during the benchmark overhaul, as captured in [AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md lines 688-712](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L688-L712) and summarised in [2025-11-03.SUMMARIZED.md Turn 09](../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md#turn-09-implement-per-mode-benchmark-reporting-lines-821-1030).
- Accepts `--mode`, `--benchmarks`, and `--output` so CI and maintainers can produce ad-hoc reports; defaults keep Markdown under `reports/` while leaving JSON sources untouched for follow-up analysis.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:07.511Z","inputHash":"3f517bfc021caca5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execSync`
- `node:fs` - `promises`, `readdirSync`
- `node:path` - `path`
- [`testReport.BenchmarkEnvironment`](../../packages/shared/src/reporting/testReport.ts.mdmd.md#symbol-benchmarkenvironment)
- [`testReport.BenchmarkRecord`](../../packages/shared/src/reporting/testReport.ts.mdmd.md#symbol-benchmarkrecord)
- [`testReport.buildTestReportMarkdown`](../../packages/shared/src/reporting/testReport.ts.mdmd.md#symbol-buildtestreportmarkdown)
<!-- LIVE-DOC:END Dependencies -->
