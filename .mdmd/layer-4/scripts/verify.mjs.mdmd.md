# scripts/verify.mjs

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/verify.mjs
- Generated At: 2026-09-27T23:21:32.053Z

## Authored
### Purpose
Runs the verification half of the pre-commit gate in a fixed order: ESLint, `tsc` for the packages, a type-check of the test suites, the Vitest `unit` and `integration` projects, and documentation link enforcement. `npm run safe:commit` calls it first and adds the documentation audits.

### Notes
- Originated 2025-10-31 as the entry point for the benchmark reporting workflow. The benchmark modes, report generation and the `xvfb` wrapper for the VS Code Electron harness were removed on 2026-09-27 when the integration suites moved to Vitest; the script is now a plain sequence of steps with no flags.
- Invokes `tsc` through `node_modules/typescript/lib/tsc.js` with `process.execPath` so no shell is involved on any platform.
- Uses platform-aware npm spawning so Windows shells execute `npm.cmd` directly instead of requiring manual shims during CI or local runs.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:path` - `path`
- `node:url` - `fileURLToPath`
<!-- LIVE-DOC:END Dependencies -->
