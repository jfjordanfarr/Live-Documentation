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
- Three decisions live here. Imports are ordered and grouped (built-in and external, then internal `@live-documentation/` paths, then relative) with a blank line between groups, so that a file's dependencies read as a list. The type-aware rules run on package sources only, never on tests, because the packages' tsconfig projects hold their sources and not their tests; `no-floating-promises` is an error and `await-thenable` is off for an instability with the project service. Every exported symbol in package sources and scripts must carry JSDoc, as a warning, which is what keeps the Live Docs' summaries filled and asks of each public API "Can I justify this code?".
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
