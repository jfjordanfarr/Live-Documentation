# The reading depth: how deep a fresh process reads each kind of nesting

_A record of November 20, 2026 (UTC), not current documentation. Measured by a builder for the root in its own worktree from `ef57f201b`, under Node 26, on the machine of this folder's README, every machine-loading run through the browser lane. The current rule is `READING_DEPTH` and `TREE_DEPTH` in `packages/engine/src/live-docs/processMark.ts`, held by `tests/integration/live-docs/reading-depth.test.ts`. The first round, one depth for every construct, is kept below as it was found. The second round, two bounds, follows it and supersedes its answer._

## The second round: two bounds, counted in one pass

**Answer.** Two things use the stack. TypeScript's parser recurses for true nesting, with large frames; the table's low limits, 453 to about 1,000, are all of that kind. A chain the parser reads by a loop, and every tree-sitter tree, is walked recursively only by the generator's own code, with small frames; every such construct in the table was read cold at 800. One depth for both had to sit at the parser's level, and so marked `htmlEntities.ts`, a concatenation 255 deep, in 174 changes. The root ruled for two bounds, counted in one pass by `typeScriptExtent`:

- **Nesting**, bound `READING_DEPTH` = **200**: the levels TypeScript's parser reaches by recursion. A step the parser takes by its loop adds nothing. The set is four steps:
  - the left operand of a binary expression: `parseBinaryExpressionRest` folds `a + b + c` left-deep in a loop;
  - the expression a call is made on (`a()()`);
  - the object of a property access (`a.b.c`);
  - the object of an element access (`a[0][0]`). `parseCallExpressionRest` and `parseMemberExpressionRest` take each next link in a loop.

  The other side of each step is nesting, since the parser takes it by recursion: a right operand (`a = b = c`, `a ** b ** c`, `a + (b + c)`), a call's arguments, an index. The set holds only what the table's chains showed.
- **The tree's depth**, bound `TREE_DEPTH` = **400**: every level, as the first round counted. This bounds TypeScript and every tree-sitter tree, whose only bound it is.
- A file marks the process when it passes either.

**The margin test, under the rule** (107 cases, all read cold, 72 s on the shared machine):

| Case | Count | Read cold at |
| --- | --- | --- |
| 31 TypeScript nesting constructs, the first round's and three more: `a ** b ** …`, `a + (b + (…))`, `a[a[…]]` | nesting | 400, twice 200 |
| 6 TypeScript chains: each step of the set alone (`a + b + …`, `a, b, …`, `a()()…`, `a.b.c…`, `a[0][0]…`) and mixed (`a.b().c()…`) | depth | 800, twice 400 |
| 64 tree-sitter constructs, eight grammars | depth | 800, twice 400 |
| 6 joint cases: nested tuple types, the lowest nesting construct, inside each of the six chains, as the chain's left-most operand | nesting and depth at once | nesting 300 and depth 600, one and a half times both bounds |

With the first builder's branch joined (its `007ce9855`), the readers it brought under a bound were added to the test. Each takes the bound of the mechanism that built the value:
- **A JSON document read by `JSON.parse`** takes the tree's bound, since `JSON.parse` holds no stack (a fresh node read an array nested 1,000,000 deep, by the first builder's probe) and only our walks recurse over it. Read cold at 800.
- **A POM's elements** take the tree's bound, since the reader keeps its own stack. Read cold at 800.
- **A tsconfig read by TypeScript's reader of JSON**, which recurses as its parser does, takes the nesting bound. Read cold at 400.
- **The TOML reader** refuses past its own fixed count in every process alike. A case holds that it reads 1,000 levels, refuses 10,000, and that a fresh worker given the refused `Cargo.toml` reads it as invalid, unmarked.

All 111 cases were read, in 54 s.

No case failed, so neither bound was lowered. A chain step the parser in fact recursed for would have shown as a chain failing at 800 with a frame of the parser's; none did.

