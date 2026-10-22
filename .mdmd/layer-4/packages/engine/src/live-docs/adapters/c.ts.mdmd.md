# packages/engine/src/live-docs/adapters/c.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/c.ts
- Generated At: 2026-10-22T16:47:51.419Z

## Authored
### Purpose
The C and C++ adapter: parses a file with the C++ grammar of the tree-sitter bundle, reports its file-scope declarations as symbols with their Doxygen or leading comment, resolves each quoted `#include` to a workspace file by the rule chosen by measurement against the compiler, carrying the names the file uses from the header, and reports `main`, `wmain`, `WinMain` or `wWinMain` as the program's entry.

### Notes
- Rewritten over tree-sitter on 2026-10-16 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#c-and-c-read-by-the-grammar-the-include-rule-chosen-by-measurement-and-discovery-that-reads-every-suffix-anywhere-recorded-2026-10-16); [Turn 10 of the October 15 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)), replacing the regex scanner of 2025-11-14 that had registered `.c` and `.h` only while its docstring claimed C++, which [a probe over a reconstruction](../../../../../../../AI-Agent-Workspace/Probes/2026-10-15/live-docs-over-th04/README.md) found by 521 empty docs. Registered for `.c .h .cpp .cc .cxx .hpp .hh .hxx .inl`, the list shared with `languages/c.ts`.
- Symbols: file-scope functions, prototypes, structs, unions, enums, typedefs, aliases, variables and macros that are not `static`; in C++ files, classes, structs and unions contribute their public members with qualified names (`Class.method`), namespaces qualify, templates contribute what they declare, `extern "C"` blocks are descended; forward declarations are not symbols. An out-of-line definition with a qualified name is listed as a method, since the tree alone cannot tell a class scope from a namespace scope. Documentation is the Doxygen block or the comment directly above a declaration; a blank line between them breaks the association.
- The include rule, `DEFAULT_INCLUDE_STRATEGY`, is `ancestors-with-include-directories`: the including file's directory, then each ancestor up to the workspace root, trying at each the specifier, then under its `include/`, then under its `src/`, nearest first; names are checked against directory listings, so case never matches by accident. Chosen on 2026-10-16 by which of four candidates disagreed least with scip-clang over five fixtures ([the probe](../../../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md)); the three others (`including-directory`, `ancestors`, `any-directory`) stay exported through `resolveInclude` for the next measurement, and `analyzeCSource` lets a script run any of them without the generator. `tests/integration/live-docs/include-dirs.test.ts` keeps the default to the compiler's resolutions.
- A `<system>` include, and a quoted include that resolves to nothing, stay as external dependencies with the specifier. The names used from a resolved header are the identifiers and type names of the including file, outside comments and strings, that the header declares; member accesses and a macro's own name never count.
- The program entry (`main`, `wmain`, `WinMain`, `wWinMain` with a body, any return type) is reported for `.c .cpp .cc .cxx` files only, with the declarator's line, so the composition links the right overload; a header, a prototype, a commented-out or quoted definition, and a `main` inside a namespace or class are not entries.
- Guarded by `c.test.ts` (symbols in C and C++, the four strategies over a tree with decoys, used names, program entries) and `c.docstring.test.ts`, the scanner's docstring contract kept unchanged; measured by the oracle on the C and C++ rosetta samples and the two other C samples.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `IncludeStrategy` {#symbol-includestrategy}
- Type: type
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/c.ts#L638)

##### `IncludeStrategy` — Summary
Where a quoted include is looked for, the compiler's `-I` flags being
unknown: the including file's directory only; that directory and each of
its ancestors up to the workspace root; the same, trying each directory's
`include/` and `src/` as well; or every directory of the workspace, nearest
first, a greedy rule that can pick a decoy.

#### `DEFAULT_INCLUDE_STRATEGY` {#symbol-default_include_strategy}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/c.ts#L641)
- Returns: [`IncludeStrategy`](#symbol-includestrategy)

##### `DEFAULT_INCLUDE_STRATEGY` — Summary
The strategy the adapter resolves includes with: the one that matched the compiler on every measured include (2026-10-16). The others stay for the measurement script.

#### `resolveInclude` {#symbol-resolveinclude}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/c.ts#L752)

##### `resolveInclude` — Summary
The workspace-relative path, with forward slashes, of the file a quoted
include names under a strategy, or undefined when none exists inside the
workspace. A specifier without an extension is also tried with `.h`.

#### `analyzeCSource` {#symbol-analyzecsource}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/c.ts#L819)

##### `analyzeCSource` — Summary
Analyzes one C or C++ file from its text, without the generator: its
symbols, its includes resolved under the strategy, and its program entry.

#### `cAdapter` {#symbol-cadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/c.ts#L833)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `cAdapter` — Summary
Language adapter for C and C++: tree-sitter symbols, `#include` dependencies with the names used from each header, and the program entry.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`, `readdirSync`, `statSync`
- `node:path` - `path`
- [`index.cSyntax`](../../languages/index.ts.mdmd.md#symbol-csyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.parseSource`](./treeSitter.ts.mdmd.md#symbol-parsesource)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationLink`](../core.ts.mdmd.md#symbol-symboldocumentationlink) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
- [`coreTypes.ProgramEntry`](../coreTypes.ts.mdmd.md#symbol-programentry) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
