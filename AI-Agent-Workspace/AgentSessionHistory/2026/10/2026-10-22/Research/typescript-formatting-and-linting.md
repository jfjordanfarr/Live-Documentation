# Formatting and linting TypeScript: what exists, as of 2026-10-22

_A survey gathered on 2026-10-22 for the owner's question in [Turn 9 of the session record begun on October 21](../ChatHistory/2026/10/2026-10-21.1.record.md#turn-9): "We should research whether prettier is the answer we truly want relative to our styling/linting needs. I've spoken a fair bit in the past about the styles I use, and the preferences I have for linting. But I know that the TS ecosystem is evolving everyday." A delegated research agent (Opus 5.5) with web access gathered it. It records what existed on its date, with a source for every claim, and decides nothing. Section 6 sets the options against the owner's stated requirements; it is a comparison, not a recommendation._

Method. Every URL below was read on 2026-10-22. Versions and publication times come from the npm registry that day (`https://registry.npmjs.org/<package>`). Pages were read through a fetcher that quotes on request; the quotations from Prettier's and Biome's option philosophies, typescript-eslint's formatting page and ESLint Stylistic's "Why" page were then checked against the raw page text. Where this survey says "observed", the agent ran the named version itself on 2026-10-22, in a scratch directory outside the repository, on a 20-thread Linux container with Node 22.22.0. Nothing in the repository was changed, and the scratch files have since been deleted. The sample and the commands are given in section 4, so anyone can run them again.

## 1. Where this starts

### What the owner has said

