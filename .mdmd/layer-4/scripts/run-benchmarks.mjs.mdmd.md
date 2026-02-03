# scripts/run-benchmarks.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/run-benchmarks.mjs
- Live Doc ID: LD-implementation-scripts-run-benchmarks-mjs
- Generated At: 2026-02-03T21:55:42.035Z

## Authored
### Purpose
Runs the workspace benchmark suites (AST accuracy, rebuild stability) with consistent build prep, optional fixture regeneration, and post-run summaries so precision/recall regressions surface immediately during local or CI validation.

### Notes
- Introduced 2025-11-01 alongside the language-grouped fixture rework to provide a single orchestrator behind `npm run test:benchmarks`, compiling integration tests and dispatching Mocha suites (`2025-11-01.SUMMARIZED.md`).
- On 2025-11-05 it began auto-calling `regenerate-benchmarks.ts --write`, while `--no-regenerate` kept escape hatches for forensic replays (`2025-11-05.SUMMARIZED.md`).
- Subsequent benchmark deep-dives (Nov 6–7) added explicit suite/mode selection, BENCHMARK_MODE propagation, and the failure summarizers that read from `AI-Agent-Workspace/tmp/benchmarks/**` and `reports/benchmarks/**` so false positives/negatives are listed inline.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.035Z","inputHash":"13791d929bc3eb88"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs` - `existsSync`, `readFileSync`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `fileURLToPath`
<!-- LIVE-DOC:END Dependencies -->
