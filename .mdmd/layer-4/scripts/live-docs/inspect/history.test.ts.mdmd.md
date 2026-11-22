# `scripts/live-docs/inspect/history.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/live-docs/inspect/history.test.ts`
- Generated At: 2026-11-22T02:17:41.647Z

## Authored
### Purpose
Holds how a history question finds the file a person names at a commit: a doc's path read as its file's, and the file found in any case, with two that differ by case alone named back.

### Notes
- Written 2026-11-19 in [the Windows and command-line probe's second leg](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md#second-leg-november-19), when `--at` with `--from` came to fold case as today's questions do. A moment here holds only its files' paths, the least `fileNamedAt` reads; the end-to-end case is in `tests/integration/live-docs/inspect-cli.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`sequence.Moment`](../../../packages/engine/src/live-docs/history/sequence.ts.mdmd.md#symbol-moment) (type-only)
- [`history.HistoryRefusal`](./history.ts.mdmd.md#symbol-historyrefusal)
- [`history.codePathOf`](./history.ts.mdmd.md#symbol-codepathof)
- [`history.count`](./history.ts.mdmd.md#symbol-count)
- [`history.fileNamedAt`](./history.ts.mdmd.md#symbol-filenamedat)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
