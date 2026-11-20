# `tests/integration/live-docs/reading-depth.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/reading-depth.test.ts`
- Generated At: 2026-11-20T14:49:09.842Z

## Authored
### Purpose
Holds the margin of `READING_DEPTH` (`processMark.ts`) over a fresh process's stack, and is its proof. Below that depth a history summary must not depend on which worker made it, which holds only if no process, however cold, overflows there. Every kind of nesting the readers meet is written alone in a repository of one commit: TypeScript's brackets, scopes, types and long chains, and the brackets, blocks and chains of each tree-sitter grammar the product reads, 96 in all. Each is nested to twice the depth by the depth's own measure. A worker forked as the pool forks one (`summarizingFlags`, `summarizingEnvironment`) is given it as its first change, and must read it unmapped by nothing and marked for its depth alone. The test goes red on the day a later TypeScript, grammar or Node lowers a cold limit below twice the depth.

### Notes
- Written on 2026-11-20, when probing every construct moved the depth from a provisional 300 to 200. Nested tuple types fail cold at 453 deep, type arguments at 506 and nested calls at 598. The table and limits are in [the probe's record](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-speed/depth-probe.md).
- Seen red with the depth at 400: 8 of the 96 constructs, nested arrays among them, are unmapped at 800 deep for `Maximum call stack size exceeded`.
- A TypeScript construct's depth is extrapolated from 8, 16, 32 and 64 levels, which must grow by the same step. The test's own process is warm and deep in the runner's calls, and TypeScript's parser recursing there overflowed at 800 deep in a first form of the test. Tree-sitter trees are measured where they are written.
- Takes 45 to 64 s with four workers at a time on a shared machine.

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
- [`treeSitter.SyntaxNode`](../../../packages/engine/src/live-docs/adapters/treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.readTree`](../../../packages/engine/src/live-docs/adapters/treeSitter.ts.mdmd.md#symbol-readtree)
- [`lens.summarizedConfiguration`](../../../packages/engine/src/live-docs/history/lens.ts.mdmd.md#symbol-summarizedconfiguration)
- [`processMark.READING_DEPTH`](../../../packages/engine/src/live-docs/processMark.ts.mdmd.md#symbol-reading_depth)
- [`regenerate.summarizingEnvironment`](../../../packages/generator/src/history/regenerate.ts.mdmd.md#symbol-summarizingenvironment)
- [`regenerate.summarizingFlags`](../../../packages/generator/src/history/regenerate.ts.mdmd.md#symbol-summarizingflags)
- [`summarizeChange.WorkerReport`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-workerreport) (type-only)
- [`summarizeChange.WorkerTask`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-workertask) (type-only)
- [`scripted-repository.buildRepository`](./scripted-repository.ts.mdmd.md#symbol-buildrepository)
- [`scripted-repository.git`](./scripted-repository.ts.mdmd.md#symbol-git)
- `typescript` - `ts`
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
