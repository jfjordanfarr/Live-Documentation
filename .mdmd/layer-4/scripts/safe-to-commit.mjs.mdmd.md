# scripts/safe-to-commit.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/safe-to-commit.mjs
- Live Doc ID: LD-implementation-scripts-safe-to-commit-mjs
- Generated At: 2026-02-03T21:55:42.044Z

## Authored
### Purpose
Acts as the guarded "safe to commit" gate: chains `npm run verify`, optional benchmark regeneration/execution, graph health checks, Live Docs + SlopCop audits, and a final `git status -sb` verdict so contributors can validate the workspace end-to-end before staging a commit.

### Notes
- Debuted 2025-10-21 as the canonical runner behind `npm run safe:commit`, pairing the verification pipeline with a human-readable Git status summary (../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-21.md`).
- Expanded 2025-10-25 to include graph snapshot/audit and the SlopCop lint trio, ensuring documentation hygiene is enforced alongside code checks (see `2025-10-25.SUMMARIZED.md`).
- During the Oct–Nov 2025 benchmark overhaul, gained `--benchmarks`, `--mode`, and `--report` flags, automatic fixture regeneration, and BENCHMARK_SKIP_REGENERATE handling so dual-mode suites run deterministically (`2025-11-03.SUMMARIZED.md`, `2025-11-05.SUMMARIZED.md`, `2025-11-06.SUMMARIZED.md`).
- Since 2025-11-08, also invokes the Live Docs CLI (`npm run livedocs -- --report`) to keep Layer‑4 mirrors and lint outputs current before commits.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.044Z","inputHash":"c94b2f2ee6b8c77f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
<!-- LIVE-DOC:END Dependencies -->
