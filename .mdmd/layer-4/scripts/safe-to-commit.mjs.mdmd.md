# scripts/safe-to-commit.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/safe-to-commit.mjs
- Entry: command `ci-check` of [`package.json`](../package.json.mdmd.md)
- Entry: command `safe:commit` of [`package.json`](../package.json.mdmd.md)
- Generated At: 2026-10-22T16:47:57.841Z

## Authored
### Purpose
Runs the Live Docs pipeline before verification, so tests and audits read the intended mirror, then the three SlopCop audits and optional browser tests. Local runs regenerate docs and print a Git status summary; `ci-check` explicitly checks that the committed mirror is already fresh without writing it.

### Notes
- Debuted 2025-10-21 as the runner behind `npm run safe:commit`, pairing the verification pipeline with a human-readable Git status summary.
- The benchmark flags (`--benchmarks`, `--mode`, `--report`) and their fixture regeneration were removed on 2026-09-27 with the AST accuracy benchmark. `--e2e` appends `npm run test:e2e`; `--skip-git-status` (alias `--ci`) omits only the status summary.
- After the [October 19 audit](../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-19.1.record.md#turn-16), `--check-live-docs` selects non-writing source-to-doc freshness validation. The `ci-check` npm script passes that flag explicitly alongside `--skip-git-status`; status reporting never determines whether generation writes.
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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/slopcop.mdmd.md`](../../layer-3/slopcop.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