**This repository by both counts** (908 TypeScript-family files, 283 tree-sitter files at the round's commit):
- **`htmlEntities.ts`:** nesting **17**, depth **255**. It is far under both bounds and marks nothing.
- **Deepest by nesting:** `tests/e2e/force-graph-identity.spec.ts` 37 (depth 41), then four probe scripts at 33.
- **Deepest by depth:** `htmlEntities.ts` 255, `scripts/live-docs/inspect.ts` 51 (nesting 19), `scripts/live-docs/history.ts` 44 (17), `force-graph-identity.spec.ts` 41 (37), `shell-faults/blade.cjs` 40 (31).
- **Tree-sitter:** unchanged, PowerShell at most, 63.

No file of this repository marks a worker.

**The measure's cost** in one generation (the built generator, a dry run, 1,128 files): 11,192 ms for the generation. The TypeScript measure took 250 ms over 694 trees and the tree-sitter measure 68 ms over 321, together **318 ms, 2.8 %**. That is more than the first round's 176 ms. That round stopped at its bound, which `htmlEntities.ts` passed, and took no step's kind. Now every tree is walked whole, and each step is classed.

## The first round: one depth

**Answer.** `READING_DEPTH` is **200**, down from a provisional 300. The ruling is that the depth sits at most half the smallest depth at which a fresh process fails any kind of nesting a reader can meet. Three of the first builder's constructs gave cold limits of about 660 (nested arrays), about 1,000 (nested objects) and about 680 (parentheses). Probing every kind found three lower ones, all in TypeScript: **nested tuple types fail cold at 453 deep**, type arguments at 506 and nested calls at 598. Half of 453 is 226; 200 is the round number under it. Every one of the 96 constructs below is read cold at 400 deep, twice the depth. No tree-sitter construct failed at 800. The margin test takes 45 to 64 s on the shared machine. **The cost here:** one file of this repository, `htmlEntities.ts`, is 255 deep. Every change since 2026-11-19 holds it (174 of the 1,407 mainline changes), and each of those is now decided by a fresh process. The measure itself costs 1.6 % of a generation.

### How it was measured

- **Depth** is counted the way `processMark.ts` counts it (TypeScript: the root 1, each child of `ts.forEachChild` one more) and the way `treeSitter.ts` counts it (a cursor, the root 1). Each construct is written to a depth by that measure, not by its count of brackets. Tuple types at `n` levels are `n + 3` deep, for example, and nested class expressions two a level.
- **A fresh process** is a worker forked the way the pool forks one (`summarizingFlags` and `summarizingEnvironment` of `regenerate.ts`: tsx's loader, the pool's environment) and given its first change. That change is a repository of one commit holding the configuration and the one nested file. The file is read if the worker's report has nothing unmapped, the change is published, and the mark is `deep` alone.
- **A limit** is found with the first builder's probe (`scratchpad/depth/probe.cjs`), copied to read the generator either built or, under tsx, from source. It runs one fresh process at a time, doubling the levels and then bisecting to two levels. The built engine and tsx gave the same limits to the level for calls and type arguments.
- **Runs of the margin test**, all 96 constructs at once, four workers at a time: twice 300 (600 deep, the first set of 88), twice 250 (500 deep), twice 200 (400 deep), and twice 400 (800 deep, to see it red).

### The table

"Read at" is the deepest of the runs above at which a fresh worker read the construct. "Fails at" is the shallowest at which it did not, with the reason, always `Maximum call stack size exceeded`. "Limit" is the cold limit where it was probed.

| Construct | Reader | Read at | Fails at | Limit (probed) |
| --- | --- | --- | --- | --- |
| nested arrays `[[1]]` | TypeScript | 600 | 800 | 656 levels, about 660 deep (first builder, built) |
| nested objects `{a:{a:1}}` | TypeScript | 800 | | 496 levels, about 1,000 deep (first builder, built) |
| parentheses `((1))` | TypeScript | 600 | 800 | 672 levels, about 680 deep (first builder, built) |
| nested calls `f(f())` | TypeScript | 500 | 600 | 593 levels, **598 deep** (tsx and built) |
| arrow functions `() => () => 1` | TypeScript | 800 | | |
| blocks `{{}}` | TypeScript | 800 | | |
| `if … else if` chains | TypeScript | 800 | | |
| ternaries `a ? 1 : a ? 1 : 2` | TypeScript | 800 | | |
| JSX elements `<a><a></a></a>` | TypeScript (TSX) | 800 | | |
| template literals | TypeScript | 800 | | |
| type literals `{a:{a:number}}` | TypeScript | 800 | | |
| type arguments `Array<Array<number>>` | TypeScript | 500 | 600 | 503 levels, **506 deep** (tsx and built) |
| type arguments in a call `f<Array<…>>()` | TypeScript | 500 | 800 | |
| array types `number[][]` | TypeScript | 800 | | |
| tuple types `[[number]]` | TypeScript | 400 | 500 | 450 levels, **453 deep** (tsx) |
| parenthesized types `((number))` | TypeScript | 500 | 800 | |
| union types `1 \| (1 \| 1)` | TypeScript | 800 | | |
| indexed access types `T["a"]["a"]` | TypeScript | 800 | | |
| type operators `keyof keyof` | TypeScript | 800 | | |
| mapped types | TypeScript | 800 | | |
| qualified names `a.b.b` | TypeScript | 800 | | |
| function types `() => () => number` | TypeScript | 800 | | |
| conditional types | TypeScript | 800 | | |
| nested functions | TypeScript | 800 | | |
| nested namespaces | TypeScript | 800 | | |
| class expressions `class { x = class {…} }` | TypeScript | 600 | 800 | |
| `a + b + …` | TypeScript | 800 | | |
| `a.b().c()…` | TypeScript | 800 | | |
| `a.b.c…` | TypeScript | 800 | | |
| `a[0][0]…` | TypeScript | 800 | | |
| `a = b = …` | TypeScript | 800 | | |
| `!!a` | TypeScript | 800 | | |
| parentheses, lists, dictionaries, lambdas, nested `if` blocks, nested `def`s, `a + b`, `a.b().c()` | tree-sitter Python | 800 | | |
| parentheses, nested calls, blocks, `if` chains, initializer lists, `a + b`, `a->b` | tree-sitter C++ grammar, for C | 800 | | |
| parentheses, blocks, lambdas, template arguments, nested namespaces, nested classes, `a + b`, `a.b().c()` | tree-sitter C++ | 800 | | |
| parentheses, blocks, `if` chains, lambdas, type arguments, nested classes, `a + b`, `a.B().C()` | tree-sitter C# | 800 | | |
| parentheses, blocks, `if` chains, lambdas, array initializers, type arguments, nested classes, `a + b`, `a.b().c()` | tree-sitter Java | 800 | | |
| parentheses, blocks, `if` chains, composite literals, function literals, `a + b`, `a.B().C()` | tree-sitter Go | 800 | | |
| parentheses, blocks, `if` chains, arrays, closures, type arguments, nested modules, `a + b`, `a.b().c()` | tree-sitter Rust | 800 | | |
| parentheses, script blocks, arrays `@()`, hashtables, nested `if` blocks, nested functions, `$a + $a`, `$a.b().c()` | tree-sitter PowerShell (the engine's build) | 800 | | |

Three constructs had to be written again before they read as their languages write them, since the test requires a tree free of syntax errors. In the C++ grammar `{{}}` in a function is an initializer list unless each block holds a statement (`{ ;{ ;}}`). Past fifty levels, `A<A<int>>` reads `>>` as a shift unless the brackets are spaced. TypeScript's `f<X extends Array<X extends …>>` is no construct at all, and was dropped.

**Red at twice 400.** With `READING_DEPTH` at 400 the test fails 8 of its 96 cases at 800 deep: nested arrays (795 levels), parentheses, nested calls, type arguments, type arguments in a call, tuple types, parenthesized types and class expressions. Each is unmapped by the worker for `Maximum call stack size exceeded`. The other 88 are read. At 300 it failed calls and type arguments at 600. At 250 it failed tuple types at 500.

**Why TypeScript's types sit lowest** is not established here. A worker reports only the overflow's message, not its stack. TypeScript's own parser is one place it can happen: in a first form of the test, the test's own process parsed the 800-deep files to measure them and overflowed in `parseArrayLiteralExpression` and `parseParenthesizedExpression`. The test now measures a TypeScript construct at 8, 16, 32 and 64 levels and extrapolates, and requires its depth to grow by the same step at each. Which walk overflows first in a worker was not traced.

### What the one depth cost in this repository

**The deepest files** of every tracked file at `ef57f201b` that the readers meet, by the measure (905 TypeScript-family files, 283 tree-sitter files):

| Depth | Reader | File |
| --- | --- | --- |
| **255** | TypeScript | `packages/engine/src/tooling/htmlEntities.ts` |
| 51 | TypeScript | `scripts/live-docs/inspect.ts` |
| 44 | TypeScript | `scripts/live-docs/history.ts` |
| 41 | TypeScript | `tests/e2e/force-graph-identity.spec.ts` |
| 40 | TypeScript | `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-07/Probes/shell-faults/blade.cjs` |
| 63 | PowerShell | `scripts/oracle/powershell-ast.ps1` |
| 59 | PowerShell | `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/pester-probe/Probe.Tests.ps1` |
| 56 | PowerShell | `tests/integration/programs/powershell/rollout/config/targets.psd1` |
| 56 | PowerShell | `tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psd1` |
| 47 | PowerShell | `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/pester-probe/run.ps1` |

**One file exceeds the depth.** `htmlEntities.ts` holds HTML's 2,125 named references as one string built by `"…" + "…" + …` over about 250 lines. That is a left-deep chain of about 250 additions, 255 deep. It came in with `c2bfd65f1` (2026-11-19) and stands in the 174 mainline changes since then, out of 1,407. At the old provisional 300 it was under the depth. At 200 it marks the worker of every one of those changes, so each is summarized by a fresh process at the old speed. A cold process reads this construct at 800 deep (the table), so its mark is the price of one depth for every construct, not a risk. The depth was not changed to fit it. Every other file is under 64.

**The measure's cost** in one generation of this repository (the built generator, a dry run, 1,128 files, the machine shared with other builders): 11,077 ms for the generation. The TypeScript measure took 123 ms over 694 trees and the tree-sitter measure 53 ms over 321, together **176 ms, 1.6 %**. A full walk of every tracked file, without the measure's early stop, took 276 ms for TypeScript and 90 ms for tree-sitter.

**Readers with no depth measure.** JSON is read by `JSON.parse` and the TOML manifests by `smol-toml`. CSS, HTML, SQL and Ruby are read by the adapters' own scanners. None of them is counted by `READING_DEPTH`, and none was probed. A deeply nested `package.json` or `Cargo.toml` is outside this ruling.
