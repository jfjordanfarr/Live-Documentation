# packages/shared/src/live-docs/adapters/csharp.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/csharp.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-csharp-ts
- Generated At: 2026-09-27T21:43:40.585Z

## Authored
### Purpose
Harvests public symbols, XML doc comments, and dependency edges from C# sources, fulfilling the Nov 12 language-adapter initiative and the C# rollout that wired fixtures and polyglot tests into the Live Docs pipeline <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L330-L372> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L626-L715>.

### Notes
- Backed by the `polyglot-fixtures` integration harness and manual inspection scripts created during the C# deployment, so changes here should re-run those checks <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L554-L715>.
- Extends Hangfire heuristics to capture scheduled and recurring jobs, mirroring the LD-402 queue-worker fixture coverage.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T21:43:40.585Z","inputHash":"c1950a55335080c2"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `resolveWorkspaceTypes` {#symbol-resolveworkspacetypes}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.ts#L857)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](../core.ts.mdmd.md#symbol-workspacefileindex)

##### `resolveWorkspaceTypes` — Summary
The workspace files that declare a qualified type name, for adapters of other file kinds.

#### `csharpAdapter` {#symbol-csharpadapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/csharp.ts#L867)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `csharpAdapter` — Summary
Language adapter for C# (`.cs`): tree-sitter symbols and compiler-style name resolution across the workspace.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./csharp.dependencies` - `ConfigReference`, `ResolvedTypeTarget`, `extractDynamicDependencies`
- `./csharp.xmldoc` - `buildDocumentationFromLines`
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
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
