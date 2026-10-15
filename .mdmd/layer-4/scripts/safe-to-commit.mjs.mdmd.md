# scripts/safe-to-commit.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/safe-to-commit.mjs
- Entry: command `ci-check` of [`package.json`](../package.json.mdmd.md)
- Entry: command `safe:commit` of [`package.json`](../package.json.mdmd.md)
- Generated At: 2026-10-15T15:49:42.474Z

## Authored
### Purpose
Acts as the "safe to commit" gate: chains `npm run verify`, Live Docs regeneration, fixture verification, the Live Docs lint pipeline, the three SlopCop audits and technical-debt detection, then prints a `git status -sb` verdict. `npm run ci-check` is the same chain with the status summary skipped.

### Notes
- Debuted 2025-10-21 as the runner behind `npm run safe:commit`, pairing the verification pipeline with a human-readable Git status summary.
- The benchmark flags (`--benchmarks`, `--mode`, `--report`) and their fixture regeneration were removed on 2026-09-27 with the AST accuracy benchmark. The remaining flags are `--e2e`, which appends an Explorer build and the Playwright suite, and `--skip-git-status` (alias `--ci`), which CI sets.
- Documentation link enforcement runs inside `verify`; it is not repeated here.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
<!-- LIVE-DOC:END Dependencies -->
