# packages/shared/src/live-docs/adapters/c.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/c.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-c-ts
- Generated At: 2026-02-03T21:55:39.581Z

## Authored
### Purpose
Implements the Doxygen-aware analyzer for `.c` and `.h` sources, binding doc comments and include dependencies into Live Doc symbol and dependency sets as laid out in the Nov 14 C adapter plan and delivered in the same-day rollout notes <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3620-L3705> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L4028-L4088>.

### Notes
- Guarded by `c.docstring.test.ts` plus regenerated benchmark fixtures to ensure doc metadata and import resolution stay deterministic after the Nov 14 ship <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L4028-L4088>.
- Extend both the parser and its test scenarios when onboarding new Doxygen tags, following the coverage matrix captured in the adapter plan <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L3620-L3705>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:39.581Z","inputHash":"e9afbf5a6f2c889d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cAdapter` {#symbol-cadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/c.ts#L31)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`, `statSync`
- `node:path` - `path`
- [`index.cSyntax`](../../languages/index.ts.mdmd.md#symbol-csyntax)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.SymbolDocumentationExample`](../core.ts.mdmd.md#symbol-symboldocumentationexample) (type-only)
- [`core.SymbolDocumentationException`](../core.ts.mdmd.md#symbol-symboldocumentationexception) (type-only)
- [`core.SymbolDocumentationLink`](../core.ts.mdmd.md#symbol-symboldocumentationlink) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [c.docstring.test.ts](./c.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
