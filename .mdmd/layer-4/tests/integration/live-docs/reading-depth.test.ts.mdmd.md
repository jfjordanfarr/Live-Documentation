# `tests/integration/live-docs/reading-depth.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/reading-depth.test.ts`
- Generated At: 2026-11-20T15:18:18.442Z

## Authored
### Purpose
Holds the margins of the two reading bounds of `processMark.ts` over a fresh process's stack, and is their proof. Within the bounds a history summary must not depend on which worker made it, which holds only if no process, however cold, overflows there.

Each kind of nesting it lists is written alone in a repository of one commit, and the bounds promise nothing of a kind it does not list: TypeScript's brackets, scopes, types and chains, and the brackets, blocks and chains of each tree-sitter grammar the product reads. Each goes to twice the bound it belongs to, by that bound's own count. A TypeScript nesting construct goes to twice `READING_DEPTH` in nesting. A TypeScript chain, and every tree-sitter construct, goes to twice `TREE_DEPTH` in depth. Six joint cases put nested tuple types, the lowest nesting construct, inside each chain, at one and a half times both bounds at once.

A worker forked as the pool forks one (`summarizingFlags`, `summarizingEnvironment`) is given each case as its first change. It must read it unmapped by nothing and marked for its depth alone. The test goes red on the day a later TypeScript, grammar or Node lowers a cold limit below these.

### Notes
- Written on 2026-11-20, when probing every construct moved the depth from a provisional 300 to 200. Nested tuple types fail cold at 453 deep, type arguments at 506 and nested calls at 598. The table and limits are in [the probe's record](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-speed/depth-probe.md).
- Seen red with the depth at 400: 8 of the 96 constructs, nested arrays among them, are unmapped at 800 deep for `Maximum call stack size exceeded`.
- A TypeScript construct's depth is extrapolated from 8, 16, 32 and 64 levels, which must grow by the same step. The test's own process is warm and deep in the runner's calls, and TypeScript's parser recursing there overflowed at 800 deep in a first form of the test. Tree-sitter trees are measured where they are written.
- Later the same day the one depth became two bounds, after it had marked `htmlEntities.ts`, a concatenation 255 deep with a nesting of 17. The chains, each step of the measure's set alone, and the joint cases were added, and all 107 cases read cold.
- With the first builder's readers joined the same day, three values a reader builds are read cold at twice their bound. A JSON document read by `JSON.parse` and a POM's elements go to 800, since only our own walks recurse over them. A tsconfig read by TypeScript's reader of JSON goes to 400. The TOML reader refuses past its own fixed count in every process, so no bound of ours applies; a case shows it reads 1,000 levels, refuses 10,000, and a fresh worker given the refused manifest is unmarked. 111 cases.
- Later still that day an independent reviewer showed that the measure never reached a JSDoc comment, which TypeScript's parser reads by its recursive type parser: a JSDoc tuple 650 deep counted 5. The measure now walks each node's JSDoc, a bracketed JSDoc parameter's default the parser throws away, and `<` as nesting. The test gained, in a `.ts`, a `.js` and a `.jsx` file, ten JSDoc constructs at 400, `a < b < …` and `a < (b < (…))` at 400, and four chains at 800 (`a!`, `as`, `satisfies`, tagged templates). 147 cases, all read cold; what a walk by `forEachChild` misses is listed in the record's third round.
- After the audit of the parser's speculative reads (the record's fourth round) the test gained comparisons that a type-argument attempt runs through, in `.ts` and `.tsx` each: side by side in a call and an array, joined by `|` and by `&`, with an arrow's expression body or block body between, of `!a`, `typeof a` and `a.b`, and in nested parentheses and a tuple's place. It also gained a JSDoc comment whose deep tag is tried as a nested parameter's child and thrown away, in three file kinds. Seen red with the statement count and the JSDoc walk taken out: 52 cases, all but the two in nested parentheses, whose tree deepens anyway. On the root's review two constructs were added, each red without the term it holds: comparisons each in an arrow's expression body (359 cold; a fresh worker could not map it at 389 without the arrow term) and a label's statement in an arrow's block body (518 cold). The deep tag tried as a nested parameter's child became four times as deep as the nesting (100 levels cold; not mapped at 99 without the nested literals' term).
- Takes 45 to 104 s with four workers at a time on a shared machine.

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
- [`pom.readXmlElements`](../../../packages/engine/src/live-docs/adapters/pom.ts.mdmd.md#symbol-readxmlelements)
- [`treeSitter.SyntaxNode`](../../../packages/engine/src/live-docs/adapters/treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.readTree`](../../../packages/engine/src/live-docs/adapters/treeSitter.ts.mdmd.md#symbol-readtree)
- [`lens.summarizedConfiguration`](../../../packages/engine/src/live-docs/history/lens.ts.mdmd.md#symbol-summarizedconfiguration)
- [`processMark.READING_DEPTH`](../../../packages/engine/src/live-docs/processMark.ts.mdmd.md#symbol-reading_depth)
- [`processMark.TREE_DEPTH`](../../../packages/engine/src/live-docs/processMark.ts.mdmd.md#symbol-tree_depth)
- [`processMark.jsonChildren`](../../../packages/engine/src/live-docs/processMark.ts.mdmd.md#symbol-jsonchildren)
- [`processMark.typeScriptExtent`](../../../packages/engine/src/live-docs/processMark.ts.mdmd.md#symbol-typescriptextent)
- [`regenerate.summarizingEnvironment`](../../../packages/generator/src/history/regenerate.ts.mdmd.md#symbol-summarizingenvironment)
- [`regenerate.summarizingFlags`](../../../packages/generator/src/history/regenerate.ts.mdmd.md#symbol-summarizingflags)
- [`summarizeChange.WorkerReport`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-workerreport) (type-only)
- [`summarizeChange.WorkerTask`](../../../packages/generator/src/history/summarizeChange.ts.mdmd.md#symbol-workertask) (type-only)
- `smol-toml` - `parse`
- [`scripted-repository.buildRepository`](./scripted-repository.ts.mdmd.md#symbol-buildrepository)
- [`scripted-repository.git`](./scripted-repository.ts.mdmd.md#symbol-git)
- `typescript` - `ts`
- `vitest` - `afterAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
