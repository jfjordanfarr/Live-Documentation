# packages/shared/src/live-docs/adapters/rust.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/rust.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-rust-ts
- Generated At: 2025-12-11T02:38:02.045Z

## Authored
### Purpose
Parses Rust sources to collect public symbols, structured Rustdoc sections, and `use` dependencies, completing the docstring bridge we scoped on Nov 14 and later shared across packages during the Nov 16 adapter migration <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L1843-L1859> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2792-L2808> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L878-L918>.

### Notes
- Verified by the focused Vitest suite and manual fixture docstring inspection that followed the Nov 14 rollout, which proved the adapter’s structured output end to end <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2740-L2833>.
- Keep new Rustdoc heading or tag support aligned with the regression tests before re-running the Live Docs generator <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-14.md#L2792-L2808>.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:02.045Z","inputHash":"0d25af3b3c078bfb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `rustAdapter` {#symbol-rustadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/rust.ts#L41)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
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
- [rust.docstring.test.ts](./rust.docstring.test.ts.mdmd.md)
- [rust.typeref.test.ts](./rust.typeref.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
