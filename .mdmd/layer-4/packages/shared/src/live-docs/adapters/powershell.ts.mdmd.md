# packages/shared/src/live-docs/adapters/powershell.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/adapters/powershell.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-adapters-powershell-ts
- Generated At: 2025-12-09T01:18:23.263Z

## Authored
### Purpose
Provide the Stage-0 adapter that translates PowerShell scripts and modules into Live Docs symbols and dependency edges.

### Notes
The adapter shells out to `scripts/powershell/emit-ast.ps1`, caches per-file payloads, and accepts either `pwsh` or Windows PowerShell.
Dot-sourced paths are normalized to workspace-relative form so downstream graph tooling can reason about cross-script hops, and comment-based help is translated into `symbolDocumentation` summaries and parameter blurbs for downstream renderers.
Runtime extraction depends on [`scripts/powershell/emit-ast.ps1`](../../../../../scripts/powershell/emit-ast.ps1.mdmd.md) to describe PowerShell symbols, references, and help metadata.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-09T01:18:23.263Z","inputHash":"139bbb13ba61ff5e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `powershellAdapter` {#symbol-powershelladapter}
- Type: const
- Source: [source](../../../../../../../packages/shared/src/live-docs/adapters/powershell.ts#L52)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFile`
- `node:path` - `path`
- `node:util` - `promisify`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.SymbolDocumentationParameter`](../core.ts.mdmd.md#symbol-symboldocumentationparameter) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../../server/src/features/live-docs/generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](../../../../server/src/features/live-docs/renderPublicSymbolLines.test.ts.mdmd.md)
- [generator.test.ts](../../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [aspnet.test.ts](./aspnet.test.ts.mdmd.md)
- [c.docstring.test.ts](./c.docstring.test.ts.mdmd.md)
- [csharp.hangfire.test.ts](./csharp.hangfire.test.ts.mdmd.md)
- [java.typeref.test.ts](./java.typeref.test.ts.mdmd.md)
- [powershell.test.ts](./powershell.test.ts.mdmd.md)
- [python.docstring.test.ts](./python.docstring.test.ts.mdmd.md)
- [python.typeref.test.ts](./python.typeref.test.ts.mdmd.md)
- [ruby.docstring.test.ts](./ruby.docstring.test.ts.mdmd.md)
- [ruby.typeref.test.ts](./ruby.typeref.test.ts.mdmd.md)
- [rust.docstring.test.ts](./rust.docstring.test.ts.mdmd.md)
- [rust.typeref.test.ts](./rust.typeref.test.ts.mdmd.md)
- [core.docstring.test.ts](../core.docstring.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
