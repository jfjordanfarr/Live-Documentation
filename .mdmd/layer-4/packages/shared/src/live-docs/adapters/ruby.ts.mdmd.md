# packages/shared/src/live-docs/adapters/ruby.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/ruby.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-ruby-ts
- Generated At: 2026-02-03T21:55:40.186Z

## Authored
### Purpose
Provides the Ruby analyzer that maps YARD-style line and block comments, mixins, and `require` dependencies into Live Docs, following the implementation plan drafted and executed on Nov 14 <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2999-L3072> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3308-L3334>.

### Notes
- Keep YARD tag coverage aligned with `ruby.docstring.test.ts` and the regenerated ruby fixtures that shipped with the adapter <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3308-L3334>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:40.186Z","inputHash":"a00067fbdd19563f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rubyAdapter` {#symbol-rubyadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/ruby.ts#L40)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
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

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [ruby.docstring.test.ts](./ruby.docstring.test.ts.mdmd.md)
- [ruby.typeref.test.ts](./ruby.typeref.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
