# scripts/safe-to-commit.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/safe-to-commit.mjs
- Entry: command `ci-check` of [`package.json`](../package.json.mdmd.md)
- Entry: command `safe:commit` of [`package.json`](../package.json.mdmd.md)
- Generated At: 2026-10-18T23:23:06.678Z

## Authored
### Purpose
Acts as the "safe to commit" gate: runs `npm run verify`, the Live Docs pipeline (generate and lint), the three SlopCop audits and, with `--e2e`, the browser tests over the bundles built first, then prints a `git status -sb` verdict. `npm run ci-check` is the same chain with the status summary skipped and without the browser tests.

### Notes
- Debuted 2025-10-21 as the runner behind `npm run safe:commit`, pairing the verification pipeline with a human-readable Git status summary.
- The benchmark flags (`--benchmarks`, `--mode`, `--report`) and their fixture regeneration were removed on 2026-09-27 with the AST accuracy benchmark. The remaining flags are `--e2e`, which appends `npm run test:e2e` (the three bundles built, then the Playwright suite), and `--skip-git-status` (alias `--ci`), which CI sets.
- Documentation link enforcement runs inside `verify`; it is not repeated here.
- Since 2026-10-18 the step runners come from `steps.mjs`, shared with `verify.mjs`; this script keeps only the gate's order and the git status verdict.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- [`steps.runNpmScript`](./steps.mjs.mdmd.md#symbol-runnpmscript)
<!-- LIVE-DOC:END Dependencies -->
