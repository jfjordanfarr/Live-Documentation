# The reading depth: how deep a fresh process reads each kind of nesting

_A record of November 20, 2026 (UTC), not current documentation. Measured by a builder for the root in its own worktree from `ef57f201b`, under Node 26, on the machine of this folder's README, every machine-loading run through the browser lane. The current rule is `READING_DEPTH` and `TREE_DEPTH` in `packages/engine/src/live-docs/processMark.ts`, held by `tests/integration/live-docs/reading-depth.test.ts`. The first round, one depth for every construct, is kept below as it was found. The second round, two bounds, follows it and supersedes its answer. The third round, what the measure did not reach, was added later that day by another builder from `894bcfaa7`. The fourth round, the audit of every place the parser reads and throws away, was added by the same builder on its branch at `67f2d8113`. They come first, the newest at the top._

## The fourth round: every place the parser reads and throws away

**Why an audit, and the idea set aside.** An independent reviewer showed at `67f2d8113` that the third round's rule for `<` followed only the tree's left spine: `f(a < a, a < a, …)` and `[a < a, …]` in a `.ts` file read fresh to 516 and fail at 517, while the measure gave nesting 7. The promise had become a list, and the list was not closed. The root weighed bounding the parser by the stack it really uses, a warmed process parsing with only a share of its stack left. It measured this between 17:21 and 17:25 UTC: `stack-share-probe.cjs` and its table `stack-share-probe.out`, beside this record. A warmed process reads 2.2 to 5.7 times deeper than a fresh one, depending on the construct. So no one share makes "a warm worker read it with this share" imply "a fresh process reads it whole", except by a ratio that differs by construct and is unknown for one not measured. It is no more closed than counting, costs time at every parse, and its answer depends on the process's state. **The idea is set aside; the bound stays a count of the file's own structure.**

**What makes the count closed.** The tree mirrors every parse that is kept, a node per level. So the count can miss only what the parser reads and throws away, or keeps outside the tree. Those places are finite in `parser.ts`: every call of `tryParse`, `lookAhead` and `speculationHelper`, and every parse whose result is dropped. Below is each of them in TypeScript 5.9.3, by its line in the installed `node_modules/typescript/lib/typescript.js` (85 lines match the three names between the parser's first and last line, 33,100 to 40,100; three are the helpers' own definitions). The dropped results were found by a search for a parse call standing alone as a statement: two, `skipParameterStart`'s binding pattern and the JSDoc default. Each site is one of three kinds:
- **bounded:** it reads a fixed few tokens, or loops over tokens, at a constant depth of stack;
- **mirrored:** the kept parse reads the same tokens to the same depth, or the attempt is itself kept;
- **deeper than the tree:** for these, the rule that counts it and the construct that holds it.

`processMark.test.ts` pins the version: its case fails when the installed TypeScript is not 5.9.3, and its message says to redo this table before changing the expected version.

