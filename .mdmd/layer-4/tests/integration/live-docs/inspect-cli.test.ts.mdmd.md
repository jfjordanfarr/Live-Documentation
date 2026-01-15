# tests/integration/live-docs/inspect-cli.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/inspect-cli.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-inspect-cli-test-ts
- Generated At: 2026-01-15T02:41:19.178Z

## Authored
### Purpose
Exercises the `npm run live-docs:inspect` CLI against representative workspaces so we guarantee the pathfinder resolves telemetry chains across WebForms, Razor, Blazor, SPA aliasing, and reflection-driven handlers.

### Notes
- Uses fixture-local workspaces to avoid mutating the main repo; each test shells out via `tsx` to mirror the way users run the CLI.
- Blazor coverage was added on 2025-11-18 to lock in the `.razor` → partial class → `appsettings.json` chain discussed during the LD-402 expansion.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:19.178Z","inputHash":"c78bdc11e6d97c6d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:assert`
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
