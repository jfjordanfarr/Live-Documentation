# `packages/engine/src/live-docs/adapters/aspnet.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/aspnet.test.ts`
- Generated At: 2026-11-21T07:18:21.466Z

## Authored
### Purpose
Verifies that the ASP.NET markup adapter links Blazor `.razor` pages to both their generated partial classes and web-root scripts, guarding the regression highlighted during the LD-402 expansion.

### Notes
- Runs against a temporary workspace so we can assert filesystem-driven heuristics (like `~/` resolution) without polluting the repo fixtures.
- Since the joining of 2026-11-21 ([the work item](../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)): the reasons a directive's path has no link reach the analysis result as notices, each subject the path as written, red with the hand-over taken out; and a failure of the machine's in reading a project file for its kind is thrown, where one of the file's own reads it as no web project, red with the catch swallowing it.

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
- [`aspnet.resolveDirectivePath`](./aspnet.ts.mdmd.md#symbol-resolvedirectivepath)
- [`aspnet.withoutMarkupComments`](./aspnet.ts.mdmd.md#symbol-withoutmarkupcomments)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`, `vi`
<!-- LIVE-DOC:END Dependencies -->
