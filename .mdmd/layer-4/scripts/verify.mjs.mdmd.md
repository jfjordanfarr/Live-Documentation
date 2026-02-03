# scripts/verify.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/verify.mjs
- Live Doc ID: LD-implementation-scripts-verify-mjs
- Generated At: 2026-02-03T21:55:42.103Z

## Authored
### Purpose
Coordinates the end-to-end workspace verification pipeline so a single command lint-checks, rebuilds native addons, executes unit/integration suites, enforces documentation links, and (optionally) regenerates benchmark reports before a change ships.

### Notes
- Originated 2025-10-31 while wiring the benchmark reporting workflow; kept as the canonical `npm run verify` entry point referenced throughout `2025-10-31.md` in `AI-Agent-Workspace/ChatHistory/`.
- Accepts `--mode`/`BENCHMARK_MODE` to run self-similarity, AST, or dual benchmark suites, and `--report` to invoke `scripts/reporting/generateTestReport.ts` for each selected mode (expanded during the 2025-11-03 dual-mode rollout).
- Uses platform-aware npm spawning so Windows shells execute `npm.cmd`/`npx.cmd` directly instead of requiring manual shims during CI or local runs.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.103Z","inputHash":"6c9b947b629e43c0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
<!-- LIVE-DOC:END Dependencies -->
