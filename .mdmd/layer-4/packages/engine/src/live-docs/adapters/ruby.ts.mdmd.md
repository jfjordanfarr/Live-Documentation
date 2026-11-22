# `packages/engine/src/live-docs/adapters/ruby.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/ruby.ts`
- Generated At: 2026-11-22T07:12:52.414Z

## Authored
### Purpose
Provides the Ruby analyzer that maps YARD-style line and block comments, mixins, and `require` dependencies into Live Docs, following the implementation plan drafted and executed on Nov 14 <../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/11/2025-11-14/2025-11-14.md#L2999-L3072> <../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/11/2025-11-14/2025-11-14.md#L3308-L3334>.

### Notes
- Keep YARD tag coverage aligned with `ruby.docstring.test.ts` and the regenerated ruby fixtures that shipped with the adapter <../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2025/11/2025-11-14/2025-11-14.md#L3308-L3334>.
- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: a column-0 guard `__FILE__ == $0`, `__FILE__ == $PROGRAM_NAME` or either reversed, as `if <guard>` on its own line or as a statement modifier, with `=begin`/`=end` blocks and `#` comments skipped and a guard inside a one-line string not counting.
- Since 2026-11-21 ([the comment guard](./commentGuard.test.ts.mdmd.md)) the Ruby grammar finds what Ruby never runs, a comment (`#`, `=begin` … `=end`) and the data after `__END__`, telling them from strings and heredocs, and the patterns run over the text with it written over: the dependencies and the program's guard over the text without either, the symbols over the text without the data, since their documentation is read from the comments before them. Until then a `require` inside `=begin` … `=end` or after `__END__` was read, and a guard in a trailing comment or after `__END__` made the file a program.
- Since the evening of 2026-11-21 a heredoc's text is written over with the comments, the grammar's own `heredoc_body`, so a `require_relative`, a `def`, a mixin or the program's guard written in one is none ([the record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md#the-second-round-after-an-independent-review)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rubyAdapter` {#symbol-rubyadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/ruby.ts#L69)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `rubyAdapter` — Summary
Language adapter for Ruby (`.rb`). Extracts classes, modules, methods, and `require`/`require_relative`
dependencies, and reports a file guarded by `__FILE__ == $0` as the program's entry. Its patterns run over lines;
the Ruby grammar first finds what Ruby never runs, telling a comment from a string and a heredoc as Ruby does, and
that is written over in spaces: the comments, the data after `__END__` and a heredoc's text for the dependencies and
the guard, the data and the heredocs alone for the symbols, whose documentation is read from the comments before them
(the comment guard of 2026-11-21, `commentGuard.test.ts`). A string written on one line is left as it is, since a
`require`'s path is one; a multi-line string that is no heredoc is read as code.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`treeSitter.COMMENT_NODES`](./treeSitter.ts.mdmd.md#symbol-comment_nodes)
- [`treeSitter.rangesOf`](./treeSitter.ts.mdmd.md#symbol-rangesof)
- [`treeSitter.readTree`](./treeSitter.ts.mdmd.md#symbol-readtree)
- [`treeSitter.writtenOver`](./treeSitter.ts.mdmd.md#symbol-writtenover)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationExample`](../core.ts.mdmd.md#symbol-symboldocumentationexample) (type-only)
- [`core.SymbolDocumentationException`](../core.ts.mdmd.md#symbol-symboldocumentationexception) (type-only)
- [`core.SymbolDocumentationLink`](../core.ts.mdmd.md#symbol-symboldocumentationlink) (type-only)
- [`core.SymbolDocumentationLinkKind`](../core.ts.mdmd.md#symbol-symboldocumentationlinkkind) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
- [`compareText`](../../tooling/compareText.ts.mdmd.md#symbol-comparetext)
- [`sourceText.readSourceText`](../../tooling/sourceText.ts.mdmd.md#symbol-readsourcetext)
- [`workspaceProbes.ListedFiles`](../../tooling/workspaceProbes.ts.mdmd.md#symbol-listedfiles) (type-only)
- [`workspaceProbes.pathKind`](../../tooling/workspaceProbes.ts.mdmd.md#symbol-pathkind)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
