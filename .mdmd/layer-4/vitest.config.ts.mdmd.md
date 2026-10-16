# vitest.config.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: vitest.config.ts
- Entry: tooling
- Generated At: 2026-10-16T00:58:52.537Z

## Authored
### Purpose
How the tests are run: two Vitest projects, `unit` over the packages, scripts and the audit and browser-helper tests, and `integration` over the suites that run the generator or the CLI over a fixture, with the timeouts those need.

### Notes
- The resolver prefers `.ts` over `.js` beside it, so that a stray compiled twin is never what the tests exercise, and aliases the three packages as `tsconfig.base.json` does. The integration project's timeouts are long on purpose: every suite there runs the generator over a fixture workspace or spawns the CLI through tsx. Coverage covers package sources only.
- Began on 2025-10-16 with the repository's scaffolding; the unit project last widened on 2026-10-14 to take the browser suite's pure tests. Gained a Live Doc on 2026-10-16 ([Turn 9 of the October 15 session](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `default` {#symbol-default}
- Type: default (default)
- Source: [source](../../vitest.config.ts#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `vitest/config` - `defineConfig`
<!-- LIVE-DOC:END Dependencies -->
