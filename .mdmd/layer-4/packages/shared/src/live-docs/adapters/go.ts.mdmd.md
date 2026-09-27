# packages/shared/src/live-docs/adapters/go.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/go.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-go-ts
- Generated At: 2026-09-27T20:36:53.812Z

## Authored
### Purpose
The Go adapter: tree-sitter symbols (exported declarations, methods, fields and interface methods with their doc comments) and package-aware resolution of every name a file uses, through sibling files of its package and through imports resolved by the nearest `go.mod`.

### Notes
- Measured against `scip-go` on `go/depot` and `go/rosetta`; the misses it keeps are scip-go's package-symbol artifact and one promoted method that needs type inference, both recorded in the decisions log.
- Locals are tracked per function (parameters, results, `:=`, `var`, `range`, type switches, labels) so a local that shadows a package-level name of a sibling file does not link; block-level scoping inside a function is not modelled.
- The package table is keyed by directory and package clause, built once per generation run on the file index; per-file facts are cached by modification time.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T20:36:53.812Z","inputHash":"e4759ae9f484ea32"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `goAdapter` {#symbol-goadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/go.ts#L619)
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
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [go.test.ts](./go.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
