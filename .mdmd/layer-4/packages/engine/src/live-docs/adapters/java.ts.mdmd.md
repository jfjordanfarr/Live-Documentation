# packages/engine/src/live-docs/adapters/java.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/java.ts
- Generated At: 2026-10-22T16:47:51.921Z

## Authored
### Purpose
The Java adapter: tree-sitter symbols (types, nested types and the members they expose, with Javadoc) and javac-style resolution of every type name a file uses against a workspace table of qualified type names.

### Notes
- Measured against `scip-java` on the four Java sample programs; `java/warehouse` is the one built to defeat a line scanner, and the adapter matches every compiler edge on all four.
- The table is keyed by package as declared, not by directory, so `src/main/java` and `src/test/java` halves of a package see each other; it is built once per generation run on the file index, and per-file facts are cached by modification time.
- The qualifier of a static call or field access (`Registry.register(...)`, `Unit.EACH`) is resolved as a type name; a local variable that shadows a type name would be mistaken for it.
- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: since 2026-10-16 any `main` the Java 25 launcher can run (JLS SE 25 §12.1.4 and JEP 512): `void`, not private, with a body, taking one `String[]` or nothing, static or an instance method of a type `new T()` can make, with its line; within one type the `String[]` form is preferred, otherwise the first in the file; a compact source file's top-level methods belong to its implicit class, which the bundled grammar parses as `method_declaration` under `program`. The rosetta sample's `String main(int)` overload beside its `main` does not count, and the line tells the doc's heading apart. Not followed: an inherited `main`; a compact file's top-level methods are not published as symbols nor their uses collected.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `javaAdapter` {#symbol-javaadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/java.ts#L693)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `javaAdapter` — Summary
Language adapter for Java (`.java`): tree-sitter symbols and javac-style name resolution across the workspace.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.javaSyntax`](../../languages/index.ts.mdmd.md#symbol-javasyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`java.javadoc.parseJavaDoc`](./java.javadoc.ts.mdmd.md#symbol-parsejavadoc)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.parseSource`](./treeSitter.ts.mdmd.md#symbol-parsesource)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
- [`coreTypes.ProgramEntry`](../coreTypes.ts.mdmd.md#symbol-programentry) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
