# packages/engine/src/live-docs/adapters/python.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/python.ts
- Generated At: 2026-10-15T15:49:39.115Z

## Authored
### Purpose
The Python adapter: tree-sitter symbols (classes, functions, assignments and public class members, with docstrings from `python.docstring.ts`) and import resolution that follows re-exports to the file where a name is defined.

### Notes
- Measured against `scip-python` on the four Python sample programs; `python/ledger` is the one built to defeat a line scanner. The one edge it misses there needs type inference: `account.balance()` on an object a repository lookup returned.
- A module named in a relative `from ..pkg import x` is a dependency even though scip-python emits no occurrence for it; `oracle:compare` lists that as one extra edge on the ledger.
- File existence is checked against the directory listing, not `stat` alone, because the workspace may sit on a case-insensitive mount and Python imports are case-sensitive.
- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: a module-level `if __name__ == "__main__"`, read from the tree (either quote style, either operand order, parentheses allowed; `!=`, a compound condition, `elif` and a guard inside a function or in a string do not count).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `pythonAdapter` {#symbol-pythonadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/python.ts#L660)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `pythonAdapter` — Summary
Language adapter for Python (`.py`): tree-sitter symbols, import resolution that follows re-exports to where a name is defined, and the `__main__` guard that marks a program's entry.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`, `readdirSync`, `statSync`
- `node:path` - `path`
- [`index.pythonSyntax`](../../languages/index.ts.mdmd.md#symbol-pythonsyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`python.docstring.parseDocstring`](./python.docstring.ts.mdmd.md#symbol-parsedocstring)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.parseSource`](./treeSitter.ts.mdmd.md#symbol-parsesource)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
