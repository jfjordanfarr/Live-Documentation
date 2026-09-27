# tests/integration/live-docs/inspect-cli.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/inspect-cli.test.ts
- Generated At: 2026-09-27T23:21:33.869Z

## Authored
### Purpose
Exercises the `npm run live-docs:inspect` CLI against representative workspaces so we guarantee the pathfinder resolves telemetry chains across WebForms, Razor, Blazor, SPA aliasing, and reflection-driven handlers.

### Notes
- Uses fixture-local workspaces to avoid mutating the main repo; each test shells out via `tsx` to mirror the way users run the CLI.
- Blazor coverage was added on 2025-11-18 to lock in the `.razor` → partial class → `appsettings.json` chain discussed during the LD-402 expansion.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:assert`
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:os`
- `node:path`
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `it`
<!-- LIVE-DOC:END Dependencies -->