1. **Lint enforces correctness, not formatting.** "I like linting that enforces programmatic correctness, but dislike linting which forces formatting conventions or is otherwise pedantic" (2025-10-16, [the record](../ChatHistory/2025/10/2025-10-16.md), line 2964). In the same exchange they chose type-aware linting as "the more durable option".
2. **Hand-aligned whitespace is a major preference.** "I personally have a _major_ preference to utilize languages which allow me to use an arbitrary number of spaces/tabs so that I can visually align things which are semantically aligned. The kind of style you'd see from an old-school SQL coder" (2026-09-27, [the record](../ChatHistory/2026/09/2026-09-26.1.md), lines 491–493). They also wrote, "Feel free to adjust so long as it isn't a matter of substantive code quality."
3. **Readable over condensed.** "The absolute vertical smashing, and the lack of any choice to align things semantically, horizontally and vertically" (2026-10-14, [Turn 11 of the October 13 record](../ChatHistory/2026/10/2026-10-13.1.record.md)).
4. **Docstrings on public symbols.** They asked for "linting that works like the C# linting which mandates docstrings over every public symbol" (2026-02-15, [the record](../ChatHistory/2026/02/2026-02-15.1.md), line 695). The answer was `jsdoc/require-jsdoc` with `publicOnly`, set to warn, on 2026-02-16.
5. **No suppression syntax that hides a problem, and no magic strings that bypass rules** (2026-01-16 and 2026-02-15; [the January 16 record](../ChatHistory/2026/01/2026-01-16.1.md), [the February 15 record](../ChatHistory/2026/02/2026-02-15.1.md)). AGENTS.md says "Fix causes, not gates" ([AGENTS.md](../../AGENTS.md)).
6. **Tests are linted.** Restored 2026-09-27.
7. **Tabs or spaces, indent width, line length, quotes, semicolons, trailing commas.** No statement was found in the part of the record that was searched. The owner disputed that finding ("WHAT?", 2026-10-22, [the record's Turn 10](../ChatHistory/2026/10/2026-10-21.1.record.md#turn-10)), then pointed to requirement 2 as the one that matters. These preferences are **unknown** and are being asked about. They are not indifference. Requirement 2 already names "an arbitrary number of spaces/tabs" for alignment.

### What the repository does today

- **Linting.** ESLint 9.39.4 with a flat config ([eslint.config.js](../../eslint.config.js)). It uses `@eslint/js` recommended and typescript-eslint 8.57.0's recommended rules everywhere. `recommendedTypeChecked`, with `projectService`, applies only to `packages/**/src`. `no-floating-promises` is an error. `await-thenable` has been off since 2025-10, with the comment "Workaround: rule is unstable with TS 5.x + projectService in some environments". Imports are ordered by `import/order` (eslint-plugin-import 2.32.0 with the TypeScript resolver). `jsdoc/require-jsdoc` (eslint-plugin-jsdoc 62.7.1) is a warning, and warnings do not fail the gate. eslint-config-prettier 10.1.8 is loaded, and there is no stylistic plugin. `npm run lint` takes about 2 minutes ([AGENTS.md](../../AGENTS.md)).
- **Formatting.** Prettier 3.8.1 with `{singleQuote: false, semi: true, trailingComma: "es5", printWidth: 100}` (`.prettierrc`, removed on 2026-10-22 with [the decision](../../.mdmd/layer-3/architectural-decisions.mdmd.md#no-formatter-for-typescript-lint-for-correctness-on-eslint-10-and-the-tsconfig-off-baseurl-and-node10-recorded-2026-10-22)). `npm run format` is `prettier --check .` ([package.json](../../package.json)), and neither the gate nor CI runs it. The dev container installs `esbenp.prettier-vscode`, sets `"editor.formatOnSave": true` and names no default formatter ([devcontainer.json](../../.devcontainer/devcontainer.json)).
- **TypeScript** is 5.9.3 under `strict`. [tsconfig.base.json](../../tsconfig.base.json) sets `"moduleResolution": "Node"` and `"baseUrl": "."`.
- **How the code is written**, as measured by a delegated agent for the root on 2026-10-22 over 425 files and 92,140 lines. Indentation is 2 spaces (15 files use 4). Strings use double quotes, and statements always end in semicolons. Trailing commas are mostly absent. The 95th-percentile line is 119 characters, and 8.7% of lines run past 100. There are 846 aligned runs in 51 files, mostly in the engine's adapters and `scripts/oracle`. A delegated check on 2026-10-21 found 345 of 355 TypeScript files out of step with Prettier ([the record](../ChatHistory/2026/10/2026-10-21.1.record.md), Turn 8).

## 2. Versions on the survey date

| Tool | Latest on 2026-10-22 | Published | Pre-release line | Source |
| --- | --- | --- | --- | --- |
| Prettier | 3.9.10 | 2026-10-10 | 4.0.0-alpha.13 (2025-11-18) | [registry](https://registry.npmjs.org/prettier) |
| Biome | 2.6.2 | 2026-10-21 (2.6.0 the same day) | | [registry](https://registry.npmjs.org/@biomejs/biome) |
| oxfmt | 0.74.0 | 2026-10-19 | | [registry](https://registry.npmjs.org/oxfmt) |
| dprint CLI / TypeScript plugin | 0.64.1 / 0.96.1 | 2026-10-20 / 2026-05-20 | | [registry](https://registry.npmjs.org/dprint), [plugin](https://plugins.dprint.dev/dprint/dprint-plugin-typescript/latest.json) |
| Deno (fmt, lint) | 2.9.6 | | | observed with `deno --version` |
| @stylistic/eslint-plugin | 5.10.0 | 2026-03-06 | 6.0.0-beta.6 (2026-08-22) | [registry](https://registry.npmjs.org/@stylistic/eslint-plugin) |
| clang-format | 23.1.3 | | | observed (PyPI `clang-format` wheel) |
| ESLint | 10.13.0 | 2026-10-16 (10.0.0 on 2026-02-06) | | [registry](https://registry.npmjs.org/eslint) |
| typescript-eslint | 8.72.0 | 2026-10-19 | | [registry](https://registry.npmjs.org/typescript-eslint) |
| eslint-plugin-jsdoc | 65.4.0 | 2026-10-20 | | [registry](https://registry.npmjs.org/eslint-plugin-jsdoc/latest) |
| eslint-plugin-import / import-x | 2.32.0 / 4.17.1 | 2025-06-20 / 2026-06-28 | | [import](https://registry.npmjs.org/eslint-plugin-import/latest), [import-x](https://registry.npmjs.org/eslint-plugin-import-x/latest) |
| Oxlint / oxlint-tsgolint | 1.89.0 / 7.0.2004 | 2026-10-19 / 2026-10-10 | | [oxlint](https://registry.npmjs.org/oxlint), [tsgolint](https://registry.npmjs.org/oxlint-tsgolint) |
| TypeScript | 7.0.2 | 2026-07-08 | 7.1.0-beta (2026-10-20) | [registry](https://registry.npmjs.org/typescript) |

TypeScript 6.0.2 was published on 2026-03-23 and 6.0.3 on 2026-04-16 ([registry](https://registry.npmjs.org/typescript)).

## 3. Formatters

### 3.1 Prettier

- **Options are frozen.** "Prettier has a few options because of history. But we won't add more of them." "Option requests aren't accepted anymore." "The same applies to requests to preserve elements of input formatting (e.g. line breaks)". "for formatting-related options, this is final." ([Option Philosophy](https://prettier.io/docs/option-philosophy))
- **What it keeps from the input.** Prettier keeps empty lines but collapses runs of them into one. A short object written over several lines stays multi-line ("short multi-line objects are never collapsed"). The rationale page says nothing about whitespace inside a line ([Rationale](https://prettier.io/docs/rationale)).
- **Alignment requests have been declined.** On #17176, a request for vertical alignment of `:`, `=` and `+=`, a maintainer replied "Sorry, we are not going to support this" and closed it as not planned on 2025-02-24 ([#17176](https://github.com/prettier/prettier/issues/17176)). On #14673 (2023): "We will not add an option for this" ([#14673](https://github.com/prettier/prettier/issues/14673)). On #7993 (2020), a request to align table-like objects: "Sorry, we don't want it, you can create an eslint rule for it, or create a custom plugin" ([#7993](https://github.com/prettier/prettier/issues/7993)). The reason given in 2019 was diffs: "Prettier doesn't do alignment in general, because it causes unnecessary git diff" ([#6669](https://github.com/prettier/prettier/issues/6669)).
- **Ignore comments.** "A JavaScript comment of `// prettier-ignore` will exclude the next node in the abstract syntax tree from formatting." The range form, `prettier-ignore-start` and `prettier-ignore-end`, is documented for Markdown only. Whole files are left out through `.prettierignore` ([Ignoring Code](https://prettier.io/docs/ignore)).
- **Recent releases.** Prettier 3.9, released 2026-06-27, "brings major parser upgrades for Markdown, YAML, Flow, GraphQL, and Angular, along with formatting improvements for JavaScript and TypeScript (particularly in `--no-semi` mode)" ([3.9 post](https://prettier.io/blog/2026/06/27/3.9.0)). Prettier 3.6 shipped "a new experimental high-performance CLI behind a feature flag (`--experimental-cli`)", plus `@prettier/plugin-oxc`, which adds parsers based on the Rust OXC parser. That post gives no figures ([3.6 post](https://prettier.io/blog/2025/06/23/3.6.0)).
- **Its own view of linters.** "use Prettier for formatting and linters for catching bugs!" ([Prettier vs. Linters](https://prettier.io/docs/comparison))

**Plugins and forks that align.** `@yikes2000/prettier-plugin-merge-extras` describes itself as "A prettier plugin for less-opinionated options". It aligns the properties of object literals (`alignObjectProperties`: `colon`, `value` or `none`), and it aligns `=` in consecutive assignments or `//` comments only where an end-of-line marker (`//=`, `///`) is written ([README](https://github.com/yikes2000/prettier-plugin-merge-preserve)). Its latest release is 0.7.3-extras.2, from 2025-04-22, with a peer range of `prettier ^2 || ^3` ([registry](https://registry.npmjs.org/@yikes2000/prettier-plugin-merge-extras)). The fork `prettierx` had an `--align-object-properties` option. Its last release is 0.19.0, from 2021-07-06 ([registry](https://registry.npmjs.org/prettierx)).

### 3.2 Biome's formatter

- **Options.** "The existing set of options for formatting is considered stable, and new options are not likely to be considered." "Biome is its own automatic style guide, not a tool for implementing other style guides." "Requests for additional configuration options are not likely to be considered and may be closed without discussion." Biome treats its Prettier-compatible options as "a legacy feature for compatibility" ([Biome option philosophy](https://biomejs.dev/formatter/option-philosophy/)).
- **The options in 2.6.2.** The JavaScript formatter's keys are `arrowParentheses`, `attributePosition`, `bracketSameLine`, `bracketSpacing`, `delimiterSpacing`, `expand`, `indentStyle`, `indentWidth`, `jsxQuoteStyle`, `lineEnding`, `lineWidth`, `operatorLinebreak`, `quoteProperties`, `quoteStyle`, `semicolons`, `trailingCommas` and `trailingNewline`. None of them concerns alignment (`configuration_schema.json` in the [npm package](https://registry.npmjs.org/@biomejs/biome)). The default indent style is tab ([Formatter](https://biomejs.dev/formatter/)).
- **Ignore comments.** `biome-ignore format: <reason>` covers the next node, and `biome-ignore-all format: <reason>` covers the whole file ([Formatter](https://biomejs.dev/formatter/)). Observed in 2.6.2: a `biome-ignore-start format:` … `biome-ignore-end` pair did not stop the formatter from rewriting the lines between them.
- **Other languages.** Biome 2.6 adds Markdown, SCSS and YAML. "The Markdown formatter is ~92% compatible with Prettier." For YAML, "the formatter has 100% compatibility with Prettier" ([v2.6 post](https://biomejs.dev/blog/biome-v2-6/), dated Oct 15, 2026).
- **Requests to align.** A search of Biome's issue titles for "align" on 2026-10-22 found only pull requests that match Prettier's output, not any request for alignment ([GitHub search](https://github.com/biomejs/biome/issues?q=align+in%3Atitle)).

### 3.3 oxfmt (the Oxc formatter)

- **Status.** The beta was announced on 2026-02-24. "Oxfmt now passes 100% of Prettier's JavaScript and TypeScript conformance tests", and it is "more than 30× faster than Prettier and 3× faster than Biome on an initial run without caching" ([Oxfmt Beta](https://oxc.rs/blog/2026-02-24-oxfmt-beta)). The usage page says that Oxfmt "uses Prettier's output as its baseline" and that "Unexpected differences are treated as bugs". It claims "approximately 30x faster than Prettier and 2x faster than Biome". It formats JavaScript, TypeScript, JSON, YAML, TOML, HTML, CSS, Markdown, GraphQL and more ([Formatter](https://oxc.rs/docs/guide/usage/formatter.html)). Its version is still 0.x ([registry](https://registry.npmjs.org/oxfmt)).
- **Ignore comments.** "For JS/TS files, use `oxfmt-ignore` to skip formatting the next statement". A trailing form also works (`const a    = 42; // oxfmt-ignore`), and `prettier-ignore` is honoured. The page documents no range form ([Inline ignore comments](https://oxc.rs/docs/guide/usage/formatter/ignore-comments.html)).
- **Alignment.** No option exists ([Formatter](https://oxc.rs/docs/guide/usage/formatter.html)). One open issue asks for the opposite in Markdown: compact tables that are not padded ([#20140](https://github.com/oxc-project/oxc/issues/20140)).

### 3.4 dprint

- **Approach.** The TypeScript plugin keeps line breaks: "Line breaks are maintained, but not when they are consecutive or if they are at the beginning or end of a block", because "newlines can often convey meaning or grouping" ([plugin page](https://dprint.dev/plugins/typescript/)).
- **Options.** The 0.96.1 schema has 185 properties, including `preferSingleLine`, `preferHanging`, `linePerExpression`, `operatorPosition`, `quoteStyle`, `semiColons`, `trailingCommas`, `useTabs`, the `sortImportDeclarations` family and many `spaceSurrounding…` and `…Position` options. No property mentions alignment ([schema](https://plugins.dprint.dev/dprint/dprint-plugin-typescript/0.96.1/schema.json)).
- **Ignore comments.** `// dprint-ignore` covers the next statement or expression, and `// dprint-ignore-file` covers the file. The page documents no range form ([plugin page](https://dprint.dev/plugins/typescript/)).
- **Requests to align.** Several are open and unanswered: "Align assignments" since 2023-02-01 ([#483](https://github.com/dprint/dprint-plugin-typescript/issues/483)), "Option for Object align properties" since 2022-04-17 ([#358](https://github.com/dprint/dprint-plugin-typescript/issues/358)), "Align trailing comments across consecutive lines" since 2026-03-11 ([#778](https://github.com/dprint/dprint-plugin-typescript/issues/778)), and "Handle block scoped alignement formatting" since 2020 ([#14](https://github.com/dprint/dprint-plugin-typescript/issues/14)).

### 3.5 deno fmt

"Deno ships with a built-in code formatter based on dprint". Its options are `--indent-width`, `--line-width`, `--use-tabs`, `--no-semicolons`, `--single-quote` and `--prose-wrap`, and it formats TypeScript, JavaScript, JSON, Markdown, YAML, CSS, HTML and more. In TypeScript, `// deno-fmt-ignore` covers the next item and `// deno-fmt-ignore-file` the file. Range ignores (`deno-fmt-ignore-start` and `-end`) exist only in Markdown, HTML and CSS ([deno fmt](https://docs.deno.com/runtime/reference/cli/fmt/)).

### 3.6 ESLint Stylistic, and ESLint's own formatting rules

- **Why it exists.** ESLint and typescript-eslint deprecated their formatting rules, and ESLint Stylistic took them over. It argues that ESLint with auto-fix "respects the input of the source code". By contrast, Prettier's approach is said to "throw away all the stylistic information from the source code, meaning that we can't preserve the styles that we consider more "human-readable"" ([Why](https://eslint.style/guide/why)).
- **`key-spacing`.** `align: "value"` "enforces horizontal alignment of values in object literals", and `align: "colon"` aligns both the colons and the values. `mode: "minimum"` "enforces one or more spaces before or after colons", where the default, `"strict"`, enforces exactly one ([key-spacing](https://eslint.style/rules/key-spacing)). Observed in 5.10.0: the rule also reports properties in an `interface`.
- **`no-multi-spaces`.** Its premise is "Multiple spaces in a row that are not used for indentation are typically mistakes." An `exceptions` map exempts node types, such as `VariableDeclarator` for aligned declarations and `ImportDeclaration` for aligned imports. `ignoreEOLComments` exempts the spaces before end-of-line comments ([no-multi-spaces](https://eslint.style/rules/no-multi-spaces)). In 5.10.0 the default exceptions are `Property` and `ImportAttribute` (`dist/rules/no-multi-spaces.js` in the [npm package](https://registry.npmjs.org/@stylistic/eslint-plugin)). The 6.0.0-beta.4 changelog says "set default `exceptions` to empty" ([no-multi-spaces](https://eslint.style/rules/no-multi-spaces)).
- **`type-annotation-spacing`.** Its overrides can be set to `"ignore"`, "with the exception of the `colon` option" ([type-annotation-spacing](https://eslint.style/rules/type-annotation-spacing)).
- **`indent`.** It has `"first"` settings that align arguments, parameters, array elements, object properties and imported members with the first one, plus `ignoredNodes` as "an escape hatch" ([indent](https://eslint.style/rules/indent)).
- **ESLint's own copies.** ESLint deprecated 66 core formatting rules in v8.53.0 and said they "will not be removed until at least ESLint v10.0.0 (if not later)" ([the deprecation post](https://eslint.org/blog/2023/10/deprecating-formatting-rules/)). In ESLint 10.13.0 the rules are still present, among them `indent`, `key-spacing` and `no-multi-spaces`. Each is marked `deprecatedSince: "8.53.0"` with `availableUntil: "11.0.0"` (`lib/rules/*.js` in the [npm package](https://registry.npmjs.org/eslint)).

### 3.7 The TypeScript language service's formatter

This is the formatter behind VS Code's built-in TypeScript formatting. TypeScript 7.0's announcement lists the language-server features added since its beta, and formatting is not among them ([TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7.0/)). Observed: TypeScript 7.0.2's language server (`tsc --lsp --stdio`, which reports itself as `typescript-go`) advertises `documentFormattingProvider: true`. On the sample in section 4 it made the same 10 edits as TypeScript 5.9.3's `getFormattingEditsForDocument` with default settings. It collapsed every aligned `=` and `:` to a single space, but it kept the extra spaces before end-of-line comments and left line breaks alone.

### 3.8 clang-format in JavaScript mode

clang-format lists `.ts` among its JavaScript extensions ("JavaScript: .js .mjs .cjs .ts") and has no separate TypeScript language ([ClangFormat](https://clang.llvm.org/docs/ClangFormat.html)). The style options include `AlignConsecutiveAssignments`, `AlignConsecutiveDeclarations` (each with `AcrossEmptyLines` and `AcrossComments`), `AlignTrailingComments` and `AlignArrayOfStructures`. `// clang-format off` and `// clang-format on` bracket a range that "will not be formatted" ([Style Options](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)). Observed in 23.1.3 (section 4): it produced alignment of `=` and of trailing comments. It also produced artefacts in TypeScript. It aligned `let row = …` with the earlier `const lines: string[] = []`, giving `let   row             = expectedRow;`. It wrote `Node|null` without spaces, dropped the last semicolon of an interface, and reduced a colon-aligned object to one space on each side of every colon.

## 4. What the formatters did to hand-aligned code (observed)

The sample adapts real lines from `packages/engine/src/live-docs/adapters/csharp.ts` and `csharp.dependencies.ts`:

```ts
const APP_SETTINGS_PATTERN   = /AppSettings\s*\[\s*"([^"]+)"\s*\]/g;
const TYPE_GET_TYPE_PATTERN  = /Type\.GetType\s*\(\s*"([^"]+)"\s*\)/g;
const TYPE_NAME_PATTERN      = /"([A-Z][A-Za-z0-9_]*)"/g;

interface Edge {
  from:    string;   // the file that uses
  to:      string;   // the file that offers
  weight?: number;
}

const COLOURS = {
  offers : "blue",
  uses   : "green",
  faded  : "grey",
};

export function walk(node: Node, expectedRow: number): string[] {
  const lines: string[] = [];
  let row     = expectedRow;
  let sibling = node.previous;
  while (sibling) {
    lines.unshift(sibling.text);
    row     = sibling.row;
    sibling = sibling.previous;
  }
  return lines;
}

interface Node { text: string; row: number; previous: Node | null }
```

Each tool ran with a 100-column limit, 2 spaces and double quotes. Prettier used the repository's `.prettierrc`. Commands: `prettier --write`, `biome format --write`, `oxfmt`, `dprint fmt` (TypeScript plugin 0.96.1), `deno fmt --line-width 100`, and `clang-format -i` with `Language: JavaScript`, `BasedOnStyle: LLVM`, `AlignConsecutiveAssignments: true`, `AlignConsecutiveDeclarations: true` and `AlignTrailingComments: true`.

| Tool and version | Aligned `=` | Aligned interface types | Colon-aligned object | Spaces before trailing comments | Single-line interface |
| --- | --- | --- | --- | --- | --- |
| Prettier 3.9.10 | collapsed | collapsed | collapsed | collapsed | split into lines |
| Biome 2.6.2 | collapsed | collapsed | collapsed | collapsed | split into lines |
| oxfmt 0.74.0 | collapsed | collapsed | collapsed | collapsed | split into lines |
| dprint 0.64.1 | collapsed | collapsed | collapsed | collapsed | split into lines |
| deno fmt 2.9.6 | collapsed | collapsed | collapsed | collapsed | split into lines |
| TypeScript language service 5.9.3 and 7.0.2 | collapsed | collapsed | collapsed | kept | kept |
| Prettier 3.9.10 with merge-extras (`alignObjectProperties: "colon"`) | collapsed | re-aligned on the colon (`from    : string`) | kept | collapsed | split, then colon-aligned |
| clang-format 23.1.3, alignment options on | re-aligned, with the artefacts in section 3.8 | collapsed, comments re-aligned | collapsed to `key : value` | re-aligned | split into lines |

Prettier, Biome, oxfmt, dprint and deno fmt produced byte-identical output on this sample.

**One ignore comment over an aligned block.** Three aligned `const` declarations were each preceded by a single ignore comment: `// prettier-ignore`, `// biome-ignore format: …`, `// oxfmt-ignore`, `// dprint-ignore` or `// deno-fmt-ignore`. Every tool kept only the first declaration as written and collapsed the other two, as each tool's documentation says it covers the next statement only (section 3). Biome's file-wide `biome-ignore-all format:` kept all three.

**Stylistic rules on the same sample** (ESLint 10.13.0, @stylistic/eslint-plugin 5.10.0, the typescript-eslint parser):

- With `no-multi-spaces`, `key-spacing` and `type-annotation-spacing` at their defaults, the rules reported 14 problems, all auto-fixable. They covered every aligned `=`, the aligned interface types and the trailing comments, as well as the colon-aligned object.
- With `no-multi-spaces` exempting `VariableDeclarator`, `AssignmentExpression`, `Property`, `TSPropertySignature` and `TSTypeAnnotation` and ignoring end-of-line comments, plus `key-spacing` in `mode: "minimum"`, only the three colon-aligned object lines were reported, as "Extra space after key".
- With `key-spacing` set to `align: "value"`, five problems were reported on the same object.

**Whole-repository check mode.** All 434 tracked TypeScript files were copied to scratch, leaving out fixtures, samples and `.d.ts` files; together they hold 92,683 lines. Each tool then ran in check mode with the settings above. The time is wall-clock, from the second of two runs.

| Tool | Command | Time | Files reported as differing |
| --- | --- | --- | --- |
| Prettier 3.9.10 | `--list-different "**/*.ts"` | 9.3 s | 423 |
| Prettier 3.9.10 | `--experimental-cli --list-different` | 3.7 s (one run) | 423 |
| Biome 2.6.2 | `biome format` | 0.14 s | 426 of 437 checked, counting its own config and JSON |
| oxfmt 0.74.0 | `--list-different .` | 0.13 s | 423 |
| dprint 0.64.1 | `check --list-different` | 0.23 s | 426 |
| deno fmt 2.9.6 | `--check` | 0.29 s | 428 of 437 checked |

**Markdown tables.** A two-column table written in the compact `| --- |` form was padded into aligned columns by Prettier 3.9.10, Biome 2.6.2 (Markdown formatter enabled), oxfmt 0.74.0 and deno fmt 2.9.6. Biome alone also removed the blank line between the table and the list after it.

## 5. Linters

### 5.1 ESLint

- **Release lines.** ESLint 10 has been the current line since 2026-02-06. "ESLint v9.x reached end-of-life on 2026-08-06 and is no longer maintained"; its last release was v9.39.5, on 2026-07-10 ([version support](https://eslint.org/version-support/)). The repository is on 9.39.4 (section 1).
- **What changed in v10.** "The eslintrc config system has been completely removed in ESLint v10.0.0", and support for Node.js before v20.19.0 was dropped. `SourceCode#getJSDocComment()` was removed with "No replacement" ([v10.0.0 post](https://eslint.org/blog/2026/02/eslint-v10.0.0-released/)). The engines field of 10.13.0 is `^20.19.0 || ^22.13.0 || >=24` ([registry](https://registry.npmjs.org/eslint)).
- **Speed.** `--concurrency` "controls the number of worker threads used to lint files". It takes a positive integer, `auto` or `off`, and the default is `off` ([CLI](https://eslint.org/docs/latest/use/command-line-interface)).
- **Formatting rules.** They are deprecated and still shipped until 11.0.0 (section 3.6).
- **JSDoc and import order.** The core has no JSDoc rule, and `sort-imports` is its only import-sorting rule (`lib/rules` in the 10.13.0 [package](https://registry.npmjs.org/eslint)).
- **The plugins this repository uses, under ESLint 10.**
  - eslint-plugin-jsdoc 65.4.0 declares `eslint ^7 || ^8 || ^9 || ^10`, and its engines field is `node ^22.22.2 || >=24.15.0` ([registry](https://registry.npmjs.org/eslint-plugin-jsdoc/latest)). The container's Node was 22.22.0 when observed.
  - eslint-plugin-import 2.32.0, from 2025-06-20, declares `eslint` up to `^9` ([registry](https://registry.npmjs.org/eslint-plugin-import/latest)).
  - Plugins that declare `^10` and can order imports: eslint-plugin-import-x 4.17.1 ([registry](https://registry.npmjs.org/eslint-plugin-import-x/latest)) and eslint-plugin-perfectionist 5.13.0 ([registry](https://registry.npmjs.org/eslint-plugin-perfectionist/latest)). eslint-plugin-simple-import-sort 14.0.0 declares `>=5.0.0` ([registry](https://registry.npmjs.org/eslint-plugin-simple-import-sort/latest)).
  - eslint-config-prettier 10.1.8 declares `>=7.0.0` ([registry](https://registry.npmjs.org/eslint-config-prettier/latest)).

### 5.2 typescript-eslint

- **Supported versions.** "The version range of TypeScript currently supported is `>=4.8.4 <6.1.0`", and ESLint `^8.57.0 || ^9.0.0 || ^10.0.0` ([dependency versions](https://typescript-eslint.io/users/dependency-versions)). The 8.72.0 package declares the same ranges ([registry](https://registry.npmjs.org/typescript-eslint)).
- **TypeScript 7.**
  - TypeScript 7.0 "does not ship with an API. We expect TypeScript 7.1 to ship with a new (and different) API." The announcement recommends keeping TypeScript 6 installed beside it "for utilities that still need some programmatic access to the compiler (such as typescript-eslint)", through the `@typescript/typescript6` package or npm aliases ([TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7.0/)).
  - A maintainer wrote on 2026-07-08: "typescript-eslint isn't compatible with TS 7 at this time, because there is no TS 7 API at this time" ([#12518](https://github.com/typescript-eslint/typescript-eslint/issues/12518)).
  - The tracking issue is open. A status update on 2026-09-29 said that work on TypeScript 7.1 support is "looking more and more stable" and that its pull request, #12803, was ready for internal review. It also said performance with TypeScript 7 is not expected to be significantly better than with 6 in this first version, which talks to the compiler over IPC ([#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)).
- **Typed linting.** `parserOptions.projectService: true` asks TypeScript's project service for each file's types. You "incur the performance penalty of asking TypeScript to do a build of your project" ([typed linting](https://typescript-eslint.io/getting-started/typed-linting)). `await-thenable`, "Disallow awaiting a value that is not a Thenable", needs type information and is in `recommended-type-checked` ([await-thenable](https://typescript-eslint.io/rules/await-thenable/)).
- **Its own view of formatting.** "We recommend against using ESLint for formatting." It suggests "Prettier, dprint, or an equivalent instead". Of ESLint Stylistic it says, "That plugin can serve as your formatter if you strongly prefer not to use a dedicated formatter" ([What About Formatting?](https://typescript-eslint.io/users/what-about-formatting)).

### 5.3 eslint-plugin-jsdoc's `require-jsdoc`

With `publicOnly`, "missing JSDoc blocks are only reported for function bodies / class declarations that are exported from the module", and ESM and CommonJS exports are both checked by default. By default `require` checks only `FunctionDeclaration`. `ClassDeclaration`, `MethodDefinition`, arrow functions and function expressions are opt-in, and `contexts` adds other node types. The rule is in the recommended config, and its fixer "Adds an empty JSDoc block unless `enableFixer` is set to `false`" ([require-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-jsdoc.md)).

### 5.4 Biome's linter

- **Size.** Biome 2.6.2 has 614 lint rules across its languages (`configuration_schema.json` in the [npm package](https://registry.npmjs.org/@biomejs/biome)). The 2.6 release promoted 59 nursery rules to stable groups ([v2.6 post](https://biomejs.dev/blog/biome-v2-6/)).
- **Type-aware rules without the TypeScript compiler.** Biome 2.0 was announced as "the first JavaScript and TypeScript linter that provides type-aware linting rules that doesn't rely on the TypeScript compiler". At that release, `noFloatingPromises` caught "about 75% of the cases that would be detected by using `typescript-eslint`" ([v2 post](https://biomejs.dev/blog/biome-v2/), 2025-06-17). Biome 2.6 says "We have now completely rewritten our type inference engine" ([v2.6 post](https://biomejs.dev/blog/biome-v2-6/)). The rules that rely on it form the "types" domain. Enabling that domain makes Biome "scan the entire project, and it will enable the inference engine", with "a performance impact" ([domains](https://biomejs.dev/linter/domains/)).
- **The domain's rules.** `noFloatingPromises`, `noMisusedPromises`, `useAwaitThenable`, `useExhaustiveSwitchCases`, `useStrictBooleanExpressions` and others are in the nursery. `noUnnecessaryConditions` is among the four stable ones ([domains](https://biomejs.dev/linter/domains/)). `noFloatingPromises` "is part of the nursery group. This means that it is experimental and the behavior can change at any time", and its default severity is "information" ([noFloatingPromises](https://biomejs.dev/linter/rules/no-floating-promises/)).
- **JSDoc.** The only JSDoc rule in 2.6.2 is `useSingleJsDocAsterisk`. There is no rule that requires documentation (schema in the [npm package](https://registry.npmjs.org/@biomejs/biome)), and the rules-sources page does not list eslint-plugin-jsdoc ([rules sources](https://biomejs.dev/linter/rules-sources/)).
- **Import order.** Imports are sorted by the `organizeImports` assist action. In 2.5 it gained the ability to sort bare imports and group style imports ([v2.5 post](https://biomejs.dev/blog/biome-v2-5/)).
- **Plugins.** GritQL plugins can declare code fixes since 2.5 ([v2.5 post](https://biomejs.dev/blog/biome-v2-5/)). "JavaScript plugins are now available as a developer preview" in 2.6. They "mirror the architecture, shape, and APIs of Biome's Rust lint rules", which the post calls "a completely different model from other plugin systems such as ESLint" ([v2.6 post](https://biomejs.dev/blog/biome-v2-6/)).

### 5.5 Oxlint and tsgolint

- **Positioning and size.** Oxlint reached 1.0.0 on 2025-06-10 ([registry](https://registry.npmjs.org/oxlint)). Its documentation recommends it as a replacement: "Replace ESLint (recommended for most projects)". It also describes running both, with `eslint-plugin-oxlint` turning off the overlapping ESLint rules. It claims "871 built-in rules" and "50 to 100 times faster than ESLint" ([linter](https://oxc.rs/docs/guide/usage/linter.html)).
- **Categories.** `oxlint --help` in 1.89.0 lists the rule categories `correctness` (on by default), `suspicious`, `pedantic`, `perf`, `style`, `restriction` and `nursery`. Each can be allowed, warned or denied as a whole (observed).
- **The rule list in 1.89.0** (`oxlint --rules -f json`, observed). There are 871 rules, 60 of them type-aware. The type-aware rules include `no-floating-promises`, `await-thenable`, `no-misused-promises`, `restrict-template-expressions`, `switch-exhaustiveness-check` and the `no-unsafe-*` family. The native `jsdoc` plugin has 23 rules, from `check-access` to `require-yields-type`, and none of them is `require-jsdoc`. The native `import` plugin has 33 rules but no `order`, and `eslint/sort-imports` exists in the `style` category.
- **Type-aware linting.**
  - The engine was declared stable on 2026-07-22. That release "tracks TypeScript v7.0.2" and covers "59 of typescript-eslint's 61 type-aware rules". In four large codebases, "tsgolint was 12 to 18 times faster than ESLint with typescript-eslint" ([Type-Aware Linting Stable](https://oxc.rs/blog/2026-07-22-type-aware-linting-stable)).
  - tsgolint "is built directly on TypeScript 7, so its versions track the TypeScript release they support" ([tsgolint](https://github.com/oxc-project/tsgolint)).
  - The usage page says "TypeScript **7.0+** is required". It also says that "Rule coverage is incomplete (but very close)" and that "Very large codebases may encounter high memory usage" ([type-aware](https://oxc.rs/docs/guide/usage/linter/type-aware.html)).
- **TypeScript 6's deprecations.** TypeScript 6.0 deprecated `baseUrl` and `--moduleResolution node` (node10). The deprecated options "will be removed entirely in TypeScript 7.0", and `"ignoreDeprecations": "6.0"` does not carry over to 7.0 ([TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)).
- **Observed on this repository.** `oxlint --type-aware` over `packages/` stopped with tsconfig errors in every project: "Option 'baseUrl' has been removed", "Option 'moduleResolution=node10' has been removed" and "Non-relative paths are not allowed". The errors link to [tsgolint#351](https://github.com/oxc-project/tsgolint/issues/351).
- **Observed on a scratch copy with a migrated tsconfig.** The copy had `baseUrl` removed, `NodeNext` set for the packages, `Bundler` for the browser client, and `./`-relative `paths`. The agent picked 23 rules from typescript-eslint's `recommended-type-checked` set; they are listed below. Run with tsgolint 7.0.2004, they took 2.6–3.2 s and reported 31 errors under 8 rules. The same 23 rules in ESLint 9.39.4 with typescript-eslint 8.57.0 and `projectService`, over the real repository's `packages/**/*.ts`, took 83 s in one run and reported 12 errors and 2 warnings. The two runs used different tsconfigs, and the difference in findings was not investigated. Neither run reported an `await-thenable` or a `no-floating-promises` violation.
  - The 23 rules: `no-floating-promises`, `await-thenable`, `no-misused-promises`, `restrict-template-expressions`, the five `no-unsafe-*` rules, `unbound-method`, `no-base-to-string`, `no-redundant-type-constituents`, `no-unnecessary-type-assertion`, `only-throw-error`, `require-await`, `no-implied-eval`, `no-array-delete`, `no-duplicate-type-constituents`, `no-for-in-array`, `prefer-promise-reject-errors`, `restrict-plus-operands`, `no-unsafe-enum-comparison` and `no-unsafe-unary-minus`.
- **JS plugins.**
  - The documentation says they are "currently in alpha". It also says "Oxlint's plugin API is compatible with ESLint v9+, so most existing ESLint plugins should work out of the box".
  - "Lint rules that rely on TypeScript type-awareness" are not yet supported. A plugin whose name Oxlint reserves, such as `jsdoc`, must be given an alias ([JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)).
  - Observed in 1.89.0, with eslint-plugin-jsdoc 65.4.0 aliased as `jsdoc-js` and eslint-plugin-import-x 4.17.1 aliased as `import-x-js`. `jsdoc-js/require-jsdoc` with `publicOnly` reported an exported function with no JSDoc ("Missing JSDoc comment."). `import-x-js/order` reported "`node:fs` import should occur before import of `./z`".
- **Speed observed.** Oxlint's default rules, which are not type-aware, ran over the 434-file copy in 71 ms.

### 5.6 Deno lint

- **Rules.** The rule list includes `require-await`, `no-await-in-loop`, `explicit-module-boundary-types` and `no-explicit-any`. It has no floating-promise rule, no rule that requires JSDoc and no import-ordering rule ([rules](https://docs.deno.com/lint/)).
- **Ignore comments.** A suppression must name the rule: `// deno-lint-ignore <codes...>` ([deno lint](https://docs.deno.com/runtime/reference/cli/lint/)).
- **Plugins.** The plugin API is "intentionally modeled after the ESLint API" without "100% compatibility", and "The API is still evolving" ([lint plugins](https://docs.deno.com/runtime/reference/lint_plugins/)).
- **Type information.** Neither page says whether rules receive type information. A third-party package states that deno lint gives a rule one parsed file with "no types" ([typescript-deno-lint](https://jsr.io/@cunarist/typescript-deno-lint)). That is unconfirmed by Deno.
- **Public API documentation.** `deno doc --lint` reports "missing JS doc comment on a **public** type", missing return or property types on public types, and exported types that reference unexported ones ([deno doc](https://docs.deno.com/runtime/reference/cli/doc/)).

### 5.7 TypeScript 7 and the speed of type-aware linting

TypeScript 7.0 claims speed-ups "between 8x and 12x on full builds". It ships no API, and 7.1 is expected to bring one ([TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7.0/)). The two linters therefore stand on opposite sides of 7.0 on the survey date:

- typescript-eslint supports TypeScript below 6.1 (section 5.2).
- Oxlint's type-aware mode requires TypeScript 7 and a tsconfig valid under 7 (section 5.5).
- Biome's type-aware rules use its own inference and no TypeScript at all (section 5.4).

## 6. Against the owner's requirements

_This section compares; it does not choose. It uses the evidence in sections 3 to 5. "Unknown" settings (requirement 7) are noted where a tool imposes a choice about them._

Each formatter surveyed takes settings for indentation, line width, quotes and semicolons. Prettier's are in `.prettierrc` (§1), Biome's in §3.2, dprint's in §3.4 and deno fmt's in §3.5. So each imposes some choice about the settings in requirement 7, and whether any such choice suits the owner is unknown until that requirement is answered.

| Option | Hand alignment survives | Lint stays to correctness | Type-aware rules (`no-floating-promises`, `await-thenable`) | `require-jsdoc` on public symbols | Import order | Runs on this repository today | Speed evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Today's setup**: ESLint 9 with typescript-eslint, jsdoc and import, plus Prettier through format-on-save | No, wherever a file is saved in the dev container. Prettier and the built-in TypeScript formatter both collapse it, and which one runs is unconfirmed (§1, §3.7, §4) | Yes. eslint-config-prettier turns formatting rules off (§1) | Yes, on `packages/**/src` (§1) | Yes, as a warning that does not fail the gate (§1) | `import/order` (§1) | Yes, but ESLint 9 is end-of-life (§5.1) | About 2 min for `npm run lint` (§1) |
| **Prettier enforced** in the gate | No (§3.1, §4) | Unchanged | Unchanged | Unchanged | Unchanged | 423 of 434 files would change (§4) | 9.3 s, or 3.7 s with the experimental CLI (§4) |
| **Biome**, formatter and linter | No (§3.2, §4) | Rules and groups are chosen in config (§5.4). Its defaults were not examined | Nursery only, on its own inference, not the compiler. Coverage was 75% at 2.0 (§5.4) | No equivalent (§5.4) | `organizeImports` assist (§5.4) | Formatter yes. Linter coverage of the current rules not checked | 0.14 s to format-check (§4) |
| **oxfmt with Oxlint and tsgolint** | No (§3.3, §4) | Categories are chosen in config (§5.5) | Yes, 59 of 61 typescript-eslint rules, stable (§5.5) | Only through eslint-plugin-jsdoc as an alpha JS plugin. Observed working (§5.5) | Only through import-x as a JS plugin, observed working. Natively `sort-imports` only (§5.5) | Type-aware mode no: the tsconfig needs `baseUrl` and node10 removed (§5.5) | oxfmt 0.13 s; Oxlint 71 ms; type-aware 2.6–3.2 s on a migrated copy (§4, §5.5) |
| **dprint** | No (§3.4, §4) | n/a (formatter only) | n/a | n/a | `sortImportDeclarations` (§3.4) | 426 files would change (§4) | 0.23 s (§4) |
| **deno fmt with deno lint** | No (§3.5, §4) | Not examined | Not documented. A third party says none (§5.6) | `deno doc --lint`, Deno-oriented (§5.6) | None (§5.6) | Not tried beyond formatting | 0.29 s to format-check (§4) |
| **ESLint Stylistic** as the formatter, alignment-tolerant config | Yes for `=`, types and comments, once each node type is exempted. A colon-aligned object needs a further rule choice (§4) | No: these are formatting rules, though tolerant ones (§3.6) | Unchanged | Unchanged | Unchanged | Not tried on the repository | Not measured |
| **clang-format** with alignment options | Produces its own alignment, with TypeScript artefacts (§3.8, §4) | n/a | n/a | n/a | n/a | Not tried on the repository | Not measured |
| **Prettier with merge-extras** | Object and interface properties are re-aligned in its own form. `=` only where marked with `//=` (§3.1, §4) | n/a | n/a | n/a | n/a | Not tried on the repository | Not measured |
| **No formatter for TypeScript**: ESLint 10 with typescript-eslint, jsdoc and an ESLint-10-ready import plugin, and format-on-save off | Yes, nothing rewrites whitespace. The repository's own settings are what turn Prettier's format-on-save on (§1) | Yes, if no stylistic rules are enabled (§3.6) | Yes, on TypeScript below 6.1 (§5.2) | Yes (§5.3) | import-x, perfectionist or simple-import-sort, since eslint-plugin-import declares only up to ESLint 9 (§5.1) | Needs the ESLint 10 upgrade and the import-plugin swap (§5.1). jsdoc 65 asks for Node 22.22.2 or later (§5.1) | 83 s with ESLint 9.39.4 for 23 type-aware rules on `packages` (§5.5) |
| **No formatter for TypeScript**: Oxlint with tsgolint and JS plugins | Yes, nothing rewrites whitespace | Yes, if categories are chosen so (§5.5) | Yes (§5.5) | Through the alpha JS plugin (§5.5) | Through the JS plugin (§5.5) | Needs the TypeScript 7 tsconfig migration (§5.5) | 2.6–3.2 s for the same rules on a migrated copy (§5.5) |
| **A formatter only for JSON, YAML and Markdown** (with any TypeScript option above) | TypeScript untouched | Unchanged | Unchanged | Unchanged | Unchanged | Prettier, Biome 2.6, oxfmt, dprint and deno fmt all format these files (§3). All four tested pad Markdown tables into aligned columns (§4) | Not measured |

**Suppression comments.** Keeping an aligned block under any formatter takes one ignore comment per statement. The exceptions are Biome's and dprint's file-wide comments and clang-format's off/on range (§3, §4). Requirement 5 concerns suppressions that hide a problem; whether formatter-ignore comments count is for the owner.

## 7. Open questions

- **Requirement 7.** What does the owner want for tabs or spaces, indent width, line length, quotes, semicolons and trailing commas, and should any of them be enforced at all? The root agent is asking.
- **Formatting TypeScript at all.** Should anything format TypeScript, given that every Prettier-family formatter tested collapsed the alignment (§4)? Is format-on-save in the dev container wanted? It is the only place Prettier runs today (§1).
- **ESLint Stylistic.** If it is considered, does a tolerant configuration (exemptions, `mode: "minimum"`) count as "linting which forces formatting conventions"? Or would only its absence meet requirement 1?
- **ESLint 9's end of life.** ESLint 9 has been end-of-life since 2026-08-06 (§5.1). Moving to 10 means replacing eslint-plugin-import (§5.1). Which import-ordering plugin, if any, matches the current `import/order` settings has not been checked.
- **TypeScript's direction.** TypeScript 6 deprecated, and 7 removed, the `baseUrl` and `moduleResolution: node` that the base tsconfig uses (§5.5). typescript-eslint's support for 7.1 is in review and not released (§5.2). Is migrating the tsconfig wanted on its own merits? It is the precondition for Oxlint's type-aware mode and for TypeScript 7.
- **`await-thenable`.** It has been off as a workaround since 2025-10 (§1). In the local runs neither ESLint with typescript-eslint 8.57.0 nor tsgolint reported a violation of it (§5.5). Whether the workaround is still needed has not been tested in the repository's own lint configuration.
- **Documentation warnings.** `require-jsdoc` is a warning and warnings do not fail the gate (§1). Is that the strength the owner meant by "mandates"?
- **Markdown.** Would a Markdown formatter touch the generated Live Docs under `.mdmd/layer-4`, whose `LIVE-DOC:BEGIN` … `LIVE-DOC:END` regions belong to the generator ([AGENTS.md](../../AGENTS.md))? How would table padding (§4) sit with the compact tables used across the workspace?

## Unconfirmed

- Whether deno lint gives rules type information. Deno's pages are silent, and the claim that it does not comes from a third party (§5.6).
- How Biome's rewritten type inference in 2.6 compares with typescript-eslint. The 75% figure is from 2.0, and no newer figure was found (§5.4).
- Which formatter VS Code uses on save in the dev container when Prettier and the built-in TypeScript formatter are both present and no default is set. The VS Code page read does not say ([basics](https://code.visualstudio.com/docs/editing/codebasics)). VS Code's `editor.formatOnSaveMode` "makes **Format on Save** only apply to modified lines", as defined by source control ([1.49 notes](https://code.visualstudio.com/updates/v1_49)). By that description, a modified aligned line would still be formatted.
- The cause of the difference in findings between tsgolint and ESLint with typescript-eslint in §5.5.
