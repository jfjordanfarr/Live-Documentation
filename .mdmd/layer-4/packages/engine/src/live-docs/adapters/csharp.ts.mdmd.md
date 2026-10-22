# packages/engine/src/live-docs/adapters/csharp.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/csharp.ts
- Generated At: 2026-10-22T16:47:51.555Z

## Authored
### Purpose
Harvests public symbols, XML doc comments, and dependency edges from C# sources, fulfilling the Nov 12 language-adapter initiative and the C# rollout that wired fixtures and polyglot tests into the Live Docs pipeline <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L330-L372> <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L626-L715>.

### Notes
- Backed by the `polyglot-fixtures` integration harness and manual inspection scripts created during the C# deployment, so changes here should re-run those checks <../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-12.md#L554-L715>.
- Extends Hangfire heuristics to capture scheduled and recurring jobs, mirroring the LD-402 queue-worker fixture coverage.
- The program's entry point is reported on the analysis result since 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)), from which the doc carries `- Entry: program`: a static `Main` of any accessibility and return type, with its line, or top-level statements (`global_statement` under the compilation unit), which take precedence over a `Main` as the compiler gives it; a type merely named `Main`, as the rosetta sample's `static class Main { Run }`, is none.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `resolveWorkspaceTypes` {#symbol-resolveworkspacetypes}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.ts#L1232)
- Parameters: `fileIndex`: [`WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex)

##### `resolveWorkspaceTypes` — Summary
The workspace files that declare a qualified type name, for adapters of other file kinds.

#### `csharpAdapter` {#symbol-csharpadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/csharp.ts#L1242)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `csharpAdapter` — Summary
Language adapter for C# (`.cs`): tree-sitter symbols and compiler-style name resolution across the workspace.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- [`csharp.dependencies.ConfigReference`](./csharp.dependencies.ts.mdmd.md#symbol-configreference)
- [`csharp.dependencies.ResolvedTypeTarget`](./csharp.dependencies.ts.mdmd.md#symbol-resolvedtypetarget)
- [`csharp.dependencies.extractDynamicDependencies`](./csharp.dependencies.ts.mdmd.md#symbol-extractdynamicdependencies)
- [`csharp.xmldoc.buildDocumentationFromLines`](./csharp.xmldoc.ts.mdmd.md#symbol-builddocumentationfromlines)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`index.WorkspaceFileIndex`](./index.ts.mdmd.md#symbol-workspacefileindex) (type-only)
- [`treeSitter.SyntaxNode`](./treeSitter.ts.mdmd.md#symbol-syntaxnode)
- [`treeSitter.parseSource`](./treeSitter.ts.mdmd.md#symbol-parsesource)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentation`](../core.ts.mdmd.md#symbol-symboldocumentation) (type-only)
- [`core.TypeReference`](../core.ts.mdmd.md#symbol-typereference) (type-only)
- [`coreTypes.ProgramEntry`](../coreTypes.ts.mdmd.md#symbol-programentry) (type-only)
- [`coreTypes.WorkspaceSymbolIndex`](../coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`openings.ROUTE_KIND`](../openings.ts.mdmd.md#symbol-route_kind)
- [`openings.SqlObjectName`](../openings.ts.mdmd.md#symbol-sqlobjectname-interface)
- [`openings.chooseServers`](../openings.ts.mdmd.md#symbol-chooseservers)
- [`openings.matchRoute`](../openings.ts.mdmd.md#symbol-matchroute)
- [`openings.matchSqlObject`](../openings.ts.mdmd.md#symbol-matchsqlobject)
- [`openings.routeSegments`](../openings.ts.mdmd.md#symbol-routesegments)
- [`openings.routeSymbolName`](../openings.ts.mdmd.md#symbol-routesymbolname)
- [`openings.sqlObjectName`](../openings.ts.mdmd.md#symbol-sqlobjectname-function)
- [`openings.sqlReferences`](../openings.ts.mdmd.md#symbol-sqlreferences)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/openings.mdmd.md`](../../../../../../layer-3/openings.mdmd.md)
- [`.mdmd/layer-3/polyglot-adapters.mdmd.md`](../../../../../../layer-3/polyglot-adapters.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
