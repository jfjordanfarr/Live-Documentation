# packages/shared/src/live-docs/adapters/java.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/java.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-java-ts
- Generated At: 2026-09-27T21:58:30.995Z

## Authored
### Purpose
The Java adapter: tree-sitter symbols (types, nested types and the members they expose, with Javadoc) and javac-style resolution of every type name a file uses against a workspace table of qualified type names.

### Notes
- Measured against `scip-java` on the four Java sample programs; `java/warehouse` is the one built to defeat a line scanner, and the adapter matches every compiler edge on all four.
- The table is keyed by package as declared, not by directory, so `src/main/java` and `src/test/java` halves of a package see each other; it is built once per generation run on the file index, and per-file facts are cached by modification time.
- The qualifier of a static call or field access (`Registry.register(...)`, `Unit.EACH`) is resolved as a type name; a local variable that shadows a type name would be mistaken for it.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:58:30.995Z","inputHash":"399aea4ee78a126e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `javaAdapter` {#symbol-javaadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/java.ts#L598)
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
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
