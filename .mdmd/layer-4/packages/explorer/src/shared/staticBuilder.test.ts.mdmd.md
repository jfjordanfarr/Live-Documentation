# packages/explorer/src/shared/staticBuilder.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/shared/staticBuilder.test.ts
- Generated At: 2026-10-19T17:42:51.385Z

## Authored
### Purpose
Holds the static folder export to its existing HTML, data, and asset layout while proving that temporary client assets are released after successful and failed output writes.

### Notes
- Uses a test-owned workspace and temporary-asset root. The empty graph keeps the test focused on output and resource ownership; graph, board, and history content have separate integration coverage.
- Each test runs the real client bundle through esbuild, about a second alone, so both carry a 30 s budget rather than the unit project's 5 s default; under the full suite's parallel load the bundle crossed that default on 2026-10-20 ([the record](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#landing-checkpoint-claude-code)). The budget is not a speed check, and none is intended here.

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
- [`staticBuilder.buildStaticExplorer`](./staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)
- `vitest` - `afterEach`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