| Line | Site | Kind | What reads it, and the rule |
| --- | --- | --- | --- |
| 33266, 33274 | JSON text: a number, then not `:` | bounded | |
| 33448 | `reparseTopLevelAwait`: statements holding `await` parsed again as top-level await | mirrored | the second parse is kept |
| 34095, 34138 | `nextTokenCanFollowModifier` | bounded | |
| 34111, 34114 | after `default`, after `export` | bounded | |
| 34163 | `isTypeMemberStart` | bounded | modifiers looped over |
| 34165 | `isClassMemberStart` | bounded | modifiers looped over |
| 34186 | `isValidHeritageClauseObjectLiteral` | bounded | |
| 34224, 34266, 34318 | `from` and a string; a start of expression; `</` | bounded | |
| 34708 | an identifier on the same line | bounded | |
| 34935 | JSDoc `function` then `(` | bounded | |
| 35191 | `isUnambiguouslyIndexSignature` | bounded | |
| 35273 | `new` then `(` or `<` | bounded | |
| 35398 | `isTupleElementName` | bounded | |
| 35527, 38496 | `parseKeywordAndNoDot` | bounded | |
| 35551, 35625 | `-` then a number | bounded | |
| 35566, 35568 | `isStartOfTypeOfImportType`, `isStartOfMappedType` | bounded | |
| 35576 | `asserts` then a name | bounded | |
| 35627, 35653 | `isStartOfParenthesizedOrFunctionType`, `nextTokenIsStartOfType`: `isStartOfType` at `(` looks ahead again, once for each `(` of a run | mirrored | the kept parse reads the same parentheses as parenthesized types, with more frames a level |
| 35696 | the constraint of `infer X extends T` | mirrored | dropped before a `?` outside a conditional's `extends`, then read again as a conditional type's |
| 35764 | `isUnambiguouslyStartOfFunctionType` → `skipParameterStart`: a binding pattern parsed and dropped | mirrored | the kept parse reads the same tokens as a tuple or a parameter; `([[a]]) => void` fails cold at 1,000 levels (the third round) |
| 35767 | `abstract` then `new` | bounded | |
| 35807 | `parseTypePredicatePrefix` | bounded | |
| 35879, 35979 | `import` then `(`, `<` or `.`; a name on the same line | bounded | |
| 36055 | `parsePossibleParenthesizedArrowFunctionExpression`, tried: parameters (patterns, initializers), a return type and a body, dropped when no arrow | mirrored | the kept parse reads the same tokens as an expression. Where the attempt reads a type the kept parse reads as an expression (`c ? (a) : b`, the return type `b`), the type's own `<` runs are counted by the rule for `<` below; `(a = (a = …))` fails cold at 437 levels, two of nesting each (the third round) |
| 36059 | `isParenthesizedArrowFunctionExpressionWorker` | bounded | |
| 36096, 36126, 36169 | modifiers then a name; an arrow in JSX; `isUnParenthesizedAsyncArrowFunctionWorker` | bounded | |
| 36357, 36446 | a name on the same line; JSX's `<` then a name or `>` | bounded | |
| 36465, 36468 | `import` then `(`, `<`, `.` | bounded | |
| 36502 | type arguments after `super` | deeper than the tree | the rule for `<` below |
| 36563 | an adjacent JSX element | mirrored | the attempt always returns a node, so it is always kept |
| 36828 | `?.` then a name, `[` or a template | bounded | |
| 36924, 36965 | **`parseTypeArgumentsInExpression`**, after every member expression and after `?.` | **deeper than the tree** | **the rule for `<` below** |
| 37062, 37347, 37348 | `function` on the same line; `using` and `await using` | bounded | |
| 37602, 37617 | the next token; `isDeclaration2` | bounded | modifiers looped over |
| 37649 to 37707 | the starts of statements and declarations | bounded | |
| 38032, 38085, 38086, 38093 | `of`; `"constructor"` | bounded | |
| 38274, 38277, 38341, 38445 | modifiers, `static {`, `implements` | bounded | |
| 38580, 38608, 38611 | `require(`, `type`, `defer` in imports | bounded | |
| 39192, 39202 | JSDoc: the end of the comment | bounded | |
| 39424, 39523, 39572 | JSDoc: a link's prefix; `@see`'s link | bounded | |
| 39501 | **JSDoc: a bracketed parameter's default, `parseExpression()`, dropped** | **deeper than the tree** | **read again alone**, cut where the expression ends: the first `]` outside every bracket and template it opens, found by TypeScript's scanner in a loop, a `/` read as a regular expression where an operand may start; in a JSX file read to the tag's end once a `<` is met. The tag's prose is otherwise never read; a `RangeError` in the second read counts as beyond every bound and is never thrown. Held by "a parameter's default" in `.ts`, `.js` and `.jsx`, and by the unit cases of the reviewer's three prose shapes |
| 39540, 39701, 39763 | **JSDoc: each following tag tried as a child of a nested parameter, of a typedef, of a callback, and dropped when it is not one** | **deeper than the tree** | the rejected tag is read at the depth of the nesting, then again where it stands. So a JSDoc comment counts as its deepest node plus the nesting of its deepest nested type literal below the comment. A first form counted every comment as twice its height; it marked the worker case's warming files (JSDoc tuples 150 deep counted 300) and was dropped. Held by "nested parameters, then a deep tag tried as their child and thrown away" in three file kinds |
| 39774 | JSDoc: a callback's `@return`, tried and dropped when it is another tag | deeper than the tree | the same rule as the line above |
| (the walk) | a node's JSDoc, which `forEachChild` never reaches | kept outside the tree | walked as nesting (the third round) |

