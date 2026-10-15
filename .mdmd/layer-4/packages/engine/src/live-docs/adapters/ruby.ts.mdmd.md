# packages/engine/src/live-docs/adapters/ruby.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/ruby.ts
- Generated At: 2026-10-15T15:49:39.158Z

## Authored
### Purpose
Provides the Ruby analyzer that maps YARD-style line and block comments, mixins, and `require` dependencies into Live Docs, following the implementation plan drafted and executed on Nov 14 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2999-L3072> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3308-L3334>.

### Notes
- Keep YARD tag coverage aligned with `ruby.docstring.test.ts` and the regenerated ruby fixtures that shipped with the adapter <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3308-L3334>.
- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: a column-0 guard `__FILE__ == $0`, `__FILE__ == $PROGRAM_NAME` or either reversed, as `if <guard>` on its own line or as a statement modifier, with `=begin`/`=end` blocks and `#` comments skipped and a guard inside a one-line string not counting.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rubyAdapter` {#symbol-rubyadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/ruby.ts#L48)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `rubyAdapter` — Summary
Language adapter for Ruby (`.rb`, `.rake`, `Gemfile`, `Rakefile`). Extracts classes, modules, methods, and `require`/`require_relative` dependencies, and reports a file guarded by `__FILE__ == $0` as the program's entry.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`, `statSync`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
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
<!-- LIVE-DOC:END Dependencies -->
