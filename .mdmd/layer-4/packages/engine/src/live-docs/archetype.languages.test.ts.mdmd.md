# `packages/engine/src/live-docs/archetype.languages.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/archetype.languages.test.ts`
- Generated At: 2026-11-21T19:30:54.925Z

## Authored
### Purpose
Pins what `resolveArchetype` calls a test today, language by language, in one table, so that a change made for one language cannot move another unnoticed. It was written on 2026-11-21, after a PowerShell change of 2026-11-19 had changed `src/test-utils.tsx` and three other non-PowerShell files, and only a reviewer reading the diff caught it.

### Notes
Each row gives today's answer and what that language's own test runner says of the same file. Since the restructure of the same day, a test is a file that exists for the tests, and a row that moved says so in its reason. Where the two answers differ, a mark says why:
- `for the tests`: a helper, fixture or setup file that the runner does not run.
- `wrong`: wrong by that reading.
- `project`: the answer depends on a project's own runner configuration.
- `interim`: a .NET, Rust or SQL file that keeps the reading of before until a reader reports its fact.

Where the two agree, `missed` marks a file that exists for the tests but that nothing in its path shows. The last cases check the marks, and that every language of `TEST_RULES` has a block. The runners' rules, where each comes from, and the measurement over real code are in [the record of 2026-11-21](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/test-rules/README.md). Undoing the PowerShell confinement turns four rows red, none of them PowerShell.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.LiveDocumentationArchetype`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`archetype.TEST_RULES`](./archetype.ts.mdmd.md#symbol-test_rules)
- [`archetype.resolveArchetype`](./archetype.ts.mdmd.md#symbol-resolvearchetype)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
