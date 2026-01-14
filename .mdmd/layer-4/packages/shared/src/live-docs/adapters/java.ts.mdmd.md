# packages/shared/src/live-docs/adapters/java.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/java.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-java-ts
- Generated At: 2026-01-14T02:54:34.860Z

## Authored
### Purpose
Parses Java sources to translate Javadoc summaries, tags, and imports into the Live Docs schema, as delivered in the Nov 13 adapter addition and fixture refresh <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-13.md#L1460-L1508>.

### Notes
- Keep the polyglot integration test and updated Java fixtures in sync with any parser changes; those assets were extended alongside the original rollout to catch regressions <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-13.md#L1488-L1508>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T02:54:34.860Z","inputHash":"ea90e81430eb5c3c"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `javaAdapter` {#symbol-javaadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/java.ts#L109)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `existsSync`, `promises`
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
- [java.typeref.test.ts](./java.typeref.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
