# packages/shared/src/live-docs/adapters/python.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/python.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-python-ts
- Generated At: 2026-09-27T21:43:41.122Z

## Authored
### Purpose
The Python adapter: tree-sitter symbols (classes, functions, assignments and public class members, with docstrings from `python.docstring.ts`) and import resolution that follows re-exports to the file where a name is defined.

### Notes
- Measured against `scip-python` on the four Python sample programs; `python/ledger` is the one built to defeat a line scanner. The one edge it misses there needs type inference: `account.balance()` on an object a repository lookup returned.
- A module named in a relative `from ..pkg import x` is a dependency even though scip-python emits no occurrence for it; `oracle:compare` lists that as one extra edge on the ledger.
- File existence is checked against the directory listing, not `stat` alone, because the workspace may sit on a case-insensitive mount and Python imports are case-sensitive.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:41.122Z","inputHash":"3a044b7ed3d4a645"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `pythonAdapter` {#symbol-pythonadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/python.ts#L636)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `pythonAdapter` — Summary
Language adapter for Python (`.py`): tree-sitter symbols and import resolution that follows re-exports to where a name is defined.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./python.docstring` - `parseDocstring`
- `node:fs` - `promises`, `readdirSync`, `statSync`
- `node:path` - `path`
- [`index.pythonSyntax`](../../languages/index.ts.mdmd.md#symbol-pythonsyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.parseSource`](./treeSitter.ts.mdmd.md#symbol-parsesource)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
