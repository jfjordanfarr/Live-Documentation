# eslint.config.js

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: eslint.config.js
- Entry: tooling
- Generated At: 2026-10-16T00:58:37.896Z

## Authored
### Purpose
The lint rules the repository holds itself to, in ESLint's flat configuration: what is ignored, the import order, the typed rules on package sources, and the JSDoc required on every exported symbol.

### Notes
- Three decisions live here. Imports are ordered and grouped (built-in and external, then internal `@live-documentation/` paths, then relative) with a blank line between groups, so that a file's dependencies read as a list; the rule is `eslint-plugin-import-x`'s since 2026-10-22, when ESLint 10 arrived and `eslint-plugin-import`, which declares ESLint 9 at most, went. The type-aware rules run on package sources only, never on tests, because the packages' tsconfig projects hold their sources and not their tests; `no-floating-promises` is an error, and `await-thenable` runs again since 2026-10-22, the instability with the project service that had switched it off (2025-10) not having returned under typescript-eslint 8.72. Every exported symbol in package sources and scripts must carry JSDoc, an error since 2026-10-22 and a warning before, which is what keeps the Live Docs' summaries filled; and an unused variable is an error since the same day. No stylistic rule is on, and nothing formats TypeScript: `eslint-config-prettier`, which switched ESLint's style rules off for Prettier's sake, went with Prettier ([the decision](../../.mdmd/layer-3/architectural-decisions.mdmd.md#no-formatter-for-typescript-lint-for-correctness-on-eslint-10-and-the-tsconfig-off-baseurl-and-node10-recorded-2026-10-22)).
- Ignored: build outputs, Playwright's report (whose trace viewer is bundled JavaScript, 2026-09-29), the sample programs, the agent workspace, and the generated CommonJS shims beside the engine's TypeScript sources. Began on 2025-10-17 with the first lint pass; gained a Live Doc on 2026-10-16 ([Turn 9 of the October 15 session](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
