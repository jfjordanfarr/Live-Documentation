# `tests/integration/live-docs/history-worker-warning.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/history-worker-warning.test.ts`
- Generated At: 2026-11-20T16:43:10.273Z

## Authored
### Purpose
Holds that a real worker of the history, forked as the pool forks it, warns of a file the generator could not map: the line `could not map <path>: <reason>` in its report's `warned`, which the history command gathers across the changes and prints, with a reason that names no path of the worker's tree. The file is a name the disk holds whose doc's name it does not, the cheapest file that cannot be mapped.

### Notes
- Written on 2026-11-20, after the reviewer's second look found that removing the warning from `summarizeChange.ts` left every test green. Seen red so.
- A file of its own beside `history-workers.test.ts`, which another builder was editing that day; that file's helpers are not exported, so the smallest, the worker's start, is copied here.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `fork`
- `node:fs`
- `node:os`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`lens.summarizedConfiguration`](../../../packages/engine/src/live-docs/history/lens.ts.mdmd.md#symbol-summarizedconfiguration)
- [`regenerate.summarizingEnvironment`](../../../packages/generator/src/history/regenerate.ts.mdmd.md#symbol-summarizingenvironment)
- [`regenerate.summarizingFlags`](../../../packages/generator/src/history/regenerate.ts.mdmd.md#symbol-summarizingflags)
- [`summarizeChange.WorkerReport`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-workerreport) (type-only)
- [`summarizeChange.WorkerTask`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-workertask) (type-only)
- [`scripted-repository.buildRepository`](./scripted-repository.ts.mdmd.md#symbol-buildrepository)
- [`scripted-repository.git`](./scripted-repository.ts.mdmd.md#symbol-git)
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
