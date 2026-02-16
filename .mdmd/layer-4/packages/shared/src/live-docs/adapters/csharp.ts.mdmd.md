# packages/shared/src/live-docs/adapters/csharp.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/csharp.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-csharp-ts
- Generated At: 2026-02-16T18:46:24.699Z

## Authored
### Purpose
Harvests public symbols, XML doc comments, and dependency edges from C# sources, fulfilling the Nov 12 language-adapter initiative and the C# rollout that wired fixtures and polyglot tests into the Live Docs pipeline <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L330-L372> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L626-L715>.

### Notes
- Backed by the `polyglot-fixtures` integration harness and manual inspection scripts created during the C# deployment, so changes here should re-run those checks <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L554-L715>.
- Extends Hangfire heuristics to capture scheduled and recurring jobs, mirroring the LD-402 queue-worker fixture coverage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T18:46:24.699Z","inputHash":"131fa2db02c4b007"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `csharpAdapter` {#symbol-csharpadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.ts#L46)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `csharpAdapter` — Summary
Language adapter for C# (`.cs`). Extracts classes, interfaces, enums, records, structs, and `using` directive dependencies.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./csharp.dependencies` - `extractDependencies`
- `./csharp.xmldoc` - `buildDocumentationFromLines`
- `node:fs` - `promises`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [csharp.hangfire.test.ts](./csharp.hangfire.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