**The rule for `<`.** It applies in a file that is not JavaScript's: `.ts`, `.tsx`, `.mts` and `.cts`. In `.js`, `.jsx`, `.mjs` and `.cjs`, `parseTypeArgumentsInExpression` returns at once on its `JavaScriptFile` flag, so no attempt is made. After every member expression the parser calls it. At a `<` (or `<<`, read again as `<`) it reads a list of types, `parseDelimitedList(TypeArguments, parseType)`, whose terminator is any token but a comma.
- **What a run goes on through:** commas between the list's types. Within one type it goes on through `|` and `&` (flat loops), `.` (an entity name's loop), brackets (tuples), parentheses (parenthesized and function types), braces (type literals, whose members part on `,` and `;`), `typeof` and the JSDoc prefixes `!` and `?`. An arrow function with an expression body is read as a function type whose return type holds the rest of the list, one level deeper. Each type reference followed by `<` opens a list one level deeper.
- **Where it ends:** at the first token that no type and no comma continues. That is a closing bracket it did not open, `;` or a statement's end outside a brace it opened, `(` after a type reference, `?`, `=`, an operator such as `+`, or a literal or an indexed access followed by `<`.
- **Why it never leaves its statement:** a closing bracket, a `;` and the start of a following statement each end the list. A block inside it (an arrow's body) is read as a type literal and ended at its `}`.
- **Nor does it pass from one member of a class to the next:** members are parted by `;` or a line's end, never by a comma, and the list ends at the first token that is not a comma once a type is done. So each class member is a region of its own, as a statement is.
- **So within a statement**, the attempt is at most as deep as:
  - the deepest of the statement's nodes, where it starts;
  - plus the levels of the statement's structure it reads through, which the tree holds;
  - plus one level for each comparison and each arrow function with an expression body anywhere in the statement, statements within it included.
- **The count:** `base + 2 × (max − base) + units`, for every statement (or class member) with a comparison of its own. A statement without one starts no attempt and is not counted.
- **Why statements within it count, since the root's review of `7aa915f11`:** an arrow's block body read inside a run is a type literal, and a statement written as a label's (`x: a < a, …`) is a member whose type a run goes on through. At `7aa915f11` the comment named that path as not followed. Counting every unit of the whole statement covers it, and every other path inside the statement, with no reasoning about what a block read as a type literal lets through. It cold-fails at 518, and it is a construct of the margin test.
  - A unit case holds that the count of a statement deep in its parentheses grows by one for each comparison of a label's statement in its arrow's block. It was red under the earlier rule, which added nothing.
  - A class is its members' regions: a unit case of a class with a comparing property and 500 comparing methods counts as one with 5. It counted 513 against 18 with the members not regions.
- **One rule, not two:** the third round's "the left operand of `<` is nesting" is gone, since this one holds `a < b < c` too.
- **Blocks:** a block's statements are not chained to one another. The measure's unit case holds that a `describe` call around 500 statements of comparisons counts as one around 5, since the call holds no comparison of its own. The cold probe agrees: `f(a < a);` repeated as statements was read at 12,800 lines, and a run through an arrow's block body (`a < a, () => { a < a; }`) fails at 750 units, not nested by the block.
- **What it costs:** a statement with a comparison of its own and large bodies within it (`if (a < b) { … }`, `for (…; i < n; …) { … }`) counts all their comparisons.
- **Each term is held by a case that goes red without it:**
  - the comparisons: 25 of the 27 comparison constructs and two unit cases;
  - the arrow term: "comparisons each in an arrow's expression body" (`f(a < a, () => a < a, …)`) fails cold at 359 units, below twice the bound by a count of one a unit; without the term a fresh worker could not map it at 389, in `.ts` and `.tsx`;
  - the JSDoc literal term: "nested parameters, then a deep tag tried as their child" fails cold at 100 levels, with the tag four times as deep as the nesting; without the term a fresh worker could not map it at 99 levels, counted 402, in three file kinds.

**Cold limits in a bare node, a process per trial:**

| Shape | Fails at |
| --- | --- |
| `f(a < a, …)`, `[a < a, …]` | 521 comparisons |
| joined by `\|` | 512 |
| with an arrow's expression body between (`a < a, () => a < a`) | 212 pairs, three levels each by the count |
| with an arrow's block body between | 750 pairs |
| each in an arrow's expression body, `f(a < a, () => a < a, …)` | 359 |
| in a label's statement in an arrow's block body, `f(a < a, () => { x: a < a, … })` | 518 |
| `typeof a < a` side by side | 534 |
| `!a < a` side by side | 465, the lowest per unit: twice the bound is 400, read by a fresh worker |

**The margin test's new constructs**, in `.ts` and `.tsx` each, at nesting 400 by the count:
- the reviewer's two;
- joined by `|`, joined by `&`;
- with an arrow's expression body between, and with an arrow's block body between;
- `!a < a`, `typeof a < a` and `a.b < a.b` side by side;
- comparisons in nested parentheses, and in a tuple's place.

The JSDoc constructs gain the rejected child tag in three file kinds.

**This working copy by the count** (911 TypeScript-family files):
- **At `7aa915f11`:** the largest count was 55 (`…/2026-11-08/Probes/defaults-verification/scripts/builder/visibility-probe.mts`). The rule changed 260 files, by 26 at most, against `67f2d8113`'s measure without its second read of defaults.
- **After the root's review:** the largest count is 59, the same file. Then come `…/2026-11-18/Probes/text-shape/trials.ts` at 57 and `packages/explorer/src/client/views/forceGraphPhysics.ts` at 51. The whole-statement count changed 89 files against `7aa915f11`, by 11 at most.
- That is far below 200, and no file marks a worker.

**The default's cut in a JSX file.** A JSX element's text may hold a `]` that the scanner cannot tell from the default's end, which would cut the text shorter than the default. So in a `.tsx` or `.jsx` file, once a `<` is met, the default is read to the tag's end: a longer text, which can only count more. A unit case of `[a=<a>]{[[…200…]]}</a>]` marks; it did not without this.

**Not settled.** Nothing of the attempt's paths that this round knows of. The constructs whose levels take more frames than a type argument's (`!a`, the lowest at 465, and `typeof a` at 534) are in the margin test; a reviewer may look for more such prefixes.

**A known limit, not mended.** TypeScript's parser takes exponential time on `async (a = async (a = …))`: the reviewer measured 0.3 s at 10 levels and 43.6 s at 20, the same in every process. A worker given such a file never answers, and the pool has no time limit for a change. This is older than this work, and the same in a process per commit. It is recorded here, not mended.

## The third round: what a walk by `forEachChild` does not reach

**The fault.** An independent reviewer found that the measure walked with `ts.forEachChild`, which never visits a node's `jsDoc`, while `ts.createSourceFile` parses the type expressions of every JSDoc comment eagerly, by the same recursive type parser. A JSDoc tuple 650 deep was counted nesting 5. With the history command over two commits (forty warming files of JSDoc and type tuples 150 deep, then a change removing them and adding `src/doc.ts` with a JSDoc tuple 650 deep), one worker published the second change with `src/doc.ts` in it, unmarked; a worker given only that change named the file not mapped (`Maximum call stack size exceeded`). That run is now the case `tests/integration/live-docs/jsdoc-depth-workers.test.ts`: red with the JSDoc walk taken out (the warm summary holds `src/doc.ts`, the fresh one names it unmapped), green with it.

**So the claim was narrower than its words.** "Below the bounds no process fails, whatever it has run before" holds for the constructs the margin test reads, and only for those. The words in `processMark.ts`, in the test and in the decisions log now say so.

**What TypeScript 5.9.3's parser builds or reads that a walk by `forEachChild` from the source file does not reach, or reaches at another depth than the parser recursed to,** from reading `parseJSDocCommentWorker`, the type and expression parsers and `forEachChildTable` in the installed `typescript.js`, each checked by a cold parse in a bare node, doubling then bisecting the levels:

| What | The parser | `forEachChild` | Done | Bare node, cold |
| --- | --- | --- | --- | --- |
| A node's JSDoc comments (`node.jsDoc`), in every file kind, `.ts` included (`createSourceFile` parses JSDoc in full by default) | parses each comment where it attaches it, its tags' types by the recursive type parser | visits inside a JSDoc node (tags, type expressions, type literals' property tags, signatures, template parameters, typedef names) but never reaches one from its node | walked, each JSDoc one level of nesting below its node | tuple types fail at 459 levels, as in code; object types 450; function types 409; type arguments 512; `?(` nullable types 353 (two levels each) |
| The default of a bracketed JSDoc parameter or property, `@param {number} [a=[[1]]]` | `parseBracketNameInPropertyAndParamTag` parses it by `parseExpression` and keeps nothing | nothing to visit | read again, from after its `=` to the tag's end inside a parenthesis, as a file of its own kind, and counted below the tag | arrays fail at 656 levels, parentheses 681 |
| `a < a < a`, in TypeScript files | before each operand is taken as a comparison, `parseTypeArgumentsInExpression` tries it as type arguments, recursing through every later `<`, and throws the attempt away | a chain, folded left-deep | the left operand of `<` is nesting, in every file kind (in JavaScript the attempt is never made, so there it counts more than the parser took; it costs a mark, never a summary) | fails at 512 levels, as `Array<Array<…>>`; `a < (a < (…))` at 298 (two levels each) |
| The binding pattern `isUnambiguouslyStartOfFunctionType` reads ahead of a parenthesized type (`([[a]]) => void`) | parsed by `lookAhead`, then thrown away; the real parse reads the same tokens | the tree holds the real parse | nothing: it recursed less than the real parse | fails at 1,000 levels |
| Arrow-function speculation over `(a = (a = …))` | each level tried as parameters, then as an expression | the tree holds the expression | nothing: two levels each in the tree | fails at 437 levels |
| `JSDocNamepathType` (`module:x`) | built with no type | absent from the table | nothing: a leaf | |
| A typedef's or callback's dotted name, `@typedef {T} a.b.c` | `parseJSDocTypeNameWithNamespace` recurses per dot into nested module declarations | visited, one level each | counted with the JSDoc | fails at 6,000 levels |
| Nested JSDoc parameters, `@param {Object} a`, `a.a`, `a.a.a` | `parseNestedTypeLiteral` recurses per level through speculative child tags | visited, three levels each and the dotted name's | counted with the JSDoc | fails at 812 levels |
| Postfix steps the parser takes in loops: `a!`, `a as T`, `a satisfies T`, a tagged template's tag | `parseMemberExpressionRest`, `parseBinaryExpressionRest` | one level each | now chain steps (the reviewer's over-count: 300 `!` read as nesting 305) | each 51,200 levels read cold |
| Postfix type steps in a loop: `T[]`, `T["a"]`, JSDoc `T?` and `T!`; `a.b.c` in a type or a JSDoc name | `parsePostfixTypeOrHigher`, `parseEntityName`, `parseJSDocEntityName` loops | one level each | left counted as nesting: it costs marks, never a summary (array types and indexed access were read at 800 in the first round) | |

**Not settled.** Which other `tryParse` and `lookAhead` attempts recurse further than the tree they leave was settled only for the three above; the parser holds more of them (JSX against type assertions, generic arrow functions in `.tsx`, `parseTypeArguments` after `typeof`). The checker is not run by the generator, so no checker recursion was looked at. Constructs outside the margin test are outside the claim.

**The margin test** now holds 147 cases, all read cold in 104 s on the shared machine. Its new cases:
- `a < b < …` and `a < (b < (…))`, nesting, at 400;
- `a!!…`, `a as … as …`, `a satisfies … satisfies …`, `` a`` `` …, chains, at 800 deep;
- in a `.ts`, a `.js` and a `.jsx` file each, JSDoc tuple types, type arguments, object types, function types, nullable types, a parameter's default, a template's default, an augmented class's type arguments, a typedef's namespaces and nested parameters, nesting, at 400.

No case failed, so neither bound moved: `READING_DEPTH` 200, `TREE_DEPTH` 400.

**Why TypeScript's types sit lowest, in part.** A JSDoc tuple fails cold at the same 459 levels as a tuple type in code, with none of the code's expression and statement frames below it, so the limit is the type parser's own: each level of a tuple goes from `parseType` through the union, intersection, operator, conditional-context, postfix and non-array steps to `parseTupleType`, then through the bracketed and delimited list's element steps back to `parseType`, more frames than an array literal's level takes. Read from the parser, not traced.

**This repository by both counts** (910 TypeScript-family files under the working copy, by the built measure): unchanged at the top. Deepest by nesting `tests/e2e/force-graph-identity.spec.ts` 37 (depth 41), then probe scripts at 33; deepest by depth `htmlEntities.ts` 255 (nesting 17), `scripts/live-docs/inspect.ts` 51. The mend changed the counts of 49 files, none near a bound. No file marks a worker.

**The measure's cost.** Timed beside the measure before the mend over the same 910 parsed trees, bounded, three rounds on the shared machine: 398 and 468 ms a round before, 569 and 632 ms after, about a third more. Not timed within a generation; at the second round's 250 ms of 11.2 s, a third more is about 340 ms, 3 %.

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

**Why TypeScript's types sit lowest** is not established here (the third round, above, answers part). A worker reports only the overflow's message, not its stack. TypeScript's own parser is one place it can happen: in a first form of the test, the test's own process parsed the 800-deep files to measure them and overflowed in `parseArrayLiteralExpression` and `parseParenthesizedExpression`. The test now measures a TypeScript construct at 8, 16, 32 and 64 levels and extrapolates, and requires its depth to grow by the same step at each. Which walk overflows first in a worker was not traced.

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
