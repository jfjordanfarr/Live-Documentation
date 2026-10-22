# packages/engine/src/live-docs/adapters/go.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/go.ts
- Generated At: 2026-10-22T16:47:51.720Z

## Authored
### Purpose
The Go adapter: tree-sitter symbols (exported declarations, methods, fields and interface methods with their doc comments) and package-aware resolution of every name a file uses, through sibling files of its package and through imports resolved by the nearest `go.mod`.

### Notes
- Measured against `scip-go` on `go/depot` and `go/rosetta`; the misses it keeps are scip-go's package-symbol artifact and one promoted method that needs type inference, both recorded in the decisions log.
- Locals are tracked per function (parameters, results, `:=`, `var`, `range`, type switches, labels) so a local that shadows a package-level name of a sibling file does not link; block-level scoping inside a function is not modelled.
- The package table is keyed by directory and package clause, built once per generation run on the file index; per-file facts are cached by modification time.
- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: a top-level `func main` in `package main`, with its line; a `main` of another package, or a method named `main`, is none.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `goAdapter` {#symbol-goadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/go.ts#L629)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `goAdapter` — Summary
Language adapter for Go (`.go`): tree-sitter symbols and package-aware name resolution across the module.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.goSyntax`](../../languages/index.ts.mdmd.md#symbol-gosyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
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
