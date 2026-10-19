# scripts/verify.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/verify.mjs
- Entry: command `verify` of [`package.json`](../package.json.mdmd.md)
- Generated At: 2026-10-18T23:23:06.814Z

## Authored
### Purpose
Runs the verification half of the pre-commit gate in a fixed order: ESLint, `tsc` for the packages, a type-check of the test suites, the Vitest `unit` and `integration` projects, and documentation link enforcement. `npm run safe:commit` calls it first and adds the documentation audits.

### Notes
- Originated 2025-10-31 as the entry point for the benchmark reporting workflow. The benchmark modes, report generation and the `xvfb` wrapper for the VS Code Electron harness were removed on 2026-09-27 when the integration suites moved to Vitest; the script is now a plain sequence of steps with no flags.
- Invokes `tsc` through `node_modules/typescript/lib/tsc.js` with `process.execPath` so no shell is involved on any platform.
- Since 2026-10-18 the step runners come from `steps.mjs`, shared with `safe-to-commit.mjs`, which spawns npm through the npm that started the script when it can, and through `npm.cmd` with a shell on Windows otherwise.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:url` - `fileURLToPath`
- [`steps.runNpmScript`](./steps.mjs.mdmd.md#symbol-runnpmscript)
- [`steps.runStep`](./steps.mjs.mdmd.md#symbol-runstep)
<!-- LIVE-DOC:END Dependencies -->
