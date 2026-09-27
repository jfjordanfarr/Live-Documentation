# packages/shared/src/live-docs/adapters/aspnet.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/aspnet.test.ts
- Generated At: 2026-09-27T23:21:30.225Z

## Authored
### Purpose
Verifies that the ASP.NET markup adapter links Blazor `.razor` pages to both their generated partial classes and web-root scripts, guarding the regression highlighted during the LD-402 expansion.

### Notes
- Runs against a temporary workspace so we can assert filesystem-driven heuristics (like `~/` resolution) without polluting the repo fixtures.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:os`
- `node:path`
- [`aspnet.aspNetMarkupAdapter`](./aspnet.ts.mdmd.md#symbol-aspnetmarkupadapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
